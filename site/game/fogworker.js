// fogworker.js — 战争迷雾的逐像素计算（拉丝噪声 + 透明度 + 边缘雾气），在后台线程里算，主线程只负责贴图。
// 与 fog.js 里的 compute() 是同一段算法；fog.js 在不能用 Worker 时（例如 file://）就自己算。
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
// vis(x, y)：屏幕上第 (x, y) 个遮罩像素的可见度；sx/sy 是遮罩建好之后视图又平移了多少（遮罩像素）
function compute(mw, mh, ox, oy, sx, sy, sec, a, m) {
  var any = false;
  for (var y = 0; y < mh; y++) {
    var wy = y + oy, my = y + PAD + sy; if (my < 0) my = 0; else if (my >= MH) my = MH - 1;
    for (var x = 0; x < mw; x++) {
      var mx = x + PAD + sx; if (mx < 0) mx = 0; else if (mx >= MW) mx = MW - 1;
      var vis = mask[my * MW + mx], k = y * mw + x;
      if (vis > .995) continue;
      var wx = x + ox;
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
        if (ma > .01) { var j = k * 4; m[j] = 236; m[j + 1] = 234; m[j + 2] = 228; m[j + 3] = Math.min(255, ma * 255); }
      }
      any = true;
    }
  }
  return any;
}
onmessage = function (e) {
  var d = e.data;
  if (d.mask) { mask = d.mask; MW = d.MW; MH = d.MH; PAD = d.PAD; return; }
  if (!mask) { postMessage({ id: d.id, skip: true }); return; }
  var a = new Uint8ClampedArray(d.mw * d.mh * 4), m = new Uint8ClampedArray(d.mw * d.mh * 4);
  var any = compute(d.mw, d.mh, d.ox, d.oy, d.sx, d.sy, d.sec, a, m);
  postMessage({ id: d.id, mw: d.mw, mh: d.mh, vx: d.vx, vy: d.vy, z: d.z, any: any, a: a.buffer, m: m.buffer }, [a.buffer, m.buffer]);
};
