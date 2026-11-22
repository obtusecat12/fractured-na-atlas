// lang.js — language switch (中文 / English / both). Static bilingual strings "中文 English" are split on the fly;
// generated markup uses <span class="zh|en|bi">. Gear menu in the top bar.
var LANG = (function () {
  var mode = 'both', CJK = '\u2026\u3000-\u303f\u3400-\u9fff\uff00-\uffef';
  var RUN = new RegExp('[' + CJK + ']+(?:[\\s\\d\\-–—·•/]*[' + CJK + ']+)*', 'g');
  var orig = new WeakMap(), conv = new WeakMap(), busy = false;
  function convert(s, m) {
    if (m === 'both' || !s) return s;
    var runs = [], r; RUN.lastIndex = 0;
    while ((r = RUN.exec(s))) runs.push([r.index, r.index + r[0].length]);
    if (!runs.length) return s;
    var out = s.slice(0, runs[0][0]), i;
    for (i = 0; i < runs.length; i++) {
      var a = runs[i][0], b = runs[i][1], nx = i + 1 < runs.length ? runs[i + 1][0] : s.length;
      var L = s.slice(b, nx), fl = L.search(/[A-Za-z]/), st = fl < 0 ? -1 : L.slice(fl).search(/ - | \| |©|\u00a0- | · /); if (st >= 0) st += fl; var Lp = st >= 0 ? L.slice(0, st) : L, rest = st >= 0 ? L.slice(st) : '';
      if (!/[A-Za-z]/.test(Lp)) { out += s.slice(a, b) + L; continue; }
      if (m === 'zh') { var z = s.slice(a, b); if (/:\s*$/.test(Lp)) z += '：'; if (/\.\.\.\s*$|…\s*$/.test(Lp) && !/…$/.test(z)) z += ''; out += z + (rest ? ' ' + rest.replace(/^\s+/, '') : (/\s$/.test(Lp) ? ' ' : '')); }
      else { out += (out && !/\s$/.test(out) && /^\s/.test(Lp) ? ' ' : '') + Lp.replace(/^[\s·•\-–—]+/, '') + rest; }
    }
    return out;
  }
  function skip(el) { while (el && el !== document.body) { if (el.nodeType === 1 && (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.classList.contains('zh') || el.classList.contains('en') || el.classList.contains('bi'))) return true; el = el.parentNode; } return false; }
  function applyNode(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    ['title', 'placeholder'].forEach(function (k) {
      if (root.hasAttribute && root.hasAttribute(k)) {
        var o = root.getAttribute('data-o-' + k); var cur = root.getAttribute(k);
        if (o == null || cur !== root.getAttribute('data-c-' + k)) { o = cur; root.setAttribute('data-o-' + k, o); }
        var c = convert(o, mode); root.setAttribute(k, c); root.setAttribute('data-c-' + k, c);
      }
    });
    if (root.tagName === 'BUTTON' && root.dataset && root.dataset.o) {}
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (n) { if (n.nodeType === 1) return (n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.classList.contains('zh') || n.classList.contains('en') || n.classList.contains('bi')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP; return NodeFilter.FILTER_ACCEPT; } });
    var n; while ((n = w.nextNode())) doText(n);
    root.querySelectorAll('[title],[placeholder]').forEach(function (e) { if (!skip(e)) { ['title', 'placeholder'].forEach(function (k) {
      if (!e.hasAttribute(k)) return; var o = e.getAttribute('data-o-' + k), cur = e.getAttribute(k);
      if (o == null || cur !== e.getAttribute('data-c-' + k)) { o = cur; e.setAttribute('data-o-' + k, o); }
      var c = convert(o, mode); e.setAttribute(k, c); e.setAttribute('data-c-' + k, c); }); } });
  }
  function doText(n) {
    var o = orig.get(n), cur = n.nodeValue;
    if (o == null || cur !== conv.get(n)) { o = cur; orig.set(n, o); }
    var c = convert(o, mode); conv.set(n, c); if (c !== cur) n.nodeValue = c;
  }
  function applyAll() { busy = true; applyNode(document.body); busy = false; }
  function set(m) {
    mode = m; document.body.classList.remove('l-zh', 'l-en', 'l-both'); document.body.classList.add('l-' + m);
    document.documentElement.lang = m === 'en' ? 'en' : 'zh-CN';
    applyAll();
    document.querySelectorAll('#gearmenu [data-lang]').forEach(function (a) { a.classList.toggle('sel', a.dataset.lang === m); });
    if (window.D && D.factions && window.render) render();
  }
  function t(zh, en, sep) { return mode === 'zh' ? zh : mode === 'en' ? en : zh + (sep == null ? ' ' : sep) + en; }
  new MutationObserver(function (ms) {
    if (busy || mode === 'both') return; busy = true;
    ms.forEach(function (m) { if (m.type === 'characterData') doText(m.target); else m.addedNodes.forEach(applyNode); });
    busy = false;
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  // 外壳和游戏 iframe 用同一个设置菜单：语言两边同步，显示器设置作用于外壳的 LCD09，保存进度调用游戏
  function peers() {
    var out = [];
    try { if (window.top !== window && window.top.LANG) out.push(window.top); } catch (e) {}
    try { var f = document.getElementById('gameframe'); if (f && f.contentWindow && f.contentWindow.LANG) out.push(f.contentWindow); } catch (e) {}
    return out;
  }
  function setAll(m) { set(m); peers().forEach(function (w) { try { if (w.LANG.mode() !== m) w.LANG.set(m); } catch (e) {} }); }
  function lcd() { try { return window.LCD09 || (window.top !== window && window.top.LCD09) || null; } catch (e) { return null; } }
  function game() { try { if (window.GAME) return window.GAME; var f = document.getElementById('gameframe'); return f && f.contentWindow && f.contentWindow.GAME || null; } catch (e) { return null; } }
  function marks(gm) {
    gm.querySelectorAll('[data-lang]').forEach(function (a) { a.classList.toggle('sel', a.dataset.lang === mode); });
    var L9 = lcd(); gm.querySelectorAll('[data-lcd]').forEach(function (a) { a.classList.toggle('sel', !!L9 && a.dataset.lcd === L9.mode()); });
    var sv = gm.querySelector('#gmsave'); if (sv) sv.classList.toggle('dis', !(game() && game().save));
    var hp = gm.querySelector('#gmhelp'); if (hp) hp.classList.toggle('dis', !(game() && game().help));
  }
  var gear = document.getElementById('gear'), gm = document.getElementById('gearmenu');
  if (gear) {
    gear.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); marks(gm); gm.hidden = !gm.hidden; gear.classList.toggle('on', !gm.hidden); });
    document.addEventListener('click', function (e) { if (!gm.hidden && !gm.contains(e.target)) { gm.hidden = true; gear.classList.remove('on'); } });
    gm.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return; e.preventDefault();
      if (a.dataset.lang) setAll(a.dataset.lang);
      if (a.dataset.lcd && lcd()) lcd().set(a.dataset.lcd);
      if (a.id === 'gmsave' && game() && game().save) game().save();
      if (a.id === 'gmhelp' && game() && game().help) { try { if (window.FNA && !window.FNA.inGame()) window.FNA.toGame(); } catch (e) {} game().help(); }
      gm.hidden = true; gear.classList.remove('on');
    });
  }
  document.body.classList.add('l-both');
  setTimeout(function () { document.querySelectorAll('#gearmenu [data-lang]').forEach(function (a) { a.classList.toggle('sel', a.dataset.lang === mode); }); }, 0);
  return { set: set, t: t, mode: function () { return mode; }, convert: convert };
})();
