// corridor_towns.json + existing nuclear -> build/extras.json (projected x,y)
import fs from 'fs'; import * as d3 from 'd3';
const pj=JSON.parse(fs.readFileSync('../build/projection.json'));
const pr=d3.geoConicEqualArea().parallels(pj.parallels).rotate(pj.rotate).scale(pj.scale).translate(pj.translate);
const e=JSON.parse(fs.readFileSync('../build/extras.json'));
e.towns=JSON.parse(fs.readFileSync('../build/corridor_towns.json')).map(t=>{const p=pr([t.lon,t.lat]);return {...t,x:+p[0].toFixed(1),y:+p[1].toFixed(1)}});
fs.writeFileSync('../build/extras.json',JSON.stringify(e));console.log(e.towns.length);
