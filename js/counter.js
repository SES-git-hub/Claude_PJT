/**
 * 카운터 위젯 – 최소 상태 관리 예시.
 * (상태 → 렌더) 한 방향 흐름과 localStorage 영속화 패턴을 보여준다.
 */
import { config } from "./config.js";
import { readJSON, writeJSON } from "./storage.js";

const KEY = config.storageKeys.counter;

export function initCounter(root) {
  if (!root) return;

  const output = root.querySelector("#counter-value");
  let state = Number(readJSON(KEY, 0)) || 0;

  const render = () => {
    output.textContent = String(state);
  };

  const set = (next) => {
    state = next;
    writeJSON(KEY, state);
    render();
  };

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "increment") set(state + 1);
    else if (action === "decrement") set(state - 1);
    else if (action === "reset") set(0);
  });

  render();
}
