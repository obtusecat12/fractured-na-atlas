// node tools/game/bench_map.js  （先 npm i canvas）
// 用真实的 region.js / towns.js 计时生成卫星图块，并把四块图拼成 bench_tiles.png，改 map.js 前后各跑一次对比。
const fs = require('fs'), path = require('path'), vm = require('vm'), Cv = require('canvas');
const G = path.join(__dirname, '..', '..', 'site', 'game');
const ctx = { console, Math, Date, JSON, Object, Array, Float32Array, Uint8ClampedArray, performance: { now: () => Number(process.hrtime.bigint()) / 1e6 },
  document: { createElement: () => Cv.createCanvas(1, 1) }, Image: Cv.Image };
vm.createContext(ctx);
['region.js', 'towns.js', 'map.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(G, f), 'utf8') + '\n;this.REGION=typeof REGION!=="undefined"?REGION:this.REGION;this.TOWNS=typeof TOWNS!=="undefined"?TOWNS:this.TOWNS;this.MAP=typeof MAP!=="undefined"?MAP:this.MAP;', ctx));
const M = ctx.MAP, spots = [[-110.1582, 34.9022, 'Holbrook'], [-110.0298, 34.2542, 'Show Low'], [-110.6974, 35.0242, 'Winslow'], [-109.93, 34.1425, 'Pinetop']];
for (const z of [8, 10, 12, 13, 14, 15, 16, 17]) {
  let tot = 0, mx = 0, n = 0;
  for (const s of spots) { const tx = Math.floor(M.wx(s[0], z) / 256), ty = Math.floor(M.wy(s[1], z) / 256); M.tile(z, tx, ty); const t0 = ctx.performance.now(); M.pump(1, null); const dt = ctx.performance.now() - t0; tot += dt; n++; mx = Math.max(mx, dt); }
  console.log('z' + z, 'avg ' + (tot / n).toFixed(1) + ' ms', 'max ' + mx.toFixed(1) + ' ms');
}
const out = Cv.createCanvas(1024, 256), o = out.getContext('2d');
[[-110.1582, 34.9022, 12], [-110.1582, 34.9022, 15], [-110.0298, 34.2542, 16], [-109.93, 34.1425, 17]].forEach((s, i) => {
  const z = s[2], tx = Math.floor(M.wx(s[0], z) / 256), ty = Math.floor(M.wy(s[1], z) / 256); M.tile(z, tx, ty); M.pump(1, null);
  const im = M.peek ? M.peek(z, tx, ty) : M.tile(z, tx, ty); if (im) o.drawImage(im, i * 256, 0, 256, 256);
});
fs.writeFileSync('bench_tiles.png', out.toBuffer('image/png')); console.log('wrote bench_tiles.png');
