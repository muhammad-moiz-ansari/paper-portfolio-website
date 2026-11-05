/* eslint-disable @typescript-eslint/no-require-imports -- Diagnostic-only browser instrumentation. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, 'functional'); fs.mkdirSync(out, { recursive: true });
const checks = [];
const record = (name, value) => { checks.push({ name, ...value }); fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(checks, null, 2)); console.log(name, value); };
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => {
      window.__canvasClears = { cursor: 0, ink: 0 };
      const original = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (...args) {
        if (this.canvas.parentElement?.classList.contains('pencil-cursor')) window.__canvasClears.cursor++;
        else if (this.canvas.closest('#about')) window.__canvasClears.ink++;
        return original.apply(this, args);
      };
    });
    const page = await ctx.newPage(); const errors = []; const badResponses = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) badResponses.push({ url: r.url(), status: r.status() }); });
    let transportCalls = 0;
    const scriptRequests = [];
    page.on('request', r => { if (r.resourceType() === 'script' && r.url().startsWith(config.url)) scriptRequests.push(r.url()); });
    await page.route('**/api.emailjs.com/**', route => {
      if (route.request().method() === 'POST') transportCalls++;
      return route.fulfill({ status: 200, contentType: 'text/plain', body: 'OK', headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST,OPTIONS', 'access-control-allow-headers': 'content-type' } });
    });
    await page.goto(config.url, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
    record('server-rendered-content', { pass: (await (await ctx.request.get(config.url)).text()).includes('CS undergrad at FAST NUCES') });
    for (const id of ['experience', 'skills', 'education', 'projects', 'contact', 'about']) {
      await page.locator(`header a[href="#${id}"]`).last().click(); await page.waitForTimeout(1000);
      const active = await page.locator('header nav a.font-bold').first().getAttribute('href', { timeout: 3000 }).catch(() => null);
      record(`navigation-${id}`, { pass: await page.locator('#' + id).evaluate(e => { const r = e.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 60; }), active, activePass: active === '#' + id });
    }
    const card = page.locator('#projects [style*="perspective"]').first();
    await card.scrollIntoViewIfNeeded(); const closed = await card.innerText(); await card.click(); await page.waitForTimeout(500);
    record('card-expansion', { pass: (await card.innerText()) !== closed, before: closed, after: await card.innerText() });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact input').nth(0).fill('Diagnostic only'); await page.locator('#contact input').nth(1).fill('diagnostic@example.invalid'); await page.getByPlaceholder('Write something...').fill('Transport must never be submitted.');
    record('contact-input', { pass: await page.locator('#contact input').nth(0).inputValue() === 'Diagnostic only', transportCalls });
    const scriptsBeforeSubmit = scriptRequests.length;
    await page.locator('#contact form button').click();
    const mockSuccess = await page.getByText('Message Sent!', { exact: false }).isVisible().catch(() => false) || await page.getByText('Message Sent!', { exact: false }).waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false);
    record('contact-mocked-submission', { pass: mockSuccess && transportCalls === 1, mockSuccess, interceptedPosts: transportCalls, scriptsLoadedOnSubmit: scriptRequests.slice(scriptsBeforeSubmit) });
    await page.locator('header button').last().click();
    await page.waitForTimeout(400); const theme = await page.locator('html').getAttribute('data-theme');
    await page.reload({ waitUntil: 'load' });
    const initialTheme = await page.locator('html').getAttribute('data-theme'); await page.waitForTimeout(1000);
    record('theme-persistence', { pass: theme === 'chalkboard' && initialTheme === 'chalkboard', theme, initialTheme });
    await page.setViewportSize({ width: 360, height: 800 }); await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Open navigation menu' }).click();
    record('mobile-menu-open', { pass: await page.getByRole('button', { name: 'Close navigation menu' }).getAttribute('aria-expanded') === 'true' });
    await page.locator('header a[href="#projects"]').first().click(); await page.waitForTimeout(1000);
    record('mobile-menu-navigation-close', { pass: await page.getByRole('button', { name: 'Open navigation menu' }).getAttribute('aria-expanded') === 'false' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator('#about').scrollIntoViewIfNeeded(); await page.mouse.move(-1, -1); await page.waitForTimeout(1000);
    const cursor = page.locator('.pencil-cursor > canvas');
    record('cursor-allocation', { dimensions: await cursor.evaluate(e => ({ width: e.width, height: e.height, cssPosition: getComputedStyle(e).position, zIndex: getComputedStyle(e).zIndex, pointerEvents: getComputedStyle(e).pointerEvents })) });
    await page.evaluate(() => { window.__canvasClears = { cursor: 0, ink: 0 }; }); await page.waitForTimeout(1500);
    record('idle-canvas-callbacks-1500ms', { counts: await page.evaluate(() => window.__canvasClears) });
    await page.mouse.move(100, 150); for (let i = 0; i < 30; i++) { await page.mouse.move(100 + i * 12, 150 + i % 10); await page.waitForTimeout(10); }
    await page.waitForTimeout(500); await page.evaluate(() => { window.__canvasClears.cursor = 0; }); await page.waitForTimeout(500);
    record('cursor-after-fade-500ms', { clears: await page.evaluate(() => window.__canvasClears.cursor), transparent: await cursor.evaluate(c => !c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((x, i) => i % 4 === 3 && x)) });
    await page.locator('#projects').scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
    const snapshot = () => page.locator('#about').evaluate(e => ({ text: e.innerText, styles: [...e.querySelectorAll('[style]')].map(x => x.getAttribute('style')), clears: window.__canvasClears }));
    const beforeOffscreen = await snapshot(); await page.waitForTimeout(3000); const afterOffscreen = await snapshot();
    record('offscreen-3000ms', { textUnchanged: beforeOffscreen.text === afterOffscreen.text, stylesUnchanged: JSON.stringify(beforeOffscreen.styles) === JSON.stringify(afterOffscreen.styles), clearDelta: Object.fromEntries(Object.keys(beforeOffscreen.clears).map(k => [k, afterOffscreen.clears[k] - beforeOffscreen.clears[k]])) });
    await page.locator('#about').scrollIntoViewIfNeeded(); await page.waitForTimeout(500); const resumed = await snapshot(); await page.waitForTimeout(4000);
    record('animation-resume', { stylesChanged: JSON.stringify(resumed.styles) !== JSON.stringify((await snapshot()).styles) });
    const foreground = await ctx.newPage(); await foreground.bringToFront(); await foreground.waitForTimeout(300);
    const hidden = await page.evaluate(() => document.hidden);
    if (hidden) {
      const beforeHidden = await snapshot(); await foreground.waitForTimeout(1200); const afterHidden = await snapshot();
      record('hidden-tab', { verifiedHidden: true, stylesUnchanged: JSON.stringify(beforeHidden.styles) === JSON.stringify(afterHidden.styles), clearsUnchanged: JSON.stringify(beforeHidden.clears) === JSON.stringify(afterHidden.clears) });
    } else record('hidden-tab', { verifiedHidden: false, reason: 'Headless page remained visible when another tab was brought forward.' });
    await foreground.close(); await page.bringToFront();
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(500);
    record('reduced-motion-cursor', { pass: await cursor.count() === 0 });
    const ink = page.locator('#about canvas');
    const inkPixels = () => ink.evaluate(c => c.toDataURL());
    const staticBefore = await inkPixels(); await page.waitForTimeout(500); const staticAfter = await inkPixels();
    record('reduced-motion-ink-static', { unchanged: staticBefore === staticAfter });
    await page.setViewportSize({ width: 1024, height: 900 }); await page.waitForTimeout(500);
    record('reduced-motion-ink-resize', { drawn: await ink.evaluate(c => c.getContext('2d').getImageData(0, 0, c.width, c.height).data.some((x, i) => i % 4 === 3 && x)) });
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.waitForTimeout(500); const inkBeforeResume = await inkPixels(); await page.waitForTimeout(600);
    record('ink-motion-preference-resume', { changed: inkBeforeResume !== await inkPixels() });
    await page.goto(config.url + '/style-guide', { waitUntil: 'networkidle' });
    for (const t of ['paper', 'chalkboard']) { await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), t); await page.screenshot({ path: path.join(out, `style-guide-${t}.png`), fullPage: true }); }
    record('console-and-assets', { errors, badResponses, transportCalls });
    await ctx.close();
    const touch = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true });
    const tp = await touch.newPage(); await tp.goto(config.url); await tp.waitForTimeout(500);
    record('touch-cursor-allocation', { dimensions: await tp.locator('.pencil-cursor > canvas').evaluate(e => ({ width: e.width, height: e.height })) });
    await touch.close();
  } finally { await browser.close(); }
})().catch(e => { record('failure', { message: e.message, stack: e.stack }); process.exitCode = 1; });
