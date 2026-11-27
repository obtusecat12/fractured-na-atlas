// yf_live.js - live layer of the Yahoo! Finance front page (needs LIVE, YF and live.js)
(function () {
  'use strict';
  var Y = window.YF, L = MK.L, $ = function (id) { return document.getElementById(id); };
  var WD = 'Thursday, November 5, 2009';
  function cls(el, v) { if (!el) return; el.className = el.className.replace(/\bticker_(up|down)\b/g, '').replace(/\s+$/, '') + (v > 0 ? ' ticker_up' : v < 0 ? ' ticker_down' : ''); }
  function row(k, last, chg, pct, d) {
    var l = $('yq-' + k + '-l'), c = $('yq-' + k + '-c'), p = $('yq-' + k + '-p');
    if (l) l.textContent = MK.num(last, d == null ? 2 : d);
    if (c) { c.textContent = MK.sgn(chg, d == null ? 2 : d); cls($('yq-' + k + '-ct'), chg); }
    if (p && pct != null) { p.textContent = MK.sgn(pct) + '%'; cls($('yq-' + k + '-pt'), pct); }
  }
  function img(id, which) { var im = $(id); if (!im) return null; if (im.getAttribute('data-src') !== which) { im.src = Y.img[which]; im.setAttribute('data-src', which); } return im; }
  function clearCv(im) { if (im && im.__cv) im.__cv.getContext('2d').clearRect(0, 0, im.__cv.width, im.__cv.height); }
  function pick(list, M) { var r = list[0]; list.forEach(function (x) { if (M >= x[0]) r = x; }); return r; }
  function update() {
    var S = MK.state(), M = S.M, sm = S.sm;
    // header time
    var tail;
    if (S.ph === 'pre') { var left = Math.ceil(MK.OPEN - M); tail = 'U.S. Markets open in ' + Math.floor(left / 60) + ' hrs and ' + Math.floor(left % 60) + ' mins.'; }
    else if (S.ph === 'open') { var lf = Math.ceil(MK.CLOSE - M); tail = S.halted ? 'U.S. Markets halted until 8:41AM PT.' : 'U.S. Markets close in ' + Math.floor(lf / 60) + ' hrs and ' + Math.floor(lf % 60) + ' mins.'; }
    else tail = 'U.S. Markets Closed.';
    $('yfs_market_time').textContent = WD + ', ' + MK.hm(M, 'AM') + ' PT - ' + tail;
    // US
    var I = L.IDX;
    if (S.ph === 'pre') {
      row('W5000', I.W5000[0], I.W5000[2], I.W5000[2] / (I.W5000[0] - I.W5000[2]) * 100);
      row('PSE', I.PSE[0], I.PSE[2], I.PSE[2] / (I.PSE[0] - I.PSE[2]) * 100);
      row('TNX', 11.204, 0.051, null, 4);
      var im = img('ych-us', 'us_pre'); clearCv(im);
    } else {
      var w = MK.at(L.W5000, sm); row('W5000', w, w - I.W5000[0], (w / I.W5000[0] - 1) * 100);
      var ps = MK.at(L.PSE, sm); row('PSE', ps, ps - I.PSE[0], (ps / I.PSE[0] - 1) * 100);
      var t = MK.at(L.TNX, sm); row('TNX', t, t - 11.204, null, 4);
      var im2 = img('ych-us', 'us_day'); Y.spec.us.stamp = 'Nov  5, ' + MK.hm(MK.OPEN + sm);
      MK.ichart(im2, Y.spec.us, L.W5000, sm);
    }
    var o = MK.at(L.OIL, M), g = MK.at(L.GOLD, M);
    row('OIL', o, o - 158.55, (o / 158.55 - 1) * 100); row('GOLD', g, g - 2725.2, (g / 2725.2 - 1) * 100);
    // Europe 0:00-8:30am PT
    var eu = Math.min(510, M);
    [['FTSE', L.FTSE, 3085.51], ['DAX', L.DAX, 3219.85], ['CAC', L.CAC, 2140.99]].forEach(function (e) { var v = MK.at(e[1], eu); row(e[0], v, v - e[2], (v / e[2] - 1) * 100); });
    var ie = img('ych-eu', 'eu'); Y.spec.eu.stamp = 'Nov  5, ' + MK.hm(480 + eu); MK.ichart(ie, Y.spec.eu, L.FTSE, eu);
    // Asia: Thursday's sessions until 4pm PT, then Friday's (Tokyo 4pm-10pm PT, Hong Kong 5:30pm-midnight PT)
    if (M < 960) { row('N225', 5733.61, -412.39, -6.71); var ia = img('ych-asia', 'asia5'); clearCv(ia); }
    else {
      var nm = Math.min(360, M - 960), n = MK.at(L.N225, nm); row('N225', n, n - 5733.61, (n / 5733.61 - 1) * 100);
      var ia2 = img('ych-asia', 'asia6'); Y.spec.asia.stamp = 'Nov  6, ' + MK.hm(540 + nm); MK.ichart(ia2, Y.spec.asia, L.N225, nm);
    }
    if (M < 1050) row('HSI', 9512.06, -588.27, -5.82);
    else { var h = MK.at(L.HSI, Math.min(390, M - 1050)); row('HSI', h, h - 9512.06, (h / 9512.06 - 1) * 100); }
    // market movers
    Y.movers.forEach(function (m) { var q = MK.quote(m[0], m[1], m[2], m[3], m[4], S); row('mv-' + m[0], q.last, q.chg, q.pct); });
    // stories
    var ld = pick(Y.leads, M); $('yts-lead').textContent = ld[1]; $('yts-p').textContent = ld[2];
    var br = pick(Y.brief, M); $('yup-t').textContent = 'Thu ' + (br[1] || MK.hm(Math.max(MK.OPEN, Math.min(M, MK.CLOSE)) - 5)) + ' PT'; $('yup-p').textContent = ' ' + br[2];
    var now = 1440 + M, items = Y.news.filter(function (n) { return n[0] <= now && n[2] !== ld[1]; }).slice(-9).reverse();
    $('yts-list').innerHTML = items.map(function (n) { return '<li>\n<a href="#" >' + n[2] + '</a><cite>- ' + n[1] + '</cite>\n</li>'; }).join('\n');
  }
  update(); setInterval(update, 5000);
})();
