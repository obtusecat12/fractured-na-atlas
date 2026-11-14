# Towns sitting on the thin corridor links -> build/corridor_towns.json (shown as heavier dots)
import json
from shapely.geometry import shape, Point
F={f['id']:shape(f['geometry']) for f in json.load(open('build/factions.geojson'))['features']}
C=[ # zh, en, lon, lat
('奈法','Nephi',-111.836,39.710),('菲尔莫尔','Fillmore',-112.323,38.969),('比弗','Beaver',-112.641,38.277),('锡达城','Cedar City',-113.061,37.677),
('帕罗旺','Parowan',-112.828,37.842),('圣乔治','St. George',-113.584,37.096),('梅斯基特','Mesquite',-114.067,36.805),('普罗沃','Provo',-111.659,40.234),
('乔利埃特','Joliet',-88.081,41.525),('庞蒂亚克','Pontiac',-88.630,40.881),('布卢明顿','Bloomington',-88.994,40.484),('渥太华','Ottawa',-88.842,41.346),('皮奥里亚','Peoria',-89.589,40.694),
('沃基根','Waukegan',-87.845,42.364),('基诺沙','Kenosha',-87.821,42.585),('拉辛','Racine',-87.783,42.726),('密尔沃基','Milwaukee',-87.906,43.039),('希博伊根','Sheboygan',-87.714,43.751),('马尼托沃克','Manitowoc',-87.657,44.089),
('麦克多诺','McDonough',-84.147,33.447),('格里芬','Griffin',-84.264,33.247),('福赛斯','Forsyth',-83.938,33.034),('梅肯','Macon',-83.633,32.841),('杰克逊','Jackson GA',-83.966,33.294),
('塔拉哈西','Tallahassee',-84.281,30.438),('莱克城','Lake City',-82.639,30.190),('盖恩斯维尔','Gainesville',-82.325,29.652),('奥卡拉','Ocala',-82.140,29.187),
('帕拉特卡','Palatka',-81.637,29.648),('圣奥古斯丁','St. Augustine',-81.312,29.894),('代托纳比奇','Daytona Beach',-81.023,29.211),('杰克逊维尔','Jacksonville',-81.656,30.332),
('巴拿马城','Panama City',-85.660,30.159),('阿巴拉契科拉','Apalachicola',-84.983,29.726),('基西米','Kissimmee',-81.408,28.292),('维罗比奇','Vero Beach',-80.397,27.639),('皮尔斯堡','Fort Pierce',-80.325,27.447),
('奥兰多','Orlando',-81.379,28.538),('沃尔多斯塔','Valdosta',-83.280,30.833),('蒂夫顿','Tifton',-83.508,31.450),
('韦科','Waco',-97.147,31.549),('坦普尔','Temple',-97.343,31.098),('希尔斯伯勒','Hillsboro',-97.130,32.011),('科西卡纳','Corsicana',-96.469,32.095),('布赖恩','Bryan',-96.370,30.674),
('朗维尤','Longview',-94.740,32.500),('泰勒','Tyler',-95.301,32.351),('佩科斯','Pecos',-103.493,31.423),('亨茨维尔','Huntsville',-95.551,30.723),
('克拉克斯堡','Clarksburg',-80.344,39.281),('马丁斯堡','Martinsburg',-77.964,39.456),('温彻斯特','Winchester',-78.163,39.186),
('贝克斯菲尔德','Bakersfield',-119.019,35.373),('巴斯托','Barstow',-117.022,34.896),
('伊利','Ely',-114.889,39.247),('德尔塔','Delta',-112.577,39.352),('图埃勒','Tooele',-112.298,40.531),
('大卫营镇','Thurmont',-77.410,39.624),('布里斯托尔','Bristol',-82.188,36.595),('查塔努加','Chattanooga',-85.309,35.046),
]
out=[]
for zh,en,lon,lat in C:
    p=Point(lon,lat); hit=None; bd=1e9
    for k,g in F.items():
        if k=='mxo' or k.startswith('gilead'): continue
        d=g.distance(p)
        if d<bd: bd,hit=d,k
    if bd>0.09: continue
    from shapely.ops import nearest_points
    q=p if bd==0 else nearest_points(F[hit],p)[0]
    # only thin links: the point must sit close to the faction's own edge
    if F[hit].boundary.distance(q)<0.075:
        out.append({'zh':zh,'en':en,'lon':round(q.x,4),'lat':round(q.y,4),'f':hit})
json.dump(out,open('build/corridor_towns.json','w'),ensure_ascii=False)
for o in out: print(o['f'],o['en'])
print(len(out),'of',len(C))
