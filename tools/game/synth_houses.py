import json, math, random
from shapely.geometry import LineString, Polygon, box as sbox
from shapely.strtree import STRtree
from shapely.affinity import rotate, translate
src=open('/workspace/work/fna/site/game/towns.js').read()
T=json.loads(src[len('var TOWNS='):-1])
RES={'residential','living_street','unclassified'}
tot=0
for t in T:
    rnd=random.Random(t['id'])
    blds=[Polygon(b['p']) for b in t['bld'] if len(b['p'])>=4]
    blds=[b if b.is_valid else b.buffer(0) for b in blds]
    roads=[LineString(h['p']) for h in t['hw'] if len(h['p'])>=2]
    rw={'motorway':14,'trunk':11,'primary':10,'secondary':9,'tertiary':8,'residential':6,'unclassified':6,'living_street':5,'service':4,'track':3}
    rbuf=[LineString(h['p']).buffer(rw.get(h['h'],4)) for h in t['hw'] if len(h['p'])>=2]
    nonres=[Polygon(a['p']).buffer(0) for a in t['area'] if a['v'] in ('commercial','retail','industrial','school','cemetery','park','pitch','parking','railway','farmland','meadow','golf_course','recreation_ground','wetland','water') and len(a['p'])>=4]
    tree=STRtree(blds+rbuf+nonres) if blds or rbuf else None
    btree=STRtree(blds) if blds else None
    occ=blds+rbuf+nonres; new=[]
    for h in t['hw']:
        if h['h'] not in RES or len(h['p'])<2: continue
        ln=LineString(h['p']); L=ln.length
        for side in (-1,1):
            d=rnd.uniform(4,12)
            while d<L-6:
                p=ln.interpolate(d); q=ln.interpolate(min(L,d+1)); ang=math.atan2(q.y-p.y,q.x-p.x)
                w=rnd.uniform(11,17); dep=rnd.uniform(8,13); setb=rnd.uniform(7,11)+dep/2
                nx,ny=-math.sin(ang)*side,math.cos(ang)*side
                cx,cy=p.x+nx*setb,p.y+ny*setb
                poly=rotate(sbox(-w/2,-dep/2,w/2,dep/2),ang,use_radians=True,origin=(0,0))
                poly=translate(poly,cx,cy)
                hit=False
                if btree is not None and len(btree.query(p.buffer(40)))>0: hit=True
                for i in tree.query(poly.buffer(2.5)):
                    if occ[i].intersects(poly.buffer(2.5)): hit=True;break
                if not hit:
                    for g in new[-60:]:
                        if g.intersects(poly.buffer(3)): hit=True;break
                if not hit and rnd.random()<0.86:
                    new.append(poly)
                d+=w+rnd.uniform(6,14)
    for g in new:
        c=[[round(x,1),round(y,1)] for x,y in g.exterior.coords]
        t['bld'].append({'p':c,'b':'house','s':1})
    tot+=len(new); print(t['id'],'synth',len(new),'osm',len(blds))
s='var TOWNS='+json.dumps(T,separators=(',',':'),ensure_ascii=False)+';'
open('/workspace/work/fna/site/game/towns.js','w').write(s); print(len(s),tot)
