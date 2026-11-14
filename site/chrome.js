// chrome.js — floating Google Chrome 10 window (Windows 7 Aero, 2011) shown when the atlas opens
(function () {
  var FAV = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADCklEQVR4nCXSy2ucVRjA4d97zvdNJpPJbTJJE9rYaCINShZtRCFIA1bbLryBUlyoLQjqVl12W7UbN4qb1gtuYhFRRBCDBITaesFbbI3RFBLSptEY05l0ZjLfnMvrov/Bs3gAcF71x6VVHTk+o8nDH+hrH89rUK9Z9Yaen57S3wVtGaMBNGC0IegWKIDxTtVaOHVugZVmH3HX3Zz+4l+W1xvkOjuZfPsspY4CNkZELEgEIJKwYlBjEwjec/mfCMVuorVs76R8+P0KYMmP30U2dT8eIZqAR2ipRcWjEYxGSCRhV08e04oYMoxYLi97EI9YCJ0FHBYbIVGDlUBLwRlLIuYW6chEmQt/rJO09RJjhjEJEYvJYGNhkbUhw43OXtIWDFRq9G87nAaSK6sVRm8r8fzRMWbOX2Xx7ypd7ZET03sQhDOz73DqSJOrd+7HSo4QIu0Nx/4rOzx+cRXZ9+z7+uqJ+3hiepxK3fHZT2tMjXYzOtzL6dmznPzhLexgN0QlxAAYxAlqUqRmkf5j59RlNQ6MFHhgcpCTTx8EUb5e+plD7x4jjg1ANCAgrRQAdR7xKXjBlGyLYi7PxaUmb8z8xcpGHVXLHaXdjI0egKyJiQYTEhSPREVIEUBNC+Mqm+xpz3j0njLPHB2nsh1QgeG+IS48dYbD5YNoo0ZUAbVEuTUoKuBSZOarX/WhyQn6eg2+usDWf0s0tq8zNPYk+WI/Lnge++hlvlyfQ3NdECzGRWKwEEA0qNY251n69kV6+Y0kbaCZoebG2X3oU7pKoyxuXOPe945zs9DCeosGIXoBDyaLdf6ce4Hbk+/Y299ksKtAuaeNsiyw8c1LKIZ95b0MdgxA5giixACpTxEPSau6QdFfI5/2cLPmEW+JAQrtJUJzDXF1dkwHzVodJMX4HFEcQQMaFdPeM0Jb/4PUtzzaLKAhRyJFwo6lbegRNFfk819muV5dR4JBQoQdQ2xFiDmSNDHiaptamR9Gq5cQ18AledrGDpOfeI5Lq8u88smbhMRisoSAgAYghdfn5H/JkHuRB5lxEwAAAABJRU5ErkJggg==';
  var ico = {
    back: '<svg width="16" height="16"><path d="M13 8H4M8 3.5 3.5 8 8 12.5" fill="none" stroke="#3b4a5e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fwd: '<svg width="16" height="16"><path d="M3 8h9M8 3.5 12.5 8 8 12.5" fill="none" stroke="#3b4a5e" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    reload: '<svg width="16" height="16"><path d="M12.6 6.2A5 5 0 1 0 13 9.6" fill="none" stroke="#3b4a5e" stroke-width="2.2" stroke-linecap="round"/><path d="M13.6 2.3v4.6H9z" fill="#3b4a5e"/></svg>',
    star: '<svg width="16" height="16"><path d="M8 1.6l1.9 4.1 4.5.5-3.3 3.1.9 4.4L8 11.5l-4 2.2.9-4.4L1.6 6.2l4.5-.5z" fill="#fff" stroke="#8a96a6"/></svg>',
    wrench: '<svg width="18" height="18"><path d="M12.6 2.2a3.6 3.6 0 0 0-4.4 4.6L2.6 12.4a1.5 1.5 0 0 0 2.1 2.1l5.6-5.6a3.6 3.6 0 0 0 4.6-4.4l-2 2-2-.4-.4-2z" fill="#6c7a8d" stroke="#3b4a5e" stroke-width=".9" stroke-linejoin="round"/></svg>',
    bm: '<svg width="18" height="18" viewBox="0 0 18 18"><defs><linearGradient id="cwbmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ececec"/><stop offset="1" stop-color="#cfcfcf"/></linearGradient></defs><path d="M1.5 4.5V15c0 .6.4 1 1 1h13c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1H8.2L6.8 3.3c-.2-.2-.4-.3-.7-.3H2.5c-.6 0-1 .4-1 1z" fill="url(#cwbmg)" stroke="#7b7f86"/><path d="M2.5 6.5h13" stroke="#fff"/><path d="M9 7.6l1.05 2.2 2.4.3-1.75 1.65.45 2.35L9 12.95 6.85 14.1l.45-2.35L5.55 10.1l2.4-.3z" fill="#9aa0a8" stroke="#6f747b" stroke-width=".6" stroke-linejoin="round"/></svg>',
    stop: '<svg width="16" height="16"><path d="M4 4l8 8M12 4 4 12" stroke="#3b4a5e" stroke-width="2.4" stroke-linecap="round"/></svg>',
    x: '<svg width="8" height="8"><path d="M1 1l6 6M7 1 1 7" stroke="#6a6a6a" stroke-width="1.6"/></svg>',
    plus: '<svg width="32" height="20" viewBox="0 0 32 20"><g transform="translate(32 0) scale(-1 1)"><defs><linearGradient id="cwng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".72"/><stop offset="1" stop-color="#fff" stop-opacity=".34"/></linearGradient></defs><path d="M1.5 18.5L5.6 2.8C5.9 1.6 6.7 1 8 1H28.5C30 1 30.7 1.8 30.3 3L26.2 17.2C25.9 18.2 25.2 18.5 24 18.5Z" fill="url(#cwng)" stroke="#44566e" stroke-opacity=".75"/><path d="M6.8 2.6C7 2.2 7.4 2 8 2H28.4" fill="none" stroke="#fff" stroke-opacity=".8"/></g><g shape-rendering="crispEdges"><rect x="15" y="5" width="4" height="10" fill="#fff"/><rect x="12" y="8" width="10" height="4" fill="#fff"/><rect x="16" y="6" width="2" height="8" fill="#5a6b82"/><rect x="13" y="9" width="8" height="2" fill="#5a6b82"/></g></svg>'
  };

  var PAGEICO = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#7a8796"/><path d="M9.5 1.5v3h3" fill="#e8edf3" stroke="#7a8796"/></svg>');
  function tabSVG(fg) {
    var id = 'cwt' + Math.random().toString(36).slice(2, 7);
    return '<svg class="sk" width="200" height="26" viewBox="0 0 200 26" preserveAspectRatio="none"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      (fg ? '<stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#f3f6fa"/><stop offset="1" stop-color="#eaf0f7"/>'
          : '<stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#dfe8f3" stop-opacity=".45"/>') +
      '</linearGradient></defs><path d="M0 26C6 26 7.5 23 8.5 19L12 4.5C12.8 1.5 14.5 .5 17.5 .5H182.5C185.5 .5 187.2 1.5 188 4.5L191.5 19C192.5 23 194 26 200 26" fill="url(#' + id + ')" stroke="#5f6f86" stroke-opacity="' + (fg ? 1 : .7) + '"/>' +
      (fg ? '<path d="M13.5 5C14 2.6 15.2 1.6 17.6 1.6H182.4C184.8 1.6 186 2.6 186.5 5" fill="none" stroke="#fff" stroke-opacity=".9"/>' : '') + '</svg>';
  }
  var ZT = 100000;
  function make(o0) {
  o0 = o0 || {}; var api;
  var w = document.createElement('div'); w.className = 'win7 cwin'; if (o0.id) w.id = o0.id; w.style.zIndex = ++ZT;
  if (o0.left != null) { w.style.left = o0.left + 'px'; w.style.marginLeft = '0'; } if (o0.top != null) w.style.top = o0.top + 'px'; if (o0.width) w.style.width = o0.width + 'px';
  w.innerHTML =
    '<div class="window glass active cwfocus">' +
      '<div class="title-bar">' +
        '<div class="tabs"><div class="newtab" title="新标签页">' + ico.plus + '</div></div>' +
        '<div class="title-bar-controls"><button aria-label="Minimize"></button><button aria-label="Maximize"></button><button aria-label="Close"></button></div>' +
      '</div>' +
      '<div class="window-body">' +
        '<div class="tb"><span class="b bk dis" title="后退">' + ico.back + '</span><span class="b fw dis" title="前进">' + ico.fwd + '</span><span class="b rl">' + ico.reload + '</span>' +
          '<div class="omni"><img src="' + FAV + '"><span class="u"><span class="h"></span><span class="r"></span></span>' + ico.star + '</div>' +
          '<span class="b bmb" title="书签">' + ico.bm + '</span><span class="b">' + ico.wrench + '</span></div>' +
        '<div class="cwbody"' + (o0.height ? ' style="height:' + o0.height + 'px"' : '') + '></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(w);
  var strip = w.querySelector('.tabs'), nt = w.querySelector('.newtab'), body = w.querySelector('.cwbody');
  var omImg = w.querySelector('.omni img'), omH = w.querySelector('.omni .h'), omR = w.querySelector('.omni .r');
  var tabs = [], cur = null;
  function layout() {
    var avail = strip.clientWidth - 60, tw = Math.max(70, Math.min(200, (avail + 12 * tabs.length) / Math.max(1, tabs.length)));
    tabs.forEach(function (t, i) { t.tab.style.width = tw + 'px'; t.tab.style.zIndex = t === cur ? 50 : 40 - i; t.tab.innerHTML = tabSVG(t === cur) + '<img src="' + t.fav + '"><span class="tt"></span><span class="tx">' + ico.x + '</span>'; t.tab.querySelector('.tt').textContent = t.title; t.tab.className = 'tab ' + (t === cur ? 'fg' : 'bg'); });
  }
  var bkB = w.querySelector('.tb .bk'), fwB = w.querySelector('.tb .fw'), rlB = w.querySelector('.tb .rl');
  function navState() {
    var t = cur; if (!t) return;
    bkB.classList.toggle('dis', !(t.hi > 0)); fwB.classList.toggle('dis', !(t.hist && t.hi < t.hist.length - 1));
  }
  function select(t) {
    cur = t; tabs.forEach(function (o) { o.page.hidden = o !== t; });
    if (!t.hist) { t.hist = [t.path]; t.hi = 0; }
    else if (!t._hnav && t.hist[t.hi] !== t.path) { t.hist.length = t.hi + 1; t.hist.push(t.path); t.hi++; }
    omImg.src = t.fav; omH.textContent = t.host; omR.textContent = t.path; layout(); navState();
  }
  function hgo(d) {
    var t = cur; if (!t || !t.go || !t.hist) return; var j = t.hi + d; if (j < 0 || j >= t.hist.length) return;
    t.hi = j; t._hnav = true; loading(t, function () { t.go(t.hist[j]); }); t._hnav = false;
  }
  var busy = false;
  function loading(t, fn) {
    // fake page load: stop icon, blank flash, then the page comes back
    if (busy) return; busy = true;
    rlB.innerHTML = ico.stop; rlB.title = '停止'; t.page.style.visibility = 'hidden';
    var f = t.tab.querySelector('img'); if (f) f.style.opacity = '.35';
    setTimeout(function () {
      t._hnav = true; try { fn && fn(); } catch (_) {} t._hnav = false;
      setTimeout(function () { t.page.style.visibility = ''; rlB.innerHTML = ico.reload; rlB.title = '重新加载'; busy = false; layout(); navState(); }, 120 + Math.random() * 220);
    }, 180 + Math.random() * 260);
  }
  bkB.addEventListener('click', function () { hgo(-1); });
  fwB.addEventListener('click', function () { hgo(1); });
  rlB.title = '重新加载';
  rlB.addEventListener('click', function () {
    var t = cur; if (!t) return;
    loading(t, function () {
      if (t.go) { t.go(t.path); return; }
      var f = t.page.querySelector('iframe'); if (f && f.srcdoc) f.srcdoc = f.srcdoc;
    });
  });
  function open(o) {
    var t = { title: o.title, fav: o.fav || PAGEICO, host: o.host, path: o.path || '/', tab: document.createElement('div'), page: document.createElement('div') };
    t.page.className = 'cwp'; if (o.html) t.page.innerHTML = o.html; if (o.node) { t.page.appendChild(o.node); if (o.node.tagName === 'IFRAME') t.page.className += ' ifr'; }
    strip.insertBefore(t.tab, nt); body.appendChild(t.page); tabs.push(t);
    t.tab.addEventListener('mousedown', function (e) { if (e.target.closest('.tx')) return; select(t); });
    t.tab.addEventListener('click', function (e) { if (e.target.closest('.tx')) close(t); });
    select(t); return t;
  }
  function close(t) {
    var i = tabs.indexOf(t); if (i < 0) return;
    tabs.splice(i, 1); t.tab.remove(); t.page.remove();
    if (!tabs.length) { w.hidden = true; return; }
    if (cur === t) select(tabs[Math.min(i, tabs.length - 1)]); else layout();
  }
  nt.onclick = function () {
    open({ title: '新标签页', host: '', path: '', fav: PAGEICO, html: '<div class="ntp"><div class="ntph">最常访问</div><div class="ntpg">' + new Array(9).join('<div class="th"></div>') + '</div></div>' });
  };
  function hide() { w.hidden = true; w.querySelector('.window').classList.remove('cwfocus', 'active'); topVisible(); }
  w.querySelector('[aria-label=Close]').onclick = hide;
  w.querySelector('[aria-label=Minimize]').onclick = hide;
  var mx = w.querySelector('[aria-label=Maximize]');
  mx.onclick = function () { w.classList.toggle('max'); mx.setAttribute('aria-label', w.classList.contains('max') ? 'Restore' : 'Maximize'); layout(); };
  var bar = w.querySelector('.title-bar'), d = null;
  bar.addEventListener('mousedown', function (e) {
    if (e.button !== 0 || e.target.closest('button,.tab,.newtab') || w.classList.contains('max')) return;
    var r = w.getBoundingClientRect(); d = { x: e.clientX - r.left, y: e.clientY - r.top }; e.preventDefault();
    document.documentElement.classList.add('cwdrag');
  });
  bar.addEventListener('dblclick', function (e) { if (!e.target.closest('button,.tab,.newtab')) mx.onclick(); });
  document.addEventListener('mousemove', function (e) {
    if (!d) return;
    w.style.marginLeft = '0'; w.style.left = Math.max(-600, Math.min(innerWidth - 120, e.clientX - d.x)) + 'px'; w.style.top = Math.max(0, Math.min(innerHeight - 40, e.clientY - d.y)) + 'px';
  });
  document.addEventListener('mouseup', function () { if (d) { d = null; document.documentElement.classList.remove('cwdrag'); } });
  function focus() {
    if (FOC === api && +w.style.zIndex === ZT) return;
    FOC = api; w.style.zIndex = ++ZT;
    document.querySelectorAll('.cwin > .window').forEach(function (x) { x.classList.remove('cwfocus', 'active'); });
    w.querySelector('.window').classList.add('cwfocus', 'active');
  }
  w.addEventListener('mousedown', focus, true);
  w.addEventListener('focusin', focus);
  var bmb = w.querySelector('.bmb'), menu = null;
  function closeMenu() { if (menu) { menu.remove(); menu = null; bmb.classList.remove('on'); document.removeEventListener('mousedown', outside, true); } }
  function outside(e) { if (menu && !menu.contains(e.target) && !bmb.contains(e.target)) closeMenu(); }
  bmb.addEventListener('mousedown', function (e) {
    e.preventDefault(); if (menu) { closeMenu(); return; }
    menu = document.createElement('div'); menu.className = 'cwbm';
    menu.innerHTML = (window.CWBOOKMARKS || []).map(function (b, i) { return b === '-' ? '<div class="sep"></div>' : '<div class="it" data-i="' + i + '"><img src="' + (b.fav || PAGEICO) + '"><span></span></div>'; }).join('');
    menu.querySelectorAll('.it').forEach(function (el) { el.querySelector('span').textContent = CWBOOKMARKS[+el.dataset.i].title; });
    var r = bmb.getBoundingClientRect(), wr = w.getBoundingClientRect(); w.appendChild(menu);
    menu.style.top = (r.bottom - wr.top + 1) + 'px'; menu.style.right = (wr.right - r.right) + 'px';
    bmb.classList.add('on'); document.addEventListener('mousedown', outside, true);
    menu.addEventListener('mouseup', function (ev) { var it = ev.target.closest('.it'); if (!it) return; it.classList.add('fl'); setTimeout(function () { closeMenu(); openSite(CWBOOKMARKS[+it.dataset.i].key); }, 110); });
  });
  function openSite(key) {
    var have = tabs.filter(function (t) { return t.key === key; })[0]; if (have) { select(have); return have; }
    var f = window.CWSITES && CWSITES[key], meta = (window.CWBOOKMARKS || []).filter(function (b) { return b.key === key; })[0] || {};
    if (!f) return;
    if (meta.w && !w.classList.contains('max') && w.offsetWidth < meta.w) { var r0 = w.getBoundingClientRect(); w.style.marginLeft = '0'; w.style.width = meta.w + 'px'; w.style.left = Math.max(4, Math.min(r0.left, innerWidth - meta.w - 4)) + 'px'; }
    if (meta.h && !w.classList.contains('max') && body.offsetHeight < meta.h) body.style.height = Math.min(meta.h, innerHeight - 110) + 'px';
    var t = f(api); if (t) t.key = key; layout(); return t;
  }
  api = { el: w, openSite: openSite, open: open, close: close, select: select, tabs: tabs, FAV: FAV, focus: focus, hide: hide, show: function () { w.hidden = false; focus(); } };
  WINS.push(api);
  // clicks inside a tab's iframe never reach this document: hook the frame directly when it is reachable
  w.addEventListener('load', function (e) {
    var f = e.target; if (!f || f.tagName !== 'IFRAME') return;
    try { f.contentWindow.addEventListener('mousedown', focus, true); f.contentWindow.addEventListener('focus', focus); } catch (er) {}
  }, true);
  return api;
  }
  var WINS = [], FOC = null;
  function topVisible() {
    var best = null; WINS.forEach(function (a) { if (!a.el.hidden && (!best || +a.el.style.zIndex > +best.el.style.zIndex)) best = a; });
    FOC = null; if (best) best.focus();
  }
  // fallback for sandboxed/opaque frames: focus moves into the iframe -> raise its window
  var lastAct = null;
  function frameCheck(force) {
    var a = document.activeElement; if (a === lastAct && force !== true) return; lastAct = a;
    if (a && a.tagName === 'IFRAME') { var c = a.closest('.cwin'); if (c && !c.hidden) WINS.forEach(function (x) { if (x.el === c) x.focus(); }); }
  }
  window.addEventListener('blur', function () { setTimeout(function () { frameCheck(true); }, 0); });
  setInterval(frameCheck, 150);
  // cascade the three windows so every title bar and a slice of each page stays visible; Google on top
  window.addEventListener('load', function () {
    var vw = innerWidth, g = document.getElementById('cw'), t = document.getElementById('cw2'), c = document.getElementById('cw3');
    function place(el, l, tp) { if (!el) return; el.style.marginLeft = '0'; el.style.left = Math.round(l) + 'px'; el.style.top = Math.round(tp) + 'px'; }
    var cwW = c ? c.offsetWidth : 0, gW = g ? g.offsetWidth : 800;
    place(t, 10, 56);
    place(c, Math.max(60, vw - cwW - 10), 92);
    place(g, Math.max(40, Math.min((vw - gW) / 2, vw - cwW - 10 + 60)), Math.max(150, Math.min(210, innerHeight - (g ? g.offsetHeight : 580) - 70)));
    [t, c].forEach(function (el) { WINS.forEach(function (a) { if (a.el === el) { FOC = null; a.focus(); } }); });
    window.CW.focus();
  });
  window.ChromeWin = make;
  window.CW = make({ id: 'cw' });
})();
