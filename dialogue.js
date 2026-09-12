/**
 * PATTYDE VAAL - Malayalam Comedy Dialogue Engine
 * Authentic Malayalam script + English phonetic transliteration for universal accessibility.
 */

const DIALOGUES = {
  dog: {
    idle: [
      { ml: "എന്റെ വാൽ വിടെടാ! 😭", en: "Ente vaal videda! 😭" },
      { ml: "നിനക്ക് വേറെ പണി ഒന്നുമില്ലേ?", en: "Ninak vere pani onnumillee?" },
      { ml: "എന്താമ്മോ എന്റെ വാൽ!", en: "Enthaammooo ente vaal!" },
      { ml: "ഇയാളെ കൊണ്ട്...", en: "Iyaalle kond..." },
      { ml: "എത്ര വളച്ചാലും ഞാൻ നിവരില്ല!", en: "Ethra valachalum njan nivarilla!" },
      { ml: "ഞാൻ ഗോൾഡൻ റിട്രീവർ ആണ്, റബ്ബർ ബാൻഡ് അല്ല!", en: "I'm a Golden Retriever, not a rubber band!" }
    ],
    dragging: [
      { ml: "എന്റെ വാൽ വിടെടാ!", en: "Ente vaal videda! (Let go of my tail!)" },
      { ml: "നിനക്ക് വേറെ പണി ഒന്നുമില്ലേ?", en: "Ninak vere pani onnumillee? (Got no other job?)" },
      { ml: "എന്താമ്മോ എന്റെ വാൽ!", en: "Enthaammooo ente vaal!" },
      { ml: "എത്ര വളച്ചാലും ഞാൻ നിവരില്ല!", en: "Ethra valachalum njan nivarilla!" },
      { ml: "വലിച്ചാൽ നീളില്ലെടാ ഇത്!", en: "Pulling won't make it longer, dude!" }
    ],
    snapback: [
      { ml: "പറഞ്ഞില്ലേ ഞാൻ നിവരില്ല എന്ന്! 😎", en: "Paranjille njan nivarilla enn! 😎" },
      { ml: "ഇത്രയും നേരം എന്നെ പിടിച്ചു വെച്ചത് എന്തിനാ?", en: "Ithrayum neram enne pidich vechath enthina?" },
      { ml: "10 സെക്കൻഡ് പോയി കിട്ടി! വേറെ പണി നോക്ക്!", en: "Wasted 10 seconds! Go get a hobby!" }
    ],
    tubeInserted: [
      { ml: "എന്റെ വാൽ ആണ് അത്... മെഷീൻ അല്ല!", en: "Ente vaal aanu ath... machine alla!" },
      { ml: "എടാ പതുക്കെ!", en: "Eda pathukke! (Hey gently!)" },
      { ml: "നിന്റെ ഒരു വാൽ...", en: "Ninte oru vaal..." },
      { ml: "എനിക്ക് ഇതൊന്നും വേണ്ടായിരുന്നു!", en: "Enikk ithonnum venda!" }
    ],
    machineRunning: [
      { ml: "എന്താ ഈ സംഭവം?!", en: "Entha ee sambhavam?! (What is happening?!)" },
      { ml: "എന്റെ വാൽ പോയി!", en: "Ente vaal poyi! (My tail is gone!)" },
      { ml: "എടാ നിർത്തു!", en: "Eda niruthu! (Hey stop it!)" },
      { ml: "ഇയാളെ കൊണ്ട് തോറ്റു!", en: "Iyaalle kond thottu!" }
    ],
    machineFailed: [
      { ml: "പറഞ്ഞില്ലേ... ഞാൻ നിവരില്ല! 😎", en: "Paranjille... njan nivarilla! 😎" },
      { ml: "എത്ര വളച്ചാലും ഞാൻ നിവരില്ല!", en: "Ethra valachalum njan nivarilla!" },
      { ml: "പന്തീരാണ്ട് കൊല്ലം കുഴലിലിട്ടാലും വാൽ വളഞ്ഞു തന്നെ!", en: "Even in a pipe for 12 years, it stays curved!" }
    ],
    final: [
      { ml: "എന്റെ വാൽ നിവർത്താൻ നോക്കിയ നിനക്ക് ഇപ്പോൾ മനസ്സിലായോ?", en: "Ente vaal nivarthan nokkiya ninakk ippo manassilaayo?" },
      { ml: "എത്ര വളച്ചാലും ഞാൻ നിവരില്ലെടാ! 😎", en: "Ethra valachalum njan nivarilla da! 😎" },
      { ml: "Time wasted successfully! അടുത്ത പണി എടുത്തോ!", en: "Time wasted successfully! Go find real work! 😎" }
    ],
    annoyedReplay: [
      { ml: "വീണ്ടുമോ?! നിനക്ക് വട്ടാണോ?", en: "Again?! Have you gone completely mad?!" },
      { ml: "എന്റെ കണ്ണട വീഴാതെ നോക്കിക്കോ!", en: "Watch my shades don't fall off!" },
      { ml: "ഇനി തൊട്ടാൽ ഞാൻ കടിക്കും!", en: "Touch my tail once more and I swear..." }
    ]
  },
  human: {
    operatorIntro: [
      { ml: "ഇത് നേരെയാവുമോ എന്ന് ഞാൻ നോക്കട്ടെ.", en: "Ith nerayavonn njan nokkatte. (Let me see if this straightens.)" },
      { ml: "നീ ഒന്ന് മിണ്ടാതിരുന്നേ.", en: "Ni onn mindathirunne. (You just stay quiet.)" },
      { ml: "ഇത് നിവർത്തിയിട്ടേ ഇനി ബാക്കി.", en: "Ith nivarthiyitte ini baaki. (Only after straightening this will we stop.)" },
      { ml: "നിന്റെ ഒരു വാൽ!", en: "Ninte oru vaal!" }
    ],
    machineRunning: [
      { ml: "Shhh... scientific experiment ആണ്!", en: "Shhh... scientific experiment aanu!" },
      { ml: "നീ ഒന്ന് മിണ്ടാതിരുന്നേ!", en: "Ni onn mindathirunne!" },
      { ml: "ഇത് ഇപ്പോൾ ശരിയാകും... 99% accuracy!", en: "Ith ippo sheriyakum... 99% accuracy!" },
      { ml: "Quantum Tail Straightening in progress!", en: "Quantum Tail Straightening in progress!" }
    ],
    failed: [
      { ml: "എന്താമ്മോ...", en: "Enthaammo... (Oh dear heavens...)" },
      { ml: "ഞാൻ ഇനി ഇത് ചെയ്യില്ല.", en: "Njan ini ith cheyyilla. (I will never do this again.)" },
      { ml: "സയൻസ് തോറ്റു പോയ നിമിഷം...", en: "The moment even science gave up..." }
    ]
  }
};

class DialogueManager {
  constructor() {
    this.dogBubble = null;
    this.humanBubble = null;
    this.dogTimer = null;
    this.humanTimer = null;
  }

  init() {
    this.dogBubble = document.getElementById('dog-bubble');
    this.humanBubble = document.getElementById('human-bubble');
  }

  say(speaker, category, forceIndex = null) {
    const bubble = speaker === 'dog' ? this.dogBubble : this.humanBubble;
    if (!bubble) return;

    const list = DIALOGUES[speaker]?.[category];
    if (!list || list.length === 0) return;

    const item = forceIndex !== null && list[forceIndex] ? list[forceIndex] : list[Math.floor(Math.random() * list.length)];

    const mlEl = bubble.querySelector('.dialogue-ml');
    const enEl = bubble.querySelector('.dialogue-en');

    if (mlEl) mlEl.textContent = item.ml;
    if (enEl) enEl.textContent = item.en;

    bubble.classList.remove('hidden', 'pop-in');
    void bubble.offsetWidth; // Trigger reflow for animation
    bubble.classList.add('pop-in');

    if (speaker === 'dog') {
      clearTimeout(this.dogTimer);
      this.dogTimer = setTimeout(() => {
        bubble.classList.add('hidden');
      }, 4200);
    } else {
      clearTimeout(this.humanTimer);
      this.humanTimer = setTimeout(() => {
        bubble.classList.add('hidden');
      }, 4000);
    }
  }

  hideAll() {
    if (this.dogBubble) this.dogBubble.classList.add('hidden');
    if (this.humanBubble) this.humanBubble.classList.add('hidden');
    clearTimeout(this.dogTimer);
    clearTimeout(this.humanTimer);
  }
}

window.dialogueMgr = new DialogueManager();
