// content/core.js — 内容包注册表。事件、公文、广播都以内容包形式加载，便于批量制作。
// 格式说明见 docs/CONTENT_GUIDE.md；node tools/validate_content.js 可离线检查。
(function (root) {
  'use strict';
  var C = { events: [], mail: [], broadcasts: [], buildings: [], bcats: {}, errors: [], packs: [] };
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
    var RUN = ['house', 'hold', 'stockCap', 'supply', 'use', 'recover', 'spread', 'sight', 'vol', 'otCut', 'daily'], LOOKS = ['flat', 'tents', 'trailers', 'tanks', 'pad'];
    Object.keys(pack.bcats || {}).forEach(function (k) { if (!isPair(pack.bcats[k])) err(pid, 'bcats.' + k, '需要 [中,英]'); else C.bcats[k] = pack.bcats[k]; });
    (pack.buildings || []).forEach(function (b, i) {
      var w = 'buildings[' + i + '] ' + (b.id || '');
      if (!b.id || !/^[a-z0-9_-]+$/.test(b.id)) err(pid, w, 'id 只用小写字母、数字、-、_'); else if (ids['b:' + b.id]) err(pid, w, 'id 重复'); ids['b:' + b.id] = 1;
      if (typeof b.zh !== 'string' || typeof b.en !== 'string') err(pid, w, '需要 zh、en 名称');
      if (!(b.cost >= 0) || !(b.days >= 1)) err(pid, w, 'cost ≥ 0（千美元），days ≥ 1');
      if (!Array.isArray(b.fund) || !b.fund.length || b.fund.some(function (f) { return ['fed', 'navajo', 'lds', 'county'].indexOf(f) < 0; })) err(pid, w, 'fund 只能用 fed/navajo/lds/county');
      if (!b.convert && !(Array.isArray(b.size) && b.size.length === 2)) err(pid, w, '新建需要 size [长,宽]（米）；改建现有房子用 convert:true');
      if (b.look && LOOKS.indexOf(b.look) < 0) err(pid, w, 'look 只能是 ' + LOOKS.join('/'));
      if (!isPair(b.fx)) err(pid, w, 'fx 需要 [中,英]（侧栏显示的效果说明）');
      Object.keys(b.run || {}).forEach(function (k) { if (RUN.indexOf(k) < 0) err(pid, w, '未知 run 字段 "' + k + '"，可用：' + RUN.join('/')); });
      if (b.run && b.run.daily) Object.keys(b.run.daily).forEach(function (k) { if (['panic', 'trust'].indexOf(k) < 0) err(pid, w, 'run.daily 只能用 panic/trust'); });
      Object.keys(b.onBuilt || {}).forEach(function (k) { if (STATS.indexOf(k) < 0 && k !== 'stock' && k !== 'county') err(pid, w, 'onBuilt 只能用 ' + STATS.join('/') + '/stock/county'); });
      C.buildings.push(b);
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
    // 县支票账户：花钱显示 −$，进账显示 +$（原来花钱只显示 $120K，容易看成进账）
    if (d.county) { var m = (d.county > 0 ? '+$' : '−$') + Math.abs(d.county) + 'K'; zh.push('县账户 ' + m); en.push('County ' + m); }
    // 专项资金只能用于该方出资的建筑，和县账户分开写
    var FN = { fed: ['联邦专款', 'Federal fund'], navajo: ['纳瓦霍族专款', 'Navajo fund'], lds: ['教会专款', 'LDS fund'], county: ['县账户', 'County'] };
    if (d.funds) Object.keys(d.funds).forEach(function (k) { var v = d.funds[k], s = (v > 0 ? '+$' : '−$') + Math.abs(v) + 'K'; zh.push((FN[k] || [k])[0] + ' ' + s); en.push((FN[k] || [k, k])[1] + ' ' + s); });
    var CN = { gov: ['州长', 'Governor'], sec: ['委员会', 'Council'], adem: ['应急管理局', 'ADEM'] };
    if (d.rel) Object.keys(d.rel).forEach(function (k) { var s = (d.rel[k] > 0 ? '+' : '−') + Math.abs(d.rel[k]); zh.push(CN[k][0] + '关系 ' + s); en.push(CN[k][1] + ' ' + s); });
    if (d.ctl) Object.keys(d.ctl).forEach(function (k) { var s = (d.ctl[k] > 0 ? '+' : '−') + Math.abs(d.ctl[k]); zh.push(CN[k][0] + '权力 ' + s); en.push(CN[k][1] + ' power ' + s); });
    if (d.build) {
      var BD = root.DATA && root.DATA.buildings ? root.DATA.buildings.filter(function (x) { return x.id === d.build.b; })[0] : null, bf = d.build.fund || (BD && BD.fund[0]), bc = d.build.cost != null ? d.build.cost : BD && BD.cost;
      var FN2 = { fed: ['联邦专款', 'Federal fund'], navajo: ['纳瓦霍族专款', 'Navajo fund'], lds: ['教会专款', 'LDS fund'], county: ['县账户', 'County'] }, cs = bc && FN2[bf] ? [FN2[bf][0] + ' −$' + bc + 'K', FN2[bf][1] + ' −$' + bc + 'K'] : null;
      zh.push('开工：' + d.build.name[0] + (cs ? '（' + cs[0] + '）' : '')); en.push('Builds ' + d.build.name[1] + (cs ? ' (' + cs[1] + ')' : ''));
    }
    if (d.event) { var n = typeof d.event === 'string' ? 0 : (d.event.inDays || 0); zh.push(n ? n + ' 天后有后续' : '马上有后续'); en.push(n ? 'follow-up in ' + n + ' days' : 'follow-up now'); }
    if (d.mail && !zh.length) { zh.push('收到回函'); en.push('A reply arrives'); }
    return zh.length ? [zh.join(' · '), en.join(' · ')] : ['无变化', 'No change'];
  }
  // 文字和效果对不上的选项（validate_content.js 里作为警告列出）
  var MONEY = /\$\s?\d|拨款|出钱|付钱|付清|垫付|买下|购买|租下|雇用?|加班费|\b(fund|pay|buy|rent|hire)\b/i, NOMONEY = /^(不|婉拒|拒绝|谢绝|暂不|没有|先不|维持)|^(no|decline|pass|do not|don't|not now)/i;
  var BUILD = /^(建(?!议)|开设|搭建|改建|新建)|^(build|convert|set up a)\b/i;
  function audit(t, d, fxText) {
    if (fxText) return null; d = d || {};
    var zh = t[0], en = t[1], s = zh + ' ' + en;
    if (MONEY.test(s) && !NOMONEY.test(zh) && !NOMONEY.test(en) && d.county == null && d.funds == null && !d.event && !d.mail) return '文字提到钱，但 do 里没有 county/funds';
    if (BUILD.test(zh) || BUILD.test(en)) { if (!d.build && !d.event) return '文字说要建，但 do 里没有 build'; }
    return null;
  }
  C.add = add; C.fx = fx; C.isDate = isDate; C.audit = audit;
  root.CONTENT = C;
  if (typeof module !== 'undefined') module.exports = C;
})(typeof window !== 'undefined' ? window : globalThis);
