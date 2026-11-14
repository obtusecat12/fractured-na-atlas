import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3'; import sharp from 'sharp';
const t=JSON.parse(fs.readFileSync('../build/map.topo.json')); const m=JSON.parse(fs.readFileSync('../build/factions_meta.json'));
const pj=JSON.parse(fs.readFileSync('../build/projection.json')); const col=Object.fromEntries(m.factions.map(f=>[f.id,f.color]));
const p=d3.geoPath(null); let s=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pj.W}" height="${pj.H}"><rect width="100%" height="100%" fill="#02060a"/>`;
s+=`<image href="data:image/jpeg;base64,${fs.readFileSync('../build/relief.jpg').toString('base64')}" width="${pj.W}" height="${pj.H}" opacity="0.5"/>`;
for(const f of topo.feature(t,t.objects.countries).features)s+=`<path d="${p(f)}" fill="${f.id==='MEX'?'#1E4A33':f.id==='CAN'?'#3A2426':'#1D2730'}" fill-opacity="0.6" stroke="#7a9" stroke-width="1"/>`;
s+=`<path d="${p(topo.feature(t,t.objects.nation))}" fill="#050707" fill-opacity="0.85"/>`;
for(const f of topo.feature(t,t.objects.factions).features)s+=`<path d="${p(f)}" fill="${col[f.id]}" fill-opacity="0.75" stroke="#fff" stroke-width="1.5"/>`;
s+=`<path d="${p(topo.mesh(t,t.objects.states,(a,b)=>a!==b))}" fill="none" stroke="#fff" stroke-opacity="0.2" stroke-width="1"/>`;
const L=JSON.parse(fs.readFileSync('../build/lights.json')).points;
for(let i=0;i<L.length;i+=5){if(L[i+3]===0)continue;s+=`<circle cx="${L[i]}" cy="${L[i+1]}" r="1.6" fill="#ffd27a" fill-opacity="${(L[i+2]/255).toFixed(2)}"/>`}
s+='</svg>'; await sharp(Buffer.from(s),{limitInputPixels:false}).resize(1600).png().toFile('../ref/preview.png');
