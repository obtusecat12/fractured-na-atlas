import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3'; import sharp from 'sharp';
const t=JSON.parse(fs.readFileSync('../data/counties-albers-10m.json'));
const {data,info}=await sharp('../ref/factions.png').raw().toBuffer({resolveWithObject:true});
const W=info.width, C=info.channels;
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const pal={gilead:[219,182,1],usg:[1,41,103],jefferson:[8,64,129],lincoln:[32,96,166],sequoyah:[7,106,171],fema:[11,29,89],frc:[40,52,148],agg:[28,105,150],lds:[0,105,143],texas:[55,143,189],wvbc:[120,32,30],cascadia:[58,105,55],none:[240,240,240],ocean:[203,229,252]};
const px=(x,y)=>{const X=Math.round(ox+x*s),Y=Math.round(oy+y*s);const i=(Y*W+X)*C;return [data[i],data[i+1],data[i+2]]};
const near=c=>{let b=null,bd=1e9;for(const[k,v]of Object.entries(pal)){const d=(c[0]-v[0])**2+(c[1]-v[1])**2+(c[2]-v[2])**2;if(d<bd){bd=d;b=k}}return bd<1500?b:null};
function pip(pt,poly){let ins=false;for(const ring of poly){for(let i=0,j=ring.length-1;i<ring.length;j=i++){const[xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>pt[1])!=(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))ins=!ins}}return ins}
const feats=topo.feature(t,t.objects.counties).features;
const out={}; const path=d3.geoPath(null);
for(const f of feats){const st=f.id.slice(0,2);
 if(st==='02'||st==='15'){out[f.id]='usg';continue} if(st==='72'){continue}
 const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
 const [[x0,y0],[x1,y1]]=path.bounds(f); const votes={};
 const N=12; for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const p=[x0+(x1-x0)*(i+.5)/(N+1),y0+(y1-y0)*(j+.5)/(N+1)];
  if(!polys.some(pg=>pip(p,pg)))continue; const k=near(px(...p)); if(k&&k!=='ocean')votes[k]=(votes[k]||0)+1}
 const c=path.centroid(f); const kc=near(px(...c)); if(kc&&kc!=='ocean')votes[kc]=(votes[kc]||0)+2;
 const best=Object.entries(votes).sort((a,b)=>b[1]-a[1])[0]; out[f.id]=best?best[0]:'none';}
fs.writeFileSync('../data/county_factions_raw.json',JSON.stringify(out));
const cnt={};for(const v of Object.values(out))cnt[v]=(cnt[v]||0)+1;console.log(cnt);
