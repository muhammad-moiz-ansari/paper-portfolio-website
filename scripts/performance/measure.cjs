/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node diagnostic, outside the application bundle. */
/* Diagnostic only. Usage: node scripts/performance/measure.cjs before|after ARTIFACT_ROOT TOOLING_ROOT */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const crypto = require('node:crypto');
const configBytes = fs.readFileSync(path.join(__dirname, 'config.json'));
const config = JSON.parse(configBytes);
const [stage, artifactRoot, toolingRoot] = process.argv.slice(2);
if (!['before', 'after'].includes(stage) || !artifactRoot || !toolingRoot) throw Error('Expected before|after ARTIFACT_ROOT TOOLING_ROOT');
const { chromium } = require(path.join(toolingRoot, 'node_modules/playwright'));
const extraDesktop = Number(process.env.MEASURE_EXTRA_DESKTOP || 0);
if (!Number.isInteger(extraDesktop) || extraDesktop < 0) throw Error('MEASURE_EXTRA_DESKTOP must be a nonnegative integer');
const out = path.join(artifactRoot, stage, ...(extraDesktop ? ['extra-desktop'] : []));
fs.mkdirSync(out, { recursive: true });
const save = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2));
const launch = () => chromium.launch({ executablePath: config.chromePath, headless: config.headless });
async function context(browser, profile, theme = 'paper', reducedMotion = config.reducedMotion) {
  const ctx = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: profile.deviceScaleFactor, isMobile: profile.mobile || false, hasTouch: profile.mobile || false, reducedMotion });
  if (theme === 'chalkboard') await ctx.addInitScript(() => localStorage.setItem('paper-portfolio-theme', 'chalkboard'));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.clearBrowserCache');
  await cdp.send('Network.clearBrowserCookies');
  await cdp.send('Storage.clearDataForOrigin', { origin: config.url, storageTypes: 'all' });
  return { ctx, page, cdp };
}
async function network(profile) {
  const browser = await launch();
  try {
    const { page, cdp } = await context(browser, profile);
    const requests = new Map(); let cacheHits = 0;
    cdp.on('Network.requestWillBeSent', e => requests.set(e.requestId, { url: e.request.url, type: e.type, wireBytes: 0 }));
    cdp.on('Network.responseReceived', e => { if (/^https?:/.test(e.response.url) && (e.response.fromDiskCache || e.response.fromServiceWorker)) cacheHits++; });
    cdp.on('Network.requestServedFromCache', e => { if (/^https?:/.test(requests.get(e.requestId)?.url || '')) cacheHits++; });
    cdp.on('Network.loadingFinished', e => { if (requests.has(e.requestId)) requests.get(e.requestId).wireBytes = e.encodedDataLength; });
    await page.goto(config.url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(5000);
    const timing = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { ttfbMs: n.responseStart - n.requestStart, loadMs: n.loadEventEnd - n.startTime }; });
    const entries = [...requests.values()].filter(r => /^https?:/.test(r.url));
    return { ...timing, wireBytes: entries.reduce((n, r) => n + r.wireBytes, 0), jsWireBytes: entries.filter(r => r.type === 'Script').reduce((n, r) => n + r.wireBytes, 0), requestCount: entries.length, cacheHits, requests: entries };
  } finally { await browser.close(); }
}
async function main() {
  if (process.env.MEASURE_NETWORK_ONLY === '1') {
    const results = JSON.parse(fs.readFileSync(path.join(out, 'loading.json')));
    for (const r of results) { r.network = await network(config.lighthouse[r.profile]); save('loading-network-verified.json', results); }
    return;
  }
  save('manifest.json', { stage, config, supplementalDesktopRuns: extraDesktop, configSHA256: crypto.createHash('sha256').update(configBytes).digest('hex'), date: new Date().toISOString(), playwright: require(path.join(toolingRoot, 'node_modules/playwright/package.json')).version });
  // Warm both themes, all sections and image optimizer outside measured runs.
  const warm = await launch();
  try {
    for (const theme of ['paper', 'chalkboard']) {
      const { page } = await context(warm, config.lighthouse.desktop, theme);
      await page.goto(config.url, { waitUntil: 'networkidle' });
      for (const id of ['about', 'experience', 'skills', 'education', 'projects', 'contact']) { await page.locator('#' + id).scrollIntoViewIfNeeded(); await page.waitForTimeout(300); }
    }
  } finally { await warm.close(); }
  const { default: lighthouse } = await import(pathToFileURL(path.join(toolingRoot, 'node_modules/lighthouse/core/index.js')));
  const chromeLauncher = await import(pathToFileURL(path.join(toolingRoot, 'node_modules/chrome-launcher/dist/index.js')));
  const results = [];
  for (const [name, p] of Object.entries(config.lighthouse).filter(([k]) => ['mobile', 'desktop'].includes(k))) {
    if (extraDesktop && name !== 'desktop') continue;
    for (let run = 1; run <= (extraDesktop || config.runs); run++) {
      const chrome = await chromeLauncher.launch({ chromePath: config.chromePath, chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions'] });
      try {
        const r = await lighthouse(config.url, { port: chrome.port, output: ['html', 'json'], onlyCategories: ['performance'], formFactor: name === 'mobile' ? 'mobile' : 'desktop', screenEmulation: { width: p.width, height: p.height, deviceScaleFactor: p.deviceScaleFactor, mobile: p.mobile, disabled: false }, throttlingMethod: config.lighthouse.throttlingMethod, throttling: { rttMs: p.rttMs, throughputKbps: p.throughputKbps, cpuSlowdownMultiplier: p.cpuSlowdownMultiplier }, disableStorageReset: false });
        fs.writeFileSync(path.join(out, `${name}-${run}.html`), r.report[0]);
        fs.writeFileSync(path.join(out, `${name}-${run}.json`), r.report[1]);
        const a = r.lhr.audits;
        const values = Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(k => [k, a[k].numericValue]));
        results.push({ profile: name, run, ...values, score: r.lhr.categories.performance.score * 100, network: await network(p) });
        save('loading.json', results);
        console.log(stage, name, run, values);
      } finally { await chrome.kill(); }
    }
  }
}
main().catch(e => { save('failure.json', { message: e.message, stack: e.stack }); console.error(e); process.exitCode = 1; });
