// fog.js — 战争迷雾：老电视雪花噪声，边缘是随时间流动的横向拉丝雾气。
// 叠在 #map 之上的独立画布，自己跑动画；地图只需在视图变化时调用 FOG.dirty()。
// 逐像素计算在 fogworker.js（后台线程）；遮罩四周多留 PAD，拖动时平移遮罩而不是重建。
var FOG = (function () {
  var Q = 4;                         // 遮罩分辨率：1/4 屏幕像素
  var PAD = 48;                      // 遮罩四周多留的边（遮罩像素，= 192 屏幕像素）
  var cv, g, W = 0, H = 0, DPR = 1, hooks;
  var msk = document.createElement('canvas'), mg = msk.getContext('2d', { willReadFrequently: true }); // 1/4 分辨率可见区（已模糊）
  var tiny = document.createElement('canvas'), tg = tiny.getContext('2d');    // 1/16，用来做便宜的模糊
  var al = document.createElement('canvas'), ag = al.getContext('2d');        // 每帧的雾透明度
  var mist = document.createElement('canvas'), sg = mist.getContext('2d');    // 每帧的边缘雾气
  var mdata = null, MW = 0, MH = 0, mview = null, lastBuild = 0, dirtyMask = true, running = false, last = 0, on = true;
  var mw = 0, mh = 0, res = null, busy = false, reqId = 0, worker = null, A = null, Mi = null;

  // ---- 雪花噪声贴图（同地图集 fx.js：每行有轻微横向拖影） ----
  var T = 160, snow = [], pats = null, scan = null;
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

  function startWorker() {
    if (worker !== null || typeof Worker === 'undefined' || location.protocol === 'file:') return;
    try {
      worker = new Worker('fogworker.js');
      worker.onmessage = function (e) {
        var d = e.data; busy = false;
        if (d.skip || d.mw !== mw || d.mh !== mh) return;
        res = { any: d.any, a: new ImageData(new Uint8ClampedArray(d.a), d.mw, d.mh), m: new ImageData(new Uint8ClampedArray(d.m), d.mw, d.mh), vx: d.vx, vy: d.vy, z: d.z };
      };
      worker.onerror = function () { worker = false; busy = false; }; // 退回主线程计算
    } catch (e) { worker = false; }
  }

  function init(canvas, h) { cv = canvas; g = cv.getContext('2d'); hooks = h; pats = snow.map(function (t) { return g.createPattern(t, 'repeat'); }); startWorker(); }
  function resize(w, h, dpr) {
    W = w; H = h; DPR = dpr;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    mw = Math.ceil(W / Q) + 2; mh = Math.ceil(H / Q) + 2; MW = mw + PAD * 2; MH = mh + PAD * 2;
    al.width = mist.width = mw; al.height = mist.height = mh; msk.width = MW; msk.height = MH;
    tiny.width = Math.ceil(MW / 4) + 2; tiny.height = Math.ceil(MH / 4) + 2;
    A = ag.createImageData(mw, mh); Mi = sg.createImageData(mw, mh); res = null;
    // 扫描线：每 3 个 CSS 像素一条，建成图案，每帧一次 fillRect
    var sh = Math.max(2, Math.round(3 * DPR)); scan = document.createElement('canvas'); scan.width = 4; scan.height = sh;
    var sc = scan.getContext('2d'); sc.fillStyle = 'rgba(0,0,0,.18)'; sc.fillRect(0, 0, 4, Math.max(1, Math.round(DPR)));
    scan.pat = g.createPattern(scan, 'repeat');
    dirtyMask = true; mview = null; start();
  }
  function dirty() { dirtyMask = true; }
  function setOn(v) { on = v; cv.style.display = v ? '' : 'none'; if (v) { dirtyMask = true; start(); } }

  // 可见区：已知的县 + 铁塔视野圆。hooks.visible(ctx) 负责把形状（屏幕坐标）填成白色。
  function buildMask(view) {
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tiny.width, tiny.height);
    tg.fillStyle = '#fff'; tg.setTransform(1 / (Q * 4), 0, 0, 1 / (Q * 4), PAD / 4 + 1, PAD / 4 + 1); hooks.visible(tg);
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, MW, MH);
    // 1/16 的遮罩放大后再模糊：边缘的位置由多边形决定，不留多边形本身的硬边
    mg.imageSmoothingEnabled = true; mg.globalAlpha = 1;
    if ('filter' in mg) mg.filter = 'blur(5px)';
    mg.drawImage(tiny, -3, -3, tiny.width * 4, tiny.height * 4);
    mg.filter = 'none';
    var d = mg.getImageData(0, 0, MW, MH).data; mdata = new Float32Array(MW * MH);
    for (var i = 0; i < MW * MH; i++) mdata[i] = d[i * 4 + 3] / 255;
    mview = { x: view.x, y: view.y, z: view.z }; lastBuild = performance.now(); dirtyMask = false;
    if (worker) worker.postMessage({ mask: mdata.slice(0), MW: MW, MH: MH, PAD: PAD }); else FOGCORE.setMask(mdata, MW, MH, PAD);
  }
  function hidden() {
    if (document.hidden) return true;
    try { if (top !== window && top.FNA && top.FNA.inGame && !top.FNA.inGame()) return true; } catch (e) {}
    return false;
  }

  function frame(t) {
    if (!on) { running = false; return; }
    requestAnimationFrame(frame);
    if (t - last < 55) return; last = t;                 // 约 18 帧
    if (!W || hidden()) return;
    var view = hooks.view(), sec = t / 1000;
    var sx = mview ? Math.round((view.x - mview.x) / Q) : 0, sy = mview ? Math.round((view.y - mview.y) / Q) : 0;
    if (!mview || mview.z !== view.z || Math.abs(sx) > PAD - 2 || Math.abs(sy) > PAD - 2 || (dirtyMask && t - lastBuild > 120)) { buildMask(view); sx = sy = 0; }
    var ox = (view.x - W / 2) / Q, oy = (view.y - H / 2) / Q;  // 世界坐标锚定：拖动地图时雾跟着走
    var L = 156543.03 * .8201 / Math.pow(2, view.z) * Q, gx = (ox - 1) * L, gy = (oy - 1) * L;
    if (worker) {
      if (!busy) { busy = true; worker.postMessage({ id: ++reqId, mw: mw, mh: mh, ox: ox, oy: oy, sx: sx, sy: sy, sec: sec, gx: gx, gy: gy, L: L, vx: view.x, vy: view.y, z: view.z }); }
      if (!res) return;
    } else {
      A.data.fill(0); Mi.data.fill(0);
      res = { any: FOGCORE.compute(mw, mh, ox, oy, sx, sy, sec, gx, gy, L, A.data, Mi.data), a: A, m: Mi, vx: view.x, vy: view.y, z: view.z };
    }
    paint(view, sec);
  }
  function paint(view, sec) {
    if (res.z !== view.z) return;                        // 刚换了缩放级别：先保留上一帧，等新结果
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, cv.width, cv.height);
    if (!res.any) return;
    ag.putImageData(res.a, 0, 0); sg.putImageData(res.m, 0, 0);
    // 雪花：每帧换一张，随机偏移
    var pat = pats[(Math.random() * pats.length) | 0], sc = 1.25 * DPR;
    if (pat.setTransform) pat.setTransform(new DOMMatrix([sc, 0, 0, sc, Math.random() * T * sc, Math.random() * T * sc]));
    g.fillStyle = pat; g.fillRect(0, 0, cv.width, cv.height);
    // 扫描线
    if (scan.pat.setTransform) scan.pat.setTransform(new DOMMatrix([1, 0, 0, 1, 0, (sec * 30 * DPR) % scan.height]));
    g.fillStyle = scan.pat; g.fillRect(0, 0, cv.width, cv.height);
    // 用雾透明度裁出来（结果算出来之后视图可能又动了一点，按差值平移）
    var dx = (res.vx - view.x) * DPR, dy = (res.vy - view.y) * DPR;
    g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true;
    g.drawImage(al, -DPR * Q + dx, -DPR * Q + dy, mw * Q * DPR, mh * Q * DPR);
    g.globalCompositeOperation = 'source-over';
    g.drawImage(mist, -DPR * Q + dx, -DPR * Q + dy, mw * Q * DPR, mh * Q * DPR);
  }
  function start() { if (running || !on) return; running = true; requestAnimationFrame(frame); }
  return { init: init, resize: resize, dirty: dirty, setOn: setOn };
})();
