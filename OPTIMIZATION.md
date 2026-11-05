# Portfolio performance and visual preservation

Read this guide before editing the site. Preserve paper and chalkboard colors, fonts, texture scale, grain, opacity, borders, torn edges, responsive layout, content, and visible animation paths and timings. Check both themes, including saved chalkboard at first paint. Keep the current navigation, cards, form, cursor fallback, and reduced-motion behavior. Intentional design changes require user review.

## Architecture

- `src/app/page.tsx` composes server-rendered sections. The cursor and theme providers accept server-rendered `children`; keep static modules out of their client imports. Keep scroll tracking in `site-header.tsx`, writing in the notepad/tagline islands, interaction in cards and buttons, and submission in `contact-form.tsx`. Give those islands serializable props or server-rendered slots. `TornEdge` deliberately stays a small client boundary that also prerenders: serializing all five large paths into the server component payload duplicated them in the initial document and regressed simulated FCP. Check actual transfer and HTML when moving a boundary.
- Use the root `data-theme` selectors and variables in `src/app/globals.css` for presentation. The blocking script in `src/app/layout.tsx` applies saved chalkboard before hydration. Use a theme hook when browser behavior or drawing needs it; avoid one solely to choose static markup or classes. Preserve the styled values in both themes.
- Keep meaningful headings, bio, section content and links in the initial HTML. Import noncritical libraries at the interaction that needs them, as the form does for EmailJS. Confirm that the library's chunk is absent on initial load and present when needed. Preserve loading/error states. Do not send an actual message in tests.

## Motion and assets

- React owns discrete writing phases, phrases and pages. `use-visible-timeline.ts` pauses clocks offscreen and in hidden tabs, cancels native callbacks, and resumes with the remaining time. Write continuous reveal and sprite positions via refs with no per-frame React updates or layout reads. Preserve blank-line delays, clip geometry, bobbing and page flip keyframes. Cancel every scheduled callback, including nested timers, and disconnect observers/listeners on cleanup. Verify Strict Mode setup/cleanup, preference changes and restart; decorative motion must earn any per-frame React work with measured evidence.
- The cursor uses viewport coordinates and a fixed canvas at the existing stacking level. Keep it transparent and noninteractive. Use one backing pixel per CSS pixel for its original line weight; reconsider DPR only with memory and visual evidence. Start only on movement, stop once faded and cleared, and reset on scrolling, resize, hidden tabs and pointer capability changes. Avoid large buffers on coarse pointers and respect reduced motion. Keep ink intersection gating; verify its static redraw on resize and theme changes and its restart when motion is restored.
- CSS background images bypass `next/image`. Preserve intrinsic size, the CSS repeat or cover scale, blend, opacity, alpha and actual visible grain. Evaluate WebP/AVIF or lossless encodings in the browser at the displayed scale, including seams and both themes. For the current cork, halftone and crumpled assets use AVIF with JPEG fallbacks. Keep the paper binding's JPEG unless a candidate passes the binding and Skills comparisons. Check `/style-guide` too. Prefer pixel-identical recompression for icons and distinguish file bytes from optimized `/_next/image` transfer. Keep preloads limited to resources with measured critical-path benefit; avoid fetching both themes unnecessarily.

## Reproduce and verify

Use Node 24.19.0, npm 12.2.1, Next.js 16.3.5, Chrome 156.0.8078.80, Playwright 1.56.1 and Lighthouse 13.0.1 to compare with this handoff. See [`scripts/performance/config.json`](scripts/performance/config.json) for the pinned profiles. Use the same OS/hardware, build mode, browser, throttling, viewport, theme, observation window and run counts on both sides. Update the Chrome path for the host before collecting either side.

```powershell
npm ci
node node_modules/next/dist/bin/next build --webpack
node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3100
```

From another terminal, use a directory outside the repo for tooling and raw evidence (`$artifactRoot` is an absolute path):

```powershell
npm install --prefix "$artifactRoot/tooling" --no-audit --no-fund playwright@1.56.1 lighthouse@13.0.1
node scripts/performance/measure.cjs before "$artifactRoot" "$artifactRoot/tooling"
node scripts/performance/verify.cjs before "$artifactRoot" "$artifactRoot/tooling" visual
node scripts/performance/verify.cjs before "$artifactRoot" "$artifactRoot/tooling" runtime
node scripts/performance/functional.cjs before "$artifactRoot" "$artifactRoot/tooling"
node scripts/performance/phases.cjs before "$artifactRoot" "$artifactRoot/tooling"
node scripts/performance/paint.cjs before "$artifactRoot" "$artifactRoot/tooling"
```

Repeat with `after` against the new production build, then run `node scripts/performance/compare.cjs "$artifactRoot"` and `node scripts/performance/visual-diff.cjs "$artifactRoot"`. Run profiling tasks sequentially. Save the baseline before changing implementation or assets: record HEAD, dirty paths and SHA-256 hashes, and keep original modified bytes. Never copy secrets. A fresh Chrome process/profile supplies cold browser storage and HTTP cache; the harness warms the production server and Next image optimizer before measurement. This is **cold browser / warm server**, not a CDN cache experiment. Use Lighthouse simulated metrics separately from unthrottled CDP transfer through load plus five seconds. Preserve all individual runs; navigation TBT is a lab metric and is not INP.

Use `node scripts/performance/lifecycle.cjs after "$artifactRoot" "$artifactRoot/tooling"` when changing motion scheduling. It checks pause/resume with a synthetic visibility event and toggles reduced motion mid-flip. Use a headed browser for an actual background-tab check. The tooling directory's saved npm lockfile pins transitive measurement dependencies for later reruns.

When a timing result is ambiguous, collect the same number of additional runs on both builds and preserve the original runs. Set `$env:MEASURE_EXTRA_DESKTOP = '3'` before invoking `measure.cjs` for the supplemental desktop set; clear that setting for the ordinary suite. `settled.cjs` provides aligned card, contact and mobile menu screenshots when the full-page captures land at different transition positions.

Run production build, type checks, and lint; compare with known baseline failures. Review static geometry and pixel differences at 360px, around the 640/768/1024 breakpoints, and desktop. Inspect controlled notepad, ink, tagline and cursor phases separately. Exercise nav/active section, mobile menu, reload/theme persistence, card expansion, contact UI, resize, preference changes, and console/asset errors. Keep seeded randomness, fake clocks, request interception and tracing in `scripts/performance`; none belongs in production. Save screenshots/diffs, raw Lighthouse reports and traces outside `.next` and `public`.

At the accepted benchmark settings, the observed ceilings are 4,788,884 HTTP bytes mobile and 4,782,520 desktop, including the favicon; both use 156,983 JS bytes and 20 HTTP requests. About idle scripting was 511.5 ms median in the 15-second trace, and no frame callbacks were captured below About. Use these as local references. The measured timing ranges in [the optimization report](docs/performance/OPTIMIZATION_REPORT.md) are the variability tolerance; repeated medians outside them need investigation before accepting a change. Rebaseline deliberately with the reason, old/new evidence, and any approved visual changes. A guide is only effective when the agent or tool loads repository instructions; Markdown cannot enforce these rules on tools that ignore them.
