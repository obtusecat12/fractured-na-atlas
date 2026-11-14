// v3.4: rebuild map.topo.json from the edited map-space layers written by v34_edit.py (no reprojection, no simplification:
// the inputs are the already-simplified shipped geometry, so shared borders stay identical).
import fs from 'fs'; import {topology} from 'topojson-server'; import * as topo from 'topojson-client';
const names=['factions','hatch','rivers','counties','states','nation','countries','provinces','lakes'];
const objs={}; for(const n of names){const fc=JSON.parse(fs.readFileSync('../work/v34/'+n+'.geojson'));
  fc.features=fc.features.map(f=>{const g={...f}; if(g.id==null) delete g.id; return g;}); objs[n]=fc;}
let t=topology(objs); t=topo.quantize(t,4e4);
const out=JSON.stringify(t); fs.writeFileSync('../build/map.topo.json',out); console.log('topo bytes',out.length);
