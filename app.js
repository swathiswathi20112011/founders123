/**
 * PATTYDE VAAL - Core Application Controller
 * Handles the complete multi-stage scientific comedy workflow.
 */

const STAGES = {
  INTRO: 0,
  DOG_INTRO: 1,
  MANUAL_STRAIGHTEN: 2,
  AI_MACHINE_INTRO: 3,
  TAIL_INSERTION: 4,
  HUMAN_OPERATOR: 5,
  MACHINE_RUNNING: 6,
  MISSION_FAILED: 7,
  FINAL_RESULT: 8
};

class PattydeVaalApp {
  constructor() {
    this.currentStage = STAGES.INTRO;
    this.attemptCount = 1;
    this.dogMoodLevel = 1; // 1: Irritated, 2: Very Annoyed, 3: Furious, 4: Sarcastic God

    // Timers
    this.countdownInterval = null;
    this.manualHoldSeconds = 10;
    this.manualTimerInterval = null;
    this.manualTimerRunning = false;
    this.machineTimerInterval = null;

    // DOM Elements
    this.initDOMElements();
    this.initTailPhysics();
    this.bindEvents();
    this.startIntroCountdown();
  }

  initDOMElements() {
    this.introStage = document.getElementById('stage-intro');
    this.introCountNum = document.getElementById('intro-count-num');
    this.introStatusText = document.getElementById('intro-status-text');
    this.btnSkipIntro = document.getElementById('btn-skip-intro');

    this.progressBar = document.getElementById('progress-bar');
    this.viewportContainer = document.getElementById('viewport-container');
    this.viewportBanner = document.getElementById('viewport-banner');
    this.bannerTitle = document.getElementById('banner-title');
    this.bannerSubtitle = document.getElementById('banner-subtitle');

    this.timerBadge = document.getElementById('timer-badge');
    this.timerBadgeTitle = document.getElementById('timer-badge-title');
    this.timerBadgeDigits = document.getElementById('timer-badge-digits');
    this.timerBadgeMsg = document.getElementById('timer-badge-msg');

    this.btnActionPrimary = document.getElementById('btn-action-primary');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundLabel = document.getElementById('sound-label');

    this.statDogMood = document.getElementById('stat-dog-mood');
    this.statTailCurvature = document.getElementById('stat-tail-curvature');
    this.statStraightnessVal = document.getElementById('stat-straightness-val');
    this.straightnessMeterFill = document.getElementById('straightness-meter-fill');
    this.globalStatusText = document.getElementById('global-status-text');

    this.aiMachineGroup = document.getElementById('ai-machine-group');
    this.scientistGroup = document.getElementById('scientist-group');
    this.scientistMouth = document.getElementById('scientist-mouth');
    this.gaugeNeedle = document.getElementById('gauge-needle');
    this.machineBeacon = document.getElementById('machine-beacon');
    this.sparkLayer = document.getElementById('svg-spark-layer');
    this.telemetryLog = document.getElementById('telemetry-log');

    this.auraDogVal = document.getElementById('aura-dog-val');
    this.auraDogBar = document.getElementById('aura-dog-bar');
    this.auraHumanVal = document.getElementById('aura-human-val');
    this.auraHumanBar = document.getElementById('aura-human-bar');

    this.stageFinal = document.getElementById('stage-final');
    this.finalDogSpeech = document.getElementById('final-dog-speech');
    this.btnTryAgain = document.getElementById('btn-try-again');
    this.btnMakeWorse = document.getElementById('btn-make-worse');
    this.btnReadPaper = document.getElementById('btn-read-paper');
    this.btnReadPaperTop = document.getElementById('btn-read-paper-top');
    this.paperModal = document.getElementById('paper-modal');
    this.btnClosePaper = document.getElementById('btn-close-paper');

    this.btnPokeDog = document.getElementById('btn-poke-dog');
    this.btnEasterEgg = document.getElementById('btn-easter-egg');
  }

  initTailPhysics() {
    const svgPath = document.getElementById('dog-tail-path');
    const tipHandle = document.getElementById('tail-tip-handle');
    const sceneSvg = document.getElementById('lab-svg-scene');

    window.dialogueMgr.init();

    this.tail = new TailPhysics({
      svgPath,
      tipHandle,
      sceneSvg,
      onDragStart: () => this.handleTailDragStart(),
      onDragMove: (straightness, tip) => this.handleTailDragMove(straightness, tip),
      onDragEnd: () => this.handleTailDragEnd(),
      onSnapBack: () => this.handleTailSnapBack(),
      onInserted: () => this.handleTailInserted()
    });
  }

  bindEvents() {
    // Skip intro
    this.btnSkipIntro.addEventListener('click', () => {
      this.clearIntroCountdown();
      this.goToStage(STAGES.DOG_INTRO);
    });

    // Sound toggle
    this.btnToggleSound.addEventListener('click', () => {
      const muted = window.sfx.toggleMute();
      this.soundIcon.textContent = muted ? '🔇' : '🔊';
      this.soundLabel.textContent = muted ? 'MUTED' : 'SFX ON';
    });

    // Main action button
    this.btnActionPrimary.addEventListener('click', () => {
      this.handlePrimaryActionClick();
    });

    // Try again
    this.btnTryAgain.addEventListener('click', () => {
      this.restartExperiment();
    });

    // Make it worse
    this.btnMakeWorse.addEventListener('click', () => {
      this.triggerMakeItWorse();
    });

    // Research paper modal
    this.btnReadPaper.addEventListener('click', () => {
      this.paperModal.classList.remove('hidden');
    });
    this.btnReadPaperTop.addEventListener('click', () => {
      this.paperModal.classList.remove('hidden');
    });
    this.btnClosePaper.addEventListener('click', () => {
      this.paperModal.classList.add('hidden');
    });

    // Poke the dog
    this.btnPokeDog.addEventListener('click', () => {
      window.sfx.playBoing();
      this.dogMoodLevel++;
      this.updateDogMoodUI();
      window.dialogueMgr.say('dog', 'annoyedReplay');
    });

    // Ask the dog
    this.btnEasterEgg.addEventListener('click', () => {
      window.sfx.playSunglassesBling();
      window.dialogueMgr.say('dog', 'final');
    });
  }

  logTelemetry(msg) {
    if (!this.telemetryLog) return;
    const line = document.createElement('div');
    line.textContent = `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`;
    this.telemetryLog.appendChild(line);
    this.telemetryLog.scrollTop = this.telemetryLog.scrollHeight;
  }

  updateProgressSteps(stepNumber) {
    const steps = this.progressBar.querySelectorAll('.step-indicator');
    steps.forEach((step) => {
      const num = parseInt(step.dataset.step, 10);
      step.classList.remove('active', 'completed');
      if (num === stepNumber) {
        step.classList.add('active');
      } else if (num < stepNumber) {
        step.classList.add('completed');
      }
    });
  }

  // =========================================================================
  // STAGE 0: INTRO COUNTDOWN
  // =========================================================================
  startIntroCountdown() {
    let count = 3;
    const loadingTexts = [
      "Scientific seriousness loading...",
      "Calibrating 0% usefulness sensors...",
      "Dog refuses to read the manual...",
      "Preparing absolutely nothing useful..."
    ];

    window.sfx.playCountdownBeep(false);

    this.countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.introCountNum.textContent = count;
        this.introStatusText.textContent = loadingTexts[3 - count] || loadingTexts[0];
        window.sfx.playCountdownBeep(false);
      } else if (count === 0) {
        this.introCountNum.textContent = "GO!";
        this.introStatusText.textContent = "LAUNCHING USELESS LAB...";
        window.sfx.playCountdownBeep(true);
      } else {
        this.clearIntroCountdown();
        this.goToStage(STAGES.DOG_INTRO);
      }
    }, 1000);
  }

  clearIntroCountdown() {
    clearInterval(this.countdownInterval);
    this.introStage.style.opacity = '0';
    setTimeout(() => {
      this.introStage.classList.add('hidden');
    }, 500);
  }

  // =========================================================================
  // STAGE TRANSITIONS & STATE MACHINE
  // =========================================================================
  goToStage(stage) {
    this.currentStage = stage;

    switch (stage) {
      case STAGES.DOG_INTRO:
        this.setupDogIntroStage();
        break;
      case STAGES.MANUAL_STRAIGHTEN:
        this.setupManualStraightenStage();
        break;
      case STAGES.AI_MACHINE_INTRO:
        this.setupAIMachineIntroStage();
        break;
      case STAGES.TAIL_INSERTION:
        this.setupTailInsertionStage();
        break;
      case STAGES.HUMAN_OPERATOR:
        this.setupHumanOperatorStage();
        break;
      case STAGES.MACHINE_RUNNING:
        this.setupMachineRunningStage();
        break;
      case STAGES.MISSION_FAILED:
        this.setupMissionFailedStage();
        break;
      case STAGES.FINAL_RESULT:
        this.setupFinalResultStage();
        break;
    }
  }

  // STAGE 1: MEET THE DOG
  setupDogIntroStage() {
    this.updateProgressSteps(1);
    this.globalStatusText.textContent = "SUBJECT: PATTY DETECTED";
    this.bannerTitle.textContent = "SUBJECT: PATTY";
    this.bannerSubtitle.textContent = "Problem detected: Tail refuses to become straight.";

    // Hide AI Machine and Scientist during initial dog intro
    this.aiMachineGroup.style.opacity = '0.15';
    this.scientistGroup.style.opacity = '0';

    this.btnActionPrimary.textContent = "BEGIN MISSION 01: MANUAL STRAIGHTEN ➔";
    this.btnActionPrimary.className = "btn-action btn-gold";

    window.sfx.playSunglassesBling();
    setTimeout(() => {
      window.dialogueMgr.say('dog', 'idle', 0);
    }, 600);

    this.logTelemetry("Subject Patty loaded: Golden Retriever-ish, Irritated.");
  }

  // STAGE 2: TRY TO STRAIGHTEN THE TAIL
  setupManualStraightenStage() {
    this.updateProgressSteps(2);
    this.globalStatusText.textContent = "MISSION 01: ACTIVE";
    this.bannerTitle.textContent = "MISSION 01: STRAIGHTEN THE TAIL";
    this.bannerSubtitle.textContent = "Mouse use cheythu Pattiyude vaal drag cheythu straight aakkuka.";

    this.btnActionPrimary.classList.add('hidden');
    this.timerBadge.classList.remove('hidden');
    this.timerBadgeTitle.textContent = "TAIL STRAIGHTENING TIMER";
    this.timerBadgeDigits.textContent = "10";
    this.timerBadgeMsg.textContent = "Click and hold/drag the tail to straighten!";

    const guideArrow = document.getElementById('tail-guide-arrow');
    if (guideArrow) guideArrow.classList.remove('hidden');

    this.tail.isLocked = false;
    this.tail.allowMachineInsert = false;

    this.logTelemetry("Manual straightening protocol engaged. Awaiting pointer pull.");
    window.dialogueMgr.say('dog', 'idle', 1);
  }

  handleTailDragStart() {
    if (this.currentStage === STAGES.MANUAL_STRAIGHTEN) {
      window.sfx.startStretchSound();
      this.startManualTimer();
      const guideArrow = document.getElementById('tail-guide-arrow');
      if (guideArrow) guideArrow.classList.add('hidden');
    } else if (this.currentStage === STAGES.TAIL_INSERTION) {
      window.sfx.startStretchSound();
      this.logTelemetry("Dragging tail towards AI machine funnel...");
    }
  }

  handleTailDragMove(straightness, tip) {
    if (this.currentStage === STAGES.MANUAL_STRAIGHTEN) {
      this.statStraightnessVal.textContent = `${straightness}%`;
      this.straightnessMeterFill.style.width = `${straightness}%`;

      const stretchRatio = straightness / 100;
      window.sfx.updateStretchPitch(stretchRatio);

      // Complain occasionally while dragging
      if (straightness > 70 && Math.random() < 0.04) {
        window.dialogueMgr.say('dog', 'dragging');
      }
    } else if (this.currentStage === STAGES.TAIL_INSERTION) {
      window.sfx.updateStretchPitch(1.2);
    }
  }

  handleTailDragEnd() {
    window.sfx.stopStretchSound();

    if (this.currentStage === STAGES.MANUAL_STRAIGHTEN && this.manualTimerRunning) {
      // Released before 10 seconds finished!
      this.stopManualTimer();
      this.timerBadgeDigits.textContent = "10";
      this.timerBadgeMsg.textContent = "Don't let go! Hold it straight for 10 full seconds!";
      window.dialogueMgr.say('dog', 'idle', 0);
    }
  }

  handleTailSnapBack() {
    window.sfx.playBoing();
    this.viewportContainer.classList.add('screen-shake');
    setTimeout(() => {
      this.viewportContainer.classList.remove('screen-shake');
    }, 450);

    this.statStraightnessVal.textContent = "0%";
    this.straightnessMeterFill.style.width = "0%";
  }

  startManualTimer() {
    if (this.manualTimerRunning) return;
    this.manualTimerRunning = true;
    this.manualHoldSeconds = 10;
    this.timerBadgeDigits.textContent = this.manualHoldSeconds;

    const funnyMsgs = [
      "Applying scientific pressure...",
      "Calculating tail geometry...",
      "Pulling harder with science...",
      "Why is this dog cooperating so little?",
      "Almost straight (or not at all)...",
      "Tail resistance exceeding quantum limits..."
    ];

    this.manualTimerInterval = setInterval(() => {
      this.manualHoldSeconds--;
      this.timerBadgeDigits.textContent = this.manualHoldSeconds;
      window.sfx.playCountdownBeep(false);

      const msg = funnyMsgs[10 - this.manualHoldSeconds] || funnyMsgs[0];
      this.timerBadgeMsg.textContent = msg;

      if (this.manualHoldSeconds % 3 === 0) {
        window.dialogueMgr.say('dog', 'dragging');
      }

      if (this.manualHoldSeconds <= 0) {
        this.completeManualStraightening();
      }
    }, 1000);
  }

  stopManualTimer() {
    clearInterval(this.manualTimerInterval);
    this.manualTimerRunning = false;
  }

  completeManualStraightening() {
    this.stopManualTimer();
    this.tail.isLocked = true; // prevent further dragging while snapping
    window.sfx.stopStretchSound();

    // Sudden elastic snap back!
    this.tail.snapBack(650, () => {
      this.tail.isLocked = false;
    });

    this.statStraightnessVal.textContent = "0%";
    this.straightnessMeterFill.style.width = "0%";

    // Failure announcement
    this.bannerTitle.textContent = "STRAIGHTENING FAILED ❌";
    this.bannerSubtitle.textContent = "Dog tail refused to cooperate with human logic.";
    this.globalStatusText.textContent = "MISSION 01: FAILED";

    this.timerBadge.classList.add('hidden');
    window.sfx.playFailureFanfare();

    window.dialogueMgr.say('dog', 'snapback', 0);

    this.btnActionPrimary.classList.remove('hidden');
    this.btnActionPrimary.textContent = "UPGRADE TO AI MACHINE 🚀";
    this.btnActionPrimary.className = "btn-action btn-danger";

    this.logTelemetry("FAILURE: Human torque insufficient. Tail elastic curl restored.");
  }

  // STAGE 3: AI MACHINE INTRO
  setupAIMachineIntroStage() {
    this.updateProgressSteps(3);
    this.globalStatusText.textContent = "AI MACHINE ONLINE";
    this.bannerTitle.textContent = "MISSION 02: AI-POWERED MACHINE";
    this.bannerSubtitle.textContent = "Deploying multi-million dollar unnecessary technology.";

    this.aiMachineGroup.style.opacity = '1';
    this.aiMachineGroup.style.transform = 'translate(0, 0)';

    window.sfx.playSunglassesBling();
    this.logTelemetry("[AI] PATTYDE VAAL AI™ powering up...");
    this.logTelemetry("[AI] Straightening Accuracy: 100% (Theoretical)");
    this.logTelemetry("[AI] Practical Usefulness: 0.00%");

    this.btnActionPrimary.textContent = "PROCEED: INSERT TAIL INTO TUBE ➔";
    this.btnActionPrimary.className = "btn-action btn-primary";
  }

  // STAGE 4: TAIL INSERTION
  setupTailInsertionStage() {
    this.updateProgressSteps(4);
    this.globalStatusText.textContent = "TUBE ALIGNMENT: READY";
    this.bannerTitle.textContent = "MISSION 02: TUBE INSERTION";
    this.bannerSubtitle.textContent = "Drag the dog's tail into the AI machine pipe.";

    this.btnActionPrimary.classList.add('hidden');
    this.tail.allowMachineInsert = true;
    this.tail.isLocked = false;

    // Show visual guide arrow pointing from tail to tube opening
    const guideArrow = document.getElementById('tail-guide-arrow');
    if (guideArrow) {
      guideArrow.setAttribute('d', 'M 160 170 Q 330 180 500 260');
      guideArrow.classList.remove('hidden');
    }

    this.logTelemetry("User instructed to insert tail into funnel opening at (505, 260).");
  }

  handleTailInserted() {
    window.sfx.stopStretchSound();
    window.sfx.playSuctionWhoosh();

    const guideArrow = document.getElementById('tail-guide-arrow');
    if (guideArrow) guideArrow.classList.add('hidden');

    this.bannerTitle.textContent = "TAIL SUCCESSFULLY INSERTED ✅";
    this.bannerSubtitle.textContent = "Tail is inside the tube. Dog remains outside.";
    this.globalStatusText.textContent = "TAIL DOCKED IN TUBE";

    window.dialogueMgr.say('dog', 'tubeInserted', 0);
    this.logTelemetry("COLLISION DETECTED: Tail enclosed in cylindrical tube chamber.");

    setTimeout(() => {
      this.goToStage(STAGES.HUMAN_OPERATOR);
    }, 1200);
  }

  // STAGE 5: HUMAN OPERATOR INTRODUCES HIMSELF
  setupHumanOperatorStage() {
    this.updateProgressSteps(4);
    this.scientistGroup.style.opacity = '1';
    this.scientistGroup.style.transform = 'translate(0, 0)';

    this.bannerTitle.textContent = "CHIEF SCIENTIST: PROF. CHACKO";
    this.bannerSubtitle.textContent = "“ഇത് നേരെയാവുമോ എന്ന് ഞാൻ നോക്കട്ടെ.”";

    window.dialogueMgr.say('human', 'operatorIntro', 0);

    setTimeout(() => {
      window.dialogueMgr.say('dog', 'tubeInserted', 2);
    }, 2200);

    this.btnActionPrimary.classList.remove('hidden');
    this.btnActionPrimary.textContent = "START AI MACHINE 🚀";
    this.btnActionPrimary.className = "btn-action btn-gold";

    this.logTelemetry("Human operator Prof. Chacko ready to commence AI cycle.");
  }

  // STAGE 6: START MACHINE (10 SECONDS OF ABSURD SCIENCE)
  setupMachineRunningStage() {
    this.updateProgressSteps(5);
    this.btnActionPrimary.classList.add('hidden');
    this.globalStatusText.textContent = "AI MACHINE ACTIVE [200% SCIENCE]";
    this.bannerTitle.textContent = "AI TAIL STRAIGHTENING IN PROGRESS...";
    this.bannerSubtitle.textContent = "Applying maximum uncalibrated quantum pressure.";

    this.timerBadge.classList.remove('hidden');
    this.timerBadgeTitle.textContent = "AI COMPUTATION TIMER";

    let machineSeconds = 10;
    this.timerBadgeDigits.textContent = machineSeconds;

    window.sfx.startMachineHum();

    // Visual vibrations & shake
    this.aiMachineGroup.classList.add('shaking-machine');
    this.viewportContainer.classList.add('screen-shake');

    const machineAlerts = [
      "ANALYSING TAIL CURVATURE...",
      "CURVATURE TOO POWERFUL...",
      "APPLYING 200% SCIENCE...",
      "RECALCULATING QUANTUM VECTORS...",
      "OVERCLOCKING TUBE HYDRAULICS...",
      "THIS SHOULD DEFINITELY WORK...",
      "WARNING: LOGIC NOT DETECTED...",
      "ERROR: DOG REFUSES TO COOPERATE",
      "CANINE INDEPENDENCE DETECTED...",
      "CATASTROPHIC STRAIGHTENING IMMINENT..."
    ];

    this.machineTimerInterval = setInterval(() => {
      machineSeconds--;
      this.timerBadgeDigits.textContent = machineSeconds;
      window.sfx.playCountdownBeep(false);

      const msg = machineAlerts[10 - machineSeconds] || machineAlerts[0];
      this.timerBadgeMsg.textContent = msg;
      this.logTelemetry(`[AI] ${msg}`);

      // Sparks & sound effects
      this.spawnSparks();
      if (Math.random() < 0.6) window.sfx.playSparkZap();
      if (Math.random() < 0.4) window.sfx.playLaserSweep();

      // Needle oscillation
      const needleAngle = 225 + (Math.random() * 60 - 30);
      this.gaugeNeedle.setAttribute('x2', 560 + Math.cos(needleAngle * Math.PI / 180) * 16);
      this.gaugeNeedle.setAttribute('y2', 235 + Math.sin(needleAngle * Math.PI / 180) * 16);

      // Comedic banter during run
      if (machineSeconds === 8) window.dialogueMgr.say('dog', 'machineRunning', 0);
      if (machineSeconds === 6) window.dialogueMgr.say('human', 'machineRunning', 0);
      if (machineSeconds === 4) window.dialogueMgr.say('dog', 'machineRunning', 1);
      if (machineSeconds === 2) window.dialogueMgr.say('human', 'machineRunning', 2);

      if (machineSeconds <= 0) {
        clearInterval(this.machineTimerInterval);
        this.completeMachineRun();
      }
    }, 1000);
  }

  spawnSparks() {
    if (!this.sparkLayer) return;
    for (let i = 0; i < 4; i++) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const startX = 505 + (Math.random() * 20 - 10);
      const startY = 260 + (Math.random() * 20 - 10);
      circle.setAttribute('cx', startX);
      circle.setAttribute('cy', startY);
      circle.setAttribute('r', (2 + Math.random() * 3).toString());
      circle.setAttribute('fill', Math.random() < 0.5 ? '#00F0FF' : '#FFB703');
      circle.style.opacity = '1';
      this.sparkLayer.appendChild(circle);

      // Simple animation
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 60;
      const animStart = performance.now();

      const animateSpark = (now) => {
        const p = Math.min((now - animStart) / 350, 1);
        circle.setAttribute('cx', startX + dx * p);
        circle.setAttribute('cy', startY + dy * p);
        circle.style.opacity = (1 - p).toString();
        if (p < 1) {
          requestAnimationFrame(animateSpark);
        } else {
          circle.remove();
        }
      };
      requestAnimationFrame(animateSpark);
    }
  }

  completeMachineRun() {
    window.sfx.stopMachineHum();
    this.aiMachineGroup.classList.remove('shaking-machine');
    this.viewportContainer.classList.remove('screen-shake');
    this.timerBadge.classList.add('hidden');

    // Sudden tense silence for 600ms...
    setTimeout(() => {
      // POP! Tail shoots back out of tube!
      window.sfx.playPop();
      this.viewportContainer.classList.add('screen-shake');
      setTimeout(() => {
        this.viewportContainer.classList.remove('screen-shake');
      }, 500);

      this.tail.shootOutFromMachine(() => {
        this.goToStage(STAGES.MISSION_FAILED);
      });
    }, 600);
  }

  // STAGE 7: MISSION FAILED
  setupMissionFailedStage() {
    this.updateProgressSteps(6);
    this.globalStatusText.textContent = "EXPERIMENT FAILED";
    this.bannerTitle.textContent = "MISSION FAILED ❌";
    this.bannerSubtitle.textContent = "Tail returned to 100% original curved shape.";

    // Aura meters
    this.auraDogVal.textContent = "100%";
    this.auraDogBar.style.width = "100%";
    this.auraHumanVal.textContent = "0%";
    this.auraHumanBar.style.width = "0%";

    // Defeated scientist mouth & posture
    if (this.scientistMouth) {
      this.scientistMouth.setAttribute('d', 'M 793 296 Q 802 288 811 296'); // frown
    }

    window.sfx.playFailureFanfare();

    // Dog triumph
    setTimeout(() => {
      window.sfx.playSunglassesBling();
      window.dialogueMgr.say('dog', 'machineFailed', 0);
    }, 1200);

    // Human sad reaction
    setTimeout(() => {
      window.dialogueMgr.say('human', 'failed', 0);
    }, 3200);

    this.btnActionPrimary.classList.remove('hidden');
    this.btnActionPrimary.textContent = "VIEW FINAL ACCREDITATION ➔";
    this.btnActionPrimary.className = "btn-action btn-gold";

    this.logTelemetry("SCIENTIFIC CONCLUSION: Tail curvature is an immutable universal constant.");
  }

  // STAGE 8: FINAL RESULT (USELESS CERTIFICATE OVERLAY)
  setupFinalResultStage() {
    this.stageFinal.classList.remove('hidden');
    this.stageFinal.style.opacity = '1';
    window.sfx.playVictoryJingle();

    if (this.attemptCount > 1) {
      this.finalDogSpeech.textContent = "“വീണ്ടും തോറ്റല്ലോ! പട്ടിയുടെ വാൽ നിവർത്താൻ നോക്കിയാൽ ഇങ്ങനേ ഇരിക്കൂ! 😎”";
    }
  }

  handlePrimaryActionClick() {
    switch (this.currentStage) {
      case STAGES.DOG_INTRO:
        this.goToStage(STAGES.MANUAL_STRAIGHTEN);
        break;
      case STAGES.MANUAL_STRAIGHTEN:
        this.goToStage(STAGES.AI_MACHINE_INTRO);
        break;
      case STAGES.AI_MACHINE_INTRO:
        this.goToStage(STAGES.TAIL_INSERTION);
        break;
      case STAGES.HUMAN_OPERATOR:
        this.goToStage(STAGES.MACHINE_RUNNING);
        break;
      case STAGES.MISSION_FAILED:
        this.goToStage(STAGES.FINAL_RESULT);
        break;
    }
  }

  restartExperiment() {
    this.attemptCount++;
    this.dogMoodLevel++;
    this.stageFinal.classList.add('hidden');
    this.updateDogMoodUI();

    // Reset components
    this.tail.reset();
    if (this.scientistMouth) {
      this.scientistMouth.setAttribute('d', 'M 793 292 Q 802 300 811 292');
    }

    this.logTelemetry(`[RESTART] Commencing attempt #${this.attemptCount}...`);
    this.goToStage(STAGES.MANUAL_STRAIGHTEN);

    setTimeout(() => {
      window.dialogueMgr.say('dog', 'annoyedReplay');
    }, 800);
  }

  triggerMakeItWorse() {
    this.stageFinal.classList.add('hidden');
    this.viewportContainer.classList.add('screen-shake');
    window.sfx.playBoing();
    window.sfx.playSunglassesBling();

    // Extra curly path for the tail
    const svgPath = document.getElementById('dog-tail-path');
    if (svgPath) {
      svgPath.setAttribute('d', 'M 195 250 C 100 300, 70 120, 160 130 C 200 135, 170 180, 130 170');
    }

    this.bannerTitle.textContent = "CURVATURE OVERDRIVE 🌀";
    this.bannerSubtitle.textContent = "The tail has coiled into a hyper-dimensional pretzel.";
    this.statTailCurvature.textContent = "250% Curved (Pretzel)";

    window.dialogueMgr.say('dog', 'final', 1);

    setTimeout(() => {
      this.goToStage(STAGES.FINAL_RESULT);
    }, 3500);
  }

  updateDogMoodUI() {
    const moods = [
      "Irritated 😠",
      "Very Annoyed 😒",
      "Furious 🤬",
      "Deeply Resentful 💀",
      "Sarcastic God 😎"
    ];
    const m = moods[Math.min(this.dogMoodLevel - 1, moods.length - 1)];
    if (this.statDogMood) {
      this.statDogMood.textContent = m;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PattydeVaalApp();
});
