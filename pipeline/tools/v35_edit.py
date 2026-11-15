# v3.5 (2026-11-15) South factions, map only (polygon + label; no wiki, no flag). Input: the frozen v3.4 shipped
# topology build/map_v34.topo.json. Each new faction is a county union (the counties layer of that same topology, so
# the shared lines match exactly), clipped where a landform rather than a county line is the real edge, and cut
# out of radio silence only (it must not take ground from an existing faction).
# Run from pipeline/tools:  python3 v35_edit.py -> ../work/v35/*.geojson + ../build/_pf.json ; node v35_topo.mjs
# Batches:
#  1. sbc  Southern Baptist Convention (Nashville), see its block below.
#  2. ttc  Twelve Tribes Communities (Chattanooga), see its block below.
#  3. mcs  Mecklenburg Committee of Safety (Charlotte), see its block below.
#  4. cws  Clearwater / Scientology (carved out of frc).
#  5. nfm  North Florida Municipal League (Gainesville; takes frc's I-75 strip Lake City-Ocala).
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

# ---- 2. Twelve Tribes Communities (Chattanooga) ----
# Same method as sbc: a settlement control field (towns + roads + fractal noise) inside a loose county frame
# (Hamilton, Marion, Sequatchie TN; Dade, Walker GA; Jackson, DeKalb AL). It takes in the Chattanooga valley,
# Lookout and Signal mountains and the top of Sand Mountain (the "Sand Mountain parish"), runs down the
# Tennessee valley past Bridgeport and Stevenson to Scottsboro, and up I-75 / the river towards Cleveland and
# Dolly Pond, where it runs into the Appalachian guerrilla government (AGG's edge is kept, tt is cut by it).
RES = 0.1; bx0, by0, bx1, by1 = 3025, 2195, 3115, 2290
tr = Affine(RES, 0, bx0, 0, RES, by0)
X, Y, E = DEM.grid(bx0, by0, bx1, by1, RES); h, w = X.shape
TOWNS = [
    (-85.31, 35.05, 155), (-85.23, 35.00, 21), (-85.30, 35.10, 13), (-85.34, 35.12, 8), (-85.18, 35.27, 12), (-85.27, 35.00, 4),
    (-85.36, 34.98, 2), (-85.26, 34.99, 4), (-85.28, 34.93, 10), (-85.25, 34.95, 9), (-85.29, 34.88, 2), (-85.51, 34.87, 2),
    (-85.63, 35.07, 3), (-85.71, 35.00, 3), (-85.67, 35.03, 1), (-85.73, 34.95, 2), (-85.80, 34.86, 2), (-86.03, 34.67, 15),
    (-85.39, 35.38, 3), (-85.97, 34.49, 4), (-85.85, 34.57, 1), (-85.98, 34.59, 1), (-85.82, 34.67, 1), (-85.13, 35.36, 1),
    (-85.06, 35.31, 2), (-85.50, 34.95, 1), (-85.25, 35.17, 3)]
ROADS = [[(-85.75, 35.04), (-85.63, 35.07), (-85.45, 35.05), (-85.31, 35.05), (-85.15, 35.03), (-85.02, 35.07)],   # I-24 / I-75
         [(-85.31, 35.05), (-85.45, 34.92), (-85.51, 34.87), (-85.62, 34.74)],                                     # I-59
         [(-85.71, 35.00), (-85.80, 34.86), (-85.95, 34.73), (-86.03, 34.67)],                                     # US-72
         [(-85.31, 35.05), (-85.20, 35.20), (-85.09, 35.33)]]                                                      # US-27 north
fld = np.zeros((h, w), np.float32)
for lo, la, pop in TOWNS:
    tx_, ty_ = map(float, PJ.fwd(lo, la)); r = 2.6 + 2.0 * np.sqrt(pop / 10)
    fld += np.exp(-((X - tx_) ** 2 + (Y - ty_) ** 2) / (r * r))
for rd in ROADS:
    ln = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in rd])
    dd = ndi.distance_transform_edt(~ras(ln.buffer(0.25))) * RES
    fld += 0.55 * np.exp(-(dd / 3.5) ** 2)
fld += 0.7 * fbm(200, 103) + 0.8 * fbm(80, 111) + 0.4 * fbm(25, 131) + 0.12 * fbm(8, 151)
frame = county_union(['47065', '47115', '47153', '13083', '13295', '01071', '01049'])
M = (fld > 0.30) & ras(frame.buffer(4))
lab, nl = ndi.label(M); sizes = ndi.sum(M, lab, range(1, nl + 1)); M = lab == (1 + int(np.argmax(sizes)))
M = ndi.binary_fill_holes(M)
tt = unary_union([shape(g) for g, v in rf.shapes(M.astype(np.uint8), mask=M, transform=tr) if v == 1])
tt = tt.simplify(0.12).buffer(0.15, join_style=1).buffer(-0.15, join_style=1)
NEW.append(('ttc', tt))

# ---- 3. Mecklenburg Committee of Safety (Charlotte) ----
# Same method: settlement control field along I-85 / I-40 / I-77 across the North Carolina Piedmont, from
# Gastonia and Rock Hill through Charlotte, Salisbury and the Triad to Burlington, west to Hickory, Morganton and
# Lenoir. The Blue Ridge (smoothed ground above ~600 m, real terrain) stays outside, except a corridor up
# US-321 from Lenoir past Blowing Rock towards Boone, where the Committee meets the Appalachian guerrilla
# government; up the Yadkin valley (Wilkesboro, Elkin) and US-52 (King, Pilot Mountain) it also runs along
# AGG's edge round Mount Airy.
RES = 0.1; bx0, by0, bx1, by1 = 3180, 2105, 3305, 2235
tr = Affine(RES, 0, bx0, 0, RES, by0)
X, Y, E = DEM.grid(bx0, by0, bx1, by1, RES); h, w = X.shape
TOWNS = [
    (-80.84, 35.23, 540), (-79.79, 36.07, 224), (-80.24, 36.10, 185), (-80.01, 35.96, 85), (-80.58, 35.41, 56), (-81.19, 35.26, 66),
    (-81.34, 35.73, 37), (-80.47, 35.67, 26), (-80.89, 35.78, 24), (-80.62, 35.49, 37), (-79.44, 36.10, 45), (-81.54, 35.91, 17),
    (-81.68, 35.75, 17), (-80.81, 35.58, 19), (-80.55, 34.99, 26), (-81.03, 34.92, 50), (-81.54, 35.29, 20), (-80.25, 35.82, 20),
    (-80.08, 35.88, 20), (-79.81, 35.71, 21), (-80.20, 35.35, 15), (-81.25, 35.47, 10), (-80.72, 35.12, 23), (-80.87, 35.40, 25),
    (-81.10, 35.29, 10), (-81.04, 35.24, 9), (-81.22, 35.67, 13), (-81.16, 36.15, 7), (-80.85, 36.24, 4), (-80.56, 35.89, 4),
    (-80.08, 36.12, 17), (-79.67, 36.35, 15), (-79.77, 36.49, 16), (-80.38, 36.03, 14), (-81.48, 35.81, 4), (-81.68, 36.13, 2),
    (-81.52, 35.74, 4), (-80.95, 35.01, 8), (-80.64, 35.07, 11), (-80.85, 35.50, 12), (-79.40, 36.07, 13), (-79.27, 36.10, 7),
    (-80.42, 36.13, 12), (-81.67, 36.20, 1), (-80.61, 36.50, 9), (-80.72, 36.40, 2), (-80.47, 36.39, 2),
    (-80.36, 36.28, 6), (-80.75, 36.32, 2), (-81.38, 36.10, 1)]
ROADS = [[(-81.40, 35.25), (-81.19, 35.26), (-80.84, 35.23), (-80.58, 35.41), (-80.47, 35.67), (-80.25, 35.82), (-80.01, 35.96), (-79.79, 36.07), (-79.44, 36.10), (-79.25, 36.08)],  # I-85
         [(-81.80, 35.72), (-81.68, 35.75), (-81.34, 35.73), (-80.89, 35.78), (-80.56, 35.89), (-80.24, 36.10), (-79.79, 36.07)],                                         # I-40
         [(-81.03, 34.92), (-80.84, 35.23), (-80.85, 35.50), (-80.89, 35.78), (-80.85, 36.24), (-80.80, 36.40)],                                                           # I-77
         [(-81.19, 35.26), (-81.25, 35.47), (-81.34, 35.73), (-81.54, 35.91), (-81.66, 36.05), (-81.68, 36.13), (-81.67, 36.20)],                                          # US-321
         [(-80.24, 36.10), (-80.70, 36.15), (-81.16, 36.15)],
         [(-80.24, 36.10), (-80.36, 36.28), (-80.47, 36.39), (-80.61, 36.50)]]                                                                                              # US-52                                                                                                               # US-421
fld = np.zeros((h, w), np.float32)
for lo, la, pop in TOWNS:
    tx_, ty_ = map(float, PJ.fwd(lo, la)); r = 2.4 + 1.3 * np.sqrt(pop / 10)
    fld += np.exp(-((X - tx_) ** 2 + (Y - ty_) ** 2) / (r * r))
for rd in ROADS:
    ln = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in rd])
    dd = ndi.distance_transform_edt(~ras(ln.buffer(0.25))) * RES
    fld += 0.6 * np.exp(-(dd / 3.0) ** 2)
fld += 0.7 * fbm(200, 203) + 0.8 * fbm(80, 211) + 0.4 * fbm(25, 231) + 0.12 * fbm(8, 251)
frame = county_union(['37' + c for c in '119 025 071 179 109 097 159 057 067 081 151 001 035 027 023 193 059 197 167 045 003 157 169 171 189'.split()] + ['45091'])
ridge = ndi.binary_opening(ndi.gaussian_filter(E, 5) > 600, iterations=3)
road321 = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in [(-81.54, 35.91), (-81.66, 36.05), (-81.68, 36.13), (-81.67, 36.22)]])
corr = (ndi.distance_transform_edt(~ras(road321.buffer(0.3))) * RES) < (2.6 + 1.2 * fbm(50, 241))
M = (((fld > 0.30) & ras(frame.buffer(3))) & ~ridge) | corr
lab, nl = ndi.label(M); sizes = ndi.sum(M, lab, range(1, nl + 1)); M = lab == (1 + int(np.argmax(sizes)))
M = ndi.binary_fill_holes(M)
mcs = unary_union([shape(g) for g, v in rf.shapes(M.astype(np.uint8), mask=M, transform=tr) if v == 1])
mcs = mcs.simplify(0.12).buffer(0.15, join_style=1).buffer(-0.15, join_style=1)
NEW.append(('mcs', mcs))

# ---- 4. Clearwater (Church of Scientology, Flag Land Base) ----
# The one exception to "silence only": Clearwater sits inside the Tampa Bay federal remnant (frc), so this enclave is
# carved out of frc, and frc loses exactly that ground (nothing else of frc moves). Core: downtown Clearwater round
# the Fort Harrison Hotel and the Flag Building, Clearwater Beach and the harbour, north to Dunedin and south to
# Belleair; the land edge is a small control field (towns + noise), the rest is frc's own coastline. It faces the
# federal command across Old Tampa Bay and along the Largo line.
RES = 0.04; bx0, by0, bx1, by1 = 3222, 2552, 3245, 2575
tr = Affine(RES, 0, bx0, 0, RES, by0)
X, Y, E = DEM.grid(bx0, by0, bx1, by1, RES); h, w = X.shape
TOWNS = [(-82.800, 27.965, 108), (-82.772, 28.012, 36), (-82.812, 27.936, 4), (-82.828, 27.978, 6), (-82.790, 27.990, 10),
         (-82.760, 27.960, 8)]
fld = np.zeros((h, w), np.float32)
for lo, la, pop in TOWNS:
    tx_, ty_ = map(float, PJ.fwd(lo, la)); r = 0.9 + 0.55 * np.sqrt(pop / 10)
    fld += np.exp(-((X - tx_) ** 2 + (Y - ty_) ** 2) / (r * r))
fld += 0.6 * fbm(120, 303) + 0.6 * fbm(40, 311) + 0.25 * fbm(12, 331)
M = fld > 0.42
M = ndi.binary_fill_holes(M)
cw = unary_union([shape(g) for g, v in rf.shapes(M.astype(np.uint8), mask=M, transform=tr) if v == 1])
cw = cw.simplify(0.03).buffer(0.05, join_style=1).buffer(-0.05, join_style=1)
cw = L.clean(cw.intersection(G['frc']))
G['frc'] = L.clean(G['frc'].difference(cw))
for f in OBJ['factions']:
    if f['id'] == 'frc': f['geom'] = G['frc']
NEW.append(('cws', cw))

# ---- 5. North Florida Municipal League (Gainesville) ----
# Towns along I-75 and US-301/US-441 that pooled their police and water works: Lake City, High Springs, Alachua,
# Gainesville, Starke, Micanopy, Ocala, down to The Villages and Leesburg. The federal command's I-75 convoy strip
# (Lake City to Ocala) runs straight through it, so that segment is handed to the League (second exception to
# "silence only"; frc keeps its I-10 strip, the Jacksonville coast and the southern block, which the League now
# touches round Wildwood and Ocala). West the scrub thins towards the Suwannee and the Gulf hammocks.
RES = 0.1; bx0, by0, bx1, by1 = 3200, 2450, 3275, 2525
tr = Affine(RES, 0, bx0, 0, RES, by0)
X, Y, E = DEM.grid(bx0, by0, bx1, by1, RES); h, w = X.shape
TOWNS = [(-82.325, 29.652, 125), (-82.14, 29.19, 56), (-82.64, 30.19, 12), (-82.60, 29.83, 6), (-82.50, 29.79, 10),
         (-82.11, 29.94, 6), (-82.28, 29.51, 2), (-81.99, 28.93, 50), (-81.88, 28.81, 20), (-82.04, 28.86, 7),
         (-82.06, 29.08, 4), (-82.45, 29.39, 3), (-82.43, 29.67, 5), (-82.09, 29.64, 2), (-82.17, 29.80, 2), (-82.70, 29.96, 2),
         (-82.30, 30.03, 2), (-82.14, 29.53, 2), (-81.99, 29.10, 3)]
ROADS = [[(-82.64, 30.25), (-82.60, 30.00), (-82.42, 29.75), (-82.30, 29.62), (-82.20, 29.35), (-82.14, 29.19), (-82.10, 29.00), (-82.04, 28.86)],  # I-75
         [(-82.11, 29.94), (-82.20, 29.75), (-82.28, 29.51), (-82.14, 29.19), (-81.99, 28.93), (-81.88, 28.81)],                                  # US-301/441
         [(-82.325, 29.652), (-82.43, 29.67), (-82.60, 29.83), (-82.64, 30.19)]]                                                                 # US-441 north
fld = np.zeros((h, w), np.float32)
for lo, la, pop in TOWNS:
    tx_, ty_ = map(float, PJ.fwd(lo, la)); r = 2.0 + 1.2 * np.sqrt(pop / 10)
    fld += np.exp(-((X - tx_) ** 2 + (Y - ty_) ** 2) / (r * r))
for rd in ROADS:
    ln = LineString([tuple(map(float, PJ.fwd(lo, la))) for lo, la in rd])
    dd = ndi.distance_transform_edt(~ras(ln.buffer(0.25))) * RES
    fld += 0.6 * np.exp(-(dd / 3.0) ** 2)
fld += 0.7 * fbm(200, 403) + 0.8 * fbm(80, 411) + 0.4 * fbm(25, 431) + 0.12 * fbm(8, 451)
M = fld > 0.34
lab, nl = ndi.label(M); sizes = ndi.sum(M, lab, range(1, nl + 1)); M = lab == (1 + int(np.argmax(sizes)))
M = ndi.binary_fill_holes(M)
nf = unary_union([shape(g) for g, v in rf.shapes(M.astype(np.uint8), mask=M, transform=tr) if v == 1])
nf = nf.simplify(0.12).buffer(0.15, join_style=1).buffer(-0.15, join_style=1)
strip = L.clean(G['frc'].intersection(Polygon([(3205, 2458), (3265, 2458), (3265, 2506), (3205, 2506)])))
strip = L.clean(unary_union([p for p in L.polys(strip) if p.area > 0.5]))
G['frc'] = L.clean(G['frc'].difference(strip))
for f in OBJ['factions']:
    if f['id'] == 'frc': f['geom'] = G['frc']
nf = L.clean(unary_union([nf, strip]).buffer(0.1, join_style=1).buffer(-0.1, join_style=1))
nf = unary_union([Polygon(p.exterior) for p in L.polys(nf)])   # the gaps between the old strip and the field are League ground too
print('nfm takes from frc', round(strip.area, 1))
NEW.append(('nfm', nf))

taken = unary_union(list(G.values()))
for fid, g in NEW:
    g = L.clean(g.difference(taken).buffer(0.05).buffer(-0.05))
    g = L.clean(unary_union([p for p in L.polys(g) if p.area > (0.05 if fid == 'cws' else 2)]))
    print(fid, 'area', round(g.area, 1), 'bounds', [round(v) for v in g.bounds], 'overlap with existing', round(g.intersection(taken).area, 3))
    G[fid] = g; OBJ['factions'].append({'id': fid, 'properties': {}, 'geom': g}); taken = unary_union([taken, g])
L.write(OBJ, OUT)
