/**
 * 테마 제어.
 * 우선순위: 사용자가 명시적으로 고른 값(localStorage) > OS 설정(prefers-color-scheme).
 */
import { config } from "./config.js";
import { readJSON, writeJSON } from "./storage.js";

const KEY = config.storageKeys.theme;

/** 저장된 선택값을 문서에 반영. 없으면 OS 설정에 맡긴다(속성 제거). */
export function applyStoredTheme() {
  const stored = readJSON(KEY); // "light" | "dark" | null
  if (stored === "light" || stored === "dark") {
    document.documentElement.setAttribute("data-theme", stored);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  return stored;
}

/** 현재 화면에 보이는 테마를 반환. */
export function currentTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** light <-> dark 토글 후 선택값을 저장. */
export function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  writeJSON(KEY, next);
  return next;
}
