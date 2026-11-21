import shapefile, json
from shapely.geometry import shape, box, mapping
from shapely.ops import linemerge, unary_union
BB=box(-112.3,33.25,-108.4,37.1)
R=lambda g,t: g.simplify(t,preserve_topology=True)
def coords(g):
    out=[]
    gs=[g] if g.geom_type in('LineString','Polygon') else list(g.geoms)
    for x in gs:
        if x.geom_type=='LineString': out.append([[round(a,4),round(b,4)] for a,b in x.coords])
        elif x.geom_type=='Polygon': out.append([[round(a,4),round(b,4)] for a,b in x.exterior.coords])
    return out
def LM(gs):
    u=unary_union(gs)
    if u.geom_type=='LineString': return u
    try: return linemerge(u)
    except Exception: return u
G={}
# counties
src=json.load(open('/workspace/work/fna/pipeline/build/_counties_ll.geojson'))
topo=json.load(open('/workspace/work/fna/pipeline/build/map.topo.json'))
cs=[]
for f in src['features']:
    g=shape(f['geometry'])
    if not g.intersects(BB): continue
    c=g.centroid
    cs.append({'n':f['properties']['name'],'c':[round(c.x,3),round(c.y,3)],'p':coords(R(g,0.003))})
G['counties']=cs
# roads
roads=[]
for st in ['04','35']:
    r=shapefile.Reader(f'tg/tl_2023_{st}_prisecroads')
    for sr in r.iterShapeRecords():
        g=shape(sr.shape.__geo_interface__)
        if not g.intersects(BB): continue
        name,rt,mt=sr.record['FULLNAME'],sr.record['RTTYP'],sr.record['MTFCC']
        if rt not in('I','U','S'): continue
        roads.append((name,rt,mt,g.intersection(BB)))
# merge by name
by={}
for n,rt,mt,g in roads: by.setdefault((n,rt,mt),[]).append(g)
G['roads']=[]
for (n,rt,mt),gs in by.items():
    m=LM(gs)
    m=R(m,0.002)
    if m.length<0.02: continue
    G['roads'].append({'n':n,'t':rt,'p':coords(m)})
# rails
r=shapefile.Reader('tg/tl_2023_us_rails'); rl=[]
for sr in r.iterShapeRecords():
    b=sr.shape.bbox
    if b[2]<-112.3 or b[0]>-108.4 or b[3]<33.25 or b[1]>37.1: continue
    g=shape(sr.shape.__geo_interface__).intersection(BB)
    if not g.is_empty: rl.append(g)
G['rail']=coords(R(LM(rl),0.002))
# water
r=shapefile.Reader('tg/tl_2023_04017_linearwater'); wl={}
for sr in r.iterShapeRecords():
    n=sr.record['FULLNAME']
    if n in('Little Colorado Riv','Silver Crk','Puerco Riv','Show Low Crk','Cottonwood Wash','Chevelon Crk','Clear Crk','Carrizo Crk','Cibecue Crk','White Riv','Black Riv','Salt Riv'):
        wl.setdefault(n,[]).append(shape(sr.shape.__geo_interface__))
G['water']=[{'n':n,'p':coords(R(LM(v),0.0015))} for n,v in wl.items()]
r=shapefile.Reader('tg/tl_2023_04017_areawater'); la=[]
for sr in r.iterShapeRecords():
    if sr.record['AWATER']>400000: la.append({'n':sr.record['FULLNAME'],'p':coords(R(shape(sr.shape.__geo_interface__),0.0008))})
G['lakes']=la
# reservations
r=shapefile.Reader('tg/tl_2023_us_aiannh'); rs=[]
for sr in r.iterShapeRecords():
    b=sr.shape.bbox
    if b[2]<-112.3 or b[0]>-108.4 or b[3]<33.25 or b[1]>37.1: continue
    g=shape(sr.shape.__geo_interface__)
    if g.area<0.02: continue
    rs.append({'n':sr.record['NAMELSAD'],'p':coords(R(g.intersection(BB),0.004))})
G['res']=rs
# places in Navajo county
r=shapefile.Reader('tg/tl_2023_04_place'); pl=[]
for sr in r.iterShapeRecords():
    lon,lat=float(sr.record['INTPTLON']),float(sr.record['INTPTLAT'])
    if -112.3<lon<-108.4 and 33.25<lat<37.1:
        pl.append({'n':sr.record['NAME'],'t':sr.record['LSAD'],'ll':[round(lon,4),round(lat,4)],'p':coords(R(shape(sr.shape.__geo_interface__),0.0008))})
G['places']=pl
s=json.dumps(G,separators=(',',':'))
open('region.json','w').write(s); print(len(s), {k:len(v) for k,v in G.items()})
print(sorted(set(c['n'] for c in cs)))
print([x['n'] for x in rs]); print(sorted(set(x['n'] for x in G['roads'])))
