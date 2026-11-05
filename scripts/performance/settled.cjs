/* eslint-disable @typescript-eslint/no-require-imports -- Diagnostic screenshot alignment. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, 'settled'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  const rows = [];
  try {
    for (const width of [360, 768, 1440]) for (const theme of ['paper', 'chalkboard']) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      if (theme === 'chalkboard') await ctx.addInitScript(() => localStorage.setItem('paper-portfolio-theme', 'chalkboard'));
      const page = await ctx.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(config.url, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
      const prefix = `${theme}-${width}`;
      const card = page.locator('#projects [style*="perspective"]').first();
      await card.scrollIntoViewIfNeeded(); await card.click(); await page.mouse.move(-1, -1);
      await page.waitForTimeout(400);
      const expanded = (await card.innerText()).includes('Click to close');
      await card.screenshot({ path: path.join(out, `${prefix}-expanded.png`), animations: 'disabled' });
      const contact = page.locator('#contact');
      await contact.screenshot({ path: path.join(out, `${prefix}-contact.png`), animations: 'disabled' });
      if (width === 360) {
        await page.getByRole('button', { name: 'Open navigation menu' }).click();
        await page.waitForTimeout(400);
        await page.getByRole('navigation', { name: 'Main navigation' }).screenshot({ path: path.join(out, `${prefix}-menu.png`), animations: 'disabled' });
      }
      rows.push({ theme, width, expanded, card: await card.boundingBox(), contact: await contact.boundingBox(), errors });
      await ctx.close();
    }
    fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(rows, null, 2));
    console.log(stage, rows.map(r => [r.theme, r.width, r.expanded, r.card.width, r.card.height, r.contact.height]));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
