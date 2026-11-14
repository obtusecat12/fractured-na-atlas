import fs from 'fs'; import * as d3 from 'd3'; import sharp from 'sharp';
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const A=d3.geoAlbersUsa().scale(1300).translate([487.5,305]);
const proj=d3.geoTransform({point(x,y){const p=A([x,y]);if(p)this.stream.point(ox+p[0]*s,oy+p[1]*s)}});
const p=d3.geoPath(proj);
const R=f=>JSON.parse(fs.readFileSync('../data/ne/'+f));
let d='';
for(const fn of ['ne_10m_roads.geojson']){ if(!fs.existsSync('../data/ne/'+fn)) continue; for(const f of R(fn).features){const b=d3.geoBounds(f); if(b[0][0]<-50&&b[1][1]>20&&String(f.properties.continent).startsWith('North')) d+=p(f)||''}}
let l='';for(const fn of ['ne_10m_urban_areas.geojson']){ if(!fs.existsSync('../data/ne/'+fn)) continue; for(const f of R(fn).features){const b=d3.geoBounds(f); if(b[0][0]<-50&&b[0][0]>-170&&b[1][1]>20&&b[0][1]<50) l+=p(f)||''}}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1388"><path d="${l}" fill="none" stroke="#0f0" stroke-width=".8"/><path d="${d}" fill="none" stroke="#f0f" stroke-width=".7"/></svg>`;
await sharp('../ref/factions_v2.png').composite([{input:Buffer.from(svg)}]).png().toFile('/tmp/regd.png');
