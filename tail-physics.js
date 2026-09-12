/**
 * PATTYDE VAAL - Tail Physics & Bézier Curve Engine
 * Handles natural curved resting posture, interactive pointer dragging,
 * strain metrics, elastic damped spring snap-back, and tube docking.
 */

class TailPhysics {
  constructor(options) {
    this.svgPath = options.svgPath;
    this.tipHandle = options.tipHandle;
    this.tailGroup = options.tailGroup;
    this.sceneSvg = options.sceneSvg;
    this.onDragStart = options.onDragStart || (() => {});
    this.onDragMove = options.onDragMove || (() => {});
    this.onDragEnd = options.onDragEnd || (() => {});
    this.onSnapBack = options.onSnapBack || (() => {});
    this.onInserted = options.onInserted || (() => {});

    // Anchor base on dog's rump (in SVG viewBox coordinates)
    this.base = { x: 195, y: 250 };
    
    // Natural curled resting coordinates (Golden retriever tail curled up & back)
    this.restTip = { x: 145, y: 165 };
    this.restCp1 = { x: 140, y: 245 };
    this.restCp2 = { x: 110, y: 195 };

    // Current state
    this.tip = { ...this.restTip };
    this.cp1 = { ...this.restCp1 };
    this.cp2 = { ...this.restCp2 };

    this.isDragging = false;
    this.isInserted = false;
    this.isLocked = false;
    this.allowMachineInsert = false;
    this.maxStretch = 240;
    this.straightness = 0;

    // Tube target zone (for Stage 4 insertion)
    this.tubeTarget = { x: 505, y: 260, radius: 45 };

    this.animationFrame = null;
    this.initEvents();
    this.render();
  }

  // Convert client pointer coordinates to SVG coordinate space
  clientToSvg(clientX, clientY) {
    const pt = this.sceneSvg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = this.sceneSvg.getScreenCTM();
    if (ctm) {
      return pt.matrixTransform(ctm.inverse());
    }
    // Fallback
    const rect = this.sceneSvg.getBoundingClientRect();
    const viewBox = this.sceneSvg.viewBox.baseVal;
    return {
      x: ((clientX - rect.left) / rect.width) * viewBox.width,
      y: ((clientY - rect.top) / rect.height) * viewBox.height
    };
  }

  initEvents() {
    const handle = this.tipHandle || this.svgPath;

    handle.addEventListener('pointerdown', (e) => {
      if (this.isLocked || this.isInserted) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      this.isDragging = true;
      const pt = this.clientToSvg(e.clientX, e.clientY);
      this.updateDrag(pt.x, pt.y);
      this.onDragStart();
    });

    handle.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const pt = this.clientToSvg(e.clientX, e.clientY);
      this.updateDrag(pt.x, pt.y);
      this.onDragMove(this.straightness, this.tip);
    });

    const release = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        if (handle.hasPointerCapture(e.pointerId)) {
          handle.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}

      // Check if dropped inside machine tube (during machine stage)
      if (this.allowMachineInsert && this.checkTubeCollision(this.tip.x, this.tip.y)) {
        this.insertIntoTube();
      } else {
        this.onDragEnd();
        this.snapBack();
      }
    };

    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
  }

  updateDrag(targetX, targetY) {
    // Vector from base to target
    const dx = targetX - this.base.x;
    const dy = targetY - this.base.y;
    const dist = Math.hypot(dx, dy);

    // Limit maximum stretch length
    const actualDist = Math.min(dist, this.maxStretch);
    const angle = Math.atan2(dy, dx);

    this.tip.x = this.base.x + Math.cos(angle) * actualDist;
    this.tip.y = this.base.y + Math.sin(angle) * actualDist;

    // As you pull, calculate straightness factor (0% to 98.5%)
    // Pulling away horizontally maximizes straightness
    const pullFactor = Math.min(actualDist / (this.maxStretch * 0.85), 1.0);
    this.straightness = Math.round(pullFactor * 98.4);

    // Dynamic control points interpolating from curl to straight rod
    // Straight line control points:
    const straightCp1 = {
      x: this.base.x + (this.tip.x - this.base.x) * 0.35,
      y: this.base.y + (this.tip.y - this.base.y) * 0.35
    };
    const straightCp2 = {
      x: this.base.x + (this.tip.x - this.base.x) * 0.72,
      y: this.base.y + (this.tip.y - this.base.y) * 0.72
    };

    // Blend between rest curve and straight line
    this.cp1.x = this.restCp1.x * (1 - pullFactor) + straightCp1.x * pullFactor;
    this.cp1.y = this.restCp1.y * (1 - pullFactor) + straightCp1.y * pullFactor;
    this.cp2.x = this.restCp2.x * (1 - pullFactor) + straightCp2.x * pullFactor;
    this.cp2.y = this.restCp2.y * (1 - pullFactor) + straightCp2.y * pullFactor;

    // Check machine tube proximity if in machine insertion stage
    if (this.allowMachineInsert) {
      const distToTube = Math.hypot(this.tip.x - this.tubeTarget.x, this.tip.y - this.tubeTarget.y);
      const tubeAura = document.getElementById('tube-suction-aura');
      if (tubeAura) {
        if (distToTube < 90) {
          tubeAura.classList.add('active');
        } else {
          tubeAura.classList.remove('active');
        }
      }
    }

    this.render();
  }

  // Check collision with machine funnel opening
  checkTubeCollision(x, y) {
    const dist = Math.hypot(x - this.tubeTarget.x, y - this.tubeTarget.y);
    return dist <= this.tubeTarget.radius + 35;
  }

  // Animate tail sliding smoothly inside the tube
  insertIntoTube() {
    this.isLocked = true;
    this.isInserted = true;
    cancelAnimationFrame(this.animationFrame);

    // Target inside the tube: x=580, y=260
    const startTip = { ...this.tip };
    const insideTip = { x: 575, y: 260 };
    const insideCp1 = { x: 300, y: 255 };
    const insideCp2 = { x: 440, y: 260 };

    let startTime = null;
    const duration = 500;

    const animateInsert = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      this.tip.x = startTip.x + (insideTip.x - startTip.x) * ease;
      this.tip.y = startTip.y + (insideTip.y - startTip.y) * ease;
      this.cp1.x = this.cp1.x + (insideCp1.x - this.cp1.x) * ease;
      this.cp1.y = this.cp1.y + (insideCp1.y - this.cp1.y) * ease;
      this.cp2.x = this.cp2.x + (insideCp2.x - this.cp2.x) * ease;
      this.cp2.y = this.cp2.y + (insideCp2.y - this.cp2.y) * ease;

      this.render();

      if (progress < 1) {
        requestAnimationFrame(animateInsert);
      } else {
        const tubeAura = document.getElementById('tube-suction-aura');
        if (tubeAura) tubeAura.classList.remove('active');
        this.onInserted();
      }
    };

    requestAnimationFrame(animateInsert);
  }

  // Elastic snap-back damped harmonic oscillator
  snapBack(customDuration = 700, onComplete = null) {
    cancelAnimationFrame(this.animationFrame);
    const startTip = { ...this.tip };
    const startCp1 = { ...this.cp1 };
    const startCp2 = { ...this.cp2 };

    const startTime = performance.now();
    const duration = customDuration;
    const omega = 28; // Oscillation speed
    const decay = 5.5; // Damping decay

    const animateSnap = (now) => {
      const t = (now - startTime) / 1000;
      const progress = Math.min((now - startTime) / duration, 1);

      if (progress < 1) {
        // Damped sine wave: e^(-decay * t) * cos(omega * t)
        const envelope = Math.exp(-decay * t);
        const oscillation = envelope * Math.cos(omega * t);

        this.tip.x = this.restTip.x + (startTip.x - this.restTip.x) * oscillation;
        this.tip.y = this.restTip.y + (startTip.y - this.restTip.y) * oscillation;
        this.cp1.x = this.restCp1.x + (startCp1.x - this.restCp1.x) * oscillation;
        this.cp1.y = this.restCp1.y + (startCp1.y - this.restCp1.y) * oscillation;
        this.cp2.x = this.restCp2.x + (startCp2.x - this.restCp2.x) * oscillation;
        this.cp2.y = this.restCp2.y + (startCp2.y - this.restCp2.y) * oscillation;

        this.straightness = Math.max(0, Math.round(this.straightness * (1 - progress)));
        this.render();
        this.animationFrame = requestAnimationFrame(animateSnap);
      } else {
        // Reset precisely to resting curl
        this.tip = { ...this.restTip };
        this.cp1 = { ...this.restCp1 };
        this.cp2 = { ...this.restCp2 };
        this.straightness = 0;
        this.render();
        this.onSnapBack();
        if (onComplete) onComplete();
      }
    };

    this.animationFrame = requestAnimationFrame(animateSnap);
  }

  // Eject tail out of the machine when experiment fails
  shootOutFromMachine(callback) {
    this.isInserted = false;
    this.isLocked = false;
    cancelAnimationFrame(this.animationFrame);

    // Initial position: straight coming out of tube
    this.tip = { x: 490, y: 260 };
    this.cp1 = { x: 310, y: 255 };
    this.cp2 = { x: 420, y: 260 };
    this.render();

    // Trigger elastic snap with sound
    this.snapBack(850, callback);
  }

  // Reset to initial state
  reset() {
    this.isDragging = false;
    this.isInserted = false;
    this.isLocked = false;
    this.allowMachineInsert = false;
    this.straightness = 0;
    this.tip = { ...this.restTip };
    this.cp1 = { ...this.restCp1 };
    this.cp2 = { ...this.restCp2 };
    this.render();
  }

  // Render SVG path and position tip handle
  render() {
    if (!this.svgPath) return;

    // Cubic Bézier curve: M base C cp1, cp2, tip
    const pathD = `M ${this.base.x} ${this.base.y} C ${this.cp1.x} ${this.cp1.y}, ${this.cp2.x} ${this.cp2.y}, ${this.tip.x} ${this.tip.y}`;
    this.svgPath.setAttribute('d', pathD);

    // Update handle position
    if (this.tipHandle) {
      this.tipHandle.setAttribute('cx', this.tip.x);
      this.tipHandle.setAttribute('cy', this.tip.y);
    }

    // Update fur tuft at tip if present
    const tuft = document.getElementById('tail-fur-tuft');
    if (tuft) {
      tuft.setAttribute('cx', this.tip.x);
      tuft.setAttribute('cy', this.tip.y);
    }
  }
}

window.TailPhysics = TailPhysics;
