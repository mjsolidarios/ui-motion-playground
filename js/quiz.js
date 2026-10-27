const Q = [
  ['A dialog takes 1.2 seconds to open. What is the main problem?', ['It is too fast to see', 'Users wait on it every time they open it', 'Dialogs should never animate'], 1, 'Most UI transitions belong in 100–400 ms. Long entrances become waiting time on every use.'],
  ['Which easing usually fits an element entering the screen?', ['ease-in', 'linear', 'ease-out'], 2, 'Ease-out starts fast and settles, so the element arrives quickly and lands gently.'],
  ['In cubic-bezier(x1, y1, x2, y2), what does a y value above 1 produce?', ['An overshoot past the end point', 'A longer duration', 'A delay before starting'], 0, 'Progress goes past 100% and comes back, the “back” or springy look.'],
  ['Which CSS media feature reads the system “Reduce motion” setting?', ['prefers-color-scheme', 'prefers-reduced-motion', 'reduced-transparency'], 1, '@media (prefers-reduced-motion: reduce) lets you swap movement for fades or none.'],
  ['WCAG 2.3.1 says content must not flash more than…', ['3 times per second', '10 times per second', 'once per minute'], 0, 'More than three flashes in one second can trigger seizures.'],
  ['Which tool plays After Effects animations exported as JSON on web and mobile?', ['Rive', 'Lottie', 'GSAP'], 1, 'Lottie plays Bodymovin JSON exports. Rive uses its own editor and state machines.'],
  ['Why reuse the same durations and curves across an app?', ['It makes files smaller', 'Users learn the rhythm and the app feels coherent', 'Browsers require it'], 1, 'Consistent motion tokens make different parts of the app feel like one product.'],
];
export function initQuiz() {
  const form = document.getElementById('quiz-form'), score = document.getElementById('quiz-score');
  const got = new Map();
  Q.forEach(([q, opts, ans, why], i) => {
    const fs = document.createElement('fieldset'); fs.className = 'q';
    fs.innerHTML = `<legend>${i + 1}. ${q}</legend>` + opts.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}"> <span>${o}</span></label>`).join('') + '<p class="fb" aria-live="polite"></p>';
    fs.addEventListener('change', e => {
      const ok = +e.target.value === ans, fb = fs.querySelector('.fb');
      fb.className = 'fb ' + (ok ? 'ok' : 'no');
      fb.textContent = (ok ? 'Correct. ' : `Not quite. The answer is “${opts[ans]}.” `) + why;
      got.set(i, ok);
      const right = [...got.values()].filter(Boolean).length;
      score.textContent = `${right} of ${got.size} answered correctly${got.size === Q.length ? ' (all answered)' : ''}.`;
    });
    form.append(fs);
  });
}
