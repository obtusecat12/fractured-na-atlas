# v3.4 (2026-11-14): local re-bake of site/night/static.jpg without the 124 MB night_src.npy.
# Source radiance for each patch comes from NASA GIBS (VIIRS_Black_Marble, 2016, the same composite as the
# Black Marble 2016 tiles nightbake.py used), level 7 (~0.0044 deg/px), converted to gray and calibrated against the
# shipped static.jpg on untouched pixels. Then each patch is toned exactly like nightbake.py and pasted back with a
# feathered mask, so only the changed areas move.
# Patches:
#  * the four nuclear strike zones: the old perfect discs are replaced by a physically plausible outage map
#    (irregular dead core per ground zero, stretched downwind; a ragged ring of feeder-sized blocks that are dark,
#    browned-out or still lit; a few generator-backed lights inside the core). Concord–Mare Island has two ground zeros.
#  * New Afrika (now the Savannah River Site) and the filled Jefferson/Lincoln strip: new faction weights.
# Run from pipeline/tools after v34_edit.py (needs ../build/_pf.json, _pn.json):  python3 v34_lights.py
import json, os, io, math, urllib.request
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, zoom as ndzoom, map_coordinates, binary_dilation
Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(HERE, '../build/'); SITE = os.path.join(HERE, '../../site/')
CACHE = os.path.join(HERE, '../work/gibs/'); os.makedirs(CACHE, exist_ok=True)
SC = 1.5
pj = json.load(open(SITE + 'projection.json'))
y0_, y1_ = np.radians(pj['parallels']); n = (np.sin(y0_) + np.sin(y1_)) / 2; c = 1 + np.sin(y0_) * (2 * n - np.sin(y0_)); r0 = np.sqrt(c) / n
k = pj['scale']; tx, ty = pj['translate']; yc = r0 - np.sqrt(c - 2 * n * np.sin(np.radians(33.6442))) / n
def fwd(lon, lat):
    l = np.radians(lon + pj['rotate'][0]); p = np.radians(lat); r = np.sqrt(c - 2 * n * np.sin(p)) / n
    return tx + k * r * np.sin(l * n), ty - k * (r0 - r * np.cos(l * n) - yc)
def inv(px, py):
    x = (px - tx) / k; y = (ty - py) / k + yc; r0y = r0 - y
    l = np.arctan2(x, np.abs(r0y)) * np.sign(r0y)
    lat = np.arcsin(np.clip((c - (x * x + r0y * r0y) * n * n) / (2 * n), -1, 1))
    return np.degrees(l / n) - pj['rotate'][0], np.degrees(lat)

# ---------- GIBS source ----------
LV, TD = 7, 2.25  # level 7: 512 px tiles of 2.25 deg
def tile(row, col):
    fn = CACHE + '%d_%d_%d.png' % (LV, row, col)
    if not os.path.exists(fn):
        u = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_Black_Marble/default/2016-01-01/500m/%d/%d/%d.png' % (LV, row, col)
        open(fn, 'wb').write(urllib.request.urlopen(u, timeout=60).read())
    a = np.asarray(Image.open(fn).convert('RGB')).astype(np.float32) / 255
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
def gray_patch(x0, y0, x1, y1):
    xs = (np.arange(x0, x1) + .5) / SC; ys = (np.arange(y0, y1) + .5) / SC
    X, Y = np.meshgrid(xs, ys); lon, lat = inv(X, Y)
    c0, c1 = int((lon.min() + 180) // TD), int((lon.max() + 180) // TD); r0_, r1_ = int((90 - lat.max()) // TD), int((90 - lat.min()) // TD)
    mos = np.zeros(((r1_ - r0_ + 1) * 512, (c1 - c0 + 1) * 512), np.float32)
    for r in range(r0_, r1_ + 1):
        for cc in range(c0, c1 + 1): mos[(r - r0_) * 512:(r - r0_ + 1) * 512, (cc - c0) * 512:(cc - c0 + 1) * 512] = tile(r, cc)
    fx = (lon + 180) / TD * 512 - c0 * 512 - .5; fy = (90 - lat) / TD * 512 - r0_ * 512 - .5
    return map_coordinates(mos, [fy, fx], order=1, mode='nearest')

# ---------- faction weights (same table as nightbake.py's static layer) ----------
pf = json.load(open(B + '_pf.json'))['features']; pn = json.load(open(B + '_pn.json'))
pn = pn['features'] if 'features' in pn else [pn]
WT = {i: 1.0 for i in ['usg', 'jefferson', 'lincoln', 'sequoyah', 'lds', 'texas', 'cascadia', 'frk', 'sup', 'dst', 'abs']}
WT.update({'dwg': .9, 'bw': .95, 'mxo': .75}); WT.update({i: .38 for i in ['wvbc', 'srl', 'nafr', 'utdr', 'vtr', 'gmr', 'csa']})
def polys(g):
    t = g['type']; return [g['coordinates']] if t == 'Polygon' else g['coordinates'] if t == 'MultiPolygon' else [q for gg in g.get('geometries', []) for q in polys(gg)]
def weights(x0, y0, x1, y1, feats=pf):
    w = Image.new('F', (x1 - x0, y1 - y0), 1.0); d = ImageDraw.Draw(w)   # outside the US: lit
    def fill(f, v):
        for p in polys(f['geometry']):
            for i, ring in enumerate(p):
                d.polygon([(x * SC - x0, y * SC - y0) for x, y in ring], fill=v if i == 0 else 0.0)
    for f in pn: fill(f, 0.0)                                            # radio silence
    for f in feats:
        fid = f['id']; base = fid.split('_')[0] if fid.startswith(('usg_', 'gilead_')) else fid
        fill(f, WT.get(base, 0.0))                                       # other layers (fema, frc, gilead, agg) are not in static
    return np.asarray(w, np.float32)

# ---------- tone (nightbake.py) ----------
AMB = [(0, (0, 0, 0)), (.05, (34, 16, 0)), (.22, (140, 70, 14)), (.45, (232, 150, 58)), (.7, (255, 205, 130)), (.9, (255, 238, 200)), (1, (255, 255, 245))]
v = np.linspace(0, 1, 256); LUT = np.stack([np.interp(v, [s[0] for s in AMB], [s[1][ch] for s in AMB]) for ch in range(3)], 1).astype(np.uint8)
def tone(a, gain=1.5):
    d = a * 1.0 + 0.3 * gaussian_filter(a, 2.0 * SC) + 0.18 * gaussian_filter(a, 8 * SC)
    t = 1 - np.exp(-gain * d); return LUT[np.clip((t * 255).astype(int), 0, 255)]
F0 = 0.02
def radiance(g, A, G_, f0=None):
    f0 = F0 if f0 is None else f0                     # GIBS colour tiles carry a faint land/airglow floor: fitted below
    g = np.clip(A * np.power(np.clip(g, 0, 1), G_), 0, 1)
    return np.clip((g - f0) / (1 - f0), 0, 1) ** 1.25

static = np.asarray(Image.open(B + 'night/static.jpg').convert('RGB')).astype(np.float32)  # v3.3 bake, kept as the input
H, W = static.shape[:2]
lum = lambda im: im[..., 0] * .3 + im[..., 1] * .59 + im[..., 2] * .11
ex = json.load(open(SITE + 'extras.json'))
OLD_NUKE = [(nz['x'] * SC, nz['y'] * SC, nz['r'] * 1.7 * SC) for nz in ex['nuclear']]

# ---------- calibration on the Bay Area / LA basin, away from the strike discs ----------
def calib():
    best = None; samples = []
    for (x0, y0, x1, y1) in [(2520, 2950, 2760, 3150), (2780, 3330, 3000, 3480)]:
        g = gray_patch(x0, y0, x1, y1); w = weights(x0, y0, x1, y1)
        YY, XX = np.mgrid[y0:y1, x0:x1]; ok = w > 0.99
        for (cx, cy, rr) in OLD_NUKE: ok &= (XX - cx) ** 2 + (YY - cy) ** 2 > (rr * 3) ** 2
        ok[:40] = ok[-40:] = False; ok[:, :40] = ok[:, -40:] = False
        samples.append((g, w, ok, lum(static[y0:y1, x0:x1])))
    for f0 in (0.02, 0.04, 0.06, 0.08, 0.10):
      for A in np.arange(0.5, 1.8, 0.1):
        for G_ in np.arange(1.0, 2.6, 0.1):
            e = 0; m = 0
            for g, w, ok, L0 in samples:
                L1 = lum(tone(radiance(g, A, G_, f0) * w).astype(np.float32)); e += np.abs(L1 - L0)[ok].sum(); m += ok.sum()
            e /= m
            if best is None or e < best[0]: best = (e, A, G_, f0)
    print('calibration  mean |dL| = %.3f  A=%.2f  gamma=%.2f  floor=%.2f' % best); return best[1], best[2], best[3]
A, G_, F0 = calib()

# ---------- outage model ----------
rng = np.random.default_rng(2009)
def vnoise(h, w, cell, seed):
    r = np.random.default_rng(seed); g = r.random((h // cell + 3, w // cell + 3))
    return ndzoom(g, cell, order=3)[:h, :w]
def fbm(h, w, cell, seed, oct=4):
    s = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(oct): s += amp * vnoise(h, w, max(2, cell >> o), seed + o); tot += amp; amp *= 0.5
    return s / tot
def smooth(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def outage(x0, y0, x1, y1, gzs, wind_deg, seed):
    """multiplier 0..1 for lights in the patch. gzs: [(x, y, R)] in bake px."""
    h, w = y1 - y0, x1 - x0; YY, XX = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    # domain warp so nothing is round
    wx = (fbm(h, w, 48, seed) - .5) * 26; wy = (fbm(h, w, 48, seed + 9) - .5) * 26
    m = np.ones((h, w), np.float32); ph = math.radians(wind_deg)
    # feeder service areas: irregular Voronoi cells (~3-4 px, i.e. a few km), each one on or off as a unit
    from scipy.spatial import cKDTree
    npts = max(50, int(h * w / 11)); rs = np.random.default_rng(seed + 4)
    sites = np.c_[rs.random(npts) * w, rs.random(npts) * h]; val = rs.random(npts)
    q = np.c_[(XX - x0 + wx * .35).ravel(), (YY - y0 + wy * .35).ravel()]
    blocks = val[cKDTree(sites).query(q)[1]].reshape(h, w)
    lob = fbm(h, w, 20, seed + 17)
    for (gx, gy, R) in gzs:
        dx, dy = XX + wx - gx, YY + wy - gy; dist = np.hypot(dx, dy); ang = np.arctan2(dy, dx)
        down = np.clip(np.cos(ang - ph), 0, 1) ** 1.6
        Re = R * (0.82 + 0.36 * lob) * (1 + 0.55 * down)
        d = dist / Re
        alive = blocks > (1 - smooth(0.42, 1.45, d)) * 0.98 + 0.01          # ragged ring of feeders
        dim = 0.22 + 0.78 * smooth(0.55, 1.75, d)                           # brown-out towards the edge
        mm = np.where(d < 0.42, 0.0, np.where(alive, dim, 0.0))
        mm = np.where(d > 1.75, 1.0, mm)
        m *= mm.astype(np.float32)
    # a handful of generator-backed sites inside the dead cores (hospitals, pumping stations, the base fence)
    for (gx, gy, R) in gzs:
        for _ in range(rng.integers(3, 7)):
            a = rng.random() * 6.283; rr = R * (0.15 + 0.35 * rng.random())
            px, py = int(gx + rr * math.cos(a) - x0), int(gy + rr * math.sin(a) - y0)
            if 1 <= px < w - 1 and 1 <= py < h - 1: m[py, px] = max(m[py, px], 0.55)
    return m

def paste(x0, y0, rgb, mask):
    sl = static[y0:y0 + rgb.shape[0], x0:x0 + rgb.shape[1]]
    sl[:] = sl * (1 - mask[..., None]) + rgb.astype(np.float32) * mask[..., None]

# ---------- strike zones ----------
GZ = {  # ground zeros (lon, lat, share of the zone radius), downwind bearing (deg, image space, 0 = east, negative = north of east)
    0: ([(-122.03, 38.03, .80), (-122.27, 38.09, .62)], -12),   # Concord NWS + Mare Island; westerlies push east into the Delta
    1: ([(None, None, 1.0)], -38),                                # Kingman: SW winds -> NE
    2: ([(-117.71, 33.67, 1.0)], -30),                            # MCAS El Toro; onshore flow -> NE (Saddleback / Inland Empire)
    3: ([(-89.87, 35.34, 1.0)], -35),                             # NSA Mid-South, Millington
}
for i, nz in enumerate(ex['nuclear']):
    R = nz['r'] * 1.7 * SC; cx, cy = nz['x'] * SC, nz['y'] * SC
    gzs = []
    for lo, la, s in GZ[i][0]:
        gx, gy = (cx, cy) if lo is None else (fwd(lo, la)[0] * SC, fwd(lo, la)[1] * SC)
        gzs.append((gx, gy, R * s))
    P = int(R * 3.4) + 40
    x0, y0, x1, y1 = int(cx - P), int(cy - P), int(cx + P), int(cy + P)
    g = gray_patch(x0, y0, x1, y1); w = weights(x0, y0, x1, y1)
    m = outage(x0, y0, x1, y1, gzs, GZ[i][1], 100 + i)
    rgb = tone(radiance(g, A, G_) * w * m)
    YY, XX = np.mgrid[y0:y1, x0:x1]; dd = np.hypot(XX - cx, YY - cy)
    paste(x0, y0, rgb, 1 - smooth(R * 2.6, R * 3.2, dd))
    print('zone', nz['en'], 'patch', (x0, y0, x1, y1))

# ---------- faction-weight changes (New Afrika, Jefferson/Lincoln strip, removed slivers) ----------
old_pf = None
try:
    import subprocess
    old_pf = json.loads(subprocess.run(['git', 'show', 'HEAD:pipeline/build/_pf.json'], cwd=HERE, capture_output=True, text=True).stdout)['features']
except Exception: pass
for (x0, y0, x1, y1) in [(4800, 3400, 4900, 3500), (2740, 2580, 2920, 2800)]:
    g = gray_patch(x0, y0, x1, y1); w = weights(x0, y0, x1, y1)
    w_old = weights(x0, y0, x1, y1, old_pf) if old_pf else None
    ch = (np.abs(w - w_old) > 0.01) if w_old is not None else np.ones_like(w, bool)
    mask = gaussian_filter(binary_dilation(ch, iterations=16).astype(np.float32), 5)
    mask[:20] = mask[-20:] = 0; mask[:, :20] = mask[:, -20:] = 0
    paste(x0, y0, tone(radiance(g, A, G_) * w), np.clip(mask * 1.2, 0, 1))
    print('weights patch', (x0, y0, x1, y1), 'changed px', int(ch.sum()))

Image.fromarray(np.clip(static, 0, 255).astype(np.uint8)).save(SITE + 'night/static.jpg', quality=88, optimize=True)
print('wrote static.jpg')
