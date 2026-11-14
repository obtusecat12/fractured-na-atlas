// pixel-space trace -> lon/lat (inverse of AlbersUSA + image transform)
import fs from 'fs'; import * as d3 from 'd3';
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const A=d3.geoAlbersUsa().scale(1300).translate([487.5,305]);
const inv=([x,y])=>A.invert([(x-ox)/s,(y-oy)/s]);
const T=JSON.parse(fs.readFileSync('../work/v2/trace_px.json'));
let bad=0;
const conv=g=>{const f=r=>r.map(p=>{const q=inv(p);if(!q){bad++;return null}return [+q[0].toFixed(5),+q[1].toFixed(5)]}).filter(Boolean);
 if(g.type==='LineString')return{type:'LineString',coordinates:f(g.coordinates)};if(g.type==='MultiLineString')return{type:'MultiLineString',coordinates:g.coordinates.map(f)};if(g.type==='Polygon')return{type:'Polygon',coordinates:g.coordinates.map(f)};return{type:'MultiPolygon',coordinates:g.coordinates.map(p=>p.map(f))}};
const out={polys:{},ribbons:{},lines:T.lines};
for(const k of ['polys','ribbons'])for(const n in T[k])out[k][n]=conv(T[k][n]);
fs.writeFileSync('../work/v2/trace_ll.json',JSON.stringify(out));console.log('bad',bad);
