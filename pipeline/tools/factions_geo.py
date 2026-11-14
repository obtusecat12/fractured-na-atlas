"""Build faction polygons (lon/lat) mixing county unions with terrain-following lines.
Inputs: work/work_counties.geojson, data/county_factions.json, NE rivers.
Outputs: build/factions.geojson, build/hatch.geojson, build/county_factions_final.json
Edit the CONFIG sections to change borders."""
import json, math
from shapely.geometry import shape, mapping, Polygon, LineString, MultiPolygon, box, Point
from shapely.ops import unary_union, linemerge
from shapely.validation import make_valid

C = json.load(open('work/work_counties.geojson'))['features']
FAC = json.load(open('data/county_factions.json'))
geo = {f['id']: shape(f['geometry']).buffer(0) for f in C if f.get('geometry')}
name = {f['id']: f['properties']['name'] for f in C}
def U(ids): return unary_union([geo[i] for i in ids if i in geo])
def st(s): return U([i for i in geo if i[:2] == s])
def fac_ids(fid): return [k for k, v in FAC.items() if v == fid]

def riv(nm, bbox):
    gs = []
    for fn in ('ne_10m_rivers_lake_centerlines', 'ne_10m_rivers_north_america'):
        for f in json.load(open(f'data/ne/{fn}.geojson'))['features']:
            if f['properties'].get('name') == nm:
                g = shape(f['geometry'])
                if g.intersects(box(*bbox)): gs.append(g)
    m = linemerge(unary_union(gs))
    return list(m.geoms) if m.geom_type == 'MultiLineString' else [m]
def chain(parts, start):
    """greedy chain of line parts from point nearest `start`"""
    parts = [list(p.coords) for p in parts if len(p.coords) > 2]
    out = []; cur = start
    while parts:
        best = None
        for i, p in enumerate(parts):
            for rev in (False, True):
                q = p[::-1] if rev else p
                d = math.dist(cur, q[0])
                if best is None or d < best[0]: best = (d, i, q)
        if best[0] > 0.35: break
        out += best[2]; cur = best[2][-1]; parts.pop(best[1])
    return out
def side(line, closing):
    """polygon = line followed by closing points (one side of a line)"""
    return make_valid(Polygon(list(line) + list(closing)))

F = {}  # faction id -> geometry
for fid in set(FAC.values()):
    F[fid] = U(fac_ids(fid))

# ---------- 1. CASCADE CREST: Cascadia | Lincoln / Jefferson ----------
CREST = [(-120.85,49.0),(-120.78,48.75),(-120.73,48.52),(-121.0,48.1),(-121.09,47.75),(-121.41,47.42),
         (-121.45,47.1),(-121.52,46.87),(-121.38,46.64),(-121.49,46.20),(-121.62,45.85),(-121.68,45.70),
         (-121.70,45.37),(-121.80,44.95),(-121.85,44.67),(-121.87,44.42),(-121.78,44.10),(-121.97,43.85),
         (-122.04,43.60),(-122.08,43.25),(-122.11,42.94),(-122.25,42.65),(-122.31,42.45),(-122.28,41.99)]
WEST = side(CREST, [(-126,41.99),(-126,49.0)])
WA, OR = st('53'), st('41')
pnw_wa = (F['cascadia'] | F['lincoln']) & WA
# Washington: the split is the Cascade crest itself. Oregon: Cascadia keeps its counties, whose eastern lines already run along the crest
# (Hood River stays with Cascadia: the Columbia Gorge is Portland's corridor).
F['cascadia'] = (pnw_wa & WEST) | (F['cascadia'] & OR)
F['lincoln'] = pnw_wa - WEST

# ---------- 2. APPALACHIAN GUERRILLA: Blue Ridge + Valley & Ridge provinces (USGS Fenneman physiography) ----------
import shapefile
_r = shapefile.Reader('data/physio/physio.shp')
PHYS = {}
for sr in _r.iterShapeRecords():
    k = (sr.record['PROVINCE'], sr.record['SECTION'])
    g = shape(sr.shape.__geo_interface__).buffer(0)
    PHYS[k] = PHYS.get(k, Polygon()).union(g)
def prov(p, sec=None): return unary_union([g for (pp, ss), g in PHYS.items() if pp == p and (sec is None or ss == sec)])
RIDGES = prov('BLUE RIDGE','SOUTHERN') | prov('VALLEY AND RIDGE','TENNESSEE')
# NE limit: a cut across the ridges just NE of Roanoke/Botetourt (James River water gap); SW limit: Rome GA gap
NE_CUT = side([(-79.20,37.20),(-79.75,37.95)], [(-76,39),(-76,36)])
SW_CUT = Polygon([(-86,34.45),(-84.2,34.45),(-84.2,33),(-86,33)])
SE = st('51') | st('47') | st('37') | st('13')
F['agg'] = ((RIDGES & SE) - NE_CUT - SW_CUT - F['wvbc'] - F['gilead'])
# West Virginia Baptist Convention: its eastern edge is the Allegheny Front (Appalachian Plateaus | Valley & Ridge)
F['wvbc'] = F['wvbc'] & prov('APPALACHIAN PLATEAUS')

# ---------- 3. NUECES STRIP: U.S. Government | Republic of Texas ----------
TX = st('48')
nue = chain(riv('Nueces', (-101,27,-97,30.5)), (-97.52,27.87))   # mouth -> upstream
nue = [p for p in nue if p[1] <= 29.45]
# west from the last upstream point along ~29.45N to the Rio Grande below Del Rio, then far south & back east offshore
NUECES_STRIP = side(nue, [(nue[-1][0],29.45),(-100.95,29.40),(-101.5,29.0),(-101.5,25.0),(-96.5,25.0),(-96.5,27.87)])
elpaso = geo['48141']
south_tx = (F['usg'] & TX) | (F['texas'])
usg_tx = TX & NUECES_STRIP
F['texas'] = (south_tx - NUECES_STRIP - elpaso)
F['usg'] = (F['usg'] - TX) | usg_tx | elpaso

# ---------- 4. MISSOURI RIVER: FEMA southern edge in Montana ----------
MT = st('30')
mis = chain(riv('Missouri', (-112,45.5,-103.9,48.5)), (-111.52,46.36))
mis = [p for p in mis if p[0] <= -104.03]
NORTH_MIS = side(mis, [(-104.03,49.1),(-116.5,49.1),(-116.5,45.5),(mis[0][0],45.5)])
fema_mt_old = F['fema'] & MT
F['fema'] = (F['fema'] - MT) | (fema_mt_old & NORTH_MIS) | (MT & NORTH_MIS & box(-111.2,45,-104,49.1))

# ---------- 5. MEXICAN OCCUPATION ZONE ----------
pec = chain(riv('Pecos', (-105,29.5,-101,33.6)), (-104.5,33.6))
PECOS_W = side([p for p in pec if p[1] <= 33.6], [(-101.0,29.5),(-101.0,29.0),(-109.5,29.0),(-109.5,33.6)])
NM_IDS = {'35023':'Hidalgo','35017':'Grant','35029':'Luna','35013':'Doña Ana','35051':'Sierra','35035':'Otero','35015':'Eddy'}
TX_IDS = {'48229':'Hudspeth','48109':'Culberson','48243':'Jeff Davis','48389':'Reeves'}
mx_core = U(list(NM_IDS) + list(TX_IDS))
eddy_east = geo['35015'] - PECOS_W
F['mxo'] = (mx_core - elpaso)
for k in list(F):
    if k != 'mxo': F[k] = F[k] - F['mxo']
HATCH = {
 'gila':      ('Gila Wilderness / Black Range',  '吉拉荒野 / 黑山脉', Polygon([(-109.1,32.95),(-108.4,32.85),(-107.75,32.85),(-107.45,33.1),(-107.4,33.7),(-109.1,33.7)])),
 'sacramento':('Sacramento & Guadalupe Mountains, Mescalero lands','萨克拉门托山与瓜达卢佩山、梅斯卡莱罗保留地', Polygon([(-106.0,33.45),(-105.72,32.75),(-105.45,32.2),(-104.95,31.75),(-104.45,31.75),(-104.4,32.2),(-104.75,32.9),(-105.0,33.45)])),
 'pecos_east':('Delaware Basin oil fields east of the Pecos','佩科斯河以东特拉华盆地油田', eddy_east.buffer(0)),
 'davis':     ('Davis Mountains frontier','戴维斯山脉前线', geo['48243'].buffer(0)),
}
hatch_feats = []
for hid,(en,zh,g) in HATCH.items():
    gg = g & F['mxo']
    if not gg.is_empty: hatch_feats.append({'type':'Feature','id':hid,'properties':{'id':hid,'en':en,'zh':zh},'geometry':mapping(gg)})

# clean & write
order = ['gilead','usg','jefferson','lincoln','sequoyah','fema','frc','agg','lds','texas','wvbc','cascadia','mxo']
feats = []
for k in order:
    g = make_valid(F[k]).buffer(0.002, join_style=2).buffer(-0.002, join_style=2)
    g = unary_union([p for p in (g.geoms if hasattr(g,'geoms') else [g]) if p.geom_type in ('Polygon','MultiPolygon') and p.area > 1e-5])
    F[k] = g
    feats.append({'type':'Feature','id':k,'properties':{'id':k},'geometry':mapping(g)})
json.dump({'type':'FeatureCollection','features':feats}, open('build/factions.geojson','w'))
json.dump({'type':'FeatureCollection','features':hatch_feats}, open('build/hatch.geojson','w'))
# per-county dominant faction (for county tooltips / lights)
allg = unary_union(list(F.values()))
cf = {}
for cid, g in geo.items():
    if cid[:2] in ('72',): continue
    best, ba = 'none', 0
    a = g.area or 1e-12
    for k in order:
        ia = g.intersection(F[k]).area if g.intersects(F[k]) else 0
        if ia > ba: best, ba = k, ia
    cf[cid] = best if ba/a > 0.5 else ('none' if ba/a < 0.15 else best+'*')
json.dump(cf, open('build/county_factions_final.json','w'))
for k in order: print(k, round(F[k].area,3))
print('hatch', [f['id'] for f in hatch_feats])
