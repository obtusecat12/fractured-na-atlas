// a4.js — 2009 chrome: tooltip, overview inset, link/print/send, about, nav stubs
(function () {
  function $(id) { return document.getElementById(id); }
  // ---- dead nav links do nothing (period chrome) ----
  document.querySelectorAll('#gnav a, #guser a, #sopts, #terms').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });
  // help / learn more: period chrome, do nothing
  ['help', 'learn'].forEach(function (id) { if ($(id)) $(id).onclick = function (e) { e.preventDefault(); }; });

  // ---- link / print / send ----
  function viewStr() {
    var c = S.t.invert([S.w / 2, S.h / 2]), ll = D.projInv ? D.projInv(c) : null;
    var z = Math.round(Math.log2(S.t.k / S.base0) * 10) / 10;
    return 'https://maps.northam.example/maps?ll=' + (ll ? ll[1].toFixed(4) + ',' + ll[0].toFixed(4) : Math.round(c[0]) + ',' + Math.round(c[1])) +
      '&z=' + z + '&t=' + ({ map: 'm', night: 'n', terrain: 'p' })[S.mode] + (S.info ? '&f=' + S.info.id : '');
  }
  var pj = D.proj;
  if (pj && d3.geoConicEqualArea) {
    var pr = d3.geoConicEqualArea().parallels(pj.parallels).rotate(pj.rotate).scale(pj.scale).translate(pj.translate);
    D.projInv = function (p) { return pr.invert(p); };
  }
  $('linklink').onclick = function (e) {
    e.preventDefault(); e.stopPropagation();
    var b = $('linkbox'); b.hidden = !b.hidden;
    if (!b.hidden) { $('linkurl').value = viewStr(); $('linkurl').select(); }
  };
  $('linkx').onclick = function (e) { e.preventDefault(); $('linkbox').hidden = true; };
  $('linkbox').addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { $('linkbox').hidden = true; });
  $('printlink').onclick = function (e) { e.preventDefault(); try { window.print(); } catch (x) {} };
  $('sendlink').onclick = function (e) {
    e.preventDefault();
    var a = document.createElement('a');
    a.href = 'mailto:?subject=' + encodeURIComponent('NorthAm 地图 Maps') + '&body=' + encodeURIComponent(viewStr());
    a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
  };

  // ---- grab / grabbing cursor ----
  canvas.addEventListener('mousedown', function () { canvas.classList.add('dragging'); });
  window.addEventListener('mouseup', function () { canvas.classList.remove('dragging'); });

  // ---- Vista-style tooltip on factions ----
  var tip = $('tip'), tT = null, last = null;
  canvas.addEventListener('mousemove', function (e) {
    if (e.buttons) { tip.hidden = true; return; }
    var r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    var p = S.t.invert([mx, my]), f = (p[0] >= 0 && p[1] >= 0 && p[0] < W && p[1] < H) ? hitTest(p[0], p[1]) : null;
    var id = f ? f.id : null;
    if (id !== last) { tip.hidden = true; clearTimeout(tT); last = id; }
    if (!f) return;
    clearTimeout(tT);
    tT = setTimeout(function () {
      tip.textContent = LANG.t(f.meta.zh, f.meta.en);
      tip.hidden = false;
      var x = mx + 2, y = my + 22;
      if (x + tip.offsetWidth > S.w - 4) x = S.w - 4 - tip.offsetWidth;
      if (y + tip.offsetHeight > S.h - 4) y = my - tip.offsetHeight - 6;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    }, 500);
  });
  canvas.addEventListener('mouseleave', function () { clearTimeout(tT); tip.hidden = true; last = null; });
  canvas.addEventListener('mousedown', function () { clearTimeout(tT); tip.hidden = true; });
  canvas.addEventListener('wheel', function () { clearTimeout(tT); tip.hidden = true; }, { passive: true });

  // ---- overview inset (bottom-right) ----
  var ov = $('ov'), oc = $('ovc'), ox = oc.getContext('2d'), OS = 142, ovBase = null;
  var ok = Math.min(OS / W, OS / H) * 1.25, otx = (OS - W * ok) / 2 + 6, oty = (OS - H * ok) / 2 - 2;
  function ovPaint() {
    var dpr = window.devicePixelRatio || 1;
    oc.width = OS * dpr; oc.height = OS * dpr; oc.style.width = OS + 'px'; oc.style.height = OS + 'px';
    if (!ovBase) {
      ovBase = document.createElement('canvas'); ovBase.width = oc.width; ovBase.height = oc.height;
      var b = ovBase.getContext('2d');
      b.fillStyle = '#A5BEDE'; b.fillRect(0, 0, ovBase.width, ovBase.height);
      b.setTransform(dpr * ok, 0, 0, dpr * ok, dpr * otx, dpr * oty);
      b.fillStyle = '#D6DFBD'; b.fill(P(D.countries));
      b.fillStyle = '#2A2A2A'; b.fill(P(D.nation));
      D.factions.forEach(function (f) { b.fillStyle = mix(f.meta.color, 0.55, '#D6DFBD'); b.fill(P(f)); });
      b.fillStyle = '#A5BEDE'; b.fill(P(D.lakes));
    }
    ox.setTransform(1, 0, 0, 1, 0, 0); ox.drawImage(ovBase, 0, 0);
    // viewport rectangle
    var a0 = S.t.invert([0, 0]), a1 = S.t.invert([S.w, S.h]);
    var x0 = otx + a0[0] * ok, y0 = oty + a0[1] * ok, x1 = otx + a1[0] * ok, y1 = oty + a1[1] * ok;
    ox.setTransform(dpr, 0, 0, dpr, 0, 0);
    ox.fillStyle = 'rgba(102,102,255,.22)'; ox.strokeStyle = '#4444FF'; ox.lineWidth = 1;
    ox.fillRect(x0, y0, x1 - x0, y1 - y0); ox.strokeRect(Math.round(x0) + .5, Math.round(y0) + .5, Math.round(x1 - x0), Math.round(y1 - y0));
  }
  function ovUpdate() { var op = !ov.classList.contains('closed'); $('mappane').classList.toggle('ovopen', op); if (op) ovPaint(); }
  $('ovt').onclick = function (e) { e.preventDefault(); ov.classList.toggle('closed'); ovUpdate(); };
  oc.addEventListener('click', function (e) {
    var r = oc.getBoundingClientRect(), mx = (e.clientX - r.left - otx) / ok, my = (e.clientY - r.top - oty) / ok;
    var k = S.t.k;
    sel.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(S.w / 2, S.h / 2).scale(k).translate(-mx, -my));
  });
  var _render = render, _quick = quickDraw;
  render = function () { _render(); ovUpdate(); };
  quickDraw = function () { _quick(); ovUpdate(); };
  if (window.innerWidth > 820) ov.classList.remove('closed');
  ovUpdate();
})();
