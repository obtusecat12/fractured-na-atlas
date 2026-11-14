# Minimal TopoJSON decoder for the site's map.topo.json (projected map-space coordinates).
import json
from shapely.geometry import Polygon, MultiPolygon, LineString, MultiLineString
from shapely.validation import make_valid

def load(path):
    t = json.load(open(path))
    sx, sy = t['transform']['scale']; tx, ty = t['transform']['translate']
    arcs = []
    for a in t['arcs']:
        x = y = 0; pts = []
        for dx, dy in a:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)
    return t, arcs

def ring(arcs, idx):
    out = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(a if not out else a[1:])
    return out

def geom(arcs, g):
    ty = g['type']
    if ty == 'Polygon':
        rs = [ring(arcs, r) for r in g['arcs']]
        return make_valid(Polygon(rs[0], rs[1:])) if rs and len(rs[0]) > 3 else Polygon()
    if ty == 'MultiPolygon':
        ps = []
        for p in g['arcs']:
            rs = [ring(arcs, r) for r in p]
            if len(rs[0]) > 3: ps.append(Polygon(rs[0], rs[1:]))
        return make_valid(MultiPolygon(ps)) if ps else Polygon()
    if ty == 'LineString': return LineString(ring(arcs, g['arcs']))
    if ty == 'MultiLineString': return MultiLineString([ring(arcs, l) for l in g['arcs']])
    return None

def features(t, arcs, name):
    out = []
    for g in t['objects'][name]['geometries']:
        out.append({'id': g.get('id'), 'properties': g.get('properties', {}), 'geom': geom(arcs, g)})
    return out
