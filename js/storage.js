/**
 * localStorage 얇은 래퍼.
 * 프라이빗 모드 등에서 접근이 막힐 수 있으므로 항상 try/catch로 감쌉니다.
 */
export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
