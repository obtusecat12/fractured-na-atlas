import fs from 'fs'; import * as d3 from 'd3'; import sharp from 'sharp';
sharp.cache(false);
const pj=JSON.parse(fs.readFileSync('../build/projection.json'));
const proj=d3.geoConicEqualArea().parallels(pj.parallels).rotate(pj.rotate).scale(pj.scale).translate(pj.translate);
const {data,info}=await sharp('../data/relief/GRAY_50M_SR_W.tif',{limitInputPixels:false}).raw().toBuffer({resolveWithObject:true});
const SW=info.width, SH=info.height; console.log(SW,SH,info.channels);
const OW=2400, k=pj.W/OW, OH=Math.round(pj.H/k); const out=Buffer.alloc(OW*OH);
for(let y=0;y<OH;y++)for(let x=0;x<OW;x++){const ll=proj.invert([(x+.5)*k,(y+.5)*k]);if(!ll){out[y*OW+x]=0;continue}
 const fx=(ll[0]+180)/360*SW-.5, fy=(90-ll[1])/180*SH-.5; const x0=Math.floor(fx),y0=Math.floor(fy),dx=fx-x0,dy=fy-y0;
 const C=info.channels; const g=(a,b)=>data[(Math.min(SH-1,Math.max(0,b))*SW+((a+SW)%SW))*C];
 out[y*OW+x]=Math.round(g(x0,y0)*(1-dx)*(1-dy)+g(x0+1,y0)*dx*(1-dy)+g(x0,y0+1)*(1-dx)*dy+g(x0+1,y0+1)*dx*dy);}
await sharp(out,{raw:{width:OW,height:OH,channels:1}}).jpeg({quality:82}).toFile('../build/relief.jpg');
console.log(OW,OH,fs.statSync('../build/relief.jpg').size);
