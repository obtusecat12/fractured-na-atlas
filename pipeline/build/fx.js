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
