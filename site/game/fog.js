// fog.js — 战争迷雾：成团的白烟和拉开的细丝，浓淡不一，慢慢往东飘。
// 叠在 #map 之上的独立画布，自己跑动画；地图只需在视图变化时调用 FOG.dirty()。
// fogworker.js 在后台线程里生成一张可平铺的烟贴图（一次），并每帧算覆盖范围；这里把三层烟贴图按不同大小和速度叠起来，再按覆盖范围裁出。
var FOG = (function () {
  var Q = 4;                         // 覆盖范围的分辨率：1/4 屏幕像素
  var PAD = 48;                      // 遮罩四周多留的边（遮罩像素，= 192 屏幕像素）
  var TW = 1024, TH = 512;           // 烟贴图
  var cv, g, W = 0, H = 0, DPR = 1, hooks;
  var msk = document.createElement('canvas'), mg = msk.getContext('2d', { willReadFrequently: true });
  var tiny = document.createElement('canvas'), tg = tiny.getContext('2d');
  var al = document.createElement('canvas'), ag = al.getContext('2d');
  var mdata = null, MW = 0, MH = 0, mview = null, lastBuild = 0, dirtyMask = true, running = false, last = 0, on = true;
  var mw = 0, mh = 0, res = null, busy = false, reqId = 0, worker = null, A = null;
  var tile = null, tinted = null, tintKey = '', pat = null;

  function setTile(px) {
    tile = document.createElement('canvas'); tile.width = TW; tile.height = TH;
    tile.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(px), TW, TH), 0, 0);
    tintKey = ''; pat = null;
  }
  // 夜里烟被环境光染暗：乘一层颜色，再按原贴图恢复透明度。只在颜色变了时重做
  function smokePattern(tint) {
    var key = tint ? tint.map(function (v) { return Math.round(v * 40); }).join(',') : 'day';
    if (key === tintKey && pat) return pat;
    tintKey = key;
    var src = tile;
    if (tint) {
      if (!tinted) { tinted = document.createElement('canvas'); tinted.width = TW; tinted.height = TH; }
      var t = tinted.getContext('2d'); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, TW, TH); t.drawImage(tile, 0, 0);
      t.globalCompositeOperation = 'multiply'; t.fillStyle = 'rgb(' + tint.map(function (v) { return Math.round(v * 255); }).join(',') + ')'; t.fillRect(0, 0, TW, TH);
      t.globalCompositeOperation = 'destination-in'; t.drawImage(tile, 0, 0); t.globalCompositeOperation = 'source-over';
      src = tinted;
    }
    pat = g.createPattern(src, 'repeat');
    return pat;
  }

  function startWorker() {
    if (worker !== null || typeof Worker === 'undefined' || location.protocol === 'file:') return;
    try {
      worker = new Worker('fogworker.js');
      worker.onmessage = function (e) {
        var d = e.data;
        if (d.tile) { setTile(d.a); return; }
        busy = false;
        if (d.mw !== mw || d.mh !== mh) return;
        res = { any: d.any, a: new ImageData(new Uint8ClampedArray(d.a), d.mw, d.mh), vx: d.vx, vy: d.vy, z: d.z };
      };
      worker.onerror = function () { worker = false; busy = false; if (!tile) setTimeout(localTile, 0); };
      worker.postMessage({ tile: 1, TW: TW, TH: TH, seed: 7 });
    } catch (e) { worker = false; }
  }
  function localTile() { if (!tile) setTile(FOGCORE.smokeTile(TW, TH, 7).buffer); }

  function init(canvas, h) { cv = canvas; g = cv.getContext('2d'); hooks = h; startWorker(); if (!worker) setTimeout(localTile, 0); }
  function resize(w, h, dpr) {
    W = w; H = h; DPR = dpr;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    mw = Math.ceil(W / Q) + 2; mh = Math.ceil(H / Q) + 2; MW = mw + PAD * 2; MH = mh + PAD * 2;
    al.width = mw; al.height = mh; msk.width = MW; msk.height = MH;
    tiny.width = Math.ceil(MW / 4) + 2; tiny.height = Math.ceil(MH / 4) + 2;
    A = ag.createImageData(mw, mh); res = null; pat = null; tintKey = '';
    dirtyMask = true; mview = null; start();
  }
  function dirty() { dirtyMask = true; }
  function setOn(v) { on = v; cv.style.display = v ? '' : 'none'; if (v) { dirtyMask = true; start(); } }

  // 可见区：已知的县 + 有视野的设施。hooks.visible(ctx) 负责把形状（屏幕坐标）填成白色。
  function buildMask(view) {
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, tiny.width, tiny.height);
    tg.fillStyle = '#fff'; tg.setTransform(1 / (Q * 4), 0, 0, 1 / (Q * 4), PAD / 4 + 1, PAD / 4 + 1); hooks.visible(tg);
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, MW, MH);
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
    if (t - last < 33) return; last = t;
    if (!W || hidden()) return;
    var view = hooks.view(), sec = t / 1000;
    var sx = mview ? Math.round((view.x - mview.x) / Q) : 0, sy = mview ? Math.round((view.y - mview.y) / Q) : 0;
    if (!mview || mview.z !== view.z || Math.abs(sx) > PAD - 2 || Math.abs(sy) > PAD - 2 || (dirtyMask && t - lastBuild > 120)) { buildMask(view); sx = sy = 0; }
    var ox = (view.x - W / 2) / Q, oy = (view.y - H / 2) / Q;
    var L = 156543.03 * .8201 / Math.pow(2, view.z) * Q, gx = (ox - 1) * L, gy = (oy - 1) * L;
    if (worker) {
      if (!busy) { busy = true; worker.postMessage({ id: ++reqId, mw: mw, mh: mh, ox: ox, oy: oy, sx: sx, sy: sy, sec: sec, gx: gx, gy: gy, L: L, vx: view.x, vy: view.y, z: view.z }); }
      if (!res) return;
    } else {
      A.data.fill(0);
      res = { any: FOGCORE.compute(mw, mh, ox, oy, sx, sy, sec, gx, gy, L, A.data), a: A, vx: view.x, vy: view.y, z: view.z };
    }
    paint(view, sec, hooks.tint ? hooks.tint() : null);
  }
  function layer(p, sc, vx, vy, drift, alpha) {
    var w = TW * sc, h = TH * sc, ox = ((-vx * DPR + drift) % w + w) % w, oy = ((-vy * DPR) % h + h) % h;
    if (p.setTransform) p.setTransform(new DOMMatrix([sc, 0, 0, sc, ox, oy]));
    g.globalAlpha = alpha; g.fillStyle = p; g.fillRect(0, 0, cv.width, cv.height);
  }
  function paint(view, sec, tint) {
    if (res.z !== view.z || !tile) return;               // 刚换了缩放级别：先保留上一帧，等新结果
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, cv.width, cv.height);
    if (!res.any) return;
    var p = smokePattern(tint), c = tint || [1, 1, 1];
    // 最底下一层很淡的烟幕；主层是成团的烟，远层更小更淡，近层更大更淡、飘得更快，厚薄之间留出空隙
    g.fillStyle = 'rgba(' + Math.round(226 * c[0]) + ',' + Math.round(230 * c[1]) + ',' + Math.round(234 * c[2]) + ',.16)'; g.fillRect(0, 0, cv.width, cv.height);
    layer(p, .62 * DPR, view.x * .92, view.y * .92 + 140, sec * 5 * DPR, .28);
    layer(p, 1 * DPR, view.x, view.y, sec * 9 * DPR, .95);
    layer(p, 1.55 * DPR, view.x * 1.06, view.y * 1.06 + 310, sec * 15 * DPR, .4);
    // 按覆盖范围裁出（结果算出来之后视图可能又动了一点，按差值平移）
    ag.putImageData(res.a, 0, 0);
    var dx = (res.vx - view.x) * DPR, dy = (res.vy - view.y) * DPR;
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(al, -DPR * Q + dx, -DPR * Q + dy, mw * Q * DPR, mh * Q * DPR);
    g.globalCompositeOperation = 'source-over';
  }
  function start() { if (running || !on) return; running = true; requestAnimationFrame(frame); }
  return { init: init, resize: resize, dirty: dirty, setOn: setOn };
})();
