// screen.js — makes a modern display look like a typical 2009 desktop LCD:
// a 22" TN panel (1680x1050, 0.282 mm pitch) with a CCFL backlight and a matte anti-glare coating.
// Physical traits reproduced, each as its own non-interactive layer over the whole page (iframes included):
//  1. Panel tone: ~700:1 contrast (grey blacks), ~72% NTSC gamut (slightly flat colour), cool 7000-7500K CCFL white.
//  2. TN vertical viewing angle: top of the screen a touch darker/denser, bottom washed out (seen from normal sitting height).
//  3. Backlight non-uniformity: CCFL tubes run along the top and bottom edges -> brighter bands there,
//     corner bleed and faint clouding, which only shows on dark content (the night map).
//  4. Pixel structure: RGB vertical-stripe subpixels and the black matrix between pixels (screen-door texture).
//  5. Matte AG coating: fine static grain / sparkle and a soft diffuse room reflection.
// Toggle and strength in the gear menu (显示器 Display). Default: normal. Cursor is drawn by the OS and is unaffected, as on a real panel.
var LCD09 = (function () {
  var KEY = 'lcd09', mode = 'on';
  try { mode = localStorage.getItem(KEY) || 'on'; } catch (e) {}
  var dpr = Math.max(1, window.devicePixelRatio || 1);
  // Layers are direct children of <body>: a wrapper with z-index would be its own stacking context and the blend modes
  // would only mix with the (empty) wrapper instead of the page.
  var layers = ['tone', 'tint', 'black', 'tn-top', 'tn-bot', 'bleed', 'cloud', 'grid', 'matte', 'glare'].map(function (c) {
    var d = document.createElement('div'); d.className = 'lcd09 l-' + c; d.setAttribute('aria-hidden', 'true'); return d;
  });
  var H = document.documentElement;
  function cv(w, h, fn) { var c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c.toDataURL('image/png'); }
  // subpixel tile in device pixels: 3 columns R|G|B, last row = black matrix
  var P = dpr >= 2 ? 3 : 3, gridURL = cv(P, P, function (g) {
    var col = [[255, 214, 214], [214, 255, 214], [214, 214, 255]];
    for (var x = 0; x < P; x++) for (var y = 0; y < P; y++) {
      var c = col[x % 3], k = (y === P - 1) ? 0.80 : 1;
      g.fillStyle = 'rgb(' + (c[0] * k | 0) + ',' + (c[1] * k | 0) + ',' + (c[2] * k | 0) + ')'; g.fillRect(x, y, 1, 1);
    }
  });
  // matte coating grain: sparse bright/dark specks around mid grey (used with soft-light)
  var grainURL = cv(256, 256, function (g, w, h) {
    var im = g.createImageData(w, h), d = im.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = Math.random(), v = 128 + (Math.random() - 0.5) * 34;
      if (r < 0.004) v = 200; else if (r < 0.008) v = 70;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  });
  // backlight clouding: a few soft uneven patches, fixed per panel
  var blobs = [], blobP = [];
  for (var b = 0; b < 6; b++) {
    var bp = [18 + Math.random() * 22 | 0, 14 + Math.random() * 18 | 0, 8 + Math.random() * 84 | 0, 10 + Math.random() * 80 | 0]; blobP.push(bp);
    blobs.push('radial-gradient(' + bp[0] + '% ' + bp[1] + '% at ' + bp[2] + '% ' + bp[3] + '%, rgba(150,165,190,.55), rgba(150,165,190,0) 70%)');
  }
  var css = 'html{--k:1}html.lcd-strong{--k:1.7}' +
    '.lcd09{position:fixed;inset:0;z-index:2147483000;pointer-events:none}html.lcd-off .lcd09{display:none}' +
    '.l-tone{-webkit-backdrop-filter:contrast(.93) saturate(.86) brightness(1.015);backdrop-filter:contrast(.93) saturate(.86) brightness(1.015)}' +
    'html.lcd-strong .l-tone{-webkit-backdrop-filter:contrast(.88) saturate(.78) brightness(1.03);backdrop-filter:contrast(.88) saturate(.78) brightness(1.03)}' +
    '.l-tint{background:#e9f0ff;mix-blend-mode:multiply;opacity:calc(.26*var(--k))}' +
    '.l-black{background:#1a1e26;mix-blend-mode:screen;opacity:calc(.55*var(--k))}' +
    '.l-tn-top{background:linear-gradient(to bottom,rgba(10,12,30,.10),rgba(10,12,30,0) 45%);mix-blend-mode:multiply;opacity:var(--k)}' +
    '.l-tn-bot{background:linear-gradient(to bottom,rgba(215,220,232,0) 52%,rgba(215,220,232,.13));mix-blend-mode:screen;opacity:var(--k)}' +
    '.l-bleed{mix-blend-mode:screen;opacity:calc(.9*var(--k));background:' +
      'linear-gradient(to bottom,rgba(140,155,185,.07),rgba(140,155,185,0) 7%,rgba(140,155,185,0) 93%,rgba(150,160,180,.08)),' +
      'radial-gradient(22% 16% at 0 100%,rgba(185,175,160,.16),rgba(185,175,160,0)),' +
      'radial-gradient(22% 16% at 100% 100%,rgba(170,175,195,.14),rgba(170,175,195,0)),' +
      'radial-gradient(18% 12% at 0 0,rgba(160,170,195,.10),rgba(160,170,195,0)),' +
      'radial-gradient(18% 12% at 100% 0,rgba(160,170,195,.11),rgba(160,170,195,0))}' +
    '.l-cloud{mix-blend-mode:screen;opacity:calc(.045*var(--k));background:' + blobs.join(',') + '}' +
    '.l-grid{background:url(' + gridURL + ') 0 0/' + (P / dpr) + 'px ' + (P / dpr) + 'px repeat;image-rendering:pixelated;mix-blend-mode:multiply;opacity:calc(' + (dpr >= 2 ? .24 : .08) + '*var(--k))}' +
    '.l-matte{background:url(' + grainURL + ') 0 0/' + (256 / dpr) + 'px repeat;image-rendering:pixelated;mix-blend-mode:soft-light;opacity:calc(.22*var(--k))}' +
    '.l-glare{background:radial-gradient(70% 60% at 22% 8%,rgba(255,255,255,.035),rgba(255,255,255,0) 70%);mix-blend-mode:screen;opacity:var(--k)}' +
    '.l-fm{mix-blend-mode:multiply}.l-fs{mix-blend-mode:screen}.l-fm,.l-fs{width:100%;height:100%;display:none;image-rendering:pixelated}' +
    'html.lcd-fused .l-fm,html.lcd-fused .l-fs{display:block}' +
    'html.lcd-fused .l-tint,html.lcd-fused .l-black,html.lcd-fused .l-tn-top,html.lcd-fused .l-tn-bot,html.lcd-fused .l-bleed,html.lcd-fused .l-cloud,html.lcd-fused .l-grid{display:none}' +
    '';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  // ---- 合并图层（2026-11-22）：画质不变，合成开销减半 ----
  // tint、black、tn-top、tn-bot、bleed、cloud、grid 七层都是 multiply 或 screen，而且都是静态图。对背景色 c，
  // multiply（不透明度 a、颜色 m）是 c → c·(1 − a + a·m)，screen 是 c → c·(1 − a·s) + a·s，都是 c 的仿射变换；
  // 七层连起来仍是 c → A·c + B（逐像素、逐通道）。A + B ≤ 1，所以它恰好等于两层：先 multiply A/(1 − B)，再 screen B。
  // 原来浏览器每帧要做 7 次全屏混合（每次都要拷贝背景），现在只做 2 次；结果相同（8 位取整误差 ≤ 1/255，原来每层也各取整一次）。
  // 色调（backdrop-filter）、哑光颗粒（soft-light，非线性）和眩光照旧单独一层。在后台线程算，算好之前、以及改变窗口大小时用原来的七层。
  function fuse(W, H, k, dpr, blobP) {
    var A0 = new Float32Array(3), cl = function (v) { return v > 1 ? 1 : v; };
    var tint = [233 / 255, 240 / 255, 1], aT = cl(.26 * k), black = [26 / 255, 30 / 255, 38 / 255], aB = cl(.55 * k);
    var top = [10 / 255, 12 / 255, 30 / 255], bot = [215 / 255, 220 / 255, 232 / 255], aK = cl(k), aBl = cl(.9 * k), aC = cl(.045 * k);
    var BL = [[140, 155, 185], [150, 160, 180]].map(function (c) { return c.map(function (v) { return v / 255; }); });
    // bleed 的四个角（CSS 列表里越靠前越在上；这里按从下到上画）：[中心 x, 中心 y, rx, ry, 颜色, 起始不透明度]
    var RAD = [[W, 0, .18 * W, .12 * H, [160, 170, 195], .11], [0, 0, .18 * W, .12 * H, [160, 170, 195], .10], [W, H, .22 * W, .16 * H, [170, 175, 195], .14], [0, H, .22 * W, .16 * H, [185, 175, 160], .16]]
      .map(function (r) { r[4] = r[4].map(function (v) { return v / 255; }); return r; });
    var cloudC = [150 / 255, 165 / 255, 190 / 255], CL = blobP.map(function (p) { return [p[2] / 100 * W, p[3] / 100 * H, p[0] / 100 * W, p[1] / 100 * H]; });
    var gA = cl((dpr >= 2 ? .24 : .08) * k), GC = [[255, 214, 214], [214, 255, 214], [214, 214, 255]];
    var GT = []; for (var gy = 0; gy < 3; gy++) for (var gx = 0; gx < 3; gx++) { var kk = gy === 2 ? .8 : 1; GT.push(GC[gx].map(function (v) { return 1 - gA + gA * ((v * kk | 0) / 255); })); }
    var outM = new Uint8ClampedArray(W * H * 4), outS = new Uint8ClampedArray(W * H * 4);
    var mT = tint.map(function (v) { return 1 - aT + aT * v; }), pB = black.map(function (v) { return aB * v; });
    for (var y = 0; y < H; y++) {
      var t = (y + .5) / H;
      var aTop = aK * (t < .45 ? .10 * (1 - t / .45) : 0), aBot = aK * (t > .52 ? .13 * (t - .52) / .48 : 0);
      var lA = t < .07 ? .07 * (1 - t / .07) : t > .93 ? .08 * (t - .93) / .07 : 0, lC = t < .5 ? BL[0] : BL[1];
      for (var x = 0; x < W; x++) {
        var px = x + .5, py = y + .5;
        // bleed: 背景层先按 source-over（预乘）叠成一张，再整体 screen
        var br = 0, bg = 0, bb = 0, ba = 0;
        for (var r = 0; r < 4; r++) { var R = RAD[r], dx = (px - R[0]) / R[2], dy = (py - R[1]) / R[3], dd = dx * dx + dy * dy; if (dd >= 1) continue; var as = R[5] * (1 - Math.sqrt(dd)); br = R[4][0] * as + br * (1 - as); bg = R[4][1] * as + bg * (1 - as); bb = R[4][2] * as + bb * (1 - as); ba = as + ba * (1 - as); }
        if (lA > 0) { br = lC[0] * lA + br * (1 - lA); bg = lC[1] * lA + bg * (1 - lA); bb = lC[2] * lA + bb * (1 - lA); }
        // cloud：六块颜色相同，只需累计不透明度
        var ca = 0;
        for (var c = 0; c < CL.length; c++) { var Q = CL[c], ex = (px - Q[0]) / Q[2], ey = (py - Q[1]) / Q[3], e2 = ex * ex + ey * ey; if (e2 >= .49) continue; var a2 = .55 * (1 - Math.sqrt(e2) / .7); ca = a2 + ca * (1 - a2); }
        var g3 = GT[(y % 3) * 3 + (x % 3)], o = (y * W + x) * 4;
        for (var ch = 0; ch < 3; ch++) {
          var A = 1, B = 0, m, p;
          m = mT[ch]; A *= m; B *= m;                                           // tint (multiply)
          p = pB[ch]; A *= 1 - p; B = B * (1 - p) + p;                           // black (screen)
          m = 1 - aTop + aTop * top[ch]; A *= m; B *= m;                         // tn-top (multiply)
          p = aBot * bot[ch]; A *= 1 - p; B = B * (1 - p) + p;                   // tn-bot (screen)
          p = aBl * (ch === 0 ? br : ch === 1 ? bg : bb); A *= 1 - p; B = B * (1 - p) + p;   // bleed (screen)
          p = aC * ca * cloudC[ch]; A *= 1 - p; B = B * (1 - p) + p;             // cloud (screen)
          m = g3[ch]; A *= m; B *= m;                                            // grid (multiply)
          outM[o + ch] = Math.round((B < 1 ? Math.min(1, A / (1 - B)) : 1) * 255); outS[o + ch] = Math.round(B * 255);
        }
        outM[o + 3] = outS[o + 3] = 255;
      }
    }
    return { m: outM, s: outS };
  }
  var fm = document.createElement('canvas'), fs = document.createElement('canvas'), fuseJob = 0, fuseT = 0, wk = null;
  fm.className = 'lcd09 l-fm'; fs.className = 'lcd09 l-fs'; fm.setAttribute('aria-hidden', 'true'); fs.setAttribute('aria-hidden', 'true');
  layers.splice(1, 0, fm, fs);   // 紧跟在色调层后面，顺序与原来七层的位置一致
  function kOf() { return mode === 'strong' ? 1.7 : 1; }
  function done(job, W, H, m, s) {
    if (job !== fuseJob) return;
    [[fm, m], [fs, s]].forEach(function (x) { x[0].width = W; x[0].height = H; x[0].getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(x[1]), W, H), 0, 0); });
    H_.classList.add('lcd-fused');
  }
  var H_ = H;
  function refuse() {
    H_.classList.remove('lcd-fused');                 // 先回到原来的七层（任何尺寸下都正确），再在后台重算
    clearTimeout(fuseT); if (mode === 'off') return;
    fuseT = setTimeout(function () {
      var W = Math.round(innerWidth * dpr), Hh = Math.round(innerHeight * dpr), job = ++fuseJob, k = kOf();
      if (!W || !Hh) return;
      try {
        if (wk === null) wk = new Worker(URL.createObjectURL(new Blob(['var fuse=' + fuse.toString() + ';onmessage=function(e){var d=e.data,r=fuse(d.W,d.H,d.k,d.dpr,d.blobP);postMessage({job:d.job,W:d.W,H:d.H,m:r.m.buffer,s:r.s.buffer},[r.m.buffer,r.s.buffer]);};'], { type: 'text/javascript' })));
        wk.onmessage = function (e) { var d = e.data; done(d.job, d.W, d.H, d.m, d.s); };
        wk.onerror = function () { wk = false; sync(); };      // 后台线程起不来（例如被 CSP 拦下）就在主线程算
        if (wk) { wk.postMessage({ job: job, W: W, H: Hh, k: k, dpr: dpr, blobP: blobP }); return; }
      } catch (e) { wk = false; }
      sync();
      function sync() { if (job !== fuseJob) return; var r = fuse(W, Hh, k, dpr, blobP); done(job, W, Hh, r.m.buffer, r.s.buffer); }
    }, 250);
  }
  window.addEventListener('resize', refuse);

  function apply(m) {
    var changed = m !== mode; mode = m; H.classList.toggle('lcd-off', m === 'off'); H.classList.toggle('lcd-strong', m === 'strong');
    if (changed || !H.classList.contains('lcd-fused')) refuse();
    try { localStorage.setItem(KEY, m); } catch (e) {}
    document.querySelectorAll('#gearmenu [data-lcd]').forEach(function (a) { a.classList.toggle('sel', a.dataset.lcd === m); });
  }
  function mount() {
    layers.forEach(function (d) { document.body.appendChild(d); }); apply(mode);
    var gm = document.getElementById('gearmenu');
    if (gm) gm.addEventListener('click', function (e) { var a = e.target.closest('[data-lcd]'); if (a) apply(a.dataset.lcd); });
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  return { set: apply, mode: function () { return mode; } };
})();
