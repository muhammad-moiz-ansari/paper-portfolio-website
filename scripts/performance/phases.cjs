/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser diagnostics. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, 'phases'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  const result = [];
  try {
    for (const width of [360, 1440]) for (const theme of ['paper', 'chalkboard']) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      await ctx.addInitScript(theme => {
        if (theme === 'chalkboard') localStorage.setItem('paper-portfolio-theme', theme);
        let seed = 123456;
        Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
      }, theme);
      const page = await ctx.newPage();
      const epoch = new Date('2026-11-05T12:00:00Z');
      await page.clock.install({ time: epoch }); await page.clock.pauseAt(epoch);
      await page.goto(config.url, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
      await page.clock.runFor(50);
      const prefix = `${theme}-${width}`;
      const capture = name => page.screenshot({ path: path.join(out, `${prefix}-${name}.png`) });
      const state = () => page.locator('#about').evaluate(e => ({
        time: performance.now(), text: e.innerText,
        clips: [...e.querySelectorAll('[style*="clip-path"]')].map(x => x.style.clipPath),
        sprite: [...e.querySelectorAll('[style*="translateY"]')].map(x => ({ left: x.style.left, transform: x.style.transform })),
      }));
      const row = { theme, width, writing: [], flip: null, cursor: null };
      await page.clock.runFor(600); await capture('notepad-writing'); row.writing.push(await state());
      await page.clock.runFor(1850); await capture('tagline-erasing'); row.writing.push(await state());
      await page.clock.runFor(1300); await capture('tagline-writing'); row.writing.push(await state());
      const pad = page.locator('#about [style*="perspective"]');
      await pad.scrollIntoViewIfNeeded();
      for (let tick = 0; tick < 100; tick++) {
        await page.clock.runFor(100);
        const flip = page.locator('#about .animate-page-flip');
        if (await flip.count()) {
          row.flip = await flip.evaluate(e => e.getAnimations().map(a => { const timing = a.effect.getTiming(); a.pause(); a.currentTime = 300; return { duration: timing.duration, easing: timing.easing }; }));
          await capture('page-flip'); await page.clock.runFor(650); await capture('next-page'); break;
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.clock.runFor(150);
      for (let i = 0; i < 10; i++) {
        await page.locator('.pencil-cursor').dispatchEvent('mousemove', { clientX: 80 + i * 14, clientY: 110 + i * 3 });
        await page.clock.runFor(16);
      }
      const countAlpha = () => page.locator('.pencil-cursor > canvas').evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.reduce((n, x, i) => n + (i % 4 === 3 && x > 0 ? 1 : 0), 0));
      row.cursor = { activePixels: await countAlpha() }; await capture('cursor-active');
      await page.clock.runFor(250); row.cursor.fadedPixels = await countAlpha(); await capture('cursor-faded');
      await ctx.close(); result.push(row);
      fs.writeFileSync(path.join(out, 'states.json'), JSON.stringify(result, null, 2));
      console.log(stage, prefix, row.flip, row.cursor);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
