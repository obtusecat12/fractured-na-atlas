// fx.js — animated layers: TV-static fill for RADIO SILENCE, fragmented moving hatch for the Appalachian guerrilla zone
var FX = (function () {
  var T = 160, tiles = [], stripes = [], fxc = document.createElement('canvas'), mask = document.createElement('canvas');
  function mkNoise(seed) {
    var c = document.createElement('canvas'); c.width = T; c.height = T;
    var g = c.getContext('2d'), im = g.createImageData(T, T), d = im.data;
    for (var y = 0; y < T; y++) {
      var row = 0.75 + Math.random() * 0.5, prev = Math.random();
      for (var x = 0; x < T; x++) {
        // slight horizontal smear like an analogue tuner's snow
        var r = Math.random(); prev = prev * 0.35 + r * 0.65;
        var v = Math.pow(prev, 1.7) * 200 * row, i = (y * T + x) * 4;
        d[i] = v; d[i + 1] = v; d[i + 2] = v * 1.04; d[i + 3] = 255;
      }
    }
    g.putImageData(im, 0, 0); return c;
  }
  function mkStripe(k) {
    var s = 36, c = document.createElement('canvas'); c.width = s; c.height = s;
    var g = c.getContext('2d'); g.lineCap = 'butt';
    for (var o = -s; o < s * 2; o += 6) {
      // diagonal line broken into short random dashes
      for (var t = 0; t < s * 1.5; t += 2 + Math.random() * 4) {
        var len = 1.5 + Math.random() * 4.5; if (Math.random() < 0.35) { t += len; continue; }
        g.globalAlpha = 0.55 + Math.random() * 0.45;
        g.beginPath(); g.moveTo(o + t, s - t); g.lineTo(o + t + len, s - t - len);
        g.lineWidth = 0.8 + Math.random() * 0.7; g.strokeStyle = '#0E4A54'; g.stroke(); t += len;
      }
    }
    return c;
  }
  for (var i = 0; i < 8; i++) tiles.push(mkNoise(i));
  for (var j = 0; j < 4; j++) stripes.push(mkStripe(j));
  function mkBlocks(seed) {
    var c = document.createElement('canvas'), n = 40, b = 4; c.width = n * b; c.height = n * b;
    var g = c.getContext('2d');
    for (var y = 0; y < n; y++) { var row = Math.random() < 0.12 ? 1.35 : 1;
      for (var x = 0; x < n; x++) { var v = Math.min(255, (70 + Math.pow(Math.random(), 0.8) * 110) * row) | 0;
        g.fillStyle = 'rgb(' + v + ',' + v + ',' + Math.min(255, v + 8) + ')'; g.fillRect(x * b, y * b, b, b); } }
    // horizontal dropout lines, like a worn VHS title card
    g.fillStyle = 'rgba(0,0,0,.55)'; for (var k = 0; k < 6; k++) g.fillRect(0, (Math.random() * n | 0) * b, c.width, 1 + (Math.random() * 2 | 0));
    return c;
  }
  var blocks = []; for (var bi = 0; bi < 5; bi++) blocks.push(mkBlocks(bi));
  var word = document.createElement('canvas'), wtmp = document.createElement('canvas');
  // giant stretched RADIO SILENCE anchored to the map (centre of the dark interior)
  function rebuildWord() {
    var t = S.t, dpr = S.dpr; word.width = canvas.width; word.height = canvas.height; wtmp.width = canvas.width; wtmp.height = canvas.height;
    var g = word.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, word.width, word.height);
    var P0 = D.proj, pr = d3.geoConicEqualArea().parallels(P0.parallels).rotate(P0.rotate).scale(P0.scale).translate(P0.translate);
    var c = pr([-98.2, 39.3]), wMap = 1180, fs = 150;
    g.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * (t.x + c[0] * t.k), dpr * (t.y + c[1] * t.k));
    g.font = 'italic ' + fs + 'px "IM Fell English",Georgia,serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = (fs * 0.04) + 'px';
    var tw = g.measureText('Radio Silence').width, sx = wMap / tw;
    g.scale(sx, sx * 1.55); g.rotate(-0.06);
    g.fillStyle = '#fff'; g.fillText('Radio Silence', 0, 0);
    // carved scan gaps through the letters so the word reads as a broadcast card
    g.globalCompositeOperation = 'destination-out';
    for (var y = -fs * 0.5; y < fs * 0.5; y += fs * 0.085) g.fillRect(-tw, y, tw * 2, fs * 0.014);
    g.globalCompositeOperation = 'source-over';
    if ('letterSpacing' in g) g.letterSpacing = '0px';
  }
  var WV = [];
  function buildWordVariants() {
    WV = [];
    for (var vi = 0; vi < 3; vi++) {
      var vc = document.createElement('canvas'); vc.width = word.width; vc.height = word.height;
      var g = vc.getContext('2d'), dpr = S.dpr;
      var w2 = wtmp.getContext('2d'); w2.setTransform(1, 0, 0, 1, 0, 0); w2.globalCompositeOperation = 'source-over'; w2.clearRect(0, 0, wtmp.width, wtmp.height);
      var bp = w2.createPattern(blocks[(Math.random() * blocks.length) | 0], 'repeat'), bs = 1.6 * dpr;
      bp.setTransform(new DOMMatrix([bs, 0, 0, bs, Math.random() * 160 * bs, Math.random() * 160 * bs]));
      w2.fillStyle = bp; w2.fillRect(0, 0, wtmp.width, wtmp.height);
      w2.globalCompositeOperation = 'destination-in'; w2.drawImage(word, 0, 0);
      // dark drop edge first (pushes the word off the background snow), then the block-noise letters, with a faint red/cyan split
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 0.7; g.filter = 'brightness(0)'; g.drawImage(wtmp, 3 * dpr, 4 * dpr); g.filter = 'none';
      g.globalAlpha = 0.22; g.filter = 'sepia(1) saturate(6) hue-rotate(-50deg)'; g.drawImage(wtmp, -2 * dpr, 0);
      g.filter = 'sepia(1) saturate(6) hue-rotate(140deg)'; g.drawImage(wtmp, 2 * dpr, 0); g.filter = 'none';
      var zz = S.t.k / S.base0; g.globalAlpha = Math.max(0.25, Math.min(0.9, 1.25 - zz * 0.22)); g.drawImage(wtmp, 0, 0); g.globalAlpha = 1;
          WV.push(vc);
    }
  }
  var front = document.createElement('canvas'), fr2 = document.createElement('canvas'), frc3 = document.createElement('canvas');
  var state = { roll: 0, tear: 0, tearY: 0, agg: null, timer: null };

  // rebuilt after every full render: where the silence is, in device pixels
  function rebuildMask() {
    var t = S.t, dpr = S.dpr;
    if (mask.width !== canvas.width || mask.height !== canvas.height) { mask.width = canvas.width; mask.height = canvas.height; fxc.width = canvas.width; fxc.height = canvas.height; }
    var m = mask.getContext('2d');
    m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, mask.width, mask.height);
    m.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * t.x, dpr * t.y);
    m.fillStyle = '#fff'; m.fill(P(D.nation));
    m.globalCompositeOperation = 'destination-out';
    D.factions.forEach(function (f) { m.fill(P(f)); });
    m.fill(P(D.lakes));
    // keep borders crisp: shave a hair off the edge
    m.lineWidth = 1.2 / t.k; m.strokeStyle = '#000'; D.factions.forEach(function (f) { m.stroke(P(f)); });
    m.globalCompositeOperation = 'source-over';
    state.agg = D.byId.agg && D.byId.agg.feature;
    rebuildWord(); buildWordVariants();
    // Blackwater / Gilead front: a band straddling their shared border (near both boundaries, inside either)
    var bw = D.byId.bw && D.byId.bw.feature, gl = D.byId.gilead && D.byId.gilead.feature;
    state.front = false;
    if (bw && gl) {
      if (front.width !== canvas.width || front.height !== canvas.height) { front.width = canvas.width; front.height = canvas.height; fr2.width = canvas.width; fr2.height = canvas.height; }
      var a = front.getContext('2d'), b = fr2.getContext('2d'), bwid = Math.max(16, Math.min(44, t.k * 7)) / t.k;
      [a, b].forEach(function (c) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, front.width, front.height); c.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * t.x, dpr * t.y); c.lineJoin = 'round'; c.lineWidth = bwid; c.strokeStyle = '#fff'; });
      a.stroke(P(bw)); b.stroke(P(gl));
      a.setTransform(1, 0, 0, 1, 0, 0); a.globalCompositeOperation = 'destination-in'; a.drawImage(fr2, 0, 0);
      b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, fr2.width, fr2.height); b.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * t.x, dpr * t.y);
      b.fillStyle = '#fff'; b.fill(P(bw)); b.fill(P(gl));
      a.drawImage(fr2, 0, 0);
      a.setTransform(1, 0, 0, 1, 0, 0); a.drawImage(fr2, 0, 0); a.globalCompositeOperation = 'source-over';
      state.front = true;
    }
  }
  function draw() {
    var now = performance.now(), dpr = S.dpr, night = S.mode === 'night';
    if (!mask.width) return;
    var g = fxc.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.clearRect(0, 0, fxc.width, fxc.height);
    var pat = g.createPattern(tiles[(Math.random() * tiles.length) | 0], 'repeat'), sc = 1.25 * dpr;
    pat.setTransform(new DOMMatrix([sc, 0, 0, sc, Math.random() * T * sc, Math.random() * T * sc]));
    g.fillStyle = pat; g.fillRect(0, 0, fxc.width, fxc.height);
    // slow rolling hum bar (vertical hold drift) + rare horizontal tear
    state.roll = (now / 9000) % 1;
    var by = state.roll * fxc.height * 1.4 - fxc.height * 0.2, bh = fxc.height * 0.18;
    var gr = g.createLinearGradient(0, by - bh, 0, by + bh);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.07)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, by - bh, fxc.width, bh * 2);
    if (now > state.tear && Math.random() < 0.04) { state.tear = now + 60 + Math.random() * 90; state.tearY = Math.random() * fxc.height; }
    if (now < state.tear) {
      g.fillStyle = 'rgba(230,230,230,.16)'; g.fillRect(0, state.tearY, fxc.width, (2 + Math.random() * 5) * dpr);
    }
    if (word.width && WV.length) {
      var zz = S.t.k / S.base0; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      g.drawImage(WV[((now / 140) | 0) % WV.length], 0, 0);
    }
    g.globalCompositeOperation = 'destination-in'; g.drawImage(mask, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = night ? 0.32 : 0.95; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(fxc, 0, 0);
    ctx.restore();
    // guerrilla zone: fine, broken diagonal hatch creeping along the slope
    if (state.agg) {
      var t = S.t;
      ctx.save(); ctx.setTransform(dpr * t.k, 0, 0, dpr * t.k, dpr * t.x, dpr * t.y);
      ctx.clip(P(state.agg));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var sp = stripes[((now / 230) | 0) % stripes.length], p2 = ctx.createPattern(sp, 'repeat'), off = (now / 1000 * 7) % 36;
      p2.setTransform(new DOMMatrix([dpr, 0, 0, dpr, (t.x * dpr + off * dpr), (t.y * dpr - off * dpr)]));
      ctx.globalAlpha = night ? 0.4 : 0.85; ctx.fillStyle = night ? 'rgba(0,0,0,0)' : p2;
      if (night) { ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'invert(1) brightness(.35)'; ctx.fillStyle = p2; }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    drawFront(now);
  }
function drawFront(now) {
    if (!state.front) return;
    var dpr = S.dpr, t = S.t, night = S.mode === 'night';
    if (frc3.width !== canvas.width || frc3.height !== canvas.height) { frc3.width = canvas.width; frc3.height = canvas.height; }
    var g = frc3.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, frc3.width, frc3.height);
    var sp = stripes[((now / 200) | 0) % stripes.length], p2 = g.createPattern(sp, 'repeat'), off = (now / 1000 * 9) % 36;
    p2.setTransform(new DOMMatrix([dpr, 0, 0, dpr, (t.x * dpr + off * dpr), (t.y * dpr - off * dpr)]));
    g.fillStyle = p2; g.fillRect(0, 0, frc3.width, frc3.height);
    if (night) { g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(255,190,90,.55)'; g.fillRect(0, 0, frc3.width, frc3.height); }
    g.globalCompositeOperation = 'destination-in'; g.drawImage(front, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = night ? 0.8 : 1; ctx.drawImage(frc3, 0, 0); ctx.restore();
  }
  function tick() {
    if (S.mode === 'night' || document.hidden || S.gesture || S.pending || !S.baseSnap) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(S.baseSnap, 0, 0); draw(); ctx.drawImage(S.labelSnap, 0, 0);
  }
  function start() { if (!state.timer) state.timer = setInterval(tick, 70); }
  return { rebuildMask: rebuildMask, draw: draw, start: start };
})();
