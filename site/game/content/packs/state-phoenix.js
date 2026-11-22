// 州层主线：州长办公室、州应急委员会、州应急管理局（联邦渠道）之间的权力之争，2009-10-16 至 2009-12-22。
// 背景：州长依据 A.R.S. § 26-303 宣布紧急状态；单次事件州长最多可动用 20 万美元，超出须经州应急委员会批准；
// 州长出州时由国务卿代行职务（亚利桑那州没有副州长）。委员会由州长任主席，成员包括国务卿、司法部长、
// 副官长（兼应急与军事事务部主任）和应急管理局局长等，参议院议长、众议院议长为列席成员。
// 结局由 game.js 的 stateFinale() 在 2009-12-22 按三方权力结算。
CONTENT.add({
  id: 'state-phoenix',
  title: ['凤凰城：州层主线', 'Phoenix: state storyline'],
  by: 'Hark',
  events: [
    {
      id: 'st-proclamation', date: '2009-10-20', icon: 'law',
      title: ['州长签署莫诺卡西病紧急状态公告', 'Governor signs Monocacy emergency proclamation'],
      body: ['布鲁尔州长依据 A.R.S. § 26-303 签署公告，从州一般基金拨出 20 万美元，这是州长不经委员会能动用的上限。纳瓦霍、阿帕奇、科科尼诺三县分这笔钱。县里如果要更多，得请州应急委员会批准。',
        "Governor Brewer signs a proclamation under A.R.S. § 26-303 and releases $200,000 from the state General Fund, the most she can spend without the council. Navajo, Apache and Coconino counties share it. Anything more needs State Emergency Council approval."],
      foot: ['委员会每季度例会，特别会议需主席或三名成员提议。', 'The council meets quarterly; a special session needs the chair or three members.'],
      opts: [
        { t: ['按州长办公室的分配领取', "Take the share the governor's office set"], do: { county: 70, rel: { gov: 3 } } },
        { t: ['向委员会申请追加拨款', 'Ask the council for more'], do: { rel: { sec: 3, gov: -1 }, ctl: { sec: 2 }, flag: 'asked_sec', event: { id: 'st-sec-approve', inDays: 9 } } },
        { t: ['两边都报，先领分配的', 'File with both, take the share first'], do: { county: 70, rel: { gov: 1, sec: 1 } } }
      ]
    },
    {
      id: 'st-sec-approve', chained: true, icon: 'bank',
      title: ['州应急委员会批准追加拨款', 'State Emergency Council approves extra funds'],
      body: ['委员会特别会议以电话表决批准纳瓦霍县 35 万美元，用于安置和物资。司法部长特里·戈达德在会上要求应急管理局每两周向委员会报告一次开支。',
        'A special session votes by phone to give Navajo County $350,000 for housing and supplies. Attorney General Terry Goddard asks ADEM to report its spending to the council every two weeks.'],
      opts: [
        { t: ['接收', 'Accept'], do: { county: 350, ctl: { sec: 3 }, rel: { gov: -2 } } }
      ]
    },
    {
      id: 'st-council-oversight', date: '2009-10-28', icon: 'q',
      title: ['委员会讨论是否审查应急管理局的分配', 'Council weighs review of ADEM allocations'],
      body: ['司法部长提议：应急管理局分配的联邦拨款超过 20 万美元的，都要先经委员会审查。委员会邀请受影响的县电话发言，每县三分钟。应急管理局表示审查会让物资晚到一周以上。',
        "The attorney general moves that any federal allocation by ADEM above $200,000 go to the council first. Affected counties may speak by phone, three minutes each. ADEM says review would delay supplies by a week or more."],
      opts: [
        { t: ['发言支持审查', 'Speak in favour'], do: { ctl: { sec: 4, adem: -3 }, rel: { sec: 4 }, fed: -3, flag: 'oversight' } },
        { t: ['发言反对，物资不能等', 'Speak against: supplies cannot wait'], do: { ctl: { adem: 3 }, rel: { sec: -3 }, fed: 3 } },
        { t: ['不发言', 'Stay off the call'], do: {} }
      ]
    },
    {
      id: 'st-liaison', date: '2009-11-04', icon: 'ppl',
      title: ['应急管理局联络官到达霍尔布鲁克', 'ADEM liaison arrives in Holbrook'],
      body: ['州应急管理局派来的联络官带着笔记本电脑和卫星电话到了县应急行动中心，要一张固定办公桌，并要求县里涉及安置和物资的命令由她联签。',
        'An ADEM liaison arrives at the county EOC with a laptop and a satellite phone. She wants a permanent desk and asks to co-sign every county order on housing and supplies.'],
      opts: [
        { t: ['给办公桌，同意联签', 'Give her a desk and co-signing'], do: { flag: 'adem_embed', fed: 4, ctl: { adem: 3 }, trust: -1, funds: { fed: 120 } } },
        { t: ['给办公桌，不联签', 'Desk, but no co-signing'], do: { fed: 1 } },
        { t: ['请她回凤凰城', 'Send her back to Phoenix'], do: { fed: -5, rel: { gov: 2 } } }
      ]
    },
    {
      id: 'st-gov-call', date: '2009-11-09', icon: 'info',
      title: ['州长办公室召开县长电话会', "Governor's office holds a county call"],
      body: ['州长办公人员主持全州 15 个县的电话会，说州财政 2010 财年缺口仍在扩大，州长要求各县先用自己的应急储备。会后另发了一封邮件。',
        "The governor's staff runs a call with all 15 counties. The state's FY2010 shortfall keeps growing, and the governor asks counties to use their own reserves first. An email follows."],
      opts: [
        { t: ['知道了', 'Noted'], do: { mail: 'st-m-ccgov' } }
      ]
    },
    {
      id: 'st-shelters', when: { after: '2009-11-17', before: '2009-11-30', min: { adem: 38 } }, icon: 'warn',
      title: ['应急管理局要求接管县里的安置点', 'ADEM asks to take over county housing sites'],
      body: ['应急管理局发来指令：联邦安置拨款今后只拨给由应急管理局直接管理的安置点。县里现有的拖车点和收容所如果移交，下周起由联邦资金承担运营费。',
        "ADEM sends a directive: federal housing money will go only to sites ADEM manages directly. If the county hands over its trailer sites and shelters, federal funds cover their running costs from next week."],
      opts: [
        { t: ['移交管理', 'Hand them over'], do: { fed: 5, ctl: { adem: 4 }, trust: -3, funds: { fed: 200 } } },
        { t: ['提议联合管理', 'Propose joint management'], do: { fed: 1, ctl: { adem: 1 } } },
        { t: ['拒绝，并抄送州长办公室', 'Refuse and copy the governor'], do: { fed: -4, rel: { gov: 3 }, ctl: { gov: 2 } } }
      ]
    },
    {
      id: 'st-acting', date: '2009-11-24', icon: 'law',
      title: ['州长出州，国务卿代行州长职务', 'Governor out of state; Secretary of State acting'],
      body: ['布鲁尔州长出州参加会议，按州宪法由国务卿肯·贝内特代行州长职务。应急管理局当天把一份授权书送到国务卿办公室：州应急行动中心改由应急与军事事务部统一指挥。委员会要求各县监事会在 24 小时内表明立场。',
        "Governor Brewer leaves the state for meetings, so under the state constitution Secretary of State Ken Bennett is acting governor. That day ADEM sends his office an authorization putting the State EOC under unified DEMA command. The council asks each county board to state its position within 24 hours."],
      foot: ['监事会可以发一封信。', 'The board can send one letter.'],
      opts: [
        { t: ['写信：等州长回来再定', 'Letter: wait for the governor'], do: { rel: { gov: 4 }, ctl: { gov: 4 }, fed: -2 } },
        { t: ['写信：由委员会临时监管', 'Letter: council oversight for now'], do: { rel: { sec: 4, gov: -2 }, ctl: { sec: 5 } } },
        { t: ['写信：支持统一指挥', 'Letter: back unified command'], do: { fed: 4, ctl: { adem: 5 }, rel: { gov: -3 } } },
        { t: ['不写', 'Send nothing'], do: { ctl: { adem: 2 } } }
      ]
    },
    {
      id: 'st-return', date: '2009-11-27', icon: 'info',
      title: ['州长回到凤凰城', 'Governor back in Phoenix'],
      body: ['州长回州后表示授权书"需要进一步审查"，但没有撤回。应急管理局按授权书继续向各县发指令。',
        'Back in Phoenix, the governor says the authorization "needs further review" but does not withdraw it. ADEM keeps issuing directives to counties under it.'],
      opts: [
        { t: ['知道了', 'Noted'], do: { broadcast: { ch: 'gov', name: ['KTAR 92.3 FM · 凤凰城', 'KTAR 92.3 FM · Phoenix'], time: '17:30', t: ['州长办公室：代理期间签署的授权书正在审查。', "Governor's office: the authorization signed during the acting period is under review."] } } }
      ]
    },
    {
      id: 'st-session', date: '2009-12-03', icon: 'law',
      title: ['州议会讨论紧急状态权力法案', 'Legislature takes up emergency powers bill'],
      body: ['参议院议长鲍勃·伯恩斯和众议院议长柯克·亚当斯把一份法案排进议程：代理州长签署的应急授权须在 7 天内由州长本人或委员会追认，否则失效。县监事会协会征集各县决议。',
        'Senate President Bob Burns and House Speaker Kirk Adams put a bill on the calendar: emergency authorizations signed by an acting governor lapse unless the governor or the council ratifies them within 7 days. The County Supervisors Association is collecting board resolutions.'],
      opts: [
        { t: ['监事会决议支持法案', 'Board resolution in favour'], do: { ctl: { gov: 3, sec: 2, adem: -4 }, fed: -3, rel: { gov: 2, sec: 2 } } },
        { t: ['决议反对', 'Resolution against'], do: { ctl: { adem: 3 }, fed: 3, rel: { gov: -2 } } },
        { t: ['不提交', 'No resolution'], do: {} }
      ]
    },
    {
      id: 'st-command', when: { after: '2009-12-08', before: '2009-12-20', min: { adem: 48 } }, icon: 'err',
      title: ['应急管理局要求直接指挥县应急行动中心', 'ADEM moves to command the county EOC'],
      body: ['应急管理局通知：根据授权书，县应急行动中心从下周一起由联络官指挥，县应急管理主任改任副指挥。通知抄送了县监事会和州长办公室。',
        "ADEM notifies the county: under the authorization, its liaison will command the county EOC from next Monday, and the county emergency director becomes deputy. The notice is copied to the board and the governor's office."],
      opts: [
        { t: ['服从', 'Comply'], do: { fed: 6, ctl: { adem: 6 }, trust: -5, flag: 'adem_cmd' } },
        { t: ['向委员会申诉', 'Appeal to the council'], do: { rel: { sec: 3 }, ctl: { sec: 4, adem: -2 }, fed: -4 } },
        { t: ['请州长办公室出面', "Ask the governor's office to step in"], do: { rel: { gov: 3 }, ctl: { gov: 4, adem: -2 }, fed: -4 } }
      ]
    },
    {
      id: 'st-review', when: { after: '2009-12-08', before: '2009-12-20', max: { adem: 47 } }, icon: 'info',
      title: ['委员会开始审查授权书', 'Council opens review of the authorization'],
      body: ['州应急委员会召开特别会议，审查代理州长期间签署的授权书。应急管理局局长到会说明，委员会要求 12 月 22 日前提交书面材料。',
        'The State Emergency Council holds a special session on the authorization signed during the acting period. The ADEM director testifies, and the council wants written material by December 22.'],
      opts: [
        { t: ['提交县里的记录', "Submit the county's records"], do: { rel: { sec: 3 }, ctl: { sec: 3 }, fed: -2 } },
        { t: ['不参与', 'Stay out of it'], do: {} }
      ]
    }
  ],
  mail: [
    {
      id: 'st-m-sitrep', from: 'fed', ref: 'ADEM SEOC 09-1016', date: '2009-10-16', time: '08:10',
      subject: ['每日态势报告：每天 17:00 前报送', 'Daily situation report due 17:00'],
      body: ['州应急行动中心（东麦克道尔路 5636 号）要求各县每天 17:00 前报送态势报告：病例、安置人数、物资天数、外来人员。逾期的县将不列入当周物资分配。',
        'The State EOC at 5636 E McDowell Rd asks each county for a daily report by 17:00: cases, people housed, days of supplies, arrivals. Counties that miss it are left out of that week\'s supply allocation.'],
      acts: [
        { t: ['按时报送', 'Report daily'], do: { fed: 2, ctl: { adem: 1 }, flag: 'sitrep' }, done: ['已安排专人每天报送。', 'Someone now files it daily.'] },
        { t: ['改成每周报一次', 'Report weekly instead'], do: { fed: -2 }, done: ['已回复改为周报。', 'Replied with a weekly schedule.'] }
      ]
    },
    {
      id: 'st-m-ccgov', from: 'gov', ref: 'GO 09-1109',
      subject: ['请抄送应急管理局对县里的所有指令', "Please copy us on all ADEM directives"],
      body: ['州长办公室请各县把应急管理局发给县里的指令抄送一份给州长办公室办公厅主任，以便州长掌握情况。',
        "The governor's office asks each county to copy every ADEM directive it receives to the governor's chief of staff, so the governor stays informed."],
      acts: [
        { t: ['抄送', 'Copy them'], do: { rel: { gov: 3 }, fed: -2, ctl: { gov: 2 }, flag: 'cc_gov' }, done: ['已设置自动抄送。', 'Set up automatic copies.'] },
        { t: ['不回复', 'Do not reply'], do: { rel: { gov: -2 } }, done: ['未回复。', 'No reply sent.'] }
      ]
    },
    {
      id: 'st-m-csa', from: 'nb', sender: ['亚利桑那州县监事会协会', 'County Supervisors Association of Arizona'], date: '2009-11-25', time: '09:40',
      subject: ['各县对代理州长授权书的立场汇总', 'Where counties stand on the acting-governor authorization'],
      body: ['协会汇总了 15 个县监事会的回复：多数县要求等州长回州后再决定，马里科帕县支持统一指挥，皮马县支持委员会临时监管。汇总表已发给参众两院议长。',
        'The association has tallied replies from all 15 boards: most want to wait for the governor, Maricopa backs unified command, and Pima backs council oversight for now. The table has gone to both presiding officers.'],
      attach: true
    }
  ],
  broadcasts: []
});
