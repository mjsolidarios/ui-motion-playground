# Motion playground

Companion web app for the slides "UI Animation: Principles, Tools & Examples" (BSEMC, WVSU CICT).

Sections:
- **Easing editor**: drag two handles of a `cubic-bezier()` curve (mouse, touch, or arrow keys; Shift moves farther), presets including a spring (`linear()`), 50–2000 ms duration, compare with a second curve, copy the CSS.
- **Five do's and don'ts**: a working Do and Don't demo for each rule from slides 20–25, with sliders where duration matters.
- **Duration test**: like button, toggle, and modal at 40 / 200 / 700 / 1600 ms; pick the one that feels right.
- **Quiz**: 7 questions with instant feedback.
- **Reduce motion**: follows the OS setting, with an in-page toggle that overrides it (saved in localStorage). The flashing demo is click-only, 3 low-contrast flashes at 2 per second, and disabled while Reduce motion is on.

Plain HTML, CSS, and JavaScript modules. No build step, no dependencies (fonts load from Google Fonts).

## Run locally
```
cd ui-motion-playground
python3 -m http.server 8000      # or: npx serve .
```
Open http://localhost:8000. (Opening index.html directly from disk will not work because browsers block ES modules on file://.)

## Deploy to Vercel
**CLI:** `npm i -g vercel`, then inside this folder run `vercel` (preview) and `vercel --prod`. When asked, choose "Other" as the framework, leave the build command empty, and use `.` as the output directory.

**GitHub:** push this folder to a repo, then on vercel.com choose Add New > Project > Import that repo. Framework preset: Other. No build command. Deploy.
