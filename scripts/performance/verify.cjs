/* eslint-disable @typescript-eslint/no-require-imports -- Standalone diagnostic tooling. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [stage, root, tooling, mode = 'visual'] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const out = path.join(root, stage, mode);
fs.mkdirSync(out, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2));
const launch = () => chromium.launch({ executablePath: config.chromePath, headless: true });
async function open(browser, width, theme, deterministic = false, reducedMotion = 'no-preference') {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion });
  await ctx.addInitScript(({ theme, deterministic }) => {
    if (theme === 'chalkboard') localStorage.setItem('paper-portfolio-theme', theme);
    if (deterministic) { let seed = 123456; Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296); }
    window.__errors = [];
    new PerformanceObserver(list => { (window.__longTasks ||= []).push(...list.getEntries().map(e => ({ start: e.startTime, duration: e.duration }))); }).observe({ type: 'longtask', buffered: true });
  }, { theme, deterministic });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  // Never submit contact transport in verification.
  await page.route('**/api.emailjs.com/**', route => route.abort());
  if (deterministic) {
    const time = new Date('2026-11-05T12:00:00Z');
    await page.clock.install({ time });
    await page.clock.pauseAt(time);
  }
  await page.goto(config.url, { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  if (deterministic) await page.clock.runFor(1000); else await page.waitForTimeout(3000);
  return { ctx, page, errors };
}
async function visual() {
  const browser = await launch(); const matrix = [];
  try {
    for (const theme of ['paper', 'chalkboard']) for (const width of config.visualWidths) {
      const { ctx, page, errors } = await open(browser, width, theme, true);
      const prefix = `${theme}-${width}`;
      await page.screenshot({ path: path.join(out, `${prefix}-full.png`), fullPage: true, animations: 'allow' });
      for (const t of [1400, 600, 600, 800, 2000]) {
        await page.clock.runFor(t);
        await page.screenshot({ path: path.join(out, `${prefix}-animation-${t}-${await page.evaluate(() => Math.round(performance.now()))}.png`) });
      }
      const geometry = await page.locator('main section').evaluateAll(es => es.map(e => ({ id: e.id, text: e.textContent, rect: e.getBoundingClientRect().toJSON(), background: getComputedStyle(e).backgroundColor })));
      const card = page.locator('#projects [style*="perspective"]').first();
      if (await card.count()) { await card.click(); await page.clock.runFor(500); await page.screenshot({ path: path.join(out, `${prefix}-expanded.png`), fullPage: true }); }
      await page.locator('#contact').scrollIntoViewIfNeeded(); await page.clock.runFor(1000);
      await page.screenshot({ path: path.join(out, `${prefix}-contact.png`) });
      if (width < 768) {
        await page.evaluate(() => window.scrollTo(0, 0));
        const buttons = await page.locator('header button').evaluateAll(es => es.map(e => ({ text: e.textContent, aria: e.getAttribute('aria-label') })));
        save(`${prefix}-header-buttons.json`, buttons);
        const menu = page.locator('header button').first();
        await menu.click(); await page.clock.runFor(500);
        await page.screenshot({ path: path.join(out, `${prefix}-menu.png`) });
      }
      matrix.push({ theme, width, geometry, errors, dataTheme: await page.locator('html').getAttribute('data-theme') });
      await ctx.close(); save('matrix.json', matrix);
    }
  } finally { await browser.close(); }
}
async function traceEnd(cdp, file) {
  const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.end');
  const { stream } = await completed;
  let data = '';
  while (true) { const chunk = await cdp.send('IO.read', { handle: stream }); data += chunk.data; if (chunk.eof) break; }
  await cdp.send('IO.close', { handle: stream }); fs.writeFileSync(file, data);
  const events = JSON.parse(data).traceEvents;
  const main = events.find(e => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
  const selected = events.filter(e => e.ph === 'X' && e.tid === main?.tid && e.pid === main?.pid);
  const sums = {};
  for (const e of selected) sums[e.name] = (sums[e.name] || 0) + (e.dur || 0) / 1000;
  return { mainThread: main && { pid: main.pid, tid: main.tid }, eventDurationMs: sums, note: 'Nested event durations overlap; do not sum categories as total CPU. Frame/drop totals not measured.' };
}
async function runtime() {
  const results = [];
  for (let run = 1; run <= config.runtimeRuns; run++) for (const scenario of ['about-idle', 'cursor', 'scroll-expand', 'below-about']) {
    const browser = await launch();
    try {
      const { page, ctx, errors } = await open(browser, 1440, 'paper');
      await page.mouse.move(-1, -1);
      if (scenario === 'below-about') { await page.locator('#projects').scrollIntoViewIfNeeded(); await page.waitForTimeout(1000); }
      const cdp = await ctx.newCDPSession(page);
      await cdp.send('Tracing.start', { categories: 'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' });
      const start = await page.evaluate(() => performance.now());
      if (scenario === 'cursor') {
        for (let i = 0; i < 200; i++) { await page.mouse.move(100 + i % 100 * 10, 300 + Math.sin(i / 10) * 120); await page.waitForTimeout(50); }
        await page.waitForTimeout(5000);
      } else if (scenario === 'scroll-expand') {
        for (const id of ['about', 'experience', 'skills', 'education', 'projects', 'contact']) { await page.locator('#' + id).scrollIntoViewIfNeeded(); await page.waitForTimeout(1000); }
        const card = page.locator('#projects [style*="perspective"]').first(); if (await card.count()) await card.click();
        await page.waitForTimeout(1000); await page.locator('#about').scrollIntoViewIfNeeded(); await page.waitForTimeout(3000);
      } else await page.waitForTimeout(15000);
      const summary = await traceEnd(cdp, path.join(out, `${scenario}-${run}.trace.json`));
      results.push({ run, scenario, ...summary, longTasks: await page.evaluate(start => (window.__longTasks || []).filter(e => e.start >= start), start), errors });
      save('summary.json', results); console.log(stage, scenario, run);
    } finally { await browser.close(); }
  }
}
(mode === 'runtime' ? runtime() : visual()).catch(e => { save('failure.json', { message: e.message, stack: e.stack }); console.error(e); process.exitCode = 1; });
