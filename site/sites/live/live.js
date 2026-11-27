// live.js - Thursday, November 5, 2009 replayed every day on the visitor's Pacific-time clock.
// The same file is embedded in the Yahoo! Finance and FINVIZ pages; LIVE (paths) and the page data are set before it.
// Pre-open (before 6:30am PT) pages show Wednesday's close, the Pacific Exchange trades 6:30am-1:00pm with the 7:41 halt,
// London/Frankfurt/Paris trade 0:00-8:30am PT, Tokyo and Hong Kong open Friday's session in the evening.
var MK = (function () {
  'use strict';
  var L = window.LIVE, OPEN = 390, CLOSE = 780, fmtPT = null;
  try { fmtPT = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch (e) {}
  function override() {
    var re = /pt=(\d{1,2})(?::|%3A)?(\d{2})/i, m = re.exec(location.hash || '') || re.exec(location.search || '') || re.exec(window.PT_OVERRIDE || '');
    try { if (!m && window.parent && window.parent !== window && parent.PT_OVERRIDE) m = /(\d{1,2}):(\d{2})/.exec(parent.PT_OVERRIDE); } catch (e) {}
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  var t0 = Date.now(), ov = override();
  function minute() {                                   // minutes since midnight Pacific time, fractional
    if (ov !== null) return (ov + (Date.now() - t0) / 60000) % 1440;
    var d = new Date();
    if (fmtPT) { var p = {}; fmtPT.formatToParts(d).forEach(function (x) { p[x.type] = x.value; }); return ((+p.hour % 24) * 60 + (+p.minute) + (+p.second) / 60); }
    var u = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60; return (u - 480 + 1440) % 1440;
  }
  function at(a, x) { if (x <= 0) return a[0]; if (x >= a.length - 1) return a[a.length - 1]; var i = Math.floor(x), f = x - i; return a[i] + (a[i + 1] - a[i]) * f; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function state(M) {
    M = M == null ? minute() : M;
    var ph = M < OPEN ? 'pre' : M < CLOSE ? 'open' : 'post', sm = Math.max(0, Math.min(390, M - OPEN));
    var halted = ph === 'open' && sm >= L.HALT[0] && sm < L.HALT[1];
    return { M: M, ph: ph, sm: sm, halted: halted, u: ph === 'pre' ? 0 : at(L.U, sm), g: at(L.G, M) };
  }
  // idiosyncratic wiggle that is zero at the open and at the close, so closing prices match the static pages
  function wiggle(key, sm, P) {
    var a = hash(key) * 6.283, b = hash(key + 'b') * 6.283, amp = 0.06 * Math.abs(P) + 0.004;
    if (sm >= L.HALT[0] && sm < L.HALT[1]) sm = L.HALT[0];
    return amp * Math.sin(Math.PI * sm / 390) * (0.6 * Math.sin(sm / 17 + a) + 0.4 * Math.sin(sm / 41 + b));
  }
  // q: prev = Wednesday close, P = Thursday change (fraction), p4 = Wednesday change (fraction), kind 'm' for metals/miners
  function quote(key, prev, P, p4, kind, S) {
    S = S || state();
    if (S.ph === 'pre') { var last = prev; return { last: last, chg: last - last / (1 + p4), pct: p4 * 100, pre: true }; }
    if (S.ph === 'post') { var lc = prev * (1 + P); return { last: lc, chg: lc - prev, pct: P * 100 }; }
    var prog = kind === 'm' ? Math.min(1, S.g) : S.u;
    var f = P * prog + wiggle(key, S.sm, P);
    var l2 = prev * (1 + f); return { last: l2, chg: l2 - prev, pct: f * 100 };
  }
  function pathTo(arr, upto) { var n = Math.max(0, Math.min(arr.length - 1, upto)); var out = arr.slice(0, Math.floor(n) + 1); if (n % 1) out.push(at(arr, n)); return out; }
  function hm(M, ampm) {
    M = Math.floor(M) % 1440; var h = Math.floor(M / 60), m = M % 60, ap = h < 12 ? 'am' : 'pm', h12 = h % 12 || 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + (ampm === 'AM' ? ap.toUpperCase() : ap);
  }
  function num(v, d) { var s = v.toFixed(d == null ? 2 : d), p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function sgn(v, d) { return (v >= 0 ? '+' : '') + num(v, d); }
  // ---- canvas helpers ----
  function overlay(img) {
    if (img.__cv) return img.__cv;
    var w = img.getAttribute('width') || img.width, h = img.getAttribute('height') || img.height;
    var wrap = document.createElement('span'); wrap.style.cssText = 'position:relative;display:inline-block;line-height:0;vertical-align:top';
    img.parentNode.insertBefore(wrap, img); wrap.appendChild(img);
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
    var b = parseInt(img.getAttribute('border') || '0', 10); if (b) { cv.style.left = b + 'px'; cv.style.top = b + 'px'; }
    wrap.appendChild(cv); img.__cv = cv; return cv;
  }
  function px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  return { L: L, minute: minute, state: state, quote: quote, at: at, pathTo: pathTo, hm: hm, num: num, sgn: sgn, hash: hash, overlay: overlay, px: px, OPEN: OPEN, CLOSE: CLOSE };
})();

// Yahoo! Finance ichart (239x110) live layer: fill, previous close, price line, watermark, timestamp
MK.ichart = function (img, spec, vals, upto) {
  var cv = MK.overlay(img), c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  var X0 = 55, X1 = 208, Y0 = 9, Y1 = 95, FILL = '#e2e9f5', LINE = '#43538d', mins = spec.minutes;
  function Y(v) { return Y0 + (spec.ytop - v) * (Y1 - Y0) / (spec.ytop - spec.ybot); }
  function X(m) { return X0 + 1 + m * (X1 - X0 - 2) / mins; }
  var pts = MK.pathTo(vals, upto);
  if (pts.length > 1) {
    c.fillStyle = FILL; c.beginPath(); c.moveTo(Math.round(X(0)), Y1 - 1);
    pts.forEach(function (v, i) { c.lineTo(Math.round(X(i === pts.length - 1 ? Math.min(upto, i) : i)), Math.round(Y(v))); });
    c.lineTo(Math.round(X(Math.min(upto, pts.length - 1))), Y1 - 1); c.closePath(); c.fill();
  }
  var yp = Math.round(Y(spec.prev));
  if (yp > Y0 && yp < Y1) for (var x = X0 + 2; x < X1 - 1; x++) if ((x - 62) % 7 < 3) MK.px(c, x, yp, '#ff0000');
  if (pts.length > 1) {
    c.strokeStyle = LINE; c.lineWidth = 1; c.beginPath();
    pts.forEach(function (v, i) { var xx = Math.round(X(i === pts.length - 1 ? Math.min(upto, i) : i)) + .5, yy = Math.round(Y(v)) + .5; if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); });
    c.stroke();
  }
  (spec.wm || []).forEach(function (w) { MK.px(c, w[0], w[1], 'rgb(' + w[2].join(',') + ')'); });
  c.fillStyle = '#6e6e6e'; c.font = '9px Verdana, "DejaVu Sans", Geneva, sans-serif'; c.textBaseline = 'top'; c.fillText(spec.stamp, 56, 0);
};

// FINVIZ intraday index chart (330x160) live layer: 5-minute candles, halt band, last value
MK.fvidx = function (img, spec, vals, upto, title, stamp, haltOn) {
  var cv = MK.overlay(img), c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  var pw = (spec.X1 - spec.X0) / spec.n;
  function Y(v) { return spec.Y0 + (spec.top - v) / (spec.top - spec.bot) * (spec.Y1 - spec.Y0); }
  if (haltOn) {
    var a = MK.L.HALT[0] / 5, b = Math.min(upto, MK.L.HALT[1]) / 5;
    c.fillStyle = '#f6f6f6'; c.fillRect(Math.floor(spec.X0 + a * pw), spec.Y0 + 1, Math.floor(spec.X0 + b * pw) - Math.floor(spec.X0 + a * pw) + 1, spec.Y1 - spec.Y0 - 1);
    c.fillStyle = '#bebebe'; c.font = 'bold 9px Arial, "Liberation Sans", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText('HALT', spec.X0 + (a + MK.L.HALT[1] / 5) / 2 * pw, spec.Y0 + 9); c.textAlign = 'left';
  }
  for (var k = 0; k * 5 < upto && k < spec.n; k++) {
    var seg = MK.pathTo(vals, Math.min(upto, k * 5 + 5)).slice(k * 5);
    if (!seg.length) break;
    var o = seg[0], cl = seg[seg.length - 1], h = Math.max.apply(null, seg), l = Math.min.apply(null, seg);
    var x = Math.round(spec.X0 + k * pw), up = cl >= o;
    c.fillStyle = up ? '#007800' : '#780000'; c.fillRect(x + 1, Math.round(Y(h)), 1, Math.max(1, Math.round(Y(l)) - Math.round(Y(h)) + 1));
    var t = Math.round(Y(Math.max(o, cl))), bt = Math.round(Y(Math.min(o, cl)));
    c.fillStyle = up ? '#00b400' : '#b40000'; c.fillRect(x, t, 3, Math.max(1, bt - t + 1));
  }
  c.textBaseline = 'top'; c.textAlign = 'right';
  c.font = 'bold 11px Arial, "Liberation Sans", sans-serif'; c.fillStyle = title.neg ? '#dc2828' : '#009600'; c.fillText(title.text, 325, 4);
  c.font = '9px Arial, "Liberation Sans", sans-serif'; c.fillStyle = '#828282'; c.fillText(stamp, 325, 17); c.textAlign = 'left';
};

// FINVIZ daily TA chart (460x230) live layer: today's candle and volume, yellow price tag, change in the title
MK.fvta = function (img, spec, bar, prev) {
  var cv = MK.overlay(img), c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  function Y(p) { return spec.Y0 + (spec.top - p) / (spec.top - spec.bot) * (spec.Y1 - spec.Y0); }
  if (bar) {
    var up = bar.c >= bar.o, x = spec.x;
    var hgt = Math.min(34, Math.round(bar.v / spec.vmax * 34));
    if (hgt) { c.fillStyle = up ? '#a8e0a8' : '#ffc0c0'; c.fillRect(x, spec.Y1 - hgt, 2, hgt); }
    c.fillStyle = up ? '#007800' : '#780000'; c.fillRect(x + 1, Math.round(Y(bar.h)), 1, Math.max(1, Math.round(Y(bar.l)) - Math.round(Y(bar.h)) + 1));
    var t = Math.round(Math.min(Y(bar.o), Y(bar.c))), b = Math.round(Math.max(Y(bar.o), Y(bar.c)));
    c.fillStyle = up ? '#00b400' : '#b40000'; c.fillRect(x, t, 2, Math.max(1, b - t + 1));
  }
  var last = bar ? bar.c : spec.last4, yl = Math.round(Y(last));
  var lt = (last >= 100 && spec.step >= 1) ? last.toFixed(0) : last.toFixed(2);
  c.font = '11px Arial, "Liberation Sans", sans-serif'; var tw = c.measureText(lt).width;
  c.fillStyle = '#ffff00'; c.fillRect(434, yl - 5, Math.min(25, Math.max(24, tw + 3)), 10);
  c.fillStyle = '#000'; c.textBaseline = 'middle'; c.fillText(lt, 435, yl);
  var ch = last - prev, pc = ch / prev * 100;
  c.font = 'bold 11px Arial, "Liberation Sans", sans-serif'; c.textAlign = 'right'; c.textBaseline = 'top';
  c.fillStyle = ch < 0 ? '#dc2828' : '#009600'; c.fillText((ch >= 0 ? '+' : '') + ch.toFixed(2) + ' (' + (pc >= 0 ? '' : '-') + Math.abs(pc).toFixed(2) + '%)', 370, 3); c.textAlign = 'left';
};

// FINVIZ market stats bar (180x24)
MK.fvstat = function (cv, left, right, lv, rv) {
  var c = cv.getContext('2d'), W = cv.width; c.clearRect(0, 0, W, 24);
  var tot = lv + rv || 1, fl = lv / tot;
  c.textBaseline = 'top'; c.font = 'bold 10px Arial, "Liberation Sans", sans-serif';
  c.fillStyle = '#007800'; c.textAlign = 'left'; c.fillText(left, 1, 1);
  c.fillStyle = '#b40000'; c.textAlign = 'right'; c.fillText(right, W - 2, 1);
  c.font = '9px Arial, "Liberation Sans", sans-serif'; c.fillStyle = '#5a5a5a';
  c.textAlign = 'left'; c.fillText((fl * 100).toFixed(1) + '% (' + lv + ')', 1, 12);
  c.textAlign = 'right'; c.fillText('(' + rv + ') ' + ((1 - fl) * 100).toFixed(1) + '%', W - 2, 12); c.textAlign = 'left';
  var xm = Math.round(1 + fl * (W - 3));
  for (var y = 20; y < 24; y++) { var k = 1 - .25 * (y - 20) / 4;
    c.fillStyle = 'rgb(' + [60 * k, 190 * k, 60 * k].map(Math.round) + ')'; if (xm > 1) c.fillRect(1, y, xm, 1);
    c.fillStyle = 'rgb(' + [220 * k, 50 * k, 50 * k].map(Math.round) + ')'; c.fillRect(xm + 1, y, W - 3 - xm, 1); }
};

// FINVIZ S&P 500 map; tiles: [ticker, x1, y1, x2, y2], perf(ticker) -> % or null (halted)
MK.fvmap = function (cv, k, tiles, inds, secs, perf) {
  var c = cv.getContext('2d'), S = function (v) { return Math.round(v * k); };
  var SC = [[-3, [206, 8, 24]], [-1.5, [98, 5, 15]], [0, [18, 20, 18]], [1.5, [6, 49, 16]], [3, [28, 172, 37]]];
  function col(p) {
    if (p == null) return [58, 58, 62];
    if (p <= SC[0][0]) return SC[0][1]; if (p >= SC[4][0]) return SC[4][1];
    for (var i = 0; i < 4; i++) if (p >= SC[i][0] && p <= SC[i + 1][0]) { var t = (p - SC[i][0]) / (SC[i + 1][0] - SC[i][0]); return SC[i][1].map(function (a, j) { return Math.round(a + (SC[i + 1][1][j] - a) * t); }); }
  }
  c.fillStyle = '#fff'; c.fillRect(0, 0, cv.width, cv.height);
  var FONT = 'Arial, "Liberation Sans", Helvetica, sans-serif';
  tiles.forEach(function (t) {
    var p = perf(t[0]), a1 = S(t[1]), b1 = S(t[2]), a2 = S(t[3]), b2 = S(t[4]), w = a2 - a1 - 1, h = b2 - b1 - 1;
    c.fillStyle = p == null ? '#1e1e20' : '#282828'; c.fillRect(a1, b1, a2 - a1, b2 - b1);
    if (w < 1 || h < 1) return;
    var base = col(p), hl = p == null ? [.22, .18] : [.35, .27], g = c.createLinearGradient(0, b1 + 1, 0, b2);
    function mix(top, bot) { return 'rgb(' + base.map(function (v) { return Math.round(v * (1 - top - bot) + 255 * top + 225 * bot); }) + ')'; }
    g.addColorStop(0, mix(hl[0], 0)); g.addColorStop(0.5, mix(0, 0)); g.addColorStop(1, mix(0, hl[1]));
    c.fillStyle = g; c.fillRect(a1 + 1, b1 + 1, w, h);
  });
  function bar(list, c1, c2, tc, bold, size, pad) {
    list.forEach(function (s) {
      var a1 = S(s[1]), b1 = S(s[2]), a2 = S(s[3]), b2 = S(s[4]); if (a2 - a1 < 3) return;
      var g = c.createLinearGradient(0, b1, 0, b2); g.addColorStop(0, c1); g.addColorStop(1, c2); c.fillStyle = g; c.fillRect(a1, b1, a2 - a1, b2 - b1);
      if (a2 - a1 < 14) return;
      c.save(); c.beginPath(); c.rect(a1, b1, a2 - a1 - pad, b2 - b1); c.clip();
      c.fillStyle = tc; c.font = (bold ? 'bold ' : '') + size + 'px ' + FONT; c.textBaseline = 'middle'; c.fillText(s[0], a1 + pad, (b1 + b2) / 2 + .5); c.restore();
    });
  }
  bar(inds, '#fff533', '#ccc908', '#282800', false, Math.max(7, S(9)), 2);
  bar(secs, '#d9f1ff', '#8bb1dc', '#142850', true, Math.max(8, S(11)), 3);
  c.textAlign = 'center';
  tiles.forEach(function (t) {
    var p = perf(t[0]), a1 = S(t[1]), b1 = S(t[2]), a2 = S(t[3]), b2 = S(t[4]), w = a2 - a1, h = b2 - b1;
    if (w < 9 || h < 6) return;
    var two = p != null && h > 22, size = 0;
    for (var z = 34; z >= 6; z -= (z > 14 ? 2 : 1)) {
      c.font = 'bold ' + z + 'px ' + FONT;
      if (c.measureText(t[0]).width <= w - 3 && z * (two ? 2.1 : 1.0) <= h - 1) { size = z; break; }
    }
    if (!size) return;
    var cx = (a1 + a2) / 2, cy = (b1 + b2) / 2, txt = p == null ? '#96969b' : '#fff';
    function put(s, y, f, base) { c.font = f; c.textBaseline = base; c.fillStyle = p == null ? '#141414' : '#000'; c.fillText(s, cx + 1, y + 1); c.fillStyle = txt; c.fillText(s, cx, y); }
    if (two && size >= 9) {
      put(t[0], cy - 1, 'bold ' + size + 'px ' + FONT, 'bottom');
      put((p >= 0 ? '+' : '') + p.toFixed(2) + '%', cy + 2, 'bold ' + Math.max(7, Math.round(size * .55)) + 'px ' + FONT, 'top');
    } else put(t[0], cy + .5, 'bold ' + size + 'px ' + FONT, 'middle');
  });
  c.textAlign = 'left';
};
