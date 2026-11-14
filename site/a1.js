// a1.js — data + rendering
var W = 4000, H = 3584, KM_PER_UNIT = 6371 / 2719.79;
var S = { mode: 'map', t: d3.zoomIdentity, base: 1, w: 0, h: 0, dpr: 1, info: null,
  opt: { counties: false, rivers: true, cities: true, flabels: true }, gesture: false, pending: false };
var D = {};
var canvas = document.getElementById('map'), ctx = canvas.getContext('2d');
var path = d3.geoPath(null, ctx), gpath = d3.geoPath(), P2 = new Map();
// cached Path2D per feature, built in map space
function P(f) {
  var p = P2.get(f);
  if (!p) { p = new Path2D(gpath(f) || ''); P2.set(f, p); }
  return p;
}
function Pmany(key, list) {
  var p = P2.get(key);
  if (!p) { p = new Path2D(); list.forEach(function (f) { p.addPath(P(f)); }); P2.set(key, p); }
  return p;
}
function snapCanvas(c) {
  c = c || document.createElement('canvas');
  if (c.width !== canvas.width || c.height !== canvas.height) { c.width = canvas.width; c.height = canvas.height; }
  return c;
}

function J(id) { return JSON.parse(document.getElementById(id).textContent); }

function mix(hex, a, bg) {
  var c = d3.rgb(hex), b = d3.rgb(bg || '#F2EFE9');
  return d3.rgb(b.r + (c.r - b.r) * a, b.g + (c.g - b.g) * a, b.b + (c.b - b.b) * a).toString();
}

function bestRing(f) {
  var g = f.geometry, polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates, best = null, ba = 0;
  polys.forEach(function (p) { var a = Math.abs(d3.polygonArea(p[0])); if (a > ba) { ba = a; best = p[0]; } });
  return { c: best ? d3.polygonCentroid(best) : [0, 0], a: ba };
}

function initData() {
  var topo = J('topo'); D.topo = topo;
  D.meta = J('meta'); D.cities = J('cities'); D.proj = J('proj'); D.extras = J('extras');
  if (D.proj.scale) KM_PER_UNIT = 6371 / D.proj.scale;
  var o = topo.objects, fc = function (k) { return o[k] ? topojson.feature(topo, o[k]) : { type: 'FeatureCollection', features: [] }; };
  D.factions = fc('factions').features;
  D.hatch = fc('hatch');
  D.nation = fc('nation');
  D.countries = fc('countries');
  D.lakes = fc('lakes');
  D.rivers = fc('rivers');
  D.provinces = o.provinces ? topojson.mesh(topo, o.provinces, function (a, b) { return a !== b; }) : null;
  D.states = o.states ? topojson.mesh(topo, o.states, function (a, b) { return a !== b; }) : null;
  D.borders = o.countries ? topojson.mesh(topo, o.countries, function (a, b) { return a !== b; }) : null;
  D.byId = {};
  D.meta.factions.forEach(function (m, i) { m.idx = i; m.letter = i < 26 ? String.fromCharCode(65 + i) : 'A' + String.fromCharCode(65 + i - 26); D.byId[m.id] = m; });
  D.factions.forEach(function (f) {
    var m = D.byId[f.id] || { id: f.id, zh: f.id, en: f.id, color: '#888' };
    f.meta = m; m.feature = f;
    var r = bestRing(f); f.label = r.c;
    var b = d3.geoPath().bounds(f); m.bounds = b;
    m.area = d3.geoPath().area(f);
  });
  // radio silence label spots: largest "none" counties, spread apart
  D.silence = [];
  if (o.counties) {
    var cs = topojson.feature(topo, o.counties).features.filter(function (c) { return c.properties.f === 'none'; });
    var gp = d3.geoPath();
    cs.forEach(function (c) { c._a = gp.area(c); });
    cs.sort(function (a, b) { return b._a - a._a; });
    for (var i = 0; i < cs.length && D.silence.length < 3; i++) {
      var p = gp.centroid(cs[i]);
      if (D.silence.every(function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1]) > 500; })) D.silence.push(p);
    }
  }
  D.relief = new Image();
  D.relief.onload = function () { if (S.mode !== 'map') render(); };
  D.relief.src = window.RELIEF_SRC;
  D.hit = document.createElement('canvas');
}

function lw(px) { ctx.lineWidth = px / S.t.k; }

function fillF(f, color) { ctx.fillStyle = color; ctx.fill(P(f)); }
function strokeF(f, color, px, dash) {
  ctx.strokeStyle = color; lw(px);
  ctx.setLineDash(dash ? dash.map(function (d) { return d / S.t.k; }) : []); ctx.stroke(P(f)); ctx.setLineDash([]);
}

function countyMesh() {
  if (D.counties === undefined) {
    var o = D.topo.objects;
    D.counties = o.counties ? topojson.mesh(D.topo, o.counties, function (a, b) { return a !== b; }) : null;
  }
  return D.counties;
}

function drawHatch(color) {
  if (!D.hatch.features.length) return;
  ctx.save(); ctx.clip(P(D.hatch));
  var b = d3.geoPath().bounds(D.hatch), step = 8 / S.t.k;
  ctx.beginPath();
  for (var x = b[0][0] - (b[1][1] - b[0][1]); x < b[1][0]; x += step) {
    ctx.moveTo(x, b[1][1]); ctx.lineTo(x + (b[1][1] - b[0][1]), b[0][1]);
  }
  ctx.strokeStyle = color || 'rgba(70,120,60,.45)'; lw(1.5); ctx.stroke();
  ctx.restore();
}

function drawBase() {
  var t = S.t, k = t.k, dpr = S.dpr, terr = S.mode === 'terrain', night = S.mode === 'night';
  var ocean = night ? '#02050B' : '#A5BEDE', z = k / S.base0;
  var relief = D.relief.complete && D.relief.naturalWidth;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = ocean; ctx.fillRect(0, 0, S.w, S.h);
  ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * t.x, dpr * t.y);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (night) {
    var nl = '#0B0F16';
    fillF(D.countries, nl);
    fillF(D.nation, '#050505');
    D.factions.forEach(function (f) { fillF(f, nl); });
    if (relief) {
      ctx.save(); ctx.clip(Pmany('_land', [D.countries, D.nation].concat(D.factions)));
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.12; ctx.drawImage(D.relief, 0, 0, W, H);
      ctx.restore();
    }
    drawHatch('rgba(120,160,110,.12)');
    fillF(D.lakes, ocean);
    if (S.opt.rivers && k > 1.5 && D.rivers.features.length) strokeF(D.rivers, '#0E1C30', 1);
    if (S.opt.counties && z >= 3 && countyMesh()) strokeF(D.counties, 'rgba(255,255,255,.06)', 0.6);
    if (D.provinces) strokeF(D.provinces, 'rgba(255,255,255,.07)', 1, [3, 3]);
    if (D.states) strokeF(D.states, 'rgba(255,255,255,.07)', 1, [3, 3]);
    ctx.globalAlpha = 0.45;
    D.factions.forEach(function (f) { strokeF(f, f.meta.color, 1); });
    ctx.globalAlpha = 1;
    if (D.borders) strokeF(D.borders, 'rgba(140,150,170,.35)', 1.2);
    strokeF(D.nation, 'rgba(140,150,170,.35)', 1.2);
    return;
  }
  var land = terr ? '#E9E8D6' : '#DEE3BD';
  fillF(D.countries, land);
  fillF(D.nation, terr ? '#3a3a3a' : '#262626');
  if (terr && relief) {
    ctx.save(); ctx.clip(Pmany('_cn', [D.countries, D.nation]));
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(D.relief, 0, 0, W, H);
    ctx.restore();
  }
  D.factions.forEach(function (f) {
    var m = f.meta;
    if (terr) { ctx.globalAlpha = 1; fillF(f, land); ctx.globalAlpha = 0.15; fillF(f, m.color); ctx.globalAlpha = 1; }
    else { fillF(f, land); ctx.globalAlpha = f.id === 'mxo' ? 0.45 : 0.4; fillF(f, m.color); ctx.globalAlpha = 1; }
  });
  if (terr && relief) {
    ctx.save(); ctx.clip(Pmany('_fa', D.factions));
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(D.relief, 0, 0, W, H);
    ctx.restore();
  }
  drawHatch();
  fillF(D.lakes, '#A5BEDE');
  if (S.opt.rivers && k > 1.5 && D.rivers.features.length) strokeF(D.rivers, '#A5BEDE', 1);
  if (S.opt.counties && z >= 3 && countyMesh()) strokeF(D.counties, 'rgba(0,0,0,.12)', 0.6);
  if (D.provinces) strokeF(D.provinces, '#B5B0C0', 1, [3, 3]);
  if (D.states) strokeF(D.states, terr ? '#9a9590' : '#B5B0C0', 1, [3, 3]);
  ctx.globalAlpha = 0.85;
  D.factions.forEach(function (f) { strokeF(f, f.meta.color, f.meta.area < 30000 ? 1.1 : 2.5); });
  ctx.globalAlpha = 1;
  if (D.borders) strokeF(D.borders, '#A29DB5', 1.5);
  strokeF(D.nation, '#A29DB5', 1.5);
}

function render() {
  S.pending = false;
  drawBase();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  var night = S.mode === 'night';
  if (night && window.Lights) Lights.drawStatic();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // cache base layer and label layer so the animations (static, hatch, lights) only blit
  S.baseSnap = snapCanvas(S.baseSnap);
  var bc = S.baseSnap.getContext('2d'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.drawImage(canvas, 0, 0);
  S.labelSnap = snapCanvas(S.labelSnap);
  var lc = S.labelSnap.getContext('2d'), keep = ctx;
  lc.setTransform(1, 0, 0, 1, 0, 0); lc.clearRect(0, 0, S.labelSnap.width, S.labelSnap.height);
  ctx = lc; drawLabels(); ctx = keep;
  if (window.FX) { FX.rebuildMask(); FX.draw(); }
  if (night && window.Lights) Lights.drawAnim();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(S.labelSnap, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  S.frame = snapCanvas(S.frame);
  var fc = S.frame.getContext('2d'); fc.setTransform(1, 0, 0, 1, 0, 0); fc.drawImage(canvas, 0, 0);
  S.frameT = S.t;
  updateScale(); updateInfoPos(); if (window.updateSlider) updateSlider();
  if (window.Lights) Lights.sync();
  if (window.FX) FX.start();
}

// during a zoom gesture: draw the last full frame scaled/translated
function quickDraw() {
  var t = S.t, t0 = S.frameT, r = t.k / t0.k, dpr = S.dpr;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = S.mode === 'night' ? '#02050B' : '#A5BEDE'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(S.frame, (t.x - r * t0.x) * dpr, (t.y - r * t0.y) * dpr, S.frame.width * r, S.frame.height * r);
  updateScale(); updateInfoPos(); if (window.updateSlider) updateSlider();
}

function halo(txt, x, y, font, fill, ls) {
  ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (ls != null && 'letterSpacing' in ctx) ctx.letterSpacing = ls + 'px';
  var night = S.mode === 'night';
  ctx.lineWidth = night ? 2 : 3; ctx.strokeStyle = night ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.95)'; ctx.lineJoin = 'round';
  if (night) fill = fill === '#ccc' ? '#6a6a6a' : '#fff';
  else if (fill !== '#ccc') ctx.strokeText(txt, x, y);
  if (night && fill === '#fff') ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
}

// names that sit inside the radio-silence zone: vertically stretched, ghosted, sliced
function inSilence(o) {
  if (o._sil != null) return o._sil;
  var g = (inSilence.c || (inSilence.c = document.createElement('canvas').getContext('2d')));
  o._sil = g.isPointInPath(P(D.nation), o.x, o.y) && !D.factions.some(function (f) { return g.isPointInPath(P(f), o.x, o.y); });
  return o._sil;
}
function glitchText(txt, x, y, px, fill, night) {
  var h = 0; for (var i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) >>> 0;
  function rnd() { h = (h * 1103515245 + 12345) >>> 0; return h / 4294967296; }
  ctx.save(); ctx.translate(x, y); ctx.scale(0.86, 1.45);
  ctx.font = (px + 1) + 'px "Arial Narrow","Nimbus Sans Narrow",Arial,"Microsoft YaHei",sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  var w = ctx.measureText(txt).width;
  ctx.lineWidth = 2.4; ctx.strokeStyle = night ? 'rgba(0,0,0,.9)' : 'rgba(0,0,0,.75)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 0);
  ctx.globalAlpha = 0.55; ctx.fillStyle = '#ff2a3c'; ctx.fillText(txt, -1, 0); ctx.fillStyle = '#20e0ff'; ctx.fillText(txt, 1, 0);
  ctx.globalAlpha = 1;
  // three horizontal slices, each nudged sideways
  var bands = [-px * 0.6, -px * 0.18, px * 0.12, px * 0.6];
  for (var b = 0; b < 3; b++) {
    ctx.save(); ctx.beginPath(); ctx.rect(-4, bands[b], w + 8, bands[b + 1] - bands[b]); ctx.clip();
    ctx.fillStyle = fill; ctx.fillText(txt, (rnd() - 0.5) * 3.2, 0); ctx.restore();
  }
  // dropout line
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(-2, (rnd() - 0.5) * px * 0.7, w + 4, 0.8);
  ctx.restore();
  return w * 0.86;
}

function drawLabels() {
  var t = S.t, dpr = S.dpr, boxes = [];
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  function free(b, test) {
    for (var i = 0; i < boxes.length; i++) { var q = boxes[i]; if (b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]) return false; }
    if (!test) boxes.push(b); return true;
  }
  var FONT = 'Arial,"SimSun","Songti SC","Microsoft YaHei",sans-serif';
  var z0 = t.k / S.base0, night0 = S.mode === 'night';
  // nuclear strike zones
  (D.extras.nuclear || []).forEach(function (n) {
    var x = t.applyX(n.x), y = t.applyY(n.y); if (x < -40 || x > S.w + 40 || y < -40 || y > S.h + 40) return;
    var rr = Math.max(9, n.r * 1.7 * t.k);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.setLineDash([3, 3]);
    ctx.strokeStyle = night0 ? 'rgba(255,210,0,.5)' : 'rgba(120,90,0,.7)'; ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x, y, 7.5, 0, 7); ctx.fillStyle = '#FFD200'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#000';
    for (var a = 0; a < 3; a++) { var a0 = -Math.PI / 2 + a * 2 * Math.PI / 3 - 0.52; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 6, a0, a0 + 1.05); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y, 1.9, 0, 7); ctx.fillStyle = '#FFD200'; ctx.fill(); ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 7); ctx.fillStyle = '#000'; ctx.fill();
    ctx.restore();
    boxes.push([x - 9, y - 9, x + 9, y + 9]);
    if (z0 >= 1.6) {
      var lm = LANG.mode(), nz = lm === 'en' ? '' : n.zh, ne = lm === 'zh' ? '' : n.en, two = nz && ne;
      ctx.font = '11px ' + FONT; var w1 = Math.max(ctx.measureText(nz).width, ctx.measureText(ne).width);
      if (free([x + 10, y - (two ? 13 : 7), x + 14 + w1, y + (two ? 13 : 7)])) {
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = night0 ? 'rgba(0,0,0,.85)' : '#fff';
        ctx.fillStyle = night0 ? '#FFD200' : '#5a4300';
        if (inSilence(n)) { if (nz) glitchText(nz, x + 11, two ? y - 7 : y, 11, '#FFD200', night0); if (ne) glitchText(ne, x + 11, two ? y + 8 : y, 10, '#FFD200', night0); }
        else {
        if (nz) { ctx.strokeText(nz, x + 11, two ? y - 6 : y); ctx.fillText(nz, x + 11, two ? y - 6 : y); }
        if (ne) { ctx.font = '10px ' + FONT; ctx.strokeText(ne, x + 11, two ? y + 7 : y); ctx.fillText(ne, x + 11, two ? y + 7 : y); }
        }
      }
    }
  });
  // towns on the thin corridor links: heavier dots
  (D.extras.towns || []).forEach(function (c) {
    if (z0 < 1.3) return;
    var x = t.applyX(c.x), y = t.applyY(c.y); if (x < 0 || x > S.w || y < 0 || y > S.h) return;
    var m = D.byId[c.f], col = m ? m.color : '#333';
    ctx.beginPath(); ctx.arc(x, y, z0 < 2.2 ? 3 : 4.2, 0, 7); ctx.fillStyle = night0 ? '#ffd27a' : '#fff'; ctx.fill();
    ctx.lineWidth = 1.8; ctx.strokeStyle = night0 ? '#000' : col; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 1.2, 0, 7); ctx.fillStyle = night0 ? '#000' : col; ctx.fill();
    boxes.push([x - 5, y - 5, x + 5, y + 5]);
    if (z0 >= 2.2) {
      var txt = LANG.t(c.zh, c.en); ctx.font = '11px ' + FONT; var w = ctx.measureText(txt).width;
      if (free([x + 6, y - 7, x + 10 + w, y + 7])) {
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 3; ctx.strokeStyle = night0 ? 'rgba(0,0,0,.85)' : '#fff';
        ctx.strokeText(txt, x + 7, y); ctx.fillStyle = night0 ? '#fff' : '#222'; ctx.fillText(txt, x + 7, y);
      }
    }
  });
  // factions, then radio silence (cartographic placement, labels.js)
  if (S.opt.flabels) LBL.factions(free);
  // v2.3: no small silence labels; the big background word (fx.js) replaces them
  // cities
  var z = t.k / S.base0, night = S.mode === 'night';
  if (S.opt.cities) D.cities.forEach(function (c) {
    if ((c.rank === 2 && z < 2.5) || (c.rank === 3 && z < 5)) return;
    var x = t.applyX(c.x), y = t.applyY(c.y);
    if (x < 0 || x > S.w || y < 0 || y > S.h) return;
    var txt = LANG.t(c.zh, c.en);
    ctx.font = '11px ' + FONT; var w = ctx.measureText(txt).width;
    if (!free([x - 4, y - 9, x + 8 + w, y + 9])) return;
    ctx.beginPath(); ctx.arc(x, y, c.rank === 1 ? 3.5 : 2.5, 0, 7);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = night ? '#000' : '#555'; ctx.lineWidth = 1; ctx.stroke();
    if (inSilence(c)) { glitchText(txt, x + 6, y, 11, '#f2f2f2', night); return; }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineWidth = night ? 2 : 3; ctx.strokeStyle = night ? 'rgba(0,0,0,.85)' : '#fff'; ctx.strokeText(txt, x + 6, y);
    ctx.fillStyle = night ? '#fff' : c.rank === 1 ? '#000' : '#333'; ctx.fillText(txt, x + 6, y);
  });
}

function updateScale() {
  var pxPerKm = S.t.k / KM_PER_UNIT, maxPx = 120;
  function nice(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * p; }
  var km = nice(maxPx / pxPerKm), mi = nice(maxPx / (pxPerKm * 1.609344));
  var bm = document.getElementById('sbmi'), bk = document.getElementById('sbkm');
  bm.style.width = Math.round(mi * 1.609344 * pxPerKm) + 'px'; bm.firstChild.textContent = mi + ' mi';
  bk.style.width = Math.round(km * pxPerKm) + 'px'; bk.firstChild.textContent = km + ' km';
}

function hitTest(mx, my) {
  // v3.3: exact colour codes (r, g=97, checksum b) so antialiased edge pixels never decode to a wrong faction
  var c = D.hit, h = c.getContext('2d', { willReadFrequently: true });
  function code(i) { return [(i + 1) * 5 % 256, 97, (i * 37 + 11) % 251]; }
  if (!D.hitReady) {
    c.width = W / 4; c.height = H / 4; var hp = d3.geoPath(null, h);
    h.setTransform(0.25, 0, 0, 0.25, 0, 0);
    h.beginPath(); hp(D.nation); h.fillStyle = 'rgb(0,0,200)'; h.fill();
    D.factions.forEach(function (f, i) { var k = code(i); h.beginPath(); hp(f); h.fillStyle = 'rgb(' + k + ')'; h.fill(); });
    D.hitData = h.getImageData(0, 0, c.width, c.height).data; D.hitW = c.width; D.hitH = c.height;
    D.hitReady = true;
  }
  var d = D.hitData, cw = D.hitW, ch = D.hitH, cx = Math.floor(mx / 4), cy = Math.floor(my / 4);
  function at(x, y) {
    if (x < 0 || y < 0 || x >= cw || y >= ch) return -1;
    var o = (y * cw + x) * 4; if (d[o + 3] !== 255 || d[o + 1] !== 97) return -1;
    var i = d[o] / 5 - 1; if (i !== Math.floor(i) || i < 0 || i >= D.factions.length) return -1;
    return d[o + 2] === (i * 37 + 11) % 251 ? i : -1;
  }
  var i0 = at(cx, cy); if (i0 >= 0) return D.factions[i0];
  // edge pixel: is it on land at all? then vote among exact neighbours
  var o0 = (cy * cw + cx) * 4; if (cx < 0 || cy < 0 || cx >= cw || cy >= ch || d[o0 + 3] < 128) return null;
  var votes = {}, best = -1, bn = 0, landish = 0;
  for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
    var j = at(cx + dx, cy + dy); if (j < 0) continue; landish++;
    votes[j] = (votes[j] || 0) + 1; if (votes[j] > bn) { bn = votes[j]; best = j; }
  }
  return best >= 0 && bn >= 3 ? D.factions[best] : null;
}
