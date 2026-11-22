// 迷雾的计算：每帧算覆盖范围（哪里有雾、边上怎么被咬开），开始时生成一张可平铺的烟贴图。
// 作为 Worker 运行时接收消息；在页面里用 <script> 引入时只提供 FOGCORE（不能用 Worker 时用）。
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
  function fbm3(x, y) { return vn(x, y) * .5 + vn(x * 1.6 - y * 1.2 + 17.1, x * 1.2 + y * 1.6 + 4.3) * .3 + vn(x * 2.2 + y * 3.2 + 3.7, -x * 3.2 + y * 2.2 + 30.9) * .2; }
  function sstep(a, b, x) { var t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  // ---- 烟贴图 ----
  // 积云状的烟是一团叠一团：先在低频噪声高的地方放大团，再在大团朝上的边缘长出中团，中团边上再长小团，后放的盖在上面、更亮。
  // 每一团是柔和的圆斑，左上受光、右下背光。最后在烟团的边缘沿一个旋转的方向场拖出细丝。贴图四边能接上。
  function smokeTile(TW, TH, seed) {
    var s = seed >>> 0;
    function rnd() { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    function ph(x, y, px, py, k) { x = ((x % px) + px) % px; y = ((y % py) + py) % py; var h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(k, 1274126177); h = Math.imul(h ^ h >>> 13, 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
    function pn(u, v, px, py, k) { var x = u * px, y = v * py, xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = ph(xi, yi, px, py, k), b = ph(xi + 1, yi, px, py, k), c = ph(xi, yi + 1, px, py, k), d = ph(xi + 1, yi + 1, px, py, k); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
    function field(u, v) { return pn(u, v, 4, 2, 1) * .55 + pn(u, v, 8, 4, 2) * .3 + pn(u, v, 16, 8, 3) * .15; }
    var R = new Float32Array(TW * TH), G2 = new Float32Array(TW * TH), Bc = new Float32Array(TW * TH), A = new Float32Array(TW * TH);
    var LI = [253, 253, 254], SH = [158, 168, 181];
    function splat(cx, cy, r, alpha, bias) {
      var rr = r * 2, x0 = Math.floor(cx - rr), x1 = Math.ceil(cx + rr), y0 = Math.floor(cy - rr), y1 = Math.ceil(cy + rr), ir = 1 / (r * r);
      for (var y = y0; y <= y1; y++) {
        var yy = ((y % TH) + TH) % TH, dy = y - cy;
        for (var x = x0; x <= x1; x++) {
          var dx = x - cx, d2 = (dx * dx + dy * dy) * ir; if (d2 >= 4) continue;
          var f = 1 - d2 / 4, g = f * f * f * alpha;
          var sh = .5 - .5 * (dx + dy * 1.15) / (r * 1.5) + bias; sh = sh < 0 ? 0 : sh > 1 ? 1 : sh;
          var i = yy * TW + ((x % TW) + TW) % TW, k = 1 - g;
          R[i] = (SH[0] + (LI[0] - SH[0]) * sh) * g + R[i] * k; G2[i] = (SH[1] + (LI[1] - SH[1]) * sh) * g + G2[i] * k; Bc[i] = (SH[2] + (LI[2] - SH[2]) * sh) * g + Bc[i] * k; A[i] = g + A[i] * k;
        }
      }
    }
    var area = TW * TH / (1024 * 512), bigs = [], meds = [];
    for (var n = 0, tries = 0; n < 70 * area && tries < 4000; tries++) {
      var x = rnd() * TW, y = rnd() * TH, f = field(x / TW, y / TH);
      if (rnd() > sstep(.42, .7, f)) continue;
      var r = 34 + 46 * sstep(.45, .8, f) * (.6 + .4 * rnd()); bigs.push([x, y, r]); splat(x, y, r, .55, -.12); n++;
    }
    bigs.forEach(function (b) {
      var m = 3 + Math.floor(rnd() * 5);
      for (var j = 0; j < m; j++) { var ang = -Math.PI * (.15 + .7 * rnd()) - (rnd() < .3 ? Math.PI * .6 * rnd() : 0), dd = b[2] * (.5 + .5 * rnd()), r = b[2] * (.34 + .26 * rnd()); var x = b[0] + Math.cos(ang) * dd, y = b[1] + Math.sin(ang) * dd; meds.push([x, y, r]); splat(x, y, r, .55, 0); }
    });
    meds.forEach(function (b) {
      var m = 2 + Math.floor(rnd() * 4);
      for (var j = 0; j < m; j++) { var ang = -Math.PI * (.1 + .8 * rnd()), dd = b[2] * (.5 + .5 * rnd()), r = b[2] * (.36 + .3 * rnd()); splat(b[0] + Math.cos(ang) * dd, b[1] + Math.sin(ang) * dd, r, .45, .12); }
    });
    // 薄纱：烟团之间不是空的，铺一层很淡、厚薄不匀的烟
    for (var i0 = 0; i0 < TW * TH; i0++) {
      var u0 = (i0 % TW) / TW, v0 = Math.floor(i0 / TW) / TH, vf = sstep(.36, .6, field(u0, v0) * .75 + pn(u0, v0, 24, 12, 5) * .25) * .1;
      if (vf <= 0) continue; var k0 = 1 - vf, sh0 = .55 + .35 * pn(u0, v0, 12, 6, 6);
      R[i0] = (SH[0] + (LI[0] - SH[0]) * sh0) * vf + R[i0] * k0; G2[i0] = (SH[1] + (LI[1] - SH[1]) * sh0) * vf + G2[i0] * k0; Bc[i0] = (SH[2] + (LI[2] - SH[2]) * sh0) * vf + Bc[i0] * k0; A[i0] = vf + A[i0] * k0;
    }
    // 细丝：从烟团边缘出发，顺着一个慢慢转弯的流场往外拖，越走越宽、越淡；同一处的丝方向一致，不会交叉成网
    for (var w = 0, tw = 0; w < 300 * area && tw < 20000; tw++) {
      var x = rnd() * TW, y = rnd() * TH, f0 = field(x / TW, y / TH); if (f0 < .42 || f0 > .62) continue; w++;
      var steps = 25 + Math.floor(rnd() * 45), rad = 1.8 + rnd() * rnd() * 6, al = .04 + rnd() * .08;
      for (var st = 0; st < steps; st++) {
        var ang = (pn(x / TW, y / TH, 3, 2, 7) - .5) * 2.2 + (pn(x / TW, y / TH, 8, 4, 8) - .5) * .9 - .25;
        x += Math.cos(ang) * 3.4; y += Math.sin(ang) * 3.4;
        var life = 1 - st / steps, br = sstep(.3, .7, pn(x / TW, y / TH, 40, 20, 9 + w % 3));   // 丝时断时续
        splat(x, y, rad * (1.6 - .8 * life), al * Math.sqrt(life) * br * (st < 6 ? st / 6 : 1), .25);
      }
    }
    // 柔化：三次盒式模糊（近似高斯），烟团之间的边界融在一起，不像一颗颗棉球
    function blur(arr, rad) {
      var tmp = new Float32Array(TW * TH), n = rad * 2 + 1;
      for (var y = 0; y < TH; y++) { var s0 = 0; for (var k = -rad; k <= rad; k++) s0 += arr[y * TW + ((k % TW) + TW) % TW]; for (var x = 0; x < TW; x++) { tmp[y * TW + x] = s0 / n; s0 += arr[y * TW + (x + rad + 1) % TW] - arr[y * TW + ((x - rad) % TW + TW) % TW]; } }
      for (var x2 = 0; x2 < TW; x2++) { var s1 = 0; for (var k2 = -rad; k2 <= rad; k2++) s1 += tmp[(((k2 % TH) + TH) % TH) * TW + x2]; for (var y2 = 0; y2 < TH; y2++) { arr[y2 * TW + x2] = s1 / n; s1 += tmp[((y2 + rad + 1) % TH) * TW + x2] - tmp[(((y2 - rad) % TH + TH) % TH) * TW + x2]; } }
    }
    [R, G2, Bc, A].forEach(function (c) { blur(c, 2); blur(c, 2); blur(c, 1); });
    // 烟团边缘被细碎的噪声咬开一点，轮廓不是光滑的圆弧
    for (var i2 = 0; i2 < TW * TH; i2++) { var a2 = A[i2]; if (a2 <= 0 || a2 > .7) continue; var e2 = .7 + .6 * pn((i2 % TW) / TW, Math.floor(i2 / TW) / TH, 48, 24, 14), m2 = 1 - (1 - e2) * (1 - a2 / .7); R[i2] *= m2; G2[i2] *= m2; Bc[i2] *= m2; A[i2] *= m2; }
    var out = new Uint8ClampedArray(TW * TH * 4);
    for (var i = 0; i < TW * TH; i++) { var a = A[i]; if (a <= 0) continue; out[i * 4] = R[i] / a; out[i * 4 + 1] = G2[i] / a; out[i * 4 + 2] = Bc[i] / a; out[i * 4 + 3] = a * 255; }
    return out;
  }

  // ---- 覆盖范围 ----
  var mask = null, MW = 0, MH = 0, PAD = 0;
  function setMask(m, w, h, pad) { mask = m; MW = w; MH = h; PAD = pad; }
  // 边缘细节：在世界坐标里按缩放挑选几层噪声去扭曲遮罩的采样位置（米），放大一级就多一层更细的
  function warpLayers(L) {
    var out = [], lam = 800;
    for (var k = 0; k < 7; k++, lam /= 2.2) {
      var w = sstep(1.5, 4, lam / L);
      if (w <= 0) break;
      out.push({ f: 1 / lam, a: Math.min(lam * .22 / L, PAD * .45) * w, s: 11 + k * 7 });
    }
    return out;
  }
  // ox/oy：屏幕左上角的遮罩像素在本级缩放下的世界坐标；gx/gy：同一点的米制坐标；L：米/遮罩像素。out 写透明度（A 通道）
  function compute(mw, mh, ox, oy, sx, sy, sec, gx, gy, L, out) {
    var any = false, layers = warpLayers(L), G = 4, gw = Math.ceil(mw / G) + 2, gh = Math.ceil(mh / G) + 2;
    var WX = new Float32Array(gw * gh), WY = new Float32Array(gw * gh);
    for (var j = 0; j < gh; j++) for (var i = 0; i < gw; i++) {
      var X = gx + i * G * L, Y = gy + j * G * L, dx = 0, dy = 0;
      for (var q = 0; q < layers.length; q++) { var Lr = layers[q]; dx += (vn(X * Lr.f, Y * Lr.f + Lr.s) - .5) * 2 * Lr.a; dy += (vn(X * Lr.f + Lr.s + 50, Y * Lr.f) - .5) * 2 * Lr.a; }
      WX[j * gw + i] = dx; WY[j * gw + i] = dy;
    }
    var t = sec * .03;
    for (var y = 0; y < mh; y++) {
      var fy = y / G, iy = fy | 0, ty = fy - iy;
      for (var x = 0; x < mw; x++) {
        var fx = x / G, ix = fx | 0, tx = fx - ix, g0 = iy * gw + ix, g1 = g0 + gw;
        var dx = (WX[g0] * (1 - tx) + WX[g0 + 1] * tx) * (1 - ty) + (WX[g1] * (1 - tx) + WX[g1 + 1] * tx) * ty;
        var dy = (WY[g0] * (1 - tx) + WY[g0 + 1] * tx) * (1 - ty) + (WY[g1] * (1 - tx) + WY[g1 + 1] * tx) * ty;
        var mx = Math.round(x + PAD + sx + dx), my = Math.round(y + PAD + sy + dy);
        if (mx < 0) mx = 0; else if (mx >= MW) mx = MW - 1; if (my < 0) my = 0; else if (my >= MH) my = MH - 1;
        var vis = mask[my * MW + mx];
        if (vis > .995) continue;
        // 边上的烟一团一团地退，团的大小和烟贴图里的大团差不多，并且跟着烟慢慢往东飘
        var X = (x + ox) / 36 - t * 1.2, Y = (y + oy) / 36, e = fbm3(X, Y) * .7 + fbm3(X * 2.3 + 9, Y * 2.3) * .3;
        var a = sstep(.18, .9, (1 - vis) * 1.35 + (e - .5) * 1.2);
        if (a < .01) continue;
        out[(y * mw + x) * 4 + 3] = a * 255; any = true;
      }
    }
    return any;
  }
  return { setMask: setMask, compute: compute, smokeTile: smokeTile };
})();
if (typeof window === 'undefined' && typeof self !== 'undefined') {
  self.onmessage = function (e) {
    var d = e.data;
    if (d.mask) { FOGCORE.setMask(d.mask, d.MW, d.MH, d.PAD); return; }
    if (d.tile) { var px = FOGCORE.smokeTile(d.TW, d.TH, d.seed); self.postMessage({ tile: d.tile, TW: d.TW, TH: d.TH, a: px.buffer }, [px.buffer]); return; }
    var a = new Uint8ClampedArray(d.mw * d.mh * 4);
    var any = FOGCORE.compute(d.mw, d.mh, d.ox, d.oy, d.sx, d.sy, d.sec, d.gx, d.gy, d.L, a);
    self.postMessage({ id: d.id, mw: d.mw, mh: d.mh, vx: d.vx, vy: d.vy, z: d.z, any: any, a: a.buffer }, [a.buffer]);
  };
}
