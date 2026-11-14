# v3.4: write lon/lat copies of the edited map-space layers (inverse of the site projection) for tools that work in
# geographic coordinates (wiki/mklocator.py): ../build/factions.geojson, ../build/_states_ll.geojson, ../build/_countries_ll.geojson
import json, os, numpy as np
from shapely.geometry import shape, mapping
from shapely.ops import transform
HERE = os.path.dirname(os.path.abspath(__file__)); W = os.path.join(HERE, '../work/v34/'); B = os.path.join(HERE, '../build/')
pj = json.load(open(os.path.join(HERE, '../../site/projection.json')))
y0_, y1_ = np.radians(pj['parallels']); n = (np.sin(y0_) + np.sin(y1_)) / 2; c = 1 + np.sin(y0_) * (2 * n - np.sin(y0_)); r0 = np.sqrt(c) / n
k = pj['scale']; tx, ty = pj['translate']; yc = r0 - np.sqrt(c - 2 * n * np.sin(np.radians(33.6442))) / n
def inv(px, py):
    px, py = np.asarray(px), np.asarray(py)
    x = (px - tx) / k; y = (ty - py) / k + yc; r0y = r0 - y
    l = np.arctan2(x, np.abs(r0y)) * np.sign(r0y)
    lat = np.arcsin(np.clip((c - (x * x + r0y * r0y) * n * n) / (2 * n), -1, 1))
    return np.round(np.degrees(l / n) - pj['rotate'][0], 5), np.round(np.degrees(lat), 5)
def conv(src, dst, keep=None):
    fc = json.load(open(W + src)); out = []
    for f in fc['features']:
        if f['geometry'] is None or (keep and f['id'] not in keep): continue
        g = transform(lambda x, y, z=None: inv(x, y), shape(f['geometry']))
        p = dict(f.get('properties') or {}); p.setdefault('id', f['id'])
        out.append({'type': 'Feature', 'id': f['id'], 'properties': p, 'geometry': mapping(g)})
    json.dump({'type': 'FeatureCollection', 'features': out}, open(B + dst, 'w')); print(dst, len(out))
conv('factions.geojson', 'factions.geojson'); conv('states.geojson', '_states_ll.geojson'); conv('countries.geojson', '_countries_ll.geojson', {'CAN', 'MEX', 'CUB', 'BHS'})
