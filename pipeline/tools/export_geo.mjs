import fs from 'fs'; import * as topo from 'topojson-client';
const us=JSON.parse(fs.readFileSync('../data/counties-10m.json'));
fs.writeFileSync('../build/_counties_ll.geojson',JSON.stringify(topo.feature(us,us.objects.counties)));
fs.writeFileSync('../build/_states_ll.geojson',JSON.stringify(topo.feature(us,us.objects.states)));
fs.writeFileSync('../build/_nation_ll.geojson',JSON.stringify(topo.feature(us,us.objects.nation)));
