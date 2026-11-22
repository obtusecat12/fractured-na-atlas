// content/core.js — 内容包注册表。事件、公文、广播都以内容包形式加载，便于批量制作。
// 格式说明见 docs/CONTENT_GUIDE.md；node tools/validate_content.js 可离线检查。
(function (root) {
  'use strict';
  var C = { events: [], mail: [], broadcasts: [], errors: [], packs: [] };
  var POWERS = ['fed', 'navajo', 'lds', 'county', 'nb', 'gov', 'sec'];
  var STATS = ['trust', 'panic', 'fed', 'navajo', 'lds'];
  var ICONS = ['info', 'warn', 'q', 'err', 'imp', 'ppl', 'globe', 'build', 'law', 'bank', 'mail', 'pkg', 'sheet'];
  var DO_KEYS = STATS.concat(['county', 'funds', 'flag', 'unflag', 'build', 'mail', 'event', 'notice', 'promise', 'broadcast', 'ctl', 'rel']);
  var ids = {};
  function err(pack, where, msg) { C.errors.push(pack + ' › ' + where + ': ' + msg); }
  function isPair(a) { return Array.isArray(a) && a.length === 2 && typeof a[0] === 'string' && typeof a[1] === 'string' && a[0] && a[1]; }
  function isDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)); }
  function checkDo(p, w, d) {
    if (d == null) return; if (typeof d !== 'object') return err(p, w, 'do 必须是对象');
    Object.keys(d).forEach(function (k) {
      if (DO_KEYS.indexOf(k) < 0) err(p, w, '未知效果 "' + k + '"');
      else if (STATS.indexOf(k) >= 0 || k === 'county') { if (typeof d[k] !== 'number') err(p, w, k + ' 必须是数字'); }
    });
    if (d.ctl) Object.keys(d.ctl).forEach(function (k) { if (['gov', 'sec', 'adem'].indexOf(k) < 0 || typeof d.ctl[k] !== 'number') err(p, w, 'ctl 只能用 gov/sec/adem，值为数字'); });
    if (d.rel) Object.keys(d.rel).forEach(function (k) { if (['gov', 'sec'].indexOf(k) < 0 || typeof d.rel[k] !== 'number') err(p, w, 'rel 只能用 gov/sec，值为数字'); });
    if (d.funds) Object.keys(d.funds).forEach(function (k) { if (['fed', 'navajo', 'lds', 'county'].indexOf(k) < 0) err(p, w, 'funds 只能用 fed/navajo/lds/county'); });
    if (d.build && (!d.build.b || !Array.isArray(d.build.ll) || !isPair(d.build.name))) err(p, w, 'build 需要 b、ll[经度,纬度]、name[中,英]');
    if (d.event && !(typeof d.event === 'string' || d.event.id)) err(p, w, 'event 需要事件 id');
    if (d.notice && !isPair(d.notice)) err(p, w, 'notice 需要 [中,英]');
    if (d.promise && (!d.promise.zh || !d.promise.en || !d.promise.left)) err(p, w, 'promise 需要 zh、en、left');
  }
  function checkWhen(p, w, t) {
    if (!t) return; ['after', 'before'].forEach(function (k) { if (t[k] && !isDate(t[k])) err(p, w, 'when.' + k + ' 日期格式应为 YYYY-MM-DD'); });
    if (t.chance != null && !(t.chance > 0 && t.chance <= 1)) err(p, w, 'when.chance 取值 0–1');
  }
  function add(pack) {
    var pid = pack.id || '(无名包)'; C.packs.push({ id: pid, title: pack.title, by: pack.by });
    (pack.events || []).forEach(function (e, i) {
      var w = 'events[' + i + '] ' + (e.id || '');
      if (!e.id) err(pid, w, '缺少 id'); else if (ids[e.id]) err(pid, w, 'id 重复'); ids[e.id] = 1;
      if (!e.date && !e.when && !e.chained) err(pid, w, '需要 date、when 或 chained:true');
      if (e.date && !isDate(e.date)) err(pid, w, 'date 格式应为 YYYY-MM-DD');
      checkWhen(pid, w, e.when);
      if (!isPair(e.title)) err(pid, w, 'title 需要 [中,英]'); if (!isPair(e.body)) err(pid, w, 'body 需要 [中,英]');
      if (e.icon && ICONS.indexOf(e.icon) < 0) err(pid, w, 'icon 只能是 ' + ICONS.join('/'));
      if (!Array.isArray(e.opts) || e.opts.length < 1 || e.opts.length > 4) err(pid, w, 'opts 需要 1–4 个选项');
      (e.opts || []).forEach(function (o, j) { if (!isPair(o.t)) err(pid, w + ' opts[' + j + ']', 't 需要 [中,英]'); checkDo(pid, w + ' opts[' + j + ']', o.do); });
      C.events.push(e);
    });
    (pack.mail || []).forEach(function (m, i) {
      var w = 'mail[' + i + '] ' + (m.id || '');
      if (!m.id) err(pid, w, '缺少 id'); else if (ids[m.id]) err(pid, w, 'id 重复'); ids[m.id] = 1;
      if (POWERS.indexOf(m.from) < 0) err(pid, w, 'from 只能是 ' + POWERS.join('/'));
      if (m.from === 'nb' && !isPair(m.sender)) err(pid, w, 'from:"nb" 时需要 sender[中,英]');
      if (!isPair(m.subject)) err(pid, w, 'subject 需要 [中,英]'); if (!isPair(m.body)) err(pid, w, 'body 需要 [中,英]');
      if (m.date && !isDate(m.date)) err(pid, w, 'date 格式应为 YYYY-MM-DD');
      (m.acts || []).forEach(function (a, j) { if (!isPair(a.t)) err(pid, w + ' acts[' + j + ']', 't 需要 [中,英]'); checkDo(pid, w + ' acts[' + j + ']', a.do); });
      C.mail.push(m);
    });
    (pack.broadcasts || []).forEach(function (b, i) { if (!isPair(b.name) || !isPair(b.t)) err(pid, 'broadcasts[' + i + ']', '需要 name、t [中,英]'); C.broadcasts.push(b); });
    if (root.console && C.errors.length) C.errors.forEach(function (e) { console.warn('[content] ' + e); });
  }
  // 由效果自动生成「信任 +3 · 教会 +2 · $120K」
  var NAMES = { trust: ['信任', 'Trust'], panic: ['恐慌', 'Panic'], fed: ['联邦', 'Federal'], navajo: ['纳瓦霍族', 'Navajo'], lds: ['教会', 'LDS'] };
  function fx(d) {
    if (!d) return ['无变化', 'No change'];
    var zh = [], en = [];
    STATS.forEach(function (k) { if (d[k]) { var s = (d[k] > 0 ? '+' : '−') + Math.abs(d[k]); zh.push(NAMES[k][0] + ' ' + s); en.push(NAMES[k][1] + ' ' + s); } });
    if (d.county) { var m = (d.county > 0 ? '+$' : '$') + Math.abs(d.county) + 'K'; zh.push(m); en.push(m); }
    if (d.funds) Object.keys(d.funds).forEach(function (k) { var v = d.funds[k], s = (v > 0 ? '+$' : '−$') + Math.abs(v) + 'K'; zh.push(NAMES[k] ? NAMES[k][0] + s : s); en.push(NAMES[k] ? NAMES[k][1] + ' ' + s : s); });
    var CN = { gov: ['州长', 'Governor'], sec: ['委员会', 'Council'], adem: ['应急管理局', 'ADEM'] };
    if (d.rel) Object.keys(d.rel).forEach(function (k) { var s = (d.rel[k] > 0 ? '+' : '−') + Math.abs(d.rel[k]); zh.push(CN[k][0] + '关系 ' + s); en.push(CN[k][1] + ' ' + s); });
    if (d.ctl) Object.keys(d.ctl).forEach(function (k) { var s = (d.ctl[k] > 0 ? '+' : '−') + Math.abs(d.ctl[k]); zh.push(CN[k][0] + '权力 ' + s); en.push(CN[k][1] + ' power ' + s); });
    if (d.build) { zh.push('开工：' + d.build.name[0]); en.push('Builds ' + d.build.name[1]); }
    return zh.length ? [zh.join(' · '), en.join(' · ')] : ['无变化', 'No change'];
  }
  C.add = add; C.fx = fx; C.isDate = isDate;
  root.CONTENT = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
