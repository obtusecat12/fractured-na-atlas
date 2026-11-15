# v3.5 (2026-11-15): relight new south factions in site/night/static.jpg (map-only batch). Header below is v34_lights.py's,
# reused verbatim (same GIBS source, tone, calibration); only pixels whose faction weight changed are repainted.
# Run after v35_edit.py and after adding the faction to site/factions_meta.json:  python3 v35_lights.py sbc
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
import json, os, io, math, sys, urllib.request
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

static = np.asarray(Image.open(SITE + 'night/static.jpg').convert('RGB')).astype(np.float32)  # shipped v3.4 bake = input
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


def paste(x0, y0, rgb, mask):
    sl = static[y0:y0 + rgb.shape[0], x0:x0 + rgb.shape[1]]
    sl[:] = sl * (1 - mask[..., None]) + rgb.astype(np.float32) * mask[..., None]

# ---------- new factions: weight from their lights mode, everything else unchanged ----------
NEWF = sys.argv[1:]
meta = {f['id']: f for f in json.load(open(SITE + 'factions_meta.json'))['factions']}
MODE_WT = {'normal': 1.0, 'dim': .38, 'controlled_blackout': 0.0}   # blackout: amber off, cold Gilead-style lamps added below
for fid in NEWF: WT[fid] = MODE_WT[meta[fid]['lights']]
old = [f for f in pf if f['id'] not in NEWF]
for fid in NEWF:
    from shapely.geometry import shape
    bx = shape([f for f in pf if f['id'] == fid][0]['geometry']).bounds
    x0, y0, x1, y1 = int(bx[0] * SC) - 60, int(bx[1] * SC) - 60, int(bx[2] * SC) + 60, int(bx[3] * SC) + 60
    g = gray_patch(x0, y0, x1, y1); w = weights(x0, y0, x1, y1); w_old = weights(x0, y0, x1, y1, old)
    ch = np.abs(w - w_old) > 0.01
    mask = gaussian_filter(binary_dilation(ch, iterations=3).astype(np.float32), 1.5)
    mask[:20] = mask[-20:] = 0; mask[:, :20] = mask[:, -20:] = 0
    paste(x0, y0, tone(radiance(g, A, G_) * w), np.clip(mask * 1.2, 0, 1))
    print(fid, 'patch', (x0, y0, x1, y1), 'changed px', int(ch.sum()), 'weight', WT[fid])
    if meta[fid]['lights'] == 'controlled_blackout':
        # Gilead's look (nightbake.py's gilead layer) baked into static: a regular grid of cold checkpoint lamps on
        # the same global 19 px pitch, a faint 6% residue, and a small lit core round the capital. No pulse (static).
        em = Image.new('F', (x1 - x0, y1 - y0), 0.0); d = ImageDraw.Draw(em)
        for p_ in polys([f for f in pf if f['id'] == fid][0]['geometry']):
            for i, ring in enumerate(p_): d.polygon([(x * SC - x0, y * SC - y0) for x, y in ring], fill=1.0 if i == 0 else 0.0)
        em = np.asarray(em, np.float32); R = radiance(g, A, G_)
        a = R * em * 0.06; YY, XX = np.mgrid[y0:y1, x0:x1]; P_ = int(13 * SC)
        a[(YY % P_ == 0) & (XX % P_ == 0) & (em > 0.5)] = 1.4
        cx, cy = fwd(*meta[fid]['capital_ll']); a += R * em * (((XX - cx * SC) ** 2 + (YY - cy * SC) ** 2) < (3 * SC) ** 2)
        COLD = [(0, (0, 0, 0)), (.1, (30, 40, 64)), (.4, (140, 165, 205)), (.7, (205, 222, 255)), (1, (255, 255, 255))]
        LC = np.stack([np.interp(v, [q[0] for q in COLD], [q[1][ch] for q in COLD]) for ch in range(3)], 1).astype(np.uint8)
        dd = a + 0.3 * gaussian_filter(a, 2.0 * SC) + 0.18 * gaussian_filter(a, 8 * SC)
        rgb = LC[np.clip(((1 - np.exp(-1.5 * dd)) * 255).astype(int), 0, 255)].astype(np.float32)
        static[y0:y1, x0:x1] = np.clip(static[y0:y1, x0:x1] + rgb * gaussian_filter(em, 1.0)[..., None], 0, 255)
        print(fid, 'blackout lamps', int(((YY % P_ == 0) & (XX % P_ == 0) & (em > 0.5)).sum()))
Image.fromarray(np.clip(static, 0, 255).astype(np.uint8)).save(SITE + 'night/static.jpg', quality=88, optimize=True)
print('wrote static.jpg')
