// game.js — 纳瓦霍县开局：侧栏、条例、建造、公文、事件，以及地图视图（地图 / 卫星 / 混合）。
(function () {
  'use strict';
  var D = DATA, $ = function (s) { return document.querySelector(s); };
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
    facilities: D.facilities.map(function (f) { var b = bdefOf(f.b); return Object.assign({ size: b.size || [20, 12], roof: b.roof, grid: b.grid, tower: b.tower, progress: f.done ? 1 : .5 }, f); }),
    laws: {}, mail: [], promises: D.promises.map(function (p) { return Object.assign({}, p); }),
    flags: {}, seen: {}, chain: [], votes: {}, evq: [], tab: 'ov', bsel: null, bfund: null, placing: false, openMail: -1
  };
  function bdefOf(id) { return D.buildings.filter(function (b) { return b.id === id; })[0]; }
  D.laws.forEach(function (l) { if (l.on) S.laws[l.id] = true; });
  CONTENT.mail.forEach(function (m) { if (!m.date || m.date < '2009-10-14') S.mail.push(Object.assign({}, m)); });
  var town = {}; D.towns.forEach(function (t) { town[t.id] = t; });
  var region = {}; D.regions.forEach(function (r) { region[r.county || r.res] = r; region[r.id] = r; });
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function apply(d) { if (!d) return; if (d.trust) S.trust = clamp(S.trust + d.trust); if (d.panic) S.panic = clamp(S.panic + d.panic); PW.forEach(function (k) { if (d[k]) { S.stand[k] = clamp(S.stand[k] + d[k]); S.dstand[k] = d[k]; } }); if (d.money) S.funds.county += d.money; meters(); }
  function ymdOf(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  // 执行内容包里的 do 效果
  function runDo(d) {
    if (!d) return; apply(d);
    if (d.county) S.funds.county += d.county;
    if (d.funds) Object.keys(d.funds).forEach(function (k) { S.funds[k] += d.funds[k]; });
    [].concat(d.flag || []).forEach(function (f) { S.flags[f] = true; });
    [].concat(d.unflag || []).forEach(function (f) { delete S.flags[f]; });
    if (d.build) { var b = d.build, bd = bdefOf(b.b); if (bd) { S.facilities.push({ b: b.b, ll: b.ll, name: b.name, fund: b.fund || bd.fund[0], done: false, eta: b.eta || bd.days, size: b.size || bd.size, roof: bd.roof, grid: bd.grid, tower: bd.tower, progress: 0 }); syncFac(); MAP.invalidate(b.ll); } }
    [].concat(d.mail || []).forEach(deliverMail);
    if (d.event) { var q = typeof d.event === 'string' ? { id: d.event, inDays: 0 } : d.event; S.chain.push({ id: q.id, at: S.day + (q.inDays || 0) }); }
    if (d.notice) { $('#ntext').innerHTML = LA(d.notice); $('#notice').hidden = false; }
    if (d.promise) S.promises.push(Object.assign({ by: ['', ''] }, d.promise));
    if (d.broadcast) CONTENT.broadcasts.unshift(d.broadcast);
  }
  function mailById(id) { return CONTENT.mail.filter(function (m) { return m.id === id; })[0]; }
  function evById(id) { return CONTENT.events.filter(function (e) { return e.id === id; })[0]; }
  function deliverMail(id) { var m = typeof id === 'string' ? mailById(id) : id; if (!m || S.mail.some(function (x) { return x.id === m.id; })) return; var c = Object.assign({}, m); if (m.date || typeof id === 'string') { c.unread = true; c.time = c.time || (S.hour + ':00').replace(/^(\d):/, '0$1:'); c.got = ymdOf(S.date); } S.mail.unshift(c); if (window.GMAIL) GMAIL.refresh(); }
  function condOk(w) {
    if (!w) return true; var ymd = ymdOf(S.date);
    if (w.after && ymd < w.after) return false; if (w.before && ymd > w.before) return false;
    if (w.flags && !w.flags.every(function (f) { return S.flags[f]; })) return false;
    if (w.notFlags && w.notFlags.some(function (f) { return S.flags[f]; })) return false;
    var cur = { trust: S.trust, panic: S.panic, fed: S.stand.fed, navajo: S.stand.navajo, lds: S.stand.lds, county: S.funds.county };
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
  function meters() {
    [['#m-trust', S.trust], ['#m-panic', S.panic]].forEach(function (a) { var e = $(a[0]); e.querySelector('i').style.width = a[1] + '%'; e.querySelector('b').textContent = a[1]; });
    $('#stand').innerHTML = PW.map(function (k) { var dd = S.dstand[k]; return '<span class="sp" title="' + P(k).zh + ' ' + P(k).en + '"><i class="sw" style="background:' + P(k).color + '"></i>' + LA(P(k).short) + ' <b>' + S.stand[k] + '</b>' + (dd ? '<span class="' + (dd > 0 ? 'up' : 'dn') + '">' + (dd > 0 ? '▲' : '▼') + Math.abs(dd) + '</span>' : '') + '</span>'; }).join('');
    var n = S.mail.filter(function (m) { return m.unread; }).length; $('#mailn').textContent = n ? '(' + n + ')' : '';
  }

  // ---------- sidebar ----------
  function sect(title, right) { return '<div class="sect"><div class="sh"><span style="font-weight:bold;font-size:13px">' + title + '</span>' + (right || '') + '</div>'; }
  function render() {
    var h = { ov: tabOverview, ppl: tabPeople, nb: tabRegion, law: tabLaws, build: tabBuild, bank: tabBank, mail: tabMail }[S.tab]();
    $('#results').innerHTML = h;
    document.querySelectorAll('#barl [data-tab]').forEach(function (a) { a.classList.toggle('on', a.dataset.tab === S.tab); });
    meters();
  }
  function ico(n) { return '<img src="icons/' + n + '16.png" width="16" height="16" alt="">'; }
  function tabOverview() {
    var cases = 0; D.towns.forEach(function (t) { cases += t.cases; });
    var h = sect(L('纳瓦霍县', 'Navajo County'), '<span>' + L('人口 107,449（2010）', 'Pop. 107,449 (2010)') + '</span>') +
      '<div class="stats"><div>' + L('确诊（县辖区）', 'Confirmed (county)') + '<b>' + cases + '</b></div><div>' + L('今日新增', 'New today') + '<b>+3</b></div>' +
      '<div>' + L('外来人员', 'Arrivals') + '<b>1,240</b></div><div>' + L('等待安置', 'Unhoused') + '<b>310</b></div>' +
      '<div>' + L('物资储备', 'Reserve') + '<b>' + L('34 天', '34 days') + '</b></div><div>' + L('县雇员到岗', 'Staff on duty') + '<b>91%</b></div>' +
      '<div>' + L('失业率（10月）', 'Unemployment (Oct)') + '<b>15.7%</b></div><div>' + L('县财政', 'County funds') + '<b>' + money(S.funds.county) + '</b></div></div></div>';
    h += sect(L('承诺', 'Promises'));
    S.promises.forEach(function (p, i) { h += '<div class="row ri">' + ico('warn') + '<div><div class="t">' + L(p.zh, p.en) + '</div><div class="s">' + LA(p.by) + ' · <span class="left">' + L('剩 ' + p.left + ' 天', p.left + ' days left') + '</span> · <a href="#" data-keep="' + i + '">' + L('兑现', 'Deliver') + ' $' + (p.cost || 20) + 'K</a></div></div></div>'; });
    h += '</div>' + sect(L('广播', 'Broadcasts'));
    CONTENT.broadcasts.forEach(function (b) { h += '<div class="row bc"><div class="tm">' + b.time + '</div><div><div class="t" style="font-size:12px"><i class="sw" style="display:inline-block;width:8px;height:8px;margin-right:4px;background:' + P(b.ch).color + '"></i>' + LA(b.name) + '</div><div style="font-size:12px">' + LA(b.t) + '</div></div></div>'; });
    h += '</div>' + sect(L('城镇', 'Towns'), '<span>' + L('第 1 - ' + D.towns.length + ' 项', '1 - ' + D.towns.length) + '</span>');
    D.towns.forEach(function (t, i) {
      h += '<div class="res r09" data-town="' + t.id + '"><img class="mk" src="../gimg/marker' + 'ABCDEFGHIJ'[i] + '.png" width="20" height="34" onerror="this.style.visibility=\'hidden\'"><div class="rb"><span class="nm">' + L(t.zh, t.en) + '</span>' +
        '<div class="ad">' + L('人口 ', 'Pop. ') + t.pop.toLocaleString() + ' · ' + L('病例 ', 'Cases ') + t.cases + ' · ' + L('民心 ', 'Mood ') + t.mood + '</div>' +
        '<div class="lks"><a href="#" data-zoom="' + t.id + '">' + L('放大', 'Zoom in') + '</a>' + (t.town ? ' - <a href="#" data-sat="' + t.id + '">' + L('卫星', 'Satellite') + '</a>' : '') + '</div></div></div>';
    });
    return h + '</div>';
  }
  function tabRegion() {
    var seen = D.regions.filter(function (r) { return r.seen && !r.fed; });
    var h = sect(L('相邻政府', 'Neighbouring governments'), '<span>' + L('共 ' + (seen.length + 1) + ' 个', (seen.length + 1) + ' total') + '</span>');
    seen.forEach(function (r) {
      h += '<div class="row ri" data-region="' + r.id + '">' + ico(r.res ? 'ppl' : 'globe') + '<div><div class="t"><a href="#">' + L(r.zh, r.en) + '</a></div><div class="s">' + LA(r.seat) + ' · ' + chip(r.stance) + L('病例 ', 'Cases ') + r.cases + (r.ref ? ' · ' + L('外来 ', 'Arrivals ') + r.ref.toLocaleString() : '') + '</div>' +
        '<div class="lk"><a href="#" data-zr="' + r.id + '">' + L('放大', 'Zoom') + '</a> - <a href="#">' + L('贸易', 'Trade') + '</a> - <a href="#">' + L('派联络员', 'Send liaison') + '</a></div></div></div>';
    });
    var f = region.Maricopa;
    h += '<div class="row" data-region="Maricopa"><div class="t"><a href="#">' + L('联邦控制区', 'Federal zone') + '</a></div><div class="s">' + L('凤凰城 · 马里科帕、皮纳尔、格雷厄姆、格林利', 'Phoenix · Maricopa, Pinal, Graham, Greenlee') + '</div></div>';
    h += '</div>' + sect(L('情况不明', 'No information'));
    D.regions.filter(function (r) { return !r.seen; }).forEach(function (r) { h += '<div class="row"><div class="t" style="color:#676767">' + L(r.zh, r.en) + '</div><div class="s">' + LA(r.status) + ' · <a href="#">' + L('派外勤 »', 'Send team »') + '</a></div></div>'; });
    h += '</div>' + sect(L('外勤', 'Field teams'));
    D.teams.forEach(function (t) { h += '<div class="row"><div class="t">' + L(t.zh, t.en) + '</div><div class="s">' + LA(t.where) + '</div></div>'; });
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
  function boardVote(l) {
    var v = D.board.map(function (b, i) {
      var base = (l.sup || [0, 0, 0, 0, 0])[i], s = b.tie === 'navajo' ? (S.stand.navajo - 50) / 15 : (S.trust - 50) / 15;
      return base + s + (MAP.hash(S.day, i, l.id.length) - .5) * .8 > 0;
    });
    var yes = v.filter(Boolean).length; S.lastVote = { id: l.id, v: v, yes: yes }; S.votes[l.id] = { yes: yes, day: S.day };
    return yes >= 3;
  }
  function tabLaws() {
    var h = sect(L('县监事会决议', 'Board of Supervisors resolutions')) + '</div>', g = null;
    D.laws.forEach(function (l) {
      if (l.id === 'deputize' && !S.flags.deputize) return;
      if (!g || g[0] !== l.g[0]) { if (g) h += '</div>'; g = l.g; h += sect(LA(l.g)); }
      var on = !!S.laws[l.id], dis = l.ex && S.laws[l.ex], vt = S.votes[l.id], failed = vt && !on && vt.day === S.day;
      h += '<div class="row law' + (dis ? ' dis' : '') + '"><div style="flex:1"><div class="t">' + L(l.zh, l.en) + '</div><div class="fx">' + LA(l.fx) + '</div></div>' +
        (on ? '<span class="signed">' + L('已通过 ' + vt0(l) , 'Passed ' + vt0(l)) + '</span>' : failed ? '<span class="signed" style="color:#c00">' + L('未通过 ' + vt.yes + '–' + (5 - vt.yes), 'Failed ' + vt.yes + '–' + (5 - vt.yes)) + '</span>' : '<button class="gbtn nd" data-sign="' + l.id + '"' + (dis ? ' disabled' : '') + '>' + L('表决', 'Vote') + '</button>') + '</div>';
    });
    return h + '</div>';
  }
  function tabBuild() {
    var h = sect(L('资金', 'Funds')) + '<div class="funds">';
    ['fed', 'navajo', 'lds', 'county'].forEach(function (k) { h += '<span>' + LA(P(k).short) + '</span><span class="fb"><i style="width:' + Math.min(100, S.funds[k] / 10) + '%;background:' + P(k).color + '"></i></span><b>' + money(S.funds[k]) + '</b>'; });
    h += '</div></div>';
    var cat = null;
    D.buildings.forEach(function (b) {
      if (cat !== b.cat) { if (cat) h += '</div>'; cat = b.cat; h += sect(LA(D.bcats[cat])); }
      var sel = S.bsel === b.id;
      h += '<div class="row bitem' + (sel ? ' sel' : '') + '" data-b="' + b.id + '"><span class="bico" style="background:' + (b.roof || '#b9a37e') + '"></span><div style="flex:1"><div class="t"><a href="#">' + L(b.zh, b.en) + '</a></div>' +
        '<div class="cost">' + money(b.cost) + ' · ' + L(b.days + ' 天', b.days + ' days') + (b.size ? ' · ' + b.size[0] + '×' + b.size[1] + ' m' : '') + ' · ' + b.fund.map(chip).join('') + '</div><div class="s">' + LA(b.fx) + '</div>';
      if (sel) h += '<div class="lk" style="margin-top:5px">' + L('出资：', 'Paid by: ') + b.fund.map(function (f) { return '<label style="margin-right:8px;color:#000"><input type="radio" name="bf" value="' + f + '"' + (S.bfund === f ? ' checked' : '') + '> ' + LA(P(f).short) + '</label>'; }).join('') + '</div><div style="margin-top:5px"><button class="gbtn nd" id="place">' + (b.convert ? L('选择建筑', 'Pick a building') : L('在地图上放置', 'Place on map')) + '</button></div>';
      h += '</div></div>';
    });
    h += '</div>' + sect(L('施工中', 'Under construction'));
    S.facilities.filter(function (f) { return !f.done; }).forEach(function (f) { h += '<div class="row"><div class="t">' + LA(f.name) + '</div><div class="s">' + chip(f.fund) + L('还要 ' + f.eta + ' 天', f.eta + ' days left') + '</div></div>'; });
    return h + '</div>';
  }

  // ---------- finance ----------
  var E = ECON;
  function fmtK(k) { var s = Math.round(Math.abs(k)).toLocaleString('en-US'); return (k < 0 ? '−$' : '$') + s + 'K'; }
  function revWk(r) { return r.lump && r.lump.months.indexOf(S.date.getMonth() + 1) >= 0 ? r.lump.wk : r.wk; }
  function shortage() { return Math.max(0, (S.panic - 20) / 100); }
  function econDay() {
    var ec = S.econ, inn = 0, out = 0;
    E.rev.forEach(function (r) { inn += revWk(r) / 7; }); E.exp.forEach(function (x) { out += x.wk / 7; });
    S.funds.county += inn - out; ec.wk.rev += inn; ec.wk.exp += out;
    ec.accr += ec.lgip * E.lgipRate / 365;
    if (S.funds.county < 0) { var w = -S.funds.county * .02 / 365; S.funds.county -= w; ec.wk.exp += w; if (S.date.getDay() === 1) apply({ trust: -1 }); }
    ec.loans.forEach(function (l) { if (l.rate) { var i = l.bal * l.rate / 365; S.funds.county -= i; ec.wk.exp += i; } });
    ec.pending = ec.pending.filter(function (q) { if (--q.days > 0) return true; var d = loanDef(q.id); S.funds.county += q.amt; if (!d.grant) ec.loans.push({ id: q.id, bal: q.amt, rate: d.rate, due: d.due, term: d.term }); else ec.used[q.id] = true; if (d.id === 'interfund') ec.flood -= q.amt; notice(L('到账：', 'Received: ') + LA([d.zh, d.en]) + ' ' + fmtK(q.amt)); return false; });
    var tmr = new Date(S.date.getTime() + 864e5); if (tmr.getDate() === 1) { ec.lgip += ec.accr; ec.accr = 0; }
    if (S.date.getDay() === 0) { ec.last = { rev: ec.wk.rev, exp: ec.wk.exp }; ec.wk = { rev: 0, exp: 0 }; }
  }
  function notice(html) { $('#ntext').innerHTML = html; $('#notice').hidden = false; }
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
    var keys = [['1'], ['2'], ['3'], ['CANCEL', 'k-red', T('取消', 'CANCEL')], ['4'], ['5', 'k-dot'], ['6'], ['CLEAR', 'k-yel', T('更正', 'CLEAR')], ['7'], ['8'], ['9'], ['ENTER', 'k-grn', T('确认', 'ENTER')], [''], ['0'], ['00'], ['']];
    $('#atmside').innerHTML = '<div class="prn"><div class="prn-slot"></div>' + (atm.receipt.length ? '<pre class="rcpt">' + atm.receipt.join('\n') + '</pre>' : '') + '</div>' +
      '<div class="epp">' + keys.map(function (k) { return k[0] ? '<button class="ek ' + (k[1] || '') + '" data-ek="' + k[0] + '">' + (k[2] || k[0]) + '</button>' : '<span class="ek blank"></span>'; }).join('') + '</div>' +
      '<div class="atm-note">' + L('县库专用终端 · 资金在县支票账户与州库地方政府投资池之间划转', 'Treasury terminal · moves money between county checking and the state LGIP') + '</div>';
  }
  function atmKey(k) {
    if (atm.st === 'busy') return;
    if (k === 'CANCEL') { atm.st = 'main'; atm.entry = ''; atm.msg = ''; return atmDraw(); }
    if (atm.st === 'main') {
      if (k === 'L1' || k === 'L2') { atm.mode = k === 'L1' ? 'in' : 'out'; atm.st = 'amt'; atm.entry = ''; atm.msg = ''; if (window.ATM3D) ATM3D.clearPile(); }
      else if (k === 'R1') { atm.st = 'bal'; receipt(['BALANCE INQUIRY']); }
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
    var v = +atm.entry || 0, from = atm.mode === 'in' ? S.funds.county : S.econ.lgip;
    if (v <= 0) return;
    if (v > from) { atm.msg = T('余额不足', 'INSUFFICIENT FUNDS'); atm.entry = ''; return atmDraw(); }
    if (atm.mode === 'in') { S.funds.county -= v; S.econ.lgip += v; } else { S.econ.lgip -= v; S.funds.county += v; }
    atm.st = 'busy'; atmDraw(); render();
    setTimeout(function () {
      ATM3D.focus('slot');
      ATM3D.play(atm.mode, Math.ceil(v / 100), function () { setTimeout(function () { ATM3D.focus('screen'); }, 1200); atm.st = 'done'; receipt([(atm.mode === 'in' ? 'DEPOSIT TO LGIP' : 'WITHDRAW TO CHECKING'), 'AMOUNT    ' + fmtK(v).padStart(16)]); atmDraw(); });
    }, 700);
  }
  function openAtm() {
    $('#atmwrap').hidden = false; atm.st = 'main'; atm.entry = ''; atmSide();
    var go = function () { ATM3D.mount($('#atmview')); ATM3D.setKeyHandler(atmKey); atmDraw(); };
    if (window.ATM3D) go(); else { var s = document.createElement('script'); s.type = 'module'; s.src = 'bank/atm3d.js'; s.onload = go; document.head.appendChild(s); }
  }
  document.addEventListener('keydown', function (e) {
    if ($('#atmwrap').hidden) return; var k = e.key;
    if (/^\d$/.test(k)) atmKey(k); else if (k === 'Enter') atmKey('ENTER'); else if (k === 'Backspace') atmKey('CLEAR'); else if (k === 'Escape') atmKey('CANCEL');
  });
  function tabMail() { return ''; }


  // ---------- map view ----------
  var cv = $('#map'), cx = cv.getContext('2d'), pane = $('#mappane'), W = 0, H = 0, DPR = window.devicePixelRatio || 1;
  var V = { z: 8, x: 0, y: 0 }, mode = 'map', layers = { fac: true, cases: true, res: true, fog: true };
  function center(lon, lat, z) { V.z = z; V.x = MAP.wx(lon, z); V.y = MAP.wy(lat, z); }
  function px(ll) { return [MAP.wx(ll[0], V.z) - V.x + W / 2, MAP.wy(ll[1], V.z) - V.y + H / 2]; }
  function unpx(x, y) { return [MAP.xlon(V.x - W / 2 + x, V.z), MAP.ylat(V.y - H / 2 + y, V.z)]; }
  function resize() { W = pane.clientWidth; H = pane.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; draw(); }
  var COUNTY = {}; MAP.R.counties.forEach(function (c) { COUNTY[c.n] = c; });
  var NAVAJO = COUNTY.Navajo;
  function seen(n) { if (n === 'Navajo') return true; var r = region[n]; return !!(r && r.seen); }
  function poly(rings, close) { cx.beginPath(); rings.forEach(function (r) { r.forEach(function (p, i) { var q = px(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); if (close) cx.closePath(); }); }
  function rrect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function label(x, y, zh, en, font, color, align, halo) {
    var t = LANG.mode() === 'en' ? en : zh; cx.font = font; cx.textAlign = align || 'center'; cx.lineJoin = 'round'; cx.lineWidth = 3; cx.strokeStyle = halo || 'rgba(255,255,255,.92)'; cx.fillStyle = color; cx.strokeText(t, x, y); cx.fillText(t, x, y);
    if (LANG.mode() === 'both' && en !== zh) { cx.font = '10px Arial'; cx.strokeText(en, x, y + 12); cx.fillText(en, x, y + 12); }
  }
  var drawPending = false;
  function draw() { if (drawPending) return; drawPending = true; requestAnimationFrame(function () { drawPending = false; drawNow(); }); }
  function drawNow() {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var sat = mode !== 'map';
    // base: fog everywhere
    cx.fillStyle = '#DCD9D3'; cx.fillRect(0, 0, W, H); fogTiles();
    if (sat) satTiles(); else baseMap();
    // fog over unseen counties
    MAP.R.counties.forEach(function (c) { if (seen(c.n)) return; poly(c.p, true); cx.save(); cx.clip(); cx.fillStyle = '#DCD9D3'; cx.fillRect(0, 0, W, H); fogTiles(); cx.restore(); });
    if (!sat || mode === 'hyb') overlay(sat);
    if (S.placing && hover) ghost();
    scale(); knob();
    $('#imgdate').innerHTML = sat ? L('影像 ©2009 DigitalGlobe, USDA Farm Service Agency - 影像日期：2007年6月', 'Imagery ©2009 DigitalGlobe, USDA Farm Service Agency - Imagery Date: Jun 2007') : L('地图数据 ©2009 Tele Atlas', 'Map data ©2009 Tele Atlas');
  }
  function fogTiles() {
    var ox = ((-V.x + W / 2) % 256 + 256) % 256, oy = ((-V.y + H / 2) % 256 + 256) % 256;
    cx.strokeStyle = '#CFCBC4'; cx.lineWidth = 1; cx.fillStyle = '#9C988F'; cx.font = '11px Arial'; cx.textAlign = 'center';
    for (var x = ox - 256; x < W; x += 256) for (var y = oy - 256; y < H; y += 256) { cx.strokeRect(x + .5, y + .5, 256, 256); cx.fillText(T('很抱歉，此缩放级别下', 'We are sorry, but we don\'t'), x + 128, y + 120); cx.fillText(T('该区域没有影像。', 'have imagery at this zoom level.'), x + 128, y + 135); }
  }
  function satTiles() {
    var x0 = Math.floor((V.x - W / 2) / 256), y0 = Math.floor((V.y - H / 2) / 256), x1 = Math.floor((V.x + W / 2) / 256), y1 = Math.floor((V.y + H / 2) / 256);
    MAP.clearQueue();
    var list = []; for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++) list.push([tx, ty]);
    var mx = (x0 + x1) / 2, my = (y0 + y1) / 2; list.sort(function (a, b) { return Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my); });
    cx.imageSmoothingEnabled = true;
    list.forEach(function (t) {
      var sx = t[0] * 256 - V.x + W / 2, sy = t[1] * 256 - V.y + H / 2, im = MAP.tile(V.z, t[0], t[1]);
      if (im) cx.drawImage(im, sx, sy, 256, 256); else { cx.fillStyle = '#7d7466'; cx.fillRect(sx, sy, 256, 256); }
    });
    if (MAP.queueLen()) setTimeout(function () { MAP.pump(3, draw); }, 0);
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
    R.roads.slice().sort(function (a, b) { return order[a.t] - order[b.t]; }).forEach(function (r) {
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
    if (!f.done) { cx.setLineDash([3, 2]); cx.strokeStyle = P(f.fund).color; cx.fillStyle = 'rgba(255,255,255,.85)'; rrect(x - 7, y - 7, 14, 14, 2); cx.fill(); cx.stroke(); cx.setLineDash([]); }
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
    if (drag) { var dx = e.clientX - drag[0], dy = e.clientY - drag[1]; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; V.x = drag[2] - dx; V.y = drag[3] - dy; closeInfo(); draw(); }
    else if (S.placing) { var r = cv.getBoundingClientRect(); hover = [e.clientX - r.left, e.clientY - r.top]; draw(); }
  });
  window.addEventListener('mouseup', function (e) { if (!drag) return; cv.classList.remove('dragging'); var r = cv.getBoundingClientRect(); if (!moved) click(e.clientX - r.left, e.clientY - r.top); drag = null; });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); var r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  cv.addEventListener('dblclick', function (e) { var r = cv.getBoundingClientRect(); zoomAt(1, e.clientX - r.left, e.clientY - r.top); });
  function zoomAt(d, sx, sy) {
    var nz = Math.max(ZMIN, Math.min(ZMAX, V.z + d)); if (nz === V.z) return;
    if (sx == null) { sx = W / 2; sy = H / 2; }
    var ll = unpx(sx, sy); V.z = nz; V.x = MAP.wx(ll[0], nz) - sx + W / 2; V.y = MAP.wy(ll[1], nz) - sy + H / 2;
    closeInfo(); draw();
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
  function infoFac(f) { var q = px(f.ll), b = bdefOf(f.b); openInfo(q[0], q[1] - 8, '<h3>' + LA(f.name) + '<small>' + L(b.zh, b.en) + '</small></h3><div class="kv"><span>' + L('出资', 'Paid by') + '</span><span style="color:#000">' + chip(f.fund) + '</span><span>' + L('状态', 'Status') + '</span>' + (f.done ? L('使用中', 'In use') : L('施工中，还要 ' + f.eta + ' 天', 'Building, ' + f.eta + ' days left')) + '</div><p class="muted" style="font-size:12px">' + LA(b.fx) + '</p>'); }
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
    var nf = { b: b.id, ll: ll, name: [b.zh, b.en], fund: f, done: false, eta: b.days, size: b.size, roof: b.roof, grid: b.grid, tower: b.tower, progress: 0 };
    S.facilities.push(nf); if (f !== 'county') { var d = {}; d[f] = 2; apply(d); }
    endPlace(); syncFac(); MAP.invalidate(ll); render(); draw();
  }
  function convert(b, bl, f) {
    if (S.funds[f] < b.cost) return hint(L(P(f).short[0] + '的钱不够。', 'Not enough ' + P(f).short[1] + ' money.'));
    S.funds[f] -= b.cost;
    var ll = MAP.m2ll([(bl.box[0] + bl.box[2]) / 2, (bl.box[1] + bl.box[3]) / 2]);
    S.facilities.push({ b: b.id, ll: ll, name: [(bl.name || '') + ' ' + b.zh.replace('改建为', ''), (bl.name || 'Building') + ' (' + b.en.replace('Convert to ', '') + ')'], fund: f, done: false, eta: b.days, conv: true, size: [10, 10] });
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
    var a = e.target.closest('a,button,[data-town],[data-region],[data-b],[data-mail]'); if (!a || a.closest('#logon')) return;
    var holder = e.target.closest('[data-b],[data-region],[data-town],[data-mail]'); if (a.tagName === 'A' && !Object.keys(a.dataset).length && holder && holder.contains(a)) { e.preventDefault(); a = holder; }
    var ds = a.dataset;
    if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault();
    if (ds.tab) { S.tab = ds.tab; render(); return; }
    if (a.id === 'openatm') { openAtm(); return; }
    if (ds.ek) { atmKey(ds.ek); return; }
    if (a.id === 'atmx' || a.id === 'atmx2') { $('#atmwrap').hidden = true; if (window.ATM3D) ATM3D.clearPile(); return; }
    if (ds.loan) { loanDialog(ds.loan); return; }
    if (ds.lno) { $('#dlgwrap').hidden = true; return; }
    if (ds.lgo) { var ld = loanDef(ds.lgo), amt = ld.grant ? ld.max : Math.max(0, Math.min(+($('#lamt') || {}).value || 0, ld.id === 'interfund' ? Math.floor(S.econ.flood / 2) : ld.max)); if (amt > 0) S.econ.pending.push({ id: ld.id, amt: amt, days: ld.days }); $('#dlgwrap').hidden = true; render(); return; }
    if (ds.ev != null) { var ce = S.curEv || startEvent(); S.seen[ce.id] = true; $('#dlgwrap').hidden = true; S.curEv = null; runDo(ce.opts[+ds.ev].do); render(); var nx = S.evq.shift(); if (nx) setTimeout(function () { eventDialog(nx); }, 300); return; }
    if (a.id === 'dlgx') { $('#dlgwrap').hidden = true; return; }
    if (a.id === 'infox') { closeInfo(); return; }
    if (ds.sp != null) { S.speed = +ds.sp; clock(); return; }
    if (a.id === 'nextday') { for (var i = 0; i < 24; i++) tick(); return; }
    if (ds.zoom) { var t = town[ds.zoom]; center(t.ll[0], t.ll[1], t.town ? 15 : 12); setMode('map'); infoTown(t); return; }
    if (ds.sat) { var t1 = town[ds.sat]; center(t1.ll[0], t1.ll[1], 17); setMode('sat'); closeInfo(); return; }
    if (ds.zr) { var r0 = region[ds.zr], c0 = r0.county ? COUNTY[r0.county].c : r0.res ? centroidRes(r0.res) : [-110.3, 34.9]; center(c0[0], c0[1], 9); closeInfo(); draw(); return; }
    if (ds.keep != null) { var pr = S.promises[+ds.keep]; S.funds.county -= (pr.cost || 20); S.promises.splice(+ds.keep, 1); apply({ trust: 4 }); render(); return; }
    if (ds.sign) { var l = D.laws.filter(function (x) { return x.id === ds.sign; })[0]; if (!boardVote(l)) { render(); return; } S.laws[l.id] = true; if (l.d) apply(l.d); var dd = { std_fed: { fed: 6, navajo: -6 }, std_navajo: { navajo: 6, fed: -6 }, school_close: { trust: -2 }, bnsf: { fed: 2 }, quota: { fed: 3, trust: -1 } }[l.id]; apply(dd); render(); return; }
    if (ds.conv) { var p = ds.conv.split(':'), bd = bdefOf(p[0]); S.bsel = bd.id; S.bfund = S.bfund && bd.fund.indexOf(S.bfund) >= 0 ? S.bfund : bd.fund[0]; convert(bd, MAP.BLD[+p[1]], S.bfund); S.tab = 'build'; render(); return; }
    if (ds.b && !e.target.closest('input,#place')) { S.bsel = S.bsel === ds.b ? null : ds.b; S.bfund = S.bsel ? bdefOf(S.bsel).fund[0] : null; render(); return; }
    if (a.id === 'place') { var bb = bdefOf(S.bsel); S.placing = true; cv.style.cursor = 'crosshair'; if (V.z < 15 || !MAP.inTown(MAP.xlon(V.x, V.z), MAP.ylat(V.y, V.z))) { center(town.holbrook.ll[0], town.holbrook.ll[1], 16); } hint(bb.convert ? L('点击一栋建筑。Esc 取消。', 'Click a building. Esc to cancel.') : L('点击本县辖区内的空地放置。Esc 取消。', 'Click open ground in county jurisdiction. Esc to cancel.')); draw(); return; }
    if (ds.mail != null && !e.target.closest('button')) { var i2 = +ds.mail; S.mail[i2].unread = false; S.openMail = S.openMail === i2 ? -1 : i2; render(); return; }
    if (ds.act) {
      var pp = ds.act.split(':'), m = S.mail[+pp[0]], act = m.acts[+pp[1]];
      runDo(act.do); m.done = act.done || ['已处理', 'Done']; render(); if (window.GMAIL) GMAIL.refresh(); return;
    }
    if (a.id === 'zin') return zoomAt(1);
    if (a.id === 'zout') return zoomAt(-1);
    var pan = { pn: [0, -1], ps: [0, 1], pw: [-1, 0], pe: [1, 0] }[a.id];
    if (pan) { V.x += pan[0] * W / 3; V.y += pan[1] * H / 3; draw(); return; }
    if (a.id === 'pc') { center(-110.3, 34.75, 8); draw(); return; }
    if (ds.mode) { setMode(ds.mode); return; }
    if (a.id === 'morebtn') { $('#moremenu').hidden = !$('#moremenu').hidden; return; }
    if (a.id === 'nview') { S.tab = 'ov'; render(); $('#notice').hidden = true; return; }
    if (a.id === 'nx') { $('#notice').hidden = true; return; }
    if (ds.region) { var r = region[ds.region], c2 = r.county ? COUNTY[r.county].c : centroidRes(r.res); center(c2[0], c2[1], 9); draw(); var q = px(c2); infoRegion(r, q[0], q[1]); return; }
    if (ds.town) { var t3 = town[ds.town]; center(t3.ll[0], t3.ll[1], t3.town ? 13 : 11); draw(); infoTown(t3); return; }
  });
  function centroidRes(n) { var r = MAP.R.res.filter(function (x) { return x.n === n; })[0], x = 0, y = 0, k = 0; r.p[0].forEach(function (p) { x += p[0]; y += p[1]; k++; }); return [x / k, y / k]; }
  document.addEventListener('change', function (e) { if (e.target.name === 'bf') S.bfund = e.target.value; if (e.target.dataset.ly) { layers[e.target.dataset.ly] = e.target.checked; draw(); } });
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
    S.hour++;
    if (S.hour >= 24) {
      S.hour = 0; S.day++; S.date = new Date(S.date.getTime() + 864e5); S.dstand = { fed: 0, navajo: 0, lds: 0 };
      S.facilities.forEach(function (f) { if (!f.done) { f.eta--; f.progress = Math.min(1, f.progress + 1 / Math.max(1, f.eta + 1)); if (f.eta <= 0) f.done = true; MAP.invalidate(f.ll); } });
      S.promises.forEach(function (p) { p.left--; if (p.left === 0) apply({ trust: -8 }); }); S.promises = S.promises.filter(function (p) { return p.left > 0; });
      D.towns.forEach(function (t) { if (t.cases) t.cases += Math.round(MAP.hash(S.day, t.pop, 1) * 2); });
      if (S.laws.hours) apply({ trust: -1 });
      econDay();
      var ymd = S.date.getFullYear() + '-' + ('0' + (S.date.getMonth() + 1)).slice(-2) + '-' + ('0' + S.date.getDate()).slice(-2);
      contentDay();
      syncFac(); render(); draw();
    }
    clock();
  }
  setInterval(function () { for (var i = 0; i < S.speed; i++) tick(); }, 1000);

  // ---------- boot ----------
  window.GAME_START = function () {
    syncFac(); render(); clock(); resize(); center(-110.3, 34.75, 8); draw();
    $('#ntext').innerHTML = '<b>' + L('州应急管理局：', 'State emergency management: ') + '</b>' + L('明天上午 9 点公布新的病例标准。', 'New case criteria at 9 am tomorrow.'); $('#notice').hidden = false;
    setTimeout(function () { eventDialog(startEvent()); }, 900);
  };
  LANG.set('zh');
  $('#gearmenu').addEventListener('click', function () { setTimeout(function () { render(); clock(); draw(); }, 0); });
  window.addEventListener('resize', resize);
  syncFac(); render(); clock(); resize(); center(-110.3, 34.75, 8);
  window.GAME = { S: S, V: V, center: center, setMode: setMode, draw: draw, render: render, eventDialog: eventDialog };
})();
