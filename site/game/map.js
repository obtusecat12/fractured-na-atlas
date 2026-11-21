// map.js — 2009 谷歌地图式渲染：区域矢量图（TIGER 2023）、霍尔布鲁克街道与建筑（OSM）、
// 程序生成的卫星图（低分辨率绘制 → 模糊 → 颗粒 → 真实 JPEG 压缩 → 放大），做法同 Level 11 的 gmaps-satellite.js。
var MAP = (function () {
  'use strict';
  var T = TOWN, R = REGION;
  var LON0 = -110.1575, LAT0 = 34.905, KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110540;
  function m2ll(p) { return [LON0 + p[0] / KX, LAT0 - p[1] / KY]; }
  // ---- projection (Web Mercator, like Google) ----
  function wx(lon, z) { return (lon + 180) / 360 * 256 * Math.pow(2, z); }
  function wy(lat, z) { var s = Math.sin(lat * Math.PI / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256 * Math.pow(2, z); }
  function xlon(x, z) { return x / (256 * Math.pow(2, z)) * 360 - 180; }
  function ylat(y, z) { var n = Math.PI - 2 * Math.PI * y / (256 * Math.pow(2, z)); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); }
  function mpp(z) { return 156543.03 * Math.cos(LAT0 * Math.PI / 180) / Math.pow(2, z); }

  // ---- convert town data to lon/lat once ----
  var BLD = T.bld.map(function (b, i) {
    var ll = b.p.map(m2ll), xs = b.p.map(function (q) { return q[0]; }), ys = b.p.map(function (q) { return q[1]; });
    var area = 0; for (var k = 0, j = b.p.length - 1; k < b.p.length; j = k++) area += (b.p[j][0] + b.p[k][0]) * (b.p[j][1] - b.p[k][1]);
    return { i: i, ll: ll, m: b.p, box: [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)], area: Math.abs(area / 2), b: b.b, name: b.name || '', am: b.amen || b.shop || b.tour || '', lv: +(b.buil || 1) };
  });
  var HW = T.hw.map(function (h) { return { ll: h.p.map(m2ll), m: h.p, h: h.h, n: h.n, r: h.r }; });
  var RAIL = T.rail.map(function (r) { return { ll: r.p.map(m2ll), m: r.p, r: r.r }; });
  var WAT = T.water.map(function (w) { return { ll: w.p.map(m2ll), m: w.p, w: w.w, n: w.n }; });
  var AREA = T.area.map(function (a) { return { ll: a.p.map(m2ll), m: a.p, k: a.k, v: a.v, n: a.n }; });
  var POI = T.poi.map(function (p) { return { ll: m2ll(p.p), m: p.p, n: p.n, t: p.t }; });
  var TB = (function () { var a = [1e9, 1e9, -1e9, -1e9]; BLD.forEach(function (b) { a[0] = Math.min(a[0], b.box[0]); a[1] = Math.min(a[1], b.box[1]); a[2] = Math.max(a[2], b.box[2]); a[3] = Math.max(a[3], b.box[3]); }); return a; })();
  var TOWN_BOX = [m2ll([-2600, 2300]), m2ll([2600, -2300])]; // lon/lat SW, NE of the detailed area
  function inTown(lon, lat) { return lon > TOWN_BOX[0][0] && lon < TOWN_BOX[1][0] && lat > TOWN_BOX[0][1] && lat < TOWN_BOX[1][1]; }
  // building grid for hit tests (25 m cells)
  var GRID = {}; BLD.forEach(function (b) { for (var x = Math.floor(b.box[0] / 25); x <= Math.floor(b.box[2] / 25); x++) for (var y = Math.floor(b.box[1] / 25); y <= Math.floor(b.box[3] / 25); y++) (GRID[x + ',' + y] = GRID[x + ',' + y] || []).push(b); });
  function ll2m(lon, lat) { return [(lon - LON0) * KX, (LAT0 - lat) * KY]; }
  function pip(pt, poly) { var x = pt[0], y = pt[1], c = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i][1] > y) !== (poly[j][1] > y) && x < (poly[j][0] - poly[i][0]) * (y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) c = !c; return c; }
  function buildingAt(lon, lat) { var m = ll2m(lon, lat), c = GRID[Math.floor(m[0] / 25) + ',' + Math.floor(m[1] / 25)] || []; for (var i = 0; i < c.length; i++) if (pip(m, c[i].m)) return c[i]; return null; }

  // ---- hash / noise ----
  function hash(a, b, s) { var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul((s || 0) | 0, 1274126177); h = Math.imul(h ^ h >>> 13, 1103515245); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function vnoise(x, y, s) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
  function fbm(x, y, s, o) { var v = 0, a = .5, f = 1; for (var i = 0; i < o; i++) { v += a * vnoise(x * f, y * f, s + i); f *= 2.03; a *= .5; } return v; }

  // ---- ground colour (lon/lat) ----
  function ground(lon, lat, fine) {
    // metres-ish coordinates for noise
    var X = (lon + 110) * 91000, Y = (lat - 34) * 110540;
    var big = fbm(X / 9000, Y / 9000, 3, 4), mid = fbm(X / 900, Y / 900, 11, 3), sm = fine ? fbm(X / 40, Y / 40, 21, 2) : .5;
    var r = 181, g = 164, b = 138; // high-desert tan
    // Painted Desert reds north-east of Holbrook
    var red = Math.max(0, Math.min(1, (lat - 34.95) * 6)) * Math.max(0, Math.min(1, (lon + 110.0) * 3 + .4)) * (big * 1.6 - .3);
    r += 26 * red; g -= 2 * red; b -= 14 * red;
    // Mogollon Rim pine forest to the south
    var f = Math.max(0, Math.min(1, (34.47 - lat) * 9 + (mid - .5) * 1.4));
    r = r * (1 - f) + 74 * f; g = g * (1 - f) + 86 * f; b = b * (1 - f) + 60 * f;
    // reservation north: redder sandstone
    var n = Math.max(0, Math.min(1, (lat - 35.3) * 3));
    r += 18 * n; g -= 4 * n; b -= 14 * n;
    // drainage: ridged noise gives branching washes; basalt patches around the Hopi Buttes
    var rid = 1 - Math.abs(2 * fbm(X / 2600, Y / 2600, 31, 3) - 1), wash = Math.pow(rid, 5);
    r += 34 * wash; g += 28 * wash; b += 20 * wash;
    var bas = Math.max(0, fbm(X / 5000, Y / 5000, 41, 3) - .62) * 3 * Math.max(0, Math.min(1, (lat - 35.05) * 4));
    r -= 70 * bas; g -= 66 * bas; b -= 52 * bas;
    var k = .78 + .36 * big + .2 * (mid - .5) + .16 * (sm - .5);
    return [r * k, g * k, b * k];
  }

  // ---- satellite tile cache ----
  var CACHE = {}, QUEUE = [], LIMIT = 260, order = [];
  var FAC = []; // facilities [{ll,size,roof,done,eta,tower,road,grid,conv}]
  function setFacilities(list) { FAC = list; }
  function invalidate(ll) {
    Object.keys(CACHE).forEach(function (k) {
      var p = k.split('/'), z = +p[0], tx = +p[1], ty = +p[2];
      var x = wx(ll[0], z), y = wy(ll[1], z);
      if (x > tx * 256 - 80 && x < tx * 256 + 336 && y > ty * 256 - 80 && y < ty * 256 + 336) delete CACHE[k];
    });
  }
  function tile(z, tx, ty) {
    var k = z + '/' + tx + '/' + ty, c = CACHE[k];
    if (c) return c.ready ? c.img : null;
    if (QUEUE.indexOf(k) < 0) QUEUE.push(k);
    return null;
  }
  function pump(n, done) {
    var did = 0;
    while (QUEUE.length && did < n) {
      var k = QUEUE.shift(); if (CACHE[k]) continue;
      var p = k.split('/'); makeTile(+p[0], +p[1], +p[2], k, done); did++;
    }
    return QUEUE.length;
  }
  function makeTile(z, tx, ty, key, done) {
    var scale = z >= 18 ? 0.5 : 1, S = Math.round(256 * scale); // imagery is ~1 m/px at best
    var c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d');
    var X0 = tx * 256, Y0 = ty * 256;
    // ground, per 4px cell (then blur hides the cells)
    var step = z >= 13 ? 4 : 2, img = g.createImageData(S, S), d = img.data, fine = z >= 14;
    for (var py = 0; py < S; py += step) for (var px = 0; px < S; px += step) {
      var lon = xlon(X0 + (px + step / 2) / scale, z), lat = ylat(Y0 + (py + step / 2) / scale, z), col = ground(lon, lat, fine);
      for (var yy = py; yy < py + step && yy < S; yy++) for (var xx = px; xx < px + step && xx < S; xx++) { var o = (yy * S + xx) * 4; d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255; }
    }
    g.putImageData(img, 0, 0);
    g.save(); g.scale(scale, scale);
    var P = function (ll) { return [wx(ll[0], z) - X0, wy(ll[1], z) - Y0]; };
    var M = mpp(z); // metres per px (at full scale)
    var tlon0 = xlon(X0 - 40, z), tlon1 = xlon(X0 + 296, z), tlat1 = ylat(Y0 - 40, z), tlat0 = ylat(Y0 + 296, z);
    function vis(ll) { for (var i = 0; i < ll.length; i++) { var p = ll[i]; if (p[0] > tlon0 && p[0] < tlon1 && p[1] > tlat0 && p[1] < tlat1) return true; } return false; }
    function path(ll) { g.beginPath(); ll.forEach(function (p, i) { var q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); }
    var detail = z >= 13 && inTown(xlon(X0 + 128, z), ylat(Y0 + 128, z)) || (z >= 13 && (inTown(tlon0, tlat0) || inTown(tlon1, tlat1) || inTown(tlon0, tlat1) || inTown(tlon1, tlat0)));
    // regional water + roads (TIGER)
    g.lineCap = g.lineJoin = 'round';
    if (!(z >= 14 && inTown(xlon(X0 + 128, z), ylat(Y0 + 128, z)))) R.water.forEach(function (w) { var big = /Colorado|Puerco|Silver/.test(w.n); w.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = 'rgba(104,112,74,.35)'; g.lineWidth = Math.max(1.6, (big ? 90 : 30) / M); g.stroke(); g.strokeStyle = 'rgba(214,200,170,.95)'; g.lineWidth = Math.max(1, (big ? 55 : 14) / M); g.stroke(); }); });
    R.lakes.forEach(function (l) { l.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.fillStyle = '#26404a'; g.fill(); }); });
    if (!detail) R.roads.forEach(function (r) { r.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = r.t === 'I' ? 'rgba(88,86,82,.95)' : 'rgba(110,104,96,.85)'; g.lineWidth = Math.max(r.t === 'I' ? 1.4 : .9, (r.t === 'I' ? 30 : 12) / M); g.stroke(); }); });
    if (!detail) R.rail.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = 'rgba(80,70,62,.7)'; g.lineWidth = Math.max(.8, 10 / M); g.stroke(); });
    if (detail) {
      // landuse
      AREA.forEach(function (a) {
        if (!vis(a.ll)) return; path(a.ll); g.closePath();
        var col = null;
        if (a.v === 'residential') col = 'rgba(150,132,104,.35)';
        else if (a.v === 'commercial' || a.v === 'retail' || a.v === 'industrial') col = 'rgba(190,182,166,.35)';
        else if (a.v === 'pitch') col = hash(a.m[0][0] | 0, a.m[0][1] | 0) < .5 ? 'rgba(98,122,62,.9)' : 'rgba(176,140,104,.9)';
        else if (a.v === 'park' || a.v === 'recreation_ground' || a.v === 'cemetery' || a.v === 'playground') col = 'rgba(112,124,74,.75)';
        else if (a.v === 'parking') col = 'rgba(96,94,90,.92)';
        else if (a.v === 'swimming_pool') col = '#58a9b8';
        else if (a.v === 'school' || a.v === 'education') col = 'rgba(160,150,128,.4)';
        else if (a.v === 'bare_rock') col = 'rgba(200,170,140,.6)';
        if (col) { g.fillStyle = col; g.fill(); }
      });
      // washes / river
      WAT.forEach(function (w) { if (!vis(w.ll)) return; path(w.ll); if (w.w === 'water') { g.closePath(); g.fillStyle = '#4a5a50'; g.fill(); } else { g.strokeStyle = 'rgba(104,112,74,.35)'; g.lineWidth = (w.w === 'river' ? 90 : 12) / M; g.stroke(); g.strokeStyle = 'rgba(216,202,172,.97)'; g.lineWidth = (w.w === 'river' ? 58 : 6) / M; g.stroke(); if (w.w === 'river' && z >= 15) { g.strokeStyle = 'rgba(196,180,150,.8)'; g.lineWidth = 12 / M; g.setLineDash([40 / M, 25 / M]); g.stroke(); g.setLineDash([]); } } });
      // roads
      var RW = { motorway: 24, trunk: 18, primary: 15, secondary: 13, tertiary: 12, unclassified: 9, residential: 9, living_street: 7, service: 5, motorway_link: 8, trunk_link: 8, primary_link: 8, track: 4, footway: 0, path: 0 };
      HW.forEach(function (h) { var w = RW[h.h]; if (!w || !vis(h.ll)) return; path(h.ll); g.strokeStyle = h.h === 'track' ? 'rgba(206,188,160,.9)' : (h.h === 'service' ? '#7d7a74' : '#6f6c66'); g.lineWidth = w / M; g.stroke(); });
      HW.forEach(function (h) { if ((h.h === 'motorway' || h.h === 'trunk' || h.h === 'primary') && vis(h.ll) && z >= 16) { path(h.ll); g.strokeStyle = 'rgba(230,226,210,.55)'; g.lineWidth = .35 / M + .3; g.setLineDash([3 / M, 9 / M]); g.stroke(); g.setLineDash([]); } });
      RAIL.forEach(function (r) { if (!vis(r.ll)) return; path(r.ll); g.strokeStyle = '#6e645a'; g.lineWidth = 5 / M; g.stroke(); if (z >= 16) { g.strokeStyle = '#3c3632'; g.lineWidth = .6; g.stroke(); } });
      // trees in residential areas (deterministic per 9 m cell)
      if (z >= 15) {
        var cell = 9, mx0 = ll2m(tlon0, tlat1), mx1 = ll2m(tlon1, tlat0);
        for (var cx = Math.floor(mx0[0] / cell); cx <= Math.ceil(mx1[0] / cell); cx++) for (var cy = Math.floor(mx0[1] / cell); cy <= Math.ceil(mx1[1] / cell); cy++) {
          var h1 = hash(cx, cy, 77); if (h1 > .07) continue;
          var mxp = [cx * cell + hash(cx, cy, 78) * cell, cy * cell + hash(cx, cy, 79) * cell];
          if (Math.abs(mxp[0]) > 2400 || Math.abs(mxp[1]) > 2100) continue;
          if (buildingAt(m2ll(mxp)[0], m2ll(mxp)[1])) continue;
          var inRes = AREA.some(function (a) { return a.v === 'residential' && pip(mxp, a.m); }); if (!inRes && h1 > .025) continue;
          var q = P(m2ll(mxp)), rr = (2 + hash(cx, cy, 80) * 3.5) / M;
          g.fillStyle = 'rgba(40,36,28,.45)'; g.beginPath(); g.arc(q[0] - rr * .8, q[1] - rr * .9, rr, 0, 7); g.fill();
          g.fillStyle = hash(cx, cy, 81) < .5 ? '#4b5532' : '#5d6238'; g.beginPath(); g.arc(q[0], q[1], rr, 0, 7); g.fill();
        }
      }
      // buildings
      BLD.forEach(function (b) { if (!vis(b.ll)) return; drawRoof(g, b, P, M, z); });
      // cars in parking lots
      if (z >= 16) AREA.forEach(function (a) {
        if (a.v !== 'parking' || !vis(a.ll)) return;
        var bx = [1e9, 1e9, -1e9, -1e9]; a.m.forEach(function (q) { bx[0] = Math.min(bx[0], q[0]); bx[1] = Math.min(bx[1], q[1]); bx[2] = Math.max(bx[2], q[0]); bx[3] = Math.max(bx[3], q[1]); });
        for (var x = bx[0] + 2; x < bx[2] - 2; x += 2.8) for (var y = bx[1] + 3; y < bx[3] - 3; y += 6) {
          if (hash(x * 10 | 0, y * 10 | 0, 5) > .45 || !pip([x, y], a.m)) continue;
          var q = P(m2ll([x, y])); g.fillStyle = ['#e8e8e4', '#d9dadb', '#a2a5a8', '#2a2b2e', '#7a2320', '#24406e', '#c9b48a'][hash(x | 0, y | 0, 6) * 7 | 0];
          g.fillRect(q[0] - .9 / M, q[1] - 2.2 / M, 1.8 / M, 4.4 / M);
        }
      });
    }
    // player facilities
    FAC.forEach(function (f) { var q = P(f.ll); if (q[0] < -200 || q[1] < -200 || q[0] > 456 || q[1] > 456) return; drawFacility(g, f, q, M); });
    g.restore();
    // optics: blur + grain + strip tint, then a real JPEG round trip
    var c2 = document.createElement('canvas'); c2.width = c2.height = S; var g2 = c2.getContext('2d');
    g2.filter = 'blur(' + (z >= 16 ? .55 : .4) + 'px) saturate(.88) contrast(1.04)'; g2.drawImage(c, 0, 0); g2.filter = 'none';
    var id = g2.getImageData(0, 0, S, S), dd = id.data;
    var strip = (xlon(X0, z) < -110.172) ? [6, 3, -4] : [0, 0, 0]; // two acquisitions meet west of downtown
    for (var i = 0; i < dd.length; i += 4) { var n = (hash(i, tx * 7 + ty, z) - .5) * 14; dd[i] += n + strip[0]; dd[i + 1] += n + strip[1]; dd[i + 2] += n + strip[2]; }
    g2.putImageData(id, 0, 0);
    var im = new Image(), ent = { ready: false, img: im }; CACHE[key] = ent;
    im.onload = function () { ent.ready = true; if (CACHE[key] !== ent) return; order.push(key); if (order.length > LIMIT) delete CACHE[order.shift()]; done && done(); };
    im.src = c2.toDataURL('image/jpeg', z >= 16 ? .5 : .42);
  }
  var ROOF = { house: ['#6e5e50', '#77736c', '#8a7a68', '#5e5852', '#a39582', '#c4c2bb', '#8f5b48'], flat: ['#c9c7c0', '#bcbab3', '#d6d4cc', '#a9a8a2', '#9b978d'], metal: ['#b3b6b6', '#a7abac', '#c2c4c1'] };
  function drawRoof(g, b, P, M, z) {
    var pts = b.ll.map(P), hsh = hash(b.i, 3, 9);
    var flat = b.area > 380 || /commercial|retail|motel|school|industrial|warehouse|public|train_station|roof|church/.test(b.b) || b.am;
    var h = (flat ? 5 + b.lv * 2 : 4) / M, sx = -.55 * h, sy = -.75 * h; // shadow toward north-west
    g.beginPath(); pts.forEach(function (q, i) { i ? g.lineTo(q[0] + sx, q[1] + sy) : g.moveTo(q[0] + sx, q[1] + sy); }); g.closePath(); g.fillStyle = 'rgba(38,34,30,.5)'; g.fill();
    var pal = flat ? (b.b === 'roof' ? ROOF.metal : ROOF.flat) : ROOF.house, col = pal[Math.floor(hsh * pal.length)];
    g.beginPath(); pts.forEach(function (q, i) { i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = col; g.fill();
    if (z < 16) return;
    if (!flat && pts.length === 5) { // gable: lighter half faces the sun (south-east)
      var p0 = pts[0], p1 = pts[1], p2 = pts[2], p3 = pts[3], e0 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), e1 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      var A, Bq; if (e0 > e1) { A = [p0, p1, mid(p1, p2), mid(p3, p0)]; Bq = [mid(p3, p0), mid(p1, p2), p2, p3]; } else { A = [p1, p2, mid(p2, p3), mid(p0, p1)]; Bq = [mid(p0, p1), mid(p2, p3), p3, p0]; }
      var ca = cen(A), cb = cen(Bq), lit = (ca[0] + ca[1]) > (cb[0] + cb[1]) ? A : Bq;
      g.beginPath(); lit.forEach(function (q, i) { i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fillStyle = 'rgba(255,250,240,.16)'; g.fill();
    } else if (flat) {
      g.strokeStyle = 'rgba(70,66,60,.55)'; g.lineWidth = .8; g.stroke();
      var n = Math.min(8, Math.floor(b.area / 220)), bx = b.box;
      for (var k = 0; k < n; k++) { var mx = bx[0] + 3 + hash(b.i, k, 1) * (bx[2] - bx[0] - 6), my = bx[1] + 3 + hash(b.i, k, 2) * (bx[3] - bx[1] - 6); if (!pip([mx, my], b.m)) continue; var q = P(m2ll([mx, my])); g.fillStyle = 'rgba(40,38,34,.45)'; g.fillRect(q[0] - 1.6 / M - .8, q[1] - 1.2 / M - .8, 2.4 / M, 1.8 / M); g.fillStyle = '#d9d8d2'; g.fillRect(q[0] - 1.2 / M, q[1] - .9 / M, 2.4 / M, 1.8 / M); }
    }
  }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  function cen(a) { var x = 0, y = 0; a.forEach(function (q) { x += q[0]; y += q[1]; }); return [x / a.length, y / a.length]; }
  function drawFacility(g, f, q, M) {
    var w = f.size[0] / M, h = f.size[1] / M;
    if (f.conv) return; // conversions reuse an existing roof
    if (!f.done) { // graded pad with tyre tracks, then framing
      g.fillStyle = 'rgba(212,196,168,.95)'; g.fillRect(q[0] - w / 2 - 3 / M, q[1] - h / 2 - 3 / M, w + 6 / M, h + 6 / M);
      g.strokeStyle = 'rgba(150,130,104,.6)'; g.lineWidth = .8 / M + .3; for (var i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(q[0] - w / 2, q[1] + i * h / 5); g.lineTo(q[0] + w / 2, q[1] + i * h / 5 + 2 / M); g.stroke(); }
      if (f.progress > .4) { g.strokeStyle = 'rgba(140,128,110,.9)'; g.lineWidth = .6 / M + .4; g.strokeRect(q[0] - w / 2 + 2 / M, q[1] - h / 2 + 2 / M, w - 4 / M, h - 4 / M); }
      return;
    }
    if (f.grid) { // rows of travel trailers
      g.fillStyle = 'rgba(190,178,152,.95)'; g.fillRect(q[0] - w / 2, q[1] - h / 2, w, h);
      for (var r = 0; r < 4; r++) for (var cc = 0; cc < 7; cc++) { var x = q[0] - w / 2 + (4 + cc * 9.5) / M, y = q[1] - h / 2 + (4 + r * 11) / M; g.fillStyle = 'rgba(40,36,30,.45)'; g.fillRect(x - 1.5 / M, y - 1.5 / M, 3 / M, 8.5 / M); g.fillStyle = '#e7e6e1'; g.fillRect(x, y, 3 / M, 8.5 / M); }
      return;
    }
    if (f.tower) { g.strokeStyle = 'rgba(30,28,26,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] - 30 / M, q[1] - 40 / M); g.stroke(); g.fillStyle = '#9a9a96'; g.fillRect(q[0] - 2 / M, q[1] - 2 / M, 4 / M, 4 / M); return; }
    g.fillStyle = 'rgba(38,34,30,.5)'; g.fillRect(q[0] - w / 2 - 2.2 / M, q[1] - h / 2 - 3 / M, w, h);
    g.fillStyle = f.roof; g.fillRect(q[0] - w / 2, q[1] - h / 2, w, h);
    g.strokeStyle = 'rgba(80,76,70,.6)'; g.lineWidth = .8; g.strokeRect(q[0] - w / 2, q[1] - h / 2, w, h);
  }

  return { T: T, R: R, BLD: BLD, HW: HW, RAIL: RAIL, WAT: WAT, AREA: AREA, POI: POI, m2ll: m2ll, ll2m: ll2m, wx: wx, wy: wy, xlon: xlon, ylat: ylat, mpp: mpp, pip: pip, hash: hash,
    buildingAt: buildingAt, inTown: inTown, TOWN_BOX: TOWN_BOX, tile: tile, pump: pump, setFacilities: setFacilities, invalidate: invalidate, queueLen: function () { return QUEUE.length; }, clearQueue: function () { QUEUE.length = 0; } };
})();
