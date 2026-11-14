// export nation outline + major roads into ref/factions_v2.png pixel space
import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3';
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const A=d3.geoAlbersUsa().scale(1300).translate([487.5,305]);
const t=JSON.parse(fs.readFileSync('../data/counties-albers-10m.json'));
const nat=topo.feature(t,t.objects.nation);
const T=c=>c.map(r=>r.map(([x,y])=>[ox+x*s,oy+y*s]));
const g=nat.features?nat.features[0].geometry:nat.geometry;
const polys=(g.type==='Polygon'?[g.coordinates]:g.coordinates).map(T);
fs.writeFileSync('../work/v2/nation_px.json',JSON.stringify(polys));
const roads=JSON.parse(fs.readFileSync('../data/ne/ne_10m_roads.geojson')).features.filter(f=>String(f.properties.continent).startsWith('North')&&f.properties.sov_a3==='USA'||f.properties.adm0_a3==='USA');
const out=[];
for(const f of roads){const ls=f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.coordinates;
 for(const l of ls){const px=[],ll=[];for(const q of l){const p=A(q);if(p){px.push([ox+p[0]*s,oy+p[1]*s]);ll.push(q)}} if(px.length>1)out.push({t:f.properties.type,px,ll});}}
fs.writeFileSync('../work/v2/roads_px.json',JSON.stringify(out));
console.log(polys.length,out.length);
const sm=topo.mesh(t,t.objects.states,(a,b)=>a!==b);
fs.writeFileSync('../work/v2/states_px.json',JSON.stringify(sm.coordinates.map(l=>l.map(([x,y])=>[ox+x*s,oy+y*s]))));
