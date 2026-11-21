// logon.js — Windows 7 欢迎屏幕作为开局菜单。纳瓦霍县可进入；奈县账户已停用（后续版本）。
(function () {
  'use strict';
  var Z = function (zh, en) { return '<span class="zh">' + zh + '</span><span class="bi"> </span><span class="en">' + en + '</span>'; };
  var USERS = [
    { id: 'navajo', zh: '纳瓦霍县', en: 'Navajo County', pic: 'logon/usertile34.png', ok: true },
    { id: 'nye', zh: '奈县', en: 'Nye County', pic: 'logon/usertile15.png', ok: false }
  ];
  var el = document.createElement('div');
  el.id = 'logon';
  el.innerHTML =
    '<div id="lu-list">' + USERS.map(function (u) {
      return '<div class="lu-t" tabindex="0" data-u="' + u.id + '"><div class="fr"><i style="background-image:url(' + u.pic + ')"></i><b></b></div><div class="nm txt">' + Z(u.zh, u.en) + '</div></div>';
    }).join('') + '</div>' +
    '<div id="lu-one" hidden><div class="fr"><i></i><b></b></div><div class="nm txt"></div><div class="msg txt"></div><div class="lu-row"></div></div>' +
    '<div id="lu-wel" class="txt" hidden><span class="spin"></span><span>' + Z('欢迎', 'Welcome') + '</span></div>' +
    '<a id="lu-ease" title="轻松访问 Ease of Access"></a>' +
    '<div id="lu-logo"><img src="logon/logo.png" alt="Windows 7"><span class="txt">' + Z('旗舰版', 'Ultimate') + '</span></div>' +
    '<a id="lu-off" title="关机 Shut down"></a><div class="shade"></div>';
  document.body.appendChild(el);
  var $ = function (s) { return el.querySelector(s); };
  function show(id) { ['#lu-list', '#lu-one', '#lu-wel'].forEach(function (s) { $(s).hidden = s !== id; }); }
  var spinT = null, f = 0;
  function spin(on) {
    clearInterval(spinT);
    if (on) spinT = setInterval(function () { f = (f + 1) % 18; $('#lu-wel .spin').style.backgroundImage = 'url(../cursors/busy_' + (f < 10 ? '0' : '') + f + '.png)'; }, 50);
  }
  function pick(id) {
    var u = USERS.filter(function (x) { return x.id === id; })[0];
    if (u.ok) {
      show('#lu-wel'); spin(true);
      setTimeout(function () { el.classList.add('out'); }, 2200);
      setTimeout(function () { spin(false); el.hidden = true; if (window.GAME_START) window.GAME_START(u.id); }, 2900);
      return;
    }
    $('#lu-one .fr i').style.backgroundImage = 'url(' + u.pic + ')';
    $('#lu-one .nm').innerHTML = Z(u.zh, u.en);
    $('#lu-one .msg').innerHTML = Z('您的帐户已被停用。请向系统管理员咨询。', 'Your account has been disabled. Please see your system administrator.');
    $('#lu-one .lu-row').innerHTML = '<button class="w7b" id="lu-ok">' + Z('确定', 'OK') + '</button>';
    show('#lu-one');
    $('#lu-ok').focus();
  }
  el.addEventListener('click', function (e) {
    var t = e.target.closest('[data-u]'); if (t) return pick(t.dataset.u);
    if (e.target.closest('#lu-ok')) return show('#lu-list');
  });
  el.addEventListener('keydown', function (e) { var t = e.target.closest('[data-u]'); if (t && e.key === 'Enter') pick(t.dataset.u); });
  document.body.classList.add('l-logon');
})();
