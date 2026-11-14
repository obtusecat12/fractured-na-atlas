import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3'; import sharp from 'sharp';
const t=JSON.parse(fs.readFileSync('../data/counties-albers-10m.json'));
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const mesh=topo.mesh(t,t.objects.states,(a,b)=>a!==b);
const p=d3.geoPath(d3.geoTransform({point(x,y){this.stream.point(ox+x*s,oy+y*s)}}));
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1388"><path d="${p(mesh)}" fill="none" stroke="#f0f" stroke-width="1"/><path d="${p(topo.mesh(t,t.objects.nation))}" fill="none" stroke="#f00" stroke-width="1"/></svg>`;
await sharp('../ref/factions_v2.png').composite([{input:Buffer.from(svg)}]).png().toFile('/tmp/reg.png');
console.log(s,ox,oy);
