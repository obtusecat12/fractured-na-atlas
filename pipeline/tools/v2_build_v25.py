# Assemble v2 faction geometry (lon/lat) from traced raster + road corridors -> build/factions.geojson, county_factions_final.json
import json
from shapely.geometry import shape, mapping, LineString, MultiLineString
from shapely.ops import unary_union
from shapely.validation import make_valid as _mv
from shapely.geometry import MultiPolygon, Polygon
def make_valid(g):
    g=_mv(g)
    if g.geom_type in ('Polygon','MultiPolygon'): return g
    ps=[]
    for x in getattr(g,'geoms',[]):
        if x.geom_type=='Polygon': ps.append(x)
        elif x.geom_type=='MultiPolygon': ps+=list(x.geoms)
    return MultiPolygon(ps) if ps else Polygon()
T=json.load(open('work/v2/trace_ll.json'))
nat0=None
nat=make_valid(unary_union([shape(f['geometry']) for f in json.load(open('build/_nation_ll.geojson'))['features']] if 'features' in json.load(open('build/_nation_ll.geojson')) else [shape(json.load(open('build/_nation_ll.geojson'))['geometry'])]))
CW=0.028  # corridor half-width in degrees (~3 km)
G={}
for n in set(T['polys'])|set(T['ribbons'])|set(T['lines']):
    parts=[]
    if n in T['polys']: parts.append(make_valid(shape(T['polys'][n])))
    if n in T['ribbons']:
        R=shape(T['ribbons'][n])
        for ln in getattr(R,'geoms',[R]):
            b=ln.buffer(CW,cap_style=1,join_style=1)
            if b.intersection(nat).area < 0.45*b.area:   # traced line hugs a shoreline offset from our coastline
                b=ln.buffer(CW*2.6,cap_style=1,join_style=1)
            parts.append(b)
    ls=[LineString(l) for l in T['lines'].get(n,[]) if len(l)>1]
    if ls: parts.append(MultiLineString(ls).buffer(CW,cap_style=1,join_style=1))
    g=unary_union(parts).buffer(0)
    G[n]=g
# Alaska & Hawaii: wholly U.S. Government (as on the reference map)
C0=json.load(open('work/work_counties.geojson'))['features']
akhi=unary_union([make_valid(shape(c['geometry']).buffer(0)) for c in C0 if c.get('geometry') and c['id'][:2] in ('02','15')])
for k in list(G): G[k]=G[k].difference(akhi) if k!='usg' else G[k]
G['usg']=G['usg']|akhi
# Mexican occupation zone from v1 (user requirement), laid on top
v1={f['id']:shape(f['geometry']) for f in json.load(open('build/factions_v1.geojson'))['features']}
G['mxo']=v1['mxo']
# smaller features override larger ones; mxo on top
order=sorted([k for k in G if k!='mxo'],key=lambda k:-G[k].area)+['mxo']
F={}
for i,k in enumerate(order):
    above=unary_union([G[j] for j in order[i+1:]]) if i+1<len(order) else None
    g=G[k]&nat
    if above is not None: g=g.difference(above)
    F[k]=make_valid(make_valid(g).buffer(0))
from shapely.geometry import box as _box, Point
# ---- home boxes: stray specks (anti-aliasing / river-line misreads) go to the faction they touch, else to radio silence
HOME={'usg':[(-125,31.2,-109.5,42.6),(-101.5,25.5,-96.5,30.2),(-107,31,-105.3,32.3),(-180,50,-129,72),(170,50,180,56),(-161,18,-154,23)],'fema':(-125,42.3,-82,49.6),'agg':(-86.5,33.4,-79,38.2),'lds':(-116.2,35.5,-110,42.6),'sequoyah':(-98.2,33.9,-93.4,37.5),'texas':(-106.8,25.7,-93.4,34.2),
      'wvbc':(-83,37,-77.4,40.8),'utdr':(-112.5,40.3,-110.8,41.5),'srl':(-85.2,32.4,-83,34.3),'nafr':(-82.6,33,-81,34),
      'dwg':(-90.5,40,-86.9,44.9),'frc':(-98,24,-79,34),'cascadia':(-125,41.5,-120.5,49.1),'lincoln':(-121.5,45.5,-116.9,49.1),
      'jefferson':(-125,38.5,-119.5,46.5)}
for k,bb in HOME.items():
    if k not in F: continue
    keep=[]; 
    for p in getattr(F[k],'geoms',[F[k]]):
        c=p.representative_point()
        if any(_box(*b).contains(c) for b in (bb if isinstance(bb,list) else [bb])): keep.append(p); continue
        nb=p.buffer(0.06); best,bv=None,0
        for j,g in F.items():
            if j in (k,'mxo'): continue
            if j in HOME and not any(_box(*b).buffer(0.3).contains(c) for b in (HOME[j] if isinstance(HOME[j],list) else [HOME[j]])): continue
            v=nb.intersection(g).area if nb.intersects(g) else 0
            if v>bv: best,bv=j,v
        if best: F[best]=make_valid(F[best].union(p).buffer(0))
    F[k]=make_valid(MultiPolygon(keep)) if keep else Polygon()
# ---- Chicago -> Milwaukee lakeshore strip (thin red band hugging Lake Michigan on the reference map)
shore=nat.boundary.intersection(_box(-88.05,41.62,-87.55,43.25))
strip=shore.buffer(0.045).intersection(nat)
for j in list(F):
    if j!='dwg': F[j]=make_valid(F[j].difference(strip))
F['dwg']=make_valid(F['dwg'].union(strip).buffer(0))
# ---- Gilead: the D.C. capital region (v1) + districts in evangelical northern New England
C0d={c['id']:make_valid(shape(c['geometry']).buffer(0)) for c in C0 if c.get('geometry')}
DIST={'gilead':v1['gilead'],
      'gilead_aroostook':unary_union([C0d['23003']]),
      'gilead_penobscot':unary_union([C0d['23019'],C0d['23021']]),
      'gilead_nek':unary_union([C0d[i] for i in ('50019','50009','50005','33007')])}
taken=unary_union([g for j,g in F.items() if j!='gilead'])
for j,g in DIST.items(): F[j]=make_valid(make_valid(g.intersection(nat)).difference(taken).buffer(0))

# ---- v2.2 (user 2026-11-01): Gilead's capital joined to Boston (I-95 corridor + Boston metro); Blackwater in SE Massachusetts;
#      Vermont split into the Republic of Vermont (north-west) and the Green Mountain Republic (south)
I95=[(-76.85,39.2),(-76.61,39.29),(-76.16,39.51),(-75.83,39.61),(-75.55,39.74),(-75.36,39.85),(-75.16,39.95),(-74.76,40.22),(-74.45,40.49),
     (-74.17,40.73),(-73.95,40.85),(-73.78,40.91),(-73.54,41.05),(-73.19,41.18),(-72.93,41.31),(-72.38,41.29),(-72.10,41.36),(-71.90,41.37),
     (-71.83,41.38),(-71.47,41.70),(-71.41,41.82),(-71.38,41.88),(-71.29,41.94),(-71.22,42.02),(-71.25,42.07),(-71.14,42.16),(-71.17,42.24),(-71.06,42.36)]
NEW={'vtr':unary_union([C0d[i] for i in ('50007','50011','50013','50015','50023','50017')]),
     'gmr':unary_union([C0d[i] for i in ('50001','50021','50003','50025','50027')]),
     'bw':unary_union([C0d[i] for i in ('25023','25005','25001','25007','25019')]),
     'csa':unary_union([C0d[i] for i in ('01101','01001')])}
for j,g in NEW.items():
    g=make_valid(g.intersection(nat))
    for o in list(F): F[o]=make_valid(F[o].difference(g))
    F[j]=g

# v2.3: Green Mountain Republic pushes into the Berkshires down to the Deerfield River / Mohawk Trail (irregular south edge)
MT=[(-73.27,42.80),(-73.27,42.745),(-73.25,42.70),(-73.20,42.685),(-73.11,42.70),(-73.05,42.655),(-72.98,42.665),(-72.92,42.635),(-72.87,42.622),
    (-72.80,42.640),(-72.74,42.598),(-72.67,42.595),(-72.60,42.585),(-72.55,42.63),(-72.50,42.69),(-72.46,42.727),(-72.45,42.80)]
gx=make_valid(Polygon(MT).intersection(unary_union([C0d['25003'],C0d['25011']])).intersection(nat))
for o in list(F):
    if o!='gmr': F[o]=make_valid(F[o].difference(gx))
F['gmr']=make_valid(F['gmr'].union(gx).buffer(0))
gb=make_valid(unary_union([C0d[i] for i in ('25025','25017','25021','36103','36059','36047','36081','36061','36005','36085','36119','36087','10001','10003','10005','24011','24015','24019','24029','24035','24039','24041','24045','24047','24025','51001','51131','42017','42091','42045','42029','09001','09009','09007','09011','44007','44003')]+[g for k,g in C0d.items() if k[:2]=='34']).union(LineString(I95).buffer(0.035,cap_style=1,join_style=1)).intersection(nat))
for o in list(F):
    if o!='gilead': F[o]=make_valid(F[o].difference(gb))
F['gilead']=make_valid(F['gilead'].union(gb).buffer(0))


# ---- v2.4 (user 2026-11-01): western borders follow the mountains; four small historical-proposal states
import shapefile as _shp, math as _m
_R=_shp.Reader('data/physio/physio.shp'); PH={}
for _sr in _R.iterShapeRecords():
    _c=_sr.record['FENCODE']
    try: PH.setdefault(_c,[]).append(make_valid(shape(_sr.shape.__geo_interface__).buffer(0)))
    except Exception: pass
PH={k:make_valid(unary_union(v)) for k,v in PH.items()}
def st(*fips): return make_valid(unary_union([g for k,g in C0d.items() if k[:2] in fips]))
def wob(pts,amp=0.035,seed=1):   # hand-drawn irregular edge: densify + deterministic wobble
    out=[]
    for i in range(len(pts)):
        (x0,y0),(x1,y1)=pts[i],pts[(i+1)%len(pts)]
        n=max(2,int(_m.hypot(x1-x0,y1-y0)/0.03))
        for j in range(n):
            t=j/n; x=x0+(x1-x0)*t; y=y0+(y1-y0)*t
            w=amp*(_m.sin(x*37+y*23+seed)*0.6+_m.sin(x*91-y*57+seed*3)*0.4)
            out.append((x+w,y-w*0.8))
    return make_valid(Polygon(out).buffer(0))
def assign(k,g,protect=()):
    g=make_valid(g.intersection(nat))
    for o in list(F):
        if o!=k and o not in protect: F[o]=make_valid(F[o].difference(g))
    for o in protect:
        if o in F: g=make_valid(g.difference(F[o]))
    F[k]=make_valid(F.get(k,Polygon()).union(g).buffer(0)); return F[k]
WA,OR_,ID,CA,MT,WY,TN,MI,UT=st('53'),st('41'),st('16'),st('06'),st('30'),st('56'),st('47'),st('26'),st('49')
casc=make_valid(unary_union([PH[c] for c in ('23a','23b','23c') if c in PH]))
# Lincoln: the dry side of the Cascades (Walla Walla plateau, Okanogan + Blue Mountains) out to the Bitterroot crest (Idaho/Montana line)
lin=make_valid(unary_union([PH['20a'],PH['20b'],PH['19']]).intersection(unary_union([WA,OR_,ID])).intersection(_box(-121.9,44.2,-114.0,49.01)))
lin=make_valid(lin.difference(casc))
lin=make_valid(lin.difference(_box(-117.3,0,0,45.9)))   # Salmon/Clearwater wilderness south of the Clearwater stays outside
assign('cascadia',PH['23b'].intersection(OR_).intersection(_box(-123.5,43.6,-120.9,45.8)))
assign('lincoln',lin,protect=('cascadia',))
# Jefferson: Klamath + southern Cascades + the Harney high desert; meets Lincoln on the southern foot of the Blue Mountains
jef=make_valid(unary_union([PH['24d'],PH['23c'],PH['20e']]).intersection(unary_union([OR_,CA])).intersection(_box(-124.6,40.0,-117.6,44.6)))
jef=make_valid(jef.difference(F['lincoln']))
assign('jefferson',jef,protect=('cascadia','lincoln'))
# State of Franklin (1784): the upper Tennessee valley under the Unaka/Blue Ridge wall, around Jonesborough
# v2.5: bigger, touching historical-proposal states
FRK=[(-84.45,35.30),(-84.05,35.95),(-84.30,36.45),(-83.90,36.62),(-82.60,36.62),(-81.68,36.59),(-81.75,36.30),(-82.20,35.95),(-82.95,35.75),(-83.60,35.50),(-84.10,35.20)]
assign('frk',wob(FRK,0.04,2).intersection(TN),protect=('wvbc','sequoyah'))
UPg=MI.intersection(_box(-90.6,45.0,-83.2,47.6)).difference(_box(-86.65,41.5,-82.0,45.83))
assign('sup',UPg)
DST=[(-113.95,39.85),(-111.85,39.95),(-111.05,39.80),(-110.10,39.55),(-109.60,39.00),(-109.95,38.20),(-110.60,37.55),(-111.40,37.20),(-112.60,37.25),(-113.50,37.55),(-114.02,38.30)]
assign('dst',wob(DST,0.05,7).intersection(UT),protect=('lds','utdr','usg'))
SD_=st('46')
ABS=[(-110.40,45.10),(-109.10,47.75),(-107.30,47.80),(-105.20,47.65),(-103.40,46.05),(-101.60,45.70),(-101.45,44.30),(-102.20,43.30),(-104.10,43.05),(-105.80,43.30),(-107.60,43.55),(-109.20,44.10)]
absr=wob(ABS,0.06,9)
absg=absr.intersection(unary_union([g for g in (WY,MT,SD_) if g is not None]))
assign('abs',absg,protect=('fema',))

# ---- manual corridor fixes (ref shows these continuous; trace broke them)
MANUAL={'usg':[[(-115.05,36.25),(-114.92,36.33),(-114.65,36.56),(-114.40,36.70),(-114.07,36.80),(-113.80,36.97),(-113.58,37.10),(-113.45,37.16)]]}
for k,ls in MANUAL.items():
    add_=unary_union([LineString(l).buffer(CW,cap_style=1,join_style=1) for l in ls]).intersection(nat)
    for j in list(F):
        if j!=k and j!='mxo': F[j]=make_valid(F[j].difference(add_))
    F[k]=make_valid(F[k].union(add_).buffer(0))

# ---- U.S. Government exclaves get their own polities
U=list(getattr(F['usg'],'geoms',[F['usg']])); parts={'usg':[],'usg_ak':[],'usg_hi':[],'usg_stx':[],'usg_elp':[]}
for p in U:
    c=p.representative_point()
    if (c.x<-129 or c.x>170) and c.y>50: parts['usg_ak'].append(p)
    elif _box(-107,31,-105.3,32.3).contains(c): parts['usg_elp'].append(p)
    elif c.x<-150 and c.y<30: parts['usg_hi'].append(p)
    elif _box(-101.5,25.5,-96.5,30.2).contains(c): parts['usg_stx'].append(p)
    else: parts['usg'].append(p)
for j,ps in parts.items(): F[j]=make_valid(MultiPolygon(ps)) if ps else Polygon()

# ---- v2.1 HEALING: (a) reconnect corridor pieces cut by state lines; (b) absorb thin "radio silence" slivers/holes
from shapely.ops import nearest_points
import numpy as np, rasterio.features as rf
from rasterio.transform import from_origin
from scipy import ndimage as ndi
SKIPH={'csa','bw','vtr','gmr','gilead','gilead_aroostook','gilead_penobscot','gilead_nek','usg_ak','usg_hi','usg_elp','mxo'}
def others_union(k): return unary_union([g for j,g in F.items() if j!=k and not g.is_empty])
for k in list(F):
    if k in SKIPH or F[k].is_empty: continue
    P=[p for p in getattr(F[k],'geoms',[F[k]]) if p.area>2e-5]
    if len(P)<2: continue
    O=others_union(k); links=[]
    for a in range(len(P)):
        for b in range(a+1,len(P)):
            if min(P[a].area,P[b].area)>0.6: continue
            d=P[a].distance(P[b])
            if d<1e-9 or d>(0.7 if k=='lds' else 0.32): continue
            pa,pb=nearest_points(P[a],P[b]); ln=LineString([pa,pb])
            if ln.intersection(O).length>0.35*ln.length: continue
            links.append(ln.buffer(0.03,cap_style=1))
    if links:
        F[k]=make_valid(F[k].union(unary_union(links)).difference(O).buffer(0)); print('heal',k,len(links))
RES=0.01; X0,Y1=-125.5,50.2; WD=int(59.0/RES); HD=int(26.0/RES); TR=from_origin(X0,Y1,RES,RES)
KEYS=[k for k in F if not F[k].is_empty]
lab=np.zeros((HD,WD),np.int16)
for i,k in enumerate(KEYS):
    m=rf.rasterize([(F[k],1)],out_shape=(HD,WD),transform=TR,all_touched=False).astype(bool); lab[m&(lab==0)]=i+1
natm=rf.rasterize([(nat,1)],out_shape=(HD,WD),transform=TR).astype(bool)
sil=(lab==0)&natm
R=11
core=ndi.distance_transform_edt(sil)>R
opened=ndi.distance_transform_edt(~core)<=R
thin=sil&~opened
cl,nc=ndi.label(sil); szs=ndi.sum(sil,cl,range(1,nc+1))
thin|=np.isin(cl,[j+1 for j,s in enumerate(szs) if s<900])   # small enclosed silence holes
dfac,idx=ndi.distance_transform_edt(lab==0,return_distances=True,return_indices=True)
thin&=dfac<=R+3
near=lab[idx[0],idx[1]]
for i,k in enumerate(KEYS):
    m=thin&(near==i+1)
    if not m.any(): continue
    gs=[shape(g) for g,v in rf.shapes(m.astype(np.uint8),mask=m,transform=TR,connectivity=8)]
    add=unary_union(gs).buffer(0.004).buffer(-0.002)
    F[k]=make_valid(F[k].union(add.intersection(nat)).buffer(0)); print('fill',k,int(m.sum()))
# resolve overlaps from buffers: smaller features win
ordr=sorted(KEYS,key=lambda k:F[k].area)
for a,k in enumerate(ordr):
    for j in ordr[a+1:]:
        if F[j].intersects(F[k]): F[j]=make_valid(F[j].difference(F[k]).buffer(0))


# ---- drop inland specks: merge into surrounding faction, else into silence
coast=nat.boundary.buffer(0.03)
for k in list(F):
    if k in ('usg_ak','usg_hi'): continue
    ps=list(getattr(F[k],'geoms',[F[k]])); keep=[]
    for p in ps:
        if p.area>=0.004 or p.intersects(coast): keep.append(p); continue
        ring=p.buffer(0.03).difference(p); best,bv=None,0
        for j,g in F.items():
            if j==k: continue
            v=ring.intersection(g).area if ring.intersects(g) else 0
            if v>bv: best,bv=j,v
        if best and bv>0.4*ring.area: F[best]=make_valid(F[best].union(p.buffer(0.002)).buffer(0))
    F[k]=make_valid(MultiPolygon(keep)) if keep else Polygon()

# ---- v2.2 cleanup: close hairline notches and fill pin-holes left by healing (they rendered as dotted borders)
for k in list(F):
    if F[k].is_empty or k in ('usg_ak','usg_hi'): continue
    g=F[k].buffer(0.008,join_style=1).buffer(-0.008,join_style=1)
    ps=[]
    for p in getattr(g,'geoms',[g]):
        if p.geom_type!='Polygon': continue
        ps.append(Polygon(p.exterior,[r for r in p.interiors if Polygon(r).area>0.02 and k not in ('cascadia','lincoln','jefferson')]))
    F[k]=make_valid(make_valid(MultiPolygon(ps)).intersection(nat).buffer(0))
ordr=sorted([k for k in F if not F[k].is_empty],key=lambda k:F[k].area)
for a,k in enumerate(ordr):
    for j in ordr[a+1:]:
        if F[j].intersects(F[k]): F[j]=make_valid(F[j].difference(F[k]).buffer(0))
for k in list(F):
    F[k]=make_valid(MultiPolygon([p for p in getattr(F[k],'geoms',[F[k]]) if p.geom_type=='Polygon' and (p.area>3e-4 or k in ('usg_ak','usg_hi','usg_stx'))]))

# ---- corridor centre-lines (for town dots + styling)
cor=[]
for n in T['ribbons']:
    R=shape(T['ribbons'][n])
    for ln in getattr(R,'geoms',[R]):
        if ln.length>0.15: cor.append({'type':'Feature','properties':{'f':n},'geometry':mapping(ln)})
for n,ls in T['lines'].items():
    for l in ls:
        if len(l)>1 and LineString(l).length>0.15: cor.append({'type':'Feature','properties':{'f':n},'geometry':mapping(LineString(l))})
for k,ls in MANUAL.items():
    for l in ls: cor.append({'type':'Feature','properties':{'f':k},'geometry':mapping(LineString(l))})
json.dump({'type':'FeatureCollection','features':cor},open('build/corridors.geojson','w'))
OUT=['gilead','gilead_aroostook','gilead_penobscot','gilead_nek','usg','usg_ak','usg_hi','usg_stx','usg_elp']+[k for k in order if k not in ('gilead','usg')]+['bw','vtr','gmr','csa','frk','sup','dst','abs']
from shapely.geometry.polygon import orient
def d3o(g):  # d3 (spherical) wants clockwise exterior rings
    ps=[orient(p,-1.0) for p in getattr(g,'geoms',[g]) if p.area>1e-7]
    return MultiPolygon(ps)
feats=[{'type':'Feature','id':k,'properties':{'id':k},'geometry':mapping(d3o(F[k]))} for k in OUT if not F[k].is_empty]
json.dump({'type':'FeatureCollection','features':feats},open('build/factions.geojson','w'))
# per county dominant faction
C=json.load(open('work/work_counties.geojson'))['features']
cf={}
for c in C:
    if not c.get('geometry'): continue
    g=make_valid(shape(c['geometry']).buffer(0)); a=g.area or 1e-12; best,ba='none',0
    for k in OUT:
        if g.intersects(F[k]):
            ia=g.intersection(F[k]).area
            if ia>ba: best,ba=k,ia
    cf[c['id']]=best if ba/a>0.5 else 'none'
json.dump(cf,open('build/county_factions_final.json','w'))
for k in OUT: print(k,round(F[k].area,3),F[k].geom_type,len(getattr(F[k],'geoms',[F[k]])))
