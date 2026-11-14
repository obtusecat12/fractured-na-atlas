"""Build faction polygons: county unions + terrain-following cuts. Edit TERRAIN/ASSIGN here and rerun."""
import json
from shapely.geometry import shape, mapping, Polygon, LineString, box, Point
from shapely.ops import unary_union, linemerge, split
D='../data/'
cf=json.load(open(D+'county_factions.json'))
C={f['id']:shape(f['geometry']).buffer(0) for f in json.load(open(D+'work_counties.geojson'))['features']}
S={f['id']:shape(f['geometry']).buffer(0) for f in json.load(open(D+'work_states.geojson'))['features']}
def U(ids): return unary_union([C[i] for i in ids])
def fac(name, states=None): return [k for k,v in cf.items() if v==name and (states is None or k[:2] in states)]
def side(bx, line, ref):
    for p in split(bx, line).geoms:
        if p.contains(Point(ref)): return p
    raise Exception('side not found')
def river(fn, names):
    d=json.load(open(D+'ne/'+fn))
    ls=[]
    for f in d['features']:
        if f['properties'].get('name') in names:
            g=shape(f['geometry']); ls+= list(g.geoms) if g.geom_type=='MultiLineString' else [g]
    return linemerge(ls)

# --- Cascade crest (Cascadia | Lincoln ; Cascadia east edge in Oregon)
CREST=[(-120.85,49.6),(-120.85,49.0),(-120.73,48.52),(-121.05,48.10),(-121.09,47.75),(-121.41,47.42),(-121.45,47.10),(-121.52,46.87),
 (-121.38,46.64),(-121.49,46.20),(-121.62,45.70),(-121.70,45.37),(-121.80,44.80),(-121.87,44.42),(-121.95,44.00),(-122.04,43.60),
 (-122.11,42.94),(-122.31,42.45),(-122.25,42.0),(-122.2,41.0)]
WEST=side(box(-126,41.5,-116,49.3), LineString(CREST), (-124,46))
wa_or_cl = U(fac('cascadia','53')+fac('lincoln','53'))
cascadia = (wa_or_cl.intersection(WEST)).union(U(fac('cascadia','41')).intersection(WEST))
lincoln  = wa_or_cl.difference(WEST)

# --- Missouri River (FEMA southern edge, Fort Benton MT -> Garrison ND)
d_=json.load(open(D+'ne/ne_10m_rivers_lake_centerlines.geojson'))
_parts=[list(l.coords) for f in d_['features'] if f['properties'].get('name')=='Missouri' for l in shape(f['geometry']).geoms]
def _pick(n0):  # piece whose endpoint lon ~ n0
    return [p for p in _parts if abs(p[0][0]-n0)<0.01 or abs(p[-1][0]-n0)<0.01]
seqs=[]
for a,b in [(-111.6988,-108.1906),(-108.1964,-106.4056),(-106.4058,-103.7723),(-103.7712,-101.4001)]:
    p=[q for q in _parts if (abs(q[0][0]-a)<0.002 and abs(q[-1][0]-b)<0.002) or (abs(q[0][0]-b)<0.002 and abs(q[-1][0]-a)<0.002)][0]
    if abs(p[0][0]-a)>0.002: p=p[::-1]
    seqs+=p
MO=[c for c in seqs if c[0]>-110.75]
MO=[(-110.9,MO[0][1])]+MO+[(-101.2,47.5)]
mbox = box(-110.68,45.5,-101.40,49.2)
north_mo = side(mbox, LineString(MO), (-106,48.9))
mtnd = S['30'].union(S['38'])
fema_base = U(fac('fema'))
fema = fema_base.difference(mbox).union(fema_base.intersection(mbox).intersection(north_mo)).union(mtnd.intersection(north_mo))

# --- Blue Ridge / upper Tennessee Valley (Appalachian Guerrilla Government)
AGG_EAST=[(-79.70,37.45),(-79.78,37.30),(-79.88,37.18),(-80.05,37.02),(-80.25,36.85),(-80.30,36.68),(-80.55,36.58),(-80.80,36.52),
 (-81.05,36.42),(-81.25,36.30),(-81.45,36.15),(-81.65,36.05),(-81.90,35.92),(-82.10,35.75),(-82.25,35.60),(-82.40,35.42),(-82.60,35.30),
 (-82.85,35.15),(-83.10,35.05),(-83.40,34.92),(-83.65,34.75),(-83.95,34.62),(-84.20,34.50),(-84.55,34.30)]   # Blue Ridge escarpment
AGG_WEST=[(-84.95,34.45),(-85.05,34.62),(-85.15,34.80),(-85.12,35.00),(-84.98,35.15),(-84.85,35.28),(-84.70,35.42),(-84.55,35.58),
 (-84.40,35.72),(-84.20,35.80),(-84.00,35.86),(-83.80,35.93),(-83.62,36.00),(-83.40,36.08),(-83.10,36.20),(-82.85,36.30),(-82.55,36.42),
 (-82.30,36.52),(-82.05,36.62),(-81.80,36.72),(-81.55,36.80),(-81.25,36.88),(-80.95,36.96),(-80.65,37.04),(-80.40,37.13),(-80.15,37.22),
 (-79.95,37.32)]   # Tennessee / Holston / New River valley floor (contested)
agg = Polygon(AGG_EAST+AGG_WEST).intersection(unary_union(list(C.values()))).difference(S['54'])

# --- Nueces River (Texas | U.S. Gov South Texas wedge: the old "Nueces Strip")
nu = river('ne_10m_rivers_north_america.geojson',{'Nueces'})
nu_line = list(nu.geoms) if nu.geom_type=='MultiLineString' else [nu]
coords=[]
# assemble mouth->source ordered
allc=[c for l in nu_line for c in l.coords]
mouth=min(allc,key=lambda c:c[0]+0*c[1]); src=(-100.166962,30.021962)
merged = linemerge(nu_line)
seq = list(merged.coords) if merged.geom_type=='LineString' else max(merged.geoms,key=lambda g:g.length).coords
seq=list(seq)
if seq[0][0] < seq[-1][0]: seq=seq[::-1]   # start at mouth (east)
NU = [(-96.7,27.75)] + seq + [(-100.70,29.62),(-100.80,29.25),(-100.9,28.9)]
SOUTH_NU = side(box(-100.85,25.5,-96.8,30.6), LineString(NU), (-98.5,26.8))
tx_sw = U(fac('texas','48')+[k for k in fac('usg','48') if k!='48141'])
usg_tx = S['48'].intersection(SOUTH_NU)
texas = tx_sw.difference(SOUTH_NU)

# --- Mexican Occupied Zone (designer's choice; edit MX_COUNTIES / Pecos cut)
pe = river('ne_10m_rivers_lake_centerlines.geojson',{'Pecos'})
pbox = box(-105.0,31.9,-103.6,33.2)
pp = split(pbox, unary_union([pe]).intersection(pbox.buffer(0.01)))
west_pecos = [p for p in pp.geoms if p.contains(Point(-104.8,32.5))][0]
MX_COUNTIES=['35023','35017','35029','35013','35051','35035',   # NM: Hidalgo, Grant, Luna, Dona Ana, Sierra, Otero
             '48229','48109','48243','48389']                     # TX: Hudspeth, Culberson, Jeff Davis, Reeves (NE edge = Pecos R.)
mexocc = U(MX_COUNTIES).union(C['35015'].intersection(west_pecos))  # Eddy County west of the Pecos

usg = unary_union([U(fac('usg','06')+fac('usg','04')+fac('usg','02')+fac('usg','15')), usg_tx, C['48141']])
out = {
 'gilead':U(fac('gilead')),'usg':usg,'jefferson':U(fac('jefferson')),'lincoln':lincoln,'sequoyah':U(fac('sequoyah')),
 'fema':fema,'frc':U(fac('frc')),'agg':agg,'lds':U(fac('lds')),'texas':texas,'wvbc':U(fac('wvbc')),'cascadia':cascadia,'mexocc':mexocc}
# priority to resolve overlaps (earlier wins)
order=['gilead','usg','mexocc','cascadia','lincoln','jefferson','fema','agg','wvbc','texas','sequoyah','frc','lds']
taken=None; final={}
for k in order:
    g=out[k].buffer(0)
    if taken is not None: g=g.difference(taken)
    g=g.buffer(0); final[k]=g; taken=g if taken is None else taken.union(g)
us_land = unary_union([v for k,v in C.items() if k[:2]!='72'])
silence = us_land.difference(taken.buffer(0.0005)).buffer(0)
final['silence']=silence
feats=[{'type':'Feature','id':k,'properties':{'id':k},'geometry':mapping(g)} for k,g in final.items()]
json.dump({'type':'FeatureCollection','features':feats},open(D+'work_factions.geojson','w'))
for k,g in final.items(): print(k, round(g.area,3), g.geom_type)
