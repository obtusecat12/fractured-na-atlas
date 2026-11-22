// node tools/validate_content.js [extra-pack.js ...]
// 检查 site/game/content/packs/ 中清单列出的全部内容包，以及命令行附加的包文件。
const fs = require('fs'), path = require('path');
const G = path.join(__dirname, '..', 'site', 'game');
global.window = global; global.document = { write() {} };
require(path.join(G, 'content', 'core.js'));
const DATA = new Function(fs.readFileSync(path.join(G, 'data.js'), 'utf8') + ';return DATA')();
eval(fs.readFileSync(path.join(G, 'content', 'manifest.js'), 'utf8'));
const files = CONTENT_PACKS.map(n => path.join(G, 'content', 'packs', n + '.js')).concat(process.argv.slice(2));
files.forEach(f => { try { eval(fs.readFileSync(f, 'utf8')); } catch (e) { CONTENT.errors.push(path.basename(f) + ': 无法解析 — ' + e.message); } });
const C = CONTENT, ids = new Set(C.events.map(e => e.id).concat(C.mail.map(m => m.id))), builds = new Set(DATA.buildings.map(b => b.id).concat(C.buildings.map(b => b.id)));
C.buildings.forEach(b => { if (DATA.buildings.some(x => x.id === b.id)) C.errors.push('buildings ' + b.id + ': 和 data.js 里的建筑重名'); if (!DATA.bcats[b.cat] && !C.bcats[b.cat]) C.errors.push('buildings ' + b.id + ': cat "' + b.cat + '" 未定义（可用 ' + Object.keys(DATA.bcats).join('/') + '，或在包里加 bcats）'); });
function walk(where, d) {
  if (!d) return;
  [].concat(d.mail || []).forEach(id => { if (typeof id === 'string' && !C.mail.some(m => m.id === id)) C.errors.push(where + ': mail "' + id + '" 不存在'); });
  if (d.event) { const id = typeof d.event === 'string' ? d.event : d.event.id; if (!C.events.some(e => e.id === id)) C.errors.push(where + ': event "' + id + '" 不存在'); }
  if (d.build && !builds.has(d.build.b)) C.errors.push(where + ': build.b "' + d.build.b + '" 不在 data.js buildings 里（可用：' + [...builds].join(', ') + '）');
}
C.events.forEach(e => (e.opts || []).forEach((o, i) => walk(e.id + ' opts[' + i + ']', o.do)));
C.mail.forEach(m => (m.acts || []).forEach((a, i) => walk(m.id + ' acts[' + i + ']', a.do)));
C.events.filter(e => e.chained).forEach(e => { const used = JSON.stringify(C.events.concat(C.mail)).includes('"' + e.id + '"'); if (!used) C.errors.push(e.id + ': chained 事件没有被任何选项引用'); });
// 警告（不算错误）：选项文字和效果对不上，例如文字提到钱但 do 里没有 county/funds（docs/HANDOFF.md 第三节 6）
const warns = [];
if (C.audit) {
  C.events.forEach(e => (e.opts || []).forEach((o, i) => { const w = C.audit(o.t, o.do, o.fx); if (w) warns.push(e.id + ' opts[' + i + '] “' + o.t[0] + '”：' + w); }));
  C.mail.forEach(m => (m.acts || []).forEach((a, i) => { const w = C.audit(a.t, a.do, a.fx); if (w) warns.push(m.id + ' acts[' + i + '] “' + a.t[0] + '”：' + w); }));
}
const starts = C.events.filter(e => e.start).length; if (starts !== 1) C.errors.push('需要恰好一个 start:true 的开局事件，现在有 ' + starts + ' 个');
console.log(`内容包 ${C.packs.length} 个 · 事件 ${C.events.length} · 公文 ${C.mail.length} · 广播 ${C.broadcasts.length} · 建筑 ${C.buildings.length}`);
if (warns.length) console.log('\n警告 ' + warns.length + ' 条（文字和效果可能对不上，请人工确认）：\n' + warns.map(w => '  - ' + w).join('\n'));
if (C.errors.length) { console.log('\n错误 ' + C.errors.length + ' 条：\n' + C.errors.map(e => '  - ' + e).join('\n')); process.exit(1); } else console.log('全部通过。');
