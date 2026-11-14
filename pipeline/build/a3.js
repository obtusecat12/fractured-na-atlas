// a3.js — night lights from real NASA Black Marble 2016 radiance, pre-baked per faction layer
var Lights = (function () {
  var meta = J('nightlayers'), SCL = meta.scale || 1, L = { ready: false, imgs: {}, timer: null,
    a: { frc: 0.85, agg: 0.6, mxoC: 0.7 }, frcDip: 0 };
  var loadBox = document.getElementById('loading'), names = Object.keys(meta.layers), left = names.length;
  names.forEach(function (n) {
    var im = new Image();
    im.onload = function () {
      if (--left === 0) { L.ready = true; sync(); if (S.mode === 'night') render(); }
    };
    im.src = window.NIGHT_SRC[n];
    L.imgs[n] = im;
  });

  function alphaOf(n, ts, band) {
    switch (n) {
      case 'gilead': return 0.75 + 0.25 * Math.sin(ts * 2 * Math.PI / 6);
      case 'fema':
        var s = Math.sin(ts * 2 * Math.PI / (13 + band * 3.1) + band * 1.9);
        return s < -0.45 ? 0.04 : 0.55 + 0.4 * s;
      case 'frc': return L.a.frc;
      case 'agg': return L.a.agg;
      case 'mxoC': return L.a.mxoC;
    }
    return 1;
  }
  function begin() {
    var t = S.t, dpr = S.dpr;
    ctx.save();
    ctx.setTransform(dpr * t.k / SCL, 0, 0, dpr * t.k / SCL, dpr * t.x, dpr * t.y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  }
  function blit(n, alpha) {
    var m = meta.layers[n], im = L.imgs[n];
    if (!m || !im || alpha <= 0.01) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(im, m.x, m.y, m.w, m.h);
  }
  // static layer: drawn once per full render (into the cached base)
  function drawStatic() {
    if (!L.ready) return;
    begin(); blit('static', 1); ctx.restore();
  }
  // animated layers: drawn every tick
  function drawAnim() {
    if (!L.ready) return;
    var ts = performance.now() / 1000;
    begin();
    ['gilead', 'frc', 'agg', 'mxoC'].forEach(function (n) { blit(n, alphaOf(n, ts)); });
    var m = meta.layers.fema, im = L.imgs.fema;
    if (m && im) {
      var NB = 6;
      for (var b = 0; b < NB; b++) {
        var a = alphaOf('fema', ts, b); if (a <= 0.01) continue;
        var sx = Math.floor(b * im.width / NB), sw = Math.floor((b + 1) * im.width / NB) - sx;
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(im, sx, 0, sw, im.height, m.x + sx * m.w / im.width, m.y, sw * m.w / im.width, m.h);
      }
    }
    ctx.restore();
  }
  function draw() { drawStatic(); drawAnim(); }

  function tick() {
    if (S.mode !== 'night') { sync(); return; }
    var now = performance.now();
    if (now < L.frcDip) L.a.frc = 0.2;
    else { L.a.frc = 0.85; if (Math.random() < 0.025) L.frcDip = now + 120 + Math.random() * 280; }
    L.a.agg = L.a.agg * 0.4 + (0.25 + Math.random() * 0.65) * 0.6;
    L.a.mxoC = L.a.mxoC * 0.4 + (0.35 + Math.random() * 0.6) * 0.6;
    if (S.gesture || S.pending || !S.baseSnap || !L.ready) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(S.baseSnap, 0, 0);
    if (window.FX) FX.draw();
    drawAnim();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(S.labelSnap, 0, 0);
  }

  function sync() {
    var night = S.mode === 'night';
    if (loadBox) loadBox.hidden = !(night && !L.ready);
    if (night && L.ready && !L.timer) L.timer = setInterval(tick, 83);
    else if ((!night || !L.ready) && L.timer) { clearInterval(L.timer); L.timer = null; }
  }
  return { draw: draw, drawStatic: drawStatic, drawAnim: drawAnim, sync: sync };
})();
Lights.sync();
