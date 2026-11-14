import fs from 'fs'; import * as topo from 'topojson-client';
const t=JSON.parse(fs.readFileSync('../data/counties-10m.json'));
fs.writeFileSync('../data/work_counties.geojson',JSON.stringify(topo.feature(t,t.objects.counties)));
fs.writeFileSync('../data/work_states.geojson',JSON.stringify(topo.feature(t,t.objects.states)));
