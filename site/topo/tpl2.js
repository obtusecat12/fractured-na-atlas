// topopage.js (v2.7) — NCS backbone status: 2.5D canvas diagram, Visio-2007/Cisco 3D raster stencils,
// perspective floor + extruded land slab, arcing cables with packets, animated 3D firewalls, burning nodes.
(window.CWSITES = window.CWSITES || {}).topo = function (W) {
  if (!window.ChromeWin) return;
  var D = __TOPO_DATA__;
  var VW = 880, VH = 520, R = 2;
  var TAB = W.open({ title: 'NCS-NOC :: Backbone Status', host: 'noc.ncs-ops.net', path: '/backbone/status.aspx',
    html: '<div style="background:#0a2b63;height:520px;overflow:hidden"><canvas class="ncs" width="' + VW * R + '" height="' + VH * R + '" style="width:' + VW + 'px;height:' + VH + 'px;display:block"></canvas></div>' });
  var cv = TAB.page.querySelector('canvas.ncs'); if (!cv) return;
  var ctx = cv.getContext('2d');
  function mk(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // ---------- perspective plane ----------
  var T = 0.74, sT = Math.sin(T), cT = Math.cos(T), F = 1250, K = 0.985, OY = 292, PCY = 260;
  function P(x, y) { var yr = y - PCY, s = F / (F - yr * sT) * K; return [VW / 2 + (x - VW / 2) * s, OY + yr * cT * s, s]; }
  function projectLayer(src) { // src: plane canvas at R; returns screen canvas at R
    var out = mk(VW * R, VH * R), o = out.getContext('2d');
    var top = P(0, 0)[1], bot = P(0, VH)[1];
    for (var Y = Math.floor(top * R); Y <= Math.ceil(bot * R); Y++) {
      var q = (Y / R - OY) / K, yr = q * F / (cT * F + q * sT), s = F / (F - yr * sT) * K, py = yr + PCY;
      if (py < 0 || py >= VH) continue;
      var w = VW * s; o.drawImage(src, 0, Math.floor(py * R), VW * R, 1, (VW / 2 - w / 2) * R, Y, w * R, 1.6);
    }
    return out;
  }
  var nation = new Path2D(D.nation), states = new Path2D(D.states);

  // ---------- icons ----------
  var IC = {}, left = 0;
  Object.keys(D.icons).forEach(function (k) { left++; var im = new Image(); im.onload = function () { if (!--left) boot(); }; im.src = D.icons[k].src; IC[k] = im; });

  var base, nodes, segs, fws, clouds = [], T0 = performance.now(), parts = [], sparks = [];
  function boot() {
    // floor plane
    var fl = mk(VW * R, VH * R), f = fl.getContext('2d'); f.scale(R, R);
    var fg = f.createLinearGradient(0, 0, 0, VH); fg.addColorStop(0, 'rgba(120,180,255,.10)'); fg.addColorStop(1, 'rgba(160,210,255,.22)');
    f.fillStyle = fg; f.fillRect(0, 0, VW, VH);
    f.strokeStyle = 'rgba(200,230,255,.16)'; f.lineWidth = .7; f.beginPath();
    for (var x = 0; x <= VW; x += 20) { f.moveTo(x, 0); f.lineTo(x, VH); }
    for (var y = 0; y <= VH; y += 20) { f.moveTo(0, y); f.lineTo(VW, y); }
    f.stroke(); f.strokeStyle = 'rgba(220,240,255,.5)'; f.lineWidth = 2; f.strokeRect(1, 1, VW - 2, VH - 2);
    // land plane
    var ld = mk(VW * R, VH * R), l = ld.getContext('2d'); l.scale(R, R);
    var lg = l.createLinearGradient(0, 40, 0, 480); lg.addColorStop(0, '#f4f9ff'); lg.addColorStop(.45, '#bcd9f6'); lg.addColorStop(1, '#7fb0e6');
    l.fillStyle = lg; l.fill(nation);
    l.save(); l.clip(nation); l.strokeStyle = 'rgba(40,90,170,.35)'; l.lineWidth = 6; l.filter = 'blur(3px)'; l.stroke(nation); l.restore();
    l.strokeStyle = 'rgba(70,120,190,.55)'; l.lineWidth = .7; l.stroke(states);
    l.strokeStyle = '#fff'; l.lineWidth = 1.8; l.stroke(nation);
    var FL = projectLayer(fl), LD = projectLayer(ld);
    // land silhouette for slab sides
    var sil = mk(VW * R, VH * R), si = sil.getContext('2d'); si.drawImage(LD, 0, 0); si.globalCompositeOperation = 'source-in';
    var sg = si.createLinearGradient(0, 0, 0, VH * R); sg.addColorStop(0, '#2a5fa8'); sg.addColorStop(1, '#0d2f66'); si.fillStyle = sg; si.fillRect(0, 0, VW * R, VH * R);
    // compose static base
    base = mk(VW * R, VH * R); var b = base.getContext('2d');
    var bg = b.createLinearGradient(0, 0, 0, VH * R); bg.addColorStop(0, '#5aa0ea'); bg.addColorStop(.5, '#1f5fb0'); bg.addColorStop(1, '#08244f');
    b.fillStyle = bg; b.fillRect(0, 0, VW * R, VH * R);
    var gl = b.createRadialGradient(VW, 0, 10, VW, 0, VW * 1.3); gl.addColorStop(0, 'rgba(255,255,255,.25)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); b.fillStyle = gl; b.fillRect(0, 0, VW * R, VH * R);
    // v2.8: no perspective floor grid
    b.save(); b.filter = 'blur(10px)'; b.globalAlpha = .55; b.drawImage(sil, 14 * R, 26 * R); b.restore(); // cast shadow
    for (var i = 12; i >= 1; i--) { b.globalAlpha = 1; b.drawImage(sil, 0, i * R * .9); }
    b.drawImage(LD, 0, 0);
    var vg = b.createRadialGradient(VW * R / 2, VH * R * .42, VH * R * .4, VW * R / 2, VH * R * .42, VW * R * .7);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.42)'); b.fillStyle = vg; b.fillRect(0, 0, VW * R, VH * R);

    // nodes / segments
    nodes = D.sites.map(function (s, i) { var p = P(s.x, s.y); return { i: i, s: s, x: p[0], y: p[1], k: p[2], burn: s.fire }; });
    var fwOn = {}; fws = D.fw.map(function (f) {
      var a = D.sites[f[0]], c = D.sites[f[1]], px = a.x + (c.x - a.x) * f[2], py = a.y + (c.y - a.y) * f[2], p = P(px, py);
      fwOn[f[0] + '-' + f[1]] = fwOn[f[1] + '-' + f[0]] = 1; return { a: f[0], b: f[1], x: p[0], y: p[1], k: p[2], hit: 0, ph: Math.random() * 6 };
    });
    function st(n) { return n.s.st; }
    function kind(A, B) { if (st(A) === 'gilead' || st(B) === 'gilead') return 'lost'; if (st(A) === 'silence' || st(B) === 'silence') return 'deg'; return 'up'; }
    function seg(A, B, kd, extra) { var dx = B.x - A.x, dy = B.y - A.y, d = Math.sqrt(dx * dx + dy * dy), h = Math.min(46, 8 + d * .2) * (A.k + B.k) / 2;
      return Object.assign({ ax: A.x, ay: A.y, bx: B.x, by: B.y, cx: (A.x + B.x) / 2, cy: (A.y + B.y) / 2 - h, kd: kd, d: d, ph: Math.random(), burn: A.burn || B.burn }, extra || {}); }
    clouds = (D.clouds || []).map(function (c) { var p = P(c.x, c.y); return { x: p[0], y: p[1], k: p[2], n: c.n, sub: c.sub, ph: Math.random() * 6 }; });
    segs = [];
    (D.clinks || []).forEach(function (l) { var C = clouds[l[0]], A = nodes[l[1]], kd = st(A) === 'gilead' ? 'lost' : st(A) === 'silence' ? 'deg' : 'up', fc = { x: C.x, y: C.y - 22 * C.k, k: C.k };
      segs.push(seg(A, fc, kd)); });
    D.links.forEach(function (l) {
      var A = nodes[l[0]], B = nodes[l[1]], kd = kind(A, B);
      if (fwOn[l[0] + '-' + l[1]]) { var fw = fws.filter(function (f) { return (f.a === l[0] && f.b === l[1]) || (f.a === l[1] && f.b === l[0]); })[0];
        var pa = fw.a === l[0] ? A : B, pb = fw.a === l[0] ? B : A, fp = { x: fw.x, y: fw.y - 10 * fw.k, k: fw.k };
        segs.push(seg(pa, fp, kd === 'lost' ? 'lost' : 'up')); segs.push(seg(pb, fp, kd, { atk: fw }));
      } else segs.push(seg(A, B, kd, (D.bolts || []).some(function (b) { return (b[0] === l[0] && b[1] === l[1]) || (b[0] === l[1] && b[1] === l[0]); }) ? { bolt: 1 } : null));
    });
    cv.addEventListener('mousemove', hover); cv.addEventListener('mouseleave', function () { hov = null; });
    requestAnimationFrame(loop);
  }
  function qp(s, t) { var u = 1 - t; return [u * u * s.ax + 2 * u * t * s.cx + t * t * s.bx, u * u * s.ay + 2 * u * t * s.cy + t * t * s.by]; }

  // ---------- drawing helpers ----------
  function shadow(x, y, rx) { var g = ctx.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, 'rgba(0,10,40,.55)'); g.addColorStop(1, 'rgba(0,10,40,0)');
    ctx.save(); ctx.translate(x, y); ctx.scale(1, .38); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rx, 0, 7); ctx.fill(); ctx.restore(); }
  function icon(name, x, y, w) { var m = D.icons[name], h = w * m.h / m.w; ctx.drawImage(IC[name], x - w / 2, y - h, w, h); return h; }
  function xmark(x, y, r) { ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(40,0,0,.85)'; ctx.lineWidth = r * .62; X(); var g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#ff8a7a'); g.addColorStop(.45, '#e8190f'); g.addColorStop(1, '#7c0500');
    ctx.strokeStyle = g; ctx.lineWidth = r * .44; X(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.moveTo(x - r * .8, y - r * .85); ctx.lineTo(x - r * .3, y - r * .35); ctx.moveTo(x + r * .8, y - r * .85); ctx.lineTo(x + r * .3, y - r * .35); ctx.stroke(); ctx.restore();
    function X() { ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); } }
  function qmark(x, y, r) { var g = ctx.createRadialGradient(x - r * .35, y - r * .4, 1, x, y, r * 1.1); g.addColorStop(0, '#fff7b8'); g.addColorStop(.55, '#f5c214'); g.addColorStop(1, '#9a6a00');
    ctx.fillStyle = g; ctx.strokeStyle = '#5a3d00'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(x, y - r * .45, r * .65, r * .38, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#3b2600'; ctx.font = 'bold ' + Math.round(r * 1.45) + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + r * .08); }
  function label(t, x, y, sz, col, bold) { ctx.font = (bold ? 'bold ' : '') + sz + 'px Tahoma,Verdana,"Segoe UI",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(4,28,70,.92)'; ctx.lineWidth = 3; ctx.strokeText(t, x, y); ctx.fillStyle = col; ctx.fillText(t, x, y); }

  var COL = { up: ['#0b3a1a', '#4fd04a', '#d9ffd0'], deg: ['#4a3500', '#ffd23f', '#fff4c0'], lost: ['#3d0400', '#ff4a3a', '#ffd0c8'] };
  function drawSeg(s, t) {
    var c = COL[s.kd], dash = s.kd !== 'up';
    // floor shadow
    ctx.strokeStyle = 'rgba(0,15,50,.22)'; ctx.lineWidth = 3; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(s.ax, s.ay + 2); ctx.lineTo(s.bx, s.by + 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s.ax, s.ay); ctx.quadraticCurveTo(s.cx, s.cy, s.bx, s.by);
    ctx.setLineDash(dash ? [7, 5] : []); ctx.lineDashOffset = dash ? -t * 14 : 0;
    ctx.strokeStyle = c[0]; ctx.lineWidth = 4.6; ctx.globalAlpha = .8; ctx.stroke(); ctx.globalAlpha = 1;
    var main = c[1]; if (s.burn && s.kd === 'up') main = (Math.sin(t * 9 + s.ph * 6) > 0) ? '#ff9a2a' : '#4fd04a';
    ctx.strokeStyle = main; ctx.lineWidth = 2.6; ctx.stroke();
    if (!dash) { ctx.save(); ctx.translate(0, -.8); ctx.strokeStyle = c[2]; ctx.globalAlpha = .75; ctx.lineWidth = .8; ctx.stroke(); ctx.restore(); }
    ctx.setLineDash([]);
  }
  function drawPackets(s, t) {
    if (s.kd === 'lost') return;
    var n = s.atk ? 3 : (s.kd === 'up' ? 2 : 1), sp = (s.kd === 'up' ? 60 : 25) / Math.max(40, s.d);
    for (var i = 0; i < n; i++) {
      var u = (t * sp + s.ph + i / n) % 1, red = !!s.atk; // seg(outside, fw): packets arrive at fw when u->1
      var p = qp(s, u), g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], red ? 6 : 5);
      g.addColorStop(0, red ? 'rgba(255,240,220,1)' : 'rgba(255,255,255,1)'); g.addColorStop(.35, red ? 'rgba(255,60,30,.9)' : (s.kd === 'up' ? 'rgba(120,255,140,.85)' : 'rgba(255,220,80,.8)')); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], red ? 6 : 5, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
      if (red && u > .97 && !s._hitLock) { s._hitLock = 1; burst(s.bx, s.by, 10); s.atk.hit = 1; }
      if (red && u < .5) s._hitLock = 0;
    }
  }
  function burst(x, y, n) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, v = 1 + Math.random() * 2.4; sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, l: 1 }); } }

  // ---------- firewall ----------
  var fwTmp = mk(160, 100), ft = fwTmp.getContext('2d');
  function drawFW(f, t) {
    var w = 20 * f.k, m = D.icons.firewall, h = w * m.h / m.w, x = f.x, y = f.y + 6 * f.k;
    // ground glow pulse
    var pulse = .5 + .5 * Math.sin(t * 3 + f.ph) + f.hit * 1.2;
    var gg = ctx.createRadialGradient(x, y, 0, x, y, w * 1.6); gg.addColorStop(0, 'rgba(255,120,30,' + (.22 * pulse).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.save(); ctx.translate(x, y); ctx.scale(1, .42); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, w * 1.6, 0, 7); ctx.fill(); ctx.restore();
    shadow(x + 3, y, w * .9);
    // icon with moving gloss sweep + heat tint
    var tw = Math.ceil(w * R), th = Math.ceil(h * R); fwTmp.width = tw; fwTmp.height = th;
    ft.drawImage(IC.firewall, 0, 0, tw, th); ft.globalCompositeOperation = 'source-atop';
    var sx = ((t * .45 + f.ph) % 1.6 - .3) * tw, sw = ft.createLinearGradient(sx - tw * .25, 0, sx + tw * .25, th * .6);
    sw.addColorStop(0, 'rgba(255,255,255,0)'); sw.addColorStop(.5, 'rgba(255,255,255,.55)'); sw.addColorStop(1, 'rgba(255,255,255,0)'); ft.fillStyle = sw; ft.fillRect(0, 0, tw, th);
    if (f.hit > 0) { ft.fillStyle = 'rgba(255,230,120,' + (f.hit * .55).toFixed(3) + ')'; ft.fillRect(0, 0, tw, th); }
    ft.globalCompositeOperation = 'source-over';
    ctx.drawImage(fwTmp, x - w / 2, y - h, w, h);
    // flames licking along the top edge
    if (Math.random() < .6) parts.push({ x: x + (Math.random() - .5) * w * .6, y: y - h * .9, vx: (Math.random() - .5) * .2, vy: -(.3 + Math.random() * .4) * f.k, l: .7, dl: .06 + Math.random() * .04, s: (1.8 + Math.random() * 1.6) * f.k, smoke: 0, fw: 1 });
    f.hit = Math.max(0, f.hit - .06);
  }
  function emitFire(n, top) {
    for (var i = 0; i < 3; i++) parts.push({ x: n.x + (Math.random() - .5) * 14 * n.k, y: top + Math.random() * 3, vx: (Math.random() - .5) * .35, vy: -(.6 + Math.random() * 1.1) * n.k, l: 1, dl: .028 + Math.random() * .03, s: (4.5 + Math.random() * 5) * n.k, smoke: 0 });
    var gx = ctx.createRadialGradient(n.x, top + 2, 0, n.x, top + 2, 16 * n.k), fa = .28 + Math.random() * .14; gx.addColorStop(0, 'rgba(255,170,60,' + fa.toFixed(3) + ')'); gx.addColorStop(1, 'rgba(255,90,0,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gx; ctx.beginPath(); ctx.arc(n.x, top + 2, 16 * n.k, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    if (Math.random() < .7) parts.push({ x: n.x + (Math.random() - .5) * 10, y: top - 14, vx: .25 + Math.random() * .3, vy: -(.5 + Math.random() * .5), l: 1, dl: .012 + Math.random() * .01, s: 5 * n.k, smoke: 1 });
  }
  function drawParts() {
    var keep = [];
    ctx.globalCompositeOperation = 'source-over';
    parts.forEach(function (p) { if (!p.smoke) return; var a = p.l * .5, r = p.s * (2.6 - 1.4 * p.l);
      ctx.fillStyle = 'rgba(40,40,46,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); });
    ctx.globalCompositeOperation = 'source-over';
    parts.forEach(function (p) { if (p.smoke) return; var l = p.l, r = p.s * (.35 + l * .75);
      var c = l > .8 ? [255, 220, 120] : l > .55 ? [255, 160, 40] : l > .25 ? [255, 110, 20] : [190, 30, 10];
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, 'rgba(' + c + ',' + (l * (p.fw ? .5 : .55)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill(); });
    sparks.forEach(function (p) { ctx.fillStyle = 'rgba(255,' + (180 + 70 * p.l | 0) + ',80,' + p.l.toFixed(3) + ')'; ctx.fillRect(p.x - 1, p.y - 1, 2, 2); });
    ctx.globalCompositeOperation = 'source-over';
    parts.forEach(function (p) { p.x += p.vx + Math.sin(p.y * .15) * .15; p.y += p.vy; p.l -= p.dl; if (p.l > 0) keep.push(p); }); parts = keep.length > 900 ? keep.slice(-900) : keep;
    sparks = sparks.filter(function (p) { p.x += p.vx; p.y += p.vy; p.vy += .12; p.l -= .05; return p.l > 0; });
  }

  // ---------- frame ----------
  var hov = null, last = 0;
  function hover(e) { var r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top; hov = null;
    nodes.forEach(function (n) { if (Math.abs(n.x - mx) < 16 && my < n.y + 4 && my > n.y - 46) hov = n; }); }
  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || !cv.offsetParent || now - last < 33) return; last = now;
    var t = (now - T0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0); ctx.setTransform(R, 0, 0, R, 0, 0);
    // ripples for live towers (on floor)
    nodes.forEach(function (n) { if (n.s.t !== 'tw' || n.s.st !== 'ok') return; for (var k = 0; k < 2; k++) { var u = (t * .6 + k * .5 + n.i * .13) % 1;
      ctx.save(); ctx.translate(n.x, n.y); ctx.scale(1, .4); ctx.strokeStyle = 'rgba(200,240,255,' + (0.7 * (1 - u)).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 4 + u * 24 * n.k, 0, 7); ctx.stroke(); ctx.restore(); } });
    // burn rings
    nodes.forEach(function (n) { if (!n.burn) return; var u = (t * .9) % 1; ctx.save(); ctx.translate(n.x, n.y); ctx.scale(1, .4); ctx.strokeStyle = 'rgba(255,60,30,' + (0.9 * (1 - u)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8 + u * 26, 0, 7); ctx.stroke(); ctx.restore(); });
    segs.forEach(function (s) { drawSeg(s, t); });
    segs.forEach(function (s) { drawPackets(s, t); });
    segs.forEach(function (s) { if (!s.bolt) return; var p = qp(s, .5), bw = 64, bh = bw * D.icons.bolt.h / D.icons.bolt.w, fl = .75 + .25 * Math.sin(t * 7 + s.ph * 9);
      ctx.globalAlpha = s.kd === 'lost' ? .45 : fl; ctx.drawImage(IC.bolt, p[0] - bw / 2, p[1] - bh / 2, bw, bh); ctx.globalAlpha = 1; });
    // depth-sorted objects
    var objs = clouds.map(function (c) { return { y: c.y, c: c }; }).concat(nodes.map(function (n) { return { y: n.y, n: n }; })).concat(fws.map(function (f) { return { y: f.y + 6, f: f }; })).sort(function (a, b) { return a.y - b.y; });
    objs.forEach(function (o) {
      if (o.f) { drawFW(o.f, t); return; }
      if (o.c) { var c = o.c, cw = 56 * c.k, ch = cw * D.icons.cloud.h / D.icons.cloud.w, bob = Math.sin(t * .8 + c.ph) * 2; shadow(c.x + 4, c.y + 4, cw * .45);
        ctx.drawImage(IC.cloud, c.x - cw / 2, c.y - ch - 14 * c.k + bob, cw, ch); label(c.n, c.x, c.y + 10, 9.5, '#fff', 1); if (c.sub) label(c.sub, c.x, c.y + 20, 8, '#d8ecff'); return; }
      var n = o.n, s = n.s, k = n.k, h;
      if (s.t === 'ix') { shadow(n.x + 2, n.y, 22 * k); h = icon('router', n.x, n.y + 4 * k, 34 * k); }
      else if (s.t === 'dc') { shadow(n.x + 3, n.y, 18 * k); h = icon('rack', n.x, n.y + 3 * k, 24 * k); }
      else { shadow(n.x + 2, n.y, 9 * k); h = icon('tower', n.x, n.y + 2 * k, 14 * k); }
      n.top = n.y - h + 4 * k;
      if (n.burn) emitFire(n, n.top + h * .25);
      if (s.st === 'gilead') xmark(n.x, n.y - h * .5, 9 * k);
      else if (s.st === 'silence') qmark(n.x + (s.t === 'tw' ? 8 : 13) * k, n.top + 2, 7.5 * k);
    });
    drawParts();
    // labels
    nodes.forEach(function (n) { var s = n.s; if (s.t === 'tw' && hov !== n) return;
      var o = OFF2[s.n.split(',')[0]] || [0, 0], lx = n.x + o[0], ly = n.y + 15 + o[1];
      label(s.n, lx, ly, 9.5, hov === n ? '#ffffa0' : '#fff', 1); if (s.sub) label(s.sub, lx, ly + 10, 8, '#d8ecff');
      if (n.burn && Math.sin(t * 6) > -.3) { ctx.font = 'bold 8px Tahoma,Verdana,sans-serif'; var tw = ctx.measureText('DDoS · CRITICAL').width + 8, bx = n.x > 600 ? n.x - tw - 12 : n.x + 10, by = n.top - 22;
        var bg = ctx.createLinearGradient(0, by, 0, by + 12); bg.addColorStop(0, '#ff6a5a'); bg.addColorStop(.5, '#d40d02'); bg.addColorStop(1, '#8c0500');
        ctx.fillStyle = bg; ctx.strokeStyle = '#3d0000'; ctx.lineWidth = 1; rr(bx, by, tw, 12, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('DDoS · CRITICAL', bx + tw / 2, by + 9); }
    });
    chrome(t);
  }
  var OFF2 = { Quincy: [30, -18], 'New York': [40, -4], Boston: [36, -10], Washington: [36, 6], Seattle: [-34, 0], Houston: [24, 4], 'San Antonio': [-24, 0], Denver: [-26, -2], 'Colorado Springs': [-6, 4], 'Council Bluffs': [-20, -4], 'Kansas City': [10, 2], Lenoir: [-46, -4], 'Santa Clara': [-22, 0], 'Las Vegas': [22, -2], Ashburn: [-60, -10], 'The Dalles': [-14, 2], Chicago: [8, 0] };
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function glossPanel(x, y, w, h) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2c68b8'); g.addColorStop(.5, '#123f86'); g.addColorStop(.51, '#0b326f'); g.addColorStop(1, '#0d3a7c');
    ctx.fillStyle = g; rr(x, y, w, h, 5); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#a9cff5'; ctx.lineWidth = 1; rr(x + .5, y + .5, w - 1, h - 1, 5); ctx.stroke();
    var hl = ctx.createLinearGradient(0, y, 0, y + h * .5); hl.addColorStop(0, 'rgba(255,255,255,.38)'); hl.addColorStop(1, 'rgba(255,255,255,.05)'); ctx.fillStyle = hl; rr(x + 1, y + 1, w - 2, h * .5, 4); ctx.fill();
  }
  function chrome(t) {
    glossPanel(12, 10, VW - 24, 30);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = 'bold 13px Tahoma,Verdana,sans-serif'; ctx.fillStyle = '#04204a'; ctx.fillText('NATIONAL COMMUNICATIONS SYSTEM · BACKBONE STATUS', 27, 31); ctx.fillStyle = '#fff'; ctx.fillText('NATIONAL COMMUNICATIONS SYSTEM · BACKBONE STATUS', 26, 30);
    ctx.textAlign = 'right'; ctx.font = '10px Tahoma,Verdana,sans-serif'; ctx.fillStyle = '#cfe6ff';
    var sec = (12 * 60 + Math.floor(t)) % 3600, ts = '11/04/2009 17:' + ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + sec % 60).slice(-2) + ' EST';
    ctx.fillText('NCS-NOC · ' + ts, VW - 46, 29);
    var on = Math.sin(t * 5) > 0, lg = ctx.createRadialGradient(VW - 33, 23, 1, VW - 32, 25, 6); lg.addColorStop(0, on ? '#ffd0c0' : '#a05040'); lg.addColorStop(.5, on ? '#ff2a10' : '#6a1006'); lg.addColorStop(1, on ? '#7a0600' : '#300300');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(VW - 32, 25, 5.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#200'; ctx.stroke();
    return; // v2.8: legend removed
    var lx = VW - 268, ly = VH - 64; glossPanel(lx, ly, 256, 54);
    function row(i, j, draw, txt) { var x = lx + 10 + j * 84, y = ly + 8 + i * 16; draw(x, y); ctx.textAlign = 'left'; ctx.font = '9px Tahoma,Verdana,sans-serif'; ctx.fillStyle = '#eaf4ff'; ctx.fillText(txt, x + 20, y + 10); }
    row(0, 0, function (x, y) { ctx.drawImage(IC.router, x, y, 16, 15); }, 'Exchange');
    row(0, 1, function (x, y) { ctx.drawImage(IC.rack, x + 3, y - 1, 9, 15); }, 'Data center');
    row(0, 2, function (x, y) { ctx.drawImage(IC.tower, x + 5, y - 1, 4, 15); }, 'Relay');
    row(1, 0, function (x, y) { ctx.drawImage(IC.firewall, x, y + 2, 18, 10); }, 'Firewall');
    row(1, 1, function (x, y) { ctx.strokeStyle = '#4fd04a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x + 16, y + 7); ctx.stroke(); }, 'Up');
    row(1, 2, function (x, y) { ctx.setLineDash([4, 3]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x + 16, y + 7); ctx.stroke(); ctx.setLineDash([]); }, 'Degraded');
    row(2, 0, function (x, y) { xmark(x + 8, y + 6, 5); }, 'Lost');
    row(2, 1, function (x, y) { qmark(x + 8, y + 6, 5.5); }, 'No telemetry');
    row(2, 2, function (x, y) { var g = ctx.createRadialGradient(x + 8, y + 8, 0, x + 8, y + 8, 7); g.addColorStop(0, '#fff2a0'); g.addColorStop(.5, '#ff7a10'); g.addColorStop(1, 'rgba(200,30,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + 8, y + 7, 7, 0, 7); ctx.fill(); }, 'Under attack');
  }
  return TAB;
};
