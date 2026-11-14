# Wikipedia-style US locator (Albers, AK/HI insets) from our factions.geojson. usage: mklocator.py out.png id[,id...]
import sys, json
from PIL import Image, ImageDraw
from pyproj import Transformer
from shapely.geometry import shape, box
from shapely.ops import transform
PR = '/workspace/projects/c5ed423d-6463-4621-81ae-6bc7bb708155/'
out, ids = sys.argv[1], sys.argv[2].split(',')
W, H, S = 250, 160, 4
SEA, LAND, LINE, HI_ = (198, 236, 255), (254, 254, 233), (100, 100, 100), (192, 0, 0)
states = json.load(open(PR + 'data/work_states.geojson'))['features']
facs = [f for f in json.load(open(PR + 'build/factions.geojson'))['features'] if f['properties'].get('id') in ids]
cntry = [f for f in json.load(open(PR + 'data/ne/ne_50m_admin_0_countries.geojson'))['features'] if f['properties'].get('ADM0_A3') in ('CAN', 'MEX', 'CUB', 'BHS')]
conus = Transformer.from_crs(4326, '+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-96', always_xy=True)
ak = Transformer.from_crs(4326, '+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154', always_xy=True)
hi = Transformer.from_crs(4326, '+proj=aea +lat_1=8 +lat_2=18 +lat_0=13 +lon_0=-157', always_xy=True)
# frames: (transformer, scale px/m, offset x,y, clip lonlat box)
k = W * S / 5.5e6
frames = {
  'c': (conus, k, (W * S * 0.53, H * S * 0.47), box(-130, 22, -60, 52)),
  'a': (ak, k * 0.35, (W * S * 0.11, H * S * 0.98), box(-180, 50, -129, 72)),
  'h': (hi, k * 0.9, (W * S * 0.363, H * S * 1.164), box(-161, 18, -154, 23))}
im = Image.new('RGB', (W * S, H * S), SEA); dr = ImageDraw.Draw(im)
def polys(g):
    return list(g.geoms) if g.geom_type.startswith('Multi') or g.geom_type == 'GeometryCollection' else [g]
def draw(geom, frame, fill, outline=None, wid=1):
    T, sc, (ox, oy), clip = frames[frame]
    g = geom.intersection(clip)
    if g.is_empty: return
    for p in polys(g):
        if p.geom_type != 'Polygon': continue
        def P(ring): return [(ox + x * sc, oy - y * sc) for x, y in (T.transform(*c) for c in ring.coords)]
        dr.polygon(P(p.exterior), fill=fill)
        for r in p.interiors: dr.polygon(P(r), fill=SEA)
        if outline: dr.line(P(p.exterior), fill=outline, width=wid)
for f in cntry: draw(shape(f['geometry']).buffer(0), 'c', (230, 230, 230), (160, 160, 160), 2)
BOX = {'a': (0.005, 0.66, 0.27, 0.995), 'h': (0.27, 0.80, 0.42, 0.995)}
for fr in 'cah':
    if fr in BOX:
        x0, y0, x1, y1 = BOX[fr]; dr.rectangle([x0 * W * S, y0 * H * S, x1 * W * S, y1 * H * S], fill=SEA)
    for f in states: draw(shape(f['geometry']).buffer(0), fr, LAND)
    for f in facs: draw(shape(f['geometry']).buffer(0), fr, HI_)
    for f in states: draw(shape(f['geometry']).buffer(0), fr, None, LINE, 2)
# inset frames
for (x0, y0, x1, y1) in BOX.values():
    dr.rectangle([x0 * W * S, y0 * H * S, x1 * W * S, y1 * H * S], outline=(140, 140, 140), width=3)
im.resize((W, H), Image.LANCZOS).save(out)
print('ok', out)
