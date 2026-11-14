import fs from 'fs'; import * as d3 from 'd3';
const R=p=>JSON.parse(fs.readFileSync(p)); const pj=R('../build/projection.json');
const proj=d3.geoConicEqualArea().parallels(pj.parallels).rotate(pj.rotate).scale(pj.scale).translate(pj.translate);
const {W,H}=pj; const pf=R('../build/_pf.json'); const pn=R('../build/_pn.json'); const pc={features:[...pf.features.map(f=>({...f,properties:{f:f.id}})),...pn.features.map(f=>({...f,properties:{f:'none'}}))]};
// grid index of projected counties
const G=40, grid=new Map(); const path=d3.geoPath(null);
const polysOf=g=>g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
pc.features.forEach((f,i)=>{if(!f.geometry)return;const[[x0,y0],[x1,y1]]=path.bounds(f);for(let gx=Math.floor(x0/G);gx<=Math.floor(x1/G);gx++)for(let gy=Math.floor(y0/G);gy<=Math.floor(y1/G);gy++){const k=gx+','+gy;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i)}});
function pip(pt,poly){let ins=false;for(const ring of poly){for(let i=0,j=ring.length-1;i<ring.length;j=i++){const[xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>pt[1])!=(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins}}return ins}
const FAC=['none','gilead','usg','jefferson','lincoln','sequoyah','fema','frc','agg','lds','texas','wvbc','cascadia','mxo','foreign'];
const facAt=(x,y)=>{const c=grid.get(Math.floor(x/G)+','+Math.floor(y/G));if(c)for(const i of c){const f=pc.features[i];if(polysOf(f.geometry).some(p=>pip([x,y],p)))return FAC.indexOf(f.properties.f)}return 14};
const pts=[]; // x,y,brightness(0-255),faction,kind
const add=(lon,lat,b,kind)=>{const p=proj([lon,lat]);if(!p)return;const[x,y]=p;if(x<0||y<0||x>W||y>H)return;pts.push([Math.round(x),Math.round(y),Math.max(1,Math.min(255,Math.round(b))),facAt(x,y),kind])};
const inNA=(lon,lat)=>lon>-180&&lon<-50&&lat>5&&lat<84;
// 1 populated places
for(const f of R('../data/ne/ne_10m_populated_places_simple.geojson').features){const p=f.properties;if(!inNA(p.longitude,p.latitude))continue;add(p.longitude,p.latitude,40+Math.sqrt(p.pop_max)/14,0)}
// 2 urban areas: sample points inside polygon (lon/lat) by area
let rng=1234567;const rnd=()=>(rng=(rng*16807)%2147483647)/2147483647;
for(const f of R('../data/ne/ne_10m_urban_areas.geojson').features){const[[x0,y0],[x1,y1]]=d3.geoBounds(f);if(!inNA(x0,y0))continue;const n=Math.min(2500,Math.max(1,Math.round(f.properties.area_sqkm/6)));let got=0,tries=0;while(got<n&&tries<n*20){tries++;const lon=x0+(x1-x0)*rnd(),lat=y0+(y1-y0)*rnd();if(d3.geoContains(f,[lon,lat])){add(lon,lat,60+rnd()*90,1);got++}}}
// 2b rural scatter from county population (US) — towns/farms between urban polygons
{const pop={};for(const line of fs.readFileSync('../data/co-est.csv','latin1').split('\n').slice(1)){const c=line.split(',');if(c[0]==='050')pop[c[3]+c[4]]=+c[11]}
 for(const f of R('../work/work_counties.geojson').features){if(!f.geometry)continue;const p=pop[f.id]||3000;const n=Math.min(60,Math.max(1,Math.round(p/15000)));const[[x0,y0],[x1,y1]]=d3.geoBounds(f);let got=0,tries=0;while(got<n&&tries<n*30){tries++;const lon=x0+(x1-x0)*rnd(),lat=y0+(y1-y0)*rnd();if(d3.geoContains(f,[lon,lat])){add(lon,lat,18+rnd()*30,3);got++}}}}
// 3 roads
for(const f of R('../data/ne/ne_10m_roads.geojson').features){const pr=f.properties;if(!String(pr.continent).startsWith('North America')||/Ferry/.test(pr.type))continue;
 const lines=f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.coordinates; const major=/Major/.test(pr.type);
 if(!major && pr.scalerank>7) continue;
 for(const l of lines){let acc=0;for(let i=1;i<l.length;i++){const a=proj(l[i-1]),b=proj(l[i]);if(!a||!b)continue;const d=Math.hypot(b[0]-a[0],b[1]-a[1]);acc+=d;const step=major?5:9;while(acc>step){acc-=step;const t=1-acc/d;const ll=[l[i-1][0]+(l[i][0]-l[i-1][0])*t,l[i-1][1]+(l[i][1]-l[i-1][1])*t];add(ll[0],ll[1],(major?28:16)+rnd()*14,2)}}}}
const cnt={};pts.forEach(p=>{const k=FAC[p[3]]+'/'+p[4];cnt[k]=(cnt[k]||0)+1});
console.log(pts.length,cnt);
fs.writeFileSync('../build/lights.json',JSON.stringify({fields:['x','y','brightness','factionIndex','kind(0=city/town point,1=urban-area fill,2=highway,3=rural scatter)'],factions:FAC,points:pts.flat()}));
console.log('bytes',fs.statSync('../build/lights.json').size);
