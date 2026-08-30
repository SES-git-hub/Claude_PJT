/**
 * 모든 페이지가 공유하는 최소 크롬(chrome) 로직.
 * 테마 적용 + 테마 토글 버튼 + 푸터 연도.
 */
import { applyStoredTheme, toggleTheme, currentTheme } from "./theme.js";

export function initChrome() {
  applyStoredTheme();

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    const sync = () => {
      btn.setAttribute("aria-pressed", String(currentTheme() === "dark"));
    };
    sync();
    btn.addEventListener("click", () => {
      toggleTheme();
      sync();
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

/** DOM 준비 후 콜백을 한 번 실행. */
export function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}
