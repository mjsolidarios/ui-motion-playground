// Shared motion helpers: reduced-motion state and easing math.
const root = document.documentElement;
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

export function reduced() { return root.classList.contains('rm'); }
export function onReducedChange(fn) { listeners.add(fn); }

export function initReducedToggle(input) {
  const stored = localStorage.getItem('rm');
  const set = (on) => {
    root.classList.toggle('rm', on);
    input.checked = on;
    if (on) document.getAnimations().forEach(a => a.finish?.());
    listeners.forEach(fn => fn(on));
  };
  set(stored === null ? mq.matches : stored === '1');
  input.addEventListener('change', () => { localStorage.setItem('rm', input.checked ? '1' : '0'); set(input.checked); });
  mq.addEventListener('change', e => { if (localStorage.getItem('rm') === null) set(e.matches); });
}

// cubic-bezier(x1,y1,x2,y2) evaluated as y at time x (Newton + bisection)
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6) return sy(t); if (Math.abs(d) < 1e-6) break; t -= e / d; }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 30; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-6) break; v < x ? lo = t : hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}

// Damped spring from 0 to 1 over normalised time
export function spring(stiffness = 170, damping = 14) {
  return x => {
    if (x >= 1) return 1;
    const t = x * 1.2; // ~1.2 s of simulated time over the duration
    const w0 = Math.sqrt(stiffness), z = damping / (2 * Math.sqrt(stiffness));
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  };
}

export function linearString(fn, n = 40) {
  const pts = []; for (let i = 0; i <= n; i++) pts.push(+fn(i / n).toFixed(3));
  return `linear(${pts.join(', ')})`;
}

export const PRESETS = {
  linear: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1],
  'back-out': [0.34, 1.56, 0.64, 1], spring: null,
};

// Animate with Web Animations, or jump to the end under reduced motion
export function play(el, frames, opts) {
  if (reduced()) { const last = frames[frames.length - 1]; Object.assign(el.style, last); return { finished: Promise.resolve() }; }
  return el.animate(frames, { fill: 'forwards', ...opts });
}
