/* eslint-disable @typescript-eslint/no-require-imports -- Diagnostic only. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, 'functional'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const epoch = new Date('2026-11-05T12:00:00Z');
    await page.clock.install({ time: epoch }); await page.clock.pauseAt(epoch);
    await page.goto(config.url, { waitUntil: 'load' });
    await page.clock.runFor(550);
    const snap = () => page.locator('#about').evaluate(e => [...e.querySelectorAll('[style]')].map(x => x.getAttribute('style')));
    const setHidden = hidden => page.evaluate(value => {
      if (value) Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      else delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
    await setHidden(true);
    const paused = await page.locator('#about [data-animation-paused]').count();
    const frozen = await snap(); await page.clock.runFor(1300);
    const unchanged = JSON.stringify(frozen) === JSON.stringify(await snap());
    await setHidden(false); await page.clock.runFor(700);
    const resumed = JSON.stringify(frozen) !== JSON.stringify(await snap());
    const pageNumber = () => page.locator('#about [style*="perspective"]').getByText(/^page \d+ \/ \d+$/i).innerText();
    const initial = await pageNumber();
    let sawFlip = false;
    for (let tick = 0; tick < 110; tick++) {
      await page.clock.runFor(100);
      if (await page.locator('#about .animate-page-flip').count()) { sawFlip = true; break; }
    }
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.clock.runFor(4000);
    const held = await pageNumber();
    const flipCleared = await page.locator('#about .animate-page-flip').count() === 0;
    const canvas = page.locator('#about canvas');
    const hasPixels = () => canvas.evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((x,i) => i % 4 === 3 && x));
    const staticInkDrawn = await hasPixels();
    await page.getByRole('button', { name: 'Next notepad page' }).click();
    const turned = await pageNumber();
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.clock.runFor(100);
    const resumedInkDrawn = await hasPixels(); const frame = await canvas.evaluate(c => c.toDataURL());
    await page.clock.runFor(350);
    const inkMoves = frame !== await canvas.evaluate(c => c.toDataURL());
    const result = { visibilityInput: 'synthetic visibilitychange with document.hidden override (actual tab backgrounding was unavailable)', pausedIslands: paused, unchanged, resumed, sawFlip, pageBeforePreferenceChange: initial, pageAfterPreferenceChange: held, pageAfterManualTurn: turned, flipCleared, staticInkDrawn, resumedInkDrawn, inkMoves };
    fs.writeFileSync(path.join(out, 'lifecycle.json'), JSON.stringify(result, null, 2)); console.log(result);
    if (!(paused === 2 && unchanged && resumed && sawFlip && held.toLowerCase() === initial && turned !== held && flipCleared && staticInkDrawn && resumedInkDrawn && inkMoves)) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
