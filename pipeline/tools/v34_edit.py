# v3.4 (2026-11-14) map edits made directly on the shipped topology (site/map.topo.json, map space W=4000),
# because the raw inputs of v2_build.py are not in the repo. Run from pipeline/tools:
#   python3 v34_edit.py   -> work/v34/*.geojson, then  node v34_topo.mjs  -> ../build/map.topo.json
# Edits:
#  1. Jefferson: drop the stray usg/fema slivers on its eastern edge; fill the empty strip between Jefferson and
#     Lincoln (eastern Oregon) by giving each point to the nearer of the two (gives a natural median line).
#  2. New Afrika: the old ~7 px blob is replaced by the real DOE Savannah River Site boundary
#     (OSM relation 20818263, build/osm_srs.json) plus New Ellenton's town limits (its capital, build/osm_new_ellenton.json).
#  3. Base state lines: the three states that in this timeline exist since long before 2009 get their own
#     state outlines: Franklin (1787, 11 East TN counties), Deseret (1896, 5 Utah counties),
#     Sequoyah (1907, the 41 counties of the former Indian Territory incl. Osage).
import sys, json, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from topo_py import load, features
from shapely.geometry import shape, mapping, box, Polygon, MultiPolygon
from shapely.geometry.polygon import orient
from shapely.ops import unary_union
from shapely.validation import make_valid
import rasterio.features as rf
from rasterio.transform import Affine

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, '../../site/'); OUT = os.path.join(HERE, '../work/v34/'); os.makedirs(OUT, exist_ok=True)
t, arcs = load(os.path.join(HERE, '../build/map_v33.topo.json'))  # frozen pre-v3.4 shipped topology = input
pj = json.load(open(SITE + 'projection.json'))
y0_, y1_ = np.radians(pj['parallels']); n = (np.sin(y0_) + np.sin(y1_)) / 2; c = 1 + np.sin(y0_) * (2 * n - np.sin(y0_)); r0 = np.sqrt(c) / n
k = pj['scale']; tx, ty = pj['translate']; yc = r0 - np.sqrt(c - 2 * n * np.sin(np.radians(33.6442))) / n
def fwd(lon, lat):
    l = np.radians(lon + pj['rotate'][0]); p = np.radians(lat); r = np.sqrt(c - 2 * n * np.sin(p)) / n
    return tx + k * r * np.sin(l * n), ty - k * (r0 - r * np.cos(l * n) - yc)

def polys(g):
    if g is None or g.is_empty: return []
    if g.geom_type == 'Polygon': return [g]
    return [q for p in getattr(g, 'geoms', []) for q in polys(p)]
def clean(g): return MultiPolygon(polys(make_valid(g))) if len(polys(make_valid(g))) != 1 else polys(make_valid(g))[0]

OBJ = {name: features(t, arcs, name) for name in t['objects']}
F = {f['id']: f for f in OBJ['factions']}
G = {i: f['geom'] for i, f in F.items()}

# ---- 1. Jefferson -------------------------------------------------------------------------
sliver_box = box(1880, 1810, 1900, 1855)
for fid in ('usg', 'fema'):
    G[fid] = clean(unary_union([p for p in polys(G[fid]) if not (p.within(sliver_box.buffer(2)) and p.area < 60)]))
U = unary_union(list(G.values()))
# the narrow silence channel the slivers sat in: close it into Jefferson
ch = G['jefferson'].buffer(6).buffer(-6).difference(U).intersection(sliver_box.buffer(8))
G['jefferson'] = clean(unary_union([G['jefferson']] + [p for p in polys(ch) if p.area > 1]).buffer(0.02).buffer(-0.02))
print('channel', round(ch.area, 1))
U = unary_union(list(G.values()))
trio = unary_union([G['jefferson'], G['lincoln'], G['cascadia']])
gap = trio.buffer(15).buffer(-15).difference(U).intersection(box(1830, 1730, 1930, 1780))
gap = unary_union([p for p in polys(gap) if p.area > 200])
print('gap area', round(gap.area, 1))
x0, y0, x1, y1 = gap.bounds; res = 0.1
W_, H_ = int((x1 - x0) / res) + 4, int((y1 - y0) / res) + 4
tr = Affine(res, 0, x0 - 2 * res, 0, res, y0 - 2 * res)
yy, xx = np.mgrid[0:H_, 0:W_]; px = x0 - 2 * res + (xx + .5) * res; py = y0 - 2 * res + (yy + .5) * res
from shapely import distance as sdist, points as spoints
pts = spoints(px.ravel(), py.ravel())
dj = sdist(G['jefferson'], pts).reshape(H_, W_); dl = sdist(G['lincoln'], pts).reshape(H_, W_)
lab = (dj <= dl).astype(np.uint8)
jpart = unary_union([shape(s) for s, v in rf.shapes(lab, mask=lab == 1, transform=tr) if v == 1])
jpart = gap.intersection(jpart.buffer(res * 0.6)); lpart = gap.difference(jpart)
G['jefferson'] = clean(unary_union([G['jefferson'], jpart]).buffer(0.02).buffer(-0.02))
G['lincoln'] = clean(unary_union([G['lincoln'], lpart]).buffer(0.02).buffer(-0.02))
print('jef +', round(jpart.area, 1), 'lin +', round(lpart.area, 1))

# ---- 2. New Afrika = Savannah River Site --------------------------------------------------
srs_ll = json.load(open(os.path.join(HERE, '../build/osm_srs.json')))
ring = [fwd(lo, la) for lo, la in srs_ll['coordinates'][0]]
srs = make_valid(Polygon([(float(a), float(b)) for a, b in ring]))
# plus the town of New Ellenton (capital, municipal limits, OSM), which touches the site's north fence
ne = json.load(open(os.path.join(HERE, '../build/osm_new_ellenton.json')))
srs = unary_union([srs, make_valid(Polygon([tuple(map(float, fwd(lo, la))) for lo, la in ne['coordinates'][0]]))]).buffer(0.3).buffer(-0.3).simplify(0.15)
for fid in G:
    if fid != 'nafr' and G[fid].intersects(srs): G[fid] = clean(G[fid].difference(srs)); print('cut from', fid)
G['nafr'] = clean(srs)
print('nafr area', round(G['nafr'].area, 1), [round(v) for v in G['nafr'].bounds])
for f in OBJ['factions']: f['geom'] = G[f['id']]

# ---- 3. state outlines ---------------------------------------------------------------------
CO = {f['id']: f for f in OBJ['counties'] if f['geom'] is not None}
FRK = ['47179', '47163', '47059', '47019', '47091', '47171', '47073', '47063', '47089', '47029', '47155']
DST = ['49039', '49041', '49031', '49055', '49015']
SEQ_N = ['Adair', 'Atoka', 'Bryan', 'Carter', 'Cherokee', 'Choctaw', 'Coal', 'Craig', 'Creek', 'Delaware', 'Garvin', 'Grady',
         'Haskell', 'Hughes', 'Jefferson', 'Johnston', 'Latimer', 'Le Flore', 'Love', 'McClain', 'McCurtain', 'McIntosh', 'Marshall',
         'Mayes', 'Murray', 'Muskogee', 'Nowata', 'Okfuskee', 'Okmulgee', 'Osage', 'Ottawa', 'Pittsburg', 'Pontotoc', 'Pushmataha',
         'Rogers', 'Seminole', 'Sequoyah', 'Stephens', 'Tulsa', 'Wagoner', 'Washington']
SEQ = [i for i, f in CO.items() if i.startswith('40') and f['properties'].get('n') in SEQ_N]
assert len(SEQ) == 41, (len(SEQ), sorted(set(SEQ_N) - {CO[i]['properties']['n'] for i in SEQ}))
for i in FRK + DST: assert i in CO, i
NEW = [('47', 'FR', 'Franklin', FRK), ('49', 'DS', 'Deseret', DST), ('40', 'SQ', 'Sequoyah', SEQ)]
ST = {f['id']: f for f in OBJ['states']}
for parent, nid, name, ids in NEW:
    g = unary_union([CO[i]['geom'] for i in ids])
    rest = unary_union([f['geom'] for i, f in CO.items() if i[:2] == parent and i not in ids])
    nohole = lambda x: unary_union([Polygon(p.exterior) for p in polys(x)])   # county unions leave lakes (Great Salt Lake) as holes
    g = nohole(g); rest = nohole(rest).difference(g)   # Deseret lies wholly inside Utah: keep that hole
    ST[parent]['geom'] = clean(rest)
    OBJ['states'].append({'id': nid, 'properties': {'name': name}, 'geom': clean(g)})
    print('state', name, len(ids), 'counties')

def fc(feats):
    out = []
    for f in feats:
        g = f['geom']
        if g is not None and not g.is_empty and 'Line' not in g.geom_type:
            # keep the shipped winding (exterior counter-clockwise in these coordinates, holes clockwise): the site's
            # night renderer clips with the nonzero rule over overlapping layers, so a flipped ring punches a hole
            g = clean(g); ps = [orient(p, 1.0) for p in polys(g)]; g = ps[0] if len(ps) == 1 else MultiPolygon(ps)
        out.append({'type': 'Feature', 'id': f['id'], 'properties': f['properties'], 'geometry': mapping(g) if g is not None and not g.is_empty else None})
    return {'type': 'FeatureCollection', 'features': out}
for name, feats in OBJ.items():
    json.dump(fc(feats), open(OUT + name + '.geojson', 'w'))
# projected factions for nightbake / labels (same shape as build.mjs' _pf.json)
json.dump({'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'id': f['id'], 'properties': {'id': f['id']}, 'geometry': mapping(f['geom'])} for f in OBJ['factions']]},
          open(os.path.join(HERE, '../build/_pf.json'), 'w'))
print('done', list(OBJ))
# NOTE: after v2_labels.py, keep the v3.3 label anchors for factions whose shape did not change (the medial-axis pass
# on re-encoded geometry can flip a label's orientation): only jefferson, lincoln, nafr, usg, fema and the silence
# entries take the new anchors (merge done by hand on 2026-11-14, see docs/TASKS.md).
