// data.js — 莫诺卡西病：约洛县 原型数据 / prototype data for the Yolo County management game.
// All text bilingual: [zh, en].
var DATA = {
  start: { y: 2009, m: 10, d: 14, day: 23, hour: 15 },
  // 三方 / the three state powers
  powers: {
    gov:    { zh: '州长办公室', en: "Governor's Office", short: ['州长', 'Gov.'], color: '#2F6FDB' },
    council:{ zh: '加州应急委员会', en: 'California Emergency Council', short: ['委员会', 'Council'], color: '#7A5BB5' },
    calema: { zh: 'Cal EMA 加州应急管理局', en: 'Cal EMA', short: ['Cal EMA', 'Cal EMA'], color: '#D9822B' },
    county: { zh: '本县财政', en: 'County funds', short: ['本县', 'County'], color: '#3A8A3A' }
  },
  towns: [
    { id: 'woodland', zh: '伍德兰', en: 'Woodland', ll: [-121.7733, 38.6785], pop: 55400, cases: 14, mood: 58, seat: true,
      note: ['县府所在地。县应急指挥中心设在县行政大楼地下室。', 'County seat. The county EOC sits in the basement of the county administration building.'] },
    { id: 'davis', zh: '戴维斯', en: 'Davis', ll: [-121.7405, 38.5449], pop: 64900, cases: 17, mood: 64,
      note: ['加州大学戴维斯分校停课两周后部分复课，学生志愿者很多。', 'UC Davis resumed some classes after a two-week closure. Plenty of student volunteers.'] },
    { id: 'wsac', zh: '西萨克拉门托', en: 'West Sacramento', ll: [-121.5302, 38.5805], lab: 'l', pop: 47200, cases: 6, mood: 47,
      note: ['隔一座塔桥就是州议会大厦。三方的车每天都从这里过。', 'The Capitol is one Tower Bridge away. All three sides drive through here every day.'] },
    { id: 'winters', zh: '温特斯', en: 'Winters', ll: [-121.9708, 38.5249], pop: 6700, cases: 0, mood: 71,
      note: ['果园小镇，周六农夫市集照常开。', 'Orchard town. The Saturday farmers market is still running.'] },
    { id: 'esparto', zh: '埃斯帕托', en: 'Esparto', ll: [-122.0172, 38.6924], pop: 3100, cases: 0, mood: 69,
      note: ['卡佩谷入口，SR-16 上的小镇。', 'Gateway to the Capay Valley on SR-16.'] },
    { id: 'knights', zh: '奈茨兰丁', en: 'Knights Landing', ll: [-121.7178, 38.7996], pop: 1000, cases: 0, mood: 66,
      note: ['萨克拉门托河边的小镇，北面是萨特县。', 'River town on the Sacramento; Sutter County is across the water.'] },
    { id: 'dunnigan', zh: '邓尼根', en: 'Dunnigan', ll: [-121.9697, 38.8852], pop: 1400, cases: 0, mood: 63,
      note: ['I-5 与 I-505 交汇处，卡车休息站很多。', 'Where I-5 meets I-505. Lots of truck stops.'] },
    { id: 'clarksburg', zh: '克拉克斯堡', en: 'Clarksburg', ll: [-121.5272, 38.4202], pop: 420, cases: 0, mood: 70,
      note: ['三角洲酒庄区。', 'Delta wine country.'] }
  ],
  // 周边政权 / neighbouring authorities (visible at start)
  regions: [
    { id: 'Sacramento', zh: '萨克拉门托县', en: 'Sacramento County', stance: 'calema', cases: 412, ref: 9800, seen: true, date: '2009-10-14',
      note: ['州议会大厦和 Cal EMA 总部（马瑟）都在这里。加州博览会场改成了临时安置营。', 'Home of the Capitol and Cal EMA headquarters at Mather. Cal Expo is now a temporary camp.'] },
    { id: 'Solano', zh: '索拉诺县', en: 'Solano County', stance: 'gov', cases: 188, ref: 6300, seen: true, date: '2009-10-13',
      note: ['湾区来的车都从 I-80 经过这里，县里在瓦列霍设了分流点。', 'Bay Area traffic comes up I-80 through here; the county runs a sorting point in Vallejo.'] },
    { id: 'Sutter', zh: '萨特县', en: 'Sutter County', stance: 'council', cases: 21, ref: 400, seen: true, date: '2009-10-13',
      note: ['农业县，愿意用稻米换医生。', 'Farm county. Willing to trade rice for doctors.'] },
    { id: 'Colusa', zh: '科卢萨县', en: 'Colusa County', stance: 'council', cases: 4, ref: 90, seen: true, date: '2009-10-11',
      note: ['人少，县里只有两名卫生官员。', 'Small; the county has two health officers.'] },
    { id: 'Napa', zh: '纳帕县', en: 'Napa County', stance: 'gov', cases: 39, ref: 1100, seen: true, date: '2009-10-12',
      note: ['酒庄暂停接待游客，改成了志愿者宿舍。', 'Wineries closed to tourists and opened as volunteer housing.'] },
    { id: 'Placer', zh: '普莱瑟县', en: 'Placer County', stance: 'calema', cases: 76, ref: 1500, seen: true, date: '2009-10-13',
      note: ['县议会全票支持 Cal EMA 的统一调度。', 'The board voted unanimously for Cal EMA coordination.'] },
    { id: 'Yuba', zh: '尤巴县', en: 'Yuba County', stance: 'council', cases: 30, ref: 300, seen: true, date: '2009-10-12',
      note: ['比尔空军基地在县内，联邦方面态度不明。', 'Beale AFB is here; the federal side has said little.'] },
    { id: 'Lake', zh: '莱克县', en: 'Lake County', stance: 'gov', cases: 9, ref: 150, seen: true, date: '2009-10-09',
      note: ['信息不多，最近一次通话在五天前。', 'Not much to go on; last call was five days ago.'] },
    { id: 'Contra Costa', zh: '康特拉科斯塔县', en: 'Contra Costa County', seen: false, status: ['广播时断时续', 'Broadcasts intermittent'] },
    { id: 'Marin', zh: '马林县', en: 'Marin County', seen: false, status: ['失去联系', 'No contact'] },
    { id: 'Sonoma', zh: '索诺玛县', en: 'Sonoma County', seen: false, status: ['广播正常', 'Broadcasting'] },
    { id: 'San Joaquin', zh: '圣华金县', en: 'San Joaquin County', seen: false, status: ['广播正常', 'Broadcasting'] },
    { id: 'El Dorado', zh: '埃尔多拉多县', en: 'El Dorado County', seen: false, status: ['广播正常', 'Broadcasting'] },
    { id: 'Amador', zh: '阿马多尔县', en: 'Amador County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Nevada', zh: '内华达县', en: 'Nevada County', seen: false, status: ['未知', 'Unknown'] },
    { id: 'Butte', zh: '比尤特县', en: 'Butte County', seen: false, status: ['杰斐逊州运动活跃', 'Jefferson movement active'] },
    { id: 'Glenn', zh: '格伦县', en: 'Glenn County', seen: false, status: ['杰斐逊州运动活跃', 'Jefferson movement active'] }
  ],
  roads: [
    { ref: 'I-80', k: 'fwy', pts: [[-122.05,38.30],[-121.98,38.356],[-121.83,38.445],[-121.74,38.548],[-121.66,38.562],[-121.585,38.572],[-121.53,38.582],[-121.49,38.59],[-121.41,38.64],[-121.29,38.75]] },
    { ref: 'I-5', k: 'fwy', pts: [[-121.43,38.40],[-121.48,38.50],[-121.505,38.58],[-121.53,38.64],[-121.6,38.672],[-121.69,38.676],[-121.75,38.685],[-121.81,38.74],[-121.88,38.80],[-121.97,38.885],[-122.06,39.02]] },
    { ref: 'I-505', k: 'fwy', pts: [[-121.97,38.36],[-121.96,38.53],[-121.97,38.68],[-121.97,38.885]] },
    { ref: 'US-50', k: 'fwy', pts: [[-121.53,38.582],[-121.51,38.573],[-121.48,38.568],[-121.30,38.59]] },
    { ref: 'CA-113', k: 'hwy', pts: [[-121.82,38.445],[-121.775,38.54],[-121.77,38.66],[-121.75,38.72],[-121.72,38.80],[-121.62,39.13]] },
    { ref: 'CA-16', k: 'hwy', pts: [[-121.77,38.678],[-121.9,38.683],[-122.02,38.692],[-122.04,38.71],[-122.13,38.80],[-122.24,38.89]] },
    { ref: 'CA-128', k: 'hwy', pts: [[-121.97,38.525],[-122.08,38.52],[-122.2,38.51],[-122.30,38.50]] },
    { ref: 'CA-84', k: 'hwy', pts: [[-121.53,38.582],[-121.56,38.49],[-121.6,38.40]] }
  ],
  river: [[-122.0,39.21],[-121.93,39.05],[-121.84,38.92],[-121.72,38.80],[-121.62,38.78],[-121.58,38.70],[-121.545,38.64],[-121.512,38.58],[-121.505,38.50],[-121.52,38.42],[-121.58,38.30],[-121.69,38.15]],
  bypass: [[-121.62,38.78],[-121.63,38.68],[-121.62,38.58],[-121.6,38.45]],
  // 建筑 / building catalogue. cost in thousands of USD; fund = who may pay
  buildings: [
    { id: 'clinic', cat: 'life', zh: '社区诊所', en: 'Community clinic', cost: 180, days: 4, fund: ['gov', 'county'], fx: ['信任 +3 · 本镇病例增长变慢', 'Trust +3 · slows case growth in town'], icon: '#C0392B' },
    { id: 'housing', cat: 'life', zh: '安置小区', en: 'Resettlement housing', cost: 400, days: 7, fund: ['gov', 'council'], fx: ['可安置 800 人 · 新来的人能找工作', 'Houses 800 · arrivals can take local jobs'], icon: '#2E7D32' },
    { id: 'grain', cat: 'life', zh: '粮食仓库', en: 'Grain depot', cost: 120, days: 3, fund: ['gov', 'county'], fx: ['粮食储备 +30 天 · 可与邻县交易', 'Food reserve +30 days · tradeable with neighbours'], icon: '#B8860B' },
    { id: 'center', cat: 'life', zh: '社区中心', en: 'Community center', cost: 90, days: 3, fund: ['county'], fx: ['恐慌 −2 · 可办球赛直播、互助会', 'Panic −2 · hosts game broadcasts and mutual aid'], icon: '#6A8CC7' },
    { id: 'check', cat: 'ctrl', zh: '检查站', en: 'Checkpoint', cost: 80, days: 1, fund: ['calema', 'county'], fx: ['控制进出 · 恐慌 −1 · 信任 −1', 'Controls entry · Panic −1 · Trust −1'], icon: '#555' },
    { id: 'quar', cat: 'ctrl', zh: '隔离点', en: 'Quarantine site', cost: 250, days: 2, fund: ['calema'], fx: ['收治 200 人 · Cal EMA 派人验收', 'Holds 200 · inspected by Cal EMA'], icon: '#D9822B' },
    { id: 'relay', cat: 'info', zh: '无线电中继站', en: 'Radio relay', cost: 150, days: 3, fund: ['council', 'county'], fx: ['揭开 40 公里内的迷雾 · 多收到 2 个频道', 'Reveals 40 km of fog · two more channels'], icon: '#7A5BB5' },
    { id: 'liaison', cat: 'info', zh: '联络处', en: 'Liaison office', cost: 60, days: 2, fund: ['council'], fx: ['看到相邻政权的内部派系', 'Shows a neighbour\'s internal factions'], icon: '#4A6FA5' }
  ],
  bcats: { life: ['民生', 'Public services'], ctrl: ['管控', 'Control'], info: ['通讯与情报', 'Comms & intel'] },
  // existing facilities at start
  facilities: [
    { b: 'check', ll: [-121.585, 38.574], name: ['约洛堤道检查站', 'Yolo Causeway checkpoint'], fund: 'calema', done: true },
    { b: 'clinic', ll: [-121.752, 38.542], name: ['戴维斯社区诊所', 'Davis community clinic'], fund: 'gov', done: true },
    { b: 'quar', ll: [-121.79, 38.665], name: ['县集市场隔离点', 'Fairgrounds quarantine site'], fund: 'calema', done: true },
    { b: 'housing', ll: [-121.55, 38.565], name: ['河滨安置小区', 'Riverfront housing'], fund: 'gov', done: false, eta: 3 }
  ],
  // ordinances / 县紧急条例
  laws: [
    { id: 'mask', g: ['公共生活', 'Public life'], zh: '公共场所口罩令', en: 'Masks in public places', fx: ['恐慌 −3 · 信任 −1', 'Panic −3 · Trust −1'], on: true },
    { id: 'school_open', g: ['公共生活', 'Public life'], zh: '学校照常上课', en: 'Schools stay open', fx: ['信任 +3 · 病例风险上升', 'Trust +3 · higher case risk'], ex: 'school_close' },
    { id: 'school_close', g: ['公共生活', 'Public life'], zh: '全县学校停课', en: 'Close all schools', fx: ['病例风险下降 · 家长请假，劳动力 −8%', 'Lower case risk · parents stay home, labour −8%'], ex: 'school_open' },
    { id: 'presser', g: ['信息', 'Information'], zh: '县每日新闻发布会', en: 'Daily county press briefing', fx: ['恐慌 −2 · 州里会盯着你说了什么', 'Panic −2 · the state watches what you say'], on: true },
    { id: 'relayall', g: ['信息', 'Information'], zh: '全文转播州里广播', en: 'Relay all state broadcasts', fx: ['三方好感 +2 · 广播矛盾时恐慌 +4', 'All three +2 · Panic +4 when they disagree'] },
    { id: 'std_gov', g: ['病例', 'Cases'], zh: '采用州长办公室的病例标准', en: "Use the Governor's case criteria", fx: ['州长 +6 · Cal EMA −6', 'Governor +6 · Cal EMA −6'], ex: 'std_calema' },
    { id: 'std_calema', g: ['病例', 'Cases'], zh: '采用 Cal EMA 的病例标准', en: "Use Cal EMA's case criteria", fx: ['Cal EMA +6 · 州长 −6 · 隔离人数翻倍', 'Cal EMA +6 · Governor −6 · twice as many quarantined'], ex: 'std_gov' },
    { id: 'volunteer', g: ['人力', 'Labour'], zh: '招募 UC Davis 学生志愿者', en: 'Recruit UC Davis student volunteers', fx: ['劳动力 +5% · 学生家长投诉', 'Labour +5% · parents complain'] },
    { id: 'workstay', g: ['人力', 'Labour'], zh: '新来的人可以凭工作留下', en: 'Arrivals may stay if they work', fx: ['劳动力 +10% · 本地居民不满 +3', 'Labour +10% · locals unhappy +3'] },
    { id: 'shift', g: ['人力', 'Labour'], zh: '县雇员 12 小时轮班', en: 'County staff on 12-hour shifts', fx: ['指挥中心效率 +30% · 每天信任 −1', 'EOC output +30% · Trust −1 per day'] }
  ],
  mail: [
    { from: 'calema', id: '09-117', t: ['在 I-80 约洛堤道增设第二道检查站', 'Add a second checkpoint on the I-80 Yolo Causeway'], s: ['附拨款 $250,000，要求 48 小时内完成。', '$250,000 attached; to be done within 48 hours.'], time: '10:42', unread: true, acts: [['执行', 'Comply'], ['搁置', 'Hold'], ['回复', 'Reply']] },
    { from: 'gov', id: 'GO-0931', t: ['请暂缓执行 Cal EMA 09-117 号令', 'Please hold off on Cal EMA order 09-117'], s: ['委员会周五开会前，任何新的检查站都不要设。', 'No new checkpoints until the Council meets on Friday.'], time: '11:15', unread: true, acts: [['同意', 'Agree'], ['回复', 'Reply']] },
    { from: 'council', id: 'EC-14', t: ['邀请县代表出席周五委员会会议', 'County representative invited to Friday\'s Council session'], s: ['地点：州议会大厦 4203 室。请提前提交本县病例数。', 'Room 4203, State Capitol. Please file county case numbers in advance.'], time: '昨天 Yesterday', unread: true, acts: [['出席', 'Attend'], ['派副手', 'Send deputy'], ['回复', 'Reply']] },
    { from: 'nb', nb: ['索拉诺县', 'Solano County'], id: '', t: ['请求帮忙安置 600 名湾区来的人', 'Asking for help housing 600 people from the Bay Area'], s: ['可以用两辆救护车和三名护士交换。', 'We can trade two ambulances and three nurses.'], time: '昨天 Yesterday', unread: false, acts: [['接受', 'Accept'], ['还价', 'Counter'], ['拒绝', 'Decline']] },
    { from: 'nb', nb: ['伍德兰居民联名', 'Woodland residents\' petition'], id: '', t: ['希望一周内重开县图书馆', 'Reopen the county library within a week'], s: ['联署 1,312 人。', '1,312 signatures.'], time: '10月12日 Oct 12', unread: false, acts: [['承诺', 'Promise'], ['婉拒', 'Decline']] }
  ],
  promises: [
    { zh: '一周内重开伍德兰县图书馆', en: 'Reopen the Woodland library within a week', left: 4, by: ['伍德兰居民', 'Woodland residents'] },
    { zh: '本周五前公布全县病例地图', en: 'Publish the county case map by Friday', left: 2, by: ['戴维斯市议会', 'Davis City Council'] }
  ],
  broadcasts: [
    { ch: 'calema', name: ['EAS · Cal EMA 应急广播', 'EAS · Cal EMA'], time: '14:00', t: ['明天上午 9 点将公布新的识别标准，请各县做好准备。', 'New identification criteria will be published at 9 am tomorrow. Counties should prepare.'] },
    { ch: 'gov', name: ['KCRA 3 · 州长讲话', 'KCRA 3 · Governor'], time: '12:30', t: ['州长：任何病例标准都要经委员会审议后才能生效。', 'Governor: no case criteria take effect until the Council has reviewed them.'] },
    { ch: 'council', name: ['KXJZ 88.9 · 委员会发言人', 'KXJZ 88.9 · Council spokesperson'], time: '09:10', t: ['委员会将在周五召开第二次全体会议。', 'The Council will hold its second full session on Friday.'] },
    { ch: 'local', name: ['KDVS 90.3 · 戴维斯', 'KDVS 90.3 · Davis'], time: '08:00', t: ['今天的农夫市集照常，记得戴口罩。', 'The farmers market is on today. Bring a mask.'] }
  ],
  teams: [
    { zh: '县警长车队', en: "Sheriff's convoy", where: ['待命 · 伍德兰', 'Standing by · Woodland'] },
    { zh: '县卫生局采样组', en: 'Public Health sampling team', where: ['康特拉科斯塔县 · 还要 2 天', 'Contra Costa · 2 days out'] }
  ],
  event: {
    title: ['周五晚上的橄榄球赛', 'Friday night football'],
    body: ['伍德兰高中和戴维斯高中的比赛定在周五晚上 7 点，往年能来四千人。两边家长都在打电话问还办不办。Cal EMA 的联络官说他不建议办，州长办公室说这是县里自己的事。',
           'Woodland High plays Davis High on Friday at 7 pm. It usually draws four thousand people. Parents on both sides keep calling to ask if it is on. The Cal EMA liaison advises against it; the Governor\'s Office says it is the county\'s call.'],
    opts: [
      { t: ['照常举行', 'Play as usual'], fx: ['信任 +5 · 病例风险上升 · Cal EMA −3', 'Trust +5 · higher case risk · Cal EMA −3'], d: { trust: 5, panic: -2, calema: -3 } },
      { t: ['限 1,000 名观众，入场测体温', 'Cap at 1,000, temperature checks at the gate'], fx: ['信任 +2 · 恐慌 −1', 'Trust +2 · Panic −1'], d: { trust: 2, panic: -1 } },
      { t: ['空场比赛，KDVS 电台直播', 'No crowd, live on KDVS radio'], fx: ['恐慌 −2 · Cal EMA +2', 'Panic −2 · Cal EMA +2'], d: { panic: -2, calema: 2 } }
    ]
  }
};
