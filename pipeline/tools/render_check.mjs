import fs from 'fs'; import * as topo from 'topojson-client'; import * as d3 from 'd3'; import sharp from 'sharp';
const t=JSON.parse(fs.readFileSync('../data/counties-albers-10m.json'));
const fac=JSON.parse(fs.readFileSync(process.argv[2]||'../data/county_factions_raw.json'));
const col={gilead:'#dbb601',usg:'#012967',jefferson:'#084081',lincoln:'#2060a6',sequoyah:'#076aab',fema:'#0b1d59',frc:'#283494',agg:'#1c6996',lds:'#00698f',texas:'#378fbd',wvbc:'#78201e',cascadia:'#3a6937',none:'#f0f0f0'};
const p=d3.geoPath(null);
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="975" height="610"><rect width="975" height="610" fill="#cbe5fc"/>`;
for(const f of topo.feature(t,t.objects.counties).features){svg+=`<path d="${p(f)}" fill="${col[fac[f.id]]||'#f0f'}" stroke="#999" stroke-width="0.1"/>`}
svg+=`<path d="${p(topo.mesh(t,t.objects.states,(a,b)=>a!==b))}" fill="none" stroke="#2a8" stroke-width="0.5"/></svg>`;
await sharp(Buffer.from(svg)).resize(1950).png().toFile(process.argv[3]||'../ref/check.png');
