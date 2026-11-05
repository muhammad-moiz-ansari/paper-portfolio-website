/* eslint-disable @typescript-eslint/no-require-imports -- Standalone browser asset comparison. */
const fs = require('node:fs'), path = require('node:path');
const config = require('./config.json');
const [root, tooling] = process.argv.slice(2);
const { chromium } = require(path.join(tooling, 'node_modules/playwright'));
const sharp = require('sharp');
const out = path.join(root, 'asset-experiment');
const shots = path.join(out, 'browser'); fs.mkdirSync(shots, { recursive: true });
const study = process.env.TEXTURE_STUDY || 'default';
const rows = JSON.parse(fs.readFileSync(path.join(out, study === 'cork' ? 'texture-cork-results.json' : 'texture-results.json'))).filter(r => study !== 'binding' || r.path.endsWith('paper-light.jpg'));
const usage = { cork: 'experience', halftone: 'projects', crumpled: 'contact', paper: 'skills' };
async function diff(a, b, dest) {
  const [x,y] = await Promise.all([a,b].map(p => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  if (!x.info.width || x.info.width !== y.info.width || x.info.height !== y.info.height) throw Error('Image dimensions changed');
  const pixels = x.info.width * x.info.height; let over2 = 0, max = 0, sum = 0;
  const raw = Buffer.alloc(pixels * 3);
  for (let i = 0; i < raw.length; i += 3) {
    const d = Math.max(...[0,1,2].map(j => Math.abs(x.data[i+j] - y.data[i+j])));
    sum += d; max = Math.max(max,d); if (d > 2) over2++;
    raw[i] = Math.min(255, d * 32); raw[i+1] = raw[i]; raw[i+2] = raw[i];
  }
  await sharp(raw, { raw: { width: x.info.width, height: x.info.height, channels: 3 } }).png().toFile(dest);
  return { meanMaxChannelDelta: sum/pixels, maxChannelDelta: max, fractionOver2: over2/pixels, pass: max <= 8 && over2/pixels <= 0.001 && sum/pixels <= 0.5 };
}
(async () => {
  const browser = await chromium.launch({ executablePath: config.chromePath, headless: true });
  const results = [];
  try {
    for (const row of rows) {
      const original = path.basename(row.path);
      if (original === 'paper-dark.jpg') continue; // No current route references it.
      const [type, variant] = original.replace('.jpg', '').split('-');
      const candidate = row.candidates.find(c => c.format === 'avif');
      if (candidate.bytes >= row.bytes) continue;
      for (const width of [360, 1440]) for (const theme of type === 'paper' ? ['paper','chalkboard'] : [variant === 'dark' ? 'chalkboard' : 'paper']) {
        const prefix = `${study}-${type}-${variant}-${width}-${theme}`;
        const files = [];
        for (const converted of [false, true]) {
          const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: width === 360 ? 2 : 1, reducedMotion: 'reduce' });
          if (theme === 'chalkboard') await ctx.addInitScript(() => localStorage.setItem('paper-portfolio-theme', 'chalkboard'));
          const page = await ctx.newPage();
          let fulfilled = false;
          if (converted) await page.route(`**/textures/${original}`, r => { fulfilled = true; return r.fulfill({ path: candidate.path, contentType: 'image/avif' }); });
          await page.goto(config.url, { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready);
          const file = path.join(shots, `${prefix}-${converted ? 'candidate' : 'original'}.png`);
          const target = study === 'binding' ? '#about [class*="rounded-t-md"][class*="h-10"]' : '#' + usage[type];
          await page.locator(target).screenshot({ path: file, animations: 'disabled' });
          if (converted && !fulfilled) throw Error(`${original} was not requested`);
          files.push(file); await ctx.close();
        }
        const result = { original, width, theme, ...await diff(...files, path.join(shots, `${prefix}-diff.png`)) };
        results.push(result); console.log(result);
        fs.writeFileSync(path.join(out, study === 'default' ? 'browser-results.json' : `browser-${study}-results.json`), JSON.stringify(results, null, 2));
      }
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
