import Alarm from "./Alarm.js";
import Clock from "./Clock.js";
import Stopwatch from "./Stopwatch.js";
import Timer from "./Timer.js";

customElements.define("x-alarm", Alarm);
customElements.define("x-clock", Clock);
customElements.define("x-stopwatch", Stopwatch);
customElements.define("x-timer", Timer);

import alarmSoundUrl from "./assets/sounds/alarm.mp3";
import timerSoundUrl from "./assets/sounds/timer.mp3";


const alarmSound = new Audio(alarmSoundUrl);
const timerSound = new Audio(timerSoundUrl);
alarmSound.loop = true;
alarmSound.preload = "auto";
timerSound.preload = "auto";

function unlockAudio() {
  [alarmSound, timerSound].forEach((audio) => {
    audio.muted = true;
    const playback = audio.play();

    playback
      ?.catch(() => {})
      .finally(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      });
  });
}

document.addEventListener("click", unlockAudio, { once: true });

async function playSound(audio) {
  audio.currentTime = 0;

  try {
    await audio.play();
  } catch {
    // Alguns navegadors bloquegen l'àudio fins a la primera interacció.
  }
}

function stopSound(audio) {
  audio.pause();
  audio.currentTime = 0;
}

document.querySelector("x-alarm").addEventListener("ring", () => {
  playSound(alarmSound);
});

document.querySelector("x-alarm").addEventListener("silence", () => {
  if (!document.querySelector("x-alarm .alarms[ringing]")) {
    stopSound(alarmSound);
  }
});

document.querySelector("x-timer").addEventListener("stop", () => {
  playSound(timerSound);
});
