// fv_live.js - live layer of the FINVIZ pages (needs LIVE, FV and live.js)
(function () {
  'use strict';
  var F = window.FV, L = MK.L, $ = function (id) { return document.getElementById(id); };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function q(t, S) { var d = F.q[t]; if (!d) return null; return MK.quote(t, d[0], d[1], d[2], d[3], S); }
  window.FVQ = function (t) { return q(t); };
  function perf(t) { if (!F.q[t]) return null; var S = MK.state(); return q(t, S).pct; }
  function colorSpan(el, v, txt) { el.innerHTML = '<span style="color:#' + (v >= 0 ? '008800' : 'aa0000') + ';">' + txt + '</span>'; }
  function replaceWithCanvas(img, w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.style.display = 'block'; img.parentNode.replaceChild(cv, img); return cv; }
  // one canvas per stats bar, map and the small map
  var stats = [], small = null, big = null;
  for (var i = 0; i < 5; i++) { var im = $('fvst' + i); if (im) stats.push(replaceWithCanvas(im, 180, 24)); }
  if ($('fvmapsm')) small = replaceWithCanvas($('fvmapsm'), 400, 300);
  if ($('map-img')) { big = replaceWithCanvas($('map-img'), 800, 600); big.id = 'map-cv'; }
  function clock(S) {
    var t = $('time'); if (!t) return;
    var M = Math.floor(S.M), h = Math.floor(M / 60), m = M % 60, ap = h < 12 ? 'AM' : 'PM';
    t.textContent = 'Thursday NOV 05 2009 ' + (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + ap + ' PST';
  }
  function indexes(S) {
    F.idx.forEach(function (x) {
      var im = $('fvidx-' + x.key); if (!im) return;
      if (S.ph === 'pre') {
        if (im.getAttribute('data-s') !== 'pre') { im.src = x.pre; im.setAttribute('data-s', 'pre'); }
        if (im.__cv) im.__cv.getContext('2d').clearRect(0, 0, 330, 160); return;
      }
      if (im.getAttribute('data-s') !== 'day') { im.src = x.base; im.setAttribute('data-s', 'day'); }
      var vals = L[x.key], v = MK.at(vals, S.sm), ch = v - x.prev;
      MK.fvidx(im, x.spec, vals, S.sm, { text: MK.num(v) + '  ' + MK.sgn(ch) + ' (' + MK.sgn(ch / x.prev * 100) + '%)', neg: ch < 0 },
               'Nov 05  ' + MK.hm(MK.OPEN + S.sm, 'AM').toUpperCase().replace('AM', 'AM').replace('PM', 'PM') + ' PT', S.sm >= L.HALT[0]);
    });
  }
  function statsBars(S) {
    var k = S.ph === 'pre' ? -1 : Math.max(0, Math.min(1, S.u));
    F.stats.forEach(function (s, i) {
      if (!stats[i]) return;
      var lv = k < 0 ? s[4] : Math.round(s[6] + (s[2] - s[6]) * k), rv = k < 0 ? s[5] : Math.round(s[7] + (s[3] - s[7]) * k);
      if (s[8]) { lv = s[2]; rv = s[3]; }
      MK.fvstat(stats[i], s[0], s[1], lv, rv);
    });
  }
  // signal tables: before the open FINVIZ lists Wednesday's movers, so rank by Wednesday's change
  var sig = null;
  function sigSetup() {
    sig = []; var tabs = [];
    document.querySelectorAll('td[data-l]').forEach(function (td) {
      var tr = td.parentNode, tb = tr.parentNode; if (tabs.indexOf(tb) < 0) tabs.push(tb);
      sig.push({ tr: tr, t0: td.getAttribute('data-l'), side: tabs.indexOf(tb) });
    });
    var all = Object.keys(F.q).sort(function (a, b) { return F.q[b][2] - F.q[a][2]; });
    var rank = [all, all.slice().reverse()], used = [{}, {}], k = [0, 0], prev = [{}, {}];
    sig.forEach(function (r) {
      if (prev[r.side][r.t0]) { r.tpre = prev[r.side][r.t0]; return; }           // a ticker listed twice stays listed twice
      while (used[r.side][rank[r.side][k[r.side]]]) k[r.side]++;
      r.tpre = rank[r.side][k[r.side]]; used[r.side][r.tpre] = 1; prev[r.side][r.t0] = r.tpre;
    });
  }
  function sigShow(pre) {
    sig.forEach(function (r) {
      var t = pre ? r.tpre : r.t0, a = r.tr.querySelector('a'); if (r.tr.getAttribute('data-now') === t) return;
      a.textContent = t; a.setAttribute('href', 'quote.ashx?t=' + t);
      r.tr.querySelector('[data-l]').setAttribute('data-l', t); r.tr.querySelector('[data-c]').setAttribute('data-c', t); r.tr.querySelector('[data-v]').setAttribute('data-v', t);
      r.tr.setAttribute('data-now', t);
    });
  }
  function tables(S) {
    if (!sig) sigSetup();
    sigShow(S.ph === 'pre');
    document.querySelectorAll('[data-l]').forEach(function (el) { var r = q(el.getAttribute('data-l'), S); if (r) el.textContent = r.last.toFixed(2); });
    document.querySelectorAll('[data-c]').forEach(function (el) { var r = q(el.getAttribute('data-c'), S); if (r) colorSpan(el, r.pct, (el.getAttribute('data-sign') ? MK.sgn(r.pct) : r.pct.toFixed(2)) + '%'); });
    document.querySelectorAll('[data-v]').forEach(function (el) {
      var t = el.getAttribute('data-v'), d = F.q[t]; if (!d) return;
      var k = S.ph === 'pre' ? 0.62 : S.ph === 'post' ? 1 : Math.pow(S.sm / 390, 0.75); el.textContent = Math.round(d[4] * k);
    });
  }
  function futures(S) {
    F.fut.forEach(function (f) {
      var tr = $('fvf-' + f[0]); if (!tr) return;
      var src = L[f[1]], v, prev = f[3];
      if (f[2] === 'day') v = MK.at(src, S.M) * f[4];
      else if (f[2] === 'sess') v = S.ph === 'pre' ? f[5] : MK.at(src, S.sm) * f[4];
      else if (f[2] === 'g') v = prev * (1 + f[4] * Math.max(0, MK.at(L.G, S.M)));
      var ch = v - prev, td = tr.getElementsByTagName('td');
      colorSpan(td[1], ch, v.toFixed(f[6])); colorSpan(td[2], ch, (ch >= 0 ? '+' : '') + ch.toFixed(f[7])); colorSpan(td[3], ch, MK.sgn(ch / prev * 100) + '%');
    });
  }
  function news(S) {
    var first = document.querySelector('tr.nn-home-first'); if (!first) return;
    var tb = first.parentNode, now = 1440 + S.M;
    var items = F.news.filter(function (n) { return n[0] <= now; }).slice(-5).reverse();
    tb.querySelectorAll('tr.nn-home, tr.nn-home-first, tr.nn-h').forEach(function (r) { r.parentNode.removeChild(r); });
    items.forEach(function (n, i) {
      var c = i ? 'nn-home' : 'nn-home-first', tr = document.createElement('tr'); tr.className = c;
      tr.setAttribute('onmouseover', "this.className='nn-h';"); tr.setAttribute('onmouseout', "this.className='" + c + "';");
      var tm = n[0] >= 1440 ? MK.hm(n[0] - 1440, 'AM').toUpperCase() : 'Nov-04';
      tr.innerHTML = '<td width="25"><img src="' + F.newsIcon + '" width="16" height="16" alt="" border="0"></td><td width="55" class="nn-date" align="center">' + tm + '</td><td><a href="#" class="nn-tab-link">' + n[2] + '</a></td>';
      tb.appendChild(tr);
    });
  }
  function screener(S) {
    Object.keys(F.ta).forEach(function (t) {
      var im = $('fvta-' + t); if (!im) return;
      var sp = F.ta[t];
      if (S.ph === 'pre') { MK.fvta(im, sp, null, sp.prev3); dateTag(im, '04 Nov 09'); return; }
      var d = F.q[t], o = d[0] * (1 + d[1] * L.U[0]), hi = o, lo = o, n = Math.floor(S.sm);
      for (var m = 0; m <= n; m += 2) { var r = MK.quote(t, d[0], d[1], d[2], d[3], MK.state(MK.OPEN + m)).last; if (r > hi) hi = r; if (r < lo) lo = r; }
      var c = q(t, S).last; hi = Math.max(hi, c); lo = Math.min(lo, c);
      MK.fvta(im, sp, { o: o, h: hi, l: lo, c: c, v: sp.vday * (S.ph === 'post' ? 1 : Math.pow(S.sm / 390, 0.75)) }, sp.prev);
      dateTag(im, '05 Nov 09');
    });
  }
  function dateTag(im, s) { var c = im.__cv.getContext('2d'); c.font = 'bold 10px Arial, "Liberation Sans", sans-serif'; c.fillStyle = '#828282'; c.textBaseline = 'top'; c.fillText(s, 80, 4); }
  function maps() {
    if (small) MK.fvmap(small, 0.5, F.tiles, F.inds, F.secs, perf);
    if (big) MK.fvmap(big, 1, F.tiles, F.inds, F.secs, perf);
  }
  var lastMap = -1;
  function update() {
    var S = MK.state();
    clock(S); indexes(S); statsBars(S); tables(S); futures(S); news(S); screener(S);
    var mk = Math.floor(S.M);                              // the 2009 maps refreshed every few minutes, not every tick
    if (mk !== lastMap && (lastMap < 0 || mk % 3 === 0)) { maps(); lastMap = mk; }
  }
  update(); setInterval(update, 5000);
})();
