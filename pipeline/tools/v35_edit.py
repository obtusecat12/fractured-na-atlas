# v3.5 (2026-11-15) South factions, map only (polygon + label; no wiki, no flag). Input: the frozen v3.4 shipped
# topology build/map_v34.topo.json. Each new faction is a county union (the counties layer of that same topology, so
# the shared lines match exactly), clipped where a landform rather than a county line is the real edge, and cut
# out of radio silence only (it must not take ground from an existing faction).
# Run from pipeline/tools:  python3 v35_edit.py -> ../work/v35/*.geojson + ../build/_pf.json ; node v35_topo.mjs
# Batches:
#  1. sbc  Southern Baptist Convention (Nashville): Nashville Basin + Highland Rim of Middle Tennessee and the
#     Pennyroyal of south-central Kentucky up I-65 to Bowling Green. West edge = Tennessee River / Kentucky Lake
#     (county lines of Stewart..Wayne follow it), east edge = foot of the Cumberland Plateau escarpment
#     (line through Albany KY, Livingston, east of Cookeville and Sparta, McMinnville, Cowan; the plateau top
#     Monterey/Spencer/Monteagle/Sewanee stays outside).
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
def west_of(line_ll, far_lon=-92.0):
    pts = [L.fwd(lo, la) for lo, la in line_ll]
    n_, s_ = line_ll[0], line_ll[-1]
    ring = pts + [L.fwd(far_lon, s_[1]), L.fwd(far_lon, n_[1])]
    return Polygon([(float(x), float(y)) for x, y in ring])

NEW = []
# ---- 1. Southern Baptist Convention ----
TN = '037 187 149 189 165 147 021 043 125 161 083 085 081 119 117 003 031 015 041 159 169 111 087 027 141 133 185 177 175 101 135 099 055 103 127 051 181'.split()
KY = '227 213 003 141 219 047'.split()
ESCARP = [(-85.10, 36.80), (-85.13, 36.66), (-85.20, 36.50), (-85.25, 36.36), (-85.33, 36.21), (-85.41, 36.07), (-85.42, 35.95),
          (-85.50, 35.81), (-85.60, 35.71), (-85.71, 35.56), (-85.80, 35.40), (-85.92, 35.26), (-85.98, 35.14), (-86.02, 34.95)]
sbc = county_union(['47' + x for x in TN] + ['21' + x for x in KY]).intersection(west_of(ESCARP))
NEW.append(('sbc', sbc))

taken = unary_union(list(G.values()))
for fid, g in NEW:
    g = L.clean(g.difference(taken).buffer(0.05).buffer(-0.05))
    g = L.clean(unary_union([p for p in L.polys(g) if p.area > 2]))
    print(fid, 'area', round(g.area, 1), 'bounds', [round(v) for v in g.bounds], 'overlap with existing', round(g.intersection(taken).area, 3))
    G[fid] = g; OBJ['factions'].append({'id': fid, 'properties': {}, 'geom': g}); taken = unary_union([taken, g])
L.write(OBJ, OUT)
