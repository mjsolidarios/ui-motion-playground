import { play, reduced } from './motion.js';

const SPEEDS = [40, 200, 700, 1600]; // index 1 is the target range
const KINDS = {
  'Like button': (stage, d) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'like'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Like');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/></svg>';
    b.onclick = () => { const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', on);
      play(b.firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: d, easing: 'ease-out', fill: 'none' }); };
    stage.append(b);
  },
  'Toggle': (stage, d) => {
    const s = document.createElement('button'); s.type = 'button'; s.className = 'switch'; s.setAttribute('role', 'switch'); s.setAttribute('aria-checked', 'false'); s.setAttribute('aria-label', 'Wi-Fi');
    s.style.setProperty('--d', reduced() ? '0ms' : d + 'ms');
    s.onclick = () => s.setAttribute('aria-checked', s.getAttribute('aria-checked') !== 'true');
    stage.append(s);
  },
  'Modal': (stage, d) => {
    const dl = document.createElement('div'); dl.className = 'dialog'; dl.style.opacity = 0; dl.style.position = 'absolute'; dl.innerHTML = '<p>Saved.</p>';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = 'Open';
    b.onclick = () => { play(dl, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: d, easing: 'cubic-bezier(.2,0,0,1)' });
      setTimeout(() => play(dl, [{ opacity: 1 }, { opacity: 0 }], { duration: Math.min(d, 200) }), d + 900); };
    stage.append(b, dl);
  },
};

export function initFeel() {
  const tabs = document.getElementById('feel-kind'), grid = document.getElementById('feel-grid'), out = document.getElementById('feel-result');
  let kind = 'Like button';
  const order = [2, 0, 3, 1]; // shuffled so the answer is not always in the same slot
  const render = () => {
    grid.innerHTML = ''; out.textContent = '';
    tabs.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-checked', c.dataset.k === kind) || c.setAttribute('aria-pressed', c.dataset.k === kind));
    order.forEach((si, i) => {
      const d = SPEEDS[si];
      const card = document.createElement('div'); card.className = 'feel';
      card.innerHTML = `<h3>Option ${'ABCD'[i]}</h3><div class="stage"></div><label><input type="radio" name="feel" value="${si}"> This one</label><span class="ms" hidden>${d} ms</span>`;
      KINDS[kind](card.querySelector('.stage'), d);
      card.querySelector('input').onchange = () => {
        grid.querySelectorAll('.feel').forEach(f => { f.querySelector('.ms').hidden = false; f.classList.toggle('right', f.querySelector('input').value === '1'); });
        out.textContent = si === 1
          ? 'Yes. 200 ms sits in the 100–400 ms range: it responds right away and you can still see the change.'
          : si === 0 ? 'That one is 40 ms. It is so fast it reads as a jump, so the motion tells you nothing. The highlighted one is 200 ms.'
          : `That one is ${d} ms. It looks smooth once, but on the tenth tap you are waiting for it. The highlighted one is 200 ms.`;
      };
      grid.append(card);
    });
  };
  Object.keys(KINDS).forEach(k => {
    const c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = k; c.dataset.k = k; c.setAttribute('role', 'radio');
    c.onclick = () => { kind = k; render(); };
    tabs.append(c);
  });
  render();
}
