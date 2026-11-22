// map.js — 2009 谷歌地图式渲染：区域矢量图（TIGER 2023）、霍尔布鲁克街道与建筑（OSM）、
// 程序生成的卫星图（低分辨率绘制 → 模糊 → 颗粒 → 真实 JPEG 压缩 → 放大），做法同 Level 11 的 gmaps-satellite.js。
var MAP = (function () {
  'use strict';
  var R = REGION;
  var LON0 = -110.1575, LAT0 = 34.905, KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110540;
  function m2ll(p) { return [LON0 + p[0] / KX, LAT0 - p[1] / KY]; }
  // ---- projection (Web Mercator, like Google) ----
  function wx(lon, z) { return (lon + 180) / 360 * 256 * Math.pow(2, z); }
  function wy(lat, z) { var s = Math.sin(lat * Math.PI / 180); return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256 * Math.pow(2, z); }
  function xlon(x, z) { return x / (256 * Math.pow(2, z)) * 360 - 180; }
  function ylat(y, z) { var n = Math.PI - 2 * Math.PI * y / (256 * Math.pow(2, z)); return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))); }
  function mpp(z) { return 156543.03 * Math.cos(LAT0 * Math.PI / 180) / Math.pow(2, z); }
  function bbll(ll) { var a = [1e9, 1e9, -1e9, -1e9]; for (var i = 0; i < ll.length; i++) { var p = ll[i]; if (p[0] < a[0]) a[0] = p[0]; if (p[1] < a[1]) a[1] = p[1]; if (p[0] > a[2]) a[2] = p[0]; if (p[1] > a[3]) a[3] = p[1]; } return a; }
  // ---- town data (OSM + filled-in houses on unmapped streets), all in one metre frame centred on Holbrook ----
  var BLD = [], HW = [], RAIL = [], WAT = [], AREA = [], POI = [], TOWN_BOXES = [];
  TOWNS.forEach(function (T) {
    TOWN_BOXES.push({ id: T.id, a: m2ll(T.box[0]), b: m2ll(T.box[1]) });
    T.bld.forEach(function (b) {
      var ll = b.p.map(m2ll), xs = b.p.map(function (q) { return q[0]; }), ys = b.p.map(function (q) { return q[1]; });
      var area = 0; for (var k = 0, j = b.p.length - 1; k < b.p.length; j = k++) area += (b.p[j][0] + b.p[k][0]) * (b.p[j][1] - b.p[k][1]);
      BLD.push({ i: BLD.length, t: T.id, ll: ll, bb: bbll(ll), m: b.p, box: [Math.min.apply(0, xs), Math.min.apply(0, ys), Math.max.apply(0, xs), Math.max.apply(0, ys)], area: Math.abs(area / 2), b: b.b, s: b.s, name: b.name || '', am: b.amen || b.shop || b.tour || '', lv: +(b.buil || 1) });
    });
    T.hw.forEach(function (h) { var ll = h.p.map(m2ll); HW.push({ ll: ll, bb: bbll(ll), m: h.p, h: h.h, n: h.n }); });
    (T.rail || []).forEach(function (r) { var ll = r.p.map(m2ll); RAIL.push({ ll: ll, bb: bbll(ll), m: r.p, r: r.r }); });
    (T.water || []).forEach(function (w) { var ll = w.p.map(m2ll); WAT.push({ ll: ll, bb: bbll(ll), m: w.p, w: w.w, n: w.n }); });
    (T.area || []).forEach(function (a) { var ll = a.p.map(m2ll); AREA.push({ ll: ll, bb: bbll(ll), m: a.p, k: a.k, v: a.v, n: a.n }); });
    (T.poi || []).forEach(function (p) { POI.push({ ll: m2ll(p.p), m: p.p, n: p.n, t: p.t, town: T.id }); });
  });
  function townAt(lon, lat) { for (var i = 0; i < TOWN_BOXES.length; i++) { var b = TOWN_BOXES[i]; if (lon > b.a[0] && lon < b.b[0] && lat < b.a[1] && lat > b.b[1]) return b; } return null; }
  function inTown(lon, lat) { return !!townAt(lon, lat); }
  function boxHitsTown(lon0, lat0, lon1, lat1) { return TOWN_BOXES.some(function (b) { return lon1 > b.a[0] && lon0 < b.b[0] && lat1 > b.b[1] && lat0 < b.a[1]; }); }
  // building grid for hit tests (25 m cells)
  var GRID = {}; BLD.forEach(function (b) { for (var x = Math.floor(b.box[0] / 25); x <= Math.floor(b.box[2] / 25); x++) for (var y = Math.floor(b.box[1] / 25); y <= Math.floor(b.box[3] / 25); y++) (GRID[x + ',' + y] = GRID[x + ',' + y] || []).push(b); });
  function ll2m(lon, lat) { return [(lon - LON0) * KX, (LAT0 - lat) * KY]; }
  // 空间索引（约 1 公里一格，经纬度包围盒）：生成卫星图块时只取图块附近的要素，不再每块遍历全部 2 万栋房子和道路
  var IC = 0.01;
  function mkIndex(list) {
    var idx = {}; list.forEach(function (o, i) { o.i0 = i; var b = o.bb;
      for (var x = Math.floor(b[0] / IC); x <= Math.floor(b[2] / IC); x++) for (var y = Math.floor(b[1] / IC); y <= Math.floor(b[3] / IC); y++) (idx[x + ',' + y] = idx[x + ',' + y] || []).push(o); });
    return idx;
  }
  var STAMP = 0;
  function near(idx, lon0, lat0, lon1, lat1) {
    var out = [], st = ++STAMP;
    for (var x = Math.floor(lon0 / IC); x <= Math.floor(lon1 / IC); x++) for (var y = Math.floor(lat0 / IC); y <= Math.floor(lat1 / IC); y++) {
      var c = idx[x + ',' + y]; if (!c) continue;
      for (var i = 0; i < c.length; i++) if (c[i]._st !== st) { c[i]._st = st; out.push(c[i]); }
    }
    return out.sort(function (a, b) { return a.i0 - b.i0; }); // 保持原来的绘制顺序
  }
  var IX = { bld: mkIndex(BLD), hw: mkIndex(HW), rail: mkIndex(RAIL), wat: mkIndex(WAT), area: mkIndex(AREA) };
  // 住宅区（种树用）：预先算好米制包围盒，先比包围盒再做点在多边形内判断
  var RES = AREA.filter(function (a) { return a.v === 'residential'; }).map(function (a) {
    var bx = [1e9, 1e9, -1e9, -1e9]; a.m.forEach(function (q) { if (q[0] < bx[0]) bx[0] = q[0]; if (q[1] < bx[1]) bx[1] = q[1]; if (q[0] > bx[2]) bx[2] = q[0]; if (q[1] > bx[3]) bx[3] = q[1]; });
    return { m: a.m, b: bx };
  });
  function inResidential(p) { for (var i = 0; i < RES.length; i++) { var r = RES[i], b = r.b; if (p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3] && pip(p, r.m)) return true; } return false; }
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
    var f = Math.max(0, Math.min(1, (34.40 - lat) * 4.5 + (mid - .5) * 1.4));
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
  // 图块生成很重（地面噪声、树、房顶、模糊、JPEG）。这里：按时间预算分批生成，不阻塞拖动；
  // 施工进度刷新时旧图块先留着（标记过期），新图块做好再替换，不会闪成空白；JPEG 用 toBlob + createImageBitmap 异步编解码。
  var CACHE = {}, QUEUE = [], LIMIT = 260, order = [], PENDING = {};
  var FAC = []; // facilities [{ll,size,roof,done,eta,tower,road,grid,conv}]
  var NOWF = (typeof performance !== 'undefined' && performance.now) ? function () { return performance.now(); } : function () { return Date.now(); };
  function setFacilities(list) { FAC = list; }
  function invalidate(ll) {
    Object.keys(CACHE).forEach(function (k) {
      var p = k.split('/'), z = +p[0], tx = +p[1], ty = +p[2];
      var x = wx(ll[0], z), y = wy(ll[1], z);
      if (x > tx * 256 - 80 && x < tx * 256 + 336 && y > ty * 256 - 80 && y < ty * 256 + 336) CACHE[k].stale = true;
    });
  }
  function tile(z, tx, ty) {
    var k = z + '/' + tx + '/' + ty, c = CACHE[k];
    if ((!c || c.stale) && !PENDING[k] && QUEUE.indexOf(k) < 0) QUEUE.push(k);
    return c && c.ready ? c.img : null;
  }
  // 只看缓存，不排队（缩放时用上一级或下一级的图块先顶着）
  function peek(z, tx, ty) { var c = CACHE[z + '/' + tx + '/' + ty]; return c && c.ready ? c.img : null; }
  function pump(n, done, budget) {
    var did = 0, t0 = NOWF();
    while (QUEUE.length && did < n && (did === 0 || !budget || NOWF() - t0 < budget)) {
      var k = QUEUE.shift(); if (PENDING[k] || (CACHE[k] && !CACHE[k].stale)) continue;
      var p = k.split('/');
      if (p[0] === 'L') { if (LCACHE[k]) continue; PENDING[k] = 1; makeLight(+p[1], +p[2], +p[3], k, done); }
      else makeTile(+p[0], +p[1], +p[2], k, done);
      did++;
    }
    return QUEUE.length;
  }
  function freeImg(im) { if (im && typeof im.close === 'function') try { im.close(); } catch (e) {} }
  function finish(key, img, done) {
    delete PENDING[key];
    var old = CACHE[key];
    CACHE[key] = { ready: true, img: img };
    if (old) { if (old.img !== img) freeImg(old.img); }
    else { order.push(key); if (order.length > LIMIT) { var ev = order.shift(); if (CACHE[ev]) freeImg(CACHE[ev].img); delete CACHE[ev]; } }
    done && done();
  }
  function encode(c2, q, key, done) {
    // 真实的 JPEG 压缩（2009 年卫星图的块状伪影）。能异步就异步，不行再退回同步 toDataURL。
    if (c2.toBlob && typeof createImageBitmap === 'function') {
      c2.toBlob(function (blob) {
        if (!blob) return sync();
        createImageBitmap(blob).then(function (bm) { finish(key, bm, done); }, sync);
      }, 'image/jpeg', q);
      return;
    }
    sync();
    function sync() { var im = new Image(); im.onload = function () { finish(key, im, done); }; im.onerror = function () { delete PENDING[key]; }; im.src = c2.toDataURL('image/jpeg', q); }
  }
  function makeTile(z, tx, ty, key, done) {
    PENDING[key] = 1;
    var scale = z >= 18 ? 0.5 : 1, S = Math.round(256 * scale); // imagery is ~1 m/px at best
    var c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d');
    var X0 = tx * 256, Y0 = ty * 256;
    // ground: sample the noise every 4 px and interpolate between samples (was a 2-4 px block mosaic; same colours, ~4x fewer noise evaluations at low zoom)
    var step = 4, n = Math.ceil(S / step) + 1, img = g.createImageData(S, S), d = img.data, fine = z >= 14, G = new Float32Array(n * n * 3);
    for (var gy = 0; gy < n; gy++) for (var gx = 0; gx < n; gx++) {
      var col = ground(xlon(X0 + gx * step / scale, z), ylat(Y0 + gy * step / scale, z), fine), o3 = (gy * n + gx) * 3;
      G[o3] = col[0]; G[o3 + 1] = col[1]; G[o3 + 2] = col[2];
    }
    for (var py = 0; py < S; py++) {
      var fy = py / step, iy = fy | 0, ty2 = fy - iy;
      for (var px2 = 0; px2 < S; px2++) {
        var fx = px2 / step, ix = fx | 0, tx2 = fx - ix, a0 = (iy * n + ix) * 3, a1 = a0 + 3, b0 = a0 + n * 3, b1 = b0 + 3, o = (py * S + px2) * 4;
        var w00 = (1 - tx2) * (1 - ty2), w10 = tx2 * (1 - ty2), w01 = (1 - tx2) * ty2, w11 = tx2 * ty2;
        d[o] = G[a0] * w00 + G[a1] * w10 + G[b0] * w01 + G[b1] * w11;
        d[o + 1] = G[a0 + 1] * w00 + G[a1 + 1] * w10 + G[b0 + 1] * w01 + G[b1 + 1] * w11;
        d[o + 2] = G[a0 + 2] * w00 + G[a1 + 2] * w10 + G[b0 + 2] * w01 + G[b1 + 2] * w11;
        d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    g.save(); g.scale(scale, scale);
    var P = function (ll) { return [wx(ll[0], z) - X0, wy(ll[1], z) - Y0]; };
    var M = mpp(z); // metres per px (at full scale)
    var tlon0 = xlon(X0 - 40, z), tlon1 = xlon(X0 + 296, z), tlat1 = ylat(Y0 - 40, z), tlat0 = ylat(Y0 + 296, z);
    function vis(ll) { for (var i = 0; i < ll.length; i++) { var p = ll[i]; if (p[0] > tlon0 && p[0] < tlon1 && p[1] > tlat0 && p[1] < tlat1) return true; } return false; }
    function visb(o) { var b = o.bb; return b[2] > tlon0 && b[0] < tlon1 && b[3] > tlat0 && b[1] < tlat1; }
    function path(ll) { g.beginPath(); ll.forEach(function (p, i) { var q = P(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); }
    var detail = z >= 13 && boxHitsTown(tlon0, tlat0, tlon1, tlat1);
    // regional water + roads (TIGER)
    g.lineCap = g.lineJoin = 'round';
    if (!(z >= 14 && boxHitsTown(tlon0, tlat0, tlon1, tlat1) && inTown(xlon(X0 + 128, z), ylat(Y0 + 128, z)))) R.water.forEach(function (w) { var big = /Colorado|Puerco|Silver/.test(w.n); w.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = 'rgba(104,112,74,.35)'; g.lineWidth = Math.max(1.6, (big ? 90 : 30) / M); g.stroke(); g.strokeStyle = 'rgba(214,200,170,.95)'; g.lineWidth = Math.max(1, (big ? 55 : 14) / M); g.stroke(); }); });
    R.lakes.forEach(function (l) { l.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.fillStyle = '#26404a'; g.fill(); }); });
    if (!detail) R.roads.forEach(function (r) { r.p.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = r.t === 'I' ? 'rgba(88,86,82,.95)' : 'rgba(110,104,96,.85)'; g.lineWidth = Math.max(r.t === 'I' ? 1.4 : .9, (r.t === 'I' ? 30 : 12) / M); g.stroke(); }); });
    if (!detail) R.rail.forEach(function (ln) { if (!vis(ln)) return; path(ln); g.strokeStyle = 'rgba(80,70,62,.7)'; g.lineWidth = Math.max(.8, 10 / M); g.stroke(); });
    if (detail) {
      var nb = function (ix) { return near(ix, tlon0, tlat0, tlon1, tlat1); };
      // landuse
      nb(IX.area).forEach(function (a) {
        if (!visb(a)) return; path(a.ll); g.closePath();
        var col = null;
        if (a.v === 'residential') col = 'rgba(150,132,104,.35)';
        else if (a.v === 'commercial' || a.v === 'retail' || a.v === 'industrial') col = 'rgba(176,168,152,.7)';
        else if (a.v === 'pitch') col = hash(a.m[0][0] | 0, a.m[0][1] | 0) < .5 ? 'rgba(98,122,62,.9)' : 'rgba(176,140,104,.9)';
        else if (a.v === 'park' || a.v === 'recreation_ground' || a.v === 'cemetery' || a.v === 'playground') col = 'rgba(112,124,74,.75)';
        else if (a.v === 'parking') col = 'rgba(96,94,90,.92)';
        else if (a.v === 'swimming_pool') col = '#58a9b8';
        else if (a.v === 'school' || a.v === 'education') col = 'rgba(160,150,128,.4)';
        else if (a.v === 'bare_rock') col = 'rgba(200,170,140,.6)';
        if (col) { g.fillStyle = col; g.fill(); }
      });
      // washes / river
      nb(IX.wat).forEach(function (w) { if (!visb(w)) return; path(w.ll); if (w.w === 'water') { g.closePath(); g.fillStyle = '#4a5a50'; g.fill(); } else { g.strokeStyle = 'rgba(104,112,74,.35)'; g.lineWidth = (w.w === 'river' ? 90 : 12) / M; g.stroke(); g.strokeStyle = 'rgba(216,202,172,.97)'; g.lineWidth = (w.w === 'river' ? 58 : 6) / M; g.stroke(); if (w.w === 'river' && z >= 15) { g.strokeStyle = 'rgba(196,180,150,.8)'; g.lineWidth = 12 / M; g.setLineDash([40 / M, 25 / M]); g.stroke(); g.setLineDash([]); } } });
      // roads
      var RW = { motorway: 24, trunk: 18, primary: 15, secondary: 13, tertiary: 12, unclassified: 9, residential: 9, living_street: 7, service: 5, motorway_link: 8, trunk_link: 8, primary_link: 8, track: 4, footway: 0, path: 0 };
      var HWn = nb(IX.hw);
      HWn.forEach(function (h) { var w = RW[h.h]; if (!w || !visb(h)) return; path(h.ll); g.strokeStyle = h.h === 'track' ? 'rgba(206,188,160,.9)' : (h.h === 'service' ? '#7d7a74' : '#6f6c66'); g.lineWidth = w / M; g.stroke(); });
      HWn.forEach(function (h) { if ((h.h === 'motorway' || h.h === 'trunk' || h.h === 'primary') && visb(h) && z >= 16) { path(h.ll); g.strokeStyle = 'rgba(230,226,210,.55)'; g.lineWidth = .35 / M + .3; g.setLineDash([3 / M, 9 / M]); g.stroke(); g.setLineDash([]); } });
      nb(IX.rail).forEach(function (r) { if (!visb(r)) return; path(r.ll); g.strokeStyle = '#6e645a'; g.lineWidth = 5 / M; g.stroke(); if (z >= 16) { g.strokeStyle = '#3c3632'; g.lineWidth = .6; g.stroke(); } });
      // trees in residential areas (deterministic per 9 m cell)
      if (z >= 15) {
        var cell = 9, mx0 = ll2m(tlon0, tlat1), mx1 = ll2m(tlon1, tlat0);
        for (var cx = Math.floor(mx0[0] / cell); cx <= Math.ceil(mx1[0] / cell); cx++) for (var cy = Math.floor(mx0[1] / cell); cy <= Math.ceil(mx1[1] / cell); cy++) {
          var h1 = hash(cx, cy, 77); if (h1 > .37) continue; // 后面的阈值最多 .37，先筛掉，省掉九成噪声计算
          var mxp = [cx * cell + hash(cx, cy, 78) * cell, cy * cell + hash(cx, cy, 79) * cell], tll = m2ll(mxp);
          var pine = Math.max(0, Math.min(1, (34.40 - tll[1]) * 4.5 + (fbm(mxp[0] / 300, mxp[1] / 300, 61, 2) - .5) * 1.6));
          if (h1 > .07 + .3 * pine * pine) continue;
          if (!inTown(tll[0], tll[1])) continue;
          if (buildingAt(tll[0], tll[1])) continue;
          if (!pine && h1 > .025 && !inResidential(mxp)) continue;
          var q = P(tll), rr = (pine ? 2.6 + hash(cx, cy, 80) * 3 : 2 + hash(cx, cy, 80) * 3.5) / M;
          g.fillStyle = pine ? 'rgba(22,24,18,.55)' : 'rgba(40,36,28,.45)'; g.beginPath(); g.arc(q[0] - rr * .8, q[1] - rr * .9, rr * (pine ? 1.15 : 1), 0, 7); g.fill();
          g.fillStyle = pine ? (hash(cx, cy, 81) < .5 ? '#2f3a24' : '#3a432a') : (hash(cx, cy, 81) < .5 ? '#4b5532' : '#5d6238'); g.beginPath(); g.arc(q[0], q[1], rr, 0, 7); g.fill();
          if (pine && z >= 17) { g.fillStyle = 'rgba(120,130,90,.35)'; g.beginPath(); g.arc(q[0] + rr * .3, q[1] + rr * .3, rr * .45, 0, 7); g.fill(); }
        }
      }
      // buildings
      nb(IX.bld).forEach(function (b) { if (!visb(b)) return; drawRoof(g, b, P, M, z); });
      // cars in parking lots
      if (z >= 16) nb(IX.area).forEach(function (a) {
        if (a.v !== 'parking' || !visb(a)) return;
        var bx = [1e9, 1e9, -1e9, -1e9]; a.m.forEach(function (q) { bx[0] = Math.min(bx[0], q[0]); bx[1] = Math.min(bx[1], q[1]); bx[2] = Math.max(bx[2], q[0]); bx[3] = Math.max(bx[3], q[1]); });
        for (var x = bx[0] + 2; x < bx[2] - 2; x += 2.8) for (var y = bx[1] + 3; y < bx[3] - 3; y += 6) {
          if (hash(x * 10 | 0, y * 10 | 0, 5) > .28 || !pip([x, y], a.m)) continue;
          var q = P(m2ll([x, y])); g.fillStyle = ['#d8d8d3', '#c9cacb', '#9a9da0', '#3a3b3e', '#6e3330', '#3a4a66', '#b9a98a', '#d8d8d3'][hash(x | 0, y | 0, 6) * 8 | 0];
          g.fillRect(q[0] - .9 / M, q[1] - 2.2 / M, 1.8 / M, 4.4 / M);
        }
      });
    }
    // player facilities
    FAC.forEach(function (f) { var q = P(f.ll); if (q[0] < -200 || q[1] < -200 || q[0] > 456 || q[1] > 456) return; drawFacility(g, f, q, M); });
    g.restore();
    // optics: blur + grain + strip tint, then a real JPEG round trip
    var c2 = document.createElement('canvas'); c2.width = c2.height = S; var g2 = c2.getContext('2d', { willReadFrequently: true });
    g2.filter = 'blur(' + (z >= 16 ? .55 : .4) + 'px) saturate(.88) contrast(1.04)'; g2.drawImage(c, 0, 0); g2.filter = 'none';
    var id = g2.getImageData(0, 0, S, S), dd = id.data;
    var strip = (xlon(X0, z) < -110.172) ? [6, 3, -4] : [0, 0, 0]; // two acquisitions meet west of downtown
    for (var i = 0; i < dd.length; i += 4) { var nz = (hash(i, tx * 7 + ty, z) - .5) * 14; dd[i] += nz + strip[0]; dd[i + 1] += nz + strip[1]; dd[i + 2] += nz + strip[2]; }
    g2.putImageData(id, 0, 0);
    encode(c2, z >= 16 ? .5 : .42, key, done);
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
  // 玩家建筑：按进度分阶段绘制（卫星图俯视）。阶段：放线 → 平整 → 基础 → 主体 → 收尾 → 完工
  function stageOf(p) { return p < .12 ? 0 : p < .3 ? 1 : p < .5 ? 2 : p < .85 ? 3 : 4; }
  function drawFacility(g, f, q, M) {
    var w = f.size[0] / M, h = f.size[1] / M, x0 = q[0] - w / 2, y0 = q[1] - h / 2, p = f.done ? 1 : (f.progress || 0), st = stageOf(p);
    var sd = Math.round(f.ll[0] * 1e4) ^ Math.round(f.ll[1] * 1e4), u = 1 / M; // u = 1 米
    function rect(c, x, y, ww, hh) { g.fillStyle = c; g.fillRect(x, y, ww, hh); }
    function veh(x, y, c, len) { rect('rgba(30,28,24,.45)', x - .4 * u, y - .3 * u, (len || 5) * u, 2.2 * u); rect(c, x, y, (len || 5) * u, 2 * u); }
    function dozer(x, y) { rect('rgba(30,28,24,.5)', x - .5 * u, y - .4 * u, 4 * u, 3 * u); rect('#e2b52a', x, y, 3.6 * u, 2.6 * u); rect('#5a5348', x + 3.6 * u, y - .3 * u, .8 * u, 3.2 * u); }
    function fence(pad) { g.save(); g.setLineDash([2 * u, 1.2 * u]); g.strokeStyle = 'rgba(70,70,70,.75)'; g.lineWidth = Math.max(.5, .4 * u); g.strokeRect(x0 - pad, y0 - pad, w + pad * 2, h + pad * 2); g.restore(); }
    function dirt(pad) { rect('rgba(205,186,152,.96)', x0 - pad, y0 - pad, w + pad * 2, h + pad * 2); g.strokeStyle = 'rgba(150,128,98,.55)'; g.lineWidth = Math.max(.4, .5 * u); for (var i = 0; i < 6; i++) { var yy = y0 - pad + (h + pad * 2) * (i + .5) / 6 + (hash(sd, i, 1) - .5) * 2 * u; g.beginPath(); g.moveTo(x0 - pad, yy); g.bezierCurveTo(x0 + w * .3, yy + 2 * u, x0 + w * .7, yy - 2 * u, x0 + w + pad, yy + (hash(sd, i, 2) - .5) * 3 * u); g.stroke(); } }
    function shadow() { rect('rgba(38,34,30,.5)', x0 - 2.2 * u, y0 - 3 * u, w, h); }
    function look(k, fr) {
      if (k === 'tents') { var n = Math.max(1, Math.round(Math.floor(w / (7 * u)) * fr)); for (var i = 0; i < n; i++) { var tx = x0 + 1.5 * u + i * 7 * u; rect('rgba(30,28,24,.4)', tx - .8 * u, y0 + 1.2 * u, 5.5 * u, 5.5 * u); rect(i % 3 === 1 ? '#3f6fb0' : '#f4f3ee', tx, y0 + 2 * u, 5.5 * u, 5.5 * u); } for (var j = 0; j < 6 * fr; j++) rect('#33302b', x0 + (3 + j * 3.5) * u, y0 + h - 3 * u, 1 * u, 1 * u); }
      else if (k === 'trailers') { var m2 = Math.max(1, Math.round(Math.floor(w / (9 * u)) * fr)); for (var i2 = 0; i2 < m2; i2++) { var ax = x0 + 1.5 * u + i2 * 9 * u; rect('rgba(30,28,24,.45)', ax - .8 * u, y0 + 1 * u, 3 * u, h - 2 * u); rect(f.roof || '#ecece7', ax, y0 + 1.5 * u, 3 * u, h - 3 * u); rect('#7a7f86', ax + .8 * u, y0 + 2 * u, 1.4 * u, 1.4 * u); } }
      else if (k === 'tanks') { var t = Math.max(1, Math.round(3 * fr)); for (var i3 = 0; i3 < t; i3++) { var cx2 = x0 + w * (.2 + .3 * i3), cy2 = y0 + h * .35; g.fillStyle = 'rgba(30,28,24,.45)'; g.beginPath(); g.arc(cx2 - .8 * u, cy2 - 1 * u, 3 * u, 0, 7); g.fill(); g.fillStyle = '#e8e6df'; g.beginPath(); g.arc(cx2, cy2, 3 * u, 0, 7); g.fill(); } if (fr > .6) { rect('#3c5a3a', x0 + w * .15, y0 + h * .72, 7 * u, 3 * u); rect('#3c5a3a', x0 + w * .55, y0 + h * .72, 7 * u, 3 * u); } }
      else if (k === 'pad') { g.strokeStyle = 'rgba(250,248,240,.9)'; g.lineWidth = Math.max(.6, .6 * u); g.beginPath(); g.arc(q[0], q[1], Math.min(w, h) * .38 * Math.max(.3, fr), 0, 7); g.stroke(); if (fr > .5) { g.fillStyle = 'rgba(250,248,240,.95)'; g.font = 'bold ' + Math.max(6, 9 * u) + 'px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', q[0], q[1]); } }
    }

    // ---- 改建现有建筑：施工时屋顶盖蓝色防水布、旁边停垃圾箱和货车；完工后各有标识 ----
    if (f.conv) {
      if (!f.done) {
        var cov = Math.max(.25, p);
        rect('rgba(46,104,170,.85)', x0, y0, w * cov, h * .55);
        g.strokeStyle = 'rgba(220,220,215,.8)'; g.lineWidth = Math.max(.4, .3 * u); for (var s = 0; s < w * cov; s += 2 * u) { g.beginPath(); g.moveTo(x0 + s, y0); g.lineTo(x0 + s, y0 + h * .55); g.stroke(); }
        rect('#3f6d3a', x0 + w + 2 * u, y0 + h - 3 * u, 6 * u, 2.4 * u); veh(x0 - 8 * u, y0 + h + 2 * u, '#efefea', 6);
        if (st >= 2) veh(x0 + w * .4, y0 + h + 2.5 * u, '#c9c3b2');
        return;
      }
      if (f.b === 'isolation') { g.save(); g.setLineDash([1.5 * u, 1 * u]); g.strokeStyle = 'rgba(240,210,60,.9)'; g.lineWidth = Math.max(.6, .5 * u); g.strokeRect(x0 - 6 * u, y0 - 6 * u, w + 12 * u, h + 12 * u); g.restore(); veh(x0 + w + 2 * u, y0 + 2 * u, '#f2f2ee', 7); }
      else if (f.b === 'shelter') { for (var k = 0; k < 3; k++) { rect('rgba(30,28,24,.4)', x0 + w + 3 * u + k * 6 * u - .6 * u, y0 + 2 * u - .4 * u, 4.6 * u, 4.6 * u); rect('#f4f3ef', x0 + w + 3 * u + k * 6 * u, y0 + 2 * u, 4.6 * u, 4.6 * u); } veh(x0 - 12 * u, y0 + h + 3 * u, '#e5c64a', 11); }
      else if (f.b === 'vaccine') { for (var v = 0; v < 8; v++) rect('#2d2a26', x0 + w + 2 * u, y0 + v * 2 * u, .9 * u, .9 * u); rect('#f4f3ee', x0 - 7 * u, y0 + 1 * u, 5 * u, 5 * u); rect('#c8302c', x0 - 5 * u, y0 + 2 * u, 1 * u, 3 * u); rect('#c8302c', x0 - 6 * u, y0 + 3 * u, 3 * u, 1 * u); }
      else if (f.b === 'volcenter') { veh(x0 - 7 * u, y0 + h + 2 * u, '#c9c3b2'); veh(x0 - 1 * u, y0 + h + 2 * u, '#7f2a24'); veh(x0 + 5 * u, y0 + h + 2 * u, '#efefea'); }
      else if (f.b === 'office') { g.fillStyle = '#e8e8e4'; g.beginPath(); g.arc(x0 + w * .75, y0 + h * .3, 1.2 * u, 0, 7); g.fill(); veh(x0 - 7 * u, y0 + h + 2 * u, '#2f3a52'); }
      return;
    }

    // ---- 新建 ----
    if (!f.done) {
      if (st === 0) { // 放线：草地上四角木桩和白灰线
        g.save(); g.setLineDash([2.5 * u, 2 * u]); g.strokeStyle = 'rgba(245,245,240,.85)'; g.lineWidth = Math.max(.5, .35 * u); g.strokeRect(x0, y0, w, h); g.restore();
        [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].forEach(function (c) { rect('#f6f0d8', c[0] - .6 * u, c[1] - .6 * u, 1.2 * u, 1.2 * u); });
        veh(x0 - 9 * u, y0 + h + 3 * u, '#efefea'); return;
      }
      dirt(3 * u);
      if (st === 1) { dozer(x0 + w * (.2 + .6 * hash(sd, 0, 7)), y0 + h * .35); dozer(x0 + w * .55, y0 + h * .7); veh(x0 - 10 * u, y0 + h + 4 * u, '#d9d2bf', 7); return; }
      fence(4 * u);
      var fr = st === 2 ? 0 : st === 3 ? (p - .5) / .35 : 1;
      if (f.grid) { // 拖车点：碎石场地 + 水电桩，拖车一排排进场
        rect('rgba(184,172,148,.97)', x0, y0, w, h);
        var tot = 28, n = Math.floor(tot * Math.max(0, (p - .45) / .55));
        for (var r = 0; r < 4; r++) for (var cc = 0; cc < 7; cc++) { var tx = x0 + (4 + cc * 9.5) * u, ty = y0 + (4 + r * 11) * u, idx = r * 7 + cc; rect('#6c675d', tx + 4 * u, ty + 3 * u, .8 * u, .8 * u); if (idx < n) { rect('rgba(40,36,30,.45)', tx - 1.5 * u, ty - 1.5 * u, 3 * u, 8.5 * u); rect('#e7e6e1', tx, ty, 3 * u, 8.5 * u); } }
        if (n < tot) veh(x0 + w + 3 * u, y0 + h * .4, '#f2f2ee', 12);
        return;
      }
      if (f.tower) { // 铁塔：方形基础 + 三个拉线锚 + 逐渐变长的影子
        rect('#c9c5bb', q[0] - 2.5 * u, q[1] - 2.5 * u, 5 * u, 5 * u);
        [[0, -1], [.87, .5], [-.87, .5]].forEach(function (d) { rect('#b8b3a7', q[0] + d[0] * 20 * u - u, q[1] + d[1] * 20 * u - u, 2 * u, 2 * u); });
        if (fr > 0) { g.strokeStyle = 'rgba(30,28,26,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] - 30 * u * fr, q[1] - 40 * u * fr); g.stroke(); rect('#9a9a96', q[0] - 1.2 * u, q[1] - 1.2 * u, 2.4 * u, 2.4 * u); }
        veh(q[0] + 8 * u, q[1] + 6 * u, '#d9a21e', 9); return;
      }
      if (f.look === 'tents' || f.look === 'pad' || f.look === 'tanks' || f.look === 'trailers') { // 简易设施：场地铺好后逐个摆放
        rect(f.look === 'pad' ? '#9a9892' : 'rgba(184,172,148,.97)', x0, y0, w, h);
        if (fr > 0) look(f.look, fr);
        veh(x0 - 8 * u, y0 + h + 3 * u, '#efefea', 8); return;
      }
      if (f.b === 'check') { // 检查点：先铺路面，再搭帐篷、摆锥桶
        rect('#8d8b86', x0, y0, w, h); g.strokeStyle = 'rgba(250,250,245,.8)'; g.lineWidth = Math.max(.4, .25 * u); g.beginPath(); g.moveTo(x0, q[1]); g.lineTo(x0 + w, q[1]); g.stroke();
        if (fr > 0) rect('#f1efe6', x0 + 2 * u, y0 + 1 * u, (w - 4 * u) * fr, h * .4);
        return;
      }
      // 普通房屋：混凝土板 → 钢架 → 屋面从一头铺到另一头
      rect('#cfcac0', x0, y0, w, h);
      g.strokeStyle = st === 2 ? 'rgba(120,96,70,.5)' : 'rgba(70,72,76,.75)'; g.lineWidth = Math.max(.4, .3 * u);
      var step = st === 2 ? 1.5 * u : 4 * u; for (var gx = x0 + step; gx < x0 + w; gx += step) { g.beginPath(); g.moveTo(gx, y0); g.lineTo(gx, y0 + h); g.stroke(); }
      if (st === 2) for (var gy = y0 + step; gy < y0 + h; gy += step) { g.beginPath(); g.moveTo(x0, gy); g.lineTo(x0 + w, gy); g.stroke(); }
      if (fr > 0) { rect('rgba(38,34,30,.35)', x0 - 2 * u, y0 - 2.5 * u, w * fr, h); rect(f.roof || '#d8d7d1', x0, y0, w * fr, h); }
      if (st === 3 && fr < .9) { g.strokeStyle = 'rgba(200,60,40,.9)'; g.lineWidth = Math.max(.6, .4 * u); g.beginPath(); g.moveTo(x0 + w * fr, y0 - 6 * u); g.lineTo(x0 + w * fr + 10 * u, y0 - 12 * u); g.stroke(); } // 吊车臂
      veh(x0 - 9 * u, y0 + h + 4 * u, '#efefea'); if (st === 4) veh(x0 + w * .5, y0 + h + 4 * u, '#5a6a7a');
      return;
    }
    // ---- 完工 ----
    if (f.grid) {
      rect('rgba(190,178,152,.95)', x0, y0, w, h);
      for (var r2 = 0; r2 < 4; r2++) for (var c2 = 0; c2 < 7; c2++) { var x = x0 + (4 + c2 * 9.5) * u, y = y0 + (4 + r2 * 11) * u; rect('rgba(40,36,30,.45)', x - 1.5 * u, y - 1.5 * u, 3 * u, 8.5 * u); rect('#e7e6e1', x, y, 3 * u, 8.5 * u); }
      return;
    }
    if (f.tower) { g.strokeStyle = 'rgba(30,28,26,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] - 30 * u, q[1] - 40 * u); g.stroke(); g.strokeStyle = 'rgba(30,28,26,.25)'; [[0, -1], [.87, .5], [-.87, .5]].forEach(function (d) { g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + d[0] * 20 * u, q[1] + d[1] * 20 * u); g.stroke(); }); rect('#9a9a96', q[0] - 2 * u, q[1] - 2 * u, 4 * u, 4 * u); return; }
    if (f.look === 'tents' || f.look === 'pad' || f.look === 'tanks' || f.look === 'trailers') { rect(f.look === 'pad' ? '#9a9892' : 'rgba(190,178,152,.95)', x0, y0, w, h); look(f.look, 1); return; }
    if (f.b === 'check') { rect('#8d8b86', x0 - 2 * u, y0, w + 4 * u, h); shadow(); rect(f.roof || '#f1efe6', x0, y0, w, h * .5); for (var c3 = 0; c3 < 5; c3++) rect('#e8662a', x0 - 6 * u + c3 * 2.5 * u, y0 + h * .75, .9 * u, .9 * u); veh(x0 + w + 2 * u, y0 + h * .55, '#f4f4f0'); return; }
    shadow(); rect(f.roof || '#d8d7d1', x0, y0, w, h);
    g.strokeStyle = 'rgba(80,76,70,.6)'; g.lineWidth = .8; g.strokeRect(x0, y0, w, h);
    if (f.b === 'clinic') { rect('#b9b8b2', x0 + w * .2, y0 + h * .3, 2 * u, 2 * u); rect('#b9b8b2', x0 + w * .6, y0 + h * .3, 2 * u, 2 * u); veh(x0 + w + 2 * u, y0 + h * .2, '#f4f4f0', 6); }
    if (f.b === 'warehouse') { g.strokeStyle = 'rgba(80,80,80,.35)'; for (var s2 = x0 + 2 * u; s2 < x0 + w; s2 += 2 * u) { g.beginPath(); g.moveTo(s2, y0); g.lineTo(s2, y0 + h); g.stroke(); } veh(x0 + w * .2, y0 + h + 3 * u, '#efefea', 14); }
  }

  // ---- 夜间照明：预先烘焙（2026-11-22） ----
  // 按 2009 年美国西南小镇的实际情况摆灯（米制，与 OSM 同一坐标系），每个图块烘焙三张透明图，和卫星图块一样缓存、分批生成：
  //  st 路灯和停车场照明的地面照度（乘到白天影像上：沥青被钠灯照成橙褐色，屋顶、地面纹理都还在）
  //  hm 住宅门廊和窗户漏到院子里的暖光（随钟点变化：晚上多，后半夜少）
  //  em 灯具本身和加油站雨棚的亮点（叠加，不受地面颜色影响）
  // 灯型：干道（primary/secondary/trunk/tertiary）高压钠灯眼镜蛇头路灯，间距约 45 米、两侧交错；住宅街只在路口和每 120 米一盏；
  // I-40 主线不亮灯，只有匝道的高杆灯；停车场金卤灯，约 34 米一根；大型商业建筑四角壁灯；加油站雨棚；约一半住宅亮灯。
  var LAMPS = null, LIX = null;
  var LCOL = { hps: [255, 150, 52], hpsCore: [255, 206, 140], mh: [226, 232, 246], home: [255, 168, 84], mast: [255, 164, 70] };   // 高压钠灯约 2100 K；金卤灯偏冷白；白炽灯约 2700 K
  function buildLamps() {
    if (LAMPS) return LAMPS; LAMPS = [];
    function add(p, k, r, i, core) { var ll = m2ll(p), dl = r * 2.6 / KX, dt = r * 2.6 / KY; LAMPS.push({ ll: ll, k: k, r: r, i: i, c: core || 0, bb: [ll[0] - dl, ll[1] - dt, ll[0] + dl, ll[1] + dt] }); }
    var CLS = { trunk: [42, 9, 20, .95], primary: [44, 9, 20, .95], secondary: [52, 8, 18, .85], tertiary: [60, 8, 17, .8], motorway_link: [70, 0, 42, 1.1], trunk_link: [50, 6, 18, .85], primary_link: [50, 6, 18, .85] };
    var deg = {}, key = function (p) { return Math.round(p[0]) + ',' + Math.round(p[1]); };
    var DRIVE = /^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street)(_link)?$/;
    HW.forEach(function (h) { if (DRIVE.test(h.h)) h.m.forEach(function (p) { var k = key(p); deg[k] = (deg[k] || 0) + 1; }); });
    var done = {};
    HW.forEach(function (h, hi) {
      var c = CLS[h.h], res = /^(residential|unclassified|living_street)$/.test(h.h);
      if (!c && !res) return;
      var sp = c ? c[0] : 120, off = c ? c[1] : 6, r = c ? c[2] : 15, it = c ? c[3] : .7, kind = h.h === 'motorway_link' ? 'mast' : 'hps';
      var acc = sp * (.35 + .3 * hash(hi, 1, 41)), side = 1;
      for (var i = 1; i < h.m.length; i++) {
        var a = h.m[i - 1], b = h.m[i], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); if (!L) continue;
        var nx = -dy / L, ny = dx / L;
        while (acc <= L) {
          var t = acc / L, p = [a[0] + dx * t + nx * off * side, a[1] + dy * t + ny * off * side];
          if (hash(hi, i * 31 + (acc | 0), 43) > .08) add(p, kind, r * (.9 + .2 * hash(hi, i, 44)), it, kind === 'mast' ? 1.4 : 1);  // 少数灯坏了不亮
          side = -side; acc += sp;
        }
        acc -= L;
      }
      // 住宅街：路口一盏
      if (res) h.m.forEach(function (p, i) { var k = key(p); if (deg[k] >= 2 && !done[k] && hash(p[0] | 0, p[1] | 0, 45) < .78) { done[k] = 1; add([p[0] + 5, p[1] + 5], 'hps', 15, .75, 1); } });
    });
    // 停车场：金卤灯网格
    AREA.forEach(function (a) {
      if (a.v !== 'parking') return;
      var bx = [1e9, 1e9, -1e9, -1e9]; a.m.forEach(function (q) { bx[0] = Math.min(bx[0], q[0]); bx[1] = Math.min(bx[1], q[1]); bx[2] = Math.max(bx[2], q[0]); bx[3] = Math.max(bx[3], q[1]); });
      var n = 0;
      for (var x = bx[0] + 12; x < bx[2] - 6; x += 34) for (var y = bx[1] + 12; y < bx[3] - 6; y += 34) if (pip([x, y], a.m)) { add([x, y], 'mh', 21, .9, 1.2); n++; }
      if (!n) { var cxm = (bx[0] + bx[2]) / 2, cym = (bx[1] + bx[3]) / 2; if (pip([cxm, cym], a.m)) add([cxm, cym], 'mh', 16, .7, 1); }
    });
    BLD.forEach(function (b) {
      var bx = b.box, cxm = (bx[0] + bx[2]) / 2, cym = (bx[1] + bx[3]) / 2;
      var biz = /commercial|retail|motel|school|industrial|warehouse|public|train_station|church|hotel|supermarket/.test(b.b) || b.am, flat = b.area > 380 || biz || b.b === 'roof';
      if (/fuel/.test(b.am)) { add([cxm, cym], 'mh', Math.max(14, Math.sqrt(b.area) * .9), 1.25, 2.2); return; }   // 加油站雨棚
      if (flat) { // 商业建筑：四角壁灯，招牌一侧更亮
        if (!biz) { if (b.area > 600 && hash(b.i, 9, 46) < .3) add([bx[0] - 2, bx[3] + 2], 'mh', 8, .45, .6); return; }   // 没有标注用途的大房子（谷仓、车库）：偶尔一盏
        if (b.area < 250) return;
        [[bx[0], bx[1]], [bx[2], bx[1]], [bx[0], bx[3]], [bx[2], bx[3]]].forEach(function (q, j) { if (hash(b.i, j, 46) < .5) add([q[0] + (q[0] < cxm ? -2 : 2), q[1] + (q[1] < cym ? -2 : 2)], 'mh', 9, .55, .8); });
        if (/motel|retail|commercial/.test(b.b) || b.am) add([cxm, bx[3] + 4], 'hpsCore', 7, .5, 1.3);
        return;
      }
      if (hash(b.i, 7, 47) < .56) add([cxm + (hash(b.i, 1, 48) - .5) * 6, cym + (hash(b.i, 2, 48) - .5) * 6], 'home', 7 + 3 * hash(b.i, 3, 48), .42, hash(b.i, 4, 48) < .35 ? .5 : 0);
    });
    LIX = mkIndex(LAMPS);
    return LAMPS;
  }
  // 光斑贴图：地面照度按 (1 + (d/r)²)^-1.7 衰减，2.6 r 处截断（路灯在地面上的光斑边缘是渐变的，中心偏亮）
  var SPR = {};
  function sprite(kind, core) {
    var key = kind + (core ? 'c' : ''); if (SPR[key]) return SPR[key];
    var N2 = 64, c = document.createElement('canvas'); c.width = c.height = N2; var g = c.getContext('2d'), im = g.createImageData(N2, N2), d = im.data, col = LCOL[kind] || LCOL.hps;
    for (var y = 0; y < N2; y++) for (var x = 0; x < N2; x++) {
      var dx = (x + .5 - N2 / 2) / (N2 / 2) * 2.6, dy = (y + .5 - N2 / 2) / (N2 / 2) * 2.6, dd = dx * dx + dy * dy, v;
      if (core) v = Math.exp(-dd * 2.2) + .18 * Math.exp(-dd * .35);                 // 灯具：亮核 + 一点光晕
      else v = dd >= 6.76 ? 0 : (Math.pow(1 + dd, -1.7) - Math.pow(7.76, -1.7)) / (1 - Math.pow(7.76, -1.7));
      var o = (y * N2 + x) * 4, a = Math.min(1, v); d[o] = col[0] * a; d[o + 1] = col[1] * a; d[o + 2] = col[2] * a; d[o + 3] = 255 * a;
    }
    g.putImageData(im, 0, 0); return (SPR[key] = c);
  }
  var LCACHE = {}, LORDER = [], LLIMIT = 180;
  function light(z, tx, ty) {
    var k = 'L/' + z + '/' + tx + '/' + ty, c = LCACHE[k];
    if (!c && !PENDING[k] && QUEUE.indexOf(k) < 0) QUEUE.push(k);
    return c || null;
  }
  function peekLight(z, tx, ty) { return LCACHE['L/' + z + '/' + tx + '/' + ty] || null; }
  function makeLight(z, tx, ty, key, done) {
    buildLamps();
    var X0 = tx * 256, Y0 = ty * 256, M = mpp(z), mk = function () { var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.globalCompositeOperation = 'lighter'; return [c, g]; };
    var ST = mk(), HM = mk(), EM = mk(), any = false;
    var lon0 = xlon(X0 - 64, z), lon1 = xlon(X0 + 320, z), lat1 = ylat(Y0 - 64, z), lat0 = ylat(Y0 + 320, z);
    near(LIX, lon0, lat0, lon1, lat1).forEach(function (L) {
      var x = wx(L.ll[0], z) - X0, y = wy(L.ll[1], z) - Y0, rp = L.r / M, i = L.i, glowK = z < 13 ? 3 : 1;   // 远看时一个镇子的灯连成一团光
      if (rp < .9) { i *= (rp * rp) / .81; rp = .9; }                                    // 缩小后光斑小于一个像素：面积守恒，镇子整体成一团光
      var s = rp * 2.6, tgt = L.k === 'home' ? HM : ST;
      if (x < -s || y < -s || x > 256 + s || y > 256 + s) return;
      var kind = L.k === 'mast' ? 'mast' : L.k === 'hpsCore' ? 'hps' : L.k, home = L.k === 'home';
      tgt[1].globalAlpha = Math.min(1, i); tgt[1].drawImage(sprite(kind), x - s, y - s, s * 2, s * 2);
      // 叠加层：钠灯在空气和地面上的散射光晕（照片里街道发橙的那一层），再加灯具本身的亮点
      EM[1].globalAlpha = Math.min(1, i * (home ? .05 : .2) * glowK); EM[1].drawImage(sprite(kind), x - s * 1.25, y - s * 1.25, s * 2.5, s * 2.5);
      if (L.c && z >= 13) { var cr = Math.max(.9, (home ? .7 : 1.4) / M * 2.4) * L.c; EM[1].globalAlpha = Math.min(1, (home ? .28 : .85) * Math.min(1, .5 + (z - 13) * .2)); EM[1].drawImage(sprite(L.k === 'mast' ? 'mast' : L.k === 'hpsCore' ? 'hpsCore' : L.k, true), x - cr * 2.6, y - cr * 2.6, cr * 5.2, cr * 5.2); }
      any = true;
    });
    delete PENDING[key];
    LCACHE[key] = any ? { st: ST[0], hm: HM[0], em: EM[0] } : { empty: true };
    LORDER.push(key); if (LORDER.length > LLIMIT) delete LCACHE[LORDER.shift()];
    done && done();
  }
  function stageKey(f) { return f.done ? 99 : Math.floor((f.progress || 0) * 20); }

  return { R: R, BLD: BLD, HW: HW, RAIL: RAIL, WAT: WAT, AREA: AREA, POI: POI, m2ll: m2ll, ll2m: ll2m, wx: wx, wy: wy, xlon: xlon, ylat: ylat, mpp: mpp, pip: pip, hash: hash,
    buildingAt: buildingAt, inTown: inTown, townAt: townAt, TOWN_BOXES: TOWN_BOXES, boxHitsTown: boxHitsTown, tile: tile, peek: peek, light: light, peekLight: peekLight, lamps: buildLamps, pump: pump, setFacilities: setFacilities, stageOf: stageOf, stageKey: stageKey, invalidate: invalidate, queueLen: function () { return QUEUE.length; }, clearQueue: function () { QUEUE.length = 0; } };
})();
