import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3';
import {geoProject} from 'd3-geo-projection'; import {topology} from 'topojson-server';
import {presimplify, simplify, quantile} from 'topojson-simplify'; import sharp from 'sharp';
const R=p=>JSON.parse(fs.readFileSync(p));
const W=4000;
// extent outline
const ring=[];for(let x=-172;x<=-52;x+=1)ring.push([x,6]);for(let y=6;y<=80;y+=1)ring.push([-52,y]);for(let x=-52;x>=-172;x-=1)ring.push([x,80]);for(let y=80;y>=6;y-=1)ring.push([-172,y]);
const ext={type:'Polygon',coordinates:[ring.reverse()]};
const proj=d3.geoConicEqualArea().parallels([20,60]).rotate([100,0]);
const fitF={type:'FeatureCollection',features:[...R('../data/ne/ne_50m_admin_0_countries.geojson').features.filter(f=>['USA','CAN','MEX','PAN','CUB','BHS'].includes(f.properties.ADM0_A3))]};
proj.fitWidth(W-160,fitF); const [[bx0,by0],[bx1,by1]]=d3.geoPath(proj).bounds(fitF);
proj.translate([proj.translate()[0]-bx0+80,proj.translate()[1]-by0+80]); const H=Math.ceil(by1-by0+160); proj.clipExtent([[-50,-50],[W+50,H+50]]);
console.log('W',W,'H',H,'scale',proj.scale(),'translate',proj.translate());
const P=fc=>geoProject(fc,proj);
// US
const us=R('../data/counties-10m.json'); const fac=R('../build/county_factions_final.json');
const pop={}; for(const line of fs.readFileSync('../data/co-est.csv','latin1').split('\n').slice(1)){const c=line.split(',');if(c[0]==='050')pop[c[3]+c[4]]=+c[11]}
const counties=topo.feature(us,us.objects.counties); let missingPop=0;
for(const f of counties.features){const id=f.id;f.properties={n:f.properties.name,s:id.slice(0,2),f:fac[id]||'none',p:pop[id]??(missingPop++,0)};}
console.log('missingPop',missingPop);
const states=topo.feature(us,us.objects.states); const nation=topo.feature(us,us.objects.nation);
// others
const a0=R('../data/ne/ne_50m_admin_0_countries.geojson');
const inBox=f=>{const[[x0,y0],[x1,y1]]=d3.geoBounds(f);return !(y1<5||y0>84||(x0>-40&&x1>-40&&x0<x1))};
const countries={type:'FeatureCollection',features:a0.features.filter(f=>f.properties.ADM0_A3!=='USA'&&f.properties.ADM0_A3!=='PRI'&&inBox(f)&&['North America','South America'].includes(f.properties.CONTINENT)).map(f=>({type:'Feature',id:f.properties.ADM0_A3,properties:{n:f.properties.NAME,a3:f.properties.ADM0_A3,pop:f.properties.POP_EST},geometry:f.geometry}))};
console.log('countries',countries.features.map(f=>f.id).join(' '));
const a1=R('../data/ne/ne_10m_admin_1_states_provinces_lakes.geojson');
const provinces={type:'FeatureCollection',features:a1.features.filter(f=>['CAN','MEX'].includes(f.properties.adm0_a3)).map(f=>({type:'Feature',properties:{n:f.properties.name,a3:f.properties.adm0_a3},geometry:f.geometry}))};
const lakes0=R('../data/ne/ne_50m_lakes.geojson');
const lakes={type:'FeatureCollection',features:lakes0.features.filter(f=>{const[[x0,y0],[x1,y1]]=d3.geoBounds(f);return x0<-50&&x0>-172&&y0>5&&y1<84&&f.properties.scalerank<=4}).map(f=>({type:'Feature',properties:{n:f.properties.name},geometry:f.geometry}))};
const factions=R('../build/factions.geojson'), hatch=R('../build/hatch.geojson');
const rv=R('../data/ne/ne_10m_rivers_lake_centerlines.geojson');
const rivers={type:'FeatureCollection',features:rv.features.filter(f=>{const[[x0,y0],[x1,y1]]=d3.geoBounds(f);return x0>-170&&x1<-52&&y0>7&&y1<75&&f.properties.scalerank<=5&&f.properties.featurecla!=='Lake Centerline'}).map(f=>({type:'Feature',properties:{n:f.properties.name,r:f.properties.scalerank},geometry:f.geometry}))};
const pf=P(factions), ph=P(hatch), prv=P(rivers); fs.writeFileSync('../build/_pf.json',JSON.stringify(pf)); fs.writeFileSync('../build/_pn.json',JSON.stringify(P(nation)));
const pc=P(counties),ps=P(states),pn=P(nation),pco=P(countries),ppr=P(provinces),pl=P(lakes);
let t=topology({factions:pf,hatch:ph,rivers:prv,counties:pc,states:ps,nation:pn,countries:pco,provinces:ppr,lakes:pl},5e4);
t=presimplify(t); const tq=topo.quantize(simplify(t,+process.env.TH||2),4e4); // planar area threshold (units^2)
const out=JSON.stringify(tq); fs.writeFileSync('../build/map.topo.json',out); console.log('topo bytes',out.length);
fs.writeFileSync('../build/projection.json',JSON.stringify({W,H,type:'geoConicEqualArea',parallels:[20,60],rotate:[100,0],scale:proj.scale(),translate:proj.translate()}));
// save projected counties for later use
fs.writeFileSync('../build/_pc.json',JSON.stringify(pc));
