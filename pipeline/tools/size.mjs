import fs from 'fs';const t=JSON.parse(fs.readFileSync('../build/map.topo.json'));
const used={};const walk=(a,k)=>{if(typeof a==='number'){const i=a<0?~a:a;used[i]=used[i]||k}else a.forEach(x=>walk(x,k))};
for(const[k,o]of Object.entries(t.objects))for(const g of o.geometries)if(g.arcs)walk(g.arcs,k);
const s={};t.arcs.forEach((a,i)=>{const k=used[i];s[k]=(s[k]||0)+a.length});console.log(s,t.arcs.length);
