// 迷雾的逐像素计算。作为 Worker 运行时接收消息；在页面里用 <script> 引入时只提供 FOGCORE（不能用 Worker 时用）。
var FOGCORE = (function () {
  var N = 128, NT = new Float32Array(N * N);
  (function () { var r = 1234567; for (var i = 0; i < N * N; i++) { r = (r * 16807) % 2147483647; NT[i] = r / 2147483647; } })();
  function vn(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf);
    var x0 = xi & (N - 1), y0 = yi & (N - 1), x1 = (x0 + 1) & (N - 1), y1 = (y0 + 1) & (N - 1);
    var a = NT[y0 * N + x0], b = NT[y0 * N + x1], c = NT[y1 * N + x0], e = NT[y1 * N + x1];
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + e) * xf * yf;
  }
  var mask = null, MW = 0, MH = 0, PAD = 0;
  function setMask(m, w, h, pad) { mask = m; MW = w; MH = h; PAD = pad; }
  function sstep(a, b, x) { var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  // 边缘细节：在世界坐标里按缩放挑选几层噪声去扭曲遮罩的采样位置。县界这一级的大弯曲已经烘进了多边形（game.js），
  // 这里补 800 米以下的弯曲，放大一级就多出一层更细的。每层都钉在地面上，平移、缩放时不会漂。
  // L：每个遮罩像素对应多少米。
  function warpLayers(L) {
    var out = [], lam = 800;
    for (var k = 0; k < 7; k++, lam /= 2.2) {
      var px = lam / L;                       // 这一层的波长（遮罩像素）
      var w = sstep(1.5, 4, px);              // 小于两三个像素的层看不出来，淡出
      if (w <= 0) break;
      out.push({ f: 1 / lam, a: Math.min(lam * .22 / L, PAD * .45) * w, s: 11 + k * 7 });
    }
    return out;
  }
  // ox/oy：屏幕左上角的遮罩像素在本级缩放下的世界坐标；gx/gy：同一点以米为单位的世界坐标；L：米/遮罩像素
  function compute(mw, mh, ox, oy, sx, sy, sec, gx, gy, L, a, m) {
    var any = false, layers = warpLayers(L), G = 4, gw = Math.ceil(mw / G) + 2, gh = Math.ceil(mh / G) + 2;
    var WX = new Float32Array(gw * gh), WY = new Float32Array(gw * gh);
    for (var j = 0; j < gh; j++) for (var i = 0; i < gw; i++) {
      var X = gx + i * G * L, Y = gy + j * G * L, dx = 0, dy = 0;
      for (var q = 0; q < layers.length; q++) { var Lr = layers[q]; dx += (vn(X * Lr.f, Y * Lr.f + Lr.s) - .5) * 2 * Lr.a; dy += (vn(X * Lr.f + Lr.s + 50, Y * Lr.f) - .5) * 2 * Lr.a; }
      WX[j * gw + i] = dx; WY[j * gw + i] = dy;
    }
    for (var y = 0; y < mh; y++) {
      var wy = y + oy, fy = y / G, iy = fy | 0, ty = fy - iy;
      for (var x = 0; x < mw; x++) {
        var fx = x / G, ix = fx | 0, tx = fx - ix, g0 = iy * gw + ix, g1 = g0 + gw;
        var dx = (WX[g0] * (1 - tx) + WX[g0 + 1] * tx) * (1 - ty) + (WX[g1] * (1 - tx) + WX[g1 + 1] * tx) * ty;
        var dy = (WY[g0] * (1 - tx) + WY[g0 + 1] * tx) * (1 - ty) + (WY[g1] * (1 - tx) + WY[g1 + 1] * tx) * ty;
        var mx = Math.round(x + PAD + sx + dx), my = Math.round(y + PAD + sy + dy);
        if (mx < 0) mx = 0; else if (mx >= MW) mx = MW - 1; if (my < 0) my = 0; else if (my >= MH) my = MH - 1;
        var vis = mask[my * MW + mx], k = y * mw + x;
        if (vis > .995) continue;
        var wx = x + ox;
        // 横向拉丝：x 方向拉长，两层不同速度往东漂
        var n1 = vn(wx * .012 + sec * .25, wy * .2), n2 = vn(wx * .03 - sec * .4 + 40, wy * .45 + sec * .06), n3 = vn(wx * .08 + sec * .6, wy * 1.1);
        var n = n1 * .5 + n2 * .32 + n3 * .18;
        var f = (1 - vis) + (n - .5) * 1.15;
        var aa = f <= .3 ? 0 : f >= .68 ? 1 : (f - .3) / .38;
        aa = aa * aa * (3 - 2 * aa);
        a[k * 4 + 3] = aa * 255;
        var band = 1 - Math.abs(vis - .45) / .45;
        if (band > 0) {
          var st = vn(wx * .008 - sec * .15, wy * .7) * .6 + vn(wx * .02 + sec * .2, wy * 1.4) * .4;
          var ma = band * band * Math.max(0, st - .35) * 1.6 * (1 - aa * .6);
          if (ma > .01) { var jj = k * 4; m[jj] = 236; m[jj + 1] = 234; m[jj + 2] = 228; m[jj + 3] = Math.min(255, ma * 255); }
        }
        any = true;
      }
    }
    return any;
  }
  return { setMask: setMask, compute: compute };
})();
if (typeof window === 'undefined' && typeof self !== 'undefined') {
  self.onmessage = function (e) {
    var d = e.data;
    if (d.mask) { FOGCORE.setMask(d.mask, d.MW, d.MH, d.PAD); return; }
    var a = new Uint8ClampedArray(d.mw * d.mh * 4), m = new Uint8ClampedArray(d.mw * d.mh * 4);
    var any = FOGCORE.compute(d.mw, d.mh, d.ox, d.oy, d.sx, d.sy, d.sec, d.gx, d.gy, d.L, a, m);
    self.postMessage({ id: d.id, mw: d.mw, mh: d.mh, vx: d.vx, vy: d.vy, z: d.z, any: any, a: a.buffer, m: m.buffer }, [a.buffer, m.buffer]);
  };
}
