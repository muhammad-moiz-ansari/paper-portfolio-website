/* eslint-disable @typescript-eslint/no-require-imports -- Offline diagnostic. */
const fs = require('node:fs'), path = require('node:path');
const sharp = require('sharp');
const root = process.argv[2];
const out = path.join(root, 'visual-diffs'); fs.mkdirSync(out, { recursive: true });
const file = (stage, folder, name) => path.join(root, stage, folder, name);
const matrix = stage => JSON.parse(fs.readFileSync(file(stage, 'visual', 'matrix.json')));
const threshold = { meanMaxChannelDelta: 0.5, maxChannelDelta: 8, fractionOver2: 0.001 };
async function compare(name, a, b, { top = 0, height, strict = true } = {}) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return { name, status: 'missing' };
  const [am,bm] = await Promise.all([a,b].map(p => sharp(p).metadata()));
  if (am.width !== bm.width || am.height !== bm.height) return { name, status: 'dimension mismatch', before: [am.width,am.height], after: [bm.width,bm.height] };
  const width = am.width; height ??= am.height - top;
  const [x,y] = await Promise.all([a,b].map(p => sharp(p).extract({ left: 0, top, width, height }).removeAlpha().raw().toBuffer()));
  const diff = Buffer.alloc(x.length);
  let changed = 0, over2 = 0, max = 0, sum = 0, maxLocation = null;
  for (let i = 0; i < x.length; i += 3) {
    const d = Math.max(Math.abs(x[i]-y[i]), Math.abs(x[i+1]-y[i+1]), Math.abs(x[i+2]-y[i+2]));
    if (d) changed++; if (d > 2) over2++; sum += d;
    if (d > max) { max = d; maxLocation = { x: (i / 3) % width, y: top + Math.floor(i / 3 / width) }; }
    diff[i] = diff[i+1] = diff[i+2] = Math.min(255,d*32);
  }
  const pixels = width * height;
  const values = { meanMaxChannelDelta: sum/pixels, maxChannelDelta: max, fractionOver2: over2/pixels, fractionChanged: changed/pixels };
  await sharp(diff, { raw: { width, height, channels: 3 } }).png().toFile(path.join(out, name + '.png'));
  return { name, crop: { top, width, height }, status: strict ? (Object.keys(threshold).every(k => values[k] <= threshold[k]) ? 'pass' : 'review') : 'dynamic review', maxLocation, ...values };
}
(async () => {
  const b = matrix('before'), a = matrix('after'); const results = [];
  for (const row of a) {
    const prev = b.find(p => p.width === row.width && p.theme === row.theme);
    if (!prev) continue;
    const prefix = `${row.theme}-${row.width}`;
    const staticGeometry = row.geometry.slice(1).map((s,i) => ({ id: s.id, equal: JSON.stringify(s.rect) === JSON.stringify(prev.geometry[i+1].rect), colorEqual: s.background === prev.geometry[i+1].background, textEqual: s.text === prev.geometry[i+1].text }));
    const result = { prefix, staticGeometry, comparisons: [] };
    for (const [name, source, crop] of [['sections','full',{ top: Math.ceil(prev.geometry[0].rect.bottom) }],['header','full',{ height: 60 }],['contact','contact',{}],['expanded','expanded',{ strict: false }],['about','full',{ height: Math.ceil(prev.geometry[0].rect.bottom), strict: false }], ...(row.width < 768 ? [['menu','menu',{ strict: false }]] : [])]) {
      result.comparisons.push(await compare(`${prefix}-${name}`, file('before','visual',`${prefix}-${source}.png`), file('after','visual',`${prefix}-${source}.png`), crop));
    }
    results.push(result);
  }
  const phases = [];
  for (const theme of ['paper','chalkboard']) for (const width of [360,1440]) {
    for (const name of ['notepad-writing','tagline-erasing','tagline-writing','page-flip','next-page','cursor-active','cursor-faded']) {
      const prefix = `${theme}-${width}-${name}`;
      phases.push(await compare(prefix, file('before','phases',prefix+'.png'), file('after','phases',prefix+'.png'), { strict: false }));
    }
  }
  const settled = [];
  for (const theme of ['paper','chalkboard']) for (const width of [360,768,1440]) {
    for (const name of ['contact','expanded', ...(width === 360 ? ['menu'] : [])]) {
      const prefix = `${theme}-${width}-${name}`;
      settled.push(await compare('settled-'+prefix, file('before','settled',prefix+'.png'), file('after','settled',prefix+'.png')));
    }
  }
  fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify({ threshold, results, phases, settled }, null, 2));
  console.log('Geometry matches:', results.every(r => r.staticGeometry.every(x => x.equal && x.colorEqual && x.textEqual)));
  console.log('Settled comparisons:', settled.map(c => [c.name, c.status]));
})().catch(e => { console.error(e); process.exitCode = 1; });
