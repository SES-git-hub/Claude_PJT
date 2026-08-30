/**
 * 공학용 계산기.
 *
 * eval 없이 직접 만든 토크나이저 + 재귀 하강 파서로 수식을 계산한다.
 * 지원: + - * / ^  괄호  암묵적 곱셈(2π, 3(4+1))  팩토리얼(!)  퍼센트(%)
 *       mod(나머지)  삼각함수  역삼각함수  ln / log / sqrt / abs / exp
 *       상수 π, e  ·  DEG / RAD 각도 모드
 */
import { config } from "./config.js";
import { readJSON, writeJSON } from "./storage.js";
import { initChrome, onReady } from "./common.js";

/* ========================= 수식 평가기 ========================= */

const FUNCS = ["sin", "cos", "tan", "asin", "acos", "atan", "sqrt", "ln", "log", "abs", "exp"];

function tokenize(src) {
  const s = src
    .replace(/√/g, "sqrt")
    .replace(/π/g, "pi")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const num = Number(s.slice(i, j));
      if (!Number.isFinite(num)) throw new Error("잘못된 숫자 형식입니다");
      tokens.push({ t: "num", v: num });
      i = j;
      continue;
    }
    if (/[a-z]/i.test(c)) {
      let j = i + 1;
      while (j < s.length && /[a-z]/i.test(s[j])) j++;
      const name = s.slice(i, j).toLowerCase();
      if (name === "pi") tokens.push({ t: "num", v: Math.PI });
      else if (name === "e") tokens.push({ t: "num", v: Math.E });
      else if (name === "mod") tokens.push({ t: "op", v: "mod" });
      else if (FUNCS.includes(name)) tokens.push({ t: "func", v: name });
      else throw new Error(`알 수 없는 이름: ${name}`);
      i = j;
      continue;
    }
    if ("+-*/^()!%".includes(c)) {
      tokens.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error(`알 수 없는 문자: ${c}`);
  }
  return tokens;
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) throw new Error("팩토리얼은 0 이상의 정수만 가능합니다");
  if (n > 170) return Infinity;
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function evaluate(expr, deg) {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (v) => {
    const tk = next();
    if (!tk || tk.v !== v) throw new Error(`'${v}' 가 필요합니다`);
  };
  const toRad = (x) => (deg ? (x * Math.PI) / 180 : x);
  const fromRad = (x) => (deg ? (x * 180) / Math.PI : x);
  const startsPrimary = (tk) =>
    tk && (tk.t === "num" || tk.t === "func" || (tk.t === "op" && tk.v === "("));

  function parseExpr() {
    let left = parseTerm();
    while (peek() && peek().t === "op" && (peek().v === "+" || peek().v === "-")) {
      const op = next().v;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseUnary();
    while (peek()) {
      const tk = peek();
      if (tk.t === "op" && (tk.v === "*" || tk.v === "/" || tk.v === "mod")) {
        next();
        const right = parseUnary();
        left = tk.v === "*" ? left * right : tk.v === "/" ? left / right : left % right;
      } else if (startsPrimary(tk)) {
        left *= parseUnary(); // 암묵적 곱셈
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary() {
    const tk = peek();
    if (tk && tk.t === "op" && (tk.v === "+" || tk.v === "-")) {
      next();
      const val = parseUnary();
      return tk.v === "-" ? -val : val;
    }
    return parsePower();
  }

  function parsePower() {
    const base = parsePostfix();
    if (peek() && peek().t === "op" && peek().v === "^") {
      next();
      return Math.pow(base, parseUnary()); // 우결합
    }
    return base;
  }

  function parsePostfix() {
    let val = parsePrimary();
    while (peek() && peek().t === "op" && (peek().v === "!" || peek().v === "%")) {
      val = next().v === "!" ? factorial(val) : val / 100;
    }
    return val;
  }

  function parsePrimary() {
    const tk = next();
    if (!tk) throw new Error("수식이 완성되지 않았습니다");
    if (tk.t === "num") return tk.v;
    if (tk.t === "op" && tk.v === "(") {
      const v = parseExpr();
      expect(")");
      return v;
    }
    if (tk.t === "func") {
      expect("(");
      const arg = parseExpr();
      expect(")");
      return applyFunc(tk.v, arg);
    }
    throw new Error(`예상치 못한 토큰: ${tk.v}`);
  }

  function applyFunc(name, x) {
    switch (name) {
      case "sin": return Math.sin(toRad(x));
      case "cos": return Math.cos(toRad(x));
      case "tan": return Math.tan(toRad(x));
      case "asin": return fromRad(Math.asin(x));
      case "acos": return fromRad(Math.acos(x));
      case "atan": return fromRad(Math.atan(x));
      case "sqrt": return Math.sqrt(x);
      case "ln": return Math.log(x);
      case "log": return Math.log10(x);
      case "abs": return Math.abs(x);
      case "exp": return Math.exp(x);
      default: throw new Error(`알 수 없는 함수: ${name}`);
    }
  }

  const result = parseExpr();
  if (pos < tokens.length) throw new Error("해석할 수 없는 부분이 있습니다");
  return result;
}

function formatNumber(n) {
  if (Number.isNaN(n)) return "정의되지 않음";
  if (!Number.isFinite(n)) return n > 0 ? "∞" : "-∞";
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  return String(Number(n.toPrecision(12)));
}

function negate(expr) {
  let m = expr.match(/\(-(\d*\.?\d+)\)$/);
  if (m) return expr.slice(0, m.index) + m[1];
  m = expr.match(/(\d*\.?\d+)$/);
  if (m) return expr.slice(0, m.index) + "(-" + m[1] + ")";
  return expr + "(-";
}

/* ========================= 키패드 UI ========================= */

const KEY_ANGLE = config.storageKeys.calcAngle;

const LAYOUT = [
  [
    { label: "AC", action: "clear", cls: "key--fn" },
    { label: "DEL", action: "del", cls: "key--fn" },
    { label: "(", insert: "(", cls: "key--op" },
    { label: ")", insert: ")", cls: "key--op" },
    { label: "mod", insert: " mod ", cls: "key--op" },
  ],
  [
    { label: "sin", insert: "sin(", cls: "key--fn" },
    { label: "cos", insert: "cos(", cls: "key--fn" },
    { label: "tan", insert: "tan(", cls: "key--fn" },
    { label: "π", insert: "π", cls: "key--fn" },
    { label: "e", insert: "e", cls: "key--fn" },
  ],
  [
    { label: "ln", insert: "ln(", cls: "key--fn" },
    { label: "log", insert: "log(", cls: "key--fn" },
    { label: "√", insert: "√(", cls: "key--fn" },
    { label: "x²", insert: "^2", cls: "key--fn" },
    { label: "xʸ", insert: "^", cls: "key--fn" },
  ],
  [
    { label: "7", insert: "7" },
    { label: "8", insert: "8" },
    { label: "9", insert: "9" },
    { label: "÷", insert: "÷", cls: "key--op" },
    { label: "n!", insert: "!", cls: "key--fn" },
  ],
  [
    { label: "4", insert: "4" },
    { label: "5", insert: "5" },
    { label: "6", insert: "6" },
    { label: "×", insert: "×", cls: "key--op" },
    { label: "±", action: "negate", cls: "key--fn" },
  ],
  [
    { label: "1", insert: "1" },
    { label: "2", insert: "2" },
    { label: "3", insert: "3" },
    { label: "−", insert: "-", cls: "key--op" },
    { label: "%", insert: "%", cls: "key--fn" },
  ],
  [
    { label: "0", insert: "0", cls: "key--wide" },
    { label: ".", insert: "." },
    { label: "+", insert: "+", cls: "key--op" },
    { label: "=", action: "equals", cls: "key--eq" },
  ],
];

function initCalculator(root) {
  const exprEl = root.querySelector("#calc-expr");
  const resultEl = root.querySelector("#calc-result");
  const errEl = root.querySelector("#calc-error");
  const angleBtn = root.querySelector("#calc-angle");
  const keys = root.querySelector("#calc-keys");

  let expr = "";
  let deg = readJSON(KEY_ANGLE, "deg") !== "rad";
  let justEvaluated = false;

  const syncAngle = () => {
    angleBtn.textContent = deg ? "DEG" : "RAD";
    angleBtn.setAttribute("aria-label", deg ? "각도 단위: 도. 눌러서 라디안으로" : "각도 단위: 라디안. 눌러서 도로");
  };
  syncAngle();

  angleBtn.addEventListener("click", () => {
    deg = !deg;
    writeJSON(KEY_ANGLE, deg ? "deg" : "rad");
    syncAngle();
    render();
  });

  for (const row of LAYOUT) {
    for (const k of row) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = k.label;
      if (k.cls) b.className = k.cls;
      b.addEventListener("click", () => handleKey(k));
      keys.appendChild(b);
    }
  }

  function handleKey(k) {
    errEl.textContent = "";
    switch (k.action) {
      case "clear":
        expr = "";
        justEvaluated = false;
        render();
        break;
      case "del":
        expr = expr.slice(0, -1);
        justEvaluated = false;
        render();
        break;
      case "negate":
        expr = negate(expr);
        justEvaluated = false;
        render();
        break;
      case "equals":
        doEquals();
        break;
      default:
        if (k.insert != null) {
          if (justEvaluated && /[0-9.]/.test(k.insert[0])) expr = "";
          justEvaluated = false;
          expr += k.insert;
          render();
        }
    }
  }

  function doEquals() {
    if (!expr.trim()) return;
    try {
      const value = evaluate(expr, deg);
      const text = formatNumber(value);
      exprEl.textContent = expr + " =";
      resultEl.textContent = text;
      expr = Number.isFinite(value) ? text : "";
      justEvaluated = true;
    } catch (err) {
      errEl.textContent = err.message || "계산할 수 없습니다";
    }
  }

  function preview() {
    if (!expr.trim()) {
      resultEl.textContent = "0";
      return;
    }
    try {
      const value = evaluate(expr, deg);
      resultEl.textContent = Number.isFinite(value) ? formatNumber(value) : "…";
    } catch {
      resultEl.textContent = "…";
    }
  }

  function render() {
    exprEl.textContent = expr || " ";
    if (!justEvaluated) preview();
  }

  window.addEventListener("keydown", (ev) => {
    if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return;
    const k = ev.key;
    if (k === "Enter" || k === "=") {
      ev.preventDefault();
      handleKey({ action: "equals" });
    } else if (k === "Backspace") {
      handleKey({ action: "del" });
    } else if (k === "Escape") {
      handleKey({ action: "clear" });
    } else if (k === "x" || k === "X" || k === "*") {
      handleKey({ insert: "×" });
    } else if (k === "/") {
      handleKey({ insert: "÷" });
    } else if (/^[0-9.()+\-^!%]$/.test(k)) {
      handleKey({ insert: k });
    }
  });

  render();
}

onReady(() => {
  initChrome();
  const root = document.getElementById("calc");
  if (root) initCalculator(root);
});
