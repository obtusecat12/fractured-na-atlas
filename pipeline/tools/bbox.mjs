import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3';
const t=JSON.parse(fs.readFileSync('../data/counties-albers-10m.json'));
const st=topo.feature(t,t.objects.states).features.filter(f=>!['02','15','72'].includes(f.id));
const b=d3.geoPath(null).bounds({type:'FeatureCollection',features:st}); console.log(JSON.stringify(b));
