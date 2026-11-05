/* eslint-disable @typescript-eslint/no-require-imports -- Standalone diagnostic tooling. */
const fs = require('node:fs'), path = require('node:path');
const root = process.argv[2];
const read = stage => JSON.parse(fs.readFileSync(path.join(root, stage, fs.existsSync(path.join(root, stage, 'loading-network-verified.json')) ? 'loading-network-verified.json' : 'loading.json')));
const before = read('before'), after = read('after');
const extra = stage => { const p = path.join(root, stage, 'extra-desktop', 'loading.json'); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p)) : []; };
const [extraBefore, extraAfter] = [extra('before'), extra('after')];
if (extraBefore.length !== extraAfter.length) throw Error('Supplemental desktop sets must contain equal run counts');
before.push(...extraBefore); after.push(...extraAfter);
const median = a => { const s = [...a].sort((a, b) => a - b); const i = Math.floor(s.length / 2); return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2; };
const summary = a => ({ runs: a, median: median(a), min: Math.min(...a), max: Math.max(...a) });
const fields = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index', 'score', 'network.ttfbMs', 'network.loadMs', 'network.wireBytes', 'network.jsWireBytes', 'network.requestCount'];
const get = (r, key) => key.split('.').reduce((r, k) => r[k], r);
const comparison = [];
for (const profile of ['mobile', 'desktop']) for (const metric of fields) {
  const b = summary(before.filter(r => r.profile === profile).map(r => get(r, metric)));
  const a = summary(after.filter(r => r.profile === profile).map(r => get(r, metric)));
  comparison.push({ profile, metric, before: b, after: a, delta: a.median - b.median, improvementPercent: metric === 'score' || metric === 'cumulative-layout-shift' || b.median === 0 ? null : (b.median - a.median) / b.median * 100 });
}
fs.writeFileSync(path.join(root, 'comparison.json'), JSON.stringify(comparison, null, 2));
console.table(comparison.map(({ profile, metric, before, after, delta, improvementPercent }) => ({ profile, metric, before: before.median, after: after.median, delta, improvementPercent })));
