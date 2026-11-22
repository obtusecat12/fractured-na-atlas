// fog.js — 战争迷雾：老电视雪花噪声，边缘是随时间流动的横向拉丝雾气。
// 叠在 #map 之上的独立画布，自己跑动画；地图只需在视图变化时调用 FOG.dirty()。
var FOG = (function () {
  var Q = 4;                         // 遮罩分辨率：1/4 屏幕像素
  var cv, g, W = 0, H = 0, DPR = 1, hooks;
  var msk = document.createElement('canvas'), mg = msk.getContext('2d');      // 1/4 分辨率可见区（已模糊）
  var tiny = document.createElement('canvas'), tg = tiny.getContext('2d');    // 1/16，用来做便宜的模糊
  var al = document.createElement('canvas'), ag = al.getContext('2d');        // 每帧的雾透明度
  var mist = document.createElement('canvas'), sg = mist.getContext('2d');    // 每帧的边缘雾气
  var mdata = null, dirtyMask = true, running = false, last = 0, on = true;

  // ---- 雪花噪声贴图（同地图集 fx.js：每行有轻微横向拖影） ----
  var T = 160, snow = [];
  for (var s = 0; s < 8; s++) {
    var c = document.createElement('canvas'); c.width = c.height = T;
    var cg = c.getContext('2d'), im = cg.createImageData(T, T), d = im.data;
    for (var y = 0; y < T; y++) {
      var row = 0.75 + Math.random() * 0.5, prev = Math.random();
      for (var x = 0; x < T; x++) {
        prev = prev * 0.35 + Math.random() * 0.65;
        var v = Math.pow(prev, 1.7) * 200 * row, i = (y * T + x) * 4;
        d[i] = v; d[i + 1] = v; d[i + 2] = v * 1.04; d[i + 3] = 255;
      }
    }
    cg.putImageData(im, 0, 0); snow.push(c);
  }

  // ---- 可平铺的值噪声，用来做拉丝 ----
  var N = 128, NT = new Float32Array(N * N);
  (function () { var r = 1234567; for (var i = 0; i < N * N; i++) { r = (r * 16807) % 2147483647; NT[i] = r / 2147483647; } })();
  function vn(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf);
    var x0 = xi & (N - 1), y0 = yi & (N - 1), x1 = (x0 + 1) & (N - 1), y1 = (y0 + 1) & (N - 1);
    var a = NT[y0 * N + x0], b = NT[y0 * N + x1], c = NT[y1 * N + x0], e = NT[y1 * N + x1];
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + e) * xf * yf;
  }

  function init(canvas, h) { cv = canvas; g = cv.getContext('2d'); hooks = h; }
  function resize(w, h, dpr) {
    W = w; H = h; DPR = dpr;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    var mw = Math.ceil(W / Q) + 2, mh = Math.ceil(H / Q) + 2;
    msk.width = al.width = mist.width = mw; msk.height = al.height = mist.height = mh;
    tiny.width = Math.ceil(mw / 4) + 2; tiny.height = Math.ceil(mh / 4) + 2;
    dirtyMask = true; start();
  }
  function dirty() { dirtyMask = true; }
  function setOn(v) { on = v; cv.style.display = v ? '' : 'none'; if (v) { dirtyMask = true; start(); } }

  // 可见区：已知的县 + 铁塔视野圆。hooks.visible(ctx, scale) 负责把形状填成白色。
  function buildMask() {
    var mw = msk.width, mh = msk.height;
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tiny.width, tiny.height);
    tg.fillStyle = '#fff'; tg.setTransform(1 / (Q * 4), 0, 0, 1 / (Q * 4), 1, 1); hooks.visible(tg);
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, mw, mh);
    // 先放大 1/16 的粗遮罩（自带模糊），再叠一层清楚的，边缘软而不糊
    mg.imageSmoothingEnabled = true; mg.globalAlpha = 1;
    if ('filter' in mg) mg.filter = 'blur(3px)';
    mg.drawImage(tiny, -3, -3, tiny.width * 4, tiny.height * 4);
    mg.filter = 'none';
    mg.globalAlpha = .3; mg.fillStyle = '#fff'; mg.setTransform(1 / Q, 0, 0, 1 / Q, 1, 1); hooks.visible(mg);
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1;
    var d = mg.getImageData(0, 0, mw, mh).data; mdata = new Float32Array(mw * mh);
    for (var i = 0; i < mw * mh; i++) mdata[i] = d[i * 4 + 3] / 255;
    dirtyMask = false;
  }

  function frame(t) {
    if (!on) { running = false; return; }
    requestAnimationFrame(frame);
    if (t - last < 55) return; last = t;                 // 约 18 帧
    if (!W) return;
    if (dirtyMask) buildMask();
    var mw = msk.width, mh = msk.height, view = hooks.view(), sec = t / 1000;
    var ox = (view.x - W / 2) / Q, oy = (view.y - H / 2) / Q;  // 世界坐标锚定：拖动地图时雾跟着走
    var A = ag.createImageData(mw, mh), M = sg.createImageData(mw, mh), a = A.data, m = M.data, any = false;
    for (var y = 0; y < mh; y++) {
      var wy = (y + oy);
      for (var x = 0; x < mw; x++) {
        var k = y * mw + x, vis = mdata[k];
        if (vis > .995) continue;                          // 完全可见：跳过
        var wx = (x + ox);
        // 横向拉丝：x 方向拉长 8 倍，两层不同速度往东漂
        var n1 = vn(wx * .012 + sec * .25, wy * .2), n2 = vn(wx * .03 - sec * .4 + 40, wy * .45 + sec * .06), n3 = vn(wx * .08 + sec * .6, wy * 1.1);
        var n = n1 * .5 + n2 * .32 + n3 * .18;
        var f = (1 - vis) + (n - .5) * 1.15;                 // 雾的“厚度”，边缘被噪声撕开
        var aa = f <= .3 ? 0 : f >= .68 ? 1 : (f - .3) / .38;
        aa = aa * aa * (3 - 2 * aa);
        a[k * 4 + 3] = aa * 255;
        // 边缘雾气：只在过渡带里，亮色细丝
        var band = 1 - Math.abs(vis - .45) / .45; if (band > 0) {
          var st = vn(wx * .008 - sec * .15, wy * .7) * .6 + vn(wx * .02 + sec * .2, wy * 1.4) * .4;
          var ma = band * band * Math.max(0, st - .35) * 1.6 * (1 - aa * .6);
          if (ma > .01) { var j = k * 4; m[j] = 236; m[j + 1] = 234; m[j + 2] = 228; m[j + 3] = Math.min(255, ma * 255); }
        }
        any = true;
      }
    }
    ag.putImageData(A, 0, 0); sg.putImageData(M, 0, 0);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, cv.width, cv.height);
    if (!any) return;
    // 雪花：每帧换一张，随机偏移
    var tile = snow[(Math.random() * snow.length) | 0], sc = 1.25 * DPR;
    var pat = g.createPattern(tile, 'repeat');
    if (pat.setTransform) pat.setTransform(new DOMMatrix([sc, 0, 0, sc, Math.random() * T * sc, Math.random() * T * sc]));
    g.fillStyle = pat; g.fillRect(0, 0, cv.width, cv.height);
    // 扫描线
    g.fillStyle = 'rgba(0,0,0,.18)'; for (var yy = (sec * 30 * DPR) % (3 * DPR); yy < cv.height; yy += 3 * DPR) g.fillRect(0, yy, cv.width, DPR);
    // 用雾透明度裁出来
    g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true;
    g.drawImage(al, -DPR * Q, -DPR * Q, mw * Q * DPR, mh * Q * DPR);
    g.globalCompositeOperation = 'source-over';
    g.drawImage(mist, -DPR * Q, -DPR * Q, mw * Q * DPR, mh * Q * DPR);
  }
  function start() { if (running || !on) return; running = true; requestAnimationFrame(frame); }
  return { init: init, resize: resize, dirty: dirty, setOn: setOn };
})();
