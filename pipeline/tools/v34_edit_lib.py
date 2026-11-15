# shared helpers of v34_edit.py (projection, clean, winding-preserving writer), importable without running the v3.4 edits
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
SITE = os.path.join(HERE, '../../site/')
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
def write(OBJ, OUT):
    for name, feats in OBJ.items():
        json.dump(fc(feats), open(OUT + name + '.geojson', 'w'))
    # projected factions for nightbake / labels (same shape as build.mjs' _pf.json)
    json.dump({'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'id': f['id'], 'properties': {'id': f['id']}, 'geometry': mapping(f['geom'])} for f in OBJ['factions']]},
              open(os.path.join(HERE, '../build/_pf.json'), 'w'))
    print('wrote', OUT, list(OBJ))
