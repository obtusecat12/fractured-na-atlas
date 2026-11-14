// labels.js — cartographic name placement for factions and radio silence.
// Each faction part carries (precomputed, map space): pole of inaccessibility p, inscribed radius r, bbox b and a
// smoothed medial-axis centreline l = [[x,y,halfWidth],...].  At draw time, per part and zoom:
//   1. horizontal block at the pole / along the centreline (fit-tested against the hit raster), shrinking 1-2px;
//   2. curved text along the centreline (English rotated per glyph, Chinese kept upright and spread, like printed atlases);
//   3. wrapped block (English broken over 2-3 lines, long Chinese names over 2 lines);
//   4. for the main visible part only, a small label set beside the shape (as atlases do for tiny states).
// Further parts of scattered polities get their own label once big enough on screen.
var LBL = (function () {
  var LD = null, HD = null, HW = 0, HH = 0;
  var ZHF = '"Microsoft YaHei","PingFang SC","Hiragino Sans GB","Noto Sans CJK SC","WenQuanYi Micro Hei","SimHei",sans-serif';
  var ENF = 'Arial,Helvetica,sans-serif';
  function data() { if (!LD) { var el = document.getElementById('labels'); LD = el ? JSON.parse(el.textContent) : {}; } return LD; }
  function hitData() {
    if (HD) return;
    hitTest(0, 0); var c = D.hit; HW = c.width; HH = c.height;
    HD = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, HW, HH).data;
  }
  function idAt(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return -1;
    var i = ((y >> 2) * HW + (x >> 2)) * 4, r = HD[i];
    // v3.3: decode a1 hitTest colour codes (r=(n+1)*5, g=97, b checksum); faction id = n+1, nation-only = 0
    if (HD[i + 1] === 97 && r && r % 5 === 0) { var n = r / 5 - 1; if (HD[i + 2] === (n * 37 + 11) % 251) return n + 1; }
    if (HD[i + 1] === 97) return -2;   // antialiased edge between factions
    return HD[i + 2] === 200 && !r && !HD[i + 1] ? 0 : (HD[i + 2] ? -2 : -1);
  }
  // fraction of sample points of a screen rectangle that are NOT on `want`
  function badFrac(cx, cy, w, h, want, ang) {
    var t = S.t, nx = Math.max(3, Math.ceil(w / 12)), ny = Math.max(2, Math.ceil(h / 8)), bad = 0, n = 0;
    var ca = Math.cos(ang || 0), sa = Math.sin(ang || 0);
    for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) {
      var dx = (i / (nx - 1) - 0.5) * w, dy = (j / (ny - 1) - 0.5) * h;
      var sx = cx + dx * ca - dy * sa, sy = cy + dx * sa + dy * ca;
      var mx = (sx - t.x) / t.k, my = (sy - t.y) / t.k;
      n++; if (idAt(mx, my) !== want) bad++;
    }
    return bad / n;
  }
  function otherFrac(cx, cy, w, h, want) {
    var t = S.t, n = 0, o = 0;
    for (var i = 0; i < 5; i++) for (var j = 0; j < 3; j++) {
      var sx = cx + (i / 4 - 0.5) * w, sy = cy + (j / 2 - 0.5) * h, id = idAt((sx - t.x) / t.k, (sy - t.y) / t.k);
      n++; if (id > 0 && id !== want) o++;
    }
    return o / n;
  }
  function splitEn(s, n) {
    var w = s.split(' '); if (n <= 1 || w.length < n) return n <= 1 ? [s] : null;
    var best = null, bs = 1e9;
    function rec(i, k, acc) {
      if (k === 1) { var L = acc.concat([w.slice(i).join(' ')]); var m = Math.max.apply(null, L.map(function (x) { return x.length; })); if (m < bs) { bs = m; best = L; } return; }
      for (var j = i + 1; j <= w.length - k + 1; j++) rec(j, k - 1, acc.concat([w.slice(i, j).join(' ')]));
    }
    rec(0, n, []); return best;
  }
  function splitZh(s) {
    if (s.length < 6) return null;
    var k = s.search(/[·—\-]/);
    if (k > 0 && k < s.length - 1) return [s.slice(0, k + (s[k] === '·' ? 0 : 1)).replace(/·$/, ''), s.slice(k + 1)];
    var h = Math.ceil(s.length / 2); return [s.slice(0, h), s.slice(h)];
  }
  function layouts(zh, en, mode) {
    var Z = [[zh]], E = [[en]], o = [];
    var z2 = splitZh(zh); if (z2) Z.push(z2);
    var e2 = splitEn(en, 2), e3 = splitEn(en, 3); if (e2) E.push(e2); if (e3) E.push(e3);
    if (mode === 'zh') Z.forEach(function (z) { o.push({ zh: z, en: [] }); });
    else if (mode === 'en') E.forEach(function (e) { o.push({ zh: [], en: e }); });
    else Z.forEach(function (z) { E.forEach(function (e) { o.push({ zh: z, en: e }); }); });
    o.sort(function (a, b) { return (a.zh.length + a.en.length) - (b.zh.length + b.en.length); });
    return o;
  }
  function fontZ(sz, bold) { return (bold ? 'bold ' : '') + sz + 'px ' + ZHF; }
  function fontE(sz, bold) { return (bold ? 'bold ' : '') + sz + 'px ' + ENF; }
  function setLS(px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }
  function measure(L, sz, ls, bold) {
    var w = 0, rows = [];
    L.zh.forEach(function (s) { ctx.font = fontZ(sz + 1, bold); setLS(ls * 1.6); var m = ctx.measureText(s).width; rows.push({ s: s, f: ctx.font, ls: ls * 1.6, h: sz + 4, w: m }); w = Math.max(w, m); });
    L.en.forEach(function (s) { ctx.font = fontE(sz, bold); setLS(ls); var m = ctx.measureText(s).width; rows.push({ s: s, f: ctx.font, ls: ls, h: sz + 2, w: m }); w = Math.max(w, m); });
    setLS(0);
    var h = rows.reduce(function (a, r) { return a + r.h; }, 0);
    return { w: w, h: h, rows: rows };
  }
  function style(kind) {
    var night = S.mode === 'night';
    if (kind === 'sil') return { fill: night ? '#5e5e5e' : '#c9c9c9', halo: null };
    return { fill: night ? '#f2f2f2' : '#333', halo: night ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,.92)', hw: night ? 2.2 : 3 };
  }
  function drawBlock(B, cx, cy, st) {
    var y = cy - B.h / 2;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    B.rows.forEach(function (r) {
      ctx.font = r.f; setLS(r.ls);
      // letterSpacing adds trailing space after the last glyph: shift by half of it
      var x = cx + r.ls / 2, yy = y + r.h / 2;
      if (st.halo) { ctx.lineWidth = st.hw; ctx.strokeStyle = st.halo; ctx.strokeText(r.s, x, yy); }
      ctx.fillStyle = st.fill; ctx.fillText(r.s, x, yy);
      y += r.h;
    });
    setLS(0);
  }
  // ---------- centreline helpers (screen space) ----------
  function screenLine(l) {
    var t = S.t, P = l.map(function (q) { return [t.applyX(q[0]), t.applyY(q[1]), q[2] * t.k]; });
    if (P.length > 1) {   // v3.3: read left-to-right, but top-to-bottom when the line runs mostly north-south (upright CJK)
      var ddx = P[P.length - 1][0] - P[0][0], ddy = P[P.length - 1][1] - P[0][1];
      if (Math.abs(ddy) > Math.abs(ddx) * 1.2 ? ddy < 0 : ddx < 0) P.reverse();
    }
    var d = [0]; for (var i = 1; i < P.length; i++) d.push(d[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { P: P, d: d, L: d[d.length - 1] };
  }
  function at(SL, s) {
    var P = SL.P, d = SL.d, i = 1;
    while (i < d.length - 1 && d[i] < s) i++;
    var a = P[i - 1], b = P[i], seg = (d[i] - d[i - 1]) || 1, f = Math.max(0, Math.min(1, (s - d[i - 1]) / seg));
    // direction smoothed over a window
    var s0 = Math.max(0, s - 14), s1 = Math.min(SL.L, s + 14), A = pt(SL, s0), Bp = pt(SL, s1);
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, hw: a[2] + (b[2] - a[2]) * f, ang: Math.atan2(Bp[1] - A[1], Bp[0] - A[0]) };
  }
  function pt(SL, s) {
    var P = SL.P, d = SL.d, i = 1; while (i < d.length - 1 && d[i] < s) i++;
    var a = P[i - 1], b = P[i], seg = (d[i] - d[i - 1]) || 1, f = Math.max(0, Math.min(1, (s - d[i - 1]) / seg));
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }
  // curved label: returns placement or null
  function curved(SL, zh, en, mode, sz, want, free, side) {
    if (SL.L < 40) return null;
    var rowsSpec = [];
    if (mode !== 'en') rowsSpec.push({ s: zh, zh: true, f: fontZ(sz + 1, true) });
    if (mode !== 'zh') rowsSpec.push({ s: en, zh: false, f: fontE(sz, true) });
    var needHW = mode === 'both' ? sz * 1.0 : sz * 0.5;
    var off = mode === 'both' ? [-(sz * 0.62), sz * 0.62] : [0];
    var out = [], boxes = [];
    for (var r = 0; r < rowsSpec.length; r++) {
      var R = rowsSpec[r]; ctx.font = R.f; setLS(0);
      var ch = Array.from(R.s), cw = ch.map(function (c) { return R.zh ? sz + 1 : ctx.measureText(c).width; });
      var tw = cw.reduce(function (a, b) { return a + b; }, 0);
      if (tw > SL.L * 0.92) return null;
      var extra = ch.length > 1 ? Math.max(0, Math.min((R.zh ? 1.6 : 0.9) * sz, (SL.L * 0.66 - tw) / (ch.length - 1))) : 0;
      var tot = tw + extra * (ch.length - 1), s = (SL.L - tot) / 2, prev = null, G = [];
      for (var i = 0; i < ch.length; i++) {
        var c = at(SL, s + cw[i] / 2);
        if (!side && c.hw < needHW) return null;
        if (prev != null) { var da = Math.abs(((c.ang - prev + 3 * Math.PI) % (2 * Math.PI)) - Math.PI); if (da > 0.55) return null; }
        prev = c.ang;
        var o = side ? side * (c.hw + sz * 0.8 + r * (sz + 3)) : off[r];
        var nx = -Math.sin(c.ang), ny = Math.cos(c.ang), x = c.x + nx * o, y = c.y + ny * o;
        var mx = (x - S.t.x) / S.t.k, my = (y - S.t.y) / S.t.k;
        if (!side && idAt(mx, my) !== want) return null;
        if (side && x < 2 || x > S.w - 2 || y < 2 || y > S.h - 2) return null;
        G.push({ c: ch[i], x: x, y: y, a: R.zh ? 0 : c.ang, f: R.f });
        var hb = Math.max(cw[i], sz) / 2 + 1; boxes.push([x - hb, y - sz / 2 - 1, x + hb, y + sz / 2 + 1]);
        s += cw[i] + extra;
      }
      out = out.concat(G);
    }
    for (var b = 0; b < boxes.length; b++) if (!free(boxes[b], true)) return null;
    boxes.forEach(function (bx) { free(bx); });
    return { glyphs: out, boxes: boxes };
  }
  function drawGlyphs(G, st) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    G.forEach(function (g) {
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.a); ctx.font = g.f;
      if (st.halo) { ctx.lineWidth = st.hw; ctx.strokeStyle = st.halo; ctx.strokeText(g.c, 0, 0); }
      ctx.fillStyle = st.fill; ctx.fillText(g.c, 0, 0); ctx.restore();
    });
  }
  // ---------- one part ----------
  function placePart(part, zh, en, want, kind, free, allowBeside, isBig, color) {
    var t = S.t, k = t.k, mode = LANG.mode(), st = style(kind);
    var px = t.applyX(part.p[0]), py = t.applyY(part.p[1]);
    var bb = part.b, bx0 = t.applyX(bb[0]), by0 = t.applyY(bb[1]), bx1 = t.applyX(bb[2]), by1 = t.applyY(bb[3]);
    if (bx1 < -20 || bx0 > S.w + 20 || by1 < -20 || by0 > S.h + 20) return null;
    var sa = Math.sqrt(part.a) * k, rr = part.r * k;
    var base = kind === 'sil' ? Math.max(10, Math.min(15, Math.round(9 + sa / 70))) : Math.max(10, Math.min(16, Math.round(9 + sa / 55)));
    var ls0 = kind === 'sil' ? Math.min(9, Math.max(2, (sa - 150) / 60)) : Math.max(0, Math.min(5, (sa - 380) / 90));
    var anchors = [[px, py, 0]];
    var SL = part.l && part.l.length > 3 ? screenLine(part.l) : null;
    if (SL) [0.5, 0.36, 0.64, 0.25, 0.75].forEach(function (f) { var c = at(SL, SL.L * f); anchors.push([c.x, c.y, c.hw]); });
    if (kind === 'fac') {   // v3.3: grid anchors inside the visible part of the shape (big irregular shapes whose pole sits off-screen or in a neck)
      var gx0 = Math.max(10, bx0), gx1 = Math.min(S.w - 10, bx1), gy0 = Math.max(10, by0), gy1 = Math.min(S.h - 10, by1), G = [];
      if (gx1 - gx0 > 60 && gy1 - gy0 > 30) for (var gi = 0; gi < 9; gi++) for (var gj = 0; gj < 9; gj++) {
        var qx = gx0 + (gx1 - gx0) * (gi + 0.5) / 9, qy = gy0 + (gy1 - gy0) * (gj + 0.5) / 9;
        if (idAt((qx - t.x) / k, (qy - t.y) / k) !== want) continue;
        G.push([qx, qy, 999, badFrac(qx, qy, 120, 40, want)]);
      }
      G.sort(function (a, b) { return a[3] - b[3] || Math.hypot(a[0] - px, a[1] - py) - Math.hypot(b[0] - px, b[1] - py); });
      G.slice(0, 12).forEach(function (g) { anchors.push([g[0], g[1], g[2]]); });
    }
    var L = layouts(zh, en, mode);
    // 1+3: straight blocks (single first, wrapped later), several sizes and spacings
    var tries = [];
    for (var li = 0; li < L.length; li++) for (var ds = 0; ds <= 2; ds++) {
      var sz = base - ds; if (sz < 9) continue;
      [ls0, ls0 * 0.4, 0].forEach(function (ls, j) { if (j && ls0 === 0) return; tries.push([li, sz, ls]); });
    }
    var elong = SL ? SL.L / Math.max(4, 2 * rr) : 1;
    var curvedTried = false;
    function tryCurved() {
      curvedTried = true;
      if (!SL) return null;
      for (var ds = 0; ds <= 3; ds++) {
        if (base - ds < 9) break;
        var c = curved(SL, zh, en, mode, base - ds, want, free, 0);
        if (c) { drawGlyphs(c.glyphs, st); return { x: px, y: py }; }
      }
      return null;
    }
    function tryAlong() {
      if (!SL || kind === 'sil' || rr * 2 > 30) return null;
      var col = d3.rgb(color || '#333'), night = S.mode === 'night';
      var fc = night ? col.brighter(1.2).toString() : col.darker(1.3).toString();
      for (var ds = 1; ds <= 2; ds++) for (var sd = -1; sd <= 1; sd += 2) {
        var c = curved(SL, zh, en, mode, base - ds, want, free, sd);
        if (c) { drawGlyphs(c.glyphs, { fill: fc, halo: st.halo, hw: st.hw }); return { x: px, y: py }; }
      }
      return null;
    }
    for (var ti = 0; ti < tries.length; ti++) {
      var T = tries[ti], Lx = L[T[0]];
      // long thin shapes: prefer the curved label before resorting to wrapping
      if (!curvedTried && (Lx.zh.length + Lx.en.length) > (mode === 'both' ? 2 : 1) && elong > 2.2) { var cr = tryCurved(); if (cr) return cr; }
      var B = measure(Lx, T[1], T[2], true);
      for (var ai = 0; ai < anchors.length; ai++) {
        var a = anchors[ai], w = B.w + 4, h = B.h;
        if (ai > 0 && a[2] * 2 < h * 0.8) continue;
        if (a[0] - w / 2 < 2 || a[0] + w / 2 > S.w - 2 || a[1] - h / 2 < 2 || a[1] + h / 2 > S.h - 2) continue;
        if (badFrac(a[0], a[1], w, h, want) > (kind === 'sil' ? 0.04 : 0.07)) continue;
        if (!free([a[0] - w / 2, a[1] - h / 2, a[0] + w / 2, a[1] + h / 2], true)) continue;
        drawBlock(B, a[0], a[1], st); free([a[0] - w / 2, a[1] - h / 2, a[0] + w / 2, a[1] + h / 2]);
        return { x: a[0], y: a[1] };
      }
    }
    if (!curvedTried) { var cr2 = tryCurved(); if (cr2) return cr2; }
    // v3.3: upright vertical CJK column inside the shape (narrow north-south states) before falling back to outside labels
    if (kind === 'fac' && mode !== 'en' && zh && zh.length >= 2) {
      for (var vs = base; vs >= 10; vs--) {
        var vh = zh.length * (vs + 3), vw = vs + 6;
        for (var vi = 0; vi < anchors.length; vi++) {
          var va = anchors[vi];
          if (va[1] - vh / 2 < 2 || va[1] + vh / 2 > S.h - 2 || va[0] - vw / 2 < 2 || va[0] + vw / 2 > S.w - 2) continue;
          if (badFrac(va[0], va[1], vw, vh, want) > 0.07) continue;
          var vb = [va[0] - vw / 2, va[1] - vh / 2, va[0] + vw / 2, va[1] + vh / 2];
          if (!free(vb, true)) continue;
          var VG = []; ctx.font = fontZ(vs + 1, true); var vf = ctx.font;
          for (var vc = 0; vc < zh.length; vc++) VG.push({ c: zh[vc], x: va[0], y: va[1] - vh / 2 + (vc + 0.5) * (vs + 3), a: 0, f: vf });
          drawGlyphs(VG, st); free(vb); return { x: va[0], y: va[1] };
        }
      }
    }
    var al = tryAlong(); if (al) return al;
    // 4: beside the shape
    if (allowBeside && kind !== 'sil' && (bx1 - bx0) + (by1 - by0) > 5) {
      var Lb = layouts(zh, en, mode)[0], Bb = measure(Lb, 10, 0, true), cy = (by0 + by1) / 2;
      var cand = [[bx1 + 4 + Bb.w / 2, cy], [bx0 - 4 - Bb.w / 2, cy], [(bx0 + bx1) / 2, by0 - 3 - Bb.h / 2], [(bx0 + bx1) / 2, by1 + 3 + Bb.h / 2]];
      cand.sort(function (A, B) { return otherFrac(A[0], A[1], Bb.w, Bb.h, want) - otherFrac(B[0], B[1], Bb.w, Bb.h, want); });   // v3.3: prefer sea / silence over a neighbour's land
      for (var ci = 0; ci < cand.length; ci++) {
        var q = cand[ci], bxx = [q[0] - Bb.w / 2 - 1, q[1] - Bb.h / 2, q[0] + Bb.w / 2 + 1, q[1] + Bb.h / 2];
        if (bxx[0] < 2 || bxx[2] > S.w - 2 || bxx[1] < 2 || bxx[3] > S.h - 2) continue;
        if (!free(bxx, true)) continue;
        drawBlock(Bb, q[0], q[1], { fill: S.mode === 'night' ? d3.rgb(color || '#ddd').brighter(1.2).toString() : d3.rgb(color || '#555').darker(1.3).toString(), halo: st.halo, hw: st.hw }); free(bxx);
        return { x: q[0], y: q[1] };
      }
    }
    return null;
  }
  function drawFactions(free) {
    data(); hitData();
    var t = S.t, list = D.factions.slice().sort(function (a, b) { return b.meta.area - a.meta.area; });
    list.forEach(function (f) {
      var m = f.meta, parts = LD[f.id]; if (!parts || !parts.length) return;
      var want = D.factions.indexOf(f) + 1, placed = [], primaryDone = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], sa = Math.sqrt(p.a) * t.k;
        var onS = t.applyX(p.p[0]) > -10 && t.applyX(p.p[0]) < S.w + 10 && t.applyY(p.p[1]) > -10 && t.applyY(p.p[1]) < S.h + 10;
        if (!onS) continue;
        if (primaryDone && sa < 55) continue;
        var sx = t.applyX(p.p[0]), sy = t.applyY(p.p[1]);
        if (placed.some(function (q) { return Math.hypot(q.x - sx, q.y - sy) < 260; })) continue;
        var r = placePart(p, m.zh, m.en, want, 'fac', free, !primaryDone, i === 0, m.color);
        primaryDone = true;
        if (r) placed.push(r);
      }
    });
  }
  function drawSilence(free) {
    data(); hitData();
    var t = S.t, parts = LD._silence || [], placed = [], nm = (D.meta && D.meta.none) || {};
    var zh = nm.zh || '无线电静默', en = 'RADIO SILENCE', maxN = 6;
    function ok(x, y) { return placed.every(function (q) { return Math.hypot(q.x - x, q.y - y) > 520; }); }
    parts.forEach(function (p, i) {
      if (placed.length >= maxN) return;
      var sx = t.applyX(p.p[0]), sy = t.applyY(p.p[1]);
      if (!ok(sx, sy)) return;
      var r = placePart(p, zh, en, 0, 'sil', free, false, i === 0);
      if (r) placed.push(r);
    });
    var G = (LD._silgrid || []).map(function (g) { return [t.applyX(g[0]), t.applyY(g[1]), g[2] * t.k]; })
      .filter(function (g) { return g[0] > 80 && g[0] < S.w - 80 && g[1] > 30 && g[1] < S.h - 30 && g[2] > 40; })
      .sort(function (a, b) { return b[2] - a[2]; });
    for (var i = 0; i < G.length && placed.length < maxN; i++) {
      var g = G[i]; if (!ok(g[0], g[1])) continue;
      var part = { a: Math.pow(g[2] * 2.2 / t.k, 2), p: [(g[0] - t.x) / t.k, (g[1] - t.y) / t.k], r: g[2] / t.k, b: [(g[0] - g[2] - t.x) / t.k, (g[1] - g[2] - t.y) / t.k, (g[0] + g[2] - t.x) / t.k, (g[1] + g[2] - t.y) / t.k], l: null };
      var r = placePart(part, zh, en, 0, 'sil', free, false, false);
      if (r) placed.push(r);
    }
  }
  return { factions: drawFactions, silence: drawSilence, reset: function () { HD = null; } };
})();
