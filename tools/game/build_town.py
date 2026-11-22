import xml.etree.ElementTree as ET, json, math, collections
t=ET.parse('hb.osm').getroot()
N={n.get('id'):(float(n.get('lon')),float(n.get('lat'))) for n in t.iter('node')}
LON0,LAT0=-110.1575,34.905
kx=111320*math.cos(math.radians(LAT0)); ky=110540
P=lambda id:[round((N[id][0]-LON0)*kx,1),round((LAT0-N[id][1])*ky,1)]  # x east, y south (meters)
out=collections.defaultdict(list); cnt=collections.Counter()
for w in t.iter('way'):
    tg={x.get('k'):x.get('v') for x in w.iter('tag')}
    nd=[x.get('ref') for x in w.iter('nd') if x.get('ref') in N]
    if len(nd)<2: continue
    pts=[P(i) for i in nd]
    if 'building' in tg:
        o={'p':pts,'b':tg['building']}
        for k in ('name','amenity','shop','tourism','building:levels','roof:shape','religion','leisure','office'):
            if k in tg: o[k.split(':')[0][:4]]=tg[k]
        out['bld'].append(o); cnt['b:'+tg['building']]+=1
    elif 'highway' in tg:
        out['hw'].append({'p':pts,'h':tg['highway'],'n':tg.get('name',''),'r':tg.get('ref',''),'s':tg.get('surface','')}); cnt['h:'+tg['highway']]+=1
    elif tg.get('railway') in ('rail','siding','spur','yard'):
        out['rail'].append({'p':pts,'r':tg['railway']})
    elif 'waterway' in tg or tg.get('natural')=='water':
        out['water'].append({'p':pts,'w':tg.get('waterway',tg.get('natural')),'n':tg.get('name','')}); cnt['w:'+tg.get('waterway',tg.get('natural',''))]+=1
    elif any(k in tg for k in ('landuse','leisure','amenity','natural')):
        k=[k for k in ('landuse','leisure','amenity','natural') if k in tg][0]
        if nd[0]==nd[-1]:
            out['area'].append({'p':pts,'k':k,'v':tg[k],'n':tg.get('name','')}); cnt[k+':'+tg[k]]+=1
# POI nodes
for n in t.iter('node'):
    tg={x.get('k'):x.get('v') for x in n.iter('tag')}
    if 'name' in tg and any(k in tg for k in ('amenity','shop','tourism','office','leisure','historic')):
        out['poi'].append({'p':P(n.get('id')),'n':tg['name'],'t':tg.get('amenity') or tg.get('shop') or tg.get('tourism') or tg.get('office') or tg.get('leisure') or tg.get('historic')})
s=json.dumps(out,separators=(',',':'))
open('town_holbrook.json','w').write(s)
print(len(s),{k:len(v) for k,v in out.items()})
print(cnt.most_common(60))
print([b.get('name') for b in out['bld'] if b.get('name')][:80])
print([p['n']+'/'+p['t'] for p in out['poi']][:80])
