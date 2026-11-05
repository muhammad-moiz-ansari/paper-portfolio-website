/* eslint-disable @typescript-eslint/no-require-imports -- Standalone pre-hydration visual probe. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, 'paint'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  const rows = [];
  try {
    for (const width of [360, 1440]) for (const theme of ['paper', 'chalkboard']) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      await ctx.addInitScript(theme => {
        if (theme === 'chalkboard') localStorage.setItem('paper-portfolio-theme', theme);
        new PerformanceObserver(list => {
          window.__paint = list.getEntries().map(e => ({ name: e.name, startTime: e.startTime, theme: document.documentElement.dataset.theme }));
        }).observe({ type: 'paint', buffered: true });
      }, theme);
      const page = await ctx.newPage();
      await page.route('**/_next/static/chunks/**', r => r.request().resourceType() === 'script' ? r.abort() : r.continue());
      await page.goto(config.url, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, `${theme}-${width}.png`) });
      rows.push(await page.evaluate(({ theme, width }) => ({ theme, width, htmlTheme: document.documentElement.dataset.theme, paint: window.__paint, aboutBackground: getComputedStyle(document.querySelector('#about')).backgroundColor, visibleLogo: [...document.querySelectorAll('header img')].filter(e => getComputedStyle(e).display !== 'none').map(e => new URL(e.currentSrc || e.src).searchParams.get('url')) }), { theme, width }));
      await ctx.close();
    }
    fs.writeFileSync(path.join(out, 'first-paint.json'), JSON.stringify(rows, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
