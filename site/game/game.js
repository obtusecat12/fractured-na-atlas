// game.js — 莫诺卡西病：约洛县 原型 / Monocacy: Yolo County prototype.
// Map, sidebar panels, ordinances, building, dispatches and events on the 2009 Google Maps shell.
(function () {
  'use strict';
  var D = DATA, $ = function (s) { return document.querySelector(s); };
  function L(zh, en) { return '<span class="zh">' + zh + '</span><span class="bi"> </span><span class="en">' + en + '</span>'; }
  function LA(a) { return L(a[0], a[1]); }
  function T(zh, en) { var m = LANG.mode(); return m === 'en' ? en : zh; }
  function P(id) { return D.powers[id]; }
  function chip(id) { var p = P(id); return '<span class="chip" style="background:' + p.color + '">' + LA(p.short) + '</span>'; }
  function money(k) { return '$' + (k >= 1000 ? (k / 1000).toFixed(2).replace(/0$/, '') + 'M' : k + 'K'); }

  // ---------- state ----------
  var S = {
    day: D.start.day, date: new Date(D.start.y, D.start.m - 1, D.start.d), hour: D.start.hour, speed: 0,
    trust: 62, panic: 28,
    stand: { gov: 55, council: 48, calema: 41 }, dstand: { gov: 0, council: 0, calema: 0 },
    funds: { gov: 600, council: 300, calema: 1400, county: 450 },
    facilities: D.facilities.map(function (f) { return Object.assign({}, f); }),
    laws: {}, mail: D.mail.map(function (m) { return Object.assign({}, m); }),
    promises: D.promises.map(function (p) { return Object.assign({}, p); }),
    tab: 'ov', bsel: null, bfund: null, placing: false, openMail: -1, log: []
  };
  D.laws.forEach(function (l) { if (l.on) S.laws[l.id] = true; });
  var town = {}; D.towns.forEach(function (t) { town[t.id] = t; });
  var region = {}; D.regions.forEach(function (r) { region[r.id] = r; });
  var bdef = {}; D.buildings.forEach(function (b) { bdef[b.id] = b; });

  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function apply(d) {
    if (!d) return;
    if (d.trust) S.trust = clamp(S.trust + d.trust);
    if (d.panic) S.panic = clamp(S.panic + d.panic);
    ['gov', 'council', 'calema'].forEach(function (k) { if (d[k]) { S.stand[k] = clamp(S.stand[k] + d[k]); S.dstand[k] = d[k]; } });
    meters();
  }

  // ---------- header: clock & meters ----------
  var WD = [['星期日', 'Sunday'], ['星期一', 'Monday'], ['星期二', 'Tuesday'], ['星期三', 'Wednesday'], ['星期四', 'Thursday'], ['星期五', 'Friday'], ['星期六', 'Saturday']];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function clock() {
    var d = S.date, h = S.hour, ap = h < 12 ? ['上午', 'AM'] : ['下午', 'PM'], h12 = h % 12 || 12;
    $('#cdate').innerHTML = '<span class="dn">' + L('第 ' + S.day + ' 天', 'Day ' + S.day) + ' · </span><b>' +
      L(d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日', MON[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()) + '</b> ' +
      LA(WD[d.getDay()]) + ' · ' + L(ap[0] + ' ' + h12 + ':00', h12 + ':00 ' + ap[1]);
    document.querySelectorAll('#cbtns [data-sp]').forEach(function (b) { b.classList.toggle('on', +b.dataset.sp === S.speed); });
  }
  function meters() {
    [['#m-trust', S.trust], ['#m-panic', S.panic]].forEach(function (a) { var e = $(a[0]); e.querySelector('i').style.width = a[1] + '%'; e.querySelector('b').textContent = a[1]; });
    $('#stand').innerHTML = ['gov', 'council', 'calema'].map(function (k) {
      var dd = S.dstand[k]; return '<span class="sp" title="' + P(k).zh + ' ' + P(k).en + '"><i class="sw" style="background:' + P(k).color + '"></i>' + LA(P(k).short) + ' <b>' + S.stand[k] + '</b>' + (dd ? '<span class="' + (dd > 0 ? 'up' : 'dn') + '">' + (dd > 0 ? '▲' : '▼') + Math.abs(dd) + '</span>' : '') + '</span>';
    }).join('');
    var n = S.mail.filter(function (m) { return m.unread; }).length; $('#mailn').textContent = n ? '(' + n + ')' : '';
  }

  // ---------- sidebar ----------
  function sect(title, right) { return '<div class="sect"><div class="sh"><span style="font-weight:bold;font-size:13px">' + title + '</span>' + (right || '') + '</div>'; }
  function render() {
    var h = '';
    if (S.tab === 'ov') h = tabOverview();
    else if (S.tab === 'nb') h = tabRegion();
    else if (S.tab === 'law') h = tabLaws();
    else if (S.tab === 'build') h = tabBuild();
    else if (S.tab === 'mail') h = tabMail();
    $('#results').innerHTML = h;
    document.querySelectorAll('#barl [data-tab]').forEach(function (a) { a.classList.toggle('on', a.dataset.tab === S.tab); });
    meters();
  }
  function tabOverview() {
    var pop = 0, cases = 0; D.towns.forEach(function (t) { pop += t.pop; cases += t.cases; });
    var h = sect(L('约洛县', 'Yolo County'), '<span>' + L('人口 ', 'Pop. ') + (pop + 15800).toLocaleString() + '</span>') +
      '<div class="stats"><div>' + L('确诊病例', 'Confirmed cases') + '<b>' + cases + '</b></div><div>' + L('今日新增', 'New today') + '<b>+3</b></div>' +
      '<div>' + L('已安置的外来者', 'Arrivals housed') + '<b>2,140</b></div><div>' + L('等待安置', 'Waiting') + '<b>380</b></div>' +
      '<div>' + L('粮食储备', 'Food reserve') + '<b>' + L('41 天', '41 days') + '</b></div><div>' + L('劳动力', 'Labour') + '<b>87%</b></div></div></div>';
    h += sect(L('承诺', 'Promises'), '<span>' + L('做不到，信任会大跌', 'Miss one and trust drops') + '</span>');
    S.promises.forEach(function (p) {
      h += '<div class="row"><div class="t">' + L(p.zh, p.en) + '</div><div class="s">' + LA(p.by) + ' · <span class="left">' + L('剩 ' + p.left + ' 天', p.left + ' days left') + '</span></div></div>';
    });
    h += '</div>' + sect(L('广播', 'Broadcasts'), '<a href="#">' + L('全部频道 »', 'All channels »') + '</a>');
    D.broadcasts.forEach(function (b) {
      var c = b.ch === 'local' ? '#3A8A3A' : P(b.ch).color;
      h += '<div class="row bc"><div class="tm">' + b.time + '</div><div><div class="t" style="font-size:12px"><i class="sw" style="display:inline-block;width:8px;height:8px;margin-right:4px;background:' + c + '"></i>' + LA(b.name) + '</div><div style="font-size:12px">' + LA(b.t) + '</div></div></div>';
    });
    h += '</div>' + sect(L('城镇', 'Towns'), '<span>' + L('第 1 – 8 项', '1 – 8') + '</span>');
    D.towns.forEach(function (t, i) {
      h += '<div class="res r09" data-town="' + t.id + '"><img class="mk" src="../gimg/marker' + 'ABCDEFGH'[i] + '.png" width="20" height="34"><div class="rb"><span class="nm">' + L(t.zh, t.en) + '</span>' +
        '<div class="ad">' + L('人口 ', 'Pop. ') + t.pop.toLocaleString() + ' · ' + L('病例 ', 'Cases ') + t.cases + ' · ' + L('民心 ', 'Mood ') + t.mood + '</div>' +
        '<div class="lks"><a href="#" data-zoom="' + t.id + '">' + L('放大', 'Zoom in') + '</a> - <a href="#" data-buildat="' + t.id + '">' + L('在此建造 »', 'Build here »') + '</a></div></div></div>';
    });
    return h + '</div>';
  }
  function tabRegion() {
    var h = sect(L('周边政权', 'Neighbouring authorities'), '<span>' + L('已知 8 个', '8 known') + '</span>');
    D.regions.filter(function (r) { return r.seen; }).forEach(function (r) {
      h += '<div class="row" data-region="' + r.id + '"><div class="t"><a href="#">' + L(r.zh, r.en) + '</a></div>' +
        '<div class="s">' + L('倾向 ', 'Leans ') + chip(r.stance) + L('病例 ', 'Cases ') + r.cases + ' · ' + L('外来者 ', 'Arrivals ') + r.ref.toLocaleString() + '</div>' +
        '<div class="s">' + L('影像日期 ', 'Imagery ') + r.date + '</div>' +
        '<div class="lk"><a href="#" data-zr="' + r.id + '">' + L('放大', 'Zoom') + '</a> - <a href="#">' + L('贸易', 'Trade') + '</a> - <a href="#">' + L('派联络官', 'Send liaison') + '</a></div></div>';
    });
    h += '</div>' + sect(L('迷雾中的地区', 'Areas in the fog'), '<span>' + L('只知道大概', 'Rough status only') + '</span>');
    D.regions.filter(function (r) { return !r.seen; }).forEach(function (r) {
      h += '<div class="row"><div class="t" style="color:#676767">' + L(r.zh, r.en) + '</div><div class="s">' + LA(r.status) + ' · <a href="#">' + L('派外勤队 »', 'Send field team »') + '</a></div></div>';
    });
    h += '<div class="row"><div class="t" style="color:#676767">' + L('杰斐逊州运动', 'State of Jefferson movement') + '</div><div class="s">' + L('北方 · 情报有限', 'To the north · little intel') + '</div></div>';
    h += '</div>' + sect(L('外勤队', 'Field teams'));
    D.teams.forEach(function (t) { h += '<div class="row"><div class="t">' + L(t.zh, t.en) + '</div><div class="s">' + LA(t.where) + '</div></div>'; });
    return h + '</div>';
  }
  function tabLaws() {
    var h = '', g = null;
    D.laws.forEach(function (l) {
      if (!g || g[0] !== l.g[0]) { if (g) h += '</div>'; g = l.g; h += sect(LA(l.g)); }
      var on = !!S.laws[l.id], dis = l.ex && S.laws[l.ex];
      h += '<div class="row law' + (dis ? ' dis' : '') + '"><div style="flex:1"><div class="t">' + L(l.zh, l.en) + '</div><div class="fx">' + LA(l.fx) + (dis ? ' · ' + L('与已签署的条例冲突', 'conflicts with a signed ordinance') : '') + '</div></div>' +
        (on ? '<span class="signed">' + L('已签署', 'Signed') + '</span>' : '<button class="gbtn nd" data-sign="' + l.id + '"' + (dis ? ' disabled' : '') + '>' + L('签署', 'Sign') + '</button>') + '</div>';
    });
    return h + '</div>' + '<div class="row s" style="color:#676767;font-size:12px">' + L('签署后 3 天内不能撤销。', 'A signed ordinance cannot be revoked for 3 days.') + '</div>';
  }
  function tabBuild() {
    var h = sect(L('可用资金', 'Funds'), '<span>' + L('用谁的钱，就挂谁的牌子', 'Whoever pays, their name goes on it') + '</span>') + '<div class="funds">';
    ['gov', 'council', 'calema', 'county'].forEach(function (k) {
      h += '<span>' + LA(P(k).short) + '</span><span class="fb"><i style="width:' + Math.min(100, S.funds[k] / 15) + '%;background:' + P(k).color + '"></i></span><b>' + money(S.funds[k]) + '</b>';
    });
    h += '</div></div>';
    var cat = null;
    D.buildings.forEach(function (b) {
      if (cat !== b.cat) { if (cat) h += '</div>'; cat = b.cat; h += sect(LA(D.bcats[cat])); }
      var sel = S.bsel === b.id;
      h += '<div class="row bitem' + (sel ? ' sel' : '') + '" data-b="' + b.id + '"><span class="bico" style="background:' + b.icon + '"></span><div style="flex:1"><div class="t"><a href="#">' + L(b.zh, b.en) + '</a></div>' +
        '<div class="cost">' + money(b.cost) + ' · ' + L(b.days + ' 天建成', b.days + ' days') + ' · ' + b.fund.map(chip).join('') + '</div><div class="s">' + LA(b.fx) + '</div>';
      if (sel) {
        h += '<div class="lk" style="margin-top:5px">' + L('出资方：', 'Paid by: ') + b.fund.map(function (f) {
          return '<label style="margin-right:8px;color:#000"><input type="radio" name="bf" value="' + f + '"' + (S.bfund === f ? ' checked' : '') + '> ' + LA(P(f).short) + '</label>';
        }).join('') + '</div><div style="margin-top:5px"><button class="gbtn nd" id="place">' + L('在地图上放置', 'Place on map') + '</button></div>';
      }
      h += '</div></div>';
    });
    h += '</div>' + sect(L('在建', 'Under construction'));
    S.facilities.filter(function (f) { return !f.done; }).forEach(function (f) {
      h += '<div class="row"><div class="t">' + LA(f.name) + '</div><div class="s">' + chip(f.fund) + L('还要 ' + f.eta + ' 天', f.eta + ' days left') + '</div></div>';
    });
    return h + '</div>';
  }
  function fromName(m) { return m.from === 'nb' ? LA(m.nb) : LA(P(m.from).short); }
  function tabMail() {
    var h = sect(L('公文', 'Dispatches'), '<span>' + L('第 1 - ' + S.mail.length + ' 封', '1 - ' + S.mail.length) + '</span>') + '</div>';
    S.mail.forEach(function (m, i) {
      var c = m.from === 'nb' ? '#888' : P(m.from).color;
      h += '<div class="mrow' + (m.unread ? ' unread' : '') + '" data-mail="' + i + '"><div class="from"><i style="display:inline-block;width:8px;height:8px;margin-right:4px;background:' + c + '"></i>' + fromName(m) + '</div>' +
        '<div class="bd"><span class="mt1">' + LA(m.t) + '</span> <span class="ms">- ' + LA(m.s) + '</span></div><div class="tm">' + (m.time.indexOf(' ') > 0 ? LA(m.time.split(' ')) : m.time) + '</div></div>';
      if (S.openMail === i) {
        var lh = m.from === 'nb' ? LA(m.nb) : L(P(m.from).zh, P(m.from).en);
        h += '<div class="mopen"><div class="lh" style="border-left:4px solid ' + c + '"><b>' + lh + '</b>' + (m.id ? L('文号 ', 'Ref. ') + m.id : '') + '</div><p style="margin:0 0 8px"><b>' + LA(m.t) + '</b><br>' + LA(m.s) + '</p>' +
          (m.done ? '<span class="signed">' + LA(m.done) + '</span>' : m.acts.map(function (a, j) { return '<button class="gbtn nd" data-act="' + i + ':' + j + '">' + LA(a) + '</button>'; }).join(' ')) + '</div>';
      }
    });
    return h;
  }

  // ---------- map ----------
  var cv = $('#map'), cx = cv.getContext('2d'), pane = $('#mappane');
  var V = { lon: -121.78, lat: 38.64, z: 10 }, W = 0, H = 0, DPR = window.devicePixelRatio || 1, COS = Math.cos(38.6 * Math.PI / 180);
  var mode = 'map', layers = { fac: true, cases: true, ref: true, cov: true };
  function K() { return Math.pow(2, V.z) * 256 / 360; }
  function px(ll) { var k = K(); return [(ll[0] - V.lon) * k * COS + W / 2, -(ll[1] - V.lat) * k + H / 2]; }
  function unpx(x, y) { var k = K(); return [V.lon + (x - W / 2) / (k * COS), V.lat - (y - H / 2) / k]; }
  function resize() { W = pane.clientWidth; H = pane.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; draw(); }
  function path(rings) { cx.beginPath(); rings.forEach(function (r) { r.forEach(function (p, i) { var q = px(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); cx.closePath(); }); }
  function line(pts) { cx.beginPath(); pts.forEach(function (p, i) { var q = px(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); }
  function centroid(rings) { var a = 0, x = 0, y = 0, r = rings[0]; for (var i = 0, j = r.length - 1; i < r.length; j = i++) { var f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; a += f; x += (r[j][0] + r[i][0]) * f; y += (r[j][1] + r[i][1]) * f; } return [x / (3 * a), y / (3 * a)]; }
  var LABEL_AT = { Sacramento: [-121.27, 38.42], Solano: [-121.92, 38.27], Yolo: [-121.9, 38.75], Placer: [-121.1, 38.9], Contra: null };
  var SEEN = function (n) { return n === 'Yolo' || (region[n] && region[n].seen); };
  function stanceColor(n) { if (n === 'Yolo') return '#3A8A3A'; var r = region[n]; return r && r.stance ? P(r.stance).color : null; }

  function draw() {
    var k = K(); cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // fog background: Google "no imagery" grey with tile grid
    cx.fillStyle = '#DCD9D3'; cx.fillRect(0, 0, W, H);
    fogTiles();
    var names = Object.keys(COUNTIES);
    // seen land
    names.forEach(function (n) { if (!SEEN(n)) return; path(COUNTIES[n]); cx.fillStyle = '#F2EFE9'; cx.fill(); });
    // overlays
    if (mode === 'fac') names.forEach(function (n) { var c = stanceColor(n); if (!c || !SEEN(n)) return; path(COUNTIES[n]); cx.globalAlpha = n === 'Yolo' ? .22 : .30; cx.fillStyle = c; cx.fill(); cx.globalAlpha = 1; });
    if (mode === 'heat') names.forEach(function (n) { if (!SEEN(n) || n === 'Yolo') return; var r = region[n]; path(COUNTIES[n]); cx.fillStyle = 'rgba(204,40,30,' + Math.min(.45, .05 + r.cases / 900) + ')'; cx.fill(); });
    // clip to seen for line work
    cx.save(); cx.beginPath(); names.forEach(function (n) { if (!SEEN(n)) return; COUNTIES[n].forEach(function (r) { r.forEach(function (p, i) { var q = px(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); cx.closePath(); }); }); cx.clip();
    // water
    cx.lineCap = cx.lineJoin = 'round';
    line(D.bypass); cx.strokeStyle = '#B5D0D0'; cx.lineWidth = Math.min(4, Math.max(2, k / 220)); cx.setLineDash([]); cx.stroke();
    line(D.river); cx.strokeStyle = '#99B3CC'; cx.lineWidth = Math.min(6, Math.max(2.5, k / 160)); cx.stroke();
    // roads
    D.roads.forEach(function (r) { if (r.k !== 'hwy') return; line(r.pts); cx.strokeStyle = '#D9C95A'; cx.lineWidth = Math.min(6, Math.max(3, k / 150)); cx.stroke(); cx.strokeStyle = '#FFFD8B'; cx.lineWidth = Math.min(4.4, Math.max(1.6, k / 150 - 1.6)); cx.stroke(); });
    D.roads.forEach(function (r) { if (r.k !== 'fwy') return; line(r.pts); cx.strokeStyle = '#E09B2D'; cx.lineWidth = Math.min(8, Math.max(4, k / 110)); cx.stroke(); cx.strokeStyle = '#FFC345'; cx.lineWidth = Math.min(6, Math.max(2.4, k / 110 - 2)); cx.stroke(); });
    if (mode === 'heat') D.towns.forEach(function (t) { if (!t.cases) return; var q = px(t.ll), rr = 8 + Math.sqrt(t.cases) * k / 260; var g = cx.createRadialGradient(q[0], q[1], 0, q[0], q[1], rr); g.addColorStop(0, 'rgba(220,30,20,.55)'); g.addColorStop(1, 'rgba(220,30,20,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(q[0], q[1], rr, 0, 7); cx.fill(); });
    cx.restore();
    // county borders
    names.forEach(function (n) {
      path(COUNTIES[n]);
      if (n === 'Yolo') { cx.setLineDash([]); cx.strokeStyle = 'rgba(160,60,140,.35)'; cx.lineWidth = 5; cx.stroke(); cx.strokeStyle = '#A03C8C'; cx.lineWidth = 1.6; cx.setLineDash([6, 3]); cx.stroke(); }
      else { cx.strokeStyle = SEEN(n) ? '#9A8FA0' : '#C9C6C0'; cx.lineWidth = 1; cx.setLineDash([4, 3]); cx.stroke(); }
    });
    cx.setLineDash([]);
    // EOC coverage
    if (layers.cov) { var w = px(town.woodland.ll), rr = 0.26 * k; cx.beginPath(); cx.arc(w[0], w[1], rr, 0, 7); cx.fillStyle = 'rgba(51,102,204,.05)'; cx.fill(); cx.strokeStyle = 'rgba(51,102,204,.55)'; cx.setLineDash([3, 3]); cx.stroke(); cx.setLineDash([]); }
    // shields
    D.roads.forEach(function (r) { var p = r.pts[Math.floor(r.pts.length / 2)], q = px(p); if (q[0] < 0 || q[1] < 0 || q[0] > W || q[1] > H) return; shield(q[0], q[1], r.ref, r.k); });
    // county labels
    names.forEach(function (n) {
      var r = region[n], c = LABEL_AT[n] || centroid(COUNTIES[n]), q = px(c);
      if (n === 'Yolo') return label(q[0], q[1], T('约洛县', 'YOLO'), 'YOLO COUNTY', 'bold 15px Arial', '#7A2E6C', true);
      if (!r) return;
      if (r.seen) label(q[0], q[1], r.zh, r.en.toUpperCase(), 'bold 12px Arial', '#6E6478', true);
      else { label(q[0], q[1] - 8, r.zh, r.en, '12px Arial', '#9A968E', true); label(q[0], q[1] + 8, r.status[0], r.status[1], '11px Arial', '#9A968E', true); }
    });
    // big neighbour city
    var s = px([-121.4944, 38.5816]); dot(s[0], s[1], 5, '#fff', '#555'); label(s[0] + 8, s[1] + 4, '萨克拉门托', 'Sacramento', 'bold 13px Arial', '#222', false, 'left');
    label(s[0] + 8, s[1] + 18, '州议会 · Cal EMA', 'Capitol · Cal EMA', '11px Arial', '#555', false, 'left');
    // arrivals arrow on I-80
    if (layers.ref) { var a = px([-121.93, 38.39]), b = px([-121.84, 38.44]); arrow(a, b); label(a[0] - 4, a[1] + 16, '湾区来者 +120/天', 'From the Bay +120/day', 'bold 11px Arial', '#B03A2E', false); }
    // facilities
    if (layers.fac) S.facilities.forEach(function (f) { var q = px(f.ll); fac(q[0], q[1], f); });
    // towns
    D.towns.forEach(function (t) {
      var q = px(t.ll), big = t.pop > 20000;
      if (!big && V.z < 10) return;
      dot(q[0], q[1], big ? 4.5 : 3, '#fff', '#666');
      if (t.seat) { cx.fillStyle = '#C0392B'; star(q[0], q[1], 6); }
      if (t.lab === 'l') label(q[0] - 7, q[1] + 4, t.zh, t.en, (big ? 'bold 13px' : '12px') + ' Arial', '#222', false, 'right'); else label(q[0] + 7, q[1] + 4, t.zh, t.en, (big ? 'bold 13px' : '12px') + ' Arial', '#222', false, 'left');
      if (layers.cases && t.cases && mode !== 'heat') { cx.font = 'bold 10px Arial'; var tx = '' + t.cases, w2 = cx.measureText(tx).width + 6; cx.fillStyle = '#C4372A'; rrect(q[0] - w2 - 6, q[1] - 15, w2, 12, 6); cx.fill(); cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.fillText(tx, q[0] - w2 / 2 - 6, q[1] - 5.5); }
    });
    if (S.placing && hover) { cx.globalAlpha = .6; fac(hover[0], hover[1], { b: S.bsel, fund: S.bfund, done: true, ghost: true }); cx.globalAlpha = 1; }
    $('#imgdate').innerHTML = L('影像日期：2009年10月12日', 'Imagery Date: Oct 12, 2009');
    scale();
  }
  function fogTiles() {
    var k = K(), ox = ((-(V.lon) * k * COS + W / 2) % 256 + 256) % 256, oy = ((V.lat * k + H / 2) % 256 + 256) % 256;
    cx.strokeStyle = '#CFCBC4'; cx.lineWidth = 1; cx.fillStyle = '#9C988F'; cx.font = '11px Arial'; cx.textAlign = 'center';
    for (var x = ox - 256; x < W; x += 256) for (var y = oy - 256; y < H; y += 256) {
      cx.strokeRect(x + .5, y + .5, 256, 256);
      cx.fillText(T('很抱歉，此缩放级别下', 'We are sorry, but we don\'t'), x + 128, y + 120);
      cx.fillText(T('该区域没有影像。', 'have imagery at this zoom level.'), x + 128, y + 135);
    }
  }
  function label(x, y, zh, en, font, color, center, align) {
    var t = LANG.mode() === 'en' ? en : zh; cx.font = font; cx.textAlign = align || 'center'; cx.lineWidth = 3; cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.fillStyle = color;
    cx.strokeText(t, x, y); cx.fillText(t, x, y);
    if (LANG.mode() === 'both' && en !== zh) { cx.font = '10px Arial'; cx.strokeText(en, x, y + 12); cx.fillText(en, x, y + 12); }
  }
  function dot(x, y, r, f, s) { cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fillStyle = f; cx.fill(); cx.strokeStyle = s; cx.lineWidth = 1.2; cx.stroke(); }
  function star(x, y, r) { cx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; cx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } cx.closePath(); cx.fill(); }
  function rrect(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function shield(x, y, ref, kind) {
    var n = ref.replace(/^\D+-/, ''); cx.font = 'bold 10px Arial'; var w = Math.max(18, cx.measureText(n).width + 8);
    if (/^I-/.test(ref)) { cx.fillStyle = '#fff'; rrect(x - w / 2 - 1, y - 9, w + 2, 17, 4); cx.fill(); cx.fillStyle = '#1F4E9C'; rrect(x - w / 2, y - 8, w, 15, 4); cx.fill(); cx.fillStyle = '#C4372A'; cx.fillRect(x - w / 2 + 1, y - 7, w - 2, 3); }
    else { cx.fillStyle = '#fff'; cx.strokeStyle = '#2F6B2F'; cx.lineWidth = 1.2; rrect(x - w / 2, y - 8, w, 15, 3); cx.fill(); cx.stroke(); }
    cx.fillStyle = /^I-/.test(ref) ? '#fff' : '#2F6B2F'; cx.textAlign = 'center'; cx.fillText(n, x, y + 3.5);
  }
  function arrow(a, b) { cx.strokeStyle = '#B03A2E'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); var ang = Math.atan2(b[1] - a[1], b[0] - a[0]); cx.fillStyle = '#B03A2E'; cx.beginPath(); cx.moveTo(b[0] + 8 * Math.cos(ang), b[1] + 8 * Math.sin(ang)); cx.lineTo(b[0] + 7 * Math.cos(ang + 2.3), b[1] + 7 * Math.sin(ang + 2.3)); cx.lineTo(b[0] + 7 * Math.cos(ang - 2.3), b[1] + 7 * Math.sin(ang - 2.3)); cx.closePath(); cx.fill(); }
  function fac(x, y, f) {
    var b = bdef[f.b]; cx.fillStyle = b.icon; cx.strokeStyle = '#fff'; cx.lineWidth = 1.5;
    if (!f.done) { cx.setLineDash([3, 2]); cx.strokeStyle = b.icon; cx.fillStyle = 'rgba(255,255,255,.85)'; rrect(x - 7, y - 7, 14, 14, 2); cx.fill(); cx.stroke(); cx.setLineDash([]); if (V.z >= 10) label(x, y + 20, '施工中 · 待影像更新', 'Under construction', '10px Arial', '#666', true); return; }
    rrect(x - 7, y - 7, 14, 14, 2); cx.fill(); cx.stroke();
    cx.fillStyle = P(f.fund).color; cx.fillRect(x + 4, y - 10, 6, 6); cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.strokeRect(x + 4, y - 10, 6, 6);
  }
  function scale() {
    var k = K(), km = 1 / 111 * k; // px per km (lat)
    var nice = [1, 2, 5, 10, 20, 50], best = 1; nice.forEach(function (n) { if (n * km < 110) best = n; });
    var el = $('#scale>div'); el.style.width = Math.round(best * km) + 'px'; $('#sc1').textContent = best + ' km';
  }

  // ---------- map interaction ----------
  var drag = null, moved = false, hover = null;
  cv.addEventListener('mousedown', function (e) { drag = [e.clientX, e.clientY, V.lon, V.lat]; moved = false; cv.classList.add('dragging'); });
  window.addEventListener('mousemove', function (e) {
    if (drag) { var dx = e.clientX - drag[0], dy = e.clientY - drag[1]; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; var k = K(); V.lon = drag[2] - dx / (k * COS); V.lat = drag[3] + dy / k; closeInfo(); draw(); }
    else if (S.placing) { var r = cv.getBoundingClientRect(); hover = [e.clientX - r.left, e.clientY - r.top]; draw(); }
  });
  window.addEventListener('mouseup', function (e) { if (!drag) return; cv.classList.remove('dragging'); var r = cv.getBoundingClientRect(); if (!moved) click(e.clientX - r.left, e.clientY - r.top); drag = null; });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1 : -1); }, { passive: false });
  function zoomBy(d) { V.z = Math.max(8, Math.min(12, V.z + d)); knob(); closeInfo(); draw(); }
  function knob() { $('#knob').style.top = (12 - V.z) / 4 * 119 + 'px'; }
  function inPoly(ll, rings) { var x = ll[0], y = ll[1], c = false; rings.forEach(function (r) { for (var i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; }); return c; }
  function click(x, y) {
    var ll = unpx(x, y);
    if (S.placing) return place(ll, x, y);
    var best = null, bd = 12;
    S.facilities.forEach(function (f) { var q = px(f.ll), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = ['f', f]; } });
    D.towns.forEach(function (t) { var q = px(t.ll), d = Math.hypot(q[0] - x, q[1] - y); if (d < bd) { bd = d; best = ['t', t]; } });
    if (best) return best[0] === 't' ? infoTown(best[1]) : infoFac(best[1]);
    var hit = Object.keys(COUNTIES).filter(function (n) { return inPoly(ll, COUNTIES[n]); })[0];
    if (hit === 'Yolo') return;
    if (hit && region[hit]) infoRegion(region[hit], x, y); else closeInfo();
  }
  function openInfo(x, y, html) {
    var I = $('#info'); $('#infobody').innerHTML = html; I.hidden = false; I.style.left = (x - 46) + 'px'; I.style.top = (y - I.offsetHeight - 33) + 'px';
  }
  function closeInfo() { $('#info').hidden = true; }
  function infoTown(t) {
    var q = px(t.ll), f = S.facilities.filter(function (x) { return Math.hypot(x.ll[0] - t.ll[0], x.ll[1] - t.ll[1]) < .06; });
    openInfo(q[0], q[1] - 4, '<h3>' + L(t.zh, t.en) + '<small>' + L('约洛县', 'Yolo County') + (t.seat ? ' · ' + L('县府', 'County seat') : '') + '</small></h3>' +
      '<div class="kv"><span>' + L('人口', 'Population') + '</span>' + t.pop.toLocaleString() + '<span>' + L('病例', 'Cases') + '</span>' + t.cases + '<span>' + L('民心', 'Mood') + '</span>' + t.mood + ' / 100' +
      '<span>' + L('设施', 'Facilities') + '</span>' + (f.length ? f.map(function (x) { return LA(x.name); }).join('、') : L('无', 'None')) + '</div><p class="muted" style="font-size:12px">' + LA(t.note) + '</p>' +
      '<div class="lk" style="font-size:12px"><a href="#" data-zoom="' + t.id + '">' + L('放大', 'Zoom in') + '</a> - <a href="#" data-buildat="' + t.id + '">' + L('在此建造 »', 'Build here »') + '</a> - <a href="#">' + L('街景', 'Street View') + '</a></div>');
  }
  function infoFac(f) {
    var q = px(f.ll), b = bdef[f.b];
    openInfo(q[0], q[1] - 8, '<h3>' + LA(f.name) + '<small>' + L(b.zh, b.en) + '</small></h3><div class="kv"><span>' + L('出资方', 'Paid by') + '</span><span style="color:#000">' + chip(f.fund) + '</span><span>' + L('状态', 'Status') + '</span>' +
      (f.done ? L('运行中', 'Operating') : L('施工中，还要 ' + f.eta + ' 天', 'Building, ' + f.eta + ' days left')) + '</div><p class="muted" style="font-size:12px">' + LA(b.fx) + '</p>' +
      '<div class="lk" style="font-size:12px"><a href="#">' + L('改挂本县牌子', 'Rebrand as county') + '</a> - <a href="#">' + L('拆除', 'Demolish') + '</a></div>');
  }
  function infoRegion(r, x, y) {
    if (!r.seen) return openInfo(x, y, '<h3>' + L(r.zh, r.en) + '<small>' + L('迷雾中', 'In the fog') + '</small></h3><p>' + LA(r.status) + '</p><p class="muted" style="font-size:12px">' + L('建无线电中继站或派外勤队才能看清。', 'Build a radio relay or send a field team to see more.') + '</p><div class="lk"><a href="#">' + L('派外勤队 »', 'Send field team »') + '</a></div>');
    openInfo(x, y, '<h3>' + L(r.zh, r.en) + '<small>' + L('倾向 ', 'Leans ') + L(P(r.stance).zh, P(r.stance).en) + '</small></h3>' +
      '<div class="kv"><span>' + L('病例', 'Cases') + '</span>' + r.cases + '<span>' + L('外来者', 'Arrivals') + '</span>' + r.ref.toLocaleString() + '<span>' + L('与本县', 'Relations') + '</span>' + L('友好', 'Friendly') + '<span>' + L('内部派系', 'Factions') + '</span><i style="color:#999">' + L('需要联络处', 'Needs a liaison office') + '</i></div>' +
      '<p class="muted" style="font-size:12px">' + LA(r.note) + '</p><p style="font-size:11px;color:#676767;margin:0 0 4px">' + L('影像日期：', 'Imagery date: ') + r.date + '</p>' +
      '<div class="lk" style="font-size:12px"><a href="#">' + L('贸易', 'Trade') + '</a> - <a href="#">' + L('请求援助', 'Ask for aid') + '</a> - <a href="#">' + L('派联络官', 'Send liaison') + '</a></div>');
  }
  function place(ll, x, y) {
    if (!inPoly(ll, COUNTIES.Yolo)) { hint(L('只能建在约洛县境内。', 'You can only build inside Yolo County.')); return; }
    var b = bdef[S.bsel], f = S.bfund;
    if (S.funds[f] < b.cost) { hint(L(P(f).short[0] + '的钱不够。', 'Not enough ' + P(f).short[1] + ' funds.')); return; }
    S.funds[f] -= b.cost;
    S.facilities.push({ b: b.id, ll: ll, name: [b.zh, b.en], fund: f, done: false, eta: b.days });
    if (f !== 'county') { var d = {}; d[f] = 2; apply(d); }
    S.placing = false; hover = null; $('#buildhint').hidden = true; cv.style.cursor = ''; render(); draw();
  }
  function hint(html) { var h = $('#buildhint'); h.innerHTML = html; h.hidden = false; }

  // ---------- events ----------
  function dialog(title, html) { $('#dlgt').innerHTML = title; $('#dlgb').innerHTML = html; $('#dlgwrap').hidden = false; }
  function eventDialog() {
    var e = D.event;
    dialog(LA(e.title), '<p>' + LA(e.body) + '</p>' + e.opts.map(function (o, i) {
      return '<button class="opt" data-ev="' + i + '">' + LA(o.t) + '<small>' + LA(o.fx) + '</small></button>';
    }).join(''));
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a,button,[data-town],[data-region],[data-b],[data-mail]'); if (!a) return;
    var ds = a.dataset;
    if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault();
    if (ds.tab) { S.tab = ds.tab; render(); return; }
    if (ds.ev != null) { apply(D.event.opts[+ds.ev].d); $('#dlgwrap').hidden = true; return; }
    if (a.id === 'dlgx') { $('#dlgwrap').hidden = true; return; }
    if (a.id === 'infox') { closeInfo(); return; }
    if (ds.sp != null) { S.speed = +ds.sp; clock(); return; }
    if (a.id === 'nextday') { for (var i = 0; i < 24; i++) tick(); return; }
    if (ds.zoom) { var t = town[ds.zoom]; V.lon = t.ll[0]; V.lat = t.ll[1]; V.z = 12; knob(); draw(); infoTown(t); return; }
    if (ds.zr) { var c = centroid(COUNTIES[ds.zr]); V.lon = c[0]; V.lat = c[1]; V.z = 10; knob(); draw(); return; }
    if (ds.buildat) { S.tab = 'build'; var t2 = town[ds.buildat]; V.lon = t2.ll[0]; V.lat = t2.ll[1]; V.z = 12; knob(); closeInfo(); render(); draw(); return; }
    if (ds.sign) { var l = D.laws.filter(function (x) { return x.id === ds.sign; })[0]; S.laws[l.id] = true; var d = { gov: 0 }; if (l.id === 'std_gov') d = { gov: 6, calema: -6 }; if (l.id === 'std_calema') d = { calema: 6, gov: -6 }; if (l.id === 'school_open') d = { trust: 3 }; if (l.id === 'relayall') d = { gov: 2, council: 2, calema: 2 }; apply(d); render(); return; }
    if (ds.b && !e.target.closest('input,#place')) { S.bsel = S.bsel === ds.b ? null : ds.b; S.bfund = S.bsel ? bdef[S.bsel].fund[0] : null; render(); return; }
    if (a.id === 'place') { S.placing = true; cv.style.cursor = 'crosshair'; hint(L('点击约洛县境内的位置放置“' + bdef[S.bsel].zh + '”，按 Esc 取消。', 'Click inside Yolo County to place the ' + bdef[S.bsel].en.toLowerCase() + '. Esc to cancel.')); return; }
    if (ds.mail != null && !e.target.closest('button')) { var i2 = +ds.mail; S.mail[i2].unread = false; S.openMail = S.openMail === i2 ? -1 : i2; render(); return; }
    if (ds.act) {
      var p = ds.act.split(':'), m = S.mail[+p[0]], act = m.acts[+p[1]];
      var fx = { calema: { 0: { calema: 5, gov: -4 }, 1: { calema: -2 } }, gov: { 0: { gov: 4, calema: -4 } }, council: { 0: { council: 5 }, 1: { council: 2 } } };
      apply((fx[m.from] || {})[p[1]]);
      if (m.from === 'calema' && p[1] === '0') { S.funds.calema += 250; S.facilities.push({ b: 'check', ll: [-121.64, 38.566], name: ['堤道第二检查站', 'Second causeway checkpoint'], fund: 'calema', done: false, eta: 2 }); draw(); }
      if (act[0] === '承诺') S.promises.push({ zh: '一周内重开伍德兰县图书馆', en: 'Reopen the Woodland library within a week', left: 7, by: ['伍德兰居民', 'Woodland residents'] });
      m.done = ['已' + act[0], act[1] === 'Reply' ? 'Replied' : act[1] + (/e$/.test(act[1]) ? 'd' : 'ed')]; render(); return;
    }
    if (a.id === 'zin') return zoomBy(1);
    if (a.id === 'zout') return zoomBy(-1);
    var pan = { pn: [0, -1], ps: [0, 1], pw: [-1, 0], pe: [1, 0] }[a.id];
    if (pan) { var k = K(); V.lon += pan[0] * W / 3 / (k * COS); V.lat -= pan[1] * H / 3 / k; draw(); return; }
    if (a.id === 'pc') { V.lon = -121.78; V.lat = 38.64; V.z = 10; knob(); draw(); return; }
    if (ds.mode) { mode = ds.mode; document.querySelectorAll('#mtg .mt').forEach(function (b) { b.classList.toggle('sel', b === a); }); draw(); return; }
    if (a.id === 'morebtn') { $('#moremenu').hidden = !$('#moremenu').hidden; return; }
    if (a.id === 'nview') { S.tab = 'ov'; render(); $('#notice').hidden = true; return; }
    if (a.id === 'nx') { $('#notice').hidden = true; return; }
    if (ds.region) { var r = region[ds.region], c2 = centroid(COUNTIES[r.id]); V.lon = c2[0]; V.lat = c2[1]; V.z = 10; knob(); draw(); var q = px(c2); infoRegion(r, q[0], q[1]); return; }
    if (ds.town) { var t3 = town[ds.town]; V.lon = t3.ll[0]; V.lat = t3.ll[1] + .05; draw(); infoTown(t3); return; }
  });
  document.addEventListener('change', function (e) {
    if (e.target.name === 'bf') { S.bfund = e.target.value; }
    if (e.target.dataset.ly) { layers[e.target.dataset.ly] = e.target.checked; draw(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { S.placing = false; hover = null; $('#buildhint').hidden = true; cv.style.cursor = ''; draw(); } });
  $('#searchform').addEventListener('submit', function () {
    var q = $('#q').value.trim().toLowerCase(); if (!q) return;
    var t = D.towns.filter(function (x) { return x.zh.indexOf(q) >= 0 || x.en.toLowerCase().indexOf(q) >= 0; })[0];
    if (t) { V.lon = t.ll[0]; V.lat = t.ll[1] + .05; V.z = 11; knob(); draw(); infoTown(t); }
  });

  // ---------- time ----------
  function tick() {
    S.hour++;
    if (S.hour >= 24) {
      S.hour = 0; S.day++; S.date = new Date(S.date.getTime() + 864e5);
      S.dstand = { gov: 0, council: 0, calema: 0 };
      S.facilities.forEach(function (f) { if (!f.done && --f.eta <= 0) f.done = true; });
      S.promises.forEach(function (p) { p.left--; if (p.left === 0) apply({ trust: -8 }); });
      S.promises = S.promises.filter(function (p) { return p.left > 0; });
      D.towns.forEach(function (t) { if (t.cases) t.cases += Math.round(Math.random() * 2); });
      if (S.laws.shift) apply({ trust: -1 });
      if (S.date.getDay() === 5) eventDialog();
      render(); draw();
    }
    clock();
  }
  setInterval(function () { for (var i = 0; i < S.speed; i++) tick(); }, 1000);

  // ---------- boot ----------
  LANG.set('zh');
  $('#gearmenu').addEventListener('click', function () { setTimeout(function () { render(); clock(); draw(); }, 0); });
  window.addEventListener('resize', resize);
  render(); clock(); knob(); resize();
  $('#ntext').innerHTML = '<b>' + L('Cal EMA 应急广播：', 'Cal EMA alert: ') + '</b>' + L('明天上午 9 点将公布新的识别标准。', 'New identification criteria at 9 am tomorrow.');
  $('#notice').hidden = false;
  setTimeout(eventDialog, 600);
  window.GAME = { S: S, draw: draw, render: render, eventDialog: eventDialog };
})();
