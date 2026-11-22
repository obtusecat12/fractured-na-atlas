// gamehost.js — 纳瓦霍县游戏嵌在地图集里：开机动画 → 登录 → 县地图；缩小回到全国地图，邮件在 Chrome 里开，书签照常可用
(function () {
  'use strict';
  var fr = document.getElementById('gameframe'), body = document.body;
  var NAV = { w: -111.1, e: -109.75, s: 33.75, n: 37.0 };
  function GW() { return fr.contentWindow; }
  var inGame = true, started = false;
  function hideWins() { document.querySelectorAll('.cwin').forEach(function (w) { w.hidden = true; }); }
  window.addEventListener('load', function () { setTimeout(hideWins, 0); });
  var back = document.createElement('div'); back.id = 'fnaback';
  back.innerHTML = '<span class="zh">放大纳瓦霍县回到游戏，或 </span><span class="en">Zoom into Navajo County to return, or </span><a href="#" id="fnabk">返回纳瓦霍县 Back to Navajo County</a>';
  document.body.appendChild(back);
  back.addEventListener('click', function (e) { if (e.target.id === 'fnabk') { e.preventDefault(); toGame(); } });
  var pr = null;
  function proj() { if (pr) return pr; var P = D.proj; pr = d3.geoConicEqualArea().parallels(P.parallels).rotate(P.rotate).scale(P.scale).translate(P.translate); return pr; }
  function toAtlas() {
    if (!inGame) return; inGame = false;
    try { var G = GW().GAME; G.setSpeed && G.setSpeed(0); } catch (e) {}
    body.classList.add('fna-atlas');
    var p = proj(), a = p([NAV.w, NAV.n]), b = p([NAV.e, NAV.s]), cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, hw = (b[0] - a[0]) * .6, hh = (b[1] - a[1]) * .6;
    try { if (typeof onResize === 'function') onResize(); fitView(cx - hw, cy - hh, cx + hw, cy + hh, 0); } catch (e) {}
    fr.classList.add('out');
    setTimeout(function () { fr.style.visibility = 'hidden'; var wide = 7; try { fitView(cx - hw * wide, cy - hh * wide * .55, cx + hw * wide, cy + hh * wide * .55, 900); } catch (e) {} }, 380);
  }
  function toGame() {
    if (inGame) return; inGame = true; body.classList.remove('fna-atlas');
    fr.style.visibility = ''; fr.classList.remove('out'); try { fr.focus(); GW().GAME && GW().GAME.fromAtlas && GW().GAME.fromAtlas(); } catch (e) {}
  }
  // 在全国地图上放大到纳瓦霍县：进入游戏
  setInterval(function () {
    if (inGame || !started || !S || !S.t || S.gesture) return;
    var p = proj(), l = p.invert(S.t.invert([0, S.h / 2])), r = p.invert(S.t.invert([S.w, S.h / 2])), c = p.invert(S.t.invert([S.w / 2, S.h / 2]));
    if (!l || !r || !c) return;
    if (r[0] - l[0] < 2.6 && c[0] > NAV.w && c[0] < NAV.e && c[1] > NAV.s && c[1] < NAV.n) toGame();
  }, 250);
  // Gmail 作为 Chrome 标签页
  var GM_FAV = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#b3b3b3"/><path d="M1.5 3.5 8 9l6.5-5.5" fill="none" stroke="#d93025" stroke-width="1.6"/></svg>');
  window.CWSITES = window.CWSITES || {};
  CWSITES.gmail = function (W) {
    var ifr = document.createElement('iframe'); ifr.setAttribute('title', 'Gmail');
    var t = W.open({ title: 'Gmail - 收件箱 - oem@co.navajo.az.us', host: 'mail.google.com', path: '/mail/?shva=1#inbox', fav: GM_FAV, node: ifr });
    t.key = 'gmail';
    t.retitle = function () { var s = t.tab.querySelector('.tt'); if (s) s.textContent = t.title; };
    t.setPath = function (p) { t.path = p; var r = W.el.querySelector('.omni .r'); if (r && !t.page.hidden) r.textContent = p; };
    ifr.src = 'game/gmailtab.html'; return t;
  };
  function openMail() {
    var W = window.CW; if (!W) return;
    var have = W.tabs.some(function (t) { return t.key === 'gmail'; });
    if (W.el.hidden) { W.el.hidden = false; }
    if (!have && !W.el.classList.contains('max')) { W.el.style.marginLeft = '0'; W.el.style.width = Math.min(1040, innerWidth - 60) + 'px'; W.el.style.left = Math.max(20, (innerWidth - Math.min(1040, innerWidth - 60)) / 2) + 'px'; W.el.style.top = '70px'; }
    W.focus(); W.openSite('gmail');
    var b = W.el.querySelector('.cwbody'); if (b && b.offsetHeight < 520) b.style.height = Math.min(600, innerHeight - 150) + 'px';
  }
  window.FNA = { toAtlas: toAtlas, toGame: toGame, openMail: openMail,
    started: function () { started = true; body.classList.remove('fna-logon'); },
    inGame: function () { return inGame; } };
})();
