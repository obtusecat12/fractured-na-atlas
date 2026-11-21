import xml.etree.ElementTree as ET, json, math, collections, re
LON0,LAT0=-110.1575,34.905
kx=111320*math.cos(math.radians(LAT0)); ky=110540
TOWNS=[('holbrook',['hb.osm'],(-110.185,34.885,-110.13,34.925)),
 ('winslow',['osm/winslow.osm'],(-110.735,35.005,-110.66,35.045)),
 ('snowflake',['osm/snowflake.osm'],(-110.105,34.45,-110.06,34.53)),
 ('showlow',['osm/showlow_w.osm','osm/showlow_e.osm'],(-110.07,34.225,-109.97,34.28)),
 ('pinetop',['osm/pinetop.osm'],(-109.985,34.115,-109.905,34.17))]
BAN=re.compile(r'Tesla|Supercharger|Starbucks Reserve|Dutch Bros|Verizon 5G|Amazon (Locker|Hub)|Electrify|ChargePoint|Harbor Freight|Planet Fitness|Five Below|Ulta',re.I)
P=lambda ll:[round((ll[0]-LON0)*kx,1),round((LAT0-ll[1])*ky,1)]
res=[]; allc=collections.Counter()
for tid,files,box in TOWNS:
    N={}; W={}
    for f in files:
        t=ET.parse(f).getroot()
        for n in t.iter('node'): N[n.get('id')]=(float(n.get('lon')),float(n.get('lat')),{x.get('k'):x.get('v') for x in n.iter('tag')})
        for w in t.iter('way'): W[w.get('id')]=w
    out=collections.defaultdict(list)
    for wid,w in W.items():
        tg={x.get('k'):x.get('v') for x in w.iter('tag')}
        nd=[x.get('ref') for x in w.iter('nd') if x.get('ref') in N]
        if len(nd)<2: continue
        pts=[P(N[i]) for i in nd]
        if 'building' in tg:
            if BAN.search(tg.get('name','')): continue
            o={'p':pts,'b':tg['building']}
            for k in ('name','amenity','shop','tourism','building:levels'):
                if k in tg: o[k.split(':')[0][:4]]=tg[k]
            out['bld'].append(o); allc['bld']+=1
        elif 'highway' in tg:
            if tg['highway'] in ('footway','path','steps','cycleway','pedestrian','bridleway','corridor','proposed','construction'): continue
            out['hw'].append({'p':pts,'h':tg['highway'],'n':tg.get('name','')})
        elif tg.get('railway') in ('rail','siding','spur','yard'):
            out['rail'].append({'p':pts,'r':tg['railway']})
        elif 'waterway' in tg or tg.get('natural')=='water':
            out['water'].append({'p':pts,'w':tg.get('waterway',tg.get('natural')),'n':tg.get('name','')})
        elif any(k in tg for k in ('landuse','leisure','amenity','natural')) and nd[0]==nd[-1]:
            k=[k for k in ('landuse','leisure','amenity','natural') if k in tg][0]
            out['area'].append({'p':pts,'k':k,'v':tg[k],'n':tg.get('name','')})
    for nid,(lo,la,tg) in N.items():
        if 'name' in tg and any(k in tg for k in ('amenity','shop','tourism','office','leisure','historic')) and not BAN.search(tg['name']):
            out['poi'].append({'p':P((lo,la)),'n':tg['name'],'t':tg.get('amenity') or tg.get('shop') or tg.get('tourism') or tg.get('office') or tg.get('leisure') or tg.get('historic')})
    d=dict(out); d['id']=tid; d['box']=[P((box[0],box[3])),P((box[2],box[1]))]  # [NW m, SE m]
    res.append(d); print(tid,{k:len(v) for k,v in out.items()})
s='var TOWNS='+json.dumps(res,separators=(',',':'),ensure_ascii=False)+';'
open('/workspace/work/fna/site/game/towns.js','w').write(s); print(len(s))
