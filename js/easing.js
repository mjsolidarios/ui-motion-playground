import { bezier, spring, linearString, PRESETS, reduced, onReducedChange } from './motion.js';

const $ = id => document.getElementById(id);
const svg = $('graph'), h1 = $('h1'), h2 = $('h2');
let pts = [...PRESETS['ease-out']];
let mode = 'ease-out';
const springFn = spring();

const Y = y => 1 - y; // svg y axis points down
const fnFor = name => name === 'spring' ? springFn : bezier(...PRESETS[name]);
const fmt = n => +n.toFixed(2);
const pathOf = fn => { let d = ''; for (let i = 0; i <= 80; i++) { const x = i / 80; d += (i ? 'L' : 'M') + x + ' ' + Y(fn(x)) + ' '; } return d; };

function cssValue() {
  if (mode === 'spring') return linearString(springFn);
  const named = Object.entries(PRESETS).find(([k, v]) => v && ['linear','ease','ease-in','ease-out','ease-in-out'].includes(k) && v.every((n, i) => n === fmt(pts[i])));
  return named ? named[0] : `cubic-bezier(${pts.map(fmt).join(', ')})`;
}

function draw() {
  let g = ''; for (let i = 1; i < 4; i++) g += `M${i / 4} 0V1M0 ${i / 4}H1`;
  $('g-grid').setAttribute('d', g);
  const fn = mode === 'spring' ? springFn : bezier(...pts);
  $('g-curve').setAttribute('d', pathOf(fn));
  const locked = mode === 'spring';
  [[h1, 0, 0, 0], [h2, 2, 1, 1]].forEach(([h, i, ax, ay]) => {
    h.setAttribute('cx', pts[i]); h.setAttribute('cy', Y(pts[i + 1]));
    h.classList.toggle('locked', locked);
    h.setAttribute('aria-valuetext', `x ${fmt(pts[i])}, y ${fmt(pts[i + 1])}`);
    const l = i ? $('l2') : $('l1');
    l.setAttribute('x1', ax); l.setAttribute('y1', Y(ay)); l.setAttribute('x2', pts[i]); l.setAttribute('y2', Y(pts[i + 1]));
  });
  h1.style.display = h2.style.display = $('l1').style.display = $('l2').style.display = locked ? 'none' : '';
  const cmpOn = $('cmp-on').checked;
  $('g-curve2').setAttribute('d', cmpOn ? pathOf(fnFor($('cmp').value)) : '');
  $('trackB').hidden = !cmpOn;
  $('cmp').disabled = !cmpOn;
  const d = $('dur').value;
  $('dur-out').value = `${d} ms`;
  const v = cssValue();
  $('css-out').textContent = `transition: transform ${d}ms ${v};\n/* timing function only */\n${v}`;
  $('spring-note').hidden = !locked;
  document.querySelectorAll('#presets .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.k === mode));
}

// dragging
function toGraph(e) {
  const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
  const q = p.matrixTransform(svg.getScreenCTM().inverse());
  return [Math.min(1, Math.max(0, q.x)), Math.min(1.5, Math.max(-0.5, 1 - q.y))];
}
[[h1, 0], [h2, 2]].forEach(([h, i]) => {
  h.addEventListener('pointerdown', e => { if (mode === 'spring') return; h.setPointerCapture(e.pointerId); h.dragging = true; });
  h.addEventListener('pointermove', e => { if (!h.dragging) return; [pts[i], pts[i + 1]] = toGraph(e); mode = 'custom'; draw(); });
  h.addEventListener('pointerup', () => { h.dragging = false; runBalls(); });
  h.addEventListener('keydown', e => {
    if (mode === 'spring') return;
    const s = e.shiftKey ? 0.1 : 0.02, m = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
    if (!m) return; e.preventDefault();
    pts[i] = Math.min(1, Math.max(0, pts[i] + m[0])); pts[i + 1] = Math.min(1.5, Math.max(-0.5, pts[i + 1] + m[1]));
    mode = 'custom'; draw();
  });
});

// balls
let raf;
function runBalls() {
  cancelAnimationFrame(raf);
  const lanes = [[$('ballA'), mode === 'spring' ? springFn : bezier(...pts)], [$('ballB'), fnFor($('cmp').value)]];
  const dist = () => $('ballA').parentElement.clientWidth - 36;
  document.querySelectorAll('.ghost').forEach(g => g.remove());
  if (reduced()) {
    // show frames as still dots instead of moving
    lanes.forEach(([b, fn]) => { b.style.transform = `translateX(${dist()}px)`;
      for (let i = 0; i <= 10; i++) { const g = b.cloneNode(); g.removeAttribute('id'); g.classList.add('ghost'); g.style.opacity = .25 + i * .05; g.style.transform = `translateX(${fn(i / 10) * dist()}px)`; b.parentElement.prepend(g); } });
    return;
  }
  const dur = +$('dur').value, t0 = performance.now();
  const step = now => {
    const x = Math.min(1, (now - t0) / dur);
    lanes.forEach(([b, fn]) => b.style.transform = `translateX(${fn(x) * dist()}px)`);
    if (x < 1) raf = requestAnimationFrame(step);
  };
  lanes.forEach(([b]) => b.style.transform = 'translateX(0)');
  raf = requestAnimationFrame(step);
}

export function initEasing() {
  const pre = $('presets'), cmp = $('cmp');
  Object.keys(PRESETS).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = k; b.dataset.k = k;
    b.onclick = () => { mode = k; if (PRESETS[k]) pts = [...PRESETS[k]]; draw(); runBalls(); };
    pre.append(b);
    cmp.add(new Option(k, k));
  });
  cmp.value = 'linear';
  $('dur').oninput = draw; $('dur').onchange = runBalls;
  cmp.onchange = () => { draw(); runBalls(); };
  $('cmp-on').onchange = draw;
  $('play').onclick = runBalls;
  $('copy').onclick = async () => {
    try { await navigator.clipboard.writeText($('css-out').textContent); $('copy-msg').textContent = 'Copied.'; }
    catch { $('copy-msg').textContent = 'Copy blocked by the browser. Select the code and copy it by hand.'; }
  };
  onReducedChange(() => runBalls());
  draw();
}
