import { play, reduced, onReducedChange } from './motion.js';

const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const slider = (label, min, max, val, step = 10) => h(`<label class="range">${label} <output>${val} ms</output><input type="range" min="${min}" max="${max}" step="${step}" value="${val}"></label>`);
const val = el => +el.querySelector('input').value;
const bindOut = el => el.querySelector('input').addEventListener('input', e => el.querySelector('output').value = `${e.target.value} ms`);

function side(kind, title, why) {
  const s = h(`<div class="side ${kind}"><header>${kind === 'do' ? 'Do' : 'Don’t'}: ${title}</header><div class="stage"></div><div class="ctl"></div><p class="why">${why}</p></div>`);
  return { el: s, stage: s.querySelector('.stage'), ctl: s.querySelector('.ctl') };
}
function button(text, cls = 'btn') { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; return b; }

const RULES = [
{
  title: 'Give every animation a job',
  text: 'Motion should answer a question the user has: did that work, where did it go, what changed? If it answers nothing, it is decoration that costs attention.',
  build(doS, dontS) {
    // Do: item travels to cart, badge confirms
    doS.stage.append(h(`<div class="cart"><button type="button" class="btn">Add to cart</button><div class="cart-icon" aria-hidden="true"><span class="badge">0</span></div><span class="sr" aria-live="polite"></span></div>`));
    const badge = doS.stage.querySelector('.badge'), live = doS.stage.querySelector('[aria-live]');
    let n = 0;
    doS.stage.querySelector('button').onclick = (e) => {
      n++; badge.textContent = n; live.textContent = `${n} in cart`;
      const btn = e.currentTarget.getBoundingClientRect(), cart = badge.getBoundingClientRect(), st = doS.stage.getBoundingClientRect();
      const dot = h('<span class="dot" style="background:var(--yellow)"></span>'); doS.stage.append(dot);
      const x0 = btn.left + btn.width / 2 - st.left, y0 = btn.top - st.top, x1 = cart.left - st.left + 6, y1 = cart.top - st.top + 6;
      dot.style.left = 0; dot.style.top = 0;
      play(dot, [{ transform: `translate(${x0}px,${y0}px)` }, { transform: `translate(${x1}px,${y1}px)` }], { duration: 300, easing: 'cubic-bezier(.2,0,0,1)' }).finished.then(() => dot.remove());
      play(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 200, delay: 280, easing: 'ease-out', fill: 'none' });
    };
    doS.ctl.append(h('<span class="small">The dot shows where the item went. The badge bump confirms it.</span>'));
    // Don't: spinning logo + sparkles that say nothing
    dontS.stage.append(h('<div class="sparkle-logo" aria-hidden="true">SHOP</div>'));
    const logo = dontS.stage.firstElementChild;
    const run = button('Add to cart', 'btn bad');
    run.onclick = () => {
      play(logo, [{ transform: 'rotate(0)' }, { transform: 'rotate(720deg)' }], { duration: 1600, easing: 'ease-in-out', fill: 'none' });
      for (let i = 0; i < 14; i++) {
        const d = h('<span class="dot"></span>'); d.style.left = '50%'; d.style.top = '50%'; dontS.stage.append(d);
        const a = Math.random() * 6.28, r = 60 + Math.random() * 60;
        play(d, [{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px)`, opacity: 0 }], { duration: 1200, easing: 'ease-out' }).finished.then(() => d.remove());
      }
    };
    dontS.ctl.append(run);
  },
  do: ['item flies to the cart', 'Shows the result of the tap: the item went into the cart, and the count changed.'],
  dont: ['spinning logo and sparkles', 'Looks busy but tells the user nothing. Notice there is no count, so you still do not know if it worked.'],
},
{
  title: 'Keep it short: 100–400 ms',
  text: 'Most UI transitions land between 100 and 400 ms. Under 100 ms reads as a jump; past about 500 ms the user is waiting on your animation instead of using the app.',
  build(doS, dontS) {
    const mk = (s, min, max, v, label, bad) => {
      const d = h(`<div class="dialog" style="opacity:0"><p>Delete this file?</p><button type="button" class="btn ghost" style="color:var(--deep);border-color:var(--deep)">Cancel</button></div>`);
      s.stage.append(d);
      const sl = slider('Duration', min, max, v); bindOut(sl);
      const b = button(label, bad ? 'btn bad' : 'btn');
      b.onclick = () => play(d, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], { duration: val(sl), easing: 'cubic-bezier(.2,0,0,1)' });
      d.querySelector('button').onclick = () => play(d, [{ opacity: 1 }, { opacity: 0 }], { duration: Math.min(val(sl), 200), easing: 'ease-in' });
      s.ctl.append(b, sl);
    };
    mk(doS, 50, 1000, 250, 'Open dialog');
    mk(dontS, 500, 4000, 3000, 'Open dialog', true);
  },
  do: ['250 ms dialog', 'Fast enough that the user never waits, slow enough to see where the dialog came from. Drag the slider below 100 ms and it starts to feel like a jump.'],
  dont: ['3-second entrance', 'Every open now costs three seconds. Try clicking Open several times in a row, the way a real user would.'],
},
{
  title: 'Ease out on entrances',
  text: 'Things entering the screen should start fast and settle gently, so the eye can predict where they stop. Constant speed looks mechanical and stops dead.',
  build(doS, dontS) {
    [[doS, 'cubic-bezier(0,0,.58,1)', 'ease-out'], [dontS, 'linear', 'linear']].forEach(([s, easing, name], i) => {
      const dr = h('<div class="drawer">Menu</div>'); s.stage.append(dr);
      const sl = slider('Duration', 100, 1500, 400); bindOut(sl);
      const b = button('Slide in', i ? 'btn bad' : 'btn');
      b.onclick = () => play(dr, [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: val(sl), easing });
      const reset = button('Reset', 'btn ghost'); reset.onclick = () => { dr.getAnimations().forEach(a => a.cancel()); dr.style.transform = ''; };
      s.ctl.append(b, reset, sl);
      s.stage.append(h(`<code style="position:absolute;right:.7rem;bottom:.5rem;font-size:.85rem">transition: ${name}</code>`));
    });
  },
  do: ['ease-out', 'The drawer moves fast at the start and slows as it lands. Slow the slider to 1500 ms to see the settle clearly.'],
  dont: ['linear', 'Same distance, same time, constant speed. At slow durations it feels robotic and the stop is abrupt.'],
},
{
  title: 'Respect reduced motion',
  text: 'Some people get dizzy or sick from motion. Operating systems have a “Reduce motion” setting; CSS reads it with prefers-reduced-motion. Swap big movement for a fade, and never flash or shake the screen.',
  build(doS, dontS) {
    const card = h('<div class="card">Step 1 of 3</div>'); doS.stage.append(card);
    let step = 1;
    const b = button('Next step');
    b.onclick = () => {
      step = step % 3 + 1; card.textContent = `Step ${step} of 3`;
      const rm = reduced();
      play(card, rm ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateX(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: rm ? 150 : 250, easing: 'ease-out', fill: 'none' });
    };
    const note = h('<span class="small"></span>');
    const upd = () => note.textContent = reduced() ? 'Reduce motion is on: this uses a 150 ms fade.' : 'Turn on Reduce motion at the top to see the fade version.';
    upd(); onReducedChange(upd);
    doS.ctl.append(b, note);
    // Don't: shake + slow low-contrast flash (2 flashes/sec, 3 flashes total)
    const fb = h('<div class="flashbox" aria-hidden="true"></div>'); dontS.stage.append(fb);
    dontS.stage.append(h('<div class="card" style="position:relative">Wrong password</div>'));
    const run = button('Run demo (shakes and flashes)', 'btn bad');
    const warn = h('<p class="warn"></p>');
    const sync = () => { run.disabled = reduced(); warn.textContent = reduced()
      ? 'Disabled because Reduce motion is on. That is the point of this rule.'
      : 'Safe version: 3 soft flashes at 2 per second, low contrast, and only when you click.'; };
    sync(); onReducedChange(sync);
    run.onclick = () => {
      if (reduced()) return;
      dontS.stage.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }], { duration: 250, iterations: 4 });
      // 500 ms per flash -> 2 per second; tint is only a slightly lighter teal
      fb.animate([{ background: 'transparent' }, { background: '#24687A' }, { background: 'transparent' }], { duration: 500, iterations: 3 });
    };
    dontS.ctl.append(run);
    dontS.el.append(warn);
  },
  do: ['fade when asked', 'Normally the card slides; with Reduce motion on, it fades instead. The information is the same.'],
  dont: ['shake and flash', 'Whole-screen shaking and flashing can trigger dizziness or seizures. WCAG 2.3.1 sets a hard limit of three flashes per second.'],
},
{
  title: 'Stay consistent',
  text: 'Pick a few motion tokens (for example, 200 ms ease-out to enter, 150 ms ease-in to leave) and reuse them. Users learn the rhythm, and the app feels like one product.',
  build(doS, dontS) {
    const build = (s, specs, bad) => {
      const wrap = h('<div style="display:grid;gap:.5rem;width:80%"></div>');
      const items = ['Toast: saved', 'Tab: Profile', 'Dialog: Share'].map(t => { const c = h(`<div class="card" style="width:100%;opacity:0">${t}</div>`); wrap.append(c); return c; });
      s.stage.append(wrap);
      const b = button('Show all three', bad ? 'btn bad' : 'btn');
      b.onclick = () => items.forEach((c, i) => play(c, specs[i].frames, { duration: specs[i].d, easing: specs[i].e }));
      s.ctl.append(b);
      if (!bad) s.ctl.append(h('<code class="small">200ms cubic-bezier(.2,0,0,1)</code>'));
    };
    const same = { frames: [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], d: 200, e: 'cubic-bezier(.2,0,0,1)' };
    build(doS, [same, same, same]);
    build(dontS, [
      { frames: [{ opacity: 0, transform: 'translateX(-120px)' }, { opacity: 1, transform: 'none' }], d: 900, e: 'linear' },
      { frames: [{ opacity: 0, transform: 'rotate(-20deg) scale(.4)' }, { opacity: 1, transform: 'none' }], d: 600, e: 'cubic-bezier(.34,1.8,.64,1)' },
      { frames: [{ opacity: 0, transform: 'translateY(-60px)' }, { opacity: 1, transform: 'none' }], d: 1400, e: 'ease-in' },
    ], true);
  },
  do: ['one set of tokens', 'All three use the same duration and curve, so they read as one family.'],
  dont: ['every element its own style', 'A slide, a spin, and a slow drop, each at a different speed. Parallax on every section causes the same problem: nothing feels related.'],
},
];

export function initRules() {
  const list = document.getElementById('rule-list');
  RULES.forEach(r => {
    const li = h(`<li class="rule"><h3>${r.title}</h3><p>${r.text}</p><div class="pair"></div></li>`);
    const d = side('do', ...r.do), n = side('dont', ...r.dont);
    li.querySelector('.pair').append(d.el, n.el);
    list.append(li);
    r.build(d, n);
  });
}
