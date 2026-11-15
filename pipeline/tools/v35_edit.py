# v3.5 (2026-11-15) South factions, map only (polygon + label; no wiki, no flag). Input: the frozen v3.4 shipped
# topology build/map_v34.topo.json. Each new faction is a county union (the counties layer of that same topology, so
# the shared lines match exactly), clipped where a landform rather than a county line is the real edge, and cut
# out of radio silence only (it must not take ground from an existing faction).
# Run from pipeline/tools:  python3 v35_edit.py -> ../work/v35/*.geojson + ../build/_pf.json ; node v35_topo.mjs
# Batches:
#  1. sbc  Southern Baptist Convention (Nashville), see its block below.
import sys, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from topo_py import load, features
from shapely.geometry import Polygon
from shapely.ops import unary_union
import v34_edit_lib as L

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '../work/v35/'); os.makedirs(OUT, exist_ok=True)
t, arcs = load(os.path.join(HERE, '../build/map_v34.topo.json'))
OBJ = {name: features(t, arcs, name) for name in t['objects']}
CO = {f['id']: f for f in OBJ['counties'] if f['geom'] is not None}
G = {f['id']: f['geom'] for f in OBJ['factions']}

def county_union(ids):
    for i in ids: assert i in CO, i
    return unary_union([CO[i]['geom'] for i in ids])

NEW = []
# ---- 1. Southern Baptist Convention ----
# Raster build at 0.1 map units (~230 m), then vectorised:
#  * the county union (Middle Tennessee + the Kentucky Pennyroyal up I-65 to Bowling Green) only bounds the search;
#  * north and south there is no natural line, so the edge comes from settlement (see the control field below);
#    the west edge is the Tennessee River / Kentucky Lake (counties beyond it are excluded);
#  * the east edge is the Cumberland Plateau escarpment from real terrain (AWS Terrain Tiles, z9): ground above
#    ~440 m (smoothed) is plateau and stays outside, so the line follows the coves and spurs;
#  * a corridor along I-40 crosses the plateau (Cookeville - Monterey - Crossville - Crab Orchard - Rockwood -
#    Kingston) and widens on the Harriman-Kingston valley floor (Roane County lowlands), where it meets the Appalachian guerrilla government on the Clinch/Tennessee valley floor; that shared
#    edge is AGG's own line (sbc is cut by AGG, never the other way round).
import numpy as np
from scipy import ndimage as ndi
from shapely.geometry import shape, LineString
import rasterio.features as rf
from rasterio.transform import Affine
import v35_dem as DEM, v35_proj as PJ
TN = '037 187 149 189 165 147 021 043 125 161 083 085 081 119 117 003 031 015 041 159 169 111 087 027 141 133 185 177 175 101 135 099 055 103 127 051 181'.split()
KY = '227 213 003 141 219 047'.split()
base = county_union(['47' + x for x in TN] + ['21' + x for x in KY])
RES = 0.1; bx0, by0, bx1, by1 = 2945, 2105, 3125, 2280
tr = Affine(RES, 0, bx0, 0, RES, by0)
X, Y, E = DEM.grid(bx0, by0, bx1, by1, RES); h, w = X.shape
def ras(g): return rf.rasterize([(g, 1)], out_shape=(h, w), transform=tr).astype(bool)
def fbm(cell, seed, octs=4):
    out = np.zeros((h, w), np.float32); amp = 1; tot = 0
    for o in range(octs):
        r = np.random.default_rng(seed + o); cs = max(4, cell >> o)
        g = r.random((h // cs + 3, w // cs + 3)).astype(np.float32)
        out += amp * ndi.zoom(g, cs, order=3)[:h, :w]; tot += amp; amp *= .5
    return out / tot - .5
# Who holds what is decided by settlement, not by survey lines: a "control field" sums a bump round every town the
# Convention garrisons (radius grows with population, 2000 census) plus the interstates that tie them together;
# the territory is where that field (with fractal noise for the ragged edges of a front) clears a threshold.
# It may not cross the Tennessee River / Kentucky Lake (the counties west of it are excluded) nor climb the plateau.
TOWNS = [  # lon, lat, population in thousands (2000)
    (-86.78, 36.16, 570), (-86.39, 35.85, 69), (-87.36, 36.53, 103), (-86.87, 35.93, 42), (-87.04, 35.62, 33), (-86.29, 36.21, 20),
    (-86.45, 36.39, 24), (-86.62, 36.30, 40), (-85.50, 36.16, 24), (-86.21, 35.36, 18), (-86.46, 35.48, 17), (-85.77, 35.68, 13),
    (-86.79, 35.45, 11), (-87.03, 35.20, 8), (-87.33, 35.24, 10), (-86.57, 35.15, 7), (-86.11, 35.19, 8), (-86.09, 35.48, 9),
    (-87.39, 36.08, 13), (-86.88, 36.51, 15), (-87.79, 36.09, 4), (-87.46, 35.78, 4), (-87.54, 35.55, 4), (-87.76, 35.31, 2),
    (-87.84, 35.62, 1), (-87.70, 36.32, 2), (-87.86, 36.49, 1), (-86.03, 36.52, 4), (-85.95, 36.25, 2), (-85.81, 35.96, 4),
    (-86.07, 35.83, 2), (-86.17, 36.40, 3), (-85.65, 36.36, 1), (-85.50, 36.55, 1), (-85.32, 36.38, 4), (-85.46, 35.93, 5),
    (-86.44, 36.99, 50), (-86.58, 36.72, 8), (-86.89, 36.84, 7), (-87.15, 36.81, 2), (-87.49, 36.87, 30), (-86.19, 36.75, 4),
    (-86.40, 35.27, 3), (-86.75, 35.75, 2), (-87.47, 36.19, 1), (-86.05, 35.98, 1), (-87.24, 35.92, 3), (-86.21, 36.06, 2),
    (-87.18, 36.31, 5), (-86.51, 35.62, 3), (-87.09, 36.07, 2)]
ROADS = [  # I-65, I-24, I-40 west, I-40 east (to Cookeville), I-840 arc, US-31W/I-65 north, I-24 south-east
    [(-87.05, 35.00), (-86.97, 35.20), (-86.85, 35.60), (-86.78, 36.00), (-86.70, 36.40), (-86.55, 36.70), (-86.44, 36.99)],
    [(-87.70, 36.75), (-87.36, 36.55), (-87.00, 36.33), (-86.78, 36.16), (-86.39, 35.85), (-86.07, 35.48), (-85.84, 35.22)],
    [(-87.95, 35.95), (-87.40, 36.03), (-87.10, 36.10), (-86.78, 36.16)],
    [(-86.78, 36.16), (-86.30, 36.20), (-85.95, 36.15), (-85.50, 36.16)],
    [(-87.20, 36.05), (-87.00, 35.85), (-86.60, 35.80), (-86.30, 36.00), (-86.30, 36.20)]]
WEST = ['47005', '47039', '47079', '47071', '47109', '21035', '21157']   # west of the Tennessee River / Kentucky Lake
fld = np.zeros((h, w), np.float32)
for lo, la, pop in TOWNS:
    tx_, ty_ = map(float, PJ.fwd(lo, la)); r = 3.2 + 2.2 * np.sqrt(pop / 10)
    fld += np.exp(-((X - tx_) ** 2 + (Y - ty_) ** 2) / (r * r))
for rd in ROADS:
    ln = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in rd])
    dd = ndi.distance_transform_edt(~ras(ln.buffer(0.25))) * RES
    fld += 0.55 * np.exp(-(dd / 4.0) ** 2)
fld += 0.7 * fbm(220, 3) + 0.8 * fbm(90, 11) + 0.4 * fbm(28, 31) + 0.12 * fbm(8, 51)
dom = ras(base.buffer(14)) & ~ras(unary_union([CO[i]['geom'] for i in WEST]))
Bw = (fld > 0.26) & dom
plateau = ndi.gaussian_filter(E, 6) > 440
plateau = ndi.binary_opening(ndi.binary_closing(plateau, iterations=4), iterations=3)
core = Bw & ~plateau
# I-40 across the plateau to the Tennessee valley; width varies along the road, wider round Crossville
I40 = [(-85.50, 36.16), (-85.38, 36.15), (-85.27, 36.15), (-85.13, 36.04), (-85.03, 35.95), (-84.88, 35.91), (-84.77, 35.88),
       (-84.68, 35.866), (-84.56, 35.875), (-84.51, 35.88), (-84.40, 35.89), (-84.30, 35.90)]
road = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in I40])
dr = ndi.distance_transform_edt(~ras(road.buffer(0.3))) * RES
cx, cy = map(float, PJ.fwd(-85.03, 35.95)); dc = np.hypot(X - cx, Y - cy)
kx, ky = map(float, PJ.fwd(-84.55, 35.90)); dk = np.hypot(X - kx, Y - ky)
width = 3.2 + 2.2 * np.exp(-(dc / 6) ** 2) + 1.4 * fbm(60, 41)
corr = (dr < width) | (dk < 9.5 + 3.0 * fbm(40, 61))      # the Harriman-Kingston valley floor where it meets AGG
M = core | corr
M = ndi.binary_closing(M, iterations=3) | core
lab, nl = ndi.label(M); sizes = ndi.sum(M, lab, range(1, nl + 1)); M = lab == (1 + int(np.argmax(sizes)))
M = ndi.binary_fill_holes(M)
sbc = unary_union([shape(g) for g, v in rf.shapes(M.astype(np.uint8), mask=M, transform=tr) if v == 1])
sbc = sbc.simplify(0.12).buffer(0.15, join_style=1).buffer(-0.15, join_style=1)
sbc = sbc.difference(G['agg'])
print('plateau px', int(plateau.sum()), 'corridor px', int((corr & ~core).sum()))
NEW.append(('sbc', sbc))

taken = unary_union(list(G.values()))
for fid, g in NEW:
    g = L.clean(g.difference(taken).buffer(0.05).buffer(-0.05))
    g = L.clean(unary_union([p for p in L.polys(g) if p.area > 2]))
    print(fid, 'area', round(g.area, 1), 'bounds', [round(v) for v in g.bounds], 'overlap with existing', round(g.intersection(taken).area, 3))
    G[fid] = g; OBJ['factions'].append({'id': fid, 'properties': {}, 'geom': g}); taken = unary_union([taken, g])
L.write(OBJ, OUT)
