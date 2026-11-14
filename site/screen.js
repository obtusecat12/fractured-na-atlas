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
  var blobs = [];
  for (var b = 0; b < 6; b++) blobs.push('radial-gradient(' + (18 + Math.random() * 22 | 0) + '% ' + (14 + Math.random() * 18 | 0) + '% at ' +
    (8 + Math.random() * 84 | 0) + '% ' + (10 + Math.random() * 80 | 0) + '%, rgba(150,165,190,.55), rgba(150,165,190,0) 70%)');
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
    '';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function apply(m) {
    mode = m; H.classList.toggle('lcd-off', m === 'off'); H.classList.toggle('lcd-strong', m === 'strong');
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
