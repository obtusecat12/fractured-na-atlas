// ATM window scene. Uses the Hope St ATM from Bumper-Crop Level 11 (props atlas crop: atm.png / atmside.png)
// and the Level 11 dollar bill (cash.png, front left half / back right half).
import * as T from './three.module.min.js';
const BILL_W = .156, BILL_D = .066, CAB = { w: .82, h: 1.24, d: .26 };
const SLOT = [-.094, -.62 + .164, CAB.d / 2 + .004];   // dispenser slot on the front face (same offset as cash125-atm.js)
const SCREEN = [45, 111, 142, 181];                     // CRT area in atm.png pixels (192x288)
const FDK = { x: [34, 152], y: [142.5, 154, 165, 177], r: 4.5 }; // side keys beside the screen, atm.png pixels
const VIEWS = { screen: { p: new T.Vector3(.06, .02, 1.32), l: new T.Vector3(0, -.03, 0) }, slot: { p: new T.Vector3(.18, -.05, 1.95), l: new T.Vector3(0, -.3, 0) } };
let view = VIEWS.screen; const look = new T.Vector3();
export function focus(n) { view = VIEWS[n] || VIEWS.screen; }
const K = 4;                                            // screen canvas = atm.png x4
let spec = null, onKey = null, hoverKey = null, ray = new T.Raycaster(), cab, R, scene, cam, atm, screenTex, screenCtx, base, bills = [], clock = new T.Clock(), running = false, onDone = null;
function tex(url, cb) { const t = new T.TextureLoader().load(url, cb); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }
function stone(w, h, seed) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#8d8a84'; g.fillRect(0, 0, 256, 256); let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) { const v = 110 + r() * 60 | 0; g.fillStyle = `rgba(${v},${v - 3},${v - 8},.35)`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
  for (let y = 0; y < 256; y += 64) { g.fillStyle = 'rgba(40,38,34,.35)'; g.fillRect(0, y, 256, 1.5); }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(w, h); return t;
}
export function mount(el) {
  if (R) { el.appendChild(R.domElement); resize(el); return; }
  R = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = T.SRGBColorSpace;
  R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; el.appendChild(R.domElement);
  scene = new T.Scene(); scene.background = new T.Color('#2a2b2c'); scene.fog = new T.Fog('#2a2b2c', 3, 7);
  cam = new T.PerspectiveCamera(32, 1, .05, 20); cam.position.copy(VIEWS.screen.p); cam.lookAt(VIEWS.screen.l); look.copy(VIEWS.screen.l);
  scene.add(new T.HemisphereLight('#e8eef5', '#4a443c', 1.2));
  const key = new T.DirectionalLight('#fff4e2', 2.2); key.position.set(-1.5, 2.5, 3); scene.add(key);
  const fill = new T.PointLight('#bcd2ff', 3, 4); fill.position.set(1.2, .4, 1.2); scene.add(fill);
  // wall + granite surround (h118GraniteBase / h118StonePier stand-ins)
  const wall = new T.Mesh(new T.PlaneGeometry(6, 4), new T.MeshStandardMaterial({ map: stone(4, 3, 7), roughness: .9 })); wall.position.z = -.14; scene.add(wall);
  const gran = new T.Mesh(new T.BoxGeometry(1.18, 1.62, .08), new T.MeshStandardMaterial({ color: '#3b3a39', roughness: .45, metalness: .1 })); gran.position.set(0, .05, -.1); scene.add(gran);
  const ground = new T.Mesh(new T.PlaneGeometry(6, 3), new T.MeshStandardMaterial({ color: '#6b6862', roughness: .95 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.98; scene.add(ground);
  // cabinet
  base = new Image(); base.src = new URL('atm.png', import.meta.url).href;
  const sc = document.createElement('canvas'); sc.width = 192 * K; sc.height = 288 * K; screenCtx = sc.getContext('2d');
  screenTex = new T.CanvasTexture(sc); screenTex.colorSpace = T.SRGBColorSpace; screenTex.anisotropy = 4;
  base.onload = () => drawScreen(spec);
  const side = tex(new URL('atmside.png', import.meta.url).href);
  const glossy = (m) => new T.MeshStandardMaterial({ map: m, roughness: .35, metalness: .05, emissive: '#ffffff', emissiveMap: m, emissiveIntensity: .07 });
  const mats = [glossy(side), glossy(side), glossy(side), glossy(side), new T.MeshStandardMaterial({ map: screenTex, roughness: .3, metalness: .05, emissive: '#ffffff', emissiveMap: screenTex, emissiveIntensity: .1 }), glossy(side)];
  atm = new T.Group(); scene.add(atm);
  cab = new T.Mesh(new T.BoxGeometry(CAB.w, CAB.h, CAB.d), mats); atm.add(cab);
  R.domElement.addEventListener('pointermove', e => { const k = pick(e); if (k !== hoverKey) { hoverKey = k; drawScreen(spec); } R.domElement.style.cursor = k ? 'pointer' : ''; });
  R.domElement.addEventListener('pointerdown', e => { const k = pick(e); if (k && onKey) { press(k); onKey(k); } });
  const hood = new T.Mesh(new T.BoxGeometry(.9, .12, .38), glossy(side)); hood.position.set(0, .70, -.06 + .12); hood.rotation.x = -.18; atm.add(hood);
  const plinth = new T.Mesh(new T.BoxGeometry(.9, .16, .1), new T.MeshStandardMaterial({ color: '#151515', roughness: .6 })); plinth.position.set(0, -.82, .08); atm.add(plinth);
  // bills
  const cash = tex(new URL('cash.png', import.meta.url).href);
  const geo = new T.PlaneGeometry(BILL_W, BILL_D, 6, 1);
  const front = cash.clone(); front.repeat.set(.4844, .8125); front.offset.set(.0078, .1563); front.needsUpdate = true;
  const back = cash.clone(); back.repeat.set(.4844, .8125); back.offset.set(.5078, .1563); back.needsUpdate = true;
  base.mf = new T.MeshStandardMaterial({ map: front, roughness: .8, side: T.FrontSide });
  base.mb = new T.MeshStandardMaterial({ map: back, roughness: .8, side: T.BackSide });
  base.geo = geo;
  resize(el); loop();
}
export function resize(el) { if (!R) return; const w = el.clientWidth, h = el.clientHeight; R.setSize(w, h, false); R.domElement.style.width = w + 'px'; R.domElement.style.height = h + 'px'; cam.aspect = w / h; cam.updateProjectionMatrix(); }
function pick(e) {
  const r = R.domElement.getBoundingClientRect(), v = new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(v, cam); const h = ray.intersectObject(cab)[0]; if (!h || h.face.materialIndex !== 4) return null;
  const px = h.uv.x * 192, py = (1 - h.uv.y) * 288;
  for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) if (Math.hypot(px - FDK.x[s], py - FDK.y[i]) < FDK.r + 1.5) return (s ? 'R' : 'L') + (i + 1);
  return null;
}
let pressed = null;
function press(k) { pressed = k; drawScreen(spec); setTimeout(() => { pressed = null; drawScreen(spec); }, 140); }
// 2009-style ATM screen: blue gradient, header band, option labels next to the side keys
// spec = { head, title, lines:[...], L:[4 labels], R:[4 labels], entry, foot, busy }
export function drawScreen(s) {
  spec = s; if (!base || !base.complete || !s) return; const g = screenCtx, zh = /[\u4e00-\u9fff]/.test(JSON.stringify(s));
  const F = (w, px) => w + ' ' + px + 'px ' + (zh ? '"Microsoft YaHei","PingFang SC","Noto Sans CJK SC","SimHei",Arial,sans-serif' : 'Arial,Helvetica,sans-serif');
  g.imageSmoothingEnabled = false; g.drawImage(base, 0, 0, 192 * K, 288 * K); g.imageSmoothingEnabled = true;
  // side keys: lit when hovered, pushed when pressed
  for (let sd = 0; sd < 2; sd++) for (let i = 0; i < 4; i++) {
    const k = (sd ? 'R' : 'L') + (i + 1), x = FDK.x[sd] * K, y = FDK.y[i] * K, lab = (sd ? s.R : s.L) || [];
    g.fillStyle = k === pressed ? '#5b5b5b' : k === hoverKey && lab[i] ? '#d8d8d8' : '#a9a9a9'; g.strokeStyle = '#3a3a3a'; g.lineWidth = 2;
    g.beginPath(); g.roundRect(x - 13, y - 9, 26, 18, 4); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 10, y - 7, 20, 3);
  }
  const [x0, y0, x1, y1] = SCREEN.map(v => v * K), w = x1 - x0, h = y1 - y0;
  g.save(); g.beginPath(); g.roundRect(x0 + 4, y0 + 4, w - 8, h - 8, 10); g.clip();
  let gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#0d3a8c'); gr.addColorStop(1, '#1e64c8'); g.fillStyle = gr; g.fillRect(x0, y0, w, h);
  gr = g.createLinearGradient(0, y0, 0, y0 + 46); gr.addColorStop(0, '#f4f7fb'); gr.addColorStop(1, '#c9d6e8'); g.fillStyle = gr; g.fillRect(x0, y0, w, 46);
  g.fillStyle = '#c8102e'; g.fillRect(x0, y0 + 46, w, 4);
  g.fillStyle = '#0d3a8c'; g.font = F('bold', 19); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(s.head || '', x0 + 16, y0 + 24);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = F('bold', 22); g.fillText(s.title || '', x0 + w / 2, y0 + 78);
  g.font = F('', 17); (s.lines || []).forEach((l, i) => { g.fillStyle = l.c || '#ffe680'; g.fillText(l.t != null ? l.t : l, x0 + w / 2, y0 + 106 + i * 24); });
  if (s.entry != null) { g.fillStyle = '#fff'; g.fillRect(x0 + w / 2 - 92, y0 + 118, 184, 38); g.strokeStyle = '#ffe680'; g.lineWidth = 2; g.strokeRect(x0 + w / 2 - 92, y0 + 118, 184, 38);
    g.fillStyle = '#000'; g.font = F('bold', 24); g.fillText(s.entry, x0 + w / 2, y0 + 138); }
  if (s.busy) { const t = performance.now() / 300; for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(255,255,255,${(i + t) % 8 / 8})`; g.beginPath(); g.arc(x0 + w / 2 + Math.cos(i * .785) * 18, y0 + 150 + Math.sin(i * .785) * 18, 4, 0, 7); g.fill(); } }
  // option labels aligned with the side keys
  for (let sd = 0; sd < 2; sd++) (sd ? s.R : s.L || []).forEach((lab, i) => {
    if (!lab) return; const y = FDK.y[i] * K, bw = w / 2 - 18, bx = sd ? x1 - 8 - bw : x0 + 8;
    g.fillStyle = (sd ? 'R' : 'L') + (i + 1) === hoverKey ? '#ffe680' : 'rgba(255,255,255,.95)'; g.beginPath(); g.roundRect(bx, y - 15, bw, 30, 5); g.fill();
    g.fillStyle = '#0d3a8c'; g.beginPath(); if (sd) { g.moveTo(x1 - 6, y); g.lineTo(x1 - 16, y - 8); g.lineTo(x1 - 16, y + 8); } else { g.moveTo(x0 + 6, y); g.lineTo(x0 + 16, y - 8); g.lineTo(x0 + 16, y + 8); } g.fill();
    g.font = F('bold', 15); g.textAlign = sd ? 'right' : 'left'; g.fillText(lab, sd ? x1 - 22 : x0 + 22, y + 1);
  });
  if (s.foot) { g.fillStyle = 'rgba(255,255,255,.75)'; g.font = F('', 12); g.textAlign = 'center'; g.fillText(s.foot, x0 + w / 2, y1 - 12); }
  g.restore();
  // glass glare
  gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h);
  screenTex.needsUpdate = true;
}
export function setKeyHandler(f) { onKey = f; }
// page coordinates of a side key (for tests)
export function keyPos(k) {
  const s = k[0] === 'R' ? 1 : 0, i = +k[1] - 1, v = new T.Vector3((FDK.x[s] / 192 - .5) * CAB.w, (.5 - FDK.y[i] / 288) * CAB.h, CAB.d / 2).project(cam), r = R.domElement.getBoundingClientRect();
  return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
}
function bill() { const m = new T.Group(); m.add(new T.Mesh(base.geo, base.mf)); m.add(new T.Mesh(base.geo, base.mb)); scene.add(m); return m; }
// n bills out of the slot (withdraw) or into it (deposit)
export function play(kind, n, done) {
  n = Math.max(1, Math.min(24, n)); onDone = done;
  for (let i = 0; i < n; i++) {
    const b = bill(), s = Math.random;
    b.userData = { kind, t0: i * .12, life: kind === 'out' ? 1.5 : 1.1, sx: (s() - .5) * .9, sz: .9 + s() * .5, spin: (s() - .5) * 8, tilt: (s() - .5) * 3, land: [(s() - .5) * .6, -.95 + .004 * i, .5 + s() * .35] };
    b.visible = false; bills.push(b);
  }
  clock.start(); running = true;
}
function loop() {
  requestAnimationFrame(loop); if (!R || !R.domElement.isConnected) return;
  const t = running ? clock.getElapsedTime() : 0; let alive = 0;
  bills.forEach(b => {
    const u = b.userData, k = (t - u.t0) / u.life;
    if (k < 0) { b.visible = false; alive++; return; }
    if (k > 1) { if (u.kind === 'in') b.visible = false; else { b.position.set(u.land[0], u.land[1], u.land[2]); b.rotation.set(-Math.PI / 2, 0, u.spin); } return; }
    alive++; b.visible = true;
    if (u.kind === 'out') {
      const e = Math.min(1, k / .2), f = Math.max(0, (k - .2) / .8);
      b.position.set(SLOT[0] + u.land[0] * f, SLOT[1] + e * .02 - f * f * (SLOT[1] - u.land[1]) + Math.sin(f * 3.1) * .12 * f, SLOT[2] + e * .06 + (u.land[2] - SLOT[2] - .06) * f);
      b.rotation.set(-.1 - f * (Math.PI / 2 - .1) + Math.sin(f * 9) * .4 * (1 - f), Math.sin(f * 7 + u.tilt) * .5 * (1 - f), u.spin * f);
    } else {
      const f = k * k * (3 - 2 * k);
      b.position.set(u.sx * (1 - f) + SLOT[0] * f, .5 * (1 - f) + SLOT[1] * f + Math.sin(f * 3.1) * .1, u.sz * (1 - f) + (SLOT[2] - .02) * f);
      b.rotation.set(-.1 * f, u.tilt * (1 - f), u.spin * (1 - f));
      b.scale.setScalar(f > .9 ? 1 - (f - .9) * 6 : 1);
    }
  });
  if (running && !alive) { running = false; const d = onDone; onDone = null; if (d) d(); }
  cam.position.lerp(view.p, .08); look.lerp(view.l, .08); cam.lookAt(look);
  R.render(scene, cam);
}
setInterval(() => { if (spec && spec.busy) drawScreen(spec); }, 120);
export function clearPile() { bills.forEach(b => scene.remove(b)); bills = []; }
window.ATM3D = { mount, resize, drawScreen, play, clearPile, setKeyHandler, keyPos, focus };
