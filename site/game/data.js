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
    county: { zh: '本县财政', en: 'County general fund', short: ['本县', 'County'], color: '#3A8A3A' }
  },
  // 本县实际能管的城镇（保留地以外）/ towns under county jurisdiction
  towns: [
    { id: 'holbrook', mayor: ['杰夫·希尔', 'Jeff Hill'], zh: '霍尔布鲁克', en: 'Holbrook', ll: [-110.1582, 34.9022], pop: 5053, cases: 9, mood: 61, seat: true, town: 'TOWN' },
    { id: 'winslow', mayor: ['罗宾·博伊德', 'Robin Boyd'], town: 1, zh: '温斯洛', en: 'Winslow', ll: [-110.6974, 35.0242], pop: 9655, cases: 11, mood: 58 },
    { id: 'showlow', mayor: ['里克·弗瑙', 'Rick Fernau'], town: 1, zh: '肖洛', en: 'Show Low', ll: [-110.0298, 34.2542], pop: 10660, cases: 6, mood: 66 },
    { id: 'snowflake', mayor: ['凯利·威利斯', 'Kelly Willis'], town: 1, zh: '斯诺弗莱克', en: 'Snowflake', ll: [-110.0782, 34.5134], pop: 5590, cases: 2, mood: 72 },
    { id: 'taylor', town: 1, zh: '泰勒', en: 'Taylor', ll: [-110.0918, 34.4653], pop: 4112, cases: 1, mood: 70 },
    { id: 'pinetop', mayor: ['卢克·史密斯', 'Luke Smith'], town: 1, zh: '派恩托普-莱克赛德', en: 'Pinetop-Lakeside', ll: [-109.9293, 34.1425], pop: 4282, cases: 2, mood: 67 },
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
  // 按日期触发 / dated events
  events: [
    { date: '2009-10-20', title: ['斯诺弗莱克纸厂', 'Snowflake mill'],
      body: ['Catalyst Paper 通知县里，斯诺弗莱克纸厂下周起再停两周，近 300 人回家。七月已经停过一次。斯诺弗莱克镇长凯利·威利斯问县里能做什么。', 'Catalyst Paper tells the county the Snowflake mill will idle for two weeks from next week, sending nearly 300 people home. It already idled once in July. Snowflake Mayor Kelly Willis asks what the county can do.'],
      opts: [
        { t: ['把停工工人雇来做流调', 'Hire the idled workers as contact tracers'], fx: ['信任 +3 · 教会 +2 · $120K', 'Trust +3 · LDS +2 · $120K'], d: { trust: 3, lds: 2, money: -120 } },
        { t: ['请泰勒支联会的福利委员会接手', "Ask the Taylor stake's welfare committee to help"], fx: ['教会 +3 · 信任 −1', 'LDS +3 · Trust −1'], d: { lds: 3, trust: -1 } },
        { t: ['县里不出面', 'Stay out of it'], fx: ['信任 −3', 'Trust −3'], d: { trust: -3 } }
      ] },
    { date: '2009-10-26', title: ['窗岩', 'Window Rock'],
      body: ['纳瓦霍族议会表决让族长小乔·雪利行政休假，副族长本·谢利代理族长。族应急管理部说，之前和县里谈好的事照旧，但签字要等代理族长办公室。', 'The Navajo Nation Council votes to put President Joe Shirley Jr. on administrative leave. Vice President Ben Shelly becomes acting president. The Nation\'s emergency management office says earlier agreements with the county stand, but signatures now go through the acting president\'s office.'],
      opts: [
        { t: ['照常和族应急管理部对接', 'Keep working through Navajo emergency management'], fx: ['无变化', 'No change'], d: {} },
        { t: ['给代理族长办公室去函，确认现有协议', "Write to the acting president's office to confirm existing agreements"], fx: ['纳瓦霍族 +3', 'Navajo +3'], d: { navajo: 3 } },
        { t: ['暂停新的合作，等族内局势明朗', 'Pause new joint work until things settle'], fx: ['纳瓦霍族 −4 · 恐慌 −1', 'Navajo −4 · Panic −1'], d: { navajo: -4, panic: -1 } }
      ], flag: 'shelly' },
    { date: '2009-11-16', title: ['凯恩塔和皮农', 'Kayenta and Piñon'],
      body: ['警长 K.C. 克拉克和纳瓦霍族公共安全部谈妥了草案：县警长副手拿族里的委任，在凯恩塔和皮农驻点。需要监事会表决。', "Sheriff K.C. Clark and the Navajo Division of Public Safety have a draft: sheriff's deputies take Navajo Nation commissions and are stationed in Kayenta and Piñon. It needs a Board vote."],
      opts: [
        { t: ['列入下次监事会议程', "Put it on the Board's next agenda"], fx: ['条例页可表决', 'Votable under Ordinances'], d: { navajo: 1 } },
        { t: ['再等一个月', 'Wait another month'], fx: ['纳瓦霍族 −2', 'Navajo −2'], d: { navajo: -2 } }
      ] },
    { date: '2009-11-18', title: ['基科茨莫维', 'Kykotsmovi'],
      body: ['霍皮族选出了主席勒罗伊·辛戈伊特瓦，12月1日就职。族里问，去霍尔布鲁克的 SR 77 能不能在白天放行族人的车。', 'The Hopi Tribe has elected Leroy Shingoitewa chairman; he takes office Dec 1. The tribe asks whether Hopi vehicles can use SR 77 to Holbrook during the day.'],
      opts: [
        { t: ['白天放行，入城测体温', 'Daytime access, temperature check at town'], fx: ['纳瓦霍族 +2 · 恐慌 +1', 'Navajo +2 · Panic +1'], d: { navajo: 2, panic: 1 } },
        { t: ['只放行送货车', 'Delivery trucks only'], fx: ['信任 +1', 'Trust +1'], d: { trust: 1 } }
      ], flag: 'hopi_chair' }
  ],
  // 建筑。size = 米 / metres. convert = 只能改建现有建筑
  buildings: [
    { id: 'clinic', cat: 'life', zh: '模块化诊所', en: 'Modular clinic', cost: 180, days: 4, fund: ['fed', 'county'], size: [24, 12], fx: ['信任 +3', 'Trust +3'], roof: '#d8d7d1' },
    { id: 'trailers', cat: 'life', zh: '旅行拖车安置点', en: 'Travel trailer site', cost: 320, days: 5, fund: ['fed', 'lds'], size: [70, 46], fx: ['安置 120 人', 'Houses 120'], roof: '#e4e3de', grid: true },
    { id: 'warehouse', cat: 'life', zh: '物资仓库', en: 'Supply warehouse', cost: 140, days: 3, fund: ['lds', 'county'], size: [40, 20], fx: ['储备 +20 天', 'Reserve +20 days'], roof: '#a9adad' },
    { id: 'shelter', cat: 'life', zh: '改建为收容所', en: 'Convert to shelter', cost: 45, days: 2, fund: ['lds', 'county', 'navajo'], convert: true, fx: ['安置 80 人', 'Houses 80'] },
    { id: 'check', cat: 'ctrl', zh: '体温检查点', en: 'Temperature checkpoint', cost: 60, days: 1, fund: ['fed', 'county'], size: [14, 8], fx: ['恐慌 −1 · 信任 −1', 'Panic −1 · Trust −1'], roof: '#f1efe8', road: true },
    { id: 'isolation', cat: 'ctrl', zh: '改建为隔离点', en: 'Convert to isolation site', cost: 90, days: 2, fund: ['fed'], convert: true, fx: ['收治 40 人', 'Holds 40'] },
    { id: 'tower', cat: 'info', zh: '无线电铁塔', en: 'Radio tower', cost: 110, days: 3, fund: ['navajo', 'county'], size: [4, 4], fx: ['视野 +40 公里', 'Sight +40 km'], roof: '#9a9a96', tower: true },
    { id: 'office', cat: 'info', zh: '联络办公室', en: 'Liaison office', cost: 50, days: 2, fund: ['navajo', 'lds', 'fed'], convert: true, fx: ['可见对方内部派系', "Shows the other side's factions"] }
  ],
  bcats: { life: ['民生', 'Services'], ctrl: ['管控', 'Control'], info: ['通讯', 'Communications'] },
  // 开局已有 / existing at start. ll = lon,lat
  facilities: [
    { b: 'check', ll: [-110.1405, 34.9128], name: ['I-40 东口检查点', 'I-40 east exit checkpoint'], fund: 'fed', done: true },
    { b: 'clinic', ll: [-110.1665, 34.8978], name: ['县卫生局临时诊所', 'Public Health temporary clinic'], fund: 'county', done: true },
    { b: 'trailers', ll: [-110.1765, 34.9105], name: ['西霍皮大道拖车点', 'W Hopi Dr trailer site'], fund: 'fed', done: false, eta: 3 }
  ],
  laws: [
    { id: 'mask', sup: [1, 1, 0, 0, 0], g: ['公共场所', 'Public places'], zh: '县属建筑内须戴口罩', en: 'Masks in county buildings', fx: ['恐慌 −2', 'Panic −2'], on: true },
    { id: 'school_open', sup: [0, 0, 1, 1, 1], g: ['公共场所', 'Public places'], zh: '霍尔布鲁克联合学区照常上课', en: 'Holbrook Unified stays open', fx: ['信任 +3 · 病例风险 +', 'Trust +3 · case risk +'], ex: 'school_close', on: true },
    { id: 'school_close', sup: [1, 1, -1, -1, -1], g: ['公共场所', 'Public places'], zh: '全县公立学校停课两周', en: 'Close county public schools for two weeks', fx: ['病例风险 − · 劳动力 −8%', 'Case risk − · labour −8%'], ex: 'school_open' },
    { id: 'presser', sup: [1, 1, 1, 1, 1], g: ['信息', 'Information'], zh: '每日县新闻发布会，KINO 1230 AM 转播', en: 'Daily county briefing, carried on KINO 1230 AM', fx: ['恐慌 −2', 'Panic −2'], on: true },
    { id: 'std_fed', sup: [-2, -2, 1, 0, 1], g: ['病例标准', 'Case criteria'], zh: '采用州应急管理局的病例标准', en: "Use the state's case criteria", fx: ['联邦 +6 · 纳瓦霍族 −6', 'Federal +6 · Navajo −6'], ex: 'std_navajo' },
    { id: 'std_navajo', sup: [2, 2, -1, -1, -1], g: ['病例标准', 'Case criteria'], zh: '采用纳瓦霍族卫生部的病例标准', en: 'Use the Navajo Division of Health criteria', fx: ['纳瓦霍族 +6 · 联邦 −6', 'Navajo +6 · Federal −6'], ex: 'std_fed' },
    { id: 'quota', sup: [-1, -1, 0, -1, 1], g: ['人口', 'People'], zh: '接收从凤凰城北上的人，每周 300 人', en: 'Take people coming north from Phoenix, 300 a week', fx: ['劳动力 +4% · 住房 −300', 'Labour +4% · housing −300'] },
    { id: 'hours', sup: [0, 0, 0, -1, 0], g: ['人口', 'People'], zh: '县雇员每周工作 50 小时', en: 'County staff on 50-hour weeks', fx: ['指挥中心 +25% · 每天信任 −1', 'EOC +25% · Trust −1 a day'] },
    { id: 'deputize', g: ['治安', 'Law enforcement'], sup: [2, 2, 0, -1, 0], zh: '县警长副手在凯恩塔和皮农驻点，持纳瓦霍族委任', en: "Station sheriff's deputies in Kayenta and Piñon under Navajo Nation commissions", fx: ['纳瓦霍族 +5 · 巡逻车 −2', 'Navajo +5 · patrol units −2'], d: { navajo: 5 } },
    { id: 'mill_crew', g: ['就业', 'Jobs'], sup: [0, 0, 1, 2, 1], zh: '雇用斯诺弗莱克纸厂停工工人做流调', en: 'Hire idled Snowflake mill workers as contact tracers', fx: ['每周 $40K · 信任 +3 · 教会 +2', '$40K a week · Trust +3 · LDS +2'], d: { trust: 3, lds: 2, money: -40 } },
    { id: 'bnsf', sup: [0, 0, 1, 1, 1], g: ['物资', 'Supplies'], zh: '请 BNSF 在霍尔布鲁克站停车卸货', en: 'Ask BNSF to stop and unload at Holbrook', fx: ['储备 +10 天 · 联邦 +2', 'Reserve +10 days · Federal +2'] }
  ],
  mail: [
    { from: 'fed', id: 'FEMA IX', t: ['第九区可调 40 台旅行拖车', 'Region IX can release 40 travel trailers'], s: ['南希·沃德办公室：需要县里提供有水电接口的场地。', "Nancy Ward's office: the county must provide a site with water and power hookups."], time: '09:05', unread: true, acts: [['接受', 'Accept'], ['回复', 'Reply']] },
    { from: 'nb', nb: ['乔拉电厂（APS）', 'Cholla Power Plant (APS)'], id: '', t: ['倒班工人过 I-40 检查点要排一小时', 'Shift workers wait an hour at the I-40 checkpoint'], s: ['约瑟夫城的电厂请县里给员工车辆开专用道。', 'The Joseph City plant asks for a dedicated lane for staff vehicles.'], time: '08:40', unread: true, acts: [['同意', 'Agree'], ['拒绝', 'Decline']] },
    { from: 'fed', id: 'ADEM 09-0412', t: ['在 I-40 霍尔布鲁克西口增设体温检查点', 'Add a temperature checkpoint at the I-40 Holbrook west exit'], s: ['随文拨款 $180,000，10月16日前完成。', '$180,000 attached. Complete by Oct 16.'], time: '10:42', unread: true, acts: [['执行', 'Comply'], ['搁置', 'Hold'], ['回复', 'Reply']] },
    { from: 'navajo', id: 'NNDEM-117', t: ['族人进城采购不应在检查点排队', 'Nation members should not queue at checkpoints to shop in town'], s: ['霍尔布鲁克的 Safeway 是很多家庭最近的超市。', "For many families the Safeway in Holbrook is the nearest supermarket."], time: '11:15', unread: true, acts: [['同意', 'Agree'], ['回复', 'Reply']] },
    { from: 'lds', id: '', t: ['主教仓库可调出面粉和罐头', "The bishops' storehouse can release flour and canned goods"], s: ['约 40 吨。请县里定一个分发地点。', 'About 40 tons. Please name a distribution site.'], time: '昨天 Yesterday', unread: true, acts: [['接受', 'Accept'], ['回复', 'Reply']] },
    { from: 'nb', nb: ['阿帕奇县监事会', 'Apache County Board of Supervisors'], id: '', t: ['借两名护士，可用柴油交换', 'Two nurses on loan, paid in diesel'], s: ['6,000 加仑，从圣约翰斯运过来。', '6,000 gallons, trucked from St. Johns.'], time: '昨天 Yesterday', unread: false, acts: [['接受', 'Accept'], ['还价', 'Counter'], ['拒绝', 'Decline']] },
    { from: 'nb', nb: ['温斯洛市议会', 'Winslow City Council'], id: '', t: ['小科罗拉多医疗中心需要 20 张床位的钱', 'Little Colorado Medical Center needs funding for 20 beds'], s: ['$260,000。', '$260,000.'], time: '10月12日 Oct 12', unread: false, acts: [['拨款', 'Fund'], ['婉拒', 'Decline']] }
  ],
  promises: [
    { zh: '霍尔布鲁克公共图书馆周六恢复开放', en: 'Reopen the Holbrook Public Library on Saturday', left: 3, cost: 15, by: ['霍尔布鲁克居民联署', 'Holbrook residents\' petition'] },
    { zh: '周五前公布全县病例分布图', en: 'Publish the county case map by Friday', left: 2, cost: 5, by: ['《霍尔布鲁克论坛新闻》', 'Holbrook Tribune-News'] }
  ],
  broadcasts: [
    { ch: 'fed', name: ['KPNX 12 · 凤凰城', 'KPNX 12 · Phoenix'], time: '14:00', t: ['州应急管理局：明天上午 9 点公布新的病例标准。', 'State emergency management: new case criteria at 9 am tomorrow.'] },
    { ch: 'navajo', name: ['KTNN 660 AM · 窗岩', 'KTNN 660 AM · Window Rock'], time: '12:30', t: ['族长办公室：族内检测点周末照常开放。', "President's office: Nation testing sites stay open this weekend."] },
    { ch: 'county', name: ['KINO 1230 AM · 温斯洛', 'KINO 1230 AM · Winslow'], time: '09:10', t: ['县新闻发布会：今日新增确诊 3 例，均在温斯洛。', 'County briefing: 3 new confirmed cases today, all in Winslow.'] },
    { ch: 'lds', name: ['KNAZ 2 · 弗拉格斯塔夫', 'KNAZ 2 · Flagstaff'], time: '08:00', t: ['斯诺弗莱克的志愿者周六在泰勒分发食品。', 'Snowflake volunteers hand out food in Taylor on Saturday.'] }
  ],
  teams: [
    { zh: '县警长办公室 · 警长 K.C. 克拉克', en: "Sheriff's Office · Sheriff K.C. Clark", where: ['巡逻车 14 辆', '14 patrol units'] },
    { zh: '县卫生局流调组', en: 'Public Health contact tracers', where: ['麦金利县 · 还要 2 天', 'McKinley County · 2 days out'] }
  ],
  event: {
    title: ['周五橄榄球赛', 'Friday football'],
    body: ['霍尔布鲁克高中 Roadrunners 周五晚 7 点主场对温斯洛高中 Bulldogs。往年能来两千多人。州应急管理局建议取消，学区说听县里的。',
           'Holbrook High plays Winslow High at home on Friday at 7 pm. It usually draws over two thousand people. The state recommends cancelling; the school district will follow the county.'],
    opts: [
      { t: ['照常举行', 'Play as usual'], fx: ['信任 +5 · 联邦 −3', 'Trust +5 · Federal −3'], d: { trust: 5, fed: -3 } },
      { t: ['限 800 人，入场测体温', 'Cap at 800, temperature checks at the gate'], fx: ['信任 +2 · 恐慌 −1', 'Trust +2 · Panic −1'], d: { trust: 2, panic: -1 } },
      { t: ['不卖票，KINO 电台直播', 'No crowd, live on KINO'], fx: ['恐慌 −2 · 联邦 +2', 'Panic −2 · Federal +2'], d: { panic: -2, fed: 2 } }
    ]
  }
};
