// data.js — 纳瓦霍县开局的内容。所有文字 [中文, English]。
var DATA = {
  scenarios: [
    { id: 'navajo', zh: '纳瓦霍县，亚利桑那州', en: 'Navajo County, Arizona', seat: ['县府：霍尔布鲁克', 'County seat: Holbrook'], date: ['2009年10月14日', 'Oct 14, 2009'], ok: true },
    { id: 'nye', zh: '奈县，内华达州', en: 'Nye County, Nevada', seat: ['县府：托诺帕', 'County seat: Tonopah'], date: ['', ''], ok: false }
  ],
  start: { y: 2009, m: 10, d: 14, day: 23, hour: 15 },
  powers: {
    fed:    { zh: '联邦政府', en: 'Federal government', short: ['联邦', 'Federal'], color: '#2F6FDB', via: ['亚利桑那州应急管理局 · 凤凰城', 'Arizona Division of Emergency Management · Phoenix'] },
    navajo: { zh: '纳瓦霍族政府', en: 'Navajo Nation', short: ['纳瓦霍族', 'Navajo Nation'], color: '#B5552B', via: ['纳瓦霍族应急管理部 · 窗岩', 'Navajo Nation Dept. of Emergency Management · Window Rock'] },
    lds:    { zh: '后期圣徒教会', en: 'LDS Church', short: ['教会', 'LDS'], color: '#7A5BB5', via: ['斯诺弗莱克、泰勒、肖洛、霍尔布鲁克、温斯洛、派恩托普-莱克赛德六个支联会', 'Snowflake, Taylor, Show Low, Holbrook, Winslow and Pinetop-Lakeside stakes'] },
    gov:    { zh: '州长办公室', en: "Governor's Office", short: ['州长', 'Governor'], color: '#B07D1A', via: ['亚利桑那州州长办公室 · 凤凰城西华盛顿街 1700 号', "Arizona Governor's Office · 1700 W Washington St, Phoenix"] },
    sec:    { zh: '州应急委员会', en: 'State Emergency Council', short: ['委员会', 'Council'], color: '#2C8A84', via: ['亚利桑那州应急委员会 · 凤凰城东麦克道尔路 5636 号', 'Arizona State Emergency Council · 5636 E McDowell Rd, Phoenix'] },
    nb:     { zh: '邻近机构', en: 'Neighbouring agency', short: ['邻近', 'Nearby'], color: '#7b2f8e' },
    county: { zh: '本县财政', en: 'County general fund', short: ['本县', 'County'], color: '#3A8A3A' }
  },
  // 本县实际能管的城镇（保留地以外）/ towns under county jurisdiction
  towns: [
    { id: 'holbrook', mayor: ['杰夫·希尔', 'Jeff Hill'], zh: '霍尔布鲁克', en: 'Holbrook', ll: [-110.1582, 34.9022], pop: 5053, cases: 0, mood: 61, seat: true, town: 'TOWN' },
    { id: 'winslow', mayor: ['罗宾·博伊德', 'Robin Boyd'], town: 1, zh: '温斯洛', en: 'Winslow', ll: [-110.6974, 35.0242], pop: 9655, cases: 0, mood: 58 },
    { id: 'showlow', mayor: ['里克·弗瑙', 'Rick Fernau'], town: 1, zh: '肖洛', en: 'Show Low', ll: [-110.0298, 34.2542], pop: 10660, cases: 0, mood: 66 },
    { id: 'snowflake', mayor: ['凯利·威利斯', 'Kelly Willis'], town: 1, zh: '斯诺弗莱克', en: 'Snowflake', ll: [-110.0782, 34.5134], pop: 5590, cases: 0, mood: 72 },
    { id: 'taylor', town: 1, zh: '泰勒', en: 'Taylor', ll: [-110.0918, 34.4653], pop: 4112, cases: 0, mood: 70 },
    { id: 'pinetop', mayor: ['卢克·史密斯', 'Luke Smith'], town: 1, zh: '派恩托普-莱克赛德', en: 'Pinetop-Lakeside', ll: [-109.9293, 34.1425], pop: 4282, cases: 0, mood: 67 },
    { id: 'heber', zh: '希伯-奥弗加德', en: 'Heber-Overgaard', ll: [-110.5665, 34.4156], pop: 2822, cases: 0, mood: 64 },
    { id: 'joseph', zh: '约瑟夫城', en: 'Joseph City', ll: [-110.3343, 34.9561], pop: 1386, cases: 0, mood: 69 },
    { id: 'linden', zh: '林登', en: 'Linden', ll: [-110.1593, 34.2845], pop: 2597, cases: 0, mood: 65 },
    { id: 'woodruff', zh: '伍德拉夫', en: 'Woodruff', ll: [-110.0451, 34.7825], pop: 160, cases: 0, mood: 68 }
  ],
  // 其他地名（只作标注）/ other labels
  labels: [
    ['凤凰城', 'Phoenix', -112.074, 33.448, 1], ['弗拉格斯塔夫', 'Flagstaff', -111.651, 35.198, 1], ['窗岩', 'Window Rock', -109.052, 35.681, 1],
    ['圣约翰斯', 'St. Johns', -109.361, 34.506, 1], ['格洛布', 'Globe', -110.787, 33.394, 1], ['盖洛普', 'Gallup', -108.742, 35.528, 0],
    ['怀特里弗', 'Whiteriver', -109.964, 33.837, 0], ['凯恩塔', 'Kayenta', -110.29, 36.728, 0], ['基科茨莫维', 'Kykotsmovi', -110.626, 35.871, 0],
    ['钦利', 'Chinle', -109.551, 36.154, 0], ['图巴城', 'Tuba City', -111.239, 36.135, 0], ['佩森', 'Payson', -111.325, 34.231, 0],
    ['斯普林格维尔', 'Springerville', -109.288, 34.134, 0], ['加纳多', 'Ganado', -109.541, 35.711, 0], ['皮农', 'Pinon', -110.222, 36.101, 0],
    ['迪尔康', 'Dilkon', -110.318, 35.385, 0], ['乔拉电厂', 'Cholla Power Plant', -110.303, 34.940, 0], ['斯诺弗莱克纸厂', 'Snowflake paper mill', -110.099, 34.590, 0], ['石化林国家公园', 'Petrified Forest NP', -109.783, 35.065, 0], ['温斯洛州立监狱', 'ASPC-Winslow', -110.640, 35.000, 0], ['佩吉', 'Page', -111.456, 36.914, 0]
  ],
  // 周边 / neighbours. county = county polygon name; res = reservation name
  regions: [
    { id: 'navajo_nation', res: 'Navajo Nation Reservation', zh: '纳瓦霍族', en: 'Navajo Nation', stance: 'navajo', seat: ['窗岩', 'Window Rock'], chair: ['族长 小乔·雪利', 'President Joe Shirley Jr.'], cases: 64, ref: 0, seen: true, date: '2009-10-13',
      note: ['本县北半部是保留地。族政府自己发布病例标准，KTNN 660 AM 用纳瓦霍语播报。', "The north half of the county is reservation land. The Nation sets its own case criteria; KTNN 660 AM broadcasts in Navajo."] },
    { id: 'hopi', res: 'Hopi Reservation', zh: '霍皮族', en: 'Hopi Tribe', stance: 'navajo', seat: ['基科茨莫维', 'Kykotsmovi'], chair: ['临时议会主持 菲利普·阔奇特瓦', 'Interim council chair Phillip Quochytewa Sr.'], cases: 3, ref: 0, seen: true, date: '2009-10-12',
      note: ['今年没有主席。临时部落议会由菲利普·阔奇特瓦主持，部落秘书玛丽·费尔特代行日常事务。三座台地的村子不让外来车辆进。', "No chairman this year. An interim council chaired by Phillip Quochytewa Sr. runs things, with Tribal Secretary Mary Felter handling day-to-day business. The mesa villages are closed to outside traffic."] },
    { id: 'fort_apache', res: 'Fort Apache Reservation', zh: '白山阿帕奇族', en: 'White Mountain Apache Tribe', stance: 'fed', seat: ['怀特里弗', 'Whiteriver'], cases: 12, ref: 0, seen: true, date: '2009-10-13',
      chair: ['主席 罗尼·卢佩', 'Chairman Ronnie Lupe'], note: ['怀特里弗的印第安卫生署医院人手不足，族里向联邦要了两批护士。', 'The IHS hospital in Whiteriver is short-staffed. The tribe has asked the federal side for two rounds of nurses.'] },
    { id: 'Apache', county: 'Apache', zh: '阿帕奇县', en: 'Apache County', stance: 'lds', seat: ['圣约翰斯', 'St. Johns'], cases: 7, ref: 140, seen: true, date: '2009-10-12',
      note: ['县里缺护士，有柴油。圣约翰斯和斯普林格维尔都在 US 180/191 上。', 'Short on nurses, has diesel. St. Johns and Springerville sit on US 180/191.'] },
    { id: 'Coconino', county: 'Coconino', zh: '科科尼诺县', en: 'Coconino County', stance: 'fed', seat: ['弗拉格斯塔夫', 'Flagstaff'], cases: 88, ref: 2300, seen: true, date: '2009-10-13',
      note: ['北亚利桑那大学停课。I-40 和 I-17 上的车都经过弗拉格斯塔夫。', 'Northern Arizona University has suspended classes. Traffic off I-40 and I-17 comes through Flagstaff.'] },
    { id: 'Gila', county: 'Gila', zh: '希拉县', en: 'Gila County', stance: 'fed', seat: ['格洛布', 'Globe'], cases: 41, ref: 1700, seen: true, date: '2009-10-12',
      note: ['从凤凰城往北走 SR 87 和 US 60 的车，很多在佩森停下。', 'Many cars heading north from Phoenix on SR 87 and US 60 stop in Payson.'] },
    { id: 'Maricopa', county: 'Maricopa', zh: '联邦控制区', en: 'Federal zone', stance: 'fed', seat: ['凤凰城', 'Phoenix'], cases: 2310, ref: 0, seen: true, date: '2009-10-14', fed: true,
      note: ['州政府和亚利桑那州应急管理局都在凤凰城，归联邦调度。', 'The state government and the Arizona Division of Emergency Management are in Phoenix, under federal direction.'] },
    { id: 'Pinal', county: 'Pinal', zh: '联邦控制区', en: 'Federal zone', stance: 'fed', seen: true, fed: true, cases: 390, ref: 0, date: '2009-10-14', note: ['', ''] },
    { id: 'Graham', county: 'Graham', zh: '联邦控制区', en: 'Federal zone', stance: 'fed', seen: true, fed: true, cases: 35, ref: 0, date: '2009-10-13', note: ['', ''] },
    { id: 'Greenlee', county: 'Greenlee', zh: '联邦控制区', en: 'Federal zone', stance: 'fed', seen: true, fed: true, cases: 6, ref: 0, date: '2009-10-11', note: ['', ''] },
    { id: 'McKinley', county: 'McKinley', zh: '麦金利县', en: 'McKinley County', seen: false, status: ['广播正常', 'Broadcasting'] },
    { id: 'Cibola', county: 'Cibola', zh: '锡沃拉县', en: 'Cibola County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Catron', county: 'Catron', zh: '卡特伦县', en: 'Catron County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'San Juan NM', county: 'San Juan NM', zh: '圣胡安县', en: 'San Juan County', seen: false, status: ['广播正常', 'Broadcasting'] },
    { id: 'San Juan UT', county: 'San Juan UT', zh: '圣胡安县', en: 'San Juan County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Kane', county: 'Kane', zh: '凯恩县', en: 'Kane County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Montezuma', county: 'Montezuma', zh: '蒙特苏马县', en: 'Montezuma County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Yavapai', county: 'Yavapai', zh: '亚瓦派县', en: 'Yavapai County', seen: false, status: ['广播时断时续', 'Broadcasts intermittent'] }
  ],
  // 2009 年 10 月在任 / in office, Oct 2009
  board: [
    { d: 1, zh: '乔纳森·内兹', en: 'Jonathan Nez', tie: 'navajo', area: ['凯恩塔、皮农一带（保留地）', 'Kayenta and Piñon area (reservation)'] },
    { d: 2, zh: '杰西·汤普森', en: 'Jesse Thompson', tie: 'navajo', area: ['迪尔康一带（保留地）', 'Dilkon area (reservation)'] },
    { d: 3, zh: 'J.R. 德斯佩恩', en: 'J.R. DeSpain', tie: 'county' },
    { d: 4, zh: '戴维·坦尼', en: 'David Tenney', tie: 'county' },
    { d: 5, zh: '杰里·布朗洛', en: 'Jerry Brownlow', tie: 'county' }
  ],
  officials: [
    { g: ['县政府', 'County'], list: [
      ['詹姆斯·杰恩', 'James Jayne', '县行政长官', 'County Manager'],
      ['达斯蒂·帕森斯', 'Dusty Parsons', '副县行政长官，兼管应急管理', 'Assistant County Manager, covering emergency management'],
      ['K.C. 克拉克', 'K.C. Clark', '县警长', 'Sheriff'],
      ['布拉德·卡里昂', 'Brad Carlyon', '县检察官', 'County Attorney']] },
    { g: ['纳瓦霍族', 'Navajo Nation'], list: [
      ['小乔·雪利', 'Joe Shirley Jr.', '族长', 'President', 'shirley'],
      ['本·谢利', 'Ben Shelly', '副族长', 'Vice President', 'shelly'],
      ['劳伦斯·T·摩根', 'Lawrence T. Morgan', '族议会议长', 'Speaker, Navajo Nation Council'],
      ['萨姆森·考博伊', 'Samson Cowboy', '公共安全部主任', 'Director, Division of Public Safety'],
      ['安斯勒姆·罗恩霍斯', 'Anslem Roanhorse Jr.', '卫生部主任', 'Director, Division of Health']] },
    { g: ['其他部落', 'Other tribes'], list: [
      ['菲利普·阔奇特瓦', 'Phillip Quochytewa Sr.', '霍皮族临时议会主持', 'Hopi interim council chair', 'quochytewa'],
      ['玛丽·费尔特', 'Mary Felter', '霍皮族部落秘书', 'Hopi Tribal Secretary'],
      ['罗尼·卢佩', 'Ronnie Lupe', '白山阿帕奇族主席', 'White Mountain Apache Chairman']] },
    { g: ['州与联邦', 'State and federal'], list: [
      ['简·布鲁尔', 'Jan Brewer', '亚利桑那州州长', 'Governor of Arizona'],
      ['威尔·汉布尔', 'Will Humble', '州卫生厅代理厅长', 'Acting Director, Arizona Dept. of Health Services'],
      ['雨果·萨拉查', 'Hugo Salazar', '亚利桑那国民警卫队司令', 'Adjutant General, Arizona National Guard'],
      ['安·柯克帕特里克', 'Ann Kirkpatrick', '联邦众议员（亚利桑那第1选区）', 'U.S. Representative, AZ-1'],
      ['南希·沃德', 'Nancy Ward', '联邦应急管理署第九区主任', 'FEMA Region IX Administrator']] }
  ],
  // 建筑。size = 米 / metres. convert = 只能改建现有建筑
  buildings: [
    { id: 'clinic', run: { recover: .01 }, onBuilt: { trust: 3 }, crew: 6, ops: 4, cat: 'life', zh: '模块化诊所', en: 'Modular clinic', cost: 180, days: 4, fund: ['fed', 'county'], size: [24, 12], fx: ['信任 +3', 'Trust +3'], roof: '#d8d7d1' },
    { id: 'trailers', run: { house: 120 }, crew: 8, ops: 2, cat: 'life', zh: '旅行拖车安置点', en: 'Travel trailer site', cost: 320, days: 5, fund: ['fed', 'lds'], size: [70, 46], fx: ['安置 120 人', 'Houses 120'], roof: '#e4e3de', grid: true },
    { id: 'warehouse', run: { stockCap: 20, supply: .25 }, onBuilt: { stock: 5 }, crew: 6, ops: 2, cat: 'life', zh: '物资仓库', en: 'Supply warehouse', cost: 140, days: 3, fund: ['lds', 'county'], size: [40, 20], fx: ['储备 +20 天', 'Reserve +20 days'], roof: '#a9adad' },
    { id: 'shelter', run: { house: 80 }, crew: 3, ops: 3, cat: 'life', zh: '改建为收容所', en: 'Convert to shelter', cost: 45, days: 2, fund: ['lds', 'county', 'navajo'], convert: true, fx: ['安置 80 人', 'Houses 80'] },
    { id: 'check', run: { divert: 4, spread: -.04 }, onBuilt: { panic: -1, trust: -1 }, crew: 4, ops: 4, cat: 'ctrl', zh: '体温检查点', en: 'Temperature checkpoint', cost: 60, days: 1, fund: ['fed', 'county'], size: [14, 8], fx: ['恐慌 −1 · 信任 −1', 'Panic −1 · Trust −1'], roof: '#f1efe8', road: true },
    { id: 'isolation', run: { hold: 40 }, crew: 3, ops: 3, cat: 'ctrl', zh: '改建为隔离点', en: 'Convert to isolation site', cost: 90, days: 2, fund: ['fed'], convert: true, fx: ['收治 40 人', 'Holds 40'] },
    { id: 'tower', run: { sight: 40, reveal: 90 }, crew: 4, ops: 0, cat: 'info', zh: '无线电铁塔', en: 'Radio tower', cost: 110, days: 3, fund: ['navajo', 'county'], size: [4, 4], fx: ['视野 +40 公里', 'Sight +40 km'], roof: '#9a9a96', tower: true },
    { id: 'office', run: { partner: .15 }, crew: 2, ops: 1, cat: 'info', zh: '联络办公室', en: 'Liaison office', cost: 50, days: 2, fund: ['navajo', 'lds', 'fed'], convert: true, fx: ['可见对方内部派系', "Shows the other side's factions"] },
    { id: 'vaccine', run: { spread: -.15 }, crew: 2, ops: 6, cat: 'life', zh: '改建体育馆为接种点', en: 'Convert gym to vaccine clinic', cost: 35, days: 1, fund: ['fed', 'county'], convert: true, fx: ['传播 −15%', 'Spread −15%'] },
    { id: 'foodbank', run: { daily: { panic: -.15 }, use: .1 }, crew: 3, ops: 3, cat: 'life', zh: '食物发放点', en: 'Food distribution site', cost: 25, days: 1, fund: ['lds', 'county'], size: [30, 14], look: 'tents', fx: ['恐慌每天 −0.15 · 物资每天 −0.1 天', 'Panic −0.15/day · uses 0.1 day of supplies/day'], roof: '#f0efe8' },
    { id: 'shower', run: { spread: -.05, daily: { trust: .1 } }, crew: 2, ops: 2, cat: 'life', zh: '淋浴洗衣车', en: 'Shower and laundry trailers', cost: 40, days: 1, fund: ['fed', 'lds'], size: [26, 12], look: 'trailers', fx: ['传播 −5% · 信任每天 +0.1', 'Spread −5% · Trust +0.1/day'], roof: '#e9e9e4' },
    { id: 'morgue', onBuilt: { trust: 2, panic: 1 }, crew: 2, ops: 1, cat: 'life', zh: '冷藏遗体车', en: 'Refrigerated morgue trailer', cost: 30, days: 1, fund: ['fed', 'county'], size: [16, 6], look: 'trailers', fx: ['信任 +2 · 恐慌 +1', 'Trust +2 · Panic +1'], roof: '#f2f2ee' },
    { id: 'fuel', run: { otCut: .3, stockCap: 5 }, crew: 4, ops: 1, cat: 'ctrl', zh: '发电机与燃料站', en: 'Generator and fuel depot', cost: 95, days: 2, fund: ['fed', 'county'], size: [24, 16], look: 'tanks', fx: ['夜间加班费 −30% · 储备 +5 天', 'Night overtime −30% · Reserve +5 days'], roof: '#c9c7c0' },
    { id: 'helipad', run: { supply: .3, sight: 25, reveal: 25 }, crew: 4, ops: 2, cat: 'info', zh: '直升机停机坪', en: 'Helipad', cost: 70, days: 2, fund: ['fed'], size: [22, 22], look: 'pad', fx: ['每天物资 +0.3 天 · 视野 +25 公里', 'Supplies +0.3 day/day · Sight +25 km'], roof: '#8f8d88' },
    { id: 'volcenter', run: { vol: 3 }, crew: 2, ops: 2, cat: 'info', zh: '改建为志愿者中心', en: 'Convert to volunteer center', cost: 20, days: 1, fund: ['lds', 'navajo', 'county'], convert: true, fx: ['志愿者每周 +3', 'Volunteers +3/week'] },
  ],
  // 可雇用的施工方（2009 年亚利桑那东北部，公司名虚构，所在城镇真实）。
  // mult 报价倍数 · speed 工期倍数 · rel 按期完工的把握 · cap 同时能接几个工地 · mob 进场天数 · fee 进场费（$K）
  // q：nights 两班倒 / sabbath 周日不开工 / nocase 不进有病例的镇 / co 爱提变更单 / snow 冬天容易停工
  contractors: [
    { id: 'county', zh: '纳瓦霍县公共工程处施工队', en: 'Navajo County Public Works crews', sh: ['县公共工程处施工队', 'County Public Works crews'], town: ['霍尔布鲁克', 'Holbrook'], roc: null, mult: 1, speed: 1, rel: 1, cap: 99, mob: 0, fee: 0, q: [],
      note: ['县自有人手施工，按排班出工', 'In-house force account; works the county shift schedule'], ref: ['2008 年 霍尔布鲁克县政府停车场翻修', '2008 county complex parking lot, Holbrook'] },
    { id: 'wmb', zh: '白山建筑公司', en: 'White Mountain Builders, Inc.', town: ['肖洛', 'Show Low'], roc: 'ROC 108741 · B-1', bond: 'Western Surety Co.', tel: '(928) 537-4410', mult: 1.12, speed: .8, rel: .82, cap: 2, mob: 0, fee: 0, q: [],
      note: ['两个施工队；价格含 10 天内材料', 'Two crews; price holds 10 days on materials'], ref: ['2008 年 肖洛 Deuce of Clubs 路段商铺', '2008 retail strip, Deuce of Clubs, Show Low'] },
    { id: 'lcc', zh: '小科罗拉多承包公司', en: 'Little Colorado Contracting, LLC', town: ['霍尔布鲁克', 'Holbrook'], roc: 'ROC 214306 · B-2', bond: null, tel: '(928) 524-2287', mult: .9, speed: 1.15, rel: .55, cap: 1, mob: 0, fee: 0, q: ['co'],
      note: ['投标保证金以本票代替；现场变更另计', "Cashier's check in lieu of bid bond; field changes billed extra"], ref: ['2007 年 约瑟夫城消防站加建', '2007 fire station addition, Joseph City'] },
    { id: 'ccc', zh: '克利尔溪建造公司', en: 'Clear Creek Constructors', town: ['温斯洛', 'Winslow'], roc: 'ROC 167592 · B-1', bond: 'CNA Surety', tel: '(928) 289-3315', mult: 1.02, speed: .95, rel: .7, cap: 1, mob: 0, fee: 0, q: [],
      note: ['钢结构和混凝土自做', 'Self-performs steel and concrete'], ref: ['2006 年 温斯洛 BNSF 货场维修棚', '2006 BNSF yard maintenance shed, Winslow'] },
    { id: 'scb', zh: '银溪建筑', en: 'Silver Creek Builders', town: ['斯诺弗莱克', 'Snowflake'], roc: 'ROC 121055 · B-1', bond: 'Travelers Casualty & Surety', tel: '(928) 536-7720', mult: 1, speed: .9, rel: .93, cap: 1, mob: 0, fee: 0, q: ['sabbath', 'nocase'],
      note: ['周日不开工；不在有病例的镇施工', 'No Sunday work; will not work in towns with active cases'], ref: ['2009 年 斯诺弗莱克联合学区体育馆屋顶', '2009 gym reroof, Snowflake Unified'] },
    { id: 'mrc', zh: '莫戈隆崖建筑公司', en: 'Mogollon Rim Construction', town: ['派恩托普-莱克赛德', 'Pinetop-Lakeside'], roc: 'ROC 132870 · B-1', bond: 'Liberty Mutual Surety', tel: '(928) 367-1952', mult: 1.08, speed: .9, rel: .72, cap: 1, mob: 0, fee: 0, q: ['snow'],
      note: ['下雪天按天顺延', 'Snow days added to schedule'], ref: ['2008 年 莱克赛德木屋度假村会所', '2008 lodge clubhouse, Lakeside'] },
    { id: 'kpg', zh: '卡奇纳峰总承包公司', en: 'Kachina Peaks General Contractors', town: ['弗拉格斯塔夫', 'Flagstaff'], roc: 'ROC 097318 · B-1', bond: 'The Hartford', tel: '(928) 774-6031', mult: 1.18, speed: .75, rel: .85, cap: 2, mob: 1, fee: 12, q: ['co'],
      note: ['含进场费；从弗拉格斯塔夫开 I-40 过来', 'Mobilization included; crews come out from Flagstaff on I-40'], ref: ['2008 年 北亚利桑那大学停车楼', '2008 parking structure, NAU'] },
    { id: 'cpb', zh: '驼峰太平洋建筑公司', en: 'Camelback Pacific Builders, Inc.', town: ['菲尼克斯', 'Phoenix'], roc: 'ROC 084529 · A, B-1', bond: 'Zurich / Fidelity & Deposit', tel: '(602) 955-8800', mult: 1.45, speed: .55, rel: .95, cap: 3, mob: 2, fee: 25, q: ['nights'],
      note: ['两班倒施工；进场需两天', 'Double shifts; two days to mobilize'], ref: ['2008 年 Valley Metro 轻轨坦佩段车站', '2008 Valley Metro light rail stations, Tempe'] }
  ],
  bcats: { life: ['民生', 'Services'], ctrl: ['管控', 'Control'], info: ['通讯', 'Communications'] },
  // 开局已有 / existing at start. ll = lon,lat
  facilities: [
    { b: 'check', ll: [-110.1405, 34.9128], name: ['I-40 东口检查点', 'I-40 east exit checkpoint'], fund: 'fed', done: true },
    { b: 'clinic', ll: [-110.1665, 34.8978], name: ['县卫生局临时诊所', 'Public Health temporary clinic'], fund: 'county', done: true },
    { b: 'trailers', ll: [-110.1765, 34.9105], name: ['西霍皮大道拖车点', 'W Hopi Dr trailer site'], fund: 'fed', done: false, eta: 3 }
  ],
  laws: [
    { id: 'mask', sup: [1, 1, 0, 0, 0], g: ['公共场所', 'Public places'], zh: '县属建筑内须戴口罩', en: 'Masks in county buildings', fx: ['传播 −15%', 'Spread −15%'], on: true },
    { id: 'school_open', sup: [0, 0, 1, 1, 1], g: ['公共场所', 'Public places'], zh: '霍尔布鲁克联合学区照常上课', en: 'Holbrook Unified stays open', fx: ['传播 +10%', 'Spread +10%'], ex: 'school_close', on: true },
    { id: 'school_close', sup: [1, 1, -1, -1, -1], g: ['公共场所', 'Public places'], zh: '全县公立学校停课两周', en: 'Close county public schools for two weeks', fx: ['传播 −30% · 信任 −2', 'Spread −30% · Trust −2'], ex: 'school_open' },
    { id: 'presser', sup: [1, 1, 1, 1, 1], g: ['信息', 'Information'], zh: '每日县新闻发布会，KINO 1230 AM 转播', en: 'Daily county briefing, carried on KINO 1230 AM', fx: ['每天恐慌 −0.2', 'Panic −0.2 a day'], on: true },
    { id: 'std_fed', sup: [-2, -2, 1, 0, 1], g: ['病例标准', 'Case criteria'], zh: '采用州应急管理局的病例标准', en: "Use the state's case criteria", fx: ['联邦 +6 · 纳瓦霍族 −6', 'Federal +6 · Navajo −6'], ex: 'std_navajo' },
    { id: 'std_navajo', sup: [2, 2, -1, -1, -1], g: ['病例标准', 'Case criteria'], zh: '采用纳瓦霍族卫生部的病例标准', en: 'Use the Navajo Division of Health criteria', fx: ['纳瓦霍族 +6 · 联邦 −6', 'Navajo +6 · Federal −6'], ex: 'std_fed' },
    { id: 'quota', sup: [-1, -1, 0, -1, 1], g: ['人口', 'People'], zh: '接收从凤凰城北上的人，每周 300 人', en: 'Take people coming north from Phoenix, 300 a week', fx: ['每周多来 300 人 · 联邦 +3 · 信任 −1', '+300 arrivals a week · Federal +3 · Trust −1'] },
    { id: 'hours', sup: [0, 0, 0, -1, 0], g: ['人口', 'People'], zh: '县雇员每周工作 50 小时', en: 'County staff on 50-hour weeks', fx: ['县雇员人手 +25% · 每天信任 −1', 'County staff +25% · Trust −1 a day'] },
    { id: 'deputize', g: ['治安', 'Law enforcement'], sup: [2, 2, 0, -1, 0], zh: '县警长副手在凯恩塔和皮农驻点，持纳瓦霍族委任', en: "Station sheriff's deputies in Kayenta and Piñon under Navajo Nation commissions", fx: ['纳瓦霍族 +5 · 两辆巡逻车调去凯恩塔和皮农', 'Navajo +5 · two patrol units move to Kayenta and Piñon'], d: { navajo: 5 } },
    { id: 'mill_crew', g: ['就业', 'Jobs'], sup: [0, 0, 1, 2, 1], zh: '雇用斯诺弗莱克纸厂停工工人做流调', en: 'Hire idled Snowflake mill workers as contact tracers', fx: ['每周县账户 −$40K · 信任 +3 · 教会 +2 · 传播 −15%', 'County −$40K a week · Trust +3 · LDS +2 · Spread −15%'], d: { trust: 3, lds: 2, money: -40 }, weekly: -40 },
    { id: 'bnsf', sup: [0, 0, 1, 1, 1], g: ['物资', 'Supplies'], zh: '请 BNSF 在霍尔布鲁克站停车卸货', en: 'Ask BNSF to stop and unload at Holbrook', fx: ['物资每天 +0.4 天 · 联邦 +2', 'Supplies +0.4 days a day · Federal +2'] }
  ],
  promises: [
    { zh: '霍尔布鲁克公共图书馆周六恢复开放', en: 'Reopen the Holbrook Public Library on Saturday', left: 3, cost: 15, by: ['霍尔布鲁克居民联署', 'Holbrook residents\' petition'] },
    { zh: '周五前公布全县病例分布图', en: 'Publish the county case map by Friday', left: 2, cost: 5, by: ['《霍尔布鲁克论坛新闻》', 'Holbrook Tribune-News'] }
  ],
  // ---------- 驻军 · 检查站 · 叛军 ----------
  // f 战斗系数；cap 最多调用几支；wk 每周县账户（千美元）；need 调用条件；hire 调用时的影响
  forces: [
    { id: 'ng', zh: '亚利桑那国民警卫队（一个连）', en: 'Arizona National Guard (one company)', short: ['国民警卫队', 'Guard'], tag: 'G', col: '#3b6db3', str: 40, f: 1.1, cap: 2, wk: 0, need: { fed: 40 }, hire: { fed: 1 }, d: ['州政府派出，县里不用出钱', 'Sent by the state at no cost to the county'] },
    { id: 'posse', zh: '县警长后备队', en: "Sheriff's Posse", short: ['警长后备队', 'Posse'], tag: 'S', col: '#7a5a2e', str: 12, f: .8, cap: 4, wk: 4, hire: { trust: 1 }, d: ['12 名后备警员', '12 reserve deputies'] },
    { id: 'militia', zh: '地方民兵', en: 'Local militia', short: ['民兵', 'Militia'], tag: 'M', col: '#6b7d35', str: 18, f: .75, cap: 4, wk: 2, hire: { navajo: -2, panic: 1 }, d: ['18 名本地志愿者', '18 local volunteers'] },
    { id: 'merc', zh: 'Xe Services（原黑水）保安队', en: 'Xe Services (formerly Blackwater) team', short: ['雇佣兵', 'Contractors'], tag: 'X', col: '#444', str: 30, f: 1.3, cap: 3, wk: 75, hire: { trust: -2, navajo: -3 }, d: ['30 名武装保安', '30 armed contractors'] },
    { id: 'fed', zh: '联邦军队（布利斯堡派出营）', en: 'Federal troops (battalion from Fort Bliss)', short: ['联邦军', 'Federal'], tag: 'F', col: '#2a4a2a', str: 60, f: 1.4, cap: 1, wk: 0, need: { fed: 60 }, hire: { trust: -1, ctl: { adem: 5 } }, d: ['布利斯堡派来的一个营', 'A battalion out of Fort Bliss'] }
  ],
  checkpoints: [
    { id: 'i40w', zh: 'I-40 西口（科科尼诺县界）', en: 'I-40 west (Coconino line)', ll: [-110.86, 35.05] },
    { id: 'i40e', zh: 'I-40 东口（阿帕奇县界）', en: 'I-40 east (Apache line)', ll: [-109.86, 35.08] },
    { id: 'us60s', zh: '60 号公路南口（肖洛以南）', en: 'US 60 south of Show Low', ll: [-110.06, 34.19] },
    { id: 'sr260w', zh: '260 号公路西口（希伯以西）', en: 'SR 260 west of Heber', ll: [-110.74, 34.40] },
    { id: 'sr87n', zh: '87 号公路北口（往霍皮）', en: 'SR 87 north (toward Hopi)', ll: [-110.62, 35.25] },
    { id: 'sr77n', zh: '77 号公路北口（霍尔布鲁克以北）', en: 'SR 77 north of Holbrook', ll: [-110.12, 35.15] }
  ],
  // 叛军出没处；cp 是挡在前面的检查站
  rebelSpawns: [
    { ll: [-110.92, 34.36], cp: 'sr260w' }, { ll: [-110.38, 34.28], cp: 'us60s' }, { ll: [-109.80, 34.92], cp: 'i40e' }, { ll: [-110.40, 35.32], cp: 'sr77n' }
  ],
  teams: [
    { zh: '县警长办公室 · 警长 K.C. 克拉克', en: "Sheriff's Office · Sheriff K.C. Clark", where: ['巡逻车 14 辆', '14 patrol units'] },
    { zh: '县卫生局流调组', en: 'Public Health contact tracers', where: ['麦金利县 · 还要 2 天', 'McKinley County · 2 days out'] }
  ]
};
