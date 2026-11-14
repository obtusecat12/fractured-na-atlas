import fs from 'fs'; import * as d3 from 'd3'; import sharp from 'sharp';
const s=(1210/938.571+761/593.593)/2, ox=269-18.485*s, oy=401-12.976*s;
const A=d3.geoAlbersUsa().scale(1300).translate([487.5,305]);
const p=d3.geoPath(d3.geoTransform({point(x,y){const q=A([x,y]);if(q)this.stream.point(ox+q[0]*s,oy+q[1]*s)}}));
const C={gilead:'#E6B422',gilead_aroostook:'#E6B422',gilead_penobscot:'#E6B422',gilead_nek:'#E6B422',usg_ak:'#012967',usg_hi:'#012967',usg_stx:'#012967',usg:'#012967',jefferson:'#0a4183',lincoln:'#2060a6',sequoyah:'#076aab',fema:'#0a1d59',frc:'#283494',agg:'#1c6a96',lds:'#00698f',texas:'#378fbd',wvbc:'#79201f',cascadia:'#3b693a',dwg:'#9d0637',srl:'#f14439',nafr:'#65390a',utdr:'#7b0101',mxo:'#8FD3A0'};
const F=JSON.parse(fs.readFileSync('../build/factions.geojson')).features;
let body=F.map(f=>`<path d="${(p(f)||"").replace(/^Z+/,"").replace(/ZZ+/g,"Z")}" fill="${C[f.id]||'#f0f'}" stroke="none"/>`).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="1388"><rect width="2000" height="1388" fill="#cbe5fc"/><path d="${(p(JSON.parse(fs.readFileSync('../build/_nation_ll.geojson')))||'').replace(/^Z+/,'').replace(/ZZ+/g,'Z')}" fill="#111"/>${body}</svg>`;
await sharp(Buffer.from(svg)).png().toFile('/tmp/v2render.png');
