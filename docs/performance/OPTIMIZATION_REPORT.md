# Paper Portfolio optimization report

Measured November 5–6, 2026 (Asia/Karachi). The experiment compares the original checkout with the final local production build. It does not measure deployment latency, real-user metrics, CDN behavior, or real email delivery.

## Source and environment

- Baseline: `main`, `2edc1bf8ffd74da1117eaf5eb36ff8df4a2e9fd0`, no initial dirty paths. The manifest records all preserved source and asset SHA-256 hashes, including the actual checked-out logo and texture bytes. Original bytes are outside the repository; `.env.local`, build output, dependency directories and local agent settings were excluded from the backup.
- Windows 11 Pro, build 26200, Intel Core i7-8650U, 8 logical processors, 17,052,286,976 bytes reported memory. Node 24.19.0, npm 12.2.1, Next.js 16.3.5, React 19.2.8, Chrome 156.0.8078.80, Playwright 1.56.1, Lighthouse 13.0.1. The diagnostic npm install and lockfile live outside the app; no runtime dependency changed.
- Both builds used `node node_modules/next/dist/bin/next build --webpack` and `node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3100`. The default sandboxed build could not reach Google Fonts; the network-enabled Turbopack retry hit a PostCSS child-process error. The documented webpack fallback built the unchanged source and final source with the existing fonts. No dev server or font substitution was used.
- Raw evidence root: `C:/Users/Dell/.codex/visualizations/2026/11/05/01a1acea-2beb-7122-a544-ff3daca8fde8/portfolio-performance`. It contains `baseline-source/`, `baseline-identity.json`, `before/`, `candidate-rsc-torn-edge/`, `candidate-before-motion-edge-fix/`, `after/`, `asset-experiment/`, and `visual-diffs/`. Copy this directory separately if the evidence needs to travel with the repository. Compact results are in [`results/`](results/).

## Reproduction and cache policy

Follow the pinned commands in [`OPTIMIZATION.md`](../../OPTIMIZATION.md) and the unchanged [`config.json`](../../scripts/performance/config.json). Start a production server for each source state. The harness visits both themes and scrolls all sections once to warm server routes and desktop image optimizer variants. The image optimizer is retained across runs; a mobile size can still miss the warm desktop variants on its first visit. Every loading run starts a fresh Chrome process/profile, with no prior origin state. The separate transfer probes also clear origin storage and cookies and disable HTTP cache through CDP. The primary runs use paper, normal motion and headless Chrome. Cache checks exclude inline `data:` images. This is **cold browser / warm server**, with no CDN involved.

| Profile | Screen | Lighthouse mode | Runtime/transfer browser |
| --- | --- | --- | --- |
| Mobile | 360 × 800 CSS px, DPR 2, mobile and touch for CDP | Simulated 150 ms RTT, 1,638.4 kb/s, 4× CPU | Unthrottled CDP |
| Desktop | 1440 × 900 CSS px, DPR 1, fine pointer | Simulated 40 ms RTT, 10,240 kb/s, 1× CPU | Unthrottled CDP |

Five primary runs per profile per build, plus three matched desktop runs to investigate variable TBT. The extra baseline was built from the preserved bytes in a sibling directory on the same drive, using linked dependencies and the existing build environment loaded in memory. No environment files were copied. Lighthouse HTML and JSON are preserved per run; the JSON includes effective throttling settings and user agents. The network window is navigation through the load event plus five seconds, with a 30-second navigation timeout. Transfer is CDP `Network.loadingFinished.encodedDataLength` for HTTP(S) requests, including response headers and cross-origin responses visible to CDP. JS transfer is the same counter for `Script` requests. These are transfer bytes, distinct from decoded size and from whole-connection overhead. TTFB is Navigation Timing `responseStart − requestStart`; load is `loadEventEnd − startTime`. TBT is navigation lab blocking time, not field INP.

Baseline network captures were repeated with HTTP-only cache accounting; initial data URI-inclusive captures remain in `before/loading.json` and the corrected set is `before/loading-network-verified.json`. One desktop baseline run may have overlapped the beginning of an asset encoder experiment; all runs were retained. Timing and CPU results should be read with the measured spread.

## Loading results

Each row is median [min–max]. Δ is final minus baseline; improvement is calculated from the baseline median. Score changes are points and CLS uses absolute change. [Individual runs, ranges, and deltas](results/loading-comparison.json) are preserved for every metric.

### Mobile: five runs per build

| Metric | Before | Final | Δ | Improvement |
| --- | ---: | ---: | ---: | ---: |
| FCP (ms) | 1832.5 [1820.5–1864.1] | 1837.9 [1821.8–1913.6] | +5.4 | -0.3% |
| LCP (ms) | 24417.8 [24251.9–24471.7] | 22675.3 [22664.5–22800.7] | -1742.5 | 7.1% |
| TBT (ms) | 1902.4 [1684.3–2502.2] | 1009.0 [938.0–1577.3] | -893.4 | 47.0% |
| CLS | 0.002109 [0.002038–0.002261] | 0.001744 [0.001694–0.001814] | -0.000366 | — |
| Speed Index (ms) | 5114.3 [4595.6–5510.5] | 3967.8 [3377.6–4764.8] | -1146.6 | 22.4% |
| Lighthouse score | 42.0 [40.0–44.0] | 50.0 [44.0–52.0] | +8.0 pt | — |
| TTFB (ms) | 15.7 [12.9–21.5] | 15.1 [12.4–17.0] | -0.6 | 3.8% |
| Load event (ms) | 802.8 [600.0–824.9] | 535.8 [424.9–838.2] | -267.0 | 33.3% |
| Total HTTP transfer (bytes) | 5,241,577 [5,241,577–5,241,577] | 4,788,884 [4,788,884–4,788,884] | -452,693 | 8.6% |
| JS HTTP transfer (bytes) | 162,221 [162,221–162,221] | 156,983 [156,983–156,983] | -5,238 | 3.2% |
| HTTP requests | 20 [20–20] | 20 [20–20] | 0 | 0.0% |

### Desktop: eight runs per build

| Metric | Before | Final | Δ | Improvement |
| --- | ---: | ---: | ---: | ---: |
| FCP (ms) | 433.5 [421.0–468.7] | 423.4 [419.1–460.8] | -10.1 | 2.3% |
| LCP (ms) | 4362.3 [4314.0–4385.8] | 4034.5 [4012.7–4055.5] | -327.8 | 7.5% |
| TBT (ms) | 178.6 [73.4–249.1] | 191.0 [162.0–470.0] | +12.4 | -6.9% |
| CLS | 0.000720 [0.000644–0.000792] | 0.000669 [0.000618–0.000763] | -0.000051 | — |
| Speed Index (ms) | 1824.6 [1384.6–1971.3] | 1239.8 [1110.5–2122.9] | -584.8 | 32.1% |
| Lighthouse score | 70.5 [66.0–77.0] | 72.5 [55.0–75.0] | +2.0 pt | — |
| TTFB (ms) | 17.8 [15.1–21.6] | 13.6 [10.3–18.9] | -4.1 | 23.1% |
| Load event (ms) | 822.4 [641.7–1006.6] | 471.6 [403.6–853.9] | -350.8 | 42.7% |
| Total HTTP transfer (bytes) | 5,235,213 [5,235,213–5,235,990] | 4,782,520 [4,782,520–4,782,520] | -452,693 | 8.6% |
| JS HTTP transfer (bytes) | 162,221 [162,221–163,004] | 156,983 [156,983–156,983] | -5,238 | 3.2% |
| HTTP requests | 20 [20–20] | 20 [20–20] | 0 | 0.0% |

HTTP cache hits: **0 before, 0 final** in all 26 transfer runs. The four run manifests have identical configuration hashes. [LCP elements](results/lcp-elements.json) were the About biography paragraph on mobile and the Experience section container on desktop. Simulated mobile LCP remains high even after the reduction; it is a throttled lab result, distinct from the much shorter localhost load event. FCP ranges overlap. TTFB and load-event deltas remain sensitive to local server and CPU state.

Moving the five torn-edge paths into server components initially serialized the SVG paths twice (ten occurrences, five unique; 75,992 uncompressed path characters). It increased document transfer from 26,180 to 46,572 bytes and raised candidate median simulated mobile FCP to 1,971.6 ms. Keeping the small, prerendered TornEdge boundary reduced document transfer to 32,026 bytes and brought FCP back into the baseline range. The final document is still larger, but initial JS and total transfer are lower. Both intermediate candidates and all raw runs were retained.

Desktop TBT was mixed: the primary five-run medians were 233.0 → 357.4 ms, the three supplemental medians were 79.0 → 168.0 ms, and all eight were 178.6 → 191.0 ms (+12.4 ms). The supplemental baseline replay matched all 64 source hashes (0 mismatches); it was rebuilt in a sibling directory, so webpack chunk names changed and JS transfer was 783 bytes larger on the replay. The original primary files were retained. Main-thread work and script bootup were lower on all three supplemental final runs than on all three supplemental baseline runs, even though simulated TBT was higher. Lighthouse CPU calibration also varied substantially (primary desktop before 1,095–1,307, final 618–1,502). The trace and calibration evidence does not isolate the TBT increase to a particular code path, and the desktop TBT increase remains a measured tradeoff, not a speed gain. See [per-run calibration and startup work](results/lighthouse-environment.json).

## Assets

Same intrinsic dimensions and CSS background size, repeat, blend and opacity. AVIF is selected in Chrome; the original JPEGs remain available for browser fallback, so installed public asset storage grows while default-theme transfer falls. No preload policy changed.

| Asset | Dimensions | Original bytes | Selected bytes | Saved bytes | Display/use |
| --- | ---: | ---: | ---: | ---: | --- |
| `cork-dark.jpg` → AVIF | 2400 × 1792 | 510,242 | 460,456 | 49,786 | cover |
| `cork-light.jpg` → AVIF | 2400 × 1792 | 537,430 | 487,603 | 49,827 | cover |
| `crumpled-dark.jpg` → AVIF | 2400 × 1792 | 158,528 | 128,464 | 30,064 | cover |
| `crumpled-light.jpg` → AVIF | 2400 × 1792 | 185,230 | 161,469 | 23,761 | cover |
| `halftone-dark.jpg` → AVIF | 1896 × 1416 | 509,257 | 355,705 | 153,552 | 1000 CSS px, repeat |
| `halftone-light.jpg` → AVIF | 1950 × 1456 | 511,271 | 361,305 | 149,966 | 1000 CSS px, repeat |
| `paper-dark.jpg` | 2400 × 1792 | 79,015 | 79,015 | 0 | unreferenced |
| `paper-light.jpg` | 2752 × 1536 | 53,635 | 53,635 | 0 | cover, Skills and binding |
| `icon.png` | 1563 × 1563 | 3,618,736 | 3,388,501 | 230,235 | lossless PNG; identical decoded pixels |

The logo PNG recompression candidates were larger (light 597,609 → 623,314 bytes, dark 556,254 → 583,872), so both originals were kept. The primary CDP probes used Next image optimizer responses, not those source sizes. Lossless WebP candidates enlarged all eight textures. AVIF quality 50 for cork and quality 60 for halftone/crumpled preserved their dimensions and passed actual-scale comparisons at 360px/DPR 2 and 1440px/DPR 1. The paper candidate was smaller but failed the binding check, so the shared JPEG stays. Smaller tiles were not adopted: the cork and crumples are cover images, and changing the 1000px halftone repeat would change dot scale or repeat structure.

See [asset inventory and actual paper-profile transfer by URL](results/assets.json). Dark variants were checked visually; the primary wire totals are paper only. The unchanged-resolution favicon remains the largest request even after lossless recompression.

## Animation and runtime

Three desktop runs per scenario, same 1440×900 DPR 1 paper profile, normal motion and no CDP throttling. The 15-second About and below-About windows begin after settling. Cursor movement uses 200 fixed coordinates and 50 ms intervals (nominal ten seconds, plus protocol overhead) followed by five seconds idle. The scroll scenario visits all six sections, expands a project card, and returns to About. Per-run renderer thread event durations, ranges, and long tasks are in [runtime-comparison.json](results/runtime-comparison.json); raw Chrome traces are in `before/runtime/` and `after/runtime/`.

Median renderer event durations, in ms, and median long-task counts. These categories can overlap and must not be summed as total CPU time. A zero means no matching duration event on the captured renderer main thread.

| Scenario | Scripting (`FunctionCall`) | Frame callbacks | Style tree | Layout | Paint | Long tasks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| about-idle | 1124.0 → 511.5 | 720.0 → 514.9 | 343.6 → 232.7 | 309.6 → 216.4 | 417.9 → 292.1 | 0 → 0 |
| cursor | 2811.9 → 847.0 | 1943.3 → 870.1 | 808.3 → 275.8 | 636.5 → 238.2 | 895.1 → 373.4 | 2 → 0 |
| scroll-expand | 946.5 → 152.0 | 493.8 → 141.4 | 336.0 → 57.4 | 299.0 → 72.2 | 427.8 → 100.8 | 1 → 0 |
| below-about | 1329.9 → 0.0 | 441.6 → 0.0 | 425.3 → 0.0 | 368.0 → 0.0 | 554.8 → 0.0 | 0 → 0 |

The cursor backing size changed from 1440×4888 to 1440×900 in the desktop probe and from the default 300×150 canvas to 0×0 on coarse touch. The cursor made 90 clears in a 1.5-second About idle probe before, and zero after. In the three final below-About traces only small `RunTask` durations were captured on the renderer main thread; frame callbacks, `FunctionCall` and paint were absent. The offscreen functional probe also found unchanged notepad/tagline styles and zero canvas clears. After scrolling back, writing resumed. Dropped/composited frame rates were **not measured** by this trace configuration. One final first idle trace may have overlapped a halted replay-build attempt; all runs are retained.

## Visual and functional verification

- Both themes at 360, 639, 640, 767, 768, 1023, 1024 and 1440 CSS px: identical measured section geometry and computed backgrounds, and identical static section text. No capture console errors. Static header crops passed at all 16 combinations. The static section comparison starts at the measured About bottom; About and the changed effects have their own unmasked captures and phase review.
- The strict static gate is mean per-pixel max-channel difference ≤0.5/255, at most 0.1% pixels above 2/255, and no pixel above 8/255. Thirteen static section crops passed automatically. Three crops tripped the max-only gate: paper 768 (9), paper 1024 (42), chalkboard 640 (18). At most 0.0053% of pixels in each exceeded 2/255. The original/final/diff sheet shows isolated card/text edge pixels and low-amplitude texture differences, with no observable geometry or artwork change. See `visual-diffs/static-review-sheet.png` and [pixel metrics](results/visual-comparison.json).
- Initial expanded and Contact viewport screenshots were taken at different native CSS transition/scroll offsets, so those pairs were not treated as pixel matches. The additional settled captures compare element-aligned cards and Contact at 360/768/1440 in each theme, plus both 360px mobile menus. All 14 pairs passed; max per-channel difference was 2/255. Card/contact dimensions matched in the settled captures.
- The animated cases use seeded randomness plus a Playwright clock for Date, performance, timers and rAF, and force the page flip's CSS animation to its 300 ms midpoint. The fake clock does not control every native CSS/compositor phase; exact frame equivalence is not claimed. Side-by-side review covers the ink bloom, pencil/eraser reveal and bobbing, page turn and following page, and the active/faded trail in both themes at mobile and desktop. The 600 ms flip is intact. Cursor pixels were present during movement and zero after 250 ms in all four phase probes; faint terminal segment coverage differs with elapsed-time fading. See `before/phases/`, `after/phases/` and `visual-diffs/chalkboard-desktop-phases.png`.
- Verified server-rendered meaningful text; all six desktop nav destinations and active highlights; mobile menu open, navigate and close; card expansion; contact text entry and successful intercepted EmailJS POST; reload persistence; resize, coarse touch and reduced motion; no console errors or failed asset responses on the portfolio and style-guide. EmailJS appeared in a new script request only on mocked submission. No external email was sent. [Functional checks](results/functional-after.json).
- With hydration scripts blocked, saved chalkboard was present on the root before paint on both versions, but the baseline About background and logo still used paper. The final CSS gives the chalkboard About background and correct dark logo without hydration. Default paper remained paper. [Baseline paint](results/initial-paint-before.json) and [final paint](results/initial-paint-after.json).
- The ink canvas stays drawn after reduced-motion resize and resumes drawing on preference change. A reduced-motion change during a 600 ms flip advances to the next page and clears the flip. Synthetic visibility-change input freezes and resumes both writing islands. Headless Chrome did not produce an actual hidden tab on tab switch, so real background-tab verification is **not measured**. [Lifecycle evidence](results/motion-lifecycle.json).

## Checks and scope status

The final webpack production build and `tsc --noEmit` passed; `git diff --check` passed. Full lint still reports the three pre-existing `react-hooks/set-state-in-effect` errors in `theme-toggle.tsx`, `theme-context.tsx` and `use-reduced-motion.ts`, plus three existing unused-variable warnings. Two prior About warnings disappeared in the refactor. No commit, branch switch, push, PR, merge, or deployment was made.

| Optimization | Status | Evidence |
| --- | --- | --- |
| Cursor canvas | Verified | Viewport allocation, no idle clears, visible trail and fade, pointer pass-through, reduced-motion and coarse-pointer fallback. |
| Animation work | Verified in tested scenarios | Writing refs and pausable clocks; offscreen trace work disappears, flip and ink lifecycle pass. Real hidden tab remains unmeasured. |
| Client boundaries | Tradeoff explained | Static sections and narrow islands, 5,238 fewer JS transfer bytes and lazy EmailJS. Restored TornEdge boundary after FCP regression; desktop TBT remains mixed and higher overall. |
| Textures and images | Verified in Chrome | Six actual-scale AVIF replacements with JPEG fallback; original binding texture and logos retained; pixel-identical decoded PNG icon. Old browser format fallback not separately browser-tested. |

## Regression reference

At this fixed configuration, the observed final transfer ceilings are 4,788,884 mobile and 4,782,520 desktop HTTP bytes, including the favicon; JS is 156,983 bytes and 20 requests in both profiles. Investigate any unexplained growth with the same window. The final About idle `FunctionCall` reference is 511.5 ms median (472.7–705.3 ms), and below-About captured frame callbacks are zero. Timing references are lab ranges, not service objectives: rerun repeated medians outside the accepted range on a stable host, especially for desktop TBT. Future changes need the relevant visual and interaction checks and a measured reason to rebaseline.

The study used one Windows machine, Chrome headless and mobile emulation. Real devices, other browser engines, production/CDN latency, field INP, frame drops, and live email delivery were not measured. The app favicon still dominates transfer; further visual-safe reduction would need a separate evaluation.

