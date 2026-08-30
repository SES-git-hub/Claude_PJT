/**
 * 간단한 카운트다운 타이머.
 * 분·초를 정하고 시작 / 일시정지 / 초기화. 끝나면 소리 + 화면 깜빡임으로 알림.
 * 남은 시간은 setInterval 누적이 아니라 목표 시각(endAt)과의 차이로 계산해 오차를 줄인다.
 */
import { config } from "./config.js";
import { readJSON, writeJSON } from "./storage.js";
import { initChrome, onReady } from "./common.js";

const KEY = config.storageKeys.timer;
const BASE_TITLE = "타이머 · Claude_PJT";

function clampInt(n, lo, hi) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function fmt(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + i * 0.4;
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
    setTimeout(() => ctx.close(), 1600);
  } catch {
    /* 오디오를 못 쓰면 조용히 넘어간다 */
  }
}

function initTimer(root) {
  const display = root.querySelector("#timer-display");
  const minInput = root.querySelector("#timer-min");
  const secInput = root.querySelector("#timer-sec");
  const toggleBtn = root.querySelector("#timer-toggle");
  const resetBtn = root.querySelector("#timer-reset");
  const presets = root.querySelector("#timer-presets");

  const saved = readJSON(KEY, { min: 5, sec: 0 }) || { min: 5, sec: 0 };
  minInput.value = clampInt(saved.min ?? 5, 0, 999);
  secInput.value = clampInt(saved.sec ?? 0, 0, 59);

  let duration = inputsToMs();
  let remaining = duration;
  let endAt = 0;
  let ticker = null;
  let running = false;

  function inputsToMs() {
    return (clampInt(minInput.value, 0, 999) * 60 + clampInt(secInput.value, 0, 59)) * 1000;
  }

  function stopTicker() {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  function syncLabel() {
    toggleBtn.textContent = running
      ? "일시정지"
      : remaining > 0 && remaining < duration
        ? "계속"
        : "시작";
  }

  function paint() {
    display.textContent = fmt(running ? endAt - Date.now() : remaining);
  }

  function setRunning(on) {
    running = on;
    minInput.disabled = on;
    secInput.disabled = on;
    syncLabel();
  }

  function persist() {
    writeJSON(KEY, {
      min: clampInt(minInput.value, 0, 999),
      sec: clampInt(secInput.value, 0, 59),
    });
  }

  function finish() {
    stopTicker();
    remaining = 0;
    setRunning(false);
    root.classList.add("is-done");
    document.title = "⏰ 시간 종료 · Claude_PJT";
    paint();
    beep();
  }

  function tick() {
    if (Date.now() >= endAt) {
      finish();
      return;
    }
    paint();
  }

  function start() {
    if (remaining <= 0) remaining = inputsToMs();
    if (remaining <= 0) return;
    root.classList.remove("is-done");
    document.title = BASE_TITLE;
    endAt = Date.now() + remaining;
    setRunning(true);
    stopTicker();
    ticker = setInterval(tick, 200);
    paint();
  }

  function pause() {
    remaining = Math.max(0, endAt - Date.now());
    stopTicker();
    setRunning(false);
    paint();
  }

  function reset() {
    stopTicker();
    duration = inputsToMs();
    remaining = duration;
    root.classList.remove("is-done");
    document.title = BASE_TITLE;
    setRunning(false);
    paint();
  }

  toggleBtn.addEventListener("click", () => (running ? pause() : start()));
  resetBtn.addEventListener("click", reset);

  for (const inp of [minInput, secInput]) {
    inp.addEventListener("input", () => {
      if (running) return;
      duration = inputsToMs();
      remaining = duration;
      root.classList.remove("is-done");
      persist();
      syncLabel();
      paint();
    });
    inp.addEventListener("blur", () => {
      minInput.value = clampInt(minInput.value, 0, 999);
      secInput.value = clampInt(secInput.value, 0, 59);
    });
  }

  presets.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-min]");
    if (!btn) return;
    stopTicker();
    running = false;
    minInput.value = clampInt(btn.dataset.min, 0, 999);
    secInput.value = 0;
    persist();
    reset();
  });

  reset();
}

onReady(() => {
  initChrome();
  const root = document.getElementById("timer");
  if (root) initTimer(root);
});
