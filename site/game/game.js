// game.js — 纳瓦霍县开局：侧栏、条例、建造、公文、事件，以及地图视图（地图 / 卫星 / 混合）。
(function () {
  'use strict';
  var D = DATA, $ = function (s) { return document.querySelector(s); };
  (CONTENT.buildings || []).forEach(function (b) { if (!D.buildings.some(function (x) { return x.id === b.id; })) D.buildings.push(b); });
  if (CONTENT.bcats) Object.keys(CONTENT.bcats).forEach(function (k) { if (!D.bcats[k]) D.bcats[k] = CONTENT.bcats[k]; });
  D.buildings.sort(function (a, b) { var o = Object.keys(D.bcats); return o.indexOf(a.cat) - o.indexOf(b.cat); });
  function L(zh, en) { return '<span class="zh">' + zh + '</span><span class="bi"> </span><span class="en">' + en + '</span>'; }
  function LA(a) { return L(a[0], a[1]); }
  function T(zh, en) { return LANG.mode() === 'en' ? en : zh; }
  function P(id) { return D.powers[id]; }
  function chip(id) { var p = P(id); return '<span class="chip" style="background:' + p.color + '">' + LA(p.short) + '</span>'; }
  function money(k) { return '$' + (k >= 1000 ? (k / 1000).toFixed(2).replace(/0$/, '') + 'M' : k + 'K'); }
  var PW = ['fed', 'navajo', 'lds'];

  // ---------- state ----------
  var S = {
    day: D.start.day, date: new Date(D.start.y, D.start.m - 1, D.start.d), hour: D.start.hour, speed: 0,
    trust: 61, panic: 24, stand: { fed: 52, navajo: 47, lds: 58 }, dstand: { fed: 0, navajo: 0, lds: 0 },
    funds: { fed: 900, navajo: 250, lds: 400, county: ECON.checking },
    econ: { lgip: ECON.lgip, flood: ECON.flood, accr: 0, loans: [], pending: [], used: {}, wk: { rev: 0, exp: 0 }, last: null, decl: false },
    facilities: D.facilities.map(function (f) { var b = bdefOf(f.b); return Object.assign({ size: b.size || [20, 12], roof: b.roof, grid: b.grid, tower: b.tower, look: b.look, progress: f.done ? 1 : Math.max(0, 1 - (f.eta || b.days) / b.days) }, f); }),
    laws: {}, mail: [], promises: D.promises.map(function (p) { return Object.assign({}, p); }),
    sim: { arr: 1240, cap0: 930, stock: 34, newT: 3, rec: 0, acc: { trust: 0, panic: 0 }, over: false },
    staff: { county: 34, vol: 0, train: [], ot: false }, teams: [], trade: {}, aid: {}, press: [], presserDay: -9,
    st: { ctl: { gov: 46, sec: 22, adem: 32 }, rel: { gov: 50, sec: 45 }, fin: null },
    flags: {}, seen: {}, chain: [], votes: {}, evq: [], tab: 'ov', bsel: null, bfund: null, placing: false, openMail: -1
  };
  function bdefOf(id) { return D.buildings.filter(function (b) { return b.id === id; })[0]; }
  D.laws.forEach(function (l) { if (l.on) S.laws[l.id] = true; });
  CONTENT.mail.forEach(function (m) { if (!m.date || m.date < '2009-10-14') S.mail.push(Object.assign({}, m)); });
  var town = {}; D.towns.forEach(function (t) { town[t.id] = t; });
  var region = {}; D.regions.forEach(function (r) { region[r.county || r.res] = r; region[r.id] = r; });
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function apply(d, why, quiet) { if (!d) return; if (!quiet) ['trust', 'panic', 'fed', 'navajo', 'lds'].forEach(function (k) { if (d[k]) track(k, d[k], why); }); if (d.trust) S.trust = clamp(S.trust + d.trust); if (d.panic) S.panic = clamp(S.panic + d.panic); PW.forEach(function (k) { if (d[k]) { S.stand[k] = clamp(S.stand[k] + d[k]); S.dstand[k] = d[k]; } }); if (d.money) S.funds.county += d.money; meters(); }
  function ymdOf(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  // 执行内容包里的 do 效果
  function runDo(d, why) {
    if (!d) return; apply(d, why);
    if (d.county) S.funds.county += d.county;
    if (d.funds) Object.keys(d.funds).forEach(function (k) { S.funds[k] += d.funds[k]; });
    [].concat(d.flag || []).forEach(function (f) { S.flags[f] = true; });
    [].concat(d.unflag || []).forEach(function (f) { delete S.flags[f]; });
    if (d.build) { var b = d.build, bd = bdefOf(b.b); if (bd) { var bf = b.fund || bd.fund[0]; if (b.cost !== 0) S.funds[bf] -= (b.cost != null ? b.cost : bd.cost); /* 内容里开工的建筑也要按造价从出资方扣钱（原来不扣，等于白送） */ S.facilities.push({ b: b.b, ll: b.ll, name: b.name, fund: b.fund || bd.fund[0], done: false, eta: b.eta || bd.days, size: b.size || bd.size, roof: bd.roof, look: bd.look, grid: bd.grid, tower: bd.tower, conv: bd.convert, grid: bd.grid, tower: bd.tower, progress: 0 }); syncFac(); MAP.invalidate(b.ll); } }
    [].concat(d.mail || []).forEach(deliverMail);
    if (d.event) { var q = typeof d.event === 'string' ? { id: d.event, inDays: 0 } : d.event; S.chain.push({ id: q.id, at: S.day + (q.inDays || 0) }); }
    if (d.notice) { $('#nview').hidden = false; $('#ntext').innerHTML = LA(d.notice); $('#notice').hidden = false; }
    if (d.promise) S.promises.push(Object.assign({ by: ['', ''] }, d.promise));
    if (d.broadcast) CONTENT.broadcasts.unshift(d.broadcast);
    if (d.rel) Object.keys(d.rel).forEach(function (k) { S.st.rel[k] = clamp(S.st.rel[k] + d.rel[k]); });
    if (d.ctl) ctlShift(d.ctl);
  }
  // ---------- 州层：州长办公室 · 州应急委员会 · 州应急管理局（联邦渠道） ----------
  var STK = ['gov', 'sec', 'adem'];
  function ctlShift(d) {
    var c = S.st.ctl; STK.forEach(function (k) { if (d[k]) c[k] = Math.max(3, c[k] + d[k]); });
    var sum = c.gov + c.sec + c.adem; STK.forEach(function (k) { c[k] = c[k] * 100 / sum; });
  }
  function stLead() { var c = S.st.ctl; return STK.reduce(function (a, k) { return c[k] > c[a] ? k : a; }, 'gov'); }
  function stateDay() {
    // 应急管理局每天从州长办公室和委员会手里拿走一点权力：恐慌越高越快，派驻联络官后更快，委员会关系好时慢一些
    var creep = .12 + Math.max(0, S.panic - 40) / 250 + (S.flags.adem_embed ? .1 : 0) - (S.st.rel.sec > 60 ? .05 : 0) - (S.flags.oversight ? .08 : 0);
    if (creep > 0) ctlShift({ adem: creep, gov: -creep * .7, sec: -creep * .3 });
    if (ymdOf(S.date) === '2009-12-22' && !S.st.fin) stateFinale();
  }
  function stateFinale() {
    var k = stLead(); S.st.fin = k; S.flags['lead_' + k] = true;
    var T = {
      gov: { t: ['州长公告续期', "Governor renews the proclamation"], b: ['布鲁尔州长签署续期公告，州应急行动中心继续由州长办公室统一协调。应急管理局局长调回国民警卫队总部任职，委员会改为每两周开会一次。', "Governor Brewer signs a renewal of the proclamation. The State EOC stays under her office's coordination. The ADEM director is reassigned to Guard headquarters, and the council moves to meeting every two weeks."] },
      sec: { t: ['州应急委员会接手资金审批', 'State Emergency Council takes over spending approval'], b: ['委员会以 8 票对 3 票通过决议：所有超过 20 万美元的拨款和应急管理局的指令都要先经委员会审查。司法部长特里·戈达德主持日常会议。', 'The council votes 8–3: every allocation above $200,000 and every ADEM directive now goes through council review first. Attorney General Terry Goddard chairs the regular sessions.'] },
      adem: { t: ['应急管理局统一指挥', 'ADEM takes unified command'], b: ['国务卿肯·贝内特在州长出州期间代行职务时签署的授权没有被撤回。应急管理局据此统一指挥全州 15 个县的应急行动中心，联邦拨款只走应急管理局的账户。', "The authorization Secretary of State Ken Bennett signed as acting governor while the governor was out of state is never withdrawn. ADEM now directs all 15 county EOCs, and federal money moves only through ADEM's accounts."] }
    }[k];
    fireEvent({ id: 'st-finale', icon: 'law', title: T.t, body: T.b, opts: [{ t: ['知道了', 'Noted'], do: k === 'adem' ? { fed: 3, trust: -2 } : k === 'sec' ? { rel: { sec: 3 } } : { rel: { gov: 3 } } }] });
  }
  function mailById(id) { return CONTENT.mail.filter(function (m) { return m.id === id; })[0]; }
  function evById(id) { return CONTENT.events.filter(function (e) { return e.id === id; })[0]; }
  function deliverMail(id) { var m = typeof id === 'string' ? mailById(id) : id; if (!m || S.mail.some(function (x) { return x.id === m.id; })) return; var c = Object.assign({}, m); if (m.date || typeof id === 'string') { c.unread = true; c.time = c.time || (S.hour + ':00').replace(/^(\d):/, '0$1:'); c.got = ymdOf(S.date); } S.mail.unshift(c); if (window.GMAIL) GMAIL.refresh(); }
  function condOk(w) {
    if (!w) return true; var ymd = ymdOf(S.date);
    if (w.after && ymd < w.after) return false; if (w.before && ymd > w.before) return false;
    if (w.flags && !w.flags.every(function (f) { return S.flags[f]; })) return false;
    if (w.notFlags && w.notFlags.some(function (f) { return S.flags[f]; })) return false;
    var cur = { trust: S.trust, panic: S.panic, fed: S.stand.fed, navajo: S.stand.navajo, lds: S.stand.lds, county: S.funds.county, stock: S.sim.stock, unhoused: unhoused(), cases: totalCases(), arrivals: S.sim.arr, gov: S.st.ctl.gov, sec: S.st.ctl.sec, adem: S.st.ctl.adem, relgov: S.st.rel.gov, relsec: S.st.rel.sec };
    if (w.min && Object.keys(w.min).some(function (k) { return cur[k] < w.min[k]; })) return false;
    if (w.max && Object.keys(w.max).some(function (k) { return cur[k] > w.max[k]; })) return false;
    if (w.chance != null && MAP.hash(S.day, w.chance * 997, 7) > w.chance) return false;
    return true;
  }
  function fireEvent(ev) { S.seen[ev.id] = true; if (S.curEv) S.evq.push(ev); else { S.speed = 0; eventDialog(ev); } }
  function contentDay() {
    var ymd = ymdOf(S.date);
    CONTENT.events.forEach(function (ev) { if (S.seen[ev.id] || ev.start || ev.chained) return; if (ev.date ? ev.date === ymd && condOk(ev.when) : condOk(ev.when)) fireEvent(ev); });
    S.chain = S.chain.filter(function (q) { if (q.at > S.day) return true; var ev = evById(q.id); if (ev) fireEvent(ev); return false; });
    CONTENT.mail.forEach(function (m) { if (m.date === ymd && (!m.when || condOk(m.when))) deliverMail(m); });
  }
  function syncFac() { MAP.setFacilities(S.facilities); }

  // ---------- header ----------
  var WD = [['星期日', 'Sunday'], ['星期一', 'Monday'], ['星期二', 'Tuesday'], ['星期三', 'Wednesday'], ['星期四', 'Thursday'], ['星期五', 'Friday'], ['星期六', 'Saturday']];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function clock() {
    var d = S.date, h = S.hour, ap = h < 12 ? ['上午', 'AM'] : ['下午', 'PM'], h12 = h % 12 || 12;
    $('#cdate').innerHTML = '<span class="dn">' + L('第 ' + S.day + ' 天', 'Day ' + S.day) + ' · </span><b>' + L(d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日', MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()) + '</b> ' + LA(WD[d.getDay()]) + ' · ' + L(ap[0] + ' ' + h12 + ':00', h12 + ':00 ' + ap[1]);
    document.querySelectorAll('#cbtns [data-sp]').forEach(function (b) { b.classList.toggle('on', +b.dataset.sp === S.speed); });
  }
  // 顶栏按重要性分三级：两条会让你输掉的线（信任、恐慌）最大；推动它们的四个数（病例、安置、物资、县账户）其次，
  // 每格下面一行写趋势；其余放侧栏。数字只在告急时变色。鼠标停在格子上列出今天的变化原因。
  function whyTip(k) {
    var w = (S.why || {})[k] || {}, keys = Object.keys(w).filter(function (x) { return Math.abs(w[x]) >= .05; }).sort(function (a, b) { return Math.abs(w[b]) - Math.abs(w[a]); });
    if (!keys.length) return T('今天还没有变化', 'No change yet today');
    return T('今天的变化：', 'Today: ') + keys.slice(0, 6).map(function (x) { var p = x.split('\u0001'); return '\n' + T(p[0], p[1] || p[0]) + '  ' + (w[x] > 0 ? '+' : '−') + Math.abs(w[x]).toFixed(1); }).join('');
  }
  function gauge(id, k, label, v, d, warn, lose) {
    var dd = d ? '<span class="gd ' + ((k === 'panic' ? -d : d) > 0 ? 'up' : 'dn') + '">' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</span>' : '';
    // Win7 进度条（.meter .mb，绿色；恐慌用红色）
    return '<div class="g1 meter' + (k === 'panic' ? ' red' : '') + (warn ? ' warn' : '') + '" id="' + id + '" title="' + whyTip(k) + '"><div class="gtop"><span class="gl">' + label + '</span><span class="gv">' + v + '</span>' + dd + '</div>' +
      '<span class="mb"><i style="width:' + v + '%"></i></span></div>';
  }
  function tile(tab, label, val, sub, warn, tip) { return '<a href="#" class="g2' + (warn ? ' warn' : '') + '" data-tab="' + tab + '"' + (tip ? ' title="' + tip + '"' : '') + '><span class="gl">' + label + '</span><span class="gv2">' + val + '</span><span class="gs">' + sub + '</span></a>'; }
  function meters() {
    var sm = S.sim, cases = totalCases(), uh = unhoused(), sd = sm.stock, fund = Math.round(S.funds.county), d0 = S.d0 || { trust: S.trust, panic: S.panic };
    var n = S.mail.filter(function (m) { return m.unread; }).length, net = supplyNet(), c7 = histAgo(7), fpd = fundPerDay(), cap = simCap();
    var sdT = net < 0 ? L('约 ' + Math.floor(sd / -net) + ' 天后用完', 'out in ~' + Math.floor(sd / -net) + ' days') : L('每天 +' + net.toFixed(1), '+' + net.toFixed(1) + '/day');
    var cT = c7 && c7.cases ? L('一周 ' + (cases >= c7.cases ? '+' : '−') + Math.abs(Math.round((cases / c7.cases - 1) * 100)) + '% · 今日 +' + sm.newT, 'week ' + (cases >= c7.cases ? '+' : '−') + Math.abs(Math.round((cases / c7.cases - 1) * 100)) + '% · +' + sm.newT + ' today') : L('今日 +' + sm.newT, '+' + sm.newT + ' today');
    var uT = L('容量 ' + cap.toLocaleString() + ' · 每天来 ' + Math.round(arrivalsPerDay()), 'room ' + cap.toLocaleString() + ' · ' + Math.round(arrivalsPerDay()) + '/day in');
    var fT = fpd ? L('每天 ' + fmtK(fpd), fmtK(fpd) + '/day') : L('支票账户', 'checking');
    $('#hud').innerHTML =
      gauge('m-trust', 'trust', L('信任', 'Trust'), S.trust, S.trust - d0.trust, S.trust < 25, 'left:0;width:25%') +
      gauge('m-panic', 'panic', L('恐慌', 'Panic'), S.panic, S.panic - d0.panic, S.panic > 75, 'left:75%;width:25%') +
      '<span class="hsep"></span>' +
      tile('ov', L('现有病例', 'Active cases'), cases.toLocaleString(), cT, sm.newT > 12 || (c7 && cases > c7.cases * 1.5)) +
      tile('build', L('等待安置', 'Unhoused'), uh.toLocaleString(), uT, uh > 300) +
      tile('build', L('物资储备', 'Supplies'), L(Math.round(sd) + ' 天', Math.round(sd) + ' days'), sdT, sd < 10 || (net < 0 && sd / -net < 7), T('上限 ', 'Cap ') + stockMax() + T(' 天', ' days')) +
      tile('bank', L('县账户', 'County account'), money(fund), fT, fund < 100) +
      '<a href="#" class="hi hmail" data-tab="mail" title="Gmail"><img src="icons/mail24.png" alt="">' + (n ? '<b>' + n + '</b>' : '') + '<span class="hl">' + L('公文', 'Mail') + '</span></a>';
  }

  // ---------- sidebar ----------
  function sect(title, right) { return '<div class="sect"><div class="sh"><span style="font-weight:bold;font-size:13px">' + title + '</span>' + (right || '') + '</div>'; }
  function render() {
    var h = { ov: tabOverview, ppl: tabPeople, nb: tabRegion, law: tabLaws, build: tabBuild, bank: tabBank, mail: tabMail }[S.tab]();
    $('#results').innerHTML = h;
    document.querySelectorAll('#barl [data-tab]').forEach(function (a) { a.classList.toggle('on', a.dataset.tab === S.tab); });
    meters();
  }
  // 建筑效果说明由 run / onBuilt 生成，和实际效果一致
  var SN = { trust: ['信任', 'Trust'], panic: ['恐慌', 'Panic'], fed: ['联邦', 'Federal'], navajo: ['纳瓦霍族', 'Navajo'], lds: ['教会', 'LDS'] };
  function sg(v) { return (v > 0 ? '+' : '−') + Math.abs(v); }
  function bfx(b) {
    var r = b.run || {}, o = b.onBuilt || {}, zh = [], en = [];
    function add(z, e) { zh.push(z); en.push(e); }
    if (r.house) add('安置 ' + r.house + ' 人', 'Houses ' + r.house);
    if (r.hold) add('隔离 ' + r.hold + ' 名病人', 'Isolates ' + r.hold + ' patients');
    if (r.spread) add('传播 ' + sg(Math.round(r.spread * 100)) + '%', 'Spread ' + sg(Math.round(r.spread * 100)) + '%');
    if (r.recover) add('康复加快 ' + Math.round(r.recover * 18 * 100) + '%', 'Recovery ' + Math.round(r.recover * 18 * 100) + '% faster');
    if (r.divert) add('外来人员每天 −' + r.divert, 'Arrivals −' + r.divert + '/day');
    if (r.supply) add('物资每天 +' + r.supply + ' 天', 'Supplies +' + r.supply + ' day/day');
    if (r.use) add('物资每天 −' + r.use + ' 天', 'Uses ' + r.use + ' day of supplies/day');
    if (r.stockCap) add('储备上限 +' + r.stockCap + ' 天', 'Reserve cap +' + r.stockCap + ' days');
    if (r.sight) add('视野半径 ' + r.sight + ' 公里', 'Sight radius ' + r.sight + ' km');
    if (r.reveal && r.reveal !== r.sight) add(r.reveal + ' 公里内的邻县可见', 'Neighbours within ' + r.reveal + ' km become visible');
    if (r.vol) add('志愿者每周 +' + r.vol, 'Volunteers +' + r.vol + '/week');
    if (r.otCut) add('夜间加班费 −' + Math.round(r.otCut * 100) + '%', 'Night overtime −' + Math.round(r.otCut * 100) + '%');
    if (r.partner) add('出资方关系每天 +' + r.partner, 'Payer relations +' + r.partner + '/day');
    if (r.daily) Object.keys(r.daily).forEach(function (k) { add(SN[k][0] + '每天 ' + sg(r.daily[k]), SN[k][1] + ' ' + sg(r.daily[k]) + '/day'); });
    Object.keys(o).forEach(function (k) { if (k === 'stock') add('完工时物资 +' + o[k] + ' 天', 'Supplies +' + o[k] + ' days on completion'); else if (SN[k]) add('完工时' + SN[k][0] + ' ' + sg(o[k]), SN[k][1] + ' ' + sg(o[k]) + ' on completion'); });
    if (b.ops) add('运营要 ' + b.ops + ' 人', 'Needs ' + b.ops + ' staff to run');
    return zh.length ? [zh.join(' · '), en.join(' · ')] : (b.fx || ['', '']);
  }
  function ico(n) { return '<img src="icons/' + n + '16.png" width="16" height="16" alt="">'; }
  // ---------- 今天 ----------
  // 第一屏只放要你做决定的事和会让你输的趋势；背景信息折叠在下面，点标题展开
  function supplyNet() { return (S.laws.bnsf ? .4 : 0) + runSum('supply') - runSum('use') + (S.stand.fed >= 40 ? 5 / 7 : 0) - (1 + unhoused() / 2000); }
  function arrivalsPerDay() { return Math.max(4, 18 - runSum('divert')) + (S.laws.quota ? 300 / 7 : 0); }
  function pushHist() { var h = S.hist || (S.hist = []); h.push({ d: ymdOf(S.date), trust: S.trust, panic: S.panic, cases: totalCases(), uh: unhoused(), stock: Math.round(S.sim.stock * 10) / 10, fund: Math.round(S.funds.county) }); if (h.length > 40) h.shift(); }
  function histAgo(n) { var h = S.hist || []; return h.length > n ? h[h.length - 1 - n] : h[0]; }
  function fundPerDay() { var h = S.hist || [], a = histAgo(7); if (!a || h.length < 2) return 0; var n = Math.min(7, h.length - 1); return (S.funds.county - a.fund) / Math.max(1, n); }
  function mdLabel(days) { var d = new Date(S.date.getTime() + Math.round(days) * 864e5); return [(d.getMonth() + 1) + '月' + d.getDate() + '日', MON[d.getMonth()] + ' ' + d.getDate()]; }
  function alerts() {
    var out = [], sd = S.sim.stock, net = supplyNet(), uh = unhoused(), cases = totalCases(), c7 = histAgo(7), fpd = fundPerDay(), fund = S.funds.county;
    if (net < 0 && sd / -net < 12) { var dl = Math.max(0, sd / -net), md = mdLabel(dl); out.push({ lv: dl < 5 ? 2 : 1, ico: 'pkg', t: L('物资约 ' + Math.floor(dl) + ' 天后用完（' + md[0] + '）', 'Supplies run out in about ' + Math.floor(dl) + ' days (' + md[1] + ')'), s: L('每天净消耗 ' + (-net).toFixed(1) + ' 天', 'Net use ' + (-net).toFixed(1) + ' days a day'), go: [['warehouse', L('建物资仓库', 'Build a warehouse')], ['nb', L('向邻县买', 'Buy from neighbours')]] }); }
    if (uh > 150) out.push({ lv: uh > 300 ? 2 : 1, ico: 'ppl', t: L(uh.toLocaleString() + ' 人等待安置', uh.toLocaleString() + ' people waiting for housing'), s: L('每天还来约 ' + Math.round(arrivalsPerDay()) + ' 人 · 超过 300 人恐慌上升', 'About ' + Math.round(arrivalsPerDay()) + ' more a day · panic rises above 300'), go: [['trailers', L('建拖车点', 'Trailer site')], ['shelter', L('改建收容所', 'Convert a shelter')]] });
    if (c7 && c7.cases > 5 && cases > c7.cases * 1.3) out.push({ lv: cases > c7.cases * 2 ? 2 : 1, ico: 'imp', t: L('病例一周增加 ' + Math.round((cases / c7.cases - 1) * 100) + '%', 'Cases up ' + Math.round((cases / c7.cases - 1) * 100) + '% in a week'), s: L('现有 ' + cases + ' 例，今天新增 ' + S.sim.newT, cases + ' active, ' + S.sim.newT + ' new today'), go: [['vaccine', L('改建接种点', 'Vaccine clinic')], ['isolation', L('改建隔离点', 'Isolation site')]] });
    if (fpd < 0 && fund > 0 && fund / -fpd < 21) out.push({ lv: fund / -fpd < 7 ? 2 : 1, ico: 'bank', t: L('县账户约 ' + Math.floor(fund / -fpd) + ' 天后透支', 'County account overdrawn in about ' + Math.floor(fund / -fpd) + ' days'), s: L('近一周每天 ' + fmtK(fpd), 'Last week ' + fmtK(fpd) + ' a day'), go: [['bank', L('看财政', 'Finance')]] });
    if (fund <= 0) out.push({ lv: 2, ico: 'bank', t: L('县账户已透支 ' + fmtK(fund), 'County account overdrawn ' + fmtK(fund)), s: L('欠款按 2% 计息，每周一信任 −1', 'Unpaid bills at 2%; trust −1 every Monday'), go: [['bank', L('借款', 'Borrow')]] });
    var short = opsStaff(false) - staffTotal(false); if (short > 0) out.push({ lv: 1, ico: 'sheet', t: L('设施运营缺 ' + short + ' 人', short + ' short to run facilities'), s: L('每天信任 −0.3', 'Trust −0.3 a day'), go: [['volcenter', L('改建志愿者中心', 'Volunteer center')], ['build', L('开 CERT 培训', 'Run a CERT class')]] });
    var wait = S.facilities.filter(function (f) { return !f.done && f.wait === 'crew'; }).length; if (wait) out.push({ lv: 0, ico: 'build', t: L(wait + ' 处工地等人手', wait + ' sites waiting for crew'), s: L('人手空出来才会开工', 'Work starts when staff free up'), go: [['build', L('看施工', 'Construction')]] });
    return out.sort(function (a, b) { return b.lv - a.lv; });
  }
  function goLink(g) { var bd = bdefOf(g[0]); return bd ? '<a href="#" data-pick="' + g[0] + '">' + g[1] + '</a>' : '<a href="#" data-tab="' + g[0] + '">' + g[1] + '</a>'; }
  function fold(key, title, right, body, open0) {
    var open = S.fold && key in S.fold ? S.fold[key] : !!open0;
    return '<div class="sect fold' + (open ? ' open' : '') + '"><div class="sh" data-fold="' + key + '"><span style="font-size:13px">' + title + '</span>' + (right || '') + '<a href="#" class="ft" data-fold="' + key + '">' + (open ? L('隐藏', 'Hide') : L('显示', 'Show')) + '</a></div>' + (open ? body : '') + '</div>';
  }
  function spark(key, color, lo, hi) {
    var h = (S.hist || []).slice(-14).map(function (x) { return x[key]; }); if (h.length < 2) return '';
    var a = lo == null ? Math.min.apply(0, h) : lo, b = hi == null ? Math.max.apply(0, h) : hi; if (b - a < 1e-6) b = a + 1;
    var pts = h.map(function (v, i) { return (i / (h.length - 1) * 96 + 2).toFixed(1) + ',' + (24 - (v - a) / (b - a) * 20).toFixed(1); }).join(' ');
    return '<svg width="100" height="26" class="spark"><polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="1.5"/></svg>';
  }
  function tabOverview() {
    var hol = holiday(), wd = WD[S.date.getDay()];
    var day = hol ? L(hol[0] + ' · 县政府休息', hol[1] + ' · county offices closed') : ([0, 6].indexOf(S.date.getDay()) >= 0 ? L('周末 · 县员工半数到岗', 'Weekend · half the county staff in') : L('工作日', 'Workday'));
    var h = sect(L('今天要处理', 'To do today'), '<span>' + day + '</span>'), n = 0;
    var dlgOpen = !$('#dlgwrap').hidden;
    if (S.curEv && !dlgOpen) { n++; h += '<div class="row td1 lv2">' + ico(S.curEv.icon || 'q') + '<div><div class="t">' + LA(S.curEv.title) + '</div><div class="s">' + L('还没做决定', 'Waiting for your decision') + ' · <a href="#" data-evopen="1">' + L('打开', 'Open') + '</a></div></div></div>'; }
    if (S.evq.length) { n++; h += '<div class="row td1 lv2">' + ico('q') + '<div><div class="t">' + L('还有 ' + S.evq.length + ' 个事件排队', S.evq.length + ' more events queued') + '</div></div></div>'; }
    var mails = S.mail.map(function (m, i) { return [m, i]; }).filter(function (x) { return x[0].acts && x[0].acts.length && !x[0].done; });
    mails.slice(0, 3).forEach(function (x) { n++; var m = x[0]; h += '<div class="row td1' + (m.unread ? ' lv1' : '') + '">' + ico('mail') + '<div><div class="t">' + LA(m.subject) + '</div><div class="s">' + (m.from === 'nb' ? LA(m.sender) : LA(P(m.from).short)) + ' · <a href="#" data-tab="mail">' + L('在 Gmail 里处理', 'Handle in Gmail') + '</a></div></div></div>'; });
    if (mails.length > 3) h += '<div class="row"><div class="s"><a href="#" data-tab="mail">' + L('还有 ' + (mails.length - 3) + ' 封公文要处理', (mails.length - 3) + ' more letters need an answer') + '</a></div></div>';
    S.promises.forEach(function (p, i) { if (p.left > 2) return; n++; h += '<div class="row td1 lv' + (p.left <= 1 ? 2 : 1) + '">' + ico('warn') + '<div><div class="t">' + L(p.zh, p.en) + '</div><div class="s">' + L('承诺 · 剩 ' + p.left + ' 天，过期信任 −8', 'Promise · ' + p.left + ' days left, trust −8 if missed') + ' · <a href="#" data-keep="' + i + '">' + L('兑现', 'Deliver') + ' $' + (p.cost || 20) + 'K</a></div></div></div>'; });
    alerts().forEach(function (a) { n++; h += '<div class="row td1 lv' + a.lv + '">' + ico(a.ico) + '<div><div class="t">' + a.t + '</div><div class="s">' + a.s + ' · ' + a.go.map(goLink).join(' · ') + '</div></div></div>'; });
    if (!n) h += '<div class="row"><div class="s">' + L('没有需要马上处理的事。', 'Nothing needs you right now.') + '</div></div>';
    h += '</div>';
    if ((S.hist || []).length >= 2) {
      var row = function (lab, key, val, col, lo, hi) { return '<div class="trow"><span class="tl">' + lab + '</span>' + spark(key, col, lo, hi) + '<b>' + val + '</b></div>'; };
      h += sect(L('近两周', 'Last two weeks')) + '<div class="trend">' +
        row(L('信任', 'Trust'), 'trust', S.trust, '#2a7d2a', 0, 100) + row(L('恐慌', 'Panic'), 'panic', S.panic, '#c4372a', 0, 100) +
        row(L('现有病例', 'Active cases'), 'cases', totalCases(), '#8a3b9a') + row(L('等待安置', 'Unhoused'), 'uh', unhoused().toLocaleString(), '#b06a10') +
        row(L('物资（天）', 'Supplies (days)'), 'stock', Math.round(S.sim.stock), '#2f6fdb') + row(L('县账户', 'County account'), 'fund', money(Math.round(S.funds.county)), '#3a8a3a') + '</div></div>';
    }
    h += sect(L('三方关系', 'Relations'), '<span>' + L('低于 40 联邦每周不补物资', 'Below 40 the federal weekly supply stops') + '</span>') + PW.map(function (k) { var dd = S.dstand[k], v = S.stand[k]; return '<div class="row strow"><i class="sw" style="background:' + P(k).color + '"></i><div style="flex:1"><div class="t">' + LA(P(k).short) + ' <b>' + v + '</b>' + (dd ? ' <span class="' + (dd > 0 ? 'up' : 'dn') + '">' + (dd > 0 ? '▲' : '▼') + Math.abs(dd) + '</span>' : '') + '</div><div class="rbar"><i style="width:' + v + '%;background:' + P(k).color + '"></i></div></div></div>'; }).join('') + '</div>';
    var c = S.st.ctl, r = S.st.rel, NM = { gov: ['州长办公室', "Governor's Office"], sec: ['州应急委员会', 'State Emergency Council'], adem: ['州应急管理局', 'ADEM'] }, WHO = { gov: ['州长 简·布鲁尔', 'Gov. Jan Brewer'], sec: ['州长任主席 · 14 名成员', 'Chaired by the governor · 14 members'], adem: ['隶属应急与军事事务部 · 联邦拨款渠道', 'Under DEMA · federal funding channel'] };
    var lead = STK.reduce(function (a, k) { return c[k] > c[a] ? k : a; }, 'gov');
    h += fold('phx', L('凤凰城', 'Phoenix'), '<span>' + L('主导：', 'Leading: ') + LA(NM[lead]) + ' ' + Math.round(c[lead]) + '%</span>',
      '<div class="stbar">' + STK.map(function (k) { return '<i style="width:' + c[k].toFixed(1) + '%;background:' + P(k === 'adem' ? 'fed' : k).color + '"></i>'; }).join('') + '</div>' +
      STK.map(function (k) { var rv = k === 'adem' ? S.stand.fed : r[k]; return '<div class="row strow"><i class="sw" style="background:' + P(k === 'adem' ? 'fed' : k).color + '"></i><div><div class="t">' + LA(NM[k]) + ' <b>' + Math.round(c[k]) + '%</b></div><div class="s">' + LA(WHO[k]) + ' · ' + L('与本县关系 ', 'Relations ') + Math.round(rv) + '</div></div></div>'; }).join(''));
    var pr = S.promises.filter(function (p) { return p.left > 2; });
    if (pr.length) h += fold('pro', L('其他承诺', 'Other promises'), '<span>' + pr.length + '</span>', S.promises.map(function (p, i) { if (p.left <= 2) return ''; return '<div class="row ri">' + ico('warn') + '<div><div class="t">' + L(p.zh, p.en) + '</div><div class="s">' + LA(p.by) + ' · ' + L('剩 ' + p.left + ' 天', p.left + ' days left') + ' · <a href="#" data-keep="' + i + '">' + L('兑现', 'Deliver') + ' $' + (p.cost || 20) + 'K</a></div></div></div>'; }).join(''), true);
    var nh = nextHoliday();
    h += fold('news', L('报纸和广播', 'Papers and radio'), (S.day - S.presserDay >= 3 ? '<a href="#" data-presser="1">' + L('开发布会', 'Hold a press conference') + '</a>' : '<span>' + L('发布会三天一次', 'One every 3 days') + '</span>'),
      (S.press.length ? S.press.slice(0, 4).map(function (x) { return '<div class="row bc"><div class="tm">' + x.d.slice(5) + '</div><div><div class="t" style="font-size:12px">' + LA(PAPERS[x.p]) + '</div><div class="s">' + LA(x.t) + '</div></div></div>'; }).join('') : '<div class="row"><div class="s">' + L('怀特山独立报周二、周五出版；论坛新闻报和纳瓦霍-霍皮观察家报周三出版。', 'White Mountain Independent comes out Tuesday and Friday; The Tribune-News and Navajo-Hopi Observer on Wednesday.') + '</div></div>') +
      CONTENT.broadcasts.slice(0, 6).map(function (b) { return '<div class="row bc"><div class="tm">' + b.time + '</div><div><div class="t" style="font-size:12px"><i class="sw" style="display:inline-block;width:8px;height:8px;margin-right:4px;background:' + P(b.ch).color + '"></i>' + LA(b.name) + '</div><div style="font-size:12px">' + LA(b.t) + '</div></div></div>'; }).join('') +
      (nh ? '<div class="row"><div class="s">' + L('下一个假日：' + (+nh[0].slice(5, 7)) + '月' + (+nh[0].slice(8)) + '日 ' + nh[1][0], 'Next holiday: ' + nh[0].slice(5) + ' ' + nh[1][1]) + '</div></div>' : ''));
    h += fold('towns', L('城镇', 'Towns'), '<span>' + D.towns.length + '</span>', D.towns.map(function (t, i) {
      return '<div class="res r09" data-town="' + t.id + '"><img class="mk" src="../gimg/marker' + 'ABCDEFGHIJ'[i] + '.png" width="20" height="34" onerror="this.style.visibility=\'hidden\'"><div class="rb"><span class="nm">' + L(t.zh, t.en) + '</span>' +
        '<div class="ad">' + L('人口 ', 'Pop. ') + t.pop.toLocaleString() + ' · ' + L('病例 ', 'Cases ') + t.cases + ' · ' + L('民心 ', 'Mood ') + t.mood + '</div>' +
        '<div class="lks"><a href="#" data-zoom="' + t.id + '">' + L('放大', 'Zoom in') + '</a>' + (t.town ? ' - <a href="#" data-sat="' + t.id + '">' + L('卫星', 'Satellite') + '</a>' : '') + '</div></div></div>';
    }).join(''), true);
    return h;
  }
  function tabRegion() {
    var seen = D.regions.filter(function (r) { return r.seen && !r.fed; });
    var h = sect(L('相邻政府', 'Neighbouring governments'), '<span>' + L('共 ' + (seen.length + 1) + ' 个', (seen.length + 1) + ' total') + '</span>');
    seen.forEach(function (r) {
      h += '<div class="row ri" data-region="' + r.id + '">' + ico(r.res ? 'ppl' : 'globe') + '<div><div class="t"><a href="#">' + L(r.zh, r.en) + '</a></div><div class="s">' + LA(r.seat) + ' · ' + chip(r.stance) + L('病例 ', 'Cases ') + r.cases + (r.ref ? ' · ' + L('外来 ', 'Arrivals ') + r.ref.toLocaleString() : '') + '</div>' +
        '<div class="lk"><a href="#" data-zr="' + r.id + '">' + L('放大', 'Zoom') + '</a> - ' + (S.trade[r.id] > S.day - 7 ? '<span class="s">' + L('本周已买过', 'Bought this week') + '</span>' : '<a href="#" data-trade="' + r.id + '">' + L('买 3 天物资 $45K', 'Buy 3 days of supplies, $45K') + '</a>') + ' - ' + (S.teams.some(function (t) { return t.rid === r.id; }) ? '<span class="s">' + L('外勤队在途', 'Team on the road') + '</span>' : '<a href="#" data-team="' + r.id + '" title="' + T('4 人 · $6K · 回来时带回 1 天物资并更新情况', '4 staff · $6K · brings back 1 day of supplies and a report') + '">' + L('派外勤队', 'Send a field team') + '</a>') + ' - ' + (S.aid[r.id] ? '<span class="s">' + L('已签互助协议', 'Mutual aid signed') + '</span>' : '<a href="#" data-aid="' + r.id + '" title="' + T('关系 +2 · 每周县账户 −$8K · 物资每周 +0.6 天', 'Relations +2 · County −$8K a week · Supplies +0.6 day a week') + '">' + L('签互助协议', 'Sign mutual aid') + '</a>') + '</div></div></div>';
    });
    var f = region.Maricopa;
    h += '<div class="row" data-region="Maricopa"><div class="t"><a href="#">' + L('联邦控制区', 'Federal zone') + '</a></div><div class="s">' + L('凤凰城 · 马里科帕、皮纳尔、格雷厄姆、格林利', 'Phoenix · Maricopa, Pinal, Graham, Greenlee') + '</div></div>';
    h += '</div>' + sect(L('情况不明', 'No information'));
    D.regions.filter(function (r) { return !r.seen; }).forEach(function (r) { h += '<div class="row"><div class="t" style="color:#676767">' + L(r.zh, r.en) + '</div><div class="s">' + LA(r.status) + ' · ' + (S.teams.some(function (t) { return t.rid === r.id; }) ? L('外勤队在途', 'Team on the road') : '<a href="#" data-team="' + r.id + '">' + L('派外勤 »', 'Send team »')) + '</a></div></div>'; });
    h += '</div>' + sect(L('外勤', 'Field teams'));
    if (!S.teams.length) h += '<div class="row"><div class="s">' + L('没有在外的外勤队。每队 4 人、$6K，保留地 2 天、邻县 3 天回来。', 'No teams out. Each takes 4 staff and $6K; 2 days to a reservation, 3 to a county.') + '</div></div>';
    S.teams.forEach(function (t) { var r = region[t.rid]; h += '<div class="row"><div class="t">' + L('外勤队 → ' + r.zh, 'Team → ' + r.en) + '</div><div class="s">' + L('还要 ' + t.days + ' 天', t.days + ' days left') + '</div></div>'; });
    return h + '</div>';
  }
  function vt0(l) { var v = S.votes[l.id]; return v ? v.yes + '–' + (5 - v.yes) : ''; }
  function tabPeople() {
    var h = sect(L('县监事会', 'Board of Supervisors'), '<span>' + L('三票通过', 'Three votes to pass') + '</span>');
    D.board.forEach(function (b) {
      var last = S.lastVote && S.lastVote.v[b.d - 1];
      h += '<div class="row"><div class="t">' + L('第' + b.d + '区 · ' + b.zh, 'District ' + b.d + ' · ' + b.en) + '</div>' + (b.area ? '<div class="s">' + LA(b.area) + '</div>' : '') +
        (last != null ? '<div class="s">' + L('上次表决：', 'Last vote: ') + (last ? L('赞成', 'Aye') : L('反对', 'Nay')) + '</div>' : '') + '</div>';
    });
    h += '</div>';
    D.officials.forEach(function (grp) {
      h += sect(LA(grp.g));
      grp.list.forEach(function (o) {
        var role = L(o[2], o[3]);
        if (o[4] === 'shirley' && S.flags.shelly) role = L('族长（行政休假中）', 'President (on administrative leave)');
        if (o[4] === 'shelly' && S.flags.shelly) role = L('代理族长', 'Acting President');
        if (o[4] === 'quochytewa' && S.flags.hopi_chair) role = L('霍皮族临时议会主持（勒罗伊·辛戈伊特瓦 12月1日就职）', 'Hopi interim council chair (Leroy Shingoitewa takes office Dec 1)');
        h += '<div class="row"><div class="t">' + L(o[0], o[1]) + '</div><div class="s">' + role + '</div></div>';
      });
      h += '</div>';
    });
    h += sect(L('市镇长', 'Mayors'));
    D.towns.forEach(function (t) { if (t.mayor) h += '<div class="row"><div class="t">' + LA(t.mayor) + '</div><div class="s">' + L(t.zh + '镇长', 'Mayor of ' + t.en) + '</div></div>'; });
    return h + '</div>';
  }
  // 表决：每位监事得分 = 条例预设立场 l.sup[i] + (信任 − 50) / 15（第 1、2 区看纳瓦霍族关系）+ 当日波动 ±0.4；得分 > 0 投赞成，3 票通过
  function voteParts(l) {
    return D.board.map(function (b, i) {
      var base = (l.sup || [0, 0, 0, 0, 0])[i], nav = b.tie === 'navajo', s = nav ? (S.stand.navajo - 50) / 15 : (S.trust - 50) / 15, n = (MAP.hash(S.day, i, l.id.length) - .5) * .8;
      return { base: base, s: s, nav: nav, n: n, sum: base + s + n, yes: base + s + n > 0 };
    });
  }
  function boardVote(l) {
    var P = voteParts(l), v = P.map(function (p) { return p.yes; });
    var yes = v.filter(Boolean).length; S.lastVote = { id: l.id, v: v, yes: yes, P: P }; S.votes[l.id] = { yes: yes, day: S.day };
    return yes >= 3;
  }
  // ---------- 表决界面（2009 年新闻图表式圆桌唱名表决） ----------
  function sg(n) { return (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1); }
  function voteScreen(l, done) {
    var ok = boardVote(l), P = S.lastVote.P, yes = S.lastVote.yes, cx = 360, cy = 172, RS = 128, RL = 178;
    function pt(rad, a) { a = (a - 90) * Math.PI / 180; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; }
    var svg = '<svg viewBox="0 0 720 380" class="rt-svg"><defs>' +
      '<radialGradient id="rtT" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#fbfbfb"/><stop offset="1" stop-color="#d9dde2"/></radialGradient>' +
      '<linearGradient id="rtG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd16a"/><stop offset=".5" stop-color="#5cad34"/><stop offset=".51" stop-color="#4c9c26"/><stop offset="1" stop-color="#3f8a1e"/></linearGradient>' +
      '<linearGradient id="rtR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a80"/><stop offset=".5" stop-color="#d9392f"/><stop offset=".51" stop-color="#c82a21"/><stop offset="1" stop-color="#ad1f18"/></linearGradient>' +
      '<linearGradient id="rtE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcdcdc"/></linearGradient>' +
      '<filter id="rtS" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".25"/></filter></defs>';
    svg += '<ellipse cx="' + cx + '" cy="' + (cy + 6) + '" rx="92" ry="92" fill="#000" opacity=".08"/><circle cx="' + cx + '" cy="' + cy + '" r="90" fill="url(#rtT)" stroke="#b5bcc4" stroke-width="1.5"/>';
    svg += '<text class="rt-tally" id="rtc" x="' + cx + '" y="' + (cy + 8) + '" text-anchor="middle">0 – 0</text><text class="rt-tl" x="' + cx + '" y="' + (cy + 30) + '" text-anchor="middle">' + T('赞成 – 反对', 'AYE – NAY') + '</text>';
    D.board.forEach(function (b, k) {
      var A = 72 * k, st = pt(RS, A), lb = pt(RL, A), anc = Math.abs(lb[0] - cx) < 20 ? 'middle' : lb[0] > cx ? 'start' : 'end', p = P[k];
      var y0 = (k === 2 || k === 3) ? lb[1] + 4 : lb[1] - 14;
      if (k === 0) { lb = [st[0] + 42, st[1]]; anc = 'start'; y0 = st[1] - 10; }   // 顶上的座位：名字放右侧，避开标题
      svg += '<g filter="url(#rtS)"><circle class="rt-seat" id="rts' + k + '" cx="' + st[0].toFixed(1) + '" cy="' + st[1].toFixed(1) + '" r="27" fill="url(#rtE)" stroke="#a7a7a7"/></g>';
      svg += '<text class="rt-sv" id="rtv' + k + '" x="' + st[0].toFixed(1) + '" y="' + (st[1] + 5).toFixed(1) + '" text-anchor="middle">' + b.d + '</text>';
      svg += '<text class="rt-nm" x="' + lb[0].toFixed(0) + '" y="' + y0.toFixed(0) + '" text-anchor="' + anc + '">' + b.en + '</text>';
      svg += '<text class="rt-ds" x="' + lb[0].toFixed(0) + '" y="' + (y0 + 17).toFixed(0) + '" text-anchor="' + anc + '">' + T('第' + b.d + '区 · ' + b.zh, 'District ' + b.d) + '</text>';
      svg += '<text class="rt-fx" x="' + lb[0].toFixed(0) + '" y="' + (y0 + 31).toFixed(0) + '" text-anchor="' + anc + '">' + T('立场 ', 'stance ') + sg(p.base) + (p.nav ? T(' · 族关系 ', ' · Navajo ') : T(' · 信任 ', ' · trust ')) + sg(p.s) + T(' · 波动 ', ' · drift ') + sg(p.n) + '</text>';
    });
    svg += '</svg>';
    var w = document.getElementById('magi'); if (!w) { w = document.createElement('div'); w.id = 'magi'; w.className = 'win7'; document.body.appendChild(w); }
    w.innerHTML = '<div class="window glass active rt-win"><div class="title-bar"><div class="title-bar-text">' + T('纳瓦霍县监事会 · 唱名表决', 'Navajo County Board of Supervisors · Roll call') + '</div></div><div class="window-body rt-body">' +
      '<div class="rt-hd"><span class="rt-k">ROLL CALL VOTE</span><span class="rt-no">' + T('提案 ', 'Res. ') + '2009-' + String(100 + S.day).slice(-3) + ' · ' + (S.date.getMonth() + 1) + '/' + S.date.getDate() + '/2009</span></div>' +
      '<div class="rt-title">' + T(l.zh, l.en) + '</div>' + svg +
      '<div class="rt-bar"><i class="g" id="rtbg"></i><i class="r" id="rtbr"></i></div>' +
      '<div class="rt-ft"><span id="rtres" class="rt-res">' + T('表决中…', 'Voting…') + '</span><span class="rt-meta">' + T('信任 ', 'Trust ') + Math.round(S.trust) + ' · ' + T('纳瓦霍族关系 ', 'Navajo ') + Math.round(S.stand.navajo) + ' · ' + T('三票通过', 'Three votes to pass') + '</span><button class="rt-ok" disabled>' + T('确定', 'OK') + '</button></div></div></div>';
    w.hidden = false; var sp0 = S.speed; S.speed = 0; clock();
    var i = 0, tm = setInterval(function () {
      if (i < 5) {
        var y = P[i].yes; w.querySelector('#rts' + i).setAttribute('fill', y ? 'url(#rtG)' : 'url(#rtR)'); w.querySelector('#rts' + i).setAttribute('stroke', y ? '#3a7d1b' : '#9b1c16');
        var vv = w.querySelector('#rtv' + i); vv.textContent = y ? T('赞成', 'AYE') : T('反对', 'NAY'); vv.setAttribute('class', 'rt-sv on');
        var ay = P.slice(0, i + 1).filter(function (q) { return q.yes; }).length; w.querySelector('#rtc').textContent = ay + ' – ' + (i + 1 - ay);
        w.querySelector('#rtbg').style.width = ay * 20 + '%'; w.querySelector('#rtbr').style.width = (i + 1 - ay) * 20 + '%'; i++; return;
      }
      clearInterval(tm); var r = w.querySelector('#rtres'); r.textContent = ok ? T('通过', 'Passed') : T('未通过', 'Failed'); r.className = 'rt-res ' + (ok ? 'yes' : 'no');
      var b = w.querySelector('.rt-ok'); b.disabled = false; b.focus(); b.onclick = function () { w.hidden = true; S.speed = sp0; clock(); done(ok); };
    }, 450);
  }
  function vtz(l) { var v = S.votes[l.id]; return v ? '赞成 ' + v.yes + ' · 反对 ' + (5 - v.yes) : '开局已生效'; }
  function vte(l) { var v = S.votes[l.id]; return v ? v.yes + ' aye, ' + (5 - v.yes) + ' nay' : 'in force at start'; }
  function tabLaws() {
    var h = sect(L('县监事会决议', 'Board of Supervisors resolutions')) + '<div class="row"><div class="s">' + L('点“提交表决”后五名监事当场投票，3 票赞成就通过，条例立即生效；没通过可以第二天再提。', 'Submit a resolution and the five supervisors vote at once. Three ayes pass it and it takes effect; if it fails you can try again tomorrow.') + '</div></div></div>', g = null;
    D.laws.forEach(function (l) {
      if (l.id === 'deputize' && !S.flags.deputize) return;
      if (!g || g[0] !== l.g[0]) { if (g) h += '</div>'; g = l.g; h += sect(LA(l.g)); }
      var on = !!S.laws[l.id], dis = l.ex && S.laws[l.ex], vt = S.votes[l.id], failed = vt && !on && vt.day === S.day;
      h += '<div class="row law' + (dis ? ' dis' : '') + '"><div style="flex:1"><div class="t">' + L(l.zh, l.en) + '</div><div class="fx">' + LA(l.fx) + '</div></div>' +
        (on ? '<span class="signed">' + L('已通过（' + vtz(l) + '）', 'Passed (' + vte(l) + ')') + '</span>' : failed ? '<span class="signed" style="color:#c00">' + L('未通过（赞成 ' + vt.yes + ' · 反对 ' + (5 - vt.yes) + '）', 'Failed (' + vt.yes + ' aye, ' + (5 - vt.yes) + ' nay)') + '</span>' : '<button class="gbtn nd" data-sign="' + l.id + '"' + (dis ? ' disabled' : '') + '>' + L('提交表决', 'Submit to vote') + '</button>') + '</div>';
    });
    return h + '</div>';
  }
  function tabBuild() {
    var h = sect(L('资金', 'Funds')) + '<div class="funds">';
    ['fed', 'navajo', 'lds', 'county'].forEach(function (k) { h += '<span>' + LA(P(k).short) + '</span><span class="fb"><i style="width:' + Math.min(100, S.funds[k] / 10) + '%;background:' + P(k).color + '"></i></span><b>' + money(S.funds[k]) + '</b>'; });
    h += '</div></div>';
    var rec = [], why = {};
    alerts().forEach(function (a) { a.go.forEach(function (x) { if (bdefOf(x[0]) && rec.indexOf(x[0]) < 0) { rec.push(x[0]); why[x[0]] = a.t; } }); });
    if (rec.length) {
      h += sect(L('现在最需要', 'Needed now'));
      rec.slice(0, 3).forEach(function (id) { var b = bdefOf(id); h += '<div class="row bitem rec" data-pick="' + id + '"><span class="bico" style="background:' + (b.roof || '#b9a37e') + '"></span><div style="flex:1"><div class="t"><a href="#" data-pick="' + id + '">' + L(b.zh, b.en) + '</a> <span class="s">' + money(b.cost) + ' · ' + L(b.days + ' 天', b.days + ' days') + '</span></div><div class="s">' + LA(bfx(b)) + '</div><div class="s why">' + why[id] + '</div></div></div>'; });
      h += '</div>';
    }
    var sf = S.staff, busy = S.facilities.reduce(function (a, f) { return a + (!f.done && !f.wait ? (bdefOf(f.b) || {}).crew || 3 : 0); }, 0), nt = isNight();
    function srow(night, zh, en) {
      var on = staffTotal(night), op = opsStaff(night), bz = nt === night ? busy : 0, cur = nt === night;
      return '<tr' + (cur ? ' class="cur"' : '') + '><td>' + L(zh, en) + (cur ? ' <span class="s">' + L('当前', 'now') + '</span>' : '') + '</td><td>' + on + '</td><td' + (op > on ? ' class="bad"' : '') + '>' + op + '</td><td>' + bz + '</td><td>' + Math.max(0, on - op - bz) + '</td></tr>';
    }
    h += sect(L('排班', 'Shifts'), '<span>' + (offDay() ? (holiday() ? L('节假日', 'Holiday') : L('周末', 'Weekend')) : L('工作日', 'Workday')) + '</span>') +
      '<table class="shifts"><tr><th></th><th>' + L('在岗', 'On duty') + '</th><th>' + L('设施', 'Sites') + '</th><th>' + L('施工', 'Builds') + '</th><th>' + L('空闲', 'Free') + '</th></tr>' +
      srow(false, '白班 06–19', 'Day 06–19') + srow(true, '夜班 19–06', 'Night 19–06') + '</table>' +
      '<div class="s" style="padding:2px 10px">' + L('县员工 ' + sf.county + ' 人 · 志愿者 ' + Math.round(sf.vol) + ' 人（只上白班）· 夜班留三成县员工值守，设施夜里半数运营', sf.county + ' county staff · ' + Math.round(sf.vol) + ' volunteers (days only) · 30% of county staff on nights; sites run at half strength overnight') + '</div>' +
      '<div class="lk" style="padding:4px 10px 8px"><a href="#" data-cert="1">' + L('开一期社区应急队（CERT）培训', 'Run a CERT class') + '</a> <span class="s">$8K · ' + L('3 天 · 志愿者 +6', '3 days · +6 volunteers') + (sf.train.length ? ' · ' + L('培训中 ' + sf.train.length + ' 期', sf.train.length + ' in class') : '') + '</span><br>' +
      '<label style="color:#000"><input type="checkbox" data-ot="1"' + (sf.ot ? ' checked' : '') + '> ' + L('夜班继续施工', 'Keep building on night shift') + '</label> <span class="s">' + L('施工人手按 $53/人·小时', '$53 per worker-hour') + '</span><br>' +
      '<label style="color:#000"><input type="checkbox" data-wk="1"' + (sf.wk ? ' checked' : '') + '> ' + L('周末全员加班', 'Full staff on weekends') + '</label> <span class="s">' + L('周末白班约 $' + Math.round(sf.county * .5 * .053 * 13) + 'K/天', 'about $' + Math.round(sf.county * .5 * .053 * 13) + 'K a weekend day') + '</span></div></div>';
    var cat = null;
    D.buildings.forEach(function (b) {
      if (cat !== b.cat) { if (cat) h += '</div>'; cat = b.cat; h += sect(LA(D.bcats[cat])); }
      var sel = S.bsel === b.id;
      h += '<div class="row bitem' + (sel ? ' sel' : '') + '" data-b="' + b.id + '"><span class="bico" style="background:' + (b.roof || '#b9a37e') + '"></span><div style="flex:1"><div class="t"><a href="#">' + L(b.zh, b.en) + '</a></div>' +
        '<div class="cost">' + money(b.cost) + ' · ' + L(b.days + ' 天', b.days + ' days') + (b.size ? ' · ' + b.size[0] + '×' + b.size[1] + ' m' : '') + ' · ' + b.fund.map(chip).join('') + '</div><div class="s">' + LA(bfx(b)) + '</div>';
      if (sel) h += '<div class="lk" style="margin-top:5px">' + L('出资：', 'Paid by: ') + b.fund.map(function (f) { return '<label style="margin-right:8px;color:#000"><input type="radio" name="bf" value="' + f + '"' + (S.bfund === f ? ' checked' : '') + '> ' + LA(P(f).short) + '</label>'; }).join('') + '</div><div style="margin-top:5px"><button class="gbtn nd" id="place">' + (b.convert ? L('选择建筑', 'Pick a building') : L('在地图上放置', 'Place on map')) + '</button></div>';
      h += '</div></div>';
    });
    h += '</div>' + sect(L('施工中', 'Under construction'));
    S.facilities.filter(function (f) { return !f.done; }).forEach(function (f) { var pc = Math.floor((f.progress || 0) * 100); h += '<div class="row"><div class="t">' + LA(f.name) + '</div><div class="s">' + chip(f.fund) + stageName(f) + ' · ' + L('还要 ' + f.eta + ' 天', f.eta + ' days left') + '</div><div class="pbar"><i style="width:' + pc + '%"></i></div></div>'; });
    return h + '</div>';
  }

  // ---------- finance ----------
  var E = ECON;
  function fmtK(k) { var s = Math.round(Math.abs(k)).toLocaleString('en-US'); return (k < 0 ? '−$' : '$') + s + 'K'; }
  function revWk(r) { return r.lump && r.lump.months.indexOf(S.date.getMonth() + 1) >= 0 ? r.lump.wk : r.wk; }

  // ---------- 核心数值：人口、住房、物资、病例 ----------
  // 建筑效果全部来自 buildings[].run（每天生效）和 onBuilt（完工一次），内容包可以定义新建筑
  function runSum(k) { return S.facilities.reduce(function (s, f) { var b = f.done && bdefOf(f.b); return s + (b && b.run && b.run[k] || 0); }, 0); }
  function nBuilt(id) { return S.facilities.filter(function (f) { return f.b === id && f.done; }).length; }
  function simCap() { return S.sim.cap0 + runSum('house'); }
  function stockMax() { return 45 + runSum('stockCap'); }
  function unhoused() { return Math.max(0, S.sim.arr - simCap()); }
  function totalCases() { return D.towns.reduce(function (s, t) { return s + t.cases; }, 0); }
  function track(k, v, why) { if (!v) return; var w = S.why || (S.why = {}), key = why ? (Array.isArray(why) ? why[0] + '\u0001' + why[1] : why) : '其他\u0001Other'; (w[k] = w[k] || {})[key] = ((w[k] || {})[key] || 0) + v; }
  function nudge(k, v, why) { track(k, v, why); var a = S.sim.acc; a[k] = (a[k] || 0) + v; var w = a[k] > 0 ? Math.floor(a[k]) : Math.ceil(a[k]); if (w) { a[k] -= w; var d = {}; d[k] = w; apply(d, null, true); } }
  function spreadMult() {
    var m = 1, L = S.laws;
    if (L.mask) m *= .85; if (L.school_close) m *= .7; if (L.school_open) m *= 1.1; if (L.mill_crew) m *= .85;
    m *= 1 + Math.min(.3, unhoused() / 3000);
    return m;
  }
  function simDay() {
    var sm = S.sim, L = S.laws, wd = S.date.getDay();
    // 人口：沿 I-40 和 77 号公路北上的人，检查点会分流一部分；配额条例按周接收
    var drift = Math.max(4, 18 - runSum('divert')), quota = L.quota ? 300 / 7 : 0;
    var inn = Math.round(drift + quota + (MAP.hash(S.day, 3, 11) - .5) * 8); sm.arr += inn;
    // 物资（天数）
    var use = 1 + unhoused() / 2000;
    var get = (L.bnsf ? .4 : 0) + runSum('supply') - runSum('use') + (wd === 1 && S.stand.fed >= 40 ? 5 : 0);
    sm.stock = Math.max(0, Math.min(stockMax(), sm.stock - use + get));
    // 病例：每个镇单独增长，隔离点收走一部分传染源，诊所加快康复
    var iso = runSum('hold'), act = totalCases(), spreadable = Math.max(0, act - iso) / Math.max(1, act);
    var r = .055 * spreadMult() * Math.max(.4, 1 + runSum('spread')), rec = 1 / 18 + runSum('recover'), newT = 0, recT = 0;
    D.towns.forEach(function (t, i) {
      var seed = t.cases > 0 ? t.cases : (MAP.hash(S.day, i, 5) < .04 * (1 + act / 200) ? 1 : 0);
      var n = Math.round(t.cases * spreadable * r * (.7 + MAP.hash(S.day, i, 9) * .6)) + (t.cases ? 0 : seed);
      var rc = Math.round(t.cases * rec * (.6 + MAP.hash(S.day, i, 13) * .8));
      t.cases = Math.max(0, t.cases + n - rc); newT += n; recT += rc;
      t.mood = clamp(Math.round(t.mood + (sm.stock < 10 ? -1 : 0) + (n > 3 ? -1 : 0) + (S.trust > 60 && MAP.hash(S.day, i, 17) < .2 ? 1 : 0)));
    });
    sm.newT = newT; sm.rec += recT;
    // 对民心的影响
    var uh = unhoused();
    var WU = ['等待安置的人太多', 'Too many people waiting for housing'], WS = ['物资不到 10 天', 'Supplies under 10 days'], WS3 = ['物资快用完', 'Supplies almost gone'], WC = ['新增病例多', 'Many new cases'], WOK = ['局势平稳', 'Things are steady'];
    if (uh > 300) { nudge('panic', (uh - 300) / 500 + .2, WU); nudge('trust', -(uh - 300) / 900 - .1, WU); }
    if (sm.stock < 10) nudge('panic', .8, WS); if (sm.stock < 3) { nudge('panic', 1.5, WS3); nudge('trust', -1.5, WS3); }
    if (newT > 12) nudge('panic', newT / 30, WC); else if (S.panic > 20 && sm.stock >= 10 && uh <= 300) nudge('panic', -.4, WOK);
    if (L.presser) nudge('panic', -.2, ['每日发布会', 'Daily briefing']);
    S.facilities.forEach(function (f) {
      var b = f.done && bdefOf(f.b); if (!b || !b.run) return;
      if (b.run.daily) Object.keys(b.run.daily).forEach(function (k) { nudge(k, b.run.daily[k], f.name); });
      if (b.run.partner && PW.indexOf(f.fund) >= 0) nudge(f.fund, b.run.partner, f.name);
    });
    if (wd === 1) S.staff.vol += runSum('vol');
  }
  var STAGE = [['放线', 'Staking'], ['场地平整', 'Grading'], ['基础', 'Foundation'], ['主体施工', 'Framing'], ['收尾', 'Finishing']];
  var CSTAGE = [['清场', 'Clearing out'], ['清场', 'Clearing out'], ['改造', 'Refitting'], ['改造', 'Refitting'], ['验收', 'Inspection']];
  // ---------- 人手 · 昼夜 ----------
  function isNight() { return S.hour >= 19 || S.hour < 6; }
  // 排班：白班 06–19 全体县雇员 + 志愿者；夜班 19–06 只有值班的三成县雇员，志愿者不上夜班。
  // 设施白天按满员运营，夜里留一半值守；外勤队算在白班里。周末和节假日县雇员半数到岗，勾选“周末全员加班”才满员（付加班费）。
  // 条例“每周 50 小时”：县雇员人手 +25%。
  function offDay() { return !!holiday() || [0, 6].indexOf(S.date.getDay()) >= 0; }
  function opsBase() { return S.facilities.reduce(function (a, f) { var b = bdefOf(f.b); return a + (f.done && b ? b.ops || 0 : 0); }, 0); }
  function opsStaff(night) { if (night === undefined) night = isNight(); return night ? Math.ceil(opsBase() * .5) : opsBase() + S.teams.length * 4; }
  function dayStaff() { return Math.round(S.staff.county * (offDay() && !S.staff.wk ? .5 : 1) * (S.laws.hours ? 1.25 : 1)) + Math.round(S.staff.vol); }
  function nightStaff() { return Math.round(S.staff.county * .3 * (S.laws.hours ? 1.25 : 1)); }
  function staffTotal(night) { if (night === undefined) night = isNight(); return night ? nightStaff() : dayStaff(); }
  // ---------- 日历 ----------
  var HOL = { '2009-11-11': ['退伍军人节', 'Veterans Day'], '2009-11-26': ['感恩节', 'Thanksgiving'], '2009-11-27': ['感恩节次日', 'Day after Thanksgiving'], '2009-12-25': ['圣诞节', 'Christmas Day'], '2010-01-01': ['元旦', "New Year's Day"] };
  function holiday() { return HOL[ymdOf(S.date)]; }
  function nextHoliday() { var t = ymdOf(S.date), k = Object.keys(HOL).filter(function (d) { return d > t; })[0]; return k ? [k, HOL[k]] : null; }
  // ---------- 外勤队 · 贸易 · 互助协议 ----------
  function teamsDay() {
    S.teams = S.teams.filter(function (t) {
      if (--t.days > 0) return true; var r = region[t.rid]; if (!r) return false;
      r.seen = true; r.date = ymdOf(S.date); S.sim.stock = Math.min(stockMax(), S.sim.stock + 1);
      notice(L('外勤队从' + r.zh + '回来：情况已更新，带回 1 天物资。', 'Field team back from ' + r.en + ': report updated, 1 day of supplies brought back.')); FOG.dirty(); return false;
    });
    if (S.date.getDay() === 1) Object.keys(S.aid).forEach(function () { S.sim.stock = Math.min(stockMax(), S.sim.stock + .6); S.funds.county -= 8; S.econ.wk.exp += 8; });
  }
  // ---------- 报纸 ----------
  var PAPERS = { wmi: ['怀特山独立报', 'White Mountain Independent'], tn: ['论坛新闻报', 'The Tribune-News'], nho: ['纳瓦霍-霍皮观察家报', 'Navajo-Hopi Observer'] };
  function headline(paper) {
    var uh = unhoused(), sm = S.sim, hol = nextHoliday(), c = [], done = S.facilities.filter(function (f) { return f.done && f.got === undefined; })[0];
    if (done) { done.got = S.day; c.push([[done.name[0] + '投入使用', done.name[1] + ' opens'], 1]); }
    if (uh > 300) c.push([[uh + ' 人仍在等安置，县里说拖车还在路上', uh + ' still waiting for housing; county says trailers are coming'], -1]);
    if (sm.stock < 10) c.push([['物资只够 ' + Math.round(sm.stock) + ' 天，超市限购瓶装水', 'Supplies down to ' + Math.round(sm.stock) + ' days; stores limit bottled water'], -1]);
    if (sm.newT > 12) c.push([['新增病例上升，诊所排队到停车场', 'New cases rise; clinic line reaches the parking lot'], -1]);
    if (S.flags.adem_cmd) c.push([['州应急管理局联络官接手县应急行动中心', 'ADEM liaison takes over county EOC'], -1]);
    if (paper === 'nho') c.push([['窗岩：族议会讨论保留地边界的检查站', 'Window Rock: council debates checkpoints at the reservation line'], 0]);
    if (paper === 'wmi') c.push([['肖洛商会：感恩节前客流比去年少', 'Show Low chamber: pre-holiday shoppers down from last year'], 0]);
    if (paper === 'tn') c.push([['霍尔布鲁克镇议会延期讨论水费', 'Holbrook council puts off water rate talks'], 0]);
    if (hol) c.push([[hol[1][0] + '活动照常举行，镇上募集罐头', hol[1][0] + ' events go ahead; towns collect canned food'], 1]);
    c.push([['高中橄榄球周五晚照常比赛', 'High school football goes ahead Friday night'], 1]);
    var last = S.press.filter(function (n) { return n.p === paper; })[0], k = ['wmi', 'tn', 'nho'].indexOf(paper), pick = c[k % c.length];
    if (last && pick[0][0] === last.t[0]) pick = c[(k + 1) % c.length];
    return pick;
  }
  function LA2(p, i) { return p[i] || p[0]; }
  function pressDay() {
    var wd = S.date.getDay(), list = []; if (wd === 2 || wd === 5) list.push('wmi'); if (wd === 3) list.push('tn', 'nho');
    list.forEach(function (k) { var h = headline(k); S.press.unshift({ p: k, d: ymdOf(S.date), t: h[0] }); var wp = ['报道：' + PAPERS[k][0], 'Coverage: ' + PAPERS[k][1]]; if (h[1] < 0) nudge('panic', .4, wp); else nudge('trust', .3, wp); });
    S.press = S.press.slice(0, 6);
  }
  function crewFree() { return Math.max(0, staffTotal() - opsStaff()); }
  function crewPlan() { // 按开工顺序分配施工人手；夜里不开加班就全部停工
    var free = crewFree(), night = isNight();
    S.facilities.forEach(function (f) { if (f.done) return; var c = (bdefOf(f.b) || {}).crew || 3; f.wait = night && !S.staff.ot ? 'night' : (free >= c ? '' : 'crew'); if (!f.wait) free -= c; });
  }
  function otCost() { return S.facilities.reduce(function (a, f) { return a + (!f.done && !f.wait ? (bdefOf(f.b) || {}).crew || 3 : 0); }, 0) * .053 * Math.max(.4, 1 - runSum('otCut')); } // 加班费约 $53/人·小时（含 1.5 倍）
  function calDay() {
    var h = holiday(); if (h) { notice(L('今天是' + h[0] + '，县政府休息，员工只有一半到岗。', 'Today is ' + h[1] + '. County offices are closed; half the staff is in.')); nudge('trust', .5); }
    var t = ymdOf(S.date); if (t >= '2009-11-24' && t <= '2009-11-29') S.sim.arr += 6; // 感恩节前后 I-40 车流多
  }
  function staffDay() {
    var s = S.staff; s.train = s.train.filter(function (t) { if (--t.days > 0) return true; s.vol += t.n; notice(L('社区应急队培训结业：志愿者 +', 'CERT class graduates: volunteers +') + t.n); return false; });
    if (S.trust < 40) s.vol = Math.max(0, s.vol - .3); else if (S.trust > 65) s.vol += .1;
    if (opsStaff(false) > staffTotal(false)) { nudge('trust', -.3, ['人手不够', 'Short of staff']); }
  }
  function buildHour() {
    var ch = false; crewPlan();
    if (isNight() && S.staff.ot) { var oc = otCost(); S.funds.county -= oc; S.econ.wk.exp += oc; }
    if (!isNight() && offDay() && S.staff.wk) { var wc = S.staff.county * .5 * .053; S.funds.county -= wc; S.econ.wk.exp += wc; }   // 周末加班：另一半县雇员按 $53/小时
    S.facilities.forEach(function (f) {
      if (f.done || f.wait) return; var bd = bdefOf(f.b), days = f.days || (bd && bd.days) || 2, k0 = MAP.stageKey(f);
      f.progress = Math.min(1, (f.progress || 0) + 1 / (days * 24)); f.eta = Math.ceil((1 - f.progress) * days);
      if (f.progress >= 1) { f.done = true; onBuilt(f); }
      if (MAP.stageKey(f) !== k0) { MAP.invalidate(f.ll); ch = true; }
    });
    if (ch) { syncFac(); draw(); if (S.tab === 'build') render(); }
  }
  function stageName(f) { if (f.wait === 'night') return L('夜间停工', 'Stopped for the night'); if (f.wait === 'crew') return L('等人手', 'Waiting for crew'); return LA((f.conv ? CSTAGE : STAGE)[MAP.stageOf(f.progress || 0)]); }
  function onBuilt(f) {
    var b = bdefOf(f.b) || {}, o = b.onBuilt || {}, ap = {};
    Object.keys(o).forEach(function (k) { if (k === 'stock') S.sim.stock = Math.min(stockMax(), S.sim.stock + o[k]); else ap[k] = o[k]; });
    if (Object.keys(ap).length) apply(ap, f.name);
    var km = b.run && (b.run.reveal || b.run.sight); if (km) D.regions.forEach(function (r) { var c = COUNTY[r.county]; if (c && !r.seen && Math.hypot((c.c[0] - f.ll[0]) * 91, (c.c[1] - f.ll[1]) * 111) < km) r.seen = true; });
    FOG.dirty();
  }
  function checkEnd() {
    if (S.sim.over) return; var e = null;
    if (S.trust <= 0) e = { icon: 'err', t: ['纳瓦霍县监事会召开特别会议', 'Navajo County Board of Supervisors holds a special meeting'], b: ['监事会通过决议，免去你的县应急管理主任职务，由副主任暂代。', 'The board votes to remove you as county emergency management director. Your deputy takes over.'] };
    else if (S.panic >= 100 && stLead() === 'sec') e = { icon: 'err', t: ['州应急委员会派员进驻县应急行动中心', 'State Emergency Council sends a team into the county EOC'], b: ['委员会在州长缺席的情况下宣布纳瓦霍县进入州紧急状态，派出的工作组接管县里的资金审批和安置工作。', 'With the governor absent, the council declares a state emergency in Navajo County. Its team takes over county spending approval and housing.'] };
    else if (S.panic >= 100 && stLead() === 'adem') e = { icon: 'err', t: ['应急管理局接管县应急行动中心', 'ADEM takes over the county EOC'], b: ['应急管理局依据代理州长签署的授权，直接指挥县应急行动中心。县监事会的决议改为报备。', "ADEM takes direct command of the county EOC under the acting governor's authorization. Board resolutions now only need to be filed with it."] };
    else if (S.panic >= 100) e = { icon: 'err', t: ['州应急管理局接管县应急行动中心', 'State takes over the county EOC'], b: ['州长依据《亚利桑那州修订法规》第 26-303 条宣布纳瓦霍县进入州紧急状态，县应急行动中心改由亚利桑那州应急管理局指挥。', 'The governor declares a state of emergency in Navajo County under A.R.S. § 26-303. The Arizona Division of Emergency Management takes command of the county EOC.'] };
    else if (ymdOf(S.date) === '2010-01-01') e = { icon: 'info', t: ['2009 年结束', 'End of 2009'], b: [{ gov: '你撑过了 2009 年。州长办公室仍在主导州里的应急工作。', sec: '你撑过了 2009 年。州里的应急拨款现在要先经过委员会。', adem: '你撑过了 2009 年。县里的应急行动现在要向州应急管理局报备。' }[stLead()], { gov: "You made it through 2009. The governor's office still leads the state response.", sec: 'You made it through 2009. State emergency money now goes through the council first.', adem: 'You made it through 2009. County operations now report to ADEM.' }[stLead()]], go: true };
    if (!e) return;
    S.sim.over = !e.go; S.speed = 0;
    var st = L('信任 ' + S.trust + ' · 恐慌 ' + S.panic + ' · 现有病例 ' + totalCases() + ' · 外来人员 ' + S.sim.arr.toLocaleString() + ' · 等待安置 ' + unhoused() + ' · 物资 ' + Math.round(S.sim.stock) + ' 天', 'Trust ' + S.trust + ' · Panic ' + S.panic + ' · Active cases ' + totalCases() + ' · Arrivals ' + S.sim.arr.toLocaleString() + ' · Unhoused ' + unhoused() + ' · Supplies ' + Math.round(S.sim.stock) + ' days');
    taskDialog({ icon: e.icon, title: LA(e.t), body: LA(e.b) + '<p style="color:#555;margin-top:8px">' + st + '</p>', links: (e.go ? [{ attr: 'data-endc="1"', t: L('继续', 'Keep going') }] : []).concat([{ attr: 'data-endr="1"', t: L('重新开始', 'Start over') }]) });
  }
  function shortage() { return Math.max(0, (12 - S.sim.stock) / 24); }
  function econDay() {
    var ec = S.econ, inn = 0, out = 0;
    E.rev.forEach(function (r) { inn += revWk(r) / 7; }); E.exp.forEach(function (x) { out += x.wk / 7; });
    S.funds.county += inn - out; ec.wk.rev += inn; ec.wk.exp += out;
    ec.accr += ec.lgip * E.lgipRate / 365;
    // 有周开支的条例（雇纸厂工人做流调每周 $40K）：每周一扣（签署当天已扣第一周）
    if (S.date.getDay() === 1) D.laws.forEach(function (l) { if (l.weekly && S.laws[l.id]) { S.funds.county += l.weekly; ec.wk.exp -= l.weekly; } });
    if (S.funds.county < 0) { var w = -S.funds.county * .02 / 365; S.funds.county -= w; ec.wk.exp += w; if (S.date.getDay() === 1) apply({ trust: -1 }, ['县账户透支', 'County overdrawn']); }
    ec.loans.forEach(function (l) { if (l.rate) { var i = l.bal * l.rate / 365; S.funds.county -= i; ec.wk.exp += i; } });
    ec.pending = ec.pending.filter(function (q) { if (--q.days > 0) return true; var d = loanDef(q.id); S.funds.county += q.amt; if (!d.grant) ec.loans.push({ id: q.id, bal: q.amt, rate: d.rate, due: d.due, term: d.term }); else ec.used[q.id] = true; if (d.id === 'interfund') ec.flood -= q.amt; notice(L('到账：', 'Received: ') + LA([d.zh, d.en]) + ' ' + fmtK(q.amt)); return false; });
    var tmr = new Date(S.date.getTime() + 864e5); if (tmr.getDate() === 1) { ec.lgip += ec.accr; ec.accr = 0; }
    if (S.date.getDay() === 0) { ec.last = { rev: ec.wk.rev, exp: ec.wk.exp }; ec.wk = { rev: 0, exp: 0 }; }
  }
  function notice(html) { $('#nview').hidden = false; $('#ntext').innerHTML = html; $('#notice').hidden = false; }
  function loanDef(id) { return E.loans.filter(function (l) { return l.id === id; })[0]; }
  function tabBank() {
    var ec = S.econ, owed = 0; ec.loans.forEach(function (l) { owed += l.bal; });
    var rin = 0, rout = 0; E.rev.forEach(function (r) { rin += revWk(r); }); E.exp.forEach(function (x) { rout += x.wk; });
    var h = sect(L('县一般基金', 'County General Fund'), '<span>' + L('单位：千美元', 'Thousands USD') + '</span>') +
      '<div class="stats"><div>' + L('支票账户', 'Checking') + '<b' + (S.funds.county < 0 ? ' style="color:#c00"' : '') + '>' + fmtK(S.funds.county) + '</b></div><div>' + L('州库投资池', 'State LGIP') + '<b>' + fmtK(ec.lgip) + '</b></div><div>' + L('新增借款', 'New borrowing') + '<b>' + fmtK(owed) + '</b></div></div>' +
      '<div class="atmcall"><img src="icons/bank32.png" width="32" height="32" alt=""><div><div class="t">' + L('存取款', 'Deposit & withdraw') + '</div><div class="s">' + L('投资池年收益 0.25%，每月 1 日计入', 'Pool yield 0.25% a year, credited on the 1st') + '</div></div><button class="wb7" id="openatm">' + L('打开取款机…', 'Open ATM…') + '</button></div></div>';
    h += sect(L('每周收支', 'Weekly budget'), '<span>' + L('2010 财年', 'FY2010') + '</span>') + '<table class="ledger">';
    E.rev.forEach(function (r) { var w = revWk(r); h += '<tr><td>' + L(r.zh, r.en) + (w !== r.wk ? ' <span class="tag">' + L('物业税到期', 'tax due') + '</span>' : '') + '</td><td class="pos">+' + w + '</td></tr>'; });
    E.exp.forEach(function (x) { h += '<tr><td>' + L(x.zh, x.en) + '</td><td>−' + x.wk + '</td></tr>'; });
    h += '<tr class="sum"><td>' + L('本周净额', 'Net this week') + '</td><td class="' + (rin - rout >= 0 ? 'pos' : 'neg') + '">' + (rin - rout >= 0 ? '+' : '−') + Math.abs(rin - rout) + '</td></tr></table></div>';
    h += sect(L('借款与拨款', 'Borrowing & grants'));
    E.loans.forEach(function (l) {
      var pend = ec.pending.filter(function (q) { return q.id === l.id; })[0], taken = ec.loans.some(function (x) { return x.id === l.id; }) || ec.used[l.id];
      var act = l.auto ? '<span class="s">' + L('自动', 'Automatic') + '</span>' : l.vote ? '<span class="s">' + L('需公投', 'Needs a vote') + '</span>' : pend ? '<span class="s">' + L('还要 ' + pend.days + ' 天', pend.days + ' days') + '</span>' : taken && (l.once || l.id !== 'pro') ? '<span class="signed">' + L('已到账', 'Received') + '</span>' : '<button class="wb7" data-loan="' + l.id + '">' + (l.grant ? L('申请', 'Apply') : L('借款…', 'Borrow…')) + '</button>';
      h += '<div class="row ri">' + ico(l.icon) + '<div><div class="t">' + L(l.zh, l.en) + (l.max ? ' <span class="s">' + L('最多 ', 'up to ') + fmtK(l.max) + '</span>' : '') + '</div><div class="s">' + LA(l.d) + '</div></div><div class="act">' + act + '</div></div>';
    });
    h += '</div>' + sect(L('未偿债务', 'Outstanding debt'));
    E.debt.concat(ec.loans.map(function (l) { var d = loanDef(l.id); return { zh: d.zh, en: d.en, bal: l.bal, rate: (l.rate * 100).toFixed(2).replace(/0$/, '') + '%' }; })).forEach(function (d) { h += '<div class="row"><div class="t">' + L(d.zh, d.en) + '</div><div class="s">' + fmtK(d.bal) + ' · ' + d.rate + '</div></div>'; });
    var s = shortage();
    h += '</div>' + sect(L('本地物价', 'Local prices'), '<span>' + L('2009 年 10 月基准', 'Oct 2009 base') + '</span>') + '<table class="ledger">';
    E.prices.forEach(function (p) { var v = p.p * (1 + p.k * s), up = v / p.p - 1; h += '<tr><td>' + L(p.zh, p.en) + ' <span class="s">/' + LA(p.u) + '</span></td><td>$' + v.toFixed(2) + (up > .005 ? ' <span class="neg">+' + Math.round(up * 100) + '%</span>' : '') + '</td></tr>'; });
    return h + '</table></div>';
  }
  function loanDialog(id) {
    var l = loanDef(id), max = l.id === 'interfund' ? Math.min(l.max, Math.floor(S.econ.flood / 2)) : l.max;
    taskDialog({ icon: l.grant ? 'info' : 'q', title: L(l.zh, l.en), body: LA(l.d) + (l.grant ? '' : '<div class="amt">' + L('金额', 'Amount') + ' <input id="lamt" type="number" min="50" step="50" max="' + max + '" value="' + Math.min(max, 1000) + '"> K <span class="s">' + L('最多 ', 'max ') + fmtK(max) + '</span></div>'),
      links: [{ attr: 'data-lgo="' + id + '"', t: l.grant ? L('提交申请', 'Submit application') : L('提交监事会', 'Send to the Board'), n: L((l.days || 0) + ' 天后到账', 'Funds in ' + (l.days || 0) + ' days') }, { attr: 'data-lno="1"', t: L('取消', 'Cancel') }],
      foot: l.grant ? null : L('借款计入未偿债务，利息每日从支票账户扣除。', 'Interest is charged to checking daily.'), footIcon: 'info' });
  }
  // ATM window — 2009 款取款机：屏幕菜单 + 屏幕两侧实体键 + 不锈钢密码键盘 + 凭条
  var atm = { st: 'main', mode: 'in', entry: '', msg: '', receipt: [] };
  var HEAD = function () { return T('纳瓦霍县司库', 'NAVAJO COUNTY TREASURER'); };
  function atmSpec() {
    var s = { head: HEAD(), L: [], R: [] }, ent = atm.entry ? '$' + (+atm.entry).toLocaleString('en-US') + 'K' : '$_K';
    if (atm.st === 'main') { s.title = T('请选择交易', 'PLEASE SELECT A TRANSACTION'); s.L = [T('存入投资池', 'DEPOSIT TO POOL'), T('取回支票账户', 'WITHDRAW TO CHECKING')]; s.R = [T('余额查询', 'BALANCE INQUIRY'), '', '', T('退出', 'EXIT')]; s.foot = T('州库地方政府投资池 · 年收益 0.25%', 'STATE LGIP · 0.25% YIELD'); }
    else if (atm.st === 'amt') { s.title = atm.mode === 'in' ? T('存入投资池', 'DEPOSIT TO POOL') : T('取回支票账户', 'WITHDRAW TO CHECKING'); s.lines = [T('请输入金额（千美元）', 'ENTER AMOUNT IN THOUSANDS')]; s.entry = ent; s.L = ['', '', '$100K', '$500K']; s.R = ['', '', '$1,000K', '$2,000K']; s.foot = atm.msg || T('输入后按 ENTER 确认', 'PRESS ENTER WHEN DONE'); }
    else if (atm.st === 'busy') { s.title = T('交易处理中', 'PROCESSING'); s.lines = [T('请稍候', 'PLEASE WAIT')]; s.busy = true; }
    else if (atm.st === 'done') { s.title = atm.mode === 'out' ? T('请取走现金', 'PLEASE TAKE YOUR CASH') : T('存款已受理', 'DEPOSIT ACCEPTED'); s.lines = [T('请取走凭条', 'PLEASE TAKE YOUR RECEIPT')]; s.L = ['', '', '', T('其他交易', 'ANOTHER TRANSACTION')]; s.R = ['', '', '', T('完成', 'DONE')]; }
    else if (atm.st === 'bal') { s.title = T('账户余额', 'ACCOUNT BALANCES'); s.lines = [T('支票账户 ', 'CHECKING ') + fmtK(S.funds.county), T('投资池 ', 'POOL ') + fmtK(S.econ.lgip), { t: T('本月应计利息 ', 'ACCRUED ') + fmtK(S.econ.accr), c: '#cfe0ff' }]; s.L = ['', '', '', T('其他交易', 'ANOTHER TRANSACTION')]; s.R = ['', '', '', T('完成', 'DONE')]; }
    return s;
  }
  function atmDraw() { if (window.ATM3D) ATM3D.drawScreen(atmSpec()); atmSide(); }
  function receipt(lines) {
    var d = S.date, ts = (d.getMonth() + 1) + '/' + d.getDate() + '/09 ' + ('0' + S.hour).slice(-2) + ':00';
    atm.receipt = ['NAVAJO COUNTY TREASURER', '100 E CARTER DR', 'HOLBROOK AZ 86025', '', ts + '  TERM 0117', '--------------------------------'].concat(lines, ['--------------------------------', 'CHECKING  ' + fmtK(S.funds.county).padStart(16), 'LGIP POOL ' + fmtK(S.econ.lgip).padStart(16), '', 'THANK YOU']);
  }
  function atmSide() {
    var inn = atm.mode === 'in', busy = atm.st === 'busy', log = (S.econ.atmlog || []).slice(0, 3);
    var tile = function (k, zh, en, v, sub) { var src = (k === 'chk') === inn; return '<div class="at-tile' + (src ? ' src' : ' dst') + '"><div class="at-k">' + L(zh, en) + '<span class="at-role">' + (src ? L('转出', 'From') : L('转入', 'To')) + '</span></div><div class="at-v">' + fmtK(v) + '</div><div class="at-s">' + sub + '</div></div>'; };
    $('#atmside').innerHTML =
      '<div class="at-head"><img src="icons/bank32.png" width="32" height="32" alt=""><div><div class="at-t">' + L('县司库 · 资金调度', 'County Treasurer · Transfers') + '</div><div class="at-st">' + L('在县支票账户和州库地方政府投资池之间划转', 'Move money between county checking and the state LGIP') + '</div></div></div>' +
      '<div class="at-pane">' +
        '<div class="at-row">' + tile('chk', '支票账户', 'Checking', S.funds.county, L('县一般基金', 'General fund')) +
          '<button class="at-swap' + (inn ? '' : ' rev') + '" data-atsw="1"><span>➜</span><i>' + L('换向', 'Swap') + '</i></button>' +
          tile('pool', '州库投资池', 'State pool', S.econ.lgip, L('年收益 0.25% · 本月应计 ', '0.25% yield · accrued ') + fmtK(S.econ.accr)) + '</div>' +
        '<div class="at-lbl">' + L('金额', 'Amount') + '</div>' +
        '<div class="at-amt"><span>$</span><input id="aamt" inputmode="numeric" maxlength="5" value="' + atm.entry + '" placeholder="0"' + (busy ? ' disabled' : '') + '><span>K</span></div>' +
        '<div class="at-quick">' + [100, 500, 1000, 2000].map(function (v) { return '<button class="wb7' + (+atm.entry === v ? ' on' : '') + '" data-aq="' + v + '">' + fmtK(v) + '</button>'; }).join('') + '</div>' +
        '<div class="at-lbl">' + L('最近交易', 'Recent') + '</div>' +
        '<div class="at-log">' + (log.length ? log.map(function (r) { return '<div><span>' + r.d + '</span><span>' + LA(r.t) + '</span><b class="' + (r.in ? 'pos' : 'neg') + '">' + fmtK(r.v) + '</b></div>'; }).join('') : '<div class="at-none">' + L('还没有交易', 'No transactions yet') + '</div>') + '</div>' +
      '</div>' +
      '<div class="at-foot"><span id="atmmsg">' + (atm.msg ? atm.msg : '') + '</span><button class="wb7 def" id="atmgo"' + (busy ? ' disabled' : '') + '>' + (inn ? L('存入', 'Deposit') : L('取回', 'Withdraw')) + '</button><button class="wb7" id="atmx2">' + L('关闭', 'Close') + '</button></div>';
  }
  function atmKey(k) {
    if (atm.st === 'busy') return;
    if (k === 'CANCEL') { atm.st = 'main'; atm.entry = ''; atm.msg = ''; return atmDraw(); }
    if (atm.st === 'main') {
      if (k === 'L1' || k === 'L2') { atm.mode = k === 'L1' ? 'in' : 'out'; atm.st = 'amt'; atm.entry = ''; atm.msg = ''; if (window.ATM3D) ATM3D.clearPile(); }
      else if (k === 'R1') { atm.st = 'bal'; }
      else if (k === 'R4') { $('#atmwrap').hidden = true; return; }
      return atmDraw();
    }
    if (atm.st === 'done' || atm.st === 'bal') { if (k === 'L4') atm.st = 'main'; else if (k === 'R4' || k === 'ENTER') { atm.st = 'main'; $('#atmwrap').hidden = true; } return atmDraw(); }
    if (atm.st === 'amt') {
      var q = { L3: 100, L4: 500, R3: 1000, R4: 2000 }[k];
      if (q) atm.entry = String(q);
      else if (/^\d+$/.test(k)) { if ((atm.entry + k).length <= 5) atm.entry = (atm.entry + k).replace(/^0+/, ''); }
      else if (k === 'CLEAR') atm.entry = '';
      else if (k === 'ENTER') return atmDo();
      atm.msg = ''; return atmDraw();
    }
  }
  function atmDo() {
    var v = +atm.entry || 0;
    if (v <= 0) { atm.msg = T('请输入金额', 'Enter an amount'); return atmDraw(); }
    var from = atm.mode === 'in' ? S.funds.county : S.econ.lgip;
    if (v <= 0) return;
    if (v > from) { atm.st = 'amt'; atm.msg = T('余额不足', 'Insufficient funds'); return atmDraw(); }
    if (atm.mode === 'in') { S.funds.county -= v; S.econ.lgip += v; } else { S.econ.lgip -= v; S.funds.county += v; }
    atm.st = 'busy'; atmDraw(); render();
    setTimeout(function () {
      ATM3D.focus('slot');
      ATM3D.play(atm.mode, Math.ceil(v / 100), function () { setTimeout(function () { ATM3D.focus('screen'); }, 1200); atm.st = 'done'; S.econ.atmlog = S.econ.atmlog || []; S.econ.atmlog.unshift({ d: (S.date.getMonth() + 1) + '/' + S.date.getDate(), t: atm.mode === 'in' ? ['存入投资池', 'To pool'] : ['取回支票账户', 'To checking'], v: v, in: atm.mode === 'out' }); atm.entry = ''; atmDraw(); });
    }, 700);
  }
  function openAtm() {
    $('#atmwrap').hidden = false; atm.st = 'main'; atm.entry = ''; atmSide();
    var go = function () { ATM3D.mount($('#atmview')); ATM3D.setKeyHandler(atmKey); atmDraw(); };
    if (window.ATM3D) go(); else { var s = document.createElement('script'); s.type = 'module'; s.src = 'bank/atm3d.js'; s.onload = go; document.head.appendChild(s); }
  }
  document.addEventListener('input', function (e) { if (e.target.id !== 'aamt') return; var v = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 5); e.target.value = v; atm.entry = v; if (atm.st !== 'amt') atm.st = 'amt'; atm.msg = ''; if (window.ATM3D) ATM3D.drawScreen(atmSpec()); });
  document.addEventListener('keydown', function (e) {
    if ($('#atmwrap').hidden) return;
    if (e.target.id === 'aamt') { if (e.key === 'Enter') atmDo(); return; } var k = e.key;
    if (/^\d$/.test(k)) atmKey(k); else if (k === 'Enter') atmKey('ENTER'); else if (k === 'Backspace') atmKey('CLEAR'); else if (k === 'Escape') atmKey('CANCEL');
  });
  function tabMail() { return ''; }


  // ---------- map view ----------
  var cv = $('#map'), cx = cv.getContext('2d'), pane = $('#mappane'), W = 0, H = 0, DPR = window.devicePixelRatio || 1;
  var V = { z: 8, x: 0, y: 0 }, mode = 'map', layers = { fac: true, cases: true, res: true, fog: true };
  function center(lon, lat, z) { V.z = z; V.x = MAP.wx(lon, z); V.y = MAP.wy(lat, z); }
  // 墨卡托坐标按缩放级 0 缓存在点数组上（坐标是常量数组），每帧只做乘法，不再对几万个顶点算 log/sin
  function px(ll) { var m = ll._m || (ll._m = [MAP.wx(ll[0], 0), MAP.wy(ll[1], 0)]), k = Math.pow(2, V.z); return [m[0] * k - V.x + W / 2, m[1] * k - V.y + H / 2]; }
  function unpx(x, y) { return [MAP.xlon(V.x - W / 2 + x, V.z), MAP.ylat(V.y - H / 2 + y, V.z)]; }
  function resize() { W = pane.clientWidth; H = pane.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; FOG.resize(W, H, DPR); draw(); }
  var COUNTY = {}; MAP.R.counties.forEach(function (c) { COUNTY[c.n] = c; });
  // 迷雾边界不沿县界的直线、也没有直角：所有县界拆成约 1 公里一个点的共享网，在网上做平滑（相邻的县共用同一批点，
  // 拼起来不会有缝），把拐角磨圆，再按地面位置用几层噪声推开（大的弯约 20 公里，小的到 150 米）。可见区和“没有影像”的灰格用同一套形状。
  function wn(x, y, s) { var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = MAP.hash(xi, yi, s), b = MAP.hash(xi + 1, yi, s), c = MAP.hash(xi, yi + 1, s), d = MAP.hash(xi + 1, yi + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
  var WARP = [[150000, 22000], [64000, 15000], [28000, 7000], [12000, 2600], [5200, 1000], [2300, 400], [1000, 160]];
  function warpM(m) {
    var dx = 0, dy = 0;
    for (var i = 0; i < WARP.length; i++) { var l = WARP[i][0], a = WARP[i][1]; dx += (wn(m[0] / l, m[1] / l, 91 + i) - .5) * 2 * a; dy += (wn(m[0] / l + 37, m[1] / l, 131 + i) - .5) * 2 * a; }
    return [m[0] + dx, m[1] + dy];
  }
  var FOGNET = null;
  function fogNet() {
    if (FOGNET) return FOGNET;
    var pts = {}, list = [], key = function (p) { return Math.round(p[0] * 1e5) + ',' + Math.round(p[1] * 1e5); };
    function node(p) { var k = key(p), n = pts[k]; if (!n) { n = pts[k] = { m: MAP.ll2m(p[0], p[1]), nb: [] }; list.push(n); } return n; }
    function link(a, b) { if (a !== b && a.nb.indexOf(b) < 0) { a.nb.push(b); b.nb.push(a); } }
    var rings = {};
    MAP.R.counties.forEach(function (c) {
      rings[c.n] = c.p.map(function (r) {
        var out = [], last = r.length - 1; if (r[last][0] === r[0][0] && r[last][1] === r[0][1]) last--;
        for (var i = 0; i <= last; i++) {
          var a = r[i], b = r[i === last ? 0 : i + 1], km = Math.hypot((b[0] - a[0]) * 91.3, (b[1] - a[1]) * 110.5), n = Math.max(1, Math.ceil(km));
          for (var k = 0; k < n; k++) { var t = k / n, p = t ? [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] : a; out.push(node(i < last || k ? p : a)); }
        }
        for (var j = 0; j < out.length; j++) link(out[j], out[(j + 1) % out.length]);
        return out;
      });
    });
    for (var it = 0; it < 80; it++) {
      list.forEach(function (n) { var sx = n.m[0] * 2, sy = n.m[1] * 2; n.nb.forEach(function (q) { sx += q.m[0]; sy += q.m[1]; }); n.s = [sx / (2 + n.nb.length), sy / (2 + n.nb.length)]; });
      list.forEach(function (n) { n.m = n.s; });
    }
    list.forEach(function (n) { n.ll = MAP.m2ll(warpM(n.m)); });
    FOGNET = {};
    Object.keys(rings).forEach(function (k) { FOGNET[k] = rings[k].map(function (r) { return r.map(function (n) { return n.ll; }); }); });
    return FOGNET;
  }
  function fogRings(c) { return fogNet()[c.n]; }
  function fogVisible(g2) {
    g2.beginPath(); MAP.R.counties.forEach(function (c) { if (!seen(c.n)) return; fogRings(c).forEach(function (r) { r.forEach(function (p, i) { var q = px(p); i ? g2.lineTo(q[0], q[1]) : g2.moveTo(q[0], q[1]); }); g2.closePath(); }); }); g2.fill('nonzero'); g2.lineWidth = 3; g2.strokeStyle = '#fff'; g2.stroke();
    S.facilities.forEach(function (f) { var b = f.done && bdefOf(f.b), km = b && b.run && b.run.sight; if (!km) return; var q = px(f.ll), r = px([f.ll[0] + km / (111.32 * Math.cos(f.ll[1] * Math.PI / 180)), f.ll[1]])[0] - q[0]; g2.beginPath(); g2.arc(q[0], q[1], r, 0, 7); g2.fill(); });
  }
  FOG.init($('#fogcv'), { view: function () { return V; }, visible: fogVisible, tint: function () { if (mode === 'map') return null; var n = nightState(); return n.am ? n.am.c.map(function (v) { return v / 255; }) : null; } });
  var NAVAJO = COUNTY.Navajo;
  function seen(n) { if (n === 'Navajo') return true; var r = region[n]; return !!(r && r.seen); }
  function poly(rings, close) { cx.beginPath(); rings.forEach(function (r) { r.forEach(function (p, i) { var q = px(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); if (close) cx.closePath(); }); }
  function rrect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function label(x, y, zh, en, font, color, align, halo) {
    var t = LANG.mode() === 'en' ? en : zh; cx.font = font; cx.textAlign = align || 'center'; cx.lineJoin = 'round'; cx.lineWidth = 3; cx.strokeStyle = halo || 'rgba(255,255,255,.92)'; cx.fillStyle = color; cx.strokeText(t, x, y); cx.fillText(t, x, y);
    if (LANG.mode() === 'both' && en !== zh) { cx.font = '10px Arial'; cx.strokeText(en, x, y + 12); cx.fillText(en, x, y + 12); }
  }
  // ---------- 绘制调度 ----------
  // 全量重画（drawNow）很重：卫星图块、几千个顶点的县界和道路、标签、夜间灯光。
  // 拖动地图、放置建筑时的鼠标移动只把上一次全量画面（SNAP）平移后贴上去（drawQuick）；
  // 滚轮缩放先把 SNAP 按比例放大/缩小做 180 ms 动画，结束后再全量重画（同外壳 a2.js 的 quickDraw 思路）。
  var drawPending = false, needFull = false, SNAP = document.createElement('canvas'), SG = SNAP.getContext('2d'), snapV = null, ZA = null;
  function draw(quick) { if (!quick) needFull = true; if (drawPending) return; drawPending = true; requestAnimationFrame(function () { drawPending = false; if (ZA) return; var full = needFull || !canQuick(); needFull = false; if (full) drawNow(); else drawQuick(); }); }
  function canQuick() { return snapV && snapV.z === V.z && snapV.w === W && snapV.h === H && Math.abs(snapV.x - V.x) < W * .35 && Math.abs(snapV.y - V.y) < H * .35; }
  function saveSnap() {
    if (!cv.width || !cv.height) return;   // 游戏框隐藏时画布是 0×0
    if (SNAP.width !== cv.width || SNAP.height !== cv.height) { SNAP.width = cv.width; SNAP.height = cv.height; }
    SG.setTransform(1, 0, 0, 1, 0, 0); SG.clearRect(0, 0, SNAP.width, SNAP.height); SG.drawImage(cv, 0, 0);
    snapV = { x: V.x, y: V.y, z: V.z, w: W, h: H };
  }
  function blitSnap(s, ox, oy) { // s = 缩放倍数，ox/oy = SNAP 左上角在屏幕上的位置（CSS 像素）
    cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = fogPat(); cx.fillRect(0, 0, W, H);
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.imageSmoothingEnabled = true;
    cx.drawImage(SNAP, Math.round(ox * DPR), Math.round(oy * DPR), SNAP.width * s, SNAP.height * s);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function drawQuick() {
    blitSnap(1, snapV.x - V.x, snapV.y - V.y);
    if (S.placing && hover) ghost();
    scale(); knob();
  }
  // 缩放动画：从当前显示的 SNAP 变换插值到新视图下 SNAP 应在的位置
  function zoomAnim(nz, sx, sy) {
    if (!snapV || snapV.w !== W || snapV.h !== H) return false;
    var from = ZA ? ZA.cur : (snapV.z === V.z ? { s: 1, ox: snapV.x - V.x, oy: snapV.y - V.y } : null); if (!from) return false;
    var ll = unpx(sx, sy), k = Math.pow(2, nz - snapV.z);
    V.z = nz; V.x = MAP.wx(ll[0], nz) - sx + W / 2; V.y = MAP.wy(ll[1], nz) - sy + H / 2;
    var to = { s: k, ox: (snapV.x - W / 2) * k - V.x + W / 2, oy: (snapV.y - H / 2) * k - V.y + H / 2 };
    var running = !!ZA;
    ZA = { from: from, to: to, cur: from, t0: performance.now() };
    if (!running) requestAnimationFrame(zaStep);
    return true;
  }
  function zaStep() {
    var a = ZA; if (!a) return;
    var p = Math.min(1, (performance.now() - a.t0) / 180), e = 1 - (1 - p) * (1 - p);
    var s = a.from.s * Math.pow(a.to.s / a.from.s, e), r = Math.abs(a.to.s - a.from.s) > 1e-9 ? (s - a.from.s) / (a.to.s - a.from.s) : e;
    a.cur = { s: s, ox: a.from.ox + (a.to.ox - a.from.ox) * r, oy: a.from.oy + (a.to.oy - a.from.oy) * r };
    blitSnap(a.cur.s, a.cur.ox, a.cur.oy); scale(); knob();
    if (p < 1) { requestAnimationFrame(zaStep); return; }
    ZA = null; drawNow();
  }
  // 地图集在游戏后面看不见，让它的夜景/雪花动画停下（a3.js、fx.js 在 S.pending 为真时跳过；回到地图集时 render() 会清掉）
  function pauseAtlas() { try { if (top !== window && top.FNA && top.FNA.inGame && top.FNA.inGame() && top.S) top.S.pending = true; } catch (e) {} }
  var lastImgDate = '';
  function drawNow() {
    pauseAtlas();
    FOG.dirty();
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var sat = mode !== 'map';
    // base: fog everywhere
    fogTiles(0, 0, W, H);
    if (sat) satTiles(); else baseMap();
    // fog over unseen counties：所有没见过的县合成一条路径，裁剪一次
    // 反过来做：整屏先铺“没有影像”，再把看得见的地方（纳瓦霍县、已探明的县、设施视野）挖掉。
    // 原来是逐个给“没见过的县”铺灰，县界经过有机化变形后县与县之间会漏缝，州外和列表外的地方也没人盖，卫星图就从烟底下露出来。
    if (FGC.width !== cv.width || FGC.height !== cv.height) { FGC.width = cv.width; FGC.height = cv.height; }
    if (FGC.width && FGC.height) {
      FGG.setTransform(DPR, 0, 0, DPR, 0, 0); FGG.globalCompositeOperation = 'source-over'; FGG.clearRect(0, 0, W, H);
      FGG.fillStyle = fogPat(); FGG.fillRect(0, 0, W, H);
      FGG.globalCompositeOperation = 'destination-out'; FGG.fillStyle = '#000'; fogVisible(FGG); FGG.globalCompositeOperation = 'source-over';
      cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.drawImage(FGC, 0, 0); cx.restore();
    }
    if (sat) nightShade();
    if (!sat || mode === 'hyb') overlay(sat);
    saveSnap();
    if (S.placing && hover) ghost();
    scale(); knob();
    var t = sat ? L('影像 ©2009 DigitalGlobe, USDA Farm Service Agency - 影像日期：2007年6月', 'Imagery ©2009 DigitalGlobe, USDA Farm Service Agency - Imagery Date: Jun 2007') : L('地图数据 ©2009 Tele Atlas', 'Map data ©2009 Tele Atlas');
    if (t !== lastImgDate) { lastImgDate = t; $('#imgdate').innerHTML = t; }
  }
  // “没有影像”的灰格：预先画好一张 256 px 的图块，用图案平铺，一次 fillRect（原来每块两行字、每个没见过的县各重画一遍）
  var FOGT = { key: '' }, FGC = document.createElement('canvas'), FGG = FGC.getContext('2d');
  function fogPat() {
    var key = LANG.mode() + DPR;
    if (FOGT.key !== key) {
      var c = document.createElement('canvas'), s = Math.round(256 * DPR); c.width = c.height = s; var t = c.getContext('2d');
      t.scale(DPR, DPR); t.fillStyle = '#DCD9D3'; t.fillRect(0, 0, 256, 256);
      t.strokeStyle = '#CFCBC4'; t.lineWidth = 1; t.strokeRect(.5, .5, 256, 256);
      t.fillStyle = '#9C988F'; t.font = '11px Arial'; t.textAlign = 'center';
      t.fillText(T('很抱歉，此缩放级别下', 'We are sorry, but we don\'t'), 128, 120); t.fillText(T('该区域没有影像。', 'have imagery at this zoom level.'), 128, 135);
      FOGT = { key: key, pat: cx.createPattern(c, 'repeat') };
    }
    var ox = ((-V.x + W / 2) % 256 + 256) % 256, oy = ((-V.y + H / 2) % 256 + 256) % 256;
    if (FOGT.pat.setTransform) FOGT.pat.setTransform(new DOMMatrix([1 / DPR, 0, 0, 1 / DPR, ox, oy]));
    return FOGT.pat;
  }
  function fogTiles(x, y, w, h) { cx.fillStyle = fogPat(); cx.fillRect(x, y, w, h); }
  // 夜色：19 点到 6 点卫星图压暗，镇上的路灯和夜间施工的照明灯亮起；黄昏和清晨各一小时过渡
  // ---------- 昼夜（2026-11-22）：按霍尔布鲁克（北纬 34.90°、西经 110.16°，MST，亚利桑那不实行夏令时）的真实太阳高度角 ----------
  // 太阳位置用 NOAA 的简化公式；时间按分钟插值（两次整点结算之间按真实时间推进），不再每小时跳一次。
  // 色调：太阳高度 8° 以上是白天；3° 到 0° 偏暖橙；民用晨昏蒙影（0 到 −6°）偏粉、变暗；航海晨昏蒙影（−6 到 −12°）转蓝；之后是夜里的暗蓝并降饱和。
  var SUN_KEYS = [[8, [255, 255, 255], 0], [3, [250, 229, 202], .04], [0, [218, 168, 138], .08], [-3, [152, 120, 130], .16], [-6, [92, 86, 120], .26], [-10, [56, 62, 100], .33], [-14, [40, 46, 82], .38]];
  var lastBatch = (window.performance || Date).now();
  function hourF() { var now = (window.performance || Date).now(), f = S.speed ? Math.min(1, (now - lastBatch) / 1000) * S.speed : 0; return S.hour + f; }
  function sunElev(date, h) {
    var y0 = new Date(date.getFullYear(), 0, 1), doy = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - y0) / 864e5) + 1;
    var gm = 2 * Math.PI / 365 * (doy - 1 + (h - 12) / 24);
    var decl = .006918 - .399912 * Math.cos(gm) + .070257 * Math.sin(gm) - .006758 * Math.cos(2 * gm) + .000907 * Math.sin(2 * gm) - .002697 * Math.cos(3 * gm) + .00148 * Math.sin(3 * gm);
    var eqt = 229.18 * (.000075 + .001868 * Math.cos(gm) - .032077 * Math.sin(gm) - .014615 * Math.cos(2 * gm) - .040849 * Math.sin(2 * gm));
    var tst = h * 60 + eqt + 4 * -110.158 + 60 * 7, ha = (tst / 4 - 180) * Math.PI / 180, lat = 34.902 * Math.PI / 180;
    var cz = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
    return 90 - Math.acos(Math.max(-1, Math.min(1, cz))) * 180 / Math.PI;
  }
  function ambient(e) {
    if (e >= SUN_KEYS[0][0]) return null;
    for (var i = 1; i < SUN_KEYS.length; i++) if (e >= SUN_KEYS[i][0]) { var a = SUN_KEYS[i - 1], b = SUN_KEYS[i], t = (a[0] - e) / (a[0] - b[0]); t = t * t * (3 - 2 * t); return { c: a[1].map(function (v, j) { return Math.round(v + (b[1][j] - v) * t); }), d: a[2] + (b[2] - a[2]) * t }; }
    var L = SUN_KEYS[SUN_KEYS.length - 1]; return { c: L[1], d: L[2] };
  }
  function sstep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  // 路灯是光控的，太阳低于约 −1° 时陆续亮起；住宅灯光看钟点：傍晚到 22 点多，后半夜只剩少数，清晨 5–7 点又亮一些
  function lightsOn(e) { return sstep(2, -3.5, e); }
  function homeLevel(h) { h = ((h % 24) + 24) % 24; return h >= 16 && h < 22 ? 1 : h >= 22 ? 1 - .62 * sstep(22, 24, h) : h < 5 ? .38 - .16 * sstep(0, 3, h) : h < 7 ? .22 + .5 * sstep(5, 6, h) : .72 - .72 * sstep(7, 8, h); }
  function nightLevel() { var e = sunElev(S.date, S.hour); return e >= 8 ? 0 : e <= -14 ? 1 : sstep(8, -14, e); }   // 给其他逻辑用（整点）
  var IL = document.createElement('canvas'), ILG = IL.getContext('2d'), GLOW = {};
  function glowSprite(rgb) {
    if (GLOW[rgb]) return GLOW[rgb];
    var c = document.createElement('canvas'); c.width = c.height = 64; var t = c.getContext('2d'), gr = t.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + rgb + ',1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); t.fillStyle = gr; t.fillRect(0, 0, 64, 64);
    return (GLOW[rgb] = c);
  }
  function viewTiles() { var x0 = Math.floor((V.x - W / 2) / 256), y0 = Math.floor((V.y - H / 2) / 256), x1 = Math.floor((V.x + W / 2) / 256), y1 = Math.floor((V.y + H / 2) / 256), l = []; for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++) l.push([tx, ty, tx * 256 - V.x + W / 2, ty * 256 - V.y + H / 2]); return l; }
  var nightKey = '';
  function nightState() { var h = hourF(), e = sunElev(S.date, h), am = ambient(e); return { h: h, e: e, am: am, lon: lightsOn(e), hm: homeLevel(h) * lightsOn(e) }; }
  // 夜景：白天的卫星图 ×（环境光 + 烘焙好的路灯/住宅照度），再叠加灯具亮点。乘法让灯光照亮真实的地面：沥青被钠灯照成橙褐色，屋顶和院子的纹理都还在。
  function nightShade() {
    var n = nightState(); nightKey = n.am ? [n.am.c.join(','), Math.round(n.lon * 40), Math.round(n.hm * 25)].join('|') : 'day';
    if (!n.am) return;
    if (IL.width !== cv.width || IL.height !== cv.height) { IL.width = cv.width; IL.height = cv.height; }
    var g = ILG, tiles = V.z >= 9 && n.lon > .01 ? viewTiles() : [];
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = 'rgb(' + n.am.c.join(',') + ')'; g.fillRect(0, 0, IL.width, IL.height);
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true;
    tiles.forEach(function (t) { var L = MAP.light(V.z, t[0], t[1]); if (!L || L.empty) return; g.globalAlpha = n.lon; g.drawImage(L.st, t[2], t[3], 256, 256); if (n.hm > .01) { g.globalAlpha = n.hm; g.drawImage(L.hm, t[2], t[3], 256, 256); } });
    // 施工照明和建成设施的灯
    var m = MAP.mpp(V.z);
    S.facilities.forEach(function (f) { var q = px(f.ll), r, c, a; if (!f.done && !f.wait) { r = Math.max(3, 40 / m); c = '235,240,255'; a = .75; } else if (f.done) { r = Math.max(2, 22 / m); c = '255,200,130'; a = .55; } else return; g.globalAlpha = a * n.lon; g.drawImage(glowSprite(c), q[0] - r, q[1] - r, r * 2, r * 2); });
    // 灯光图块是在 satTiles() 之后才排进队列的；原来只有 satTiles 会启动生成，卫星图块齐了以后队列里只剩灯光图块却没人处理，下次重画又被 clearQueue 清掉，所以烘焙灯光一直不显示
    if (MAP.queueLen() && !pumpT) pumpT = setTimeout(function () { pumpT = 0; MAP.pump(6, redrawFull, 10); }, 0);
    if (!IL.width || !IL.height) return;
    cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.globalCompositeOperation = 'multiply'; cx.drawImage(IL, 0, 0);
    if (n.am.d > .01) { cx.globalCompositeOperation = 'saturation'; cx.globalAlpha = n.am.d; cx.fillStyle = '#808080'; cx.fillRect(0, 0, cv.width, cv.height); }
    cx.restore();
    if (!tiles.length) return;
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = n.lon;
    tiles.forEach(function (t) { var L = MAP.peekLight(V.z, t[0], t[1]); if (L && !L.empty) cx.drawImage(L.em, t[2], t[3], 256, 256); });
    cx.restore();
  }
  // 时间流动时，晨昏的颜色和灯光按分钟变化：状态变了才全量重画（白天、深夜不变时什么都不做）
  setInterval(function () {
    if (mode === 'map' || ZA || drag || document.hidden) return;
    var n = nightState(), k = n.am ? [n.am.c.join(','), Math.round(n.lon * 40), Math.round(n.hm * 25)].join('|') : 'day';
    if (k !== nightKey) draw();
  }, 150);
  function satTiles() {
    var x0 = Math.floor((V.x - W / 2) / 256), y0 = Math.floor((V.y - H / 2) / 256), x1 = Math.floor((V.x + W / 2) / 256), y1 = Math.floor((V.y + H / 2) / 256);
    MAP.clearQueue();
    var list = []; for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++) list.push([tx, ty]);
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2; list.sort(function (a, b) { return Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my); });
    cx.imageSmoothingEnabled = true;
    list.forEach(function (t) {
      var sx = t[0] * 256 - V.x + W / 2, sy = t[1] * 256 - V.y + H / 2, im = MAP.tile(V.z, t[0], t[1]);
      if (im) cx.drawImage(im, sx, sy, 256, 256); else if (!fallbackTile(t[0], t[1], sx, sy)) { cx.fillStyle = '#7d7466'; cx.fillRect(sx, sy, 256, 256); }
    });
    if (MAP.queueLen() && !pumpT) pumpT = setTimeout(function () { pumpT = 0; MAP.pump(6, redrawFull, 10); }, 0);
  }
  var pumpT = 0;
  function redrawFull() { draw(); }   // 图块做好后的回调会带参数，直接传 draw 会被当成 quick 重画，后面的灯光图块就再也排不上队
  // 新级别的图块还没做好时，先用上一级（放大）或下一级（缩小）已缓存的图块顶上，不再闪成空格
  function fallbackTile(tx, ty, sx, sy) {
    for (var dz = 1; dz <= 4 && V.z - dz >= 0; dz++) {
      var n = 1 << dz, im = MAP.peek(V.z - dz, Math.floor(tx / n), Math.floor(ty / n)); if (!im) continue;
      var sw = im.width / n, ix = ((tx % n) + n) % n, iy = ((ty % n) + n) % n;
      cx.drawImage(im, ix * sw, iy * sw, sw, sw, sx, sy, 256, 256); return true;
    }
    var kids = []; for (var k = 0; k < 4; k++) kids.push(MAP.peek(V.z + 1, tx * 2 + (k & 1), ty * 2 + (k >> 1)));
    if (!kids.some(Boolean)) return false;
    cx.fillStyle = '#7d7466'; cx.fillRect(sx, sy, 256, 256);
    kids.forEach(function (c, k) { if (c) cx.drawImage(c, sx + (k & 1) * 128, sy + (k >> 1) * 128, 128, 128); });
    return true;
  }
  var PLACE_COL = { '25': 1, '43': 1 };
  function baseMap() {
    var z = V.z, R = MAP.R;
    // seen land
    R.counties.forEach(function (c) { if (!seen(c.n)) return; poly(c.p, true); cx.fillStyle = '#F2EFE9'; cx.fill(); });
    if (mode === 'map' && layers.res) R.res.forEach(function (r) { poly(r.p, true); cx.fillStyle = 'rgba(232,206,176,.28)'; cx.fill(); cx.strokeStyle = 'rgba(176,130,96,.7)'; cx.lineWidth = 1; cx.setLineDash([5, 3]); cx.stroke(); cx.setLineDash([]); });
    // Holbrook city limit
    var hb = R.places.filter(function (p) { return p.n === 'Holbrook' && p.p; })[0];
    if (hb && z >= 11) { poly(hb.p, true); cx.fillStyle = 'rgba(240,232,200,.6)'; cx.fill(); }
    cx.lineCap = cx.lineJoin = 'round';
    // water
    R.water.forEach(function (w) { w.p.forEach(function (ln) { poly([ln], false); cx.strokeStyle = '#99B3CC'; cx.lineWidth = z >= 13 ? 3 : z >= 10 ? 1.6 : 1; cx.stroke(); }); });
    R.lakes.forEach(function (l) { poly(l.p, true); cx.fillStyle = '#99B3CC'; cx.fill(); });
    // town detail (OSM)
    if (z >= 13) townMap(z);
    // rail
    R.rail.forEach(function (ln) { if (z >= 13 && MAP.inTown(ln[0][0], ln[0][1])) return; poly([ln], false); cx.strokeStyle = '#9b9b9b'; cx.lineWidth = z >= 10 ? 2 : 1.2; cx.stroke(); if (z >= 10) { cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.setLineDash([5, 5]); cx.stroke(); cx.setLineDash([]); } });
    // roads
    var order = { S: 0, U: 1, I: 2 };
    cx.save(); if (z >= 13) clipTowns();
    (R._sorted || (R._sorted = R.roads.slice().sort(function (a, b) { return order[a.t] - order[b.t]; }))).forEach(function (r) {
      if (r.t === 'S' && z < 9) return;
      var w = r.t === 'I' ? (z >= 12 ? 7 : z >= 10 ? 5 : 3.5) : r.t === 'U' ? (z >= 12 ? 6 : z >= 10 ? 4 : 2.6) : (z >= 12 ? 5 : 3);
      var cs = r.t === 'I' ? '#E09B2D' : r.t === 'U' ? '#D9C95A' : '#C9C2A0', fl = r.t === 'I' ? '#FFC345' : r.t === 'U' ? '#FFFD8B' : '#FFFFC8';
      r.p.forEach(function (ln) { poly([ln], false); cx.strokeStyle = cs; cx.lineWidth = w; cx.stroke(); });
      r.p.forEach(function (ln) { poly([ln], false); cx.strokeStyle = fl; cx.lineWidth = w - 2; cx.stroke(); });
    });
    cx.restore();
    if (z >= 13) townRoads(z);
    // county + state lines
    R.counties.forEach(function (c) { poly(c.p, true); if (c.n === 'Navajo') { cx.strokeStyle = 'rgba(160,60,140,.3)'; cx.lineWidth = 5; cx.stroke(); cx.strokeStyle = '#A03C8C'; cx.lineWidth = 1.5; cx.setLineDash([6, 3]); cx.stroke(); } else { cx.strokeStyle = '#9A8FA0'; cx.lineWidth = 1; cx.setLineDash([4, 3]); cx.stroke(); } cx.setLineDash([]); });
  }
  function clipTowns() { cx.beginPath(); cx.rect(-10, -10, W + 20, H + 20); MAP.TOWN_BOXES.forEach(function (b) { var a0 = px(b.a), a1 = px(b.b); cx.rect(a0[0], a0[1], a1[0] - a0[0], a1[1] - a0[1]); }); cx.clip('evenodd'); }
  function viewBB() { var a = unpx(0, H), b = unpx(W, 0); return [a[0], a[1], b[0], b[1]]; }
  function onScreen(o, v) { var b = o.bb; return b[2] > v[0] && b[0] < v[2] && b[3] > v[1] && b[1] < v[3]; }
  function townMap(z) {
    var A = MAP.AREA, VB = viewBB();
    A.forEach(function (a) { if (!onScreen(a, VB)) return;
      var col = { park: '#CADFAA', pitch: '#CADFAA', recreation_ground: '#CADFAA', playground: '#CADFAA', cemetery: '#D6E3C3', school: '#F0E6DE', education: '#F0E6DE', parking: '#EDECEA', swimming_pool: '#99B3CC', commercial: '#F1EEE8', retail: '#F1EEE8', industrial: '#EBE7E1' }[a.v];
      if (!col) return; poly([a.ll], true); cx.fillStyle = col; cx.fill();
    });
    MAP.WAT.forEach(function (w) { if (!onScreen(w, VB)) return; poly([w.ll], w.w === 'water'); if (w.w === 'water') { cx.fillStyle = '#99B3CC'; cx.fill(); } else { cx.strokeStyle = '#99B3CC'; cx.lineWidth = w.w === 'river' ? 4 : 1.5; cx.stroke(); } });
    if (z >= 16) MAP.BLD.forEach(function (b) { if (b.s || !onScreen(b, VB)) return; poly([b.ll], true); cx.fillStyle = '#E5E3DF'; cx.fill(); cx.strokeStyle = '#D2CFC9'; cx.lineWidth = 1; cx.stroke(); });
  }
  function townRoads(z) {
    var RW = { motorway: [9, '#E09B2D', '#FFC345'], trunk: [8, '#D9C95A', '#FFFD8B'], primary: [8, '#D9C95A', '#FFFD8B'], secondary: [7, '#D9C95A', '#FFFFB0'], tertiary: [6, '#C9C3B8', '#fff'], unclassified: [5, '#C9C3B8', '#fff'], residential: [5, '#C9C3B8', '#fff'], living_street: [4, '#C9C3B8', '#fff'], service: [3, '#C9C3B8', '#fff'], motorway_link: [5, '#E09B2D', '#FFC345'], trunk_link: [5, '#D9C95A', '#FFFD8B'], primary_link: [5, '#D9C95A', '#FFFD8B'], track: [2, '#C9B98A', '#EDE3C8'] };
    var k = z >= 17 ? 2 : z >= 16 ? 1.5 : z >= 15 ? 1.15 : z >= 14 ? .85 : .6;
    var VB = viewBB();
    [0, 1].forEach(function (pass) { MAP.HW.forEach(function (h) { var s = RW[h.h]; if (!s || !onScreen(h, VB)) return; poly([h.ll], false); cx.strokeStyle = s[pass + 1]; cx.lineWidth = Math.max(1, s[0] * k - (pass ? 2 : 0)); cx.stroke(); }); });
    MAP.RAIL.forEach(function (r) { if (!onScreen(r, VB)) return; poly([r.ll], false); cx.strokeStyle = '#999'; cx.lineWidth = 2.5; cx.stroke(); cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.setLineDash([5, 5]); cx.stroke(); cx.setLineDash([]); });
  }
  function overlay(sat) {
    var z = V.z, R = MAP.R;
    if (sat) { // hybrid: translucent roads + borders
      cx.lineCap = cx.lineJoin = 'round';
      cx.save(); if (z >= 13) clipTowns();
      R.roads.forEach(function (r) { if (r.t === 'S' && z < 10) return; r.p.forEach(function (ln) { poly([ln], false); cx.strokeStyle = r.t === 'I' ? 'rgba(255,195,69,.85)' : 'rgba(255,253,139,.7)'; cx.lineWidth = r.t === 'I' ? 3 : 2; cx.stroke(); }); });
      cx.restore(); var VB2 = viewBB();
      if (z >= 13) MAP.HW.forEach(function (h) { if (!/motorway|trunk|primary/.test(h.h) || !onScreen(h, VB2)) return; poly([h.ll], false); cx.strokeStyle = /motorway/.test(h.h) ? 'rgba(255,195,69,.85)' : 'rgba(255,253,139,.75)'; cx.lineWidth = /motorway/.test(h.h) ? 3 : 2.4; cx.stroke(); });
      if (z >= 15) MAP.HW.forEach(function (h) { if (!/residential|tertiary|unclassified|secondary/.test(h.h) || !onScreen(h, VB2)) return; poly([h.ll], false); cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.stroke(); });
      R.counties.forEach(function (c) { poly(c.p, true); cx.strokeStyle = c.n === 'Navajo' ? 'rgba(255,170,240,.9)' : 'rgba(255,255,255,.5)'; cx.lineWidth = c.n === 'Navajo' ? 1.6 : 1; cx.setLineDash([5, 3]); cx.stroke(); cx.setLineDash([]); });
    }
    var dark = sat ? 'rgba(0,0,0,.65)' : null, tc = sat ? '#fff' : '#222';
    // shields
    if (z <= 13) shields();
    // street names
    if (z >= 15) streetNames(sat);
    // reservation labels
    if (z <= 10 && layers.res) [['纳瓦霍族保留地', 'NAVAJO NATION', -110.25, 36.25], ['霍皮族保留地', 'HOPI', -110.45, 35.82], ['阿帕奇堡保留地', 'FORT APACHE', -110.15, 33.85]].forEach(function (a) { var q = px([a[2], a[3]]); label(q[0], q[1], a[0], a[1], 'italic bold 12px Arial', sat ? '#f3e2cf' : '#9A6B4A', 'center', dark); });
    // county labels
    if (z <= 10) MAP.R.counties.forEach(function (c) {
      var r = region[c.n], q = px(c.c);
      if (c.n === 'Navajo') { var q2 = px([-110.33, 34.62]); return label(q2[0], q2[1], '纳瓦霍县', 'NAVAJO COUNTY', 'bold 14px Arial', sat ? '#ffd8f4' : '#7A2E6C', 'center', dark); }
      if (!r) return;
      if (r.seen) label(q[0], q[1], r.zh, r.en.toUpperCase(), 'bold 11px Arial', sat ? '#eee' : '#6E6478', 'center', dark);
      else { label(q[0], q[1] - 8, r.zh, r.en, '12px Arial', '#9A968E'); label(q[0], q[1] + 8, r.status[0], r.status[1], '11px Arial', '#9A968E'); }
    });
    // other labels
    D.labels.forEach(function (a) { if (!a[4] && z < 9) return; if (z >= 13) return; var q = px([a[2], a[3]]); dot(q[0], q[1], a[4] ? 4 : 3); label(q[0] + 7, q[1] + 4, a[0], a[1], (a[4] ? 'bold 12px' : '11px') + ' Arial', tc, 'left', dark); });
    // county towns
    D.towns.forEach(function (t) {
      if (z >= 14 && t.town) return;
      var q = px(t.ll), big = t.pop > 4000; if (!big && z < 9) return;
      dot(q[0], q[1], big ? 4.5 : 3); if (t.seat) { cx.fillStyle = '#C0392B'; star(q[0], q[1], 6); }
      label(q[0] + 7, q[1] + 4, t.zh, t.en, (big ? 'bold 13px' : '12px') + ' Arial', tc, 'left', dark);
      if (layers.cases && t.cases) { cx.font = 'bold 10px Arial'; var tx = '' + t.cases, w2 = cx.measureText(tx).width + 6; cx.fillStyle = '#C4372A'; rrect(q[0] - w2 - 6, q[1] - 15, w2, 12, 6); cx.fill(); cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.fillText(tx, q[0] - w2 / 2 - 6, q[1] - 5.5); }
    });
    // POIs
    if (z >= 17) MAP.POI.forEach(function (p) { var q = px(p.ll); if (q[0] < -50 || q[1] < -20 || q[0] > W + 50 || q[1] > H + 20) return; cx.fillStyle = sat ? '#fff' : '#7a6f62'; cx.beginPath(); cx.arc(q[0], q[1], 2.5, 0, 7); cx.fill(); label(q[0] + 5, q[1] + 3, p.n, p.n, '11px Arial', sat ? '#fff' : '#5b5045', 'left', dark); });
    // facilities
    if (layers.fac) S.facilities.forEach(function (f) { var q = px(f.ll); facMarker(q[0], q[1], f); });
  }
  function dot(x, y, r) { cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fillStyle = '#fff'; cx.fill(); cx.strokeStyle = '#555'; cx.lineWidth = 1.2; cx.stroke(); }
  function star(x, y, r) { cx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; cx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } cx.closePath(); cx.fill(); }
  function shields() {
    var done = {};
    MAP.R.roads.forEach(function (r) {
      var m = /^(?:[NSEW] )?(I-|US Hwy|State Hwy|State Rte) ?(\d+)/.exec(r.n); if (!m) return;
      var key = r.t + m[2]; if (done[key] || (r.t === 'S' && V.z < 10)) return;
      var ln = r.p.reduce(function (a, b) { return b.length > a.length ? b : a; }, []); if (ln.length < 2) return;
      var p = ln[Math.floor(ln.length / 2)], q = px(p); if (q[0] < 20 || q[1] < 20 || q[0] > W - 20 || q[1] > H - 20) return;
      done[key] = 1; var n = m[2]; cx.font = 'bold 10px Arial'; var w = Math.max(18, cx.measureText(n).width + 8);
      if (r.t === 'I') { cx.fillStyle = '#fff'; rrect(q[0] - w / 2 - 1, q[1] - 9, w + 2, 17, 4); cx.fill(); cx.fillStyle = '#1F4E9C'; rrect(q[0] - w / 2, q[1] - 8, w, 15, 4); cx.fill(); cx.fillStyle = '#C4372A'; cx.fillRect(q[0] - w / 2 + 1, q[1] - 7, w - 2, 3); cx.fillStyle = '#fff'; }
      else if (r.t === 'U') { cx.fillStyle = '#fff'; cx.strokeStyle = '#000'; cx.lineWidth = 1; rrect(q[0] - w / 2, q[1] - 8, w, 15, 6); cx.fill(); cx.stroke(); cx.fillStyle = '#000'; }
      else { cx.fillStyle = '#fff'; cx.strokeStyle = '#555'; cx.lineWidth = 1; cx.fillRect(q[0] - w / 2, q[1] - 7, w, 13); cx.strokeRect(q[0] - w / 2 + .5, q[1] - 6.5, w - 1, 12); cx.fillStyle = '#000'; }
      cx.textAlign = 'center'; cx.fillText(n, q[0], q[1] + 3.5);
    });
  }
  function streetNames(sat) {
    var done = {}, VB = viewBB();
    MAP.HW.forEach(function (h) {
      if (!h.n || done[h.n] || !onScreen(h, VB) || !/residential|tertiary|primary|secondary|trunk|unclassified/.test(h.h)) return;
      var best = null, bl = 0; for (var i = 1; i < h.ll.length; i++) { var a = px(h.ll[i - 1]), b = px(h.ll[i]), l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > bl) { bl = l; best = [a, b]; } }
      if (!best) return; cx.font = '11px Arial'; var tw = cx.measureText(h.n).width; if (bl < tw + 16) return;
      var a = best[0], b = best[1], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if (mx < 0 || my < 0 || mx > W || my > H) return;
      var ang = Math.atan2(b[1] - a[1], b[0] - a[0]); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      done[h.n] = 1; cx.save(); cx.translate(mx, my); cx.rotate(ang); cx.textAlign = 'center'; cx.lineWidth = 3; cx.strokeStyle = sat ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.95)'; cx.fillStyle = sat ? '#fff' : '#333'; cx.strokeText(h.n, 0, 4); cx.fillText(h.n, 0, 4); cx.restore();
    });
  }
  function facMarker(x, y, f) {
    var b = bdefOf(f.b); cx.lineWidth = 1.5;
    if (!f.done) { cx.setLineDash([3, 2]); cx.strokeStyle = P(f.fund).color; cx.fillStyle = 'rgba(255,255,255,.85)'; rrect(x - 7, y - 7, 14, 14, 2); cx.fill(); cx.stroke(); cx.setLineDash([]); cx.fillStyle = P(f.fund).color; cx.fillRect(x - 5, y + 3, 10 * (f.progress || 0), 2); cx.strokeStyle = 'rgba(0,0,0,.25)'; cx.lineWidth = .5; cx.strokeRect(x - 5.5, y + 2.5, 11, 3); cx.lineWidth = 1.5; }
    else { cx.fillStyle = P(f.fund).color; cx.strokeStyle = '#fff'; rrect(x - 7, y - 7, 14, 14, 2); cx.fill(); cx.stroke(); }
    if (V.z >= 14) label(x, y + 20, f.name[0], f.name[1], '11px Arial', mode === 'map' ? '#333' : '#fff', 'center', mode === 'map' ? null : 'rgba(0,0,0,.6)');
  }
  function ghost() { var b = bdefOf(S.bsel); if (b.convert) return; var m = MAP.mpp(V.z), w = (b.size[0] / m), h = (b.size[1] / m); cx.fillStyle = 'rgba(255,255,255,.35)'; cx.strokeStyle = '#fff'; cx.setLineDash([4, 3]); cx.fillRect(hover[0] - w / 2, hover[1] - h / 2, w, h); cx.strokeRect(hover[0] - w / 2, hover[1] - h / 2, w, h); cx.setLineDash([]); }
  function scale() { var m = MAP.mpp(V.z), nice = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000], best = 10; nice.forEach(function (n) { if (n / m < 110) best = n; }); $('#scale>div').style.width = Math.round(best / m) + 'px'; $('#sc1').textContent = best >= 1000 ? best / 1000 + ' km' : best + ' m'; }
  var ZMIN = 7, ZMAX = 18;
  function knob() { $('#knob').style.top = (ZMAX - V.z) / (ZMAX - ZMIN) * 119 + 'px'; }

  // ---------- interaction ----------
  var drag = null, moved = false, hover = null;
  cv.addEventListener('mousedown', function (e) { drag = [e.clientX, e.clientY, V.x, V.y]; moved = false; cv.classList.add('dragging'); });
  window.addEventListener('mousemove', function (e) {
    if (drag) { var dx = e.clientX - drag[0], dy = e.clientY - drag[1]; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; V.x = drag[2] - dx; V.y = drag[3] - dy; closeInfo(); draw(true); }
    else if (S.placing) { var r = cv.getBoundingClientRect(); hover = [e.clientX - r.left, e.clientY - r.top]; draw(true); }
  });
  window.addEventListener('mouseup', function (e) { if (!drag) return; cv.classList.remove('dragging'); var r = cv.getBoundingClientRect(); if (!moved) click(e.clientX - r.left, e.clientY - r.top); else draw(); drag = null; });
  // 滚轮：鼠标一格换一级；触控板的小增量先累计，满一格再换，并且两次之间至少隔 90 ms（原来每个滚轮事件都换一级）
  var wheelAcc = 0, wheelT = 0, lastWheelAt = 0, edgeArm = 0, edgeQuiet = false, edgeTipEl = null, edgeTipT = 0, inWheel = false;
  function edgeTip(on) {
    if (!edgeTipEl) { edgeTipEl = document.createElement('div'); edgeTipEl.style.cssText = 'position:absolute;left:50%;top:14px;transform:translateX(-50%);background:#fff9c4;border:1px solid #c9b458;padding:3px 10px;font:12px Arial,sans-serif;z-index:50;pointer-events:none'; edgeTipEl.textContent = '再缩小一次回到全国地图 Zoom out again for the national map'; cv.parentNode.appendChild(edgeTipEl); }
    edgeTipEl.hidden = !on; clearTimeout(edgeTipT); if (on) edgeTipT = setTimeout(function () { edgeTipEl.hidden = true; edgeArm = 0; }, 3000);
  }
  cv.addEventListener('wheel', function (e) {
    e.preventDefault(); var r = cv.getBoundingClientRect(), now = performance.now();
    if (edgeArm && now - lastWheelAt > 350) edgeQuiet = true; lastWheelAt = now;
    wheelAcc += e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 600 : 1);
    if (Math.abs(wheelAcc) < 50 || now - wheelT < 90) return;
    var d = wheelAcc < 0 ? 1 : -1; wheelAcc = 0; wheelT = now;
    inWheel = true; zoomAt(d, e.clientX - r.left, e.clientY - r.top); inWheel = false;
  }, { passive: false });
  cv.addEventListener('dblclick', function (e) { var r = cv.getBoundingClientRect(); zoomAt(1, e.clientX - r.left, e.clientY - r.top); });
  function zoomAt(d, sx, sy) {
    if (d < 0 && V.z <= ZMIN && top !== window && top.FNA) {
      // 已是最小缩放：第一次只提示；滚轮停下后再缩小一次（3 秒内）才回到全国地图，避免一次滚过头就跳出去
      var now = performance.now(); if (!inWheel && edgeArm) edgeQuiet = true;
      if (edgeArm && now - edgeArm < 3000 && edgeQuiet) { edgeArm = 0; edgeTip(false); closeInfo(); top.FNA.toAtlas(); return; }
      if (!edgeArm || now - edgeArm >= 3000) edgeQuiet = false;
      edgeArm = now; edgeTip(true);
      return;
    }
    var nz = Math.max(ZMIN, Math.min(ZMAX, V.z + d)); if (nz === V.z) return;
    if (sx == null) { sx = W / 2; sy = H / 2; }
    closeInfo();
    if (zoomAnim(nz, sx, sy)) return;
    var ll = unpx(sx, sy); V.z = nz; V.x = MAP.wx(ll[0], nz) - sx + W / 2; V.y = MAP.wy(ll[1], nz) - sy + H / 2;
    draw();
  }
  function click(x, y) {
    var ll = unpx(x, y);
    if (S.placing) return place(ll, x, y);
    var best = null, bd = 12;
    S.facilities.forEach(function (f) { var q = px(f.ll), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = ['f', f]; } });
    D.towns.forEach(function (t) { if (V.z >= 14 && t.town) return; var q = px(t.ll), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = ['t', t]; } });
    if (best) return best[0] === 't' ? infoTown(best[1]) : infoFac(best[1]);
    if (V.z >= 16) { var b = MAP.buildingAt(ll[0], ll[1]); if (b) return infoBld(b, x, y); }
    var res = MAP.R.res.filter(function (r) { return r.p.some(function (ring) { return MAP.pip(ll, ring); }); })[0];
    if (res && region[res.n]) return infoRegion(region[res.n], x, y);
    var c = MAP.R.counties.filter(function (c) { return c.p.some(function (ring) { return MAP.pip(ll, ring); }); })[0];
    if (c && c.n !== 'Navajo' && region[c.n]) return infoRegion(region[c.n], x, y);
    closeInfo();
  }
  function openInfo(x, y, html) { var I = $('#info'); $('#infobody').innerHTML = html; I.hidden = false; I.style.left = (x - 46) + 'px'; I.style.top = (y - I.offsetHeight - 33) + 'px'; }
  function closeInfo() { $('#info').hidden = true; }
  function infoTown(t) {
    var q = px(t.ll);
    openInfo(q[0], q[1] - 4, '<h3>' + L(t.zh, t.en) + '<small>' + L('亚利桑那州纳瓦霍县', 'Navajo County, Arizona') + (t.seat ? ' · ' + L('县府', 'County seat') : '') + '</small></h3><div class="kv">' + (t.mayor ? '<span>' + L('镇长', 'Mayor') + '</span>' + LA(t.mayor) : '') + '<span>' + L('人口', 'Population') + '</span>' + t.pop.toLocaleString() + '<span>' + L('病例', 'Cases') + '</span>' + t.cases + '<span>' + L('民心', 'Mood') + '</span>' + t.mood + ' / 100</div>' +
      '<div class="lk" style="font-size:12px"><a href="#" data-zoom="' + t.id + '">' + L('放大', 'Zoom in') + '</a>' + (t.town ? ' - <a href="#" data-sat="' + t.id + '">' + L('卫星', 'Satellite') + '</a>' : '') + '</div>');
  }
  function infoFac(f) { var q = px(f.ll), b = bdefOf(f.b); openInfo(q[0], q[1] - 8, '<h3>' + LA(f.name) + '<small>' + L(b.zh, b.en) + '</small></h3><div class="kv"><span>' + L('出资', 'Paid by') + '</span><span style="color:#000">' + chip(f.fund) + '</span><span>' + L('状态', 'Status') + '</span>' + (f.done ? L('使用中', 'In use') : L('施工中，还要 ' + f.eta + ' 天', 'Building, ' + f.eta + ' days left')) + '</div><p class="muted" style="font-size:12px">' + LA(bfx(b)) + '</p>'); }
  function infoBld(b, x, y) {
    var nm = b.name || (b.am ? b.am.replace(/_/g, ' ') : '');
    var kind = { house: ['住宅', 'House'], motel: ['汽车旅馆', 'Motel'], retail: ['商店', 'Retail'], school: ['学校', 'School'], train_station: ['火车站', 'Train station'], roof: ['棚', 'Canopy'], public: ['公共建筑', 'Public building'] }[b.b] || (b.area > 380 ? ['商业建筑', 'Commercial building'] : ['住宅', 'House']);
    var conv = D.buildings.filter(function (d) { return d.convert; });
    openInfo(x, y, '<h3>' + (nm ? nm : LA(kind)) + '<small>' + (nm ? LA(kind) + ' · ' : '') + Math.round(b.area) + ' m²</small></h3><div class="blist">' + conv.map(function (d) { return '<a href="#" data-conv="' + d.id + ':' + b.i + '">' + L(d.zh, d.en) + ' · ' + money(d.cost) + '</a>'; }).join('') + '</div>');
  }
  function chairOf(r) { if (r.id === 'navajo_nation' && S.flags.shelly) return L('代理族长 本·谢利', 'Acting President Ben Shelly'); if (r.id === 'hopi' && S.flags.hopi_chair) return L('当选主席 勒罗伊·辛戈伊特瓦', 'Chairman-elect Leroy Shingoitewa'); return LA(r.chair); }
  function infoRegion(r, x, y) {
    if (!r.seen) return openInfo(x, y, '<h3>' + L(r.zh, r.en) + '</h3><p>' + LA(r.status) + '</p><div class="lk"><a href="#">' + L('派外勤 »', 'Send team »') + '</a></div>');
    openInfo(x, y, '<h3>' + L(r.zh, r.en) + '<small>' + (r.seat ? LA(r.seat) + ' · ' : '') + L(P(r.stance).zh, P(r.stance).en) + '</small></h3><div class="kv">' + (r.chair ? '<span>' + L('领导', 'Leader') + '</span>' + chairOf(r) : '') + '<span>' + L('病例', 'Cases') + '</span>' + r.cases.toLocaleString() + (r.ref ? '<span>' + L('外来', 'Arrivals') + '</span>' + r.ref.toLocaleString() : '') + '</div>' +
      (r.note && r.note[0] ? '<p class="muted" style="font-size:12px">' + LA(r.note) + '</p>' : '') + '<p style="font-size:11px;color:#676767;margin:0 0 4px">' + L('影像日期：', 'Imagery date: ') + r.date + '</p><div class="lk" style="font-size:12px"><a href="#">' + L('贸易', 'Trade') + '</a> - <a href="#">' + L('请求援助', 'Ask for aid') + '</a> - <a href="#">' + L('派联络员', 'Send liaison') + '</a></div>');
  }
  function inNavajo(ll) { return NAVAJO.p.some(function (r) { return MAP.pip(ll, r); }) && !MAP.R.res.some(function (r) { return r.p.some(function (ring) { return MAP.pip(ll, ring); }); }); }
  function place(ll, x, y) {
    var b = bdefOf(S.bsel), f = S.bfund;
    if (V.z < 15) return hint(L('放大到街道级别再放置。', 'Zoom in to street level to place it.'));
    if (!inNavajo(ll)) return hint(L('只能建在本县辖区内（保留地除外）。', 'County jurisdiction only (not on reservation land).'));
    if (b.convert) { var bl = MAP.buildingAt(ll[0], ll[1]); if (!bl) return hint(L('点一栋现有建筑。', 'Click an existing building.')); return convert(b, bl, f); }
    if (MAP.buildingAt(ll[0], ll[1])) return hint(L('这里已经有建筑了。', 'Something is already built here.'));
    if (S.funds[f] < b.cost) return hint(L(P(f).short[0] + '的钱不够。', 'Not enough ' + P(f).short[1] + ' money.'));
    S.funds[f] -= b.cost;
    var nf = { b: b.id, ll: ll, name: [b.zh, b.en], fund: f, done: false, eta: b.days, size: b.size, roof: b.roof, grid: b.grid, tower: b.tower, look: b.look, progress: 0 };
    S.facilities.push(nf); if (f !== 'county') { var d = {}; d[f] = 2; apply(d); }
    endPlace(); syncFac(); MAP.invalidate(ll); render(); draw();
  }
  function convert(b, bl, f) {
    if (S.funds[f] < b.cost) return hint(L(P(f).short[0] + '的钱不够。', 'Not enough ' + P(f).short[1] + ' money.'));
    S.funds[f] -= b.cost;
    var ll = MAP.m2ll([(bl.box[0] + bl.box[2]) / 2, (bl.box[1] + bl.box[3]) / 2]);
    S.facilities.push({ b: b.id, ll: ll, name: [(bl.name || '') + ' ' + b.zh.replace('改建为', ''), (bl.name || 'Building') + ' (' + b.en.replace('Convert to ', '') + ')'], fund: f, done: false, eta: b.days, conv: true, progress: 0, size: [Math.max(6, bl.box[2] - bl.box[0]), Math.max(6, bl.box[3] - bl.box[1])] });
    endPlace(); syncFac(); render(); draw(); closeInfo();
  }
  function endPlace() { S.placing = false; hover = null; $('#buildhint').hidden = true; cv.style.cursor = ''; }
  function hint(html) { var h = $('#buildhint'); h.innerHTML = html; h.hidden = false; }
  function setMode(m) { mode = m; document.querySelectorAll('#mtg .mt').forEach(function (b) { b.classList.toggle('sel', b.dataset.mode === m); }); draw(); }

  // ---------- events ----------
  function dialog(title, html) { $('#dlgt').innerHTML = title; $('#dlgb').innerHTML = html; $('#dlgwrap').hidden = false; }
  var ARROW = '<svg width="16" height="16" viewBox="0 0 16 16"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd36b"/><stop offset=".5" stop-color="#2f9e2a"/><stop offset="1" stop-color="#1d7a1c"/></linearGradient></defs><path d="M1.5 6h7V2.2L15 8l-6.5 5.8V10h-7z" fill="url(#ga)" stroke="#16611a" stroke-width=".8" stroke-linejoin="round"/><path d="M2.3 6.8h7V4l4.4 3.9" fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".8"/></svg>';
  function dateStr() { var d = S.date; return L(d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日', MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()); }
  function taskDialog(o) {
    dialog(o.caption || (L('纳瓦霍县', 'Navajo County') + ' · ' + dateStr()),
      '<div class="td"><div class="tdm"><img src="icons/' + (o.icon || 'info') + '32.png" width="32" height="32" alt=""><div><div class="tdi">' + o.title + '</div><div class="tdc">' + o.body + '</div></div></div>' +
      '<div class="tdl">' + o.links.map(function (l) { return '<button class="cl" ' + l.attr + '>' + ARROW + '<span><span class="clt">' + l.t + '</span>' + (l.n ? '<span class="cln">' + l.n + '</span>' : '') + '</span></button>'; }).join('') + '</div></div>' +
      (o.foot ? '<div class="tdf"><img src="icons/' + (o.footIcon || 'info') + '16.png" width="16" height="16" alt="">' + o.foot + '</div>' : ''));
  }
  function startEvent() { return CONTENT.events.filter(function (e) { return e.start; })[0]; }
  function eventDialog(e) { e = e || startEvent(); S.curEv = e; taskDialog({ icon: e.icon || 'info', title: LA(e.title), body: LA(e.body), links: e.opts.map(function (o, i) { return { attr: 'data-ev="' + i + '"', t: LA(o.t), n: LA(o.fx || CONTENT.fx(o.do)) }; }), foot: e.foot ? LA(e.foot) : null }); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-fold],a,button,[data-town],[data-region],[data-b],[data-mail],[data-ot],[data-wk]'); if (!a || a.closest('#logon')) return;
    var holder = e.target.closest('[data-b],[data-region],[data-town],[data-mail]'); if (a.tagName === 'A' && !Object.keys(a.dataset).length && holder && holder.contains(a)) { e.preventDefault(); a = holder; }
    var ds = a.dataset;
    if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault();
    if (ds.tab === 'mail') { openMail(); return; }
    if (ds.tab) { if (document.body.classList.contains('collapsed')) { document.body.classList.remove('collapsed'); var tg = $('#sbtog'); if (tg) tg.textContent = '«'; resize(); } S.tab = ds.tab; render(); return; }
    if (a.id === 'openatm') { openAtm(); return; }
    if (a.id === 'savebtn') { manualSave(); return; }
    if (a.id === 'help') { helpDialog(); return; }
    if (ds.presser) { S.presserDay = S.day; var dv = Math.max(-4, Math.min(2, -(S.trust - 35) / 8)); nudge('panic', dv, ['新闻发布会', 'Press conference']); notice(dv < 0 ? L('发布会开完，电话热线来电少了。', 'Press conference done; fewer calls to the hotline.') : L('发布会上被追问，记者不太买账。', 'Reporters pushed back hard at the press conference.')); render(); return; }
    if (ds.fold) { S.fold = S.fold || {}; var cur = ds.fold in S.fold ? S.fold[ds.fold] : !!a.closest('.fold.open'); S.fold[ds.fold] = !cur; render(); return; }
    if (ds.evopen) { if (S.curEv) eventDialog(S.curEv); return; }
    if (ds.pick) { S.tab = 'build'; S.bsel = ds.pick; var pb = bdefOf(ds.pick); S.bfund = pb && pb.fund.filter(function (k) { return S.funds[k] >= pb.cost; })[0] || (pb && pb.fund[0]); render(); return; }
    if (ds.trade) { if (S.funds.county < 45) { notice(L('县账户不够 $45K，买不了。', 'The county account is short of $45K.')); return; } S.funds.county -= 45; S.econ.wk.exp += 45; S.trade[ds.trade] = S.day; S.sim.stock = Math.min(stockMax(), S.sim.stock + 3); render(); return; }
    if (ds.team) { if (crewFree() < 4 || S.funds.county < 6) { notice(L('人手或经费不够，派不出外勤队。', 'Not enough staff or money for a field team.')); return; } S.funds.county -= 6; var rr = region[ds.team]; S.teams.push({ rid: ds.team, days: rr && rr.res ? 2 : 3 }); render(); return; }
    if (ds.aid) { S.aid[ds.aid] = S.day; var ra = region[ds.aid]; if (ra && ra.stance && S.stand[ra.stance] != null) apply((function () { var o = {}; o[ra.stance] = 2; return o; })(), ['互助协议', 'Mutual aid']); render(); return; }
    if (ds.cert) { if (S.funds.county < 8) { notice(L('县账户不够 $8K，开不了培训。', 'The county account is short of $8K for the class.')); return; } S.funds.county -= 8; S.staff.train.push({ n: 6, days: 3 }); render(); return; }
    if (ds.ot) { S.staff.ot = !S.staff.ot; crewPlan(); render(); return; }
    if (ds.wk) { S.staff.wk = !S.staff.wk; crewPlan(); render(); return; }
    if (ds.endr) { location.reload(); return; }
    if (ds.endc) { $('#dlgwrap').hidden = true; return; }
    if (ds.atsw) { if (atm.st === 'busy') return; atm.mode = atm.mode === 'in' ? 'out' : 'in'; atm.st = 'amt'; atm.msg = ''; if (window.ATM3D) ATM3D.clearPile(); atmDraw(); return; }
    if (ds.aq) { if (atm.st === 'busy') return; atm.entry = ds.aq; atm.st = 'amt'; atm.msg = ''; atmDraw(); return; }
    if (a.id === 'atmgo') { atm.st = 'amt'; atmDo(); return; }
    if (a.id === 'atmx' || a.id === 'atmx2') { $('#atmwrap').hidden = true; if (window.ATM3D) ATM3D.clearPile(); return; }
    if (ds.loan) { loanDialog(ds.loan); return; }
    if (ds.lno) { $('#dlgwrap').hidden = true; return; }
    if (ds.lgo) { var ld = loanDef(ds.lgo), amt = ld.grant ? ld.max : Math.max(0, Math.min(+($('#lamt') || {}).value || 0, ld.id === 'interfund' ? Math.floor(S.econ.flood / 2) : ld.max)); if (amt > 0) S.econ.pending.push({ id: ld.id, amt: amt, days: ld.days }); $('#dlgwrap').hidden = true; render(); return; }
    if (ds.ev != null) { var ce = S.curEv || startEvent(); S.seen[ce.id] = true; $('#dlgwrap').hidden = true; S.curEv = null; runDo(ce.opts[+ds.ev].do, ce.title); render(); var nx = S.evq.shift(); if (nx) setTimeout(function () { eventDialog(nx); }, 300); return; }
    if (a.id === 'dlgx') { $('#dlgwrap').hidden = true; return; }
    if (a.id === 'infox') { closeInfo(); return; }
    if (ds.sp != null) { S.speed = +ds.sp; clock(); return; }
    if (a.id === 'nextday') { for (var i = 0; i < 24; i++) tick(); return; }
    if (ds.zoom) { var t = town[ds.zoom]; center(t.ll[0], t.ll[1], t.town ? 15 : 12); setMode('map'); infoTown(t); return; }
    if (ds.sat) { var t1 = town[ds.sat]; center(t1.ll[0], t1.ll[1], 17); setMode('sat'); closeInfo(); return; }
    if (ds.zr) { var r0 = region[ds.zr], c0 = r0.county ? COUNTY[r0.county].c : r0.res ? centroidRes(r0.res) : [-110.3, 34.9]; center(c0[0], c0[1], 9); closeInfo(); draw(); return; }
    if (ds.keep != null) { var pr = S.promises[+ds.keep]; S.funds.county -= (pr.cost || 20); S.promises.splice(+ds.keep, 1); apply({ trust: 4 }, ['兑现承诺', 'Promise kept']); render(); return; }
    if (ds.sign) { var l = D.laws.filter(function (x) { return x.id === ds.sign; })[0]; voteScreen(l, function (ok) { if (!ok) { render(); return; } S.laws[l.id] = true; if (l.d) apply(l.d, [l.zh, l.en]); var dd = { std_fed: { fed: 6, navajo: -6 }, std_navajo: { navajo: 6, fed: -6 }, school_close: { trust: -2 }, bnsf: { fed: 2 }, quota: { fed: 3, trust: -1 } }[l.id]; apply(dd, [l.zh, l.en]); render(); }); return; }
    if (ds.conv) { var p = ds.conv.split(':'), bd = bdefOf(p[0]); S.bsel = bd.id; S.bfund = S.bfund && bd.fund.indexOf(S.bfund) >= 0 ? S.bfund : bd.fund[0]; convert(bd, MAP.BLD[+p[1]], S.bfund); S.tab = 'build'; render(); return; }
    if (ds.b && !e.target.closest('input,#place')) { S.bsel = S.bsel === ds.b ? null : ds.b; S.bfund = S.bsel ? bdefOf(S.bsel).fund[0] : null; render(); return; }
    if (a.id === 'place') { var bb = bdefOf(S.bsel); S.placing = true; cv.style.cursor = 'crosshair'; if (V.z < 15 || !MAP.inTown(MAP.xlon(V.x, V.z), MAP.ylat(V.y, V.z))) { center(town.holbrook.ll[0], town.holbrook.ll[1], 16); } hint(bb.convert ? L('点击一栋建筑。Esc 取消。', 'Click a building. Esc to cancel.') : L('点击本县辖区内的空地放置。Esc 取消。', 'Click open ground in county jurisdiction. Esc to cancel.')); draw(); return; }
    if (ds.mail != null && !e.target.closest('button')) { var i2 = +ds.mail; S.mail[i2].unread = false; S.openMail = S.openMail === i2 ? -1 : i2; render(); return; }
    if (ds.act) {
      var pp = ds.act.split(':'); mailAct(+pp[0], +pp[1]); return;
    }
    if (a.id === 'zin') return zoomAt(1);
    if (a.id === 'zout') return zoomAt(-1);
    var pan = { pn: [0, -1], ps: [0, 1], pw: [-1, 0], pe: [1, 0] }[a.id];
    if (pan) { V.x += pan[0] * W / 3; V.y += pan[1] * H / 3; draw(); return; }
    if (a.id === 'pc') { center(-110.3, 34.75, 8); draw(); return; }
    if (ds.mode) { setMode(ds.mode); return; }
    if (a.id === 'morebtn') { $('#moremenu').hidden = !$('#moremenu').hidden; return; }
    if (a.id === 'nview') {   // 查看：切到“今天”，展开“报纸和广播”，滚过去并高亮最新一条广播
      S.tab = 'ov'; S.fold = S.fold || {}; S.fold.news = true; render(); $('#notice').hidden = true;
      setTimeout(function () { var bs = document.querySelector('[data-fold="news"]'); bs = bs && bs.closest('.sect'); if (bs) { bs.scrollIntoView({ block: 'start' }); var row = bs.querySelectorAll('.row.bc')[S.press.length ? Math.min(4, S.press.length) : 0]; if (row) { row.style.transition = 'background 1.6s'; row.style.background = '#fff3a8'; setTimeout(function () { row.style.background = ''; }, 900); } } }, 60);
      return;
    }
    if (a.id === 'nx') { $('#notice').hidden = true; return; }
    if (ds.region) { var r = region[ds.region], c2 = r.county ? COUNTY[r.county].c : centroidRes(r.res); center(c2[0], c2[1], 9); draw(); var q = px(c2); infoRegion(r, q[0], q[1]); return; }
    if (ds.town) { var t3 = town[ds.town]; center(t3.ll[0], t3.ll[1], t3.town ? 13 : 11); draw(); infoTown(t3); return; }
  });
  function centroidRes(n) { var r = MAP.R.res.filter(function (x) { return x.n === n; })[0], x = 0, y = 0, k = 0; r.p[0].forEach(function (p) { x += p[0]; y += p[1]; k++; }); return [x / k, y / k]; }
  document.addEventListener('change', function (e) { if (e.target.name === 'bf') S.bfund = e.target.value; if (e.target.dataset.ly) { layers[e.target.dataset.ly] = e.target.checked; if (e.target.dataset.ly === 'fog') FOG.setOn(e.target.checked); draw(); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { endPlace(); draw(); } });
  $('#searchform').addEventListener('submit', function () {
    var q = $('#q').value.trim().toLowerCase(); if (!q) return;
    var t = D.towns.filter(function (x) { return x.zh.indexOf(q) >= 0 || x.en.toLowerCase().indexOf(q) >= 0; })[0];
    if (t) { center(t.ll[0], t.ll[1], t.town ? 14 : 12); draw(); infoTown(t); return; }
    var p = MAP.POI.filter(function (x) { return x.n.toLowerCase().indexOf(q) >= 0; })[0];
    if (p) { center(p.ll[0], p.ll[1], 17); draw(); }
  });

  // ---------- time ----------
  function tick() {
    if (S.sim.over) return;
    pauseAtlas();
    S.hour++;
    buildHour();
    meters();
    if (S.hour >= 24) {
      S.hour = 0; S.day++; S.date = new Date(S.date.getTime() + 864e5); S.dstand = { fed: 0, navajo: 0, lds: 0 };
      S.d0 = { trust: S.trust, panic: S.panic }; S.why = {};
      S.promises.forEach(function (p) { p.left--; if (p.left === 0) apply({ trust: -8 }, ['没兑现承诺：' + p.zh, 'Broken promise: ' + p.en]); }); S.promises = S.promises.filter(function (p) { return p.left > 0; });
      D.towns.forEach(function (t) { if (t.cases) t.cases += Math.round(MAP.hash(S.day, t.pop, 1) * 2); });
      if (S.laws.hours) apply({ trust: -1 }, ['每周 50 小时', '50-hour weeks']);
      simDay(); econDay();
      var ymd = S.date.getFullYear() + '-' + ('0' + (S.date.getMonth() + 1)).slice(-2) + '-' + ('0' + S.date.getDate()).slice(-2);
      contentDay();
      stateDay(); staffDay(); teamsDay(); pressDay(); calDay(); pushHist(); syncFac(); render(); draw(); checkEnd(); if (!S.sim.over) (window.requestIdleCallback || setTimeout)(function () { saveGame(AUTO_KEY); });
    }
    clock();
  }
  setInterval(function () { for (var i = 0; i < S.speed; i++) tick(); lastBatch = (window.performance || Date).now(); }, 1000);


  // ---------- 存档 ----------
  var SAVE_KEY = 'fna-navajo-save', AUTO_KEY = 'fna-navajo-auto';
  function snapshot() {
    var s = {}; Object.keys(S).forEach(function (k) { if (['curEv', 'placing', 'openMail', 'date'].indexOf(k) < 0) s[k] = S[k]; });
    return { v: 1, at: Date.now(), ymd: ymdOf(S.date), date: S.date.getTime(), S: s,
      towns: D.towns.map(function (t) { return [t.id, t.cases, t.mood]; }),
      regions: D.regions.filter(function (r) { return r.seen; }).map(function (r) { return r.id; }),
      bc: CONTENT.broadcasts };
  }
  function saveGame(key) { try { localStorage.setItem(key || SAVE_KEY, JSON.stringify(snapshot())); return true; } catch (e) { return false; } }
  function readSave() { var a = null, b = null; try { a = JSON.parse(localStorage.getItem(SAVE_KEY)); b = JSON.parse(localStorage.getItem(AUTO_KEY)); } catch (e) {} if (!a) return b; if (!b) return a; return b.at > a.at ? b : a; }
  function restore(o) {
    Object.keys(o.S).forEach(function (k) { S[k] = o.S[k]; });
    S.date = new Date(o.date); S.speed = 0; S.curEv = null; S.placing = false; S.openMail = -1; S.evq = S.evq || [];
    o.towns.forEach(function (a) { var t = town[a[0]]; if (t) { t.cases = a[1]; t.mood = a[2]; } });
    D.regions.forEach(function (r) { r.seen = o.regions.indexOf(r.id) >= 0; });
    if (o.bc) { CONTENT.broadcasts.length = 0; o.bc.forEach(function (b) { CONTENT.broadcasts.push(b); }); }
  }
  window.GAME_SAVEINFO = function () { var o = readSave(); return o ? { ymd: o.ymd, day: o.S.day } : null; };

  // ---------- boot ----------
  window.GAME_START = function (id, opt) {
    try { if (top !== window && top.FNA) top.FNA.started(); } catch (e) {}
    var loaded = opt && opt.load ? readSave() : null;
    if (loaded) restore(loaded);
    syncFac(); render(); clock(); meters(); resize(); center(-110.3, 34.75, 8); draw();
    if (loaded) { $('#nview').hidden = true; $('#ntext').innerHTML = L('已读取存档：', 'Loaded save: ') + dateStr(); $('#notice').hidden = false; return; }
    $('#nview').hidden = false; $('#ntext').innerHTML = '<b>' + L('州应急管理局：', 'State emergency management: ') + '</b>' + L('明天上午 9 点公布新的病例标准。', 'New case criteria at 9 am tomorrow.'); $('#notice').hidden = false;
    setTimeout(function () { eventDialog(startEvent()); }, 900);
  };
  LANG.set('zh');
  if (top === window) { location.replace('../index.html'); }
  $('#logo').addEventListener('click', function (e) { if (top !== window && top.FNA) { e.preventDefault(); top.FNA.toAtlas(); } });
  $('#gearmenu').addEventListener('click', function () { setTimeout(function () { render(); clock(); draw(); }, 0); });
  window.addEventListener('resize', resize);
  (function () { var b = document.createElement('button'); b.id = 'sbtog'; b.title = '收起/展开侧栏 Hide/show panel'; b.textContent = '«'; pane.appendChild(b);
    b.addEventListener('click', function (e) { e.stopPropagation(); document.body.classList.toggle('collapsed'); b.textContent = document.body.classList.contains('collapsed') ? '»' : '«'; resize(); }); })();
  syncFac(); render(); clock(); resize(); center(-110.3, 34.75, 8);
  function manualSave() { var ok = saveGame(SAVE_KEY); $('#nview').hidden = true; $('#ntext').innerHTML = ok ? L('已保存：', 'Saved: ') + dateStr() : L('保存失败：浏览器不允许本地存储。', 'Could not save: local storage is blocked.'); $('#notice').hidden = false; return ok; }
  function helpDialog() {
    var items = [
      ['拖动地图平移，滚轮或双击缩放。缩小到最小一级回到全国地图。', 'Drag to pan; scroll or double-click to zoom. Zoom all the way out to return to the national map.'],
      ['时钟旁的按钮：暂停、正常、快进。“下一天”一次走 24 小时。', 'Buttons by the clock: pause, normal, fast. “Next day” runs 24 hours at once.'],
      ['信任降到 0，监事会把你免职；恐慌到 100，州里接管全县。鼠标停在顶栏数字上可以看今天变化的原因。', 'If trust hits 0 the Board removes you; if panic reaches 100 the state takes over. Hover over a number in the top bar to see what moved it today.'],
      ['事件里每个选项下面的灰字是它的效果，公文按钮下面也有。', 'The grey line under each event option shows its effect; so does the line under each mail button.'],
      ['公文在 Gmail 里，点顶栏右边的信封打开。', 'Mail is in Gmail: click the envelope at the right of the top bar.'],
      ['建造：选设施和出资方，放大到街道级别，在地图上点位置。改建类设施要点一栋现有建筑。', 'To build, pick a facility and who pays, zoom to street level and click a spot. Conversions need an existing building.'],
      ['每天零点自动存档，也可以随时点“保存”。', 'The game autosaves at midnight; you can also click Save at any time.']
    ];
    taskDialog({ icon: 'q', title: L('帮助', 'Help'), body: '<ul class="help">' + items.map(function (x) { return '<li>' + LA(x) + '</li>'; }).join('') + '</ul>', links: [{ attr: 'data-endc="1"', t: L('知道了', 'Got it') }] });
  }
  function mailAct(i, j) { var m = S.mail[i], act = m && m.acts && m.acts[j]; if (!act || m.done) return; runDo(act.do, m.subject); m.done = act.done || ['已处理', 'Done']; render(); if (window.GMAIL) GMAIL.refresh(); }
  function openMail() { if (top !== window && top.FNA) top.FNA.openMail(); }
  window.GAME = { save: manualSave, help: helpDialog, setSpeed: function (v) { S.speed = v; clock(); }, fromAtlas: function () { resize(); if (V.z <= ZMIN) center(-110.3, 34.75, 8); draw(); }, mailAct: mailAct, openMail: openMail, S: S, redrawFac: function () { S.facilities.forEach(function (f) { MAP.invalidate(f.ll); }); syncFac(); draw(); }, tick: function (n) { for (var i = 0; i < n; i++) tick(); }, cap: function () { return simCap(); }, V: V, center: center, setMode: setMode, draw: draw, render: render, eventDialog: eventDialog };
})();
