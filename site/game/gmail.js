// gmail.js — 公文窗口：2009 年 10 月版 Gmail（logo、星标、回形针取自 2009 年存档原图）。
(function () {
  'use strict';
  // 在 Chrome 窗口的标签页里运行（gmailtab.html），游戏状态取自同源的游戏框架
  var GW = window.GAME ? window : (function () { var f = top.document.getElementById('gameframe'); return f && f.contentWindow; })();
  var G = GW.GAME, S = G.S, DATA = GW.DATA, LANG = GW.LANG, $ = function (s) { return document.querySelector(s); };
  function L(zh, en) { return '<span class="zh">' + zh + '</span><span class="bi"> </span><span class="en">' + en + '</span>'; }
  function LA(a) { return L(a[0], a[1]); }
  function T(zh, en) { return LANG.mode() === 'en' ? en : zh; }
  var view = { box: 'inbox', open: -1, star: {} };
  var POW = DATA.powers;
  function sender(m) { return m.from === 'nb' ? m.sender : POW[m.from].via ? [POW[m.from].via[0].split(' · ')[0], POW[m.from].via[1].split(' · ')[0]] : POW[m.from].short; }
  function when(m) { var t = m.time || ''; return t.indexOf(' ') > 0 ? LA([t.slice(0, t.indexOf(' ')), t.slice(t.indexOf(' ') + 1)]) : t; }
  function unread() { return S.mail.filter(function (m) { return m.unread; }).length; }
  function list() {
    var ms = S.mail.map(function (m, i) { return [m, i]; }).filter(function (x) { return view.box === 'inbox' ? !x[0].archived : view.box === 'starred' ? view.star[x[0].id] : view.box === 'done' ? x[0].done : true; });
    return ms;
  }
  function tb(bottom) {
    return '<div class="gm-tb">' + (view.open >= 0 ? '<a href="#" data-gm="back" class="gm-back">« ' + L('返回收件箱', 'Back to Inbox') + '</a>' : '') +
      '<button class="gm-b" data-gm="arch">' + L('归档', 'Archive') + '</button><button class="gm-b">' + L('举报垃圾邮件', 'Report spam') + '</button><button class="gm-b">' + L('删除', 'Delete') + '</button>' +
      '<button class="gm-b gm-dd">' + L('移至', 'Move to') + ' ▾</button><button class="gm-b gm-dd">' + L('标签', 'Labels') + ' ▾</button><button class="gm-b gm-dd">' + L('更多操作', 'More actions') + ' ▾</button>' +
      (view.open < 0 ? '<a href="#" data-gm="refresh" class="gm-ref">' + L('刷新', 'Refresh') + '</a>' : '') +
      '<span class="gm-cnt">' + (view.open >= 0 ? L((list().map(function (x) { return x[1]; }).indexOf(view.open) + 1) + ' / ' + list().length, (list().map(function (x) { return x[1]; }).indexOf(view.open) + 1) + ' of ' + list().length) : '<b>1</b> - <b>' + list().length + '</b> ' + L('封，共 ', 'of ') + '<b>' + list().length + '</b>') + '</span></div>' +
      (view.open < 0 && !bottom ? '<div class="gm-sel">' + L('选择：', 'Select: ') + ['全部 All', '无 None', '已读 Read', '未读 Unread', '已加星标 Starred', '未加星标 Unstarred'].map(function (s) { var p = s.split(' '); return '<a href="#">' + L(p[0], p[1]) + '</a>'; }).join(', ') + '</div>' : '');
  }
  function inbox() {
    var rows = list().map(function (x) {
      var m = x[0], i = x[1], st = view.star[m.id];
      return '<tr class="gm-r' + (m.unread ? ' gm-u' : '') + '" data-gmo="' + i + '"><td class="gm-c"><input type="checkbox"></td><td class="gm-c"><img src="gmail/star_' + (st ? 'on' : 'off') + '_sm.gif" width="13" height="13" data-gms="' + m.id + '" alt=""></td>' +
        '<td class="gm-f">' + LA(sender(m)) + (m.done ? ' <span class="gm-n">(2)</span>' : '') + '</td><td class="gm-s"><span class="gm-sj">' + LA(m.subject) + '</span><span class="gm-sn"> - ' + LA(m.body) + '</span></td>' +
        '<td class="gm-a">' + (m.attach ? '<img src="gmail/paperclip.gif" width="15" height="15" alt="">' : '') + '</td><td class="gm-d">' + when(m) + '</td></tr>';
    }).join('');
    return '<div class="gm-box">' + tb() + '<table class="gm-t">' + (rows || '<tr><td class="gm-empty">' + L('没有邮件。', 'No conversations.') + '</td></tr>') + '</table>' + tb(true) + '</div>';
  }
  function message() {
    var m = S.mail[view.open], sn = sender(m), st = view.star[m.id];
    var acts = m.done ? '<div class="gm-done">' + LA(m.done) + '</div>' : (m.acts || []).map(function (a, j) { var fx = GW.CONTENT && GW.CONTENT.fx ? LA(a.fx || GW.CONTENT.fx(a.do)) : ''; return '<span class="gm-ab"><button class="gm-b gm-act" data-act="' + view.open + ':' + j + '">' + LA(a.t) + '</button><span class="gm-fx">' + fx + '</span></span>'; }).join('');
    return '<div class="gm-box">' + tb() + '<div class="gm-msg"><div class="gm-subj">' + LA(m.subject) + ' <span class="gm-lbl">' + L('收件箱', 'Inbox') + ' <a href="#">x</a></span><img class="gm-st" src="gmail/star_' + (st ? 'on' : 'off') + '.gif" data-gms="' + m.id + '" width="15" height="15" alt=""></div>' +
      '<div class="gm-hd"><div><b class="gm-who" style="color:' + (m.from === 'nb' ? '#7b2f8e' : POW[m.from].color) + '">' + LA(sn) + '</b>' + (m.ref ? ' <span class="gm-ref2">' + m.ref + '</span>' : '') + '<div class="gm-to">' + L('收件人：我', 'to me') + ' <a href="#">' + L('显示详细信息', 'show details') + '</a></div></div><div class="gm-dt">' + when(m) + '<button class="gm-b gm-rep">' + L('回复', 'Reply') + ' ▾</button></div></div>' +
      '<div class="gm-body">' + LA(m.body) + (m.from !== 'nb' && POW[m.from].via ? '<div class="gm-sig">--<br>' + LA(POW[m.from].via) + '</div>' : '') + '</div>' +
      '<div class="gm-acts">' + acts + '</div>' +
      '<div class="gm-rbox"><a href="#">' + L('回复', 'Reply') + '</a> <a href="#">' + L('转发', 'Forward') + '</a></div></div>' + tb(true) + '</div>';
  }
  function nav() {
    var n = unread(), items = [['inbox', '收件箱', 'Inbox', n ? ' (' + n + ')' : ''], ['starred', '已加星标', 'Starred', ''], ['chats', '聊天记录', 'Chats', ''], ['sent', '已发邮件', 'Sent Mail', ''], ['drafts', '草稿', 'Drafts', ''], ['all', '所有邮件', 'All Mail', ''], ['spam', '垃圾邮件', 'Spam', ''], ['trash', '已删除邮件', 'Trash', '']];
    return '<div class="gm-nav"><a href="#" class="gm-comp">' + L('写邮件', 'Compose Mail') + '</a><ul>' + items.map(function (x) {
      return '<li class="' + (view.box === x[0] && view.open < 0 ? 'on' : '') + (x[0] === 'inbox' && n ? ' b' : '') + '"><a href="#" data-gmb="' + x[0] + '">' + (x[0] === 'starred' ? '<img src="gmail/star_on_sm.gif" width="13" height="13" alt=""> ' : '') + L(x[1], x[2]) + x[3] + '</a></li>';
    }).join('') + '</ul><a href="#" class="gm-sm">' + L('联系人', 'Contacts') + '</a><a href="#" class="gm-sm">' + L('任务', 'Tasks') + '</a>' +
      '<div class="gm-lab"><div class="gm-labh">' + L('标签', 'Labels') + '</div>' + ['fed', 'navajo', 'lds'].map(function (k) { return '<div><i style="background:' + POW[k].color + '"></i>' + LA(POW[k].short) + '</div>'; }).join('') + '<div><i style="background:#7b2f8e"></i>' + L('邻县', 'Neighbours') + '</div><a href="#">' + L('编辑标签', 'Edit labels') + '</a></div></div>';
  }
  function draw() {
    var n = unread(); document.body.className = GW.document.body.className.replace(/\bcollapsed\b/, '');
    document.title = 'Gmail - ' + (view.open >= 0 ? T(S.mail[view.open].subject[0], S.mail[view.open].subject[1]) : T('收件箱', 'Inbox') + (n ? ' (' + n + ')' : '')) + ' - oem@co.navajo.az.us';
    if (window.GMAIL_TAB) { window.GMAIL_TAB.title = document.title; if (window.GMAIL_TAB.retitle) window.GMAIL_TAB.retitle(); }
    $('#gmbody').innerHTML = '<div class="gm-top"><div class="gm-gb"><b>Gmail</b> <a href="#">' + L('日历', 'Calendar') + '</a> <a href="#">' + L('文档', 'Documents') + '</a> <a href="#">' + L('阅读器', 'Reader') + '</a> <a href="#">' + L('网页', 'Web') + '</a> <a href="#">' + L('更多', 'more') + ' ▾</a></div>' +
      '<div class="gm-acc"><b>oem@co.navajo.az.us</b> | <a href="#">' + L('设置', 'Settings') + '</a> | <a href="#">' + L('帮助', 'Help') + '</a> | <a href="#" data-gm="close">' + L('退出', 'Sign out') + '</a></div></div>' +
      '<div class="gm-head"><img src="gmail/logo.gif" width="143" height="59" alt="Gmail by Google"><div class="gm-sr"><input type="text"><button class="gm-b">' + L('搜索邮件', 'Search Mail') + '</button><button class="gm-b">' + L('搜索网页', 'Search the Web') + '</button><span class="gm-srl"><a href="#">' + L('显示搜索选项', 'Show search options') + '</a><br><a href="#">' + L('创建过滤器', 'Create a filter') + '</a></span></div></div>' +
      '<div class="gm-main">' + nav() + '<div class="gm-cont">' + (view.open >= 0 ? message() : inbox()) + '</div></div>' +
      '<div class="gm-foot">' + L('您目前使用了 214 MB (2%)，共 7,386 MB。', 'You are currently using 214 MB (2%) of your 7,386 MB.') + '<br>Gmail ' + L('视图：', 'view: ') + '<b>' + L('标准', 'standard') + '</b> | <a href="#">' + L('关闭聊天', 'turn off chat') + '</a> | <a href="#">' + L('旧版', 'older version') + '</a> | <a href="#">' + L('基本 HTML', 'basic HTML') + '</a><br>©2009 Google - <a href="#">' + L('服务条款', 'Terms') + '</a> - <a href="#">' + L('隐私权政策', 'Privacy Policy') + '</a> - <a href="#">' + L('Google 首页', 'Google Home') + '</a></div>';
    if (window.GMAIL_TAB && window.GMAIL_TAB.setPath) window.GMAIL_TAB.setPath('/mail/?shva=1#' + (view.open >= 0 ? 'inbox/' + (S.mail[view.open].id || '') : view.box));
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-gm],[data-gmb],[data-gmo],[data-gms],[data-act]'); if (e.target.closest('a')) e.preventDefault(); if (!a) return;
    var d = a.dataset; e.stopPropagation();
    if (d.act) { var pp = d.act.split(':'); G.mailAct(+pp[0], +pp[1]); draw(); return; }
    if (d.gm === 'close') { if (window.GMAIL_TAB && top.CW) top.CW.close(window.GMAIL_TAB); return; }
    if (d.gms) { view.star[d.gms] = !view.star[d.gms]; draw(); return; }
    if (d.gm === 'back' || d.gm === 'refresh') { view.open = -1; draw(); return; }
    if (d.gm === 'arch' && view.open >= 0) { S.mail[view.open].archived = true; view.open = -1; draw(); return; }
    if (d.gmb) { view.box = d.gmb; view.open = -1; draw(); return; }
    if (d.gmo != null && !e.target.closest('input')) { view.open = +d.gmo; S.mail[view.open].unread = false; G.render(); draw(); }
  }, true);
  GW.GMAIL = { refresh: draw }; window.addEventListener('unload', function () { if (GW.GMAIL && GW.GMAIL.refresh === draw) GW.GMAIL = null; });
  draw();
})();
