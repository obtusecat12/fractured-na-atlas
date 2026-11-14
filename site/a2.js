// a2.js — interaction, sidebar, info window
var pane = document.getElementById('mappane'), info = document.getElementById('info');
var zoom, sel = d3.select(canvas), ZMIN = -1.3, ZMAX = 5;

function resize() {
  S.dpr = window.devicePixelRatio || 1; S.w = pane.clientWidth; S.h = pane.clientHeight;
  canvas.width = S.w * S.dpr; canvas.height = S.h * S.dpr;
  canvas.style.width = S.w + 'px'; canvas.style.height = S.h + 'px';
}

function fitView(x0, y0, x1, y1, dur) {
  var k = Math.min(S.w / (x1 - x0), S.h / (y1 - y0));
  var t = d3.zoomIdentity.translate(S.w / 2, S.h / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
  (dur ? sel.transition().duration(dur) : sel).call(zoom.transform, t);
}

function initView() {
  S.base0 = Math.min(S.w / 2400, S.h / 1700);
  zoom = d3.zoom().scaleExtent([S.base0 * Math.pow(2, ZMIN), S.base0 * Math.pow(2, ZMAX)])
    .on('start', function (e) {
      if (e.sourceEvent) { S.gesture = true; clearTimeout(S.gTimer); }
    })
    .on('zoom', function (e) {
      S.t = e.transform;
      if (S.gesture && S.frame) { S.pending = true; quickDraw(); } else render();
    })
    .on('end', function () {
      if (!S.gesture) return;
      S.gesture = false; clearTimeout(S.gTimer);
      S.gTimer = setTimeout(function () { if (!S.gesture) render(); }, 120);
    });
  sel.call(zoom);
  fitView(1300, 1300, 3700, 3000);
}

function setMode(mode) {
  S.mode = mode; document.body.classList.toggle('night', mode === 'night');
  document.querySelectorAll('#modes button[data-mode]').forEach(function (b) { b.classList.toggle('sel', b.dataset.mode === mode); });
  render();
}

function fmt(v) { return v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : v; }

function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function openInfo(f, mx, my) {
  if (!f) { closeInfo(); return; }
  var m = f.meta;
  if (mx == null) { mx = f.label[0]; my = f.label[1]; }
  S.info = { x: mx, y: my, id: f.id };
  var cap = m.capital_zh ? B(esc(m.capital_zh), esc(m.capital_en), '<br>') : B('待补充', 'To be written', ' · ');
  var more = '';
  if (m.rationale_zh) more += '<p class="zh">' + esc(m.rationale_zh) + '</p><p class="muted en">' + esc(m.rationale_en) + '</p>';
  if (m.lore_zh && m.lore_zh !== '待补充') more += '<p class="zh">' + esc(m.lore_zh) + '</p><p class="muted en">' + esc(m.lore_en) + '</p>';
  document.getElementById('infobody').innerHTML =
    '<h3><span class="zh">' + esc(m.zh) + '</span><small class="en">' + esc(m.en) + '</small></h3>' +

    '<p><b>首都 Capital:</b><br>' + cap + '</p>' +
    (m.founded && m.founded !== '—' ? '<p><b>成立 Founded:</b> ' + esc(m.founded) + '</p>' : '') +
    '<p><span class="zh">' + esc(m.terrain_zh) + '</span><span class="bi"><br></span><span class="muted en">' + esc(m.terrain_en) + '</span></p>' +
    (more ? '<div class="moretxt" hidden>' + more + '</div>' : '') +
    '<div class="lk">缩放 Zoom: <a href="#" data-act="zin">放大 In</a> - <a href="#" data-act="fit">适合 Fit</a>' +
    (more ? ' &nbsp; <a href="#" data-act="more">更多信息 More info &raquo;</a>' : '') +
    (wikiOf(f.id) ? ' &nbsp; <a href="#" data-act="wiki">' + B('维基百科', 'Wikipedia', ' ') + ' &raquo;</a>' : '') + '</div>';
  S.info.id = f.id;
  var k = SB.ids.indexOf(f.id); if (k >= 0 && Math.floor(k / PER) !== SB.page) buildSidebar(null, Math.floor(k / PER));
  document.querySelectorAll('.res').forEach(function (r) { r.classList.toggle('on', r.dataset.id === f.id); });
  info.hidden = false; updateInfoPos();
}
function flagHtml(id) {   // v4.1: faction flag at its own aspect ratio (never cropped) + bilingual source line
  var F = (window.FACTION_FLAGS || {})[id]; if (!F) return '';
  return '<div class="iwflag"><img src="' + F.src + '" alt="" style="aspect-ratio:' + F.w + '/' + F.h + '">' +
    (F.src_zh ? '<div class="iwfsrc">' + B(esc(F.src_zh), esc(F.en_src || F.src_en), '<br>') + '</div>' : '') + '</div>';
}
function closeInfo() { S.info = null; info.hidden = true; document.querySelectorAll('.res.on').forEach(function (r) { r.classList.remove('on'); }); }
function updateInfoPos() {
  if (!S.info || info.hidden) return;
  var x = S.t.applyX(S.info.x), y = S.t.applyY(S.info.y);
  info.style.left = (x - 46) + 'px'; info.style.top = (y - 33 - info.querySelector('.ibox').offsetHeight) + 'px';
}

function B(zh, en, sep) { return '<span class="zh">' + zh + '</span><span class="bi">' + (sep == null ? ' ' : sep) + '</span><span class="en">' + en + '</span>'; }
function marker(letter, color) {
  if (/^[A-Z]$/.test(letter)) return '<i class="mk mk' + letter + '"></i>';
  return '<svg width="20" height="34" viewBox="0 0 20 34"><ellipse cx="13" cy="32" rx="6" ry="1.8" fill="rgba(0,0,0,.25)"/>' +
    '<path d="M10 33C10 24 1 18.5 1 10a9 9 0 0 1 18 0c0 8.5-9 14-9 23z" fill="' + (color || '#FD7567') + '" stroke="#8E1A10" stroke-width=".9"/>' +
    '<path d="M4 6a7.5 7.5 0 0 1 6-4" stroke="rgba(255,255,255,.55)" stroke-width="1.5" fill="none"/>' +
    '<text x="10" y="13.5" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="10.5" fill="#000">' + letter + '</text></svg>';
}
function wikiOf(id) {   // v3.3: article for a faction, or for its parent (usg_ak -> usg)
  if (!window.WIKI_HAS) return null; if (WIKI_HAS[id]) return id;
  var m = D.byId[id]; return m && m.parent && WIKI_HAS[m.parent] ? m.parent : null;
}
var SB = { q: '', page: 0, ids: [] }, PER = 10;
function buildSidebar(q, page) {
  // v3.3: late-2009 Google Maps local-search result list: 10 per page, markers A-J, address line, grey snippet, small links, pager
  q = (q == null ? SB.q : q).trim().toLowerCase();
  if (q !== SB.q) page = 0;
  SB.q = q;
  var items = [];
  D.meta.factions.forEach(function (m) {
    var hay = [m.zh, m.en, m.capital_zh, m.capital_en, m.id].join(' ').toLowerCase();
    if (q && hay.indexOf(q) < 0 && !D.cities.some(function (c) {
      return (c.zh + ' ' + c.en).toLowerCase().indexOf(q) >= 0 && m.feature && d3.geoContains(m.feature, [c.x, c.y]);
    })) return;
    items.push(m);
  });
  var nm = D.meta.none || { zh: '无线电静默', en: 'Radio Silence' };
  if (!q || (nm.zh + ' ' + nm.en).toLowerCase().indexOf(q) >= 0) items.push({ id: 'none', zh: nm.zh, en: 'Radio Silence', color: '#1a1a1a', none: true });
  SB.ids = items.map(function (m) { return m.id; });
  var n = items.length, pages = Math.max(1, Math.ceil(n / PER));
  SB.page = Math.max(0, Math.min(pages - 1, page == null ? SB.page : page));
  var a = SB.page * PER, b = Math.min(n, a + PER), html = '';
  function cut(t, k) { t = t || ''; return t.length > k ? t.slice(0, k) + '...' : t; }
  items.slice(a, b).forEach(function (m, j) {
    var L = String.fromCharCode(65 + j);
    var addr = m.none ? B('无政权 · 无灯光 · 无信号', 'No authority · no lights · no signal', ' ') :
      B('首都：' + esc(m.capital_zh || '待定'), 'Capital: ' + esc(m.capital_en || 'TBD'), ' ');
    var snip = m.none ? '' : B(esc(cut(m.terrain_zh, 46)), esc(cut(m.terrain_en, 90)), ' ');
    var links = '<a href="#" class="ml" data-sb="info">' + B('更多信息', 'More info', ' ') + ' &raquo;</a>' +
      (wikiOf(m.id) ? ' - <a href="#" class="ml" data-sb="wiki">' + B('维基百科', 'Wikipedia', ' ') + ' &raquo;</a>' : '') +
      (m.none ? '' : ' - <a href="#" class="ml" data-sb="zoom">' + B('放大', 'Zoom in', ' ') + '</a>');
    html += '<div class="res r09' + (m.parent ? ' subu' : '') + '" data-id="' + m.id + '">' + marker(L) +
      '<div class="rb"><a class="nm" href="#">' + B(esc(m.zh), esc(m.en)) + '</a>' +
      '<div class="ad"><span class="sw" style="background:' + m.color + '"></span>' + addr + '</div>' +
      (snip ? '<div class="sn">' + snip + '</div>' : '') +
      '<div class="lks">' + links + '</div></div></div>';
  });
  var head = '<div id="rhead"><b>' + (q ? B('搜索结果', 'Search results') : B('势力', 'Factions')) + '</b><span>' +
    (n ? B('第 ' + (a + 1) + ' - ' + b + ' 项结果，共 ' + n + ' 项', 'Results ' + (a + 1) + '-' + b + ' of ' + n, ' · ') : '') + '</span></div>';
  if (!n) html = '<p style="padding:4px 8px">' + B('未找到与“' + esc(q) + '”相符的结果。', 'We could not find “' + esc(q) + '”.', '<br>') + '</p>';
  var pg = '';
  if (pages > 1) {
    pg = '<div id="pager">';
    if (SB.page > 0) pg += '<a href="#" data-pg="' + (SB.page - 1) + '">&lsaquo; ' + B('上一页', 'Previous', ' ') + '</a> ';
    for (var i = 0; i < pages; i++) pg += i === SB.page ? '<b>' + (i + 1) + '</b> ' : '<a href="#" data-pg="' + i + '">' + (i + 1) + '</a> ';
    if (SB.page < pages - 1) pg += '<a href="#" data-pg="' + (SB.page + 1) + '">' + B('下一页', 'Next', ' ') + ' &rsaquo;</a>';
    pg += '</div>';
  }
  html += pg + '<div id="sfoot"><a href="#" class="mymaps">' + B('将这些结果保存到“我的地图”', 'Save these results to My Maps', ' ') + ' &raquo;</a><br><a href="#" id="resetv">' + B('显示整个北美', 'Show all of North America', ' ') + '</a></div>';
  document.getElementById('results').innerHTML = head + html;
  document.getElementById('sidebar').scrollTop = 0;
  if (S.info) document.querySelectorAll('.res').forEach(function (r) { r.classList.toggle('on', r.dataset.id === S.info.id); });
}

function focusFaction(id) {
  var m = D.byId[id];
  if (!m || !m.feature) { fitView(1300, 1300, 3700, 3000, 600); closeInfo(); return; }
  var b = m.bounds, pad = 0.15 * Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) + 40;
  fitView(b[0][0] - pad, b[0][1] - pad, b[1][0] + pad, b[1][1] + pad, 600);
  setTimeout(function () { openInfo(m.feature); }, 620);
}

// zoom control
var slider = document.getElementById('slider'), knob = document.getElementById('knob');
function sliderRange() { return slider.clientHeight - 13; }
function updateSlider() {
  var lvl = Math.log2(S.t.k / S.base0), f = (lvl - ZMIN) / (ZMAX - ZMIN);
  knob.style.top = Math.round((1 - f) * sliderRange()) + 'px';
}
function zoomToLevel(lvl) {
  lvl = Math.max(ZMIN, Math.min(ZMAX, lvl));
  sel.call(zoom.scaleTo, S.base0 * Math.pow(2, lvl), [S.w / 2, S.h / 2]);
}
function sliderY(e) { var r = slider.getBoundingClientRect(); return (e.clientY - r.top - 6.5) / sliderRange(); }

function initUI() {
  var ticks = document.getElementById('ticks');
  for (var i = 0; i <= 12; i++) { var t = document.createElement('i'); t.style.top = (i / 12 * 100) + '%'; ticks.appendChild(t); }
  document.getElementById('zin').onclick = function () { sel.transition().duration(250).call(zoom.scaleBy, 2); };
  document.getElementById('zout').onclick = function () { sel.transition().duration(250).call(zoom.scaleBy, 0.5); };
  var P = { pn: [0, 1], ps: [0, -1], pw: [1, 0], pe: [-1, 0] };
  Object.keys(P).forEach(function (id) {
    document.getElementById(id).onclick = function () {
      sel.transition().duration(250).call(zoom.translateBy, P[id][0] * S.w / 3 / S.t.k, P[id][1] * S.h / 3 / S.t.k);
    };
  });
  document.getElementById('pc').onclick = function () { fitView(1300, 1300, 3700, 3000, 400); };
  var drag = false;
  slider.addEventListener('mousedown', function (e) { drag = true; zoomToLevel(ZMAX - sliderY(e) * (ZMAX - ZMIN)); e.preventDefault(); });
  window.addEventListener('mousemove', function (e) { if (drag) zoomToLevel(ZMAX - sliderY(e) * (ZMAX - ZMIN)); });
  window.addEventListener('mouseup', function () { drag = false; });

  document.querySelectorAll('#modes button[data-mode]').forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });
  var mb = document.getElementById('morebtn'), mm = document.getElementById('moremenu');
  mb.onclick = function (e) { e.stopPropagation(); mm.hidden = !mm.hidden; mb.classList.toggle('sel', !mm.hidden); };
  mm.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { if (!mm.hidden) { mm.hidden = true; mb.classList.remove('sel'); } });
  mm.querySelectorAll('input').forEach(function (c) {
    c.checked = !!S.opt[c.name];
    c.onchange = function () { S.opt[c.name] = c.checked; render(); };
  });
  document.getElementById('infox').onclick = function (e) { e.preventDefault(); closeInfo(); };
  document.getElementById('infobody').addEventListener('click', function (e) {
    var a = e.target.closest('a[data-act]'); if (!a || !S.info) return; e.preventDefault();
    var act = a.dataset.act;
    if (act === 'more') { var mt = info.querySelector('.moretxt'); mt.hidden = !mt.hidden; a.innerHTML = mt.hidden ? '更多信息 More info &raquo;' : '&laquo; 收起 Less'; updateInfoPos(); }
    else if (act === 'zin') sel.transition().duration(400).call(zoom.scaleBy, 2, [S.t.applyX(S.info.x), S.t.applyY(S.info.y)]);
    else if (act === 'fit') focusFaction(S.info.id);
    else if (act === 'wiki' && window.openWiki) openWiki(wikiOf(S.info.id));
  });
  document.getElementById('results').addEventListener('click', function (e) {
    if (e.target.id === 'resetv') { e.preventDefault(); closeInfo(); fitView(1300, 1300, 3700, 3000, 400); return; }
    var pgA = e.target.closest('a[data-pg]'); if (pgA) { e.preventDefault(); buildSidebar(null, +pgA.dataset.pg); return; }
    if (e.target.closest('.mymaps')) { e.preventDefault(); return; }
    var r = e.target.closest('.res'); if (!r) return; e.preventDefault();
    var act = e.target.closest('a[data-sb]'), id = r.dataset.id;
    if (act && act.dataset.sb === 'wiki' && window.openWiki) { openWiki(wikiOf(id)); return; }
    if (act && act.dataset.sb === 'zoom' && D.byId[id] && D.byId[id].feature) { var bb = D.byId[id].bounds; fitView(bb[0][0] - 10, bb[0][1] - 10, bb[1][0] + 10, bb[1][1] + 10, 500); return; }
    focusFaction(id);
  });
  document.getElementById('searchform').onsubmit = function (e) { e.preventDefault(); buildSidebar(document.getElementById('q').value); };
  document.getElementById('q').oninput = function () { buildSidebar(this.value); };
  document.getElementById('factlink').onclick = function (e) { e.preventDefault(); document.getElementById('q').value = ''; buildSidebar(''); };

  document.getElementById('collapse').onclick = function (e) {
    e.preventDefault(); var c = document.body.classList.toggle('collapsed');
    this.innerHTML = c ? '&raquo;' : '&laquo;'; onResize();
  };
  canvas.addEventListener('click', function (e) {
    var r = canvas.getBoundingClientRect(), p = S.t.invert([e.clientX - r.left, e.clientY - r.top]);
    if (p[0] < 0 || p[1] < 0 || p[0] >= W || p[1] >= H) { closeInfo(); return; }
    openInfo(hitTest(p[0], p[1]), p[0], p[1]);
  });
  window.addEventListener('resize', onResize);
}

function onResize() {
  var c = S.t.invert([S.w / 2, S.h / 2]), k = S.t.k;
  resize();
  sel.call(zoom.transform, d3.zoomIdentity.translate(S.w / 2, S.h / 2).scale(k).translate(-c[0], -c[1]));
}

initData();
resize();
buildSidebar('');
initUI();
initView();
