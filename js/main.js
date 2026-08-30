/**
 * 진입점. DOM을 찾아 각 모듈을 연결한다.
 * 새 기능은 별도 모듈로 만들고 여기서 init 하는 방식으로 확장한다.
 */
import { config } from "./config.js";
import { applyStoredTheme, toggleTheme, currentTheme } from "./theme.js";
import { initCounter } from "./counter.js";

const FEATURES = [
  { title: "정적 배포", body: "번들러 불필요, 루트 index.html이 진입점입니다." },
  { title: "모듈 구조", body: "js/는 ES 모듈로 분리되어 확장이 쉽습니다." },
  { title: "테마 지원", body: "OS 설정을 따르고 수동 토글도 기억합니다." },
];

function renderFeatures(list) {
  if (!list) return;
  list.innerHTML = FEATURES.map(
    (f) => `<li class="card"><h3>${f.title}</h3><p>${f.body}</p></li>`
  ).join("");
}

function initThemeToggle(button) {
  if (!button) return;
  const sync = () => {
    button.setAttribute("aria-pressed", String(currentTheme() === "dark"));
  };
  sync();
  button.addEventListener("click", () => {
    toggleTheme();
    sync();
  });
}

function init() {
  applyStoredTheme();
  renderFeatures(document.getElementById("feature-list"));
  initThemeToggle(document.getElementById("theme-toggle"));
  initCounter(document.getElementById("counter"));

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  console.info(`${config.appName} v${config.version} ready`);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
