import fs from 'fs'; import * as d3 from 'd3';
const pj=JSON.parse(fs.readFileSync('../build/projection.json'));
const pr=d3.geoConicEqualArea().parallels(pj.parallels).rotate(pj.rotate).scale(pj.scale).translate(pj.translate);
const C=JSON.parse(fs.readFileSync('../build/cities.json'));
const ADD=[['奥马哈','Omaha',-95.94,41.26,2],['俄克拉何马城','Oklahoma City',-97.52,35.47,2],['孟菲斯','Memphis',-90.05,35.15,2],['纳什维尔','Nashville',-86.78,36.16,2],
['路易斯维尔','Louisville',-85.76,38.25,2],['印第安纳波利斯','Indianapolis',-86.16,39.77,2],['哥伦布','Columbus',-83.0,39.96,2],['克利夫兰','Cleveland',-81.69,41.5,2],
['匹兹堡','Pittsburgh',-79.99,40.44,2],['辛辛那提','Cincinnati',-84.51,39.1,2],['得梅因','Des Moines',-93.61,41.59,3],['威奇托','Wichita',-97.34,37.69,3],
['伯明翰','Birmingham',-86.8,33.52,2],['夏洛特','Charlotte',-80.84,35.23,2],['罗利','Raleigh',-78.64,35.78,3],['布法罗','Buffalo',-78.88,42.89,2],
['奥尔巴尼','Albany',-73.76,42.65,3],['小石城','Little Rock',-92.29,34.75,3],['杰克逊','Jackson',-90.18,32.3,3],['夏延','Cheyenne',-104.82,41.14,3],
['博伊西','Boise',-116.2,43.62,2],['里诺','Reno',-119.81,39.53,2],['苏福尔斯','Sioux Falls',-96.73,43.55,3],['拉皮德城','Rapid City',-103.23,44.08,3],
['什里夫波特','Shreveport',-93.75,32.52,3],['列克星敦','Lexington',-84.5,38.04,3],['罗切斯特','Rochester',-77.61,43.16,3],['密尔沃基','Milwaukee',-87.91,43.04,2],
['约翰逊城','Johnson City',-82.35,36.31,3],['马凯特','Marquette',-87.40,46.55,3],['曼泰','Manti',-111.64,39.27,3],['谢里登','Sheridan',-106.96,44.80,3]];
const have=new Set(C.map(c=>c.en));
for(const [zh,en,lon,lat,rank] of ADD){ if(have.has(en)) continue; const [x,y]=pr([lon,lat]); C.push({zh,en,lon,lat,rank,x:Math.round(x),y:Math.round(y)}); }
fs.writeFileSync('../build/cities.json',JSON.stringify(C)); console.log(C.length);
