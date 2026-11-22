// 内容包：纳瓦霍县 2009 年 11 月（H1N1 疫苗到货晚、温斯洛买菜难、周五橄榄球季后赛）。格式见 docs/CONTENT_GUIDE.md
CONTENT.add({
  id: "nov-2009",
  title: ["十一月：疫苗、买菜和季后赛", "November: vaccine, groceries and playoffs"],
  by: "fna",
  events: [
    {
      id: "nov-vax-week1", date: "2009-11-02", icon: "pkg",
      title: ["本周 H1N1 疫苗：1,400 剂，全是鼻喷", "This week's H1N1 vaccine: 1,400 doses, all nasal spray"],
      body: ["州卫生服务厅给纳瓦霍县的本周配额是 1,400 剂，全部是 MedImmune 的 FluMist 鼻喷减毒活疫苗。注射剂型推迟到 11 月 9 日那一周。鼻喷只能给 2 到 49 岁、没有慢性病、没怀孕的人用。县卫生服务区要在周三前定下给谁。",
        "The Arizona Department of Health Services has allotted Navajo County 1,400 doses this week, all MedImmune FluMist nasal spray. Injectable vaccine slips to the week of Nov 9. The spray is only for healthy people aged 2 to 49 who are not pregnant. The county Public Health Services District has to decide by Wednesday who gets it."],
      opts: [
        { t: ["送进学校，给 2 到 18 岁的学生", "Take it to schools for ages 2 to 18"], do: { trust: 2, fed: 1, flag: "nov_flumist_school" } },
        { t: ["先给医护和急救人员", "Health care and EMS workers first"], do: { fed: 2, trust: -1, flag: "nov_flumist_hcw", broadcast: { ch: "county", name: ["KDJI 1270 AM · 霍尔布鲁克", "KDJI 1270 AM · Holbrook"], time: "07:15", t: ["县卫生服务区：本周鼻喷疫苗只供医护和急救人员，学校接种日期另行通知。", "County Public Health: this week's nasal vaccine goes to health care and EMS workers only. School dates to follow."] } } },
        { t: ["先放着，等注射剂给孕妇", "Hold it and wait for shots for pregnant women"], do: { panic: 2, trust: -2, event: { id: "nov-vax-hold-call", inDays: 2 } } }
      ]
    },
    {
      id: "nov-vax-hold-call", chained: true, icon: "q",
      title: ["鼻喷疫苗还在冰箱里", "The nasal vaccine is still in the fridge"],
      body: ["州卫生服务厅疫苗组打来电话：纳瓦霍县的 1,400 剂 FluMist 一剂没用。11 月 6 日前不开始接种，这批疫苗会改拨给科科尼诺县。",
        "The ADHS vaccine section calls: none of Navajo County's 1,400 FluMist doses has been used. If the county does not start by Nov 6, the lot goes to Coconino County."],
      opts: [
        { t: ["马上送学校", "Send it to schools now"], do: { trust: 1, flag: "nov_flumist_school" } },
        { t: ["给医护人员", "Give it to health care workers"], do: { fed: 1, flag: "nov_flumist_hcw" } },
        { t: ["让给科科尼诺县", "Let Coconino have it"], do: { fed: -3, trust: -3, panic: 2 } }
      ]
    },
    {
      id: "nov-vax-consent", date: "2009-11-04", when: { flags: ["nov_flumist_school"] }, icon: "sheet",
      title: ["同意书收回不到四成", "Fewer than four in ten consent forms back"],
      body: ["学校接种要家长签字。温斯洛联合学区发出 2,300 份同意书，收回 870 份；霍尔布鲁克联合学区收回 52%。接种日定在 11 月 5 日和 6 日。",
        "School clinics need a parent's signature. Winslow Unified sent home 2,300 consent forms and got 870 back; Holbrook Unified is at 52%. Clinic days are Nov 5 and 6."],
      opts: [
        { t: ["照原日期，有表的先打", "Keep the dates, vaccinate whoever has a form"], do: { trust: 1 } },
        { t: ["推迟一周，在 KINO 上提醒家长", "Push back a week and remind parents on KINO"], do: { panic: 1, trust: 2, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "07:40", t: ["温斯洛联合学区：H1N1 鼻喷疫苗同意书 11 月 12 日前交回班主任，接种改到 11 月 13 日。", "Winslow Unified: return H1N1 nasal vaccine consent forms to homeroom teachers by Nov 12. School clinic moves to Nov 13."] } } },
        { t: ["派护士晚上家访收表", "Send nurses out evenings to collect forms"], do: { trust: 3, county: -14 } }
      ]
    },
    {
      id: "nov-vax-ems", date: "2009-11-03", icon: "ppl",
      title: ["急救人员也要排上", "EMS crews want a place in line"],
      body: ["肖洛消防区和温斯洛消防局联名来信：两边共 64 名急救员，上周有 9 人请病假。按联邦优先顺序他们属于第一批，但县里的接种名单上没有他们。",
        "The Show Low Fire District and Winslow Fire Department write jointly: they have 64 EMTs and paramedics between them, and 9 called in sick last week. Federal priority groups put them first, but they are not on the county's list."],
      opts: [
        { t: ["加进名单，本周就打", "Add them and vaccinate this week"], do: { trust: 1, fed: 1 } },
        { t: ["等注射剂到了再说", "Wait for the injectable"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-vax-tamiflu", date: "2009-11-06", icon: "warn",
      title: ["儿童用达菲混悬液断货", "Children's Tamiflu suspension is out"],
      body: ["霍尔布鲁克 Safeway 药房和肖洛的两家药房都没有达菲口服混悬液了，药剂师只能把胶囊拆开自己配。州卫生服务厅说可以从州储备里调 400 疗程，但要县里派车去弗拉格斯塔夫取，11 月 9 日前。",
        "The Safeway pharmacy in Holbrook and two pharmacies in Show Low are out of Tamiflu oral suspension; pharmacists are compounding it from capsules. ADHS can release 400 courses from the state stockpile if the county picks them up in Flagstaff by Nov 9."],
      opts: [
        { t: ["派县卫生服务区的车去取", "Send a Public Health vehicle"], do: { trust: 2, county: -3, flag: "nov_tamiflu_pick", mail: "nov-m-tamiflu-list" } },
        { t: ["请药房自己去取", "Ask the pharmacies to collect it themselves"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-vax-ihs", date: "2009-11-05", icon: "globe",
      title: ["温斯洛印第安医疗中心有了疫苗", "Winslow Indian Health Care Center has vaccine"],
      body: ["温斯洛印第安医疗中心从印第安卫生署拿到 900 剂注射疫苗，只能给登记的原住民患者。中心说，很多患者的配偶和孩子不是原住民，问县里能不能出钱，让它一起打。每剂 $9，加上人工。",
        "The Winslow Indian Health Care Center got 900 injectable doses through the Indian Health Service, for registered Native patients only. Many patients have spouses and children who are not Native. The center asks whether the county will pay so it can vaccinate them too: $9 a dose plus staff time."],
      opts: [
        { t: ["县里出钱，一起打", "County pays; vaccinate the whole household"], do: { navajo: 3, trust: 1, county: -11, flag: "nov_vax_ihs_shared", event: { id: "nov-vax-ihs-bill", inDays: 7 } } },
        { t: ["让非原住民家属去县诊所", "Send non-Native relatives to the county clinic"], do: { navajo: -1 } }
      ]
    },
    {
      id: "nov-vax-kits", date: "2009-11-09", icon: "pkg",
      title: ["注射疫苗到了，针具包没到", "Shots are here, needle kits are not"],
      body: ["McKesson 把 2,000 剂赛诺菲巴斯德多剂量瓶送到了肖洛的县卫生服务区。配套的针具包是另一批货，追踪单号显示还在菲尼克斯的转运站。原定 11 月 10 日开打。",
        "McKesson delivered 2,000 doses of Sanofi Pasteur multi-dose vials to Public Health in Show Low. The ancillary needle kits ship separately; tracking shows them still at a Phoenix hub. Clinics were set to start Nov 10."],
      opts: [
        { t: ["向 Summit 医疗中心借 2,000 支针筒", "Borrow 2,000 syringes from Summit Healthcare"], do: { trust: 1, flag: "nov_vax_kits_borrowed", mail: "nov-m-summit-syringes" } },
        { t: ["从弗拉格斯塔夫的供货商买", "Buy them from a Flagstaff supplier"], do: { county: -6, trust: 1 } },
        { t: ["等针具包", "Wait for the kits"], do: { panic: 1, event: { id: "nov-vax-kits-late", inDays: 3 } } }
      ]
    },
    {
      id: "nov-vax-kits-late", chained: true, icon: "pkg",
      title: ["针具包送到", "Needle kits arrive"],
      body: ["针具包到了肖洛：针筒、针头、酒精棉片都有，利器盒少了一半。接种推迟了三天，已经约好的 340 人要重新通知。",
        "The kits reach Show Low: syringes, needles and alcohol pads, but only half the sharps containers. Clinics are three days late and 340 people with appointments need new times."],
      opts: [
        { t: ["打电话逐个改约", "Call each one to rebook"], do: { trust: 1, county: -2 } },
        { t: ["在电台上统一通知", "Announce new times on the radio"], do: { broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "12:05", t: ["县卫生服务区：原定 11 月 10 日的 H1N1 注射接种改到 11 月 13 日，时间不变。", "County Public Health: H1N1 shots booked for Nov 10 move to Nov 13, same times."] } } }
      ]
    },
    {
      id: "nov-vax-hopi", date: "2009-11-09", icon: "globe",
      title: ["霍皮卫生部门要 300 剂", "Hopi Health asks for 300 doses"],
      body: ["霍皮族卫生服务部主任赫尔曼·霍纳尼来函：在温斯洛和霍尔布鲁克上学、住校外的霍皮学生约 300 人，不在波拉卡霍皮医疗中心的接种范围里。问县里能否在学校一并安排。",
        "Hopi Health Services Director Herman Honanie writes: about 300 Hopi students attend school in Winslow and Holbrook and live off the reservation, outside the Hopi Health Care Center's clinics in Polacca. He asks whether the county can include them at the schools."],
      opts: [
        { t: ["列入学校接种名单", "Put them on the school clinic lists"], do: { navajo: 2, trust: 1 } },
        { t: ["请霍皮医疗中心派车接学生回去打", "Ask the Hopi clinic to bus students back"], do: { navajo: -1 } }
      ]
    },
    {
      id: "nov-vax-seniors", date: "2009-11-10", icon: "ppl",
      title: ["老人中心问季节性流感疫苗", "Senior center asks about seasonal flu shots"],
      body: ["霍尔布鲁克老人中心的负责人打来电话：中心有 41 位老人还没打季节性流感疫苗，县里 10 月中就没货了。65 岁以上不在 H1N1 优先名单里，老人们不明白为什么。",
        "The Holbrook senior center manager calls: 41 regulars still have no seasonal flu shot, and the county ran out in mid-October. People over 65 are not on the H1N1 priority list, and the seniors do not understand why."],
      opts: [
        { t: ["向批发商加订 500 剂季节性疫苗", "Order 500 more seasonal doses from a distributor"], do: { county: -9, trust: 2 } },
        { t: ["派护士去中心讲解优先顺序", "Send a nurse to explain the priority list"], do: { panic: -1 } },
        { t: ["没有办法", "Nothing to be done"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-vax-npc", date: "2009-11-12", icon: "ppl",
      title: ["北地先锋学院护理学生", "Northland Pioneer College nursing students"],
      body: ["北地先锋学院护理专业可以派 22 名二年级学生，在注册护士带领下做肌肉注射，每周两个半天。条件是县里把他们加进亚利桑那县保险池的志愿者保单。",
        "Northland Pioneer College nursing can send 22 second-year students to give injections under RN supervision, two half-days a week. The county must add them to its Arizona Counties Insurance Pool volunteer coverage."],
      opts: [
        { t: ["接受，加进保单", "Accept and add them to the policy"], do: { trust: 2, county: -4, flag: "nov_vax_npc" } },
        { t: ["只让他们做登记和测体温", "Only registration and temperature checks"], do: { trust: 1 } },
        { t: ["谢绝", "Decline"], do: {} }
      ]
    },
    {
      id: "nov-vax-navajo-doh", date: "2009-11-13", icon: "globe",
      title: ["迪尔康联合接种点", "Joint clinic at Dilkon"],
      body: ["纳瓦霍族卫生部执行主任安斯勒姆·罗恩霍斯提议 11 月 19 日在迪尔康分会会所办联合接种：族里给分会居民打，县里给在迪尔康学校和诊所上班的非原住民打。县里出两名护士。",
        "Navajo Division of Health Executive Director Anslem Roanhorse Jr. proposes a joint clinic at the Dilkon Chapter House on Nov 19: the Nation vaccinates chapter members and the county covers non-Native teachers and clinic staff working in Dilkon. The county supplies two nurses."],
      opts: [
        { t: ["同意，派两名护士", "Agree and send two nurses"], do: { navajo: 4, county: -3, event: { id: "nov-vax-dilkon-day", inDays: 6 } } },
        { t: ["人手不够", "Not enough staff"], do: { navajo: -3 } }
      ]
    },
    {
      id: "nov-vax-dilkon-day", chained: true, icon: "info",
      title: ["迪尔康接种日", "Dilkon clinic day"],
      body: ["迪尔康分会会所从早上 8 点排到下午 3 点，打了 612 剂，其中县里打 74 剂。分会主席想在 12 月再办一次，地点换到印第安威尔斯。",
        "The Dilkon Chapter House line ran from 8 am to 3 pm: 612 doses, 74 of them by county nurses. The chapter president wants another one in December at Indian Wells."],
      opts: [
        { t: ["答应 12 月再来", "Agree to December"], do: { navajo: 2, broadcast: { ch: "navajo", name: ["KTNN 660 AM · 窗岩", "KTNN 660 AM · Window Rock"], time: "18:20", t: ["迪尔康分会：今天联合接种 612 人，12 月在印第安威尔斯再办一次。", "Dilkon Chapter: 612 vaccinated at today's joint clinic. Another one at Indian Wells in December."] } } },
        { t: ["到时候再看", "See nearer the time"], do: {} }
      ]
    },
    {
      id: "nov-vax-holbrook-sat", date: "2009-11-14", icon: "warn",
      title: ["霍尔布鲁克周六接种排到停车场", "Saturday clinic line in Holbrook reaches the parking lot"],
      body: ["县政府大楼的周六接种点早上 8 点已有约 900 人排队，疫苗只有 600 剂。县卫生服务区现场负责人用对讲机问怎么办。",
        "By 8 am about 900 people are lined up at the Saturday clinic at the county complex, for 600 doses. The Public Health site lead radios in for instructions."],
      opts: [
        { t: ["发号，没打上的 11 月 21 日凭号优先", "Hand out numbers; the rest come first on Nov 21"], do: { trust: 1, flag: "nov_vax_tickets", event: { id: "nov-vax-ticket-day", inDays: 7 } } },
        { t: ["打完为止，其余的人回家", "Vaccinate until it runs out; send the rest home"], do: { trust: -2, panic: 2 } },
        { t: ["只给孕妇和带小孩的家庭", "Pregnant women and families with small children only"], do: { trust: -1, panic: -1 } }
      ]
    },
    {
      id: "nov-vax-ticket-day", chained: true, icon: "q",
      title: ["号码牌里有复印的", "Some of the numbers are photocopies"],
      body: ["11 月 21 日凭号接种。上周发了 300 个号，今天收回 412 个，有一百多个是复印的。排队的人里有人认出了复印件，开始吵。",
        "Nov 21, numbered-ticket clinic. Staff gave out 300 numbers last week and have now collected 412; more than a hundred are photocopies. People in line have noticed and are arguing."],
      opts: [
        { t: ["只认带县印章的号", "Honour only stamped tickets"], do: { trust: 1, panic: 1 } },
        { t: ["都打，不够的登记下次", "Vaccinate everyone; register the overflow"], do: { trust: 2, panic: -1, county: -5 } },
        { t: ["请警长办公室派人维持秩序", "Ask the Sheriff's Office for a deputy"], do: { panic: -1, trust: -1 } }
      ]
    },
    {
      id: "nov-vax-pregnant", when: { after: "2009-11-09", before: "2009-11-20", chance: 0.3 }, icon: "q",
      title: ["孕妇用的单剂针剂只剩 80 支", "Only 80 single-dose syringes for pregnant women"],
      body: ["小科罗拉多医疗中心产科来电：孕妇优先打不含硫柳汞的单剂预充针，全县只有 80 支，产科登记的孕妇有 230 人。多剂量瓶也可以给孕妇用，但不少人不愿意。",
        "Little Colorado Medical Center obstetrics calls: pregnant women are meant to get thimerosal-free prefilled syringes, and the county has 80. The clinic has 230 pregnant patients registered. Multi-dose vials are approved for pregnancy too, but many women refuse them."],
      opts: [
        { t: ["80 支全给产科，其余人用多剂量瓶", "All 80 to obstetrics; others get multi-dose"], do: { trust: 1 } },
        { t: ["按预产期排，先给晚期孕妇", "Sort by due date; latest pregnancies first"], do: { trust: 2, panic: -1 } },
        { t: ["向州卫生服务厅追加", "Ask ADHS for more"], do: { fed: -1, flag: "nov_pf_asked", mail: "nov-m-pf-request" } }
      ]
    },
    {
      id: "nov-vax-north-share", when: { after: "2009-11-10", before: "2009-11-25", min: { navajo: 35 } }, icon: "law",
      title: ["北部两区说疫苗分少了", "The northern districts say they got too little"],
      body: ["第 1 区监事乔纳森·内兹和第 2 区监事杰西·汤普森在监事会上说：县里已发的 3,400 剂里，只有 11% 进了温斯洛以北和保留地边上的学校。他们要求下一批按学生人数分。",
        "District 1 Supervisor Jonathan Nez and District 2 Supervisor Jesse Thompson tell the Board that of the 3,400 doses given so far, only 11% went to schools north of Winslow and along the reservation line. They want the next lot split by enrollment."],
      opts: [
        { t: ["下一批按学生人数分", "Split the next lot by enrollment"], do: { navajo: 3, trust: 1, lds: -1 } },
        { t: ["维持按诊所排队", "Keep first-come at the clinics"], do: { navajo: -3 } }
      ]
    },
    {
      id: "nov-vax-cold", when: { after: "2009-11-10", before: "2009-11-25", chance: 0.15 }, icon: "err",
      title: ["希伯诊所冰箱断电六小时", "Heber clinic fridge without power for six hours"],
      body: ["希伯县办公点夜里停电，疫苗冰箱的温度记录显示 14°C 持续了约六小时。里面有 300 剂 H1N1 注射疫苗和 60 剂季节性疫苗。",
        "Overnight power loss at the Heber county office: the vaccine fridge logger shows about six hours at 14°C. Inside are 300 doses of H1N1 vaccine and 60 seasonal doses."],
      opts: [
        { t: ["全部报废", "Discard all of it"], do: { trust: -1, fed: 1 } },
        { t: ["隔离存放，打电话问厂家", "Quarantine it and call the manufacturer"], do: { event: { id: "nov-vax-cold-answer", inDays: 1 } } },
        { t: ["照常使用", "Use it as normal"], do: { fed: -3, panic: 1 } }
      ]
    },
    {
      id: "nov-vax-cold-answer", chained: true, icon: "info",
      title: ["厂家回复冰箱事故", "Manufacturer replies on the fridge failure"],
      body: ["赛诺菲巴斯德的技术热线回复：按温度记录，这批 H1N1 疫苗仍在稳定性范围内，可以使用，需在批号上做标记并报州卫生服务厅。季节性疫苗那 60 剂建议报废。",
        "Sanofi Pasteur's technical line replies: based on the logger data the H1N1 lot is within stability limits and can be used, marked and reported to ADHS. They advise discarding the 60 seasonal doses."],
      opts: [
        { t: ["按厂家意见办，加装备用电源", "Follow the advice and add a backup battery"], do: { county: -2, fed: 1 } },
        { t: ["按厂家意见办", "Follow the advice"], do: {} }
      ]
    },
    {
      id: "nov-vax-rumor", when: { after: "2009-11-05", before: "2009-11-28", min: { panic: 30 }, chance: 0.25 }, icon: "mail",
      title: ["邮件里说疫苗有问题", "An email says the vaccine is unsafe"],
      body: ["一封转发了很多次的邮件说 H1N1 疫苗里的硫柳汞会伤孩子，还附了一张假的「卫生部内部通知」。KVWM 的早间谈话节目想请县卫生官员上节目接听众电话。",
        "A much-forwarded email says the thimerosal in H1N1 vaccine harms children and attaches a fake 'internal health department notice'. KVWM's morning talk show wants a county health official on air to take calls."],
      opts: [
        { t: ["派人上节目", "Send someone on the show"], do: { panic: -2, trust: 1, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "08:30", t: ["县卫生服务区做客早间节目：不想用多剂量瓶的家长可以预约单剂针剂，名额有限。", "County Public Health on the morning show: parents who prefer not to use multi-dose vials can book single-dose syringes while they last."] } } },
        { t: ["印一页问答，放在诊所和超市", "Print a one-page Q&A for clinics and stores"], do: { panic: -1, county: -1 } },
        { t: ["不回应", "Do not respond"], do: { panic: 2 } }
      ]
    },
    {
      id: "nov-vax-teachers", date: "2009-11-16", icon: "q",
      title: ["老师问能不能打", "Teachers ask to be vaccinated"],
      body: ["霍尔布鲁克联合学区的老师们联名写信：学校接种只给学生，老师不在优先名单里，除非有慢性病。他们说上周全区有 17 名老师请病假，代课老师不够。",
        "Holbrook Unified teachers send a signed letter: school clinics cover students only, and teachers are not a priority group unless they have a chronic condition. Seventeen teachers called in sick district-wide last week and there are not enough substitutes."],
      opts: [
        { t: ["学校接种时剩下的给老师", "Give teachers whatever is left at school clinics"], do: { trust: 2, fed: -1 } },
        { t: ["按州里的名单来", "Stick to the state list"], do: { fed: 1, trust: -1 } }
      ]
    },
    {
      id: "nov-vax-jail", date: "2009-11-17", icon: "law",
      title: ["县看守所两人发烧", "Two feverish inmates at the county jail"],
      body: ["县看守所（霍尔布鲁克）报告两名在押人员发烧咳嗽，已单独关押。看守长要求给 48 名看守和后勤人员打疫苗，在押人员 186 人。",
        "The county jail in Holbrook reports two inmates with fever and cough, now isolated. The jail commander asks for vaccine for 48 detention and support staff. There are 186 inmates."],
      opts: [
        { t: ["看守和在押人员都打", "Vaccinate staff and inmates"], do: { trust: -1, panic: -1, county: -2 } },
        { t: ["只给看守打", "Staff only"], do: { trust: 1 } },
        { t: ["请县卫生服务区派人隔离检查", "Have Public Health inspect isolation first"], do: {} }
      ]
    },
    {
      id: "nov-vax-big", when: { after: "2009-11-19", before: "2009-11-25", chance: 0.4 }, icon: "pkg",
      title: ["一次到了 5,800 剂", "5,800 doses arrive at once"],
      body: ["州卫生服务厅通知：诺华和 CSL 的注射疫苗共 5,800 剂今天送到肖洛和霍尔布鲁克。这是本县到目前最大的一批，需要在 48 小时内定下大型接种点。",
        "ADHS says 5,800 injectable doses from Novartis and CSL are being delivered to Show Low and Holbrook today. It is the county's biggest lot so far, and a mass clinic site must be named within 48 hours."],
      opts: [
        { t: ["纳瓦霍县集市场地，开车进场接种", "Drive-through at the Navajo County Fairgrounds"], do: { trust: 3, county: -12, flag: "nov_vax_big", event: { id: "nov-vax-big-day", inDays: 2 } } },
        { t: ["分到五个镇的学校体育馆", "Split across five towns' school gyms"], do: { trust: 2, county: -8, flag: "nov_vax_big" } },
        { t: ["继续在县诊所按预约打", "Keep to appointments at county clinics"], do: { panic: 1 } }
      ]
    },
    {
      id: "nov-vax-big-day", chained: true, icon: "info",
      title: ["集市场地接种", "Fairgrounds clinic"],
      body: ["集市场地的车道从早上 7 点排到 77 号公路上。到下午 4 点打了 3,100 剂，护士 26 人，县警长办公室两辆车指挥交通。剩下的疫苗够再开一天。",
        "The fairgrounds lanes backed up onto SR 77 from 7 am. By 4 pm, 26 nurses had given 3,100 doses, with two sheriff's units directing traffic. Enough vaccine is left for one more day."],
      opts: [
        { t: ["再开一天", "Run one more day"], do: { trust: 2, county: -6, broadcast: { ch: "county", name: ["KZUA 92.1 FM · 霍尔布鲁克", "KZUA 92.1 FM · Holbrook"], time: "16:45", t: ["县卫生服务区：集市场地开车接种再开一天，7 点到 16 点，从 77 号公路南口进场。", "County Public Health: the fairgrounds drive-through runs one more day, 7 am to 4 pm. Enter from the SR 77 south gate."] } } },
        { t: ["剩下的送去温斯洛", "Send the rest to Winslow"], do: { trust: 1, navajo: 1 } }
      ]
    },
    {
      id: "nov-vax-walkin", when: { after: "2009-11-05", before: "2009-11-30", min: { cases: 80 } }, icon: "warn",
      title: ["急诊室挤满来问疫苗的人", "ER crowded with people asking about vaccine"],
      body: ["小科罗拉多医疗中心说，这周急诊室每天多出 40 多个没症状、只是来问疫苗的人，真正发烧的病人要等三个小时。院长问县里能不能在北地先锋学院小科罗拉多校区停车场搭一个临时诊所。",
        "Little Colorado Medical Center says 40-plus people a day with no symptoms are coming to the ER just to ask about vaccine, and feverish patients wait three hours. The administrator asks whether the county can put a temporary clinic in the parking lot of NPC's Little Colorado campus."],
      opts: [
        { t: ["联邦资金建模块化诊所", "Build a modular clinic with federal money"], do: { fed: 2, trust: 2, build: { b: "clinic", ll: [-110.6858, 35.0218], name: ["北地先锋学院温斯洛临时诊所", "NPC Winslow temporary clinic"], fund: "fed", eta: 4 } } },
        { t: ["在急诊室门口放一名分诊护士", "Put a triage nurse at the ER door"], do: { county: -5, trust: 1 } },
        { t: ["请医院自己想办法", "Leave it to the hospital"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-vax-absent", when: { after: "2009-11-02", before: "2009-11-20", min: { cases: 60 } }, icon: "sheet",
      title: ["斯诺弗莱克学区缺勤 14%", "Snowflake Unified absences at 14%"],
      body: ["斯诺弗莱克联合学区督学报告：本周学生缺勤率 14%，三所学校超过 10% 的州报告线。他问县里是否建议停课，学区更想照常上课、加强消毒。",
        "The Snowflake Unified superintendent reports 14% student absence this week, with three schools above the state's 10% reporting line. He asks whether the county recommends closing; the district would rather stay open and step up cleaning."],
      opts: [
        { t: ["照常上课，县里送消毒用品", "Stay open; county sends cleaning supplies"], do: { lds: 2, trust: 1, county: -4 } },
        { t: ["建议感恩节前停课", "Recommend closing until Thanksgiving"], do: { lds: -2, panic: -1, trust: -1 } }
      ]
    },
    {
      id: "nov-vax-vaers", when: { after: "2009-11-13", before: "2009-11-28", chance: 0.2 }, icon: "q",
      title: ["接种后晕倒，报社来问", "Fainting after a shot; the paper calls"],
      body: ["一名 16 岁学生在肖洛接种点打完针几分钟后晕倒，救护车送 Summit 医疗中心，半小时后出院。《白山独立报》记者打电话来问，县里有没有上报疫苗不良反应。",
        "A 16-year-old fainted minutes after a shot at the Show Low clinic, went to Summit Healthcare by ambulance and was released half an hour later. A White Mountain Independent reporter asks whether the county filed an adverse event report."],
      opts: [
        { t: ["已报 VAERS，如实告诉记者", "File with VAERS and tell the reporter"], do: { trust: 1, panic: 1 } },
        { t: ["请家长同意后再回应", "Respond only with the family's consent"], do: {} },
        { t: ["无可奉告", "No comment"], do: { trust: -2, panic: 1 } }
      ]
    },
    {
      id: "nov-vax-pre-holiday", date: "2009-11-23", icon: "sheet",
      title: ["感恩节前最后一次接种", "Last clinics before Thanksgiving"],
      body: ["县卫生服务区排班表：11 月 24 日、25 日两天开诊需要 18 名护士加班，加班费约 $16K。27 日（星期五）如果开，还要再找 6 人。",
        "Public Health's roster: clinics on Nov 24 and 25 need 18 nurses on overtime, about $16K. Opening on Friday the 27th would need six more."],
      opts: [
        { t: ["24、25、27 日都开", "Open on the 24th, 25th and 27th"], do: { county: -22, trust: 3 } },
        { t: ["只开 24、25 日", "Only the 24th and 25th"], do: { county: -16, trust: 1 } },
        { t: ["感恩节那一周不开", "Close Thanksgiving week"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-vax-second", date: "2009-11-25", when: { flags: ["nov_flumist_school"] }, icon: "info",
      title: ["十岁以下要打第二剂", "Children under ten need a second dose"],
      body: ["11 月初在学校打过鼻喷的孩子里，有 1,060 个不满十岁，按要求要隔四周再打一剂，最早是 12 月 3 日。学校 11 月 26、27 日放假。",
        "Of the children who got nasal vaccine at school in early November, 1,060 are under ten and need a second dose four weeks later, from Dec 3 at the earliest. Schools are closed Nov 26 and 27."],
      opts: [
        { t: ["12 月 3 日起在学校打第二剂", "School clinics for second doses from Dec 3"], do: { trust: 2, county: -6 } },
        { t: ["发通知让家长自己去诊所", "Send notes telling parents to visit a clinic"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-groc-walmart", date: "2009-11-02", icon: "ppl",
      title: ["温斯洛只剩一家大超市", "Winslow is down to one supermarket"],
      body: ["温斯洛镇长罗宾·博伊德来电：北帕克大道的 Bashas' 10 月 10 日关门以后，全镇整周采购只能去 Walmart。周六结账排 40 分钟，蔬菜中午就卖完。她问县里能不能每周二、周五开一趟去霍尔布鲁克 Safeway 的班车，单程 33 英里。",
        "Winslow Mayor Robin Boyd calls: since the Bashas' on North Park Drive closed on Oct 10, the whole town does its weekly shopping at Walmart. Saturday checkout lines run 40 minutes and produce is gone by noon. She asks for a county van to the Holbrook Safeway every Tuesday and Friday, 33 miles each way."],
      opts: [
        { t: ["开班车，11 月先试一个月", "Run the van; try it for November"], do: { trust: 3, county: -18, flag: "nov_shuttle", event: { id: "nov-groc-shuttle-wk1", inDays: 5 }, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "07:10", t: ["县购物班车每周二、周五 8:30 从温斯洛市政厅出发去霍尔布鲁克 Safeway，13:00 返回，免费，请提前一天打电话订座。", "County shopping van to the Holbrook Safeway every Tuesday and Friday: leaves Winslow City Hall 8:30, returns 13:00. Free; book a seat the day before."] } } },
        { t: ["请霍尔布鲁克 Safeway 往温斯洛送货", "Ask the Holbrook Safeway to deliver to Winslow"], do: { trust: 1, flag: "nov_ask_safeway", mail: "nov-m-safeway-reply" } },
        { t: ["这是市里的事", "That is the city's business"], do: { trust: -3 } }
      ]
    },
    {
      id: "nov-groc-shuttle-wk1", chained: true, icon: "sheet",
      title: ["班车第一周", "First week of the van"],
      body: ["县车队报告：周二那趟 15 座全满，还有 11 人没订上；周五只来了 4 个人。司机说回程车上的东西太多，有两位老人买了三周的量。",
        "Fleet reports: Tuesday's 15 seats were full with 11 turned away; Friday had 4 riders. The driver says the return trip is packed with groceries; two seniors bought three weeks' worth."],
      opts: [
        { t: ["周二改成两辆车，周五取消", "Two vans Tuesday, cancel Friday"], do: { trust: 2, county: -4 } },
        { t: ["加一趟周六", "Add a Saturday run"], do: { trust: 2, county: -6, event: { id: "nov-groc-shuttle-sat", inDays: 4 } } },
        { t: ["保持原样", "Leave it as is"], do: {} }
      ]
    },
    {
      id: "nov-groc-shuttle-sat", chained: true, icon: "q",
      title: ["周六班车：司机不够", "Saturday van: not enough drivers"],
      body: ["县车队只有一名持商业驾照的司机愿意周六加班。温斯洛的圣约瑟夫天主教堂说可以派两名有驾照的教友当志愿司机，用县里的车。",
        "Only one fleet driver with a commercial licence will work Saturdays. St. Joseph Catholic Church in Winslow offers two licensed parishioners as volunteer drivers using the county van."],
      opts: [
        { t: ["接受志愿司机，县里出保险", "Accept the volunteers; county covers insurance"], do: { trust: 2, county: -2 } },
        { t: ["周六只开一趟", "Run one Saturday trip only"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-groc-nacog", date: "2009-11-03", icon: "ppl",
      title: ["送餐上门的老人多了", "More seniors on home-delivered meals"],
      body: ["北亚利桑那政府委员会（NACOG）老龄事务处说，温斯洛送餐上门从每天 85 份涨到 130 份，多出来的大多是以前自己去 Bashas' 买菜的老人。到 12 月底缺 $22K。",
        "The NACOG Area Agency on Aging says home-delivered meals in Winslow have gone from 85 to 130 a day, mostly seniors who used to walk to Bashas'. It is $22K short through the end of December."],
      opts: [
        { t: ["县里补 $22K", "County covers the $22K"], do: { trust: 3, county: -22, flag: "nov_nacog" } },
        { t: ["补一半，请温斯洛支联会出另一半", "Pay half; ask the Winslow stake for the rest"], do: { trust: 1, lds: 2, county: -11, flag: "nov_nacog" } },
        { t: ["请他们排候补名单", "Ask them to keep a waiting list"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-groc-chapters", date: "2009-11-05", icon: "globe",
      title: ["伯德斯普林斯和托拉尼湖分会", "Birdsprings and Tolani Lake chapters"],
      body: ["伯德斯普林斯分会和托拉尼湖分会的干事来县里：族人以前在温斯洛 Bashas' 买菜，现在要开到弗拉格斯塔夫，来回 140 多英里。他们想每周六在温斯洛办一个集市，族里的人卖羊肉、蓝玉米面和柴火，也在这里买东西。",
        "Officials from the Birdsprings and Tolani Lake chapters come to the county: members used to shop at Bashas' in Winslow and now drive to Flagstaff, over 140 miles round trip. They want a Saturday market in Winslow where Navajo vendors can sell mutton, blue corn meal and firewood, and shop at the same time."],
      opts: [
        { t: ["支持，帮他们向市里申请场地", "Back it and help them get a site from the city"], do: { navajo: 4, trust: 1, flag: "nov_market_sat", event: { id: "nov-groc-market-day1", inDays: 9 } } },
        { t: ["请他们直接找市政府", "Refer them to the city"], do: { navajo: -1 } }
      ]
    },
    {
      id: "nov-groc-market-day1", chained: true, icon: "info",
      title: ["温斯洛第一个周六集市", "Winslow's first Saturday market"],
      body: ["集市设在温斯洛市政厅旁的空地，来了 23 个摊位。县卫生服务区检查员到场，说没检疫章的生羊肉不能卖，熟食要有食品处理证。",
        "The market sets up on the lot beside Winslow City Hall with 23 stalls. A Public Health inspector says raw mutton without an inspection stamp cannot be sold and cooked food needs a food handler card."],
      opts: [
        { t: ["当场给熟食摊办临时证", "Issue temporary cards to food stalls on the spot"], do: { navajo: 2, trust: 1, county: -1, broadcast: { ch: "navajo", name: ["KTNN 660 AM · 窗岩", "KTNN 660 AM · Window Rock"], time: "06:45", t: ["温斯洛周六集市每周六 9 点到 14 点，在市政厅旁，卖熟食要带食品处理证，县卫生服务区现场可办。", "Winslow Saturday market, 9 am to 2 pm beside City Hall. Food sellers need a food handler card; County Public Health issues them on site."] } } },
        { t: ["按规定办，生羊肉不能卖", "Go by the rules: no uninspected mutton"], do: { navajo: -1, event: { id: "nov-groc-mutton", inDays: 3 } } }
      ]
    },
    {
      id: "nov-groc-mutton", chained: true, icon: "law",
      title: ["羊肉怎么卖", "How to sell mutton"],
      body: ["伯德斯普林斯分会干事提出：族人可以把羊送到霍尔布鲁克的屠宰场，盖章后再拿去集市卖，每只收 $35 屠宰费。他们问县里能不能先垫付 11 月的费用，约 120 只。",
        "The Birdsprings chapter official proposes taking sheep to a licensed slaughterhouse in Holbrook so the meat is stamped, at $35 a head. He asks whether the county will front November's cost, about 120 head."],
      opts: [
        { t: ["垫付 $4K，从摊位费里扣回", "Front $4K, recovered from stall fees"], do: { navajo: 3, county: -4 } },
        { t: ["不垫付", "No advance"], do: { navajo: -2 } }
      ]
    },
    {
      id: "nov-groc-bashas-building", date: "2009-11-06", icon: "build",
      title: ["原 Bashas' 店面可以短租", "The old Bashas' building is available short term"],
      body: ["温斯洛市行政长官吉姆·弗格森转来业主的意见：北帕克大道 1500 号的租约还在 Bashas' 破产程序里，业主愿意先按月短租给县里做食品发放点，每月 $9K，县里自己上保险。",
        "Winslow City Manager Jim Ferguson passes on the landlord's offer: the lease at 1500 N Park Drive is still tied up in the Bashas' bankruptcy, but the owner will rent it month to month to the county as a food distribution site for $9K a month if the county carries the insurance."],
      opts: [
        { t: ["租三个月，做食品发放点", "Rent it for three months as a food site"], do: { trust: 3, county: -27, flag: "nov_bashas_pantry", event: { id: "nov-groc-pantry-open", inDays: 5 } } },
        { t: ["租一个月看看", "Rent one month to see"], do: { trust: 1, county: -9, flag: "nov_bashas_pantry", event: { id: "nov-groc-pantry-open", inDays: 5 } } },
        { t: ["不租", "Decline"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-groc-pantry-open", chained: true, icon: "pkg",
      title: ["食品发放点第一天", "Food site, first day"],
      body: ["北帕克大道发放点上午 9 点开门，到中午登记了 610 户。圣玛丽食品银行联盟从凤凰城来的货车还没到，架子上只有县仓库的罐头和面粉。",
        "The North Park Drive site opened at 9 am and registered 610 households by noon. The St. Mary's Food Bank Alliance truck from Phoenix has not arrived; the shelves hold only canned goods and flour from the county warehouse."],
      opts: [
        { t: ["每户限一箱，其余的登记后再来", "One box per household; register the rest to come back"], do: { trust: 1, panic: -1, event: { id: "nov-groc-pantry-wk2", inDays: 7 } } },
        { t: ["从县仓库再调五天的货", "Pull five more days from the county reserve"], do: { trust: 3, flag: "nov_pantry_reserve", mail: "nov-m-stmarys-truck", event: { id: "nov-groc-pantry-wk2", inDays: 7 } } },
        { t: ["暂停，等货车到了再开", "Pause until the truck arrives"], do: { trust: -2, panic: 1 } }
      ]
    },
    {
      id: "nov-groc-lds-winslow", date: "2009-11-08", icon: "ppl",
      title: ["温斯洛支联会可以每周四发放", "Winslow stake offers Thursday distribution"],
      body: ["温斯洛支联会会长来电：支联会中心停车场每周四下午可以发放主教仓库的物资，教友和非教友都给。他请县里在 KINO 上帮忙通知，并派一名警员维持车流。",
        "The Winslow Arizona Stake president calls: the stake center parking lot can hand out bishops' storehouse goods every Thursday afternoon, to members and non-members alike. He asks the county to announce it on KINO and send a deputy for traffic."],
      opts: [
        { t: ["接受，帮忙通知和派警员", "Accept; announce it and send a deputy"], do: { lds: 4, trust: 2, broadcast: { ch: "lds", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "12:15", t: ["温斯洛支联会每周四 15 点到 18 点在支联会中心发放食品，所有家庭都可以来，不需要证件。", "The Winslow stake hands out food every Thursday 3 to 6 pm at the stake center. All families welcome, no ID needed."] } } },
        { t: ["接受，但不派警员", "Accept, no deputy"], do: { lds: 2 } }
      ]
    },
    {
      id: "nov-groc-wic", date: "2009-11-09", icon: "sheet",
      title: ["WIC 支票在温斯洛只能去 Walmart", "WIC checks only work at Walmart in Winslow"],
      body: ["县卫生服务区 WIC 办公室说：温斯洛约 640 户领 WIC，Bashas' 关门后镇上只剩 Walmart 是授权商店。这两周合同配方奶粉断了两次。WIC 想把这些家庭的支票改成霍尔布鲁克也能用，但要州里批。",
        "The county WIC office says about 640 Winslow households are on WIC, and with Bashas' closed Walmart is the only authorized store in town. The contract infant formula has run out twice in two weeks. WIC wants their checks to work in Holbrook too, which needs state approval."],
      opts: [
        { t: ["县里出函支持，请州卫生服务厅批", "Send a county letter asking ADHS to approve"], do: { trust: 2, fed: -1, event: { id: "nov-groc-wic-follow", inDays: 5 } } },
        { t: ["请 Walmart 加大配方奶粉订货", "Ask Walmart to order more formula"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-groc-tefap", date: "2009-11-10", icon: "pkg",
      title: ["联邦紧急食品援助物资", "TEFAP commodities"],
      body: ["亚利桑那食品银行协会通知：联邦紧急食品援助计划（TEFAP）给纳瓦霍县的 11 月物资 14 托盘，已送到霍尔布鲁克。县里要指定温斯洛的发放点，并按收入登记领取人。",
        "The Association of Arizona Food Banks says Navajo County's November TEFAP allotment, 14 pallets, is in Holbrook. The county has to name a Winslow distribution site and register recipients by income."],
      opts: [
        { t: ["放到温斯洛市政厅，每周一、三发", "Send it to Winslow City Hall, hand out Mondays and Wednesdays"], do: { trust: 2, fed: 1 } },
        { t: ["放到温斯洛老人中心", "Send it to the Winslow senior center"], do: { trust: 1, fed: 1 } },
        { t: ["全留在霍尔布鲁克发", "Hand it all out in Holbrook"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-groc-hopi-market", date: "2009-11-12", icon: "globe",
      title: ["霍皮农户想在温斯洛卖东西", "Hopi growers want to sell in Winslow"],
      body: ["第二台地的几户霍皮农户托人带话：今年秋收的蓝玉米、南瓜、晒干的桃子想拿到温斯洛卖，温斯洛人以前就买他们的东西。他们问在哪里摆、要不要证。",
        "Several Hopi farm families from Second Mesa send word: they want to sell this fall's blue corn, squash and dried peaches in Winslow, where people have long bought from them. They ask where to set up and what permits they need."],
      opts: [
        { t: ["在县温斯洛办公楼前给他们划摊位，免费", "Mark out free stalls in front of the county's Winslow building"], do: { navajo: 2, trust: 1 } },
        { t: ["告诉他们去市政府办临时摊贩证", "Tell them to get a vendor permit from the city"], do: {} }
      ]
    },
    {
      id: "nov-groc-pharmacy", date: "2009-11-16", icon: "warn",
      title: ["Walmart 药房排两小时", "Two-hour wait at the Walmart pharmacy"],
      body: ["温斯洛 Walmart 药房现在承接全镇的处方，取药要等两小时，慢性病人的药常常断一两天。小科罗拉多医疗中心院长问县里能不能在医院大厅设一个代取点，由县卫生服务区的护士每天去药房集中取一次。",
        "The Walmart pharmacy now fills almost every prescription in Winslow and the wait is two hours; patients on chronic medication often go a day or two without. The Little Colorado Medical Center administrator suggests a pickup desk in the hospital lobby, with a Public Health nurse collecting from the pharmacy once a day."],
      opts: [
        { t: ["设代取点，县里派人", "Set up the pickup desk with county staff"], do: { trust: 2, county: -5 } },
        { t: ["请药房延长营业时间", "Ask the pharmacy to extend hours"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-groc-snap", date: "2009-11-17", icon: "sheet",
      title: ["温斯洛 DES 办公室排长队", "Long lines at the Winslow DES office"],
      body: ["州经济安全厅（DES）温斯洛办公室说，11 月营养援助（食品券）申请比 9 月多了 38%，大厅坐不下。他们问能不能借用县温斯洛办公楼的会议室，每周三天，做面谈。",
        "The Department of Economic Security office in Winslow says November applications for Nutrition Assistance are up 38% on September and the lobby cannot hold everyone. They ask to borrow a meeting room in the county's Winslow building three days a week for interviews."],
      opts: [
        { t: ["借给他们", "Lend the room"], do: { trust: 2, fed: 1 } },
        { t: ["会议室要留给应急用", "The room is kept for emergencies"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-groc-shuttle-full", when: { after: "2009-11-09", before: "2009-11-30", flags: ["nov_shuttle"], min: { panic: 30 } }, icon: "ppl",
      title: ["班车订不上座", "No seats left on the van"],
      body: ["县车队调度说班车订座电话从早上 7 点就打不进，排不上的人直接到市政厅门口等。周二那趟有人为座位吵起来。",
        "Fleet dispatch says the booking line is jammed from 7 am, and people who cannot get through wait outside City Hall. There was an argument over seats on Tuesday's run."],
      opts: [
        { t: ["租一辆校车，每趟 40 座", "Rent a school bus: 40 seats a trip"], do: { trust: 2, county: -9 } },
        { t: ["先给 60 岁以上和带小孩的", "Seniors over 60 and parents with children first"], do: { trust: 1, panic: -1 } }
      ]
    },
    {
      id: "nov-groc-stock-low", when: { after: "2009-11-03", before: "2009-11-30", max: { stock: 12 } }, icon: "err",
      title: ["Walmart 配送中心延误", "Walmart distribution center delays"],
      body: ["温斯洛 Walmart 店长打来电话：凤凰城那边的配送这周两次没按时到，干货架空了一半。他问县仓库能不能先拿出一些米、豆子和罐头，由店里按进价卖，货到后补回。",
        "The Winslow Walmart store manager calls: deliveries from the Phoenix side missed two slots this week and half the dry goods shelves are empty. He asks whether the county warehouse can release rice, beans and canned goods for the store to sell at cost, to be replaced when trucks arrive."],
      opts: [
        { t: ["借出三天的储备", "Lend three days of reserve"], do: { trust: 2, panic: -2 } },
        { t: ["只借给发放点，不借给商店", "Lend only to the food sites, not the store"], do: { trust: 1 } },
        { t: ["储备不能动", "The reserve stays put"], do: { panic: 2 } }
      ]
    },
    {
      id: "nov-groc-prices", when: { after: "2009-11-05", before: "2009-11-28", min: { panic: 35 }, chance: 0.2 }, icon: "mail",
      title: ["牛奶一加仑 4.29 美元", "Milk at $4.29 a gallon"],
      body: ["县行政长官办公室这周接到 27 个投诉电话，说温斯洛加油站便利店的牛奶卖到一加仑 $4.29，鸡蛋一打 $3.19。县里管不了价格，来电的人要县里「做点什么」。",
        "The County Manager's office logged 27 calls this week about Winslow gas-station stores charging $4.29 for a gallon of milk and $3.19 a dozen for eggs. The county has no say over prices, but callers want it to 'do something'."],
      opts: [
        { t: ["每周在 KINO 上公布各店价格", "Read out store prices on KINO each week"], do: { trust: 1, panic: -1, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "17:20", t: ["本周价格：Walmart 牛奶一加仑 $2.78，鸡蛋一打 $1.62；霍尔布鲁克 Safeway 牛奶 $2.99。", "This week's prices: Walmart milk $2.78 a gallon, eggs $1.62 a dozen; Holbrook Safeway milk $2.99."] } } },
        { t: ["把投诉转给州检察长办公室消费者保护处", "Forward the complaints to the Attorney General's consumer protection unit"], do: { trust: 1 } },
        { t: ["回复：县里不管价格", "Reply that the county does not set prices"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-groc-grocer", when: { after: "2009-11-15", before: "2009-11-30", chance: 0.25 }, icon: "bank",
      title: ["有杂货商来看店面", "A grocer looks at the building"],
      body: ["盖洛普一家独立杂货商来温斯洛看了北帕克大道 1500 号。他说如果县里能把这处地块明年的财产税评估重新核一下，并帮他找冷库电工，他可以考虑春天开店。",
        "An independent grocer from Gallup toured 1500 N Park Drive. He says he would consider opening in the spring if the county reviews next year's property assessment on the parcel and helps him find refrigeration electricians."],
      opts: [
        { t: ["请县评估官办公室和他谈", "Have the Assessor's office meet him"], do: { trust: 2 } },
        { t: ["请市政府出面", "Leave it to the city"], do: {} }
      ]
    },
    {
      id: "nov-groc-turkeys", date: "2009-11-20", icon: "pkg",
      title: ["感恩节火鸡", "Thanksgiving turkeys"],
      body: ["温斯洛狮子会和温斯洛支联会凑了 300 只冷冻火鸡，想在 11 月 24 日（星期二）发给登记过的家庭。他们问县里能不能借霍尔布鲁克县仓库的冷库存放三天。",
        "The Winslow Lions Club and the Winslow stake have pooled 300 frozen turkeys to give to registered families on Tuesday, Nov 24. They ask to keep them in the county warehouse freezer in Holbrook for three days."],
      opts: [
        { t: ["借冷库，县车送到温斯洛", "Lend the freezer and truck them to Winslow"], do: { trust: 2, lds: 2, county: -1 } },
        { t: ["借冷库，让他们自己运", "Lend the freezer; they handle transport"], do: { lds: 1 } }
      ]
    },
    {
      id: "nov-groc-laposada", date: "2009-11-18", icon: "ppl",
      title: ["拉波萨达酒店的感恩节晚餐", "Thanksgiving dinner from La Posada"],
      body: ["拉波萨达酒店的艾伦·阿费尔特来信：Turquoise Room 餐厅感恩节当天可以多做 150 份晚餐，给送餐上门名单上的老人。他请县里出车和司机，在 11 月 26 日 11 点到 13 点之间送完。",
        "Allan Affeldt of La Posada writes: the Turquoise Room can cook 150 extra Thanksgiving dinners for seniors on the home-delivered meal list. He asks the county to provide vehicles and drivers to deliver them between 11 am and 1 pm on Nov 26."],
      opts: [
        { t: ["出两辆车和四名司机", "Provide two vehicles and four drivers"], do: { trust: 3, county: -2 } },
        { t: ["请 NACOG 的送餐司机去送", "Ask NACOG's meal drivers"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-groc-pre-holiday", date: "2009-11-25", when: { flags: ["nov_shuttle"] }, icon: "info",
      title: ["感恩节前一天", "The day before Thanksgiving"],
      body: ["Walmart 说 11 月 25 日（星期三）预计是全年人最多的一天，店里会开全部 12 个收银台。县车队问班车要不要加开。",
        "Walmart expects Wednesday, Nov 25 to be its busiest day of the year and will open all 12 registers. Fleet asks whether to add van runs."],
      opts: [
        { t: ["班车加两趟", "Add two van runs"], do: { trust: 2, county: -2 } },
        { t: ["不加", "No extra runs"], do: {} }
      ]
    },
    {
      id: "nov-groc-snow-i40", when: { after: "2009-11-15", before: "2009-11-30", chance: 0.12 }, icon: "warn",
      title: ["I-40 弗拉格斯塔夫段下雪封路", "Snow closes I-40 near Flagstaff"],
      body: ["州交通厅（ADOT）通知：I-40 弗拉格斯塔夫到双箭头之间因降雪封闭，预计 10 小时。从西边来的货车都停在弗拉格斯塔夫，温斯洛今晚的配送到不了。",
        "ADOT reports I-40 closed by snow between Flagstaff and Twin Arrows, for an estimated ten hours. Westbound freight is holding in Flagstaff and tonight's deliveries to Winslow will not arrive."],
      opts: [
        { t: ["发放点延长到晚上 8 点", "Keep the food sites open until 8 pm"], do: { trust: 1, county: -2 } },
        { t: ["在 KINO 上通知", "Announce it on KINO"], do: { panic: -1, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "15:30", t: ["ADOT：I-40 弗拉格斯塔夫以东封闭，Walmart 今晚的货明早到。", "ADOT: I-40 closed east of Flagstaff. Walmart's delivery will arrive tomorrow morning instead of tonight."] } } }
      ]
    },
    {
      id: "nov-groc-seniors-car", when: { after: "2009-11-04", before: "2009-11-26", notFlags: ["nov_nacog"], chance: 0.2 }, icon: "ppl",
      title: ["独居老人几天没买菜", "A senior living alone has not shopped in days"],
      body: ["温斯洛警察局把一个电话转到县里：东第三街一位 82 岁的老人家里只剩饼干，她以前走路去 Bashas'，Walmart 太远走不到。邻居说这条街上还有几户这样的。",
        "Winslow police pass a call to the county: an 82-year-old woman on East Third Street has nothing left but crackers. She used to walk to Bashas', and Walmart is too far. Neighbours say several others on the street are in the same position."],
      opts: [
        { t: ["派县社区服务人员逐户登记", "Send county community services door to door"], do: { trust: 2, county: -3 } },
        { t: ["转给 NACOG 送餐", "Refer them to NACOG meals"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-groc-milk-truck", when: { after: "2009-11-04", before: "2009-11-21", chance: 0.18 }, icon: "pkg",
      title: ["奶制品配送少了一天", "One fewer dairy delivery day"],
      body: ["给温斯洛小店送奶的配送公司通知：从 11 月 16 日起每周少送一天，改为周一、周四。三家便利店和老人中心问县仓库能不能在中间几天调一些奶粉和保质奶。",
        "The dairy distributor serving Winslow's small stores will drop a delivery day from Nov 16, keeping Mondays and Thursdays. Three convenience stores and the senior center ask whether the county warehouse can supply powdered and shelf-stable milk in between."],
      opts: [
        { t: ["给老人中心调，不给商店", "Supply the senior center, not the stores"], do: { trust: 1 } },
        { t: ["都调，按成本价", "Supply both at cost"], do: { trust: 2, county: -1 } }
      ]
    },
    {
      id: "nov-groc-hopi-reply", when: { after: "2009-11-13", before: "2009-11-30", flags: ["nov_market_sat"], chance: 0.3 }, icon: "info",
      title: ["霍皮农户来了", "The Hopi growers come"],
      body: ["四户霍皮农户开着皮卡来了周六集市，带来蓝玉米、干桃子和葫芦。两个小时卖完。他们问以后每周能不能留两个摊位。",
        "Four Hopi families drove pickups to the Saturday market with blue corn, dried peaches and gourds and sold out in two hours. They ask for two stalls every week from now on."],
      opts: [
        { t: ["留两个摊位", "Hold two stalls"], do: { navajo: 1, trust: 1, broadcast: { ch: "nb", name: ["KUYI 88.1 FM · 霍特维拉", "KUYI 88.1 FM · Hotevilla"], time: "07:00", t: ["温斯洛周六集市给霍皮农户留了两个摊位，9 点前到市政厅旁。", "The Winslow Saturday market is holding two stalls for Hopi growers. Be beside City Hall before 9 am."] } } },
        { t: ["先到先得", "First come, first served"], do: {} }
      ]
    },
    {
      id: "nov-day-dst", date: "2009-11-01", icon: "info",
      title: ["纳瓦霍族回到冬令时", "Navajo Nation goes off daylight time"],
      body: ["今天凌晨 2 点纳瓦霍族结束夏令时，和亚利桑那州其他地方用同一个时间，到明年 3 月。霍皮族一直没改。凯恩塔驻点和县应急行动中心之前约在「县里时间 9 点」的晨会，从今天起不用再换算。",
        "At 2 am today the Navajo Nation came off daylight saving time and is on the same clock as the rest of Arizona until March. The Hopi never changed. The Kayenta post and the county EOC no longer need to convert their '9 am county time' morning call."],
      opts: [
        { t: ["知道了", "Noted"], do: { broadcast: { ch: "navajo", name: ["KTNN 660 AM · 窗岩", "KTNN 660 AM · Window Rock"], time: "06:00", t: ["今天起纳瓦霍族和亚利桑那州时间一致。族政府办公时间不变。", "From today the Navajo Nation and Arizona share the same time. Tribal office hours are unchanged."] } } }
      ]
    },
    {
      id: "nov-day-petrified", date: "2009-11-03", icon: "globe",
      title: ["石化林国家公园游客少了一半", "Petrified Forest visitors down by half"],
      body: ["石化林国家公园园长克利夫·斯潘塞来信：10 月游客比去年少了 52%，霍尔布鲁克的汽车旅馆入住也跟着少。公园想和县里一起在 I-40 第 311 出口立一块牌子，写明公园照常开放、几点关门。",
        "Petrified Forest National Park Superintendent Cliff Spencer writes: October visits were down 52% from last year, and Holbrook's motels are feeling it. The park wants to put up a sign with the county at I-40 Exit 311 saying the park is open, with closing times."],
      opts: [
        { t: ["县公共工程处出牌子", "County Public Works makes the sign"], do: { trust: 1, fed: 1, county: -2 } },
        { t: ["请公园自己做", "Let the park do it"], do: {} }
      ]
    },
    {
      id: "nov-day-hopi-primary", date: "2009-11-04", icon: "law",
      title: ["霍皮族初选", "Hopi primary election"],
      body: ["霍皮族今天初选主席和副主席。选举委员会请县里在 87 号公路和 264 号公路交叉口那一段多派一辆巡逻车，下午有几个村子的投票点要把票箱送到基科茨莫维。",
        "The Hopi Tribe holds its primary for chairman and vice chairman today. The election board asks for an extra county patrol on SR 87 near the SR 264 junction this afternoon, when several villages send ballot boxes to Kykotsmovi."],
      opts: [
        { t: ["派一辆巡逻车", "Send a patrol unit"], do: { navajo: 2 } },
        { t: ["那段路归公共安全部，转给他们", "That stretch is DPS's; pass it on"], do: {} }
      ]
    },
    {
      id: "nov-day-pinetop-lights", date: "2009-11-05", icon: "build",
      title: ["派恩托普-莱克赛德的节日灯", "Holiday lights in Pinetop-Lakeside"],
      body: ["派恩托普-莱克赛德镇议会今晚通过了今年的节日灯方案。镇长卢克·史密斯问县公共工程处能不能借一辆高空作业车，11 月 21 日、22 日两天，沿白山大道挂灯。",
        "The Pinetop-Lakeside town council approved this year's holiday lights tonight. Mayor Luke Smith asks to borrow a county bucket truck on Nov 21 and 22 to hang lights along White Mountain Boulevard."],
      opts: [
        { t: ["借车，带一名操作员", "Lend the truck with an operator"], do: { trust: 2, county: -1 } },
        { t: ["只借车", "Truck only"], do: { trust: 1 } },
        { t: ["车要留着应急", "The truck stays on standby"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-day-wigwam", date: "2009-11-07", icon: "ppl",
      title: ["汽车旅馆按月出租", "Motels renting by the month"],
      body: ["霍尔布鲁克 66 号公路上几家汽车旅馆开始按月出租房间给从凤凰城北上的家庭，每月 $600 左右。县财务处提醒：住满 30 天就不算旅客，县里收不到这部分床位税。",
        "Several Route 66 motels in Holbrook are renting rooms by the month to families who came north from Phoenix, at about $600 a month. County Finance notes that stays over 30 days are no longer transient, so the county loses the bed tax on them."],
      opts: [
        { t: ["把这些房间计入安置名单，县里补贴一半", "Count the rooms as housing; county pays half"], do: { trust: 2, county: -30 } },
        { t: ["不管，按规定来", "Leave it; the rules are the rules"], do: { county: -4 } }
      ]
    },
    {
      id: "nov-day-mill", date: "2009-11-09", icon: "bank",
      title: ["斯诺弗莱克纸厂复工", "Snowflake mill restarts"],
      body: ["Catalyst Paper 斯诺弗莱克纸厂总经理约翰·麦基通知：停了两周的生产线今天复工，大部分工人回来上班。厂里问县卫生服务区能不能在厂门口设一个上岗前测温点，第一周每天早晚两班。",
        "Catalyst Paper's Snowflake mill general manager John McKee says the line idled for two weeks restarts today and most workers are back. The mill asks Public Health for a temperature station at the gate for shift changes, morning and evening, for the first week."],
      opts: [
        { t: ["派人，第一周", "Send staff for the first week"], do: { trust: 2, lds: 1, county: -3, event: { id: "nov-day-mill-staff", inDays: 4 } } },
        { t: ["给他们测温枪，厂里自己测", "Lend thermometers; the mill does it"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-day-mill-staff", chained: true, icon: "sheet",
      title: ["纸厂测温四天", "Four days at the mill gate"],
      body: ["四天测了 1,180 人次，有 5 人发烧被劝回家。厂里的人事经理说，复工后还缺 31 人没回来，有的去了约瑟夫城的电厂打短工。",
        "Four days, 1,180 checks, five people with fevers sent home. The mill's HR manager says 31 workers have not come back since the restart; some took short-term jobs at the Joseph City power plant."],
      opts: [
        { t: ["再测一周", "Another week"], do: { trust: 1, county: -2 } },
        { t: ["交给厂里", "Hand it to the mill"], do: {} }
      ]
    },
    {
      id: "nov-day-cholla", date: "2009-11-10", icon: "build",
      title: ["乔拉电厂检修", "Cholla plant outage"],
      body: ["亚利桑那公共服务公司（APS）乔拉电厂通知：3 号机组 11 月 16 日起计划检修三周，外地承包商约 220 人要住进约瑟夫城、霍尔布鲁克和温斯洛。电厂问县里对承包商有没有入县检查的要求。",
        "APS's Cholla Power Plant says Unit 3 goes down for a planned three-week outage from Nov 16, bringing about 220 outside contractors to stay in Joseph City, Holbrook and Winslow. The plant asks whether the county requires any screening for them."],
      opts: [
        { t: ["到达当天在电厂门口测温登记", "Screen and register them at the plant gate on arrival"], do: { trust: 1, panic: -1, event: { id: "nov-day-cholla-rooms", inDays: 6 } } },
        { t: ["不需要", "No requirement"], do: { panic: 1, event: { id: "nov-day-cholla-rooms", inDays: 6 } } }
      ]
    },
    {
      id: "nov-day-cholla-rooms", chained: true, icon: "ppl",
      title: ["承包商订走了房间", "Contractors take the rooms"],
      body: ["承包商住进来后，霍尔布鲁克按月出租的汽车旅馆房间几乎没了，有 14 户从凤凰城来的家庭被通知 11 月底前搬走。县社区服务协调员问怎么安排。",
        "With the contractors in, Holbrook's monthly motel rooms are nearly gone, and 14 families from Phoenix have been told to leave by the end of November. The county community services coordinator asks what to do."],
      opts: [
        { t: ["安排进西霍皮大道拖车点", "Move them to the W Hopi Dr trailer site"], do: { trust: 2 } },
        { t: ["请电厂给承包商另找住处", "Ask the plant to find contractors other lodging"], do: { trust: 1, flag: "nov_aps_ask", mail: "nov-m-aps-lodging" } }
      ]
    },
    {
      id: "nov-day-veterans", date: "2009-11-11", icon: "info",
      title: ["退伍军人节", "Veterans Day"],
      body: ["今天是州法定假日，县政府大楼关门。霍尔布鲁克的退伍军人组织想照常在老县法院前办 11 点的纪念仪式，大约 150 人，其中不少是七八十岁的老兵。",
        "It is a state holiday and the county complex is closed. Holbrook's veterans' groups want to hold their usual 11 am ceremony in front of the old county courthouse, about 150 people, many of them veterans in their seventies and eighties."],
      opts: [
        { t: ["照常办，县里送椅子和口罩", "Go ahead; county brings chairs and masks"], do: { trust: 3, county: -1 } },
        { t: ["照常办", "Go ahead"], do: { trust: 2 } },
        { t: ["建议改成电台播出", "Suggest doing it on the radio instead"], do: { trust: -3, panic: -1 } }
      ]
    },
    {
      id: "nov-day-elk", date: "2009-11-13", icon: "globe",
      title: ["秋季狩猎季", "Fall hunts"],
      body: ["州狩猎渔业厅平托普地区办公室说，11 月下旬到 12 月初的麋鹿和鹿的狩猎，本县几个猎区约有 1,900 张许可证，多数持证人从凤凰城和图森来。他们问猎人进县要不要过检查点。",
        "The Arizona Game and Fish regional office in Pinetop says late November and early December elk and deer hunts in the county's units carry about 1,900 tags, mostly held by people from Phoenix and Tucson. They ask whether hunters must go through checkpoints."],
      opts: [
        { t: ["猎人和其他人一样过检查点", "Hunters go through checkpoints like everyone else"], do: { panic: -1, trust: -1, event: { id: "nov-day-elk-meat", inDays: 9 } } },
        { t: ["持许可证的放行", "Tag holders pass through"], do: { trust: 1, panic: 1, event: { id: "nov-day-elk-meat", inDays: 9 } } }
      ]
    },
    {
      id: "nov-day-elk-meat", chained: true, icon: "pkg",
      title: ["猎人想捐鹿肉", "Hunters want to donate meat"],
      body: ["希伯一家野味加工店说，有些从外地来的猎人打到了麋鹿不想全带回去，愿意把肉捐出来。加工店可以按州规定切割冷冻，问县里的食品发放点收不收。",
        "A game processor in Heber says some out-of-town hunters do not want to haul all their elk home and will donate the meat. The shop can cut and freeze it to state rules and asks whether the county food sites will take it."],
      opts: [
        { t: ["收，加工费县里出", "Yes, county pays processing"], do: { trust: 2, county: -3 } },
        { t: ["收，加工费请猎人出", "Yes, if hunters pay processing"], do: { trust: 1 } },
        { t: ["野味不进发放点", "No game meat at food sites"], do: {} }
      ]
    },
    {
      id: "nov-day-library", date: "2009-11-14", icon: "info",
      title: ["霍尔布鲁克图书馆周六", "Holbrook library on Saturday"],
      body: ["霍尔布鲁克公共图书馆说周六上午的电脑用的人多了一倍，大多是来找工作、填食品券申请、给凤凰城的亲戚发邮件的。图书馆问县里能不能把周六开放延长到下午 4 点，每周多出 $300 的人工。",
        "The Holbrook Public Library says Saturday morning computer use has doubled, mostly people job hunting, filing food assistance applications and emailing relatives in Phoenix. The library asks to stay open until 4 pm on Saturdays, about $300 a week more in staff."],
      opts: [
        { t: ["延长到 4 点", "Stay open until 4"], do: { trust: 2, county: -1 } },
        { t: ["维持现状", "Keep current hours"], do: {} }
      ]
    },
    {
      id: "nov-day-jury", date: "2009-11-16", icon: "law",
      title: ["陪审员不来", "Jurors not showing up"],
      body: ["县高等法院书记官说，本周刑事案件的陪审员候选人发了 120 张传票，只来了 41 人，很多人说怕在法院里传染。首席法官问县里能不能在法院入口测温，并让陪审员间隔坐。",
        "The Superior Court clerk says 120 jury summonses went out for this week's criminal trial and 41 people came; many say they are afraid of catching something at the courthouse. The presiding judge asks the county for temperature checks at the door and spaced seating."],
      opts: [
        { t: ["派人在入口测温", "Staff the entrance with temperature checks"], do: { trust: 1, county: -1 } },
        { t: ["法院自己安排", "The court arranges it"], do: {} }
      ]
    },
    {
      id: "nov-day-npc-reg", date: "2009-11-17", icon: "sheet",
      title: ["学院春季注册", "College spring registration"],
      body: ["北地先锋学院春季学期注册开始，从凤凰城北上的人里有 260 人来问课。学院说州外学费和县外学费的规定卡住了一部分人，问县里能不能出一份「本县居民」的临时证明。",
        "Northland Pioneer College has opened spring registration, and 260 people who came north from Phoenix have asked about classes. The college says the out-of-district tuition rules block some of them and asks whether the county can issue a temporary proof of county residency."],
      opts: [
        { t: ["县记录官办公室出临时证明", "The Recorder's office issues temporary proof"], do: { trust: 2 } },
        { t: ["按现有规定办", "Keep to the existing rules"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-day-kirkpatrick", date: "2009-11-19", icon: "mail",
      title: ["众议员办公室要数据", "The congresswoman's office wants numbers"],
      body: ["联邦众议员安·柯克帕特里克的弗拉格斯塔夫办公室打来电话：她想在国会提温斯洛买菜难的问题，需要县里给一份简短材料，写明 Bashas' 关门后的人口、距离和领食品援助的户数，11 月 20 日中午前。",
        "Rep. Ann Kirkpatrick's Flagstaff office calls: she wants to raise Winslow's grocery problem in Congress and needs a short county brief on population, distances and households on food assistance since Bashas' closed, by noon on Nov 20."],
      opts: [
        { t: ["连夜写好发过去", "Write it tonight and send it"], do: { fed: 3, trust: 1, flag: "nov_brief_sent", mail: "nov-m-kirkpatrick-thanks" } },
        { t: ["时间太紧，回复 11 月 27 日前给", "Too tight; offer it by Nov 27"], do: { fed: -1 } }
      ]
    },
    {
      id: "nov-day-referendum", date: "2009-11-20", icon: "law",
      title: ["纳瓦霍族公投要借投票隔板", "Navajo referendum needs voting booths"],
      body: ["纳瓦霍选举管理处来函：12 月 15 日关于把族议会从 88 席减到 24 席的公投，本县境内的 17 个分会投票点缺 20 个投票隔板，问县选举部门能否借用。",
        "The Navajo Election Administration writes: for the Dec 15 referendum on cutting the Navajo Nation Council from 88 seats to 24, polling places at the 17 chapters in the county are short 20 voting booths. They ask to borrow them from the county elections department."],
      opts: [
        { t: ["借 20 个", "Lend 20"], do: { navajo: 3, event: { id: "nov-day-booths-ask", inDays: 1 } } },
        { t: ["借 10 个", "Lend 10"], do: { navajo: 1, flag: "nov_day_booths" } },
        { t: ["县里的隔板不外借", "County booths are not lent out"], do: { navajo: -2 } }
      ]
    },
    {
      id: "nov-day-church", date: "2009-11-22", icon: "ppl",
      title: ["联合感恩节礼拜", "Joint Thanksgiving service"],
      body: ["霍尔布鲁克几个教会每年在感恩节前的周日晚上办联合礼拜。今年他们想在霍尔布鲁克高中体育馆办，因为教堂坐不下新来的家庭。学区要县里同意。",
        "Holbrook's churches hold a joint service every year on the Sunday evening before Thanksgiving. This year they want the Holbrook High gym, because the churches cannot fit the new families. The district wants the county's sign-off."],
      opts: [
        { t: ["同意", "Agree"], do: { trust: 2, lds: 1 } },
        { t: ["同意，限 400 人", "Agree, capped at 400"], do: { trust: 1, panic: -1 } }
      ]
    },
    {
      id: "nov-day-dps-holiday", date: "2009-11-24", icon: "law",
      title: ["感恩节 I-40 车流", "Thanksgiving traffic on I-40"],
      body: ["公共安全部第 3 区通知：感恩节周末 I-40 从流星陨石坑到新墨西哥州界会加派巡逻。他们问县里各检查点这几天能不能开放到晚上 10 点，免得车排到主线上。",
        "DPS District 3 says it will add patrols on I-40 from Meteor Crater to the New Mexico line over Thanksgiving weekend. It asks whether the county checkpoints can stay open until 10 pm so traffic does not back onto the interstate."],
      opts: [
        { t: ["开到 10 点", "Stay open until 10"], do: { fed: 2, county: -4 } },
        { t: ["照常 6 点关", "Close at 6 as usual"], do: { fed: -1, panic: 1 } }
      ]
    },
    {
      id: "nov-day-budget", date: "2009-11-24", icon: "bank",
      title: ["州分享收入又少了", "State-shared revenue falls again"],
      body: ["县财务主任报告：11 月收到的州分享营业税比去年同期少 14%，高速公路用户收入少 9%。照这样，到 6 月一般基金缺口约 $1.1M。她建议从 12 月起冻结空缺职位。",
        "The county finance director reports that November's state-shared sales tax is 14% below last year and highway user revenue is down 9%. At this rate the general fund will be about $1.1M short by June. She recommends freezing vacant positions from December."],
      opts: [
        { t: ["冻结空缺职位", "Freeze vacant positions"], do: { county: 40, trust: -1 } },
        { t: ["先不动，等 1 月数据", "Wait for January's figures"], do: {} }
      ]
    },
    {
      id: "nov-day-thanksgiving", date: "2009-11-26", icon: "info",
      title: ["感恩节值班", "Thanksgiving duty"],
      body: ["县应急行动中心感恩节需要 9 人值班。助理县行政长官达斯蒂·帕森斯问：是按平时排班发假日双薪，还是只留 4 人、其余人在家待命。",
        "The county EOC needs nine people on Thanksgiving Day. Assistant County Manager Dusty Parsons asks whether to staff it normally with holiday double pay, or keep four on site and the rest on call at home."],
      opts: [
        { t: ["9 人照常，发双薪", "Nine on site, double pay"], do: { county: -6, panic: -1 } },
        { t: ["4 人在岗，其余待命", "Four on site, the rest on call"], do: { county: -2, trust: 1 } }
      ]
    },
    {
      id: "nov-day-blackfriday", date: "2009-11-27", icon: "ppl",
      title: ["黑色星期五", "Black Friday"],
      body: ["肖洛 Walmart 早上 5 点开门，门口凌晨 3 点就有人排队。肖洛警察局说人手够，但问县里能不能把德斯俱乐部大道路口的检查点推迟到 9 点再开，以免堵到停车场。",
        "The Show Low Walmart opens at 5 am, with people lining up from 3. Show Low police say they have enough officers, but ask the county to open the Deuce of Clubs checkpoint at 9 instead of 6 so traffic does not back up into the parking lot."],
      opts: [
        { t: ["推迟到 9 点", "Open at 9"], do: { trust: 2, panic: 1 } },
        { t: ["照常 6 点", "Open at 6 as usual"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-day-snow", when: { after: "2009-11-12", before: "2009-11-30", chance: 0.15 }, icon: "warn",
      title: ["莫戈隆边缘第一场雪", "First snow on the Rim"],
      body: ["国家气象局弗拉格斯塔夫办公室发布冬季天气提醒：今晚到明早，肖洛以南、希伯和派恩托普一带 4 到 8 英寸雪。县公共工程处主任霍梅罗·维拉说县道除雪要两班倒，问是否批加班。",
        "The National Weather Service in Flagstaff has a winter weather advisory: 4 to 8 inches tonight into tomorrow south of Show Low, around Heber and Pinetop. Public Works Director Homero Vela says county roads need two plow shifts and asks for overtime approval."],
      opts: [
        { t: ["批加班，两班倒", "Approve overtime for two shifts"], do: { trust: 2, county: -9, event: { id: "nov-day-snow-after", inDays: 1 } } },
        { t: ["先保主干道，支路等雪停", "Main roads first, side roads after it stops"], do: { trust: -1, county: -3, event: { id: "nov-day-snow-after", inDays: 1 } } }
      ]
    },
    {
      id: "nov-day-snow-after", chained: true, icon: "info",
      title: ["雪后", "After the snow"],
      body: ["雪停了，希伯-奥弗加德下了 7 英寸。林登有两条县道还没推开，一辆送丙烷的车进不去。260 号公路州交通厅已经推通。",
        "The snow has stopped: seven inches in Heber-Overgaard. Two county roads in Linden are still unplowed and a propane truck cannot get in. ADOT has SR 260 open."],
      opts: [
        { t: ["先推林登那两条", "Do the two Linden roads first"], do: { trust: 2, county: -1, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "09:15", t: ["县公共工程处：林登两条县道上午 11 点前推通，丙烷车下午送。", "County Public Works: the two Linden county roads will be plowed by 11 am. Propane deliveries this afternoon."] } } },
        { t: ["按原来的顺序推", "Keep the usual order"], do: {} }
      ]
    },
    {
      id: "nov-day-sunrise", when: { after: "2009-11-20", before: "2009-11-30", chance: 0.25 }, icon: "globe",
      title: ["日出滑雪场想开门", "Sunrise Park wants to open"],
      body: ["白山阿帕奇族经营的日出公园滑雪场说，山上积雪够了，想在感恩节周末开放部分雪道。族里问县里：从凤凰城来的滑雪客经过肖洛的检查点时，能不能给持滑雪场预订单的人走快速道。",
        "Sunrise Park Resort, run by the White Mountain Apache Tribe, has enough snow to open some runs over Thanksgiving weekend. The tribe asks whether skiers from Phoenix with resort bookings can use a fast lane at the Show Low checkpoint."],
      opts: [
        { t: ["给快速道", "Give them a fast lane"], do: { trust: 1, panic: 1 } },
        { t: ["和其他人一样排队", "They queue like everyone else"], do: { panic: -1 } }
      ]
    },
    {
      id: "nov-day-navopache", when: { after: "2009-11-15", before: "2009-11-30", min: { unhoused: 150 } }, icon: "bank",
      title: ["电力合作社问冬季停电", "The co-op asks about winter shutoffs"],
      body: ["Navopache 电力合作社说，欠费户比去年多了三成，很多是新搬来的。合作社冬季原则上不断电，但要县里把这些家庭转给低收入家庭能源援助（LIHEAP）。县社区服务处说申请表要一周才能处理完。",
        "Navopache Electric Cooperative says accounts in arrears are up 30% on last year, many of them newcomers. The co-op avoids winter shutoffs but wants the county to refer these households to LIHEAP. County community services says applications take a week to process."],
      opts: [
        { t: ["加派两人处理 LIHEAP 申请", "Add two staff to LIHEAP intake"], do: { trust: 2, county: -4 } },
        { t: ["照常处理", "Process as normal"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-day-propane", when: { after: "2009-11-18", before: "2009-11-30", chance: 0.2 }, icon: "warn",
      title: ["丙烷涨价", "Propane prices up"],
      body: ["希伯和林登的丙烷供应商这周把价格提了 12%，说从凤凰城来的槽车少了。几户人家打电话说只剩一成罐。",
        "Propane suppliers in Heber and Linden raised prices 12% this week, saying fewer tankers are coming from Phoenix. Several households call to say their tanks are at 10%."],
      opts: [
        { t: ["给一成罐以下的家庭补一次", "Pay one fill for homes below 10%"], do: { trust: 2, county: -8 } },
        { t: ["转给 LIHEAP", "Refer them to LIHEAP"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-day-firewood", when: { after: "2009-11-08", before: "2009-11-30", chance: 0.2 }, icon: "build",
      title: ["国家森林的柴火许可证", "Firewood permits in the national forest"],
      body: ["阿帕奇-锡特格里夫斯国家森林黑台地林区（奥弗加德）说，今年来办个人柴火许可证的人是往年的两倍，很多人以前烧丙烷。林区问县里能不能派人帮忙在周六办证。",
        "The Black Mesa Ranger District of the Apache-Sitgreaves National Forests in Overgaard says twice the usual number of people are buying personal firewood permits, many of them switching from propane. The district asks for county help selling permits on Saturdays."],
      opts: [
        { t: ["派两人帮忙", "Send two people"], do: { trust: 1, fed: 2 } },
        { t: ["人手不够", "No staff to spare"], do: {} }
      ]
    },
    {
      id: "nov-day-arrivals-rest", when: { after: "2009-11-03", before: "2009-11-30", min: { unhoused: 250 } }, icon: "ppl",
      title: ["出口旁停了一夜的车", "Cars parked overnight by the exit"],
      body: ["州交通厅说 I-40 约瑟夫城第 277 出口旁的州道路用地上昨晚停了 36 辆私家车，大多是从凤凰城上来、还没排上安置的家庭。那里不许过夜，ADOT 问县里怎么安排。",
        "ADOT says 36 cars spent last night on state right-of-way by I-40 Exit 277 at Joseph City, mostly families from Phoenix still waiting for housing. Overnight parking is not allowed there, and ADOT asks what the county wants to do."],
      opts: [
        { t: ["让他们去县集市场地停，开放厕所", "Send them to the county fairgrounds and open the restrooms"], do: { trust: 2, county: -3, event: { id: "nov-day-fairgrounds-cars", inDays: 3 } } },
        { t: ["请 ADOT 按规定办", "Let ADOT enforce its rules"], do: { trust: -2, panic: 1 } }
      ]
    },
    {
      id: "nov-day-fairgrounds-cars", chained: true, icon: "q",
      title: ["集市场地上的车越来越多", "More cars at the fairgrounds"],
      body: ["三天后集市场地停了 71 辆车。霍尔布鲁克几个教会每天晚上送一顿饭。集市场地管理员说水电账单一周大概 $1,800，月底的集市活动也要用场地。",
        "Three days later there are 71 cars at the fairgrounds. Holbrook churches bring a meal every evening. The fairgrounds manager puts water and power at about $1,800 a week, and the site is booked for an event at the end of the month."],
      opts: [
        { t: ["改建一栋展馆做收容所", "Convert an exhibit hall into a shelter"], do: { trust: 2, build: { b: "shelter", ll: [-110.1568, 34.8873], name: ["集市场地展馆收容所", "Fairgrounds exhibit hall shelter"], fund: "county", eta: 2 } } },
        { t: ["月底前继续，之后再说", "Keep it going until the end of the month"], do: { trust: 1, county: -2 } }
      ]
    },
    {
      id: "nov-day-enroll", when: { after: "2009-11-02", before: "2009-11-30", min: { arrivals: 1500 } }, icon: "sheet",
      title: ["新来的学生", "New students"],
      body: ["霍尔布鲁克联合学区说，10 月以来新入学了 184 名从凤凰城来的学生，二年级一个班已有 31 人。学区要等明年的州拨款才能按人数拿钱，问县里能不能先垫两名老师到 6 月的工资，约 $46K。",
        "Holbrook Unified has enrolled 184 students from Phoenix since October, and one second-grade class is at 31. State funding will not follow the students until next year, and the district asks the county to front two teachers' salaries through June, about $46K."],
      opts: [
        { t: ["垫付", "Front the money"], do: { trust: 3, county: -46 } },
        { t: ["垫一名", "Fund one teacher"], do: { trust: 1, county: -23 } },
        { t: ["县里没有这笔钱", "The county does not have it"], do: { trust: -2 } }
      ]
    },
    {
      id: "nov-day-amtrak", when: { after: "2009-11-04", before: "2009-11-30", min: { arrivals: 1400 }, chance: 0.2 }, icon: "info",
      title: ["西南酋长号在温斯洛下了很多人", "Many get off the Southwest Chief in Winslow"],
      body: ["美铁西南酋长号 4 次车今早在温斯洛站下了 47 名乘客，平时只有几个人。站务员说他们多半是从洛杉矶来、要去霍尔布鲁克或肖洛找亲戚。站里没有出租车。",
        "Amtrak's eastbound Southwest Chief, No. 4, let off 47 passengers in Winslow this morning; usually it is a handful. The station agent says most came from Los Angeles to join family in Holbrook or Show Low. There are no taxis at the station."],
      opts: [
        { t: ["派县车接驳", "Send county vans"], do: { trust: 2, county: -1 } },
        { t: ["请拉波萨达酒店先让他们在大堂等", "Ask La Posada to let them wait in the lobby"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-day-booths", when: { after: "2009-11-21", before: "2009-11-30", flags: ["nov_day_booths"] }, icon: "info",
      title: ["投票隔板送到", "Booths delivered"],
      body: ["县选举部门把投票隔板送到了迪尔康和凯恩塔，纳瓦霍选举管理处签了借条，12 月 18 日前还。",
        "The elections department delivered the booths to Dilkon and Kayenta. The Navajo Election Administration signed for them, due back by Dec 18."],
      opts: [
        { t: ["知道了", "Noted"], do: { navajo: 1 } }
      ]
    },
    {
      id: "nov-day-holbrook-parade", date: "2009-11-18", icon: "law",
      title: ["霍尔布鲁克圣诞游行", "Holbrook Christmas parade"],
      body: ["霍尔布鲁克商会申请 12 月 5 日晚上的圣诞灯光游行许可，路线沿纳瓦霍大道，往年有 30 多辆彩车。商会问县警长办公室能不能和镇警察局一起封路两小时。",
        "The Holbrook Chamber of Commerce applies for the Dec 5 evening Christmas light parade along Navajo Boulevard; it usually has more than 30 floats. The chamber asks for sheriff's deputies to help town police close the road for two hours."],
      opts: [
        { t: ["批准，派警员", "Approve and send deputies"], do: { trust: 2 } },
        { t: ["批准，但彩车减半", "Approve with half the floats"], do: { trust: 1, panic: -1 } }
      ]
    },
    {
      id: "nov-day-joseph-water", when: { after: "2009-11-06", before: "2009-11-28", chance: 0.1 }, icon: "err",
      title: ["约瑟夫城水管爆裂", "Water main break in Joseph City"],
      body: ["约瑟夫城的供水公司报告：主管道夜里冻裂，镇上约 400 户停水，预计修 18 小时。约瑟夫城学校问今天要不要停课。",
        "Joseph City's water company reports the main split in the overnight freeze and about 400 homes are without water; repairs will take 18 hours. Joseph City schools ask whether to close today."],
      opts: [
        { t: ["停课一天，县里送瓶装水", "Close schools for the day; county brings bottled water"], do: { trust: 2, county: -2 } },
        { t: ["学校自己决定", "Schools decide"], do: {} }
      ]
    },
    {
      id: "nov-day-power-wind", when: { after: "2009-11-08", before: "2009-11-30", chance: 0.1 }, icon: "warn",
      title: ["大风刮断线路", "Wind takes down a line"],
      body: ["Navopache 电力合作社说大风刮断了莱克赛德一条线路，约 2,100 户停电，恢复要六到八小时。西霍皮大道拖车点不受影响，但派恩托普的老人中心在停电范围内。",
        "Navopache Electric says high wind brought down a line in Lakeside, cutting power to about 2,100 customers for six to eight hours. The W Hopi Dr trailer site is unaffected, but the Pinetop senior center is in the outage."],
      opts: [
        { t: ["给老人中心送一台发电机", "Send a generator to the senior center"], do: { trust: 2, county: -1 } },
        { t: ["等合作社修好", "Wait for the co-op"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-day-hunter-check", when: { after: "2009-11-20", before: "2009-11-30", min: { panic: 40 } }, icon: "law",
      title: ["猎人在检查点起争执", "Hunters argue at a checkpoint"],
      body: ["希伯以南 260 号公路检查点报告：一辆载着四名猎人的皮卡拒绝测温，说「我们有州里的许可证」。车上有上膛的步枪。检查点值班副警长问怎么办。",
        "The SR 260 checkpoint south of Heber reports a pickup with four hunters refusing a temperature check, saying they have state tags. There are loaded rifles in the truck. The deputy on duty asks for instructions."],
      opts: [
        { t: ["让他们靠边，等狩猎渔业厅的执法员到", "Pull them over and wait for a Game and Fish officer"], do: { trust: 1, panic: -1 } },
        { t: ["放行，记下车牌", "Let them through and note the plate"], do: { trust: -1, panic: 1 } }
      ]
    },
    {
      id: "nov-day-kayenta-roads", date: "2009-11-12", icon: "build",
      title: ["凯恩塔镇区的路", "Kayenta Township roads"],
      body: ["凯恩塔镇区委员会来信：11 月 16 日县警长副手驻点以后，巡逻车要走 163 号公路以东几条土路，雨后泥泞。委员会问县公共工程处能不能借平地机，镇区出司机和油。",
        "The Kayenta Township board writes: once sheriff's deputies are stationed there from Nov 16, patrol cars will use several dirt roads east of US 163 that turn to mud after rain. The board asks to borrow a county grader; the township supplies the operator and fuel."],
      opts: [
        { t: ["借，两周", "Lend it for two weeks"], do: { navajo: 3, county: -1 } },
        { t: ["县里的设备不出保留地以外", "County equipment does not go onto the reservation"], do: { navajo: -2 } }
      ]
    },
    {
      id: "nov-day-booths-ask", chained: true, icon: "sheet",
      title: ["投票隔板清单", "Booth list"],
      body: ["县选举部门清点了库房：能借出的隔板 20 个，有 6 个缺脚，需要买零件，约 $300。纳瓦霍选举管理处说 12 月 10 日前要送到迪尔康和凯恩塔。",
        "The elections department counted its stock: 20 booths can go out, six of them missing legs that will cost about $300 to fix. The Navajo Election Administration needs them at Dilkon and Kayenta by Dec 10."],
      opts: [
        { t: ["修好，11 月底前送到", "Fix them and deliver by the end of November"], do: { navajo: 1, county: -1, flag: "nov_day_booths" } },
        { t: ["只送能用的 14 个", "Send the 14 that work"], do: { flag: "nov_day_booths" } }
      ]
    },
    {
      id: "nov-day-snowflake-temple", date: "2009-11-21", icon: "ppl",
      title: ["斯诺弗莱克圣殿的周六", "Saturday at the Snowflake temple"],
      body: ["斯诺弗莱克支联会说，斯诺弗莱克圣殿周六的预约从阿帕奇县和新墨西哥西部来的人多了，停车场不够，车停到了峡谷道上。支联会问县里能不能在峡谷道那一段画临时停车线。",
        "The Snowflake stake says Saturday temple appointments have grown with members coming from Apache County and western New Mexico, and cars are spilling onto Canyon Drive. The stake asks the county to paint temporary parking lines on that stretch."],
      opts: [
        { t: ["县公共工程处去画线", "Public Works paints the lines"], do: { lds: 3, county: -1 } },
        { t: ["那是镇道，请斯诺弗莱克镇处理", "It's a town street; refer to Snowflake"], do: { lds: -1 } }
      ]
    },
    {
      id: "nov-day-wmat-casino", date: "2009-11-25", icon: "globe",
      title: ["红达赌场的感恩节自助餐", "Hon-Dah's Thanksgiving buffet"],
      body: ["白山阿帕奇族主席罗尼·卢普的办公室来电：红达度假赌场感恩节自助餐预订了 900 人，很多从肖洛和莱克赛德来。族里问县里在 260 号公路和 73 号公路交叉口那几天能不能加一辆巡逻车，查酒驾。",
        "White Mountain Apache Chairman Ronnie Lupe's office calls: Hon-Dah Resort Casino has 900 booked for its Thanksgiving buffet, many from Show Low and Lakeside. The tribe asks for an extra county patrol at the SR 260 and SR 73 junction those days for DUI enforcement."],
      opts: [
        { t: ["加派一辆", "Add a unit"], do: { trust: 1, county: -1 } },
        { t: ["请公共安全部负责", "Ask DPS to cover it"], do: {} }
      ]
    },
    {
      id: "nov-day-referendum-ask", when: { after: "2009-11-20", before: "2009-11-28", notFlags: ["nov_day_booths"], chance: 0.5 }, icon: "mail",
      title: ["选举管理处再来问", "The election office asks again"],
      body: ["纳瓦霍选举管理处打电话来确认投票隔板的事，说如果县里能借，他们 12 月 1 日来霍尔布鲁克取。",
        "The Navajo Election Administration calls to follow up on the booths. If the county can lend them, they will collect in Holbrook on Dec 1."],
      opts: [
        { t: ["让选举部门清点", "Have elections count what is available"], do: { event: { id: "nov-day-booths-ask", inDays: 1 } } },
        { t: ["没有可借的", "None available"], do: { navajo: -1 } }
      ]
    },
    {
      id: "nov-fb-bracket", date: "2009-11-02", icon: "q",
      title: ["3A 季后赛对阵出来了", "The 3A playoff bracket is out"],
      body: ["亚利桑那校际体育协会（AIA）公布 3A 季后赛对阵。11 月 6 日（星期五）第一轮，本县的蓝岭（莱克赛德）和肖洛主场，温斯洛作为 3A 北区冠军也是主场。AIA 说观众规定由各县定，周三前回复。",
        "The Arizona Interscholastic Association has posted the 3A playoff bracket. First round is Friday, Nov 6: Blue Ridge (Lakeside) and Show Low play at home, and Winslow, the 3A North champion, also hosts. AIA says crowd rules are up to each county; reply by Wednesday."],
      opts: [
        { t: ["照常开放，入场测体温", "Open as usual with temperature checks"], do: { trust: 4, fed: -2, flag: "nov_fb_open" } },
        { t: ["每场限 1,200 人，只卖主队票", "Cap each game at 1,200, home tickets only"], do: { trust: 1, panic: -1, flag: "nov_fb_cap" } },
        { t: ["不卖票，电台直播", "No tickets, radio only"], do: { trust: -3, panic: -2, fed: 2, flag: "nov_fb_radio" } }
      ]
    },
    {
      id: "nov-fb-buses", date: "2009-11-04", icon: "warn",
      title: ["肖洛学区缺校车司机", "Show Low Unified is short of bus drivers"],
      body: ["肖洛联合学区交通主管说，周五客场去蓝岭看比赛的乐队和啦啦队要两辆校车，但三名司机病了，只有一名能开。学区问县里车队能不能借一名持校车驾照的司机。",
        "Show Low Unified's transportation supervisor says the band and spirit line need two buses for Friday, but three drivers are sick and only one can drive. The district asks to borrow a county driver with a school bus endorsement."],
      opts: [
        { t: ["借一名司机", "Lend a driver"], do: { trust: 2, county: -1 } },
        { t: ["乐队这一场不去", "The band sits this one out"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-fb-sr260", date: "2009-11-06", icon: "law",
      title: ["260 号公路上的球迷车流", "Game-night traffic on SR 260"],
      body: ["警长 K.C. 克拉克说，今晚肖洛和蓝岭同时开赛，两边加起来可能有 4,000 多人，大多走 260 号公路。他想请公共安全部第 3 区派两辆巡逻车在肖洛到莱克赛德之间，县里出加班费。",
        "Sheriff K.C. Clark says Show Low and Blue Ridge kick off at the same time tonight, maybe 4,000-plus people between them, most of them on SR 260. He wants DPS District 3 to put two units between Show Low and Lakeside, with the county paying overtime."],
      opts: [
        { t: ["请公共安全部帮忙，县里出加班费", "Ask DPS for help; county pays overtime"], do: { trust: 2, fed: 1, county: -4 } },
        { t: ["只用县警长办公室的人", "Sheriff's deputies only"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-fb-gate", date: "2009-11-06", when: { flags: ["nov_fb_open"] }, icon: "ppl",
      title: ["测温口排到球场外", "Temperature line backs up outside the stadium"],
      body: ["肖洛高中球场只有两个测温口，开赛前 20 分钟门外还有 600 多人。学校体育主任问能不能先放人进去，场内再测。",
        "Show Low High has only two temperature stations, and 20 minutes before kickoff more than 600 people are still outside. The athletic director asks to let them in and check inside."],
      opts: [
        { t: ["先放进去，场内补测", "Let them in and check inside"], do: { trust: 2, fed: -1, panic: 1 } },
        { t: ["加开两个口，延迟开球 15 分钟", "Open two more stations and delay kickoff 15 minutes"], do: { trust: 1, county: -1 } }
      ]
    },
    {
      id: "nov-fb-radio-deal", date: "2009-11-05", when: { flags: ["nov_fb_radio"] }, icon: "bank",
      title: ["电台要转播费", "The station wants a rights fee"],
      body: ["KVWM 970 AM 说可以直播三场季后赛，但学校没有卖票收入，电台要县里出每场 $1,500 的转播和技术费。KINO 1230 AM 说温斯洛那场可以免费播。",
        "KVWM 970 AM can carry the three playoff games live, but with no ticket income at the schools it wants the county to pay $1,500 a game for production. KINO 1230 AM will carry the Winslow game for free."],
      opts: [
        { t: ["付钱，三场都播", "Pay; carry all three"], do: { trust: 2, county: -5, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "18:45", t: ["今晚 19 点季后赛直播：肖洛主场、蓝岭主场，两场轮流报比分。", "Tonight at 7: playoff football live from Show Low and Blue Ridge, with scores from both."] } } },
        { t: ["只播 KINO 免费的那场", "Only the free KINO game"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-fb-r1", date: "2009-11-07", icon: "info",
      title: ["第一轮结果", "First-round results"],
      body: ["周五晚上本县三支球队都赢了，蓝岭、肖洛、温斯洛进入 11 月 13 日的四分之一决赛。AIA 的对阵表上，温斯洛下一场要去凤凰城西谷客场。",
        "All three county teams won on Friday night. Blue Ridge, Show Low and Winslow go to the quarterfinals on Nov 13. On AIA's bracket, Winslow's next game is away in the West Valley near Phoenix."],
      opts: [
        { t: ["请 AIA 把温斯洛那场改到北边中立场地", "Ask AIA to move Winslow's game to a neutral site up north"], do: { fed: -1, flag: "nov_fb_payson", event: { id: "nov-fb-neutral", inDays: 2 } } },
        { t: ["温斯洛照常南下", "Winslow travels south as scheduled"], do: { panic: 2, trust: 1, flag: "nov_fb_south" } },
        { t: ["由温斯洛联合学区自己决定", "Leave it to Winslow Unified"], do: {} }
      ]
    },
    {
      id: "nov-fb-neutral", chained: true, icon: "mail",
      title: ["AIA 同意改到佩森", "AIA agrees to Payson"],
      body: ["AIA 回复：温斯洛的四分之一决赛改在佩森高中（希拉县）举行，两队车程差不多。佩森那边要求客队球迷也测体温，温斯洛球迷走 87 号公路大约 90 英里。",
        "AIA replies: Winslow's quarterfinal moves to Payson High in Gila County, roughly even driving for both teams. Payson wants visiting fans temperature-checked too. Winslow fans will drive about 90 miles on SR 87."],
      opts: [
        { t: ["县里派人在佩森门口协助测温", "Send county staff to help with checks in Payson"], do: { trust: 2, county: -2, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "16:00", t: ["温斯洛对凤凰城西谷的四分之一决赛改在佩森高中，周五 19 点。87 号公路晚上有鹿，开慢点。", "Winslow's quarterfinal moves to Payson High, Friday 7 pm. Watch for deer on SR 87 after dark."] } } },
        { t: ["知道了", "Noted"], do: { trust: 1 } }
      ]
    },
    {
      id: "nov-fb-south-return", when: { after: "2009-11-14", before: "2009-11-20", flags: ["nov_fb_south"] }, icon: "q",
      title: ["从凤凰城回来的校车", "The buses back from Phoenix"],
      body: ["温斯洛的三辆校车夜里 2 点回到温斯洛。随队家长说回程在 17 号州际公路上被州里的检查点拦了 40 分钟。学区问县里要不要让队员和乐队在家观察两天。",
        "Winslow's three buses got home at 2 am. Parents on the trip say a state checkpoint on I-17 held them 40 minutes on the way back. The district asks whether players and band members should stay home for two days."],
      opts: [
        { t: ["观察两天，有症状就测", "Two days at home, test anyone with symptoms"], do: { panic: -1, trust: -1 } },
        { t: ["不用，照常上学", "No, back to school as normal"], do: { trust: 1, panic: 1 } }
      ]
    },
    {
      id: "nov-fb-boosters", date: "2009-11-12", icon: "law",
      title: ["蓝岭家长会的小卖部", "Blue Ridge boosters' snack bar"],
      body: ["蓝岭高中家长会每场靠小卖部收入约 $2,500，给球队买装备。县卫生服务区检查员说，现在临时食品摊要有洗手台和手套，问家长会能不能在周五前装好。家长会问县里能不能借两个移动洗手台。",
        "The Blue Ridge booster club makes about $2,500 a game at the snack bar for team equipment. A Public Health inspector says temporary food stands now need hand-wash stations and gloves by Friday. The boosters ask to borrow two portable hand-wash units from the county."],
      opts: [
        { t: ["借两个洗手台", "Lend two units"], do: { trust: 2 } },
        { t: ["这周先不开小卖部", "No snack bar this week"], do: { trust: -2, panic: -1 } }
      ]
    },
    {
      id: "nov-fb-roundvalley", date: "2009-11-11", icon: "globe",
      title: ["阿帕奇县请本县球迷少去", "Apache County asks our fans to stay away"],
      body: ["阿帕奇县卫生官员来电：圆谷（伊格）如果晋级，11 月 13 日要在室内的 Round Valley Dome 打，场馆不通风。阿帕奇县希望纳瓦霍县劝本县球迷别去，或至少戴口罩。",
        "Apache County's health officer calls: if Round Valley advances, its Nov 13 game is indoors in the Round Valley Dome in Eagar, with poor ventilation. Apache County asks Navajo County to discourage fans from going, or at least have them wear masks."],
      opts: [
        { t: ["在电台上提醒戴口罩", "Remind fans on the radio to wear masks"], do: { panic: -1, broadcast: { ch: "nb", name: ["KTHQ 92.5 FM · 伊格", "KTHQ 92.5 FM · Eagar"], time: "17:10", t: ["阿帕奇县卫生部门：去 Round Valley Dome 看球请戴口罩，入口发放。", "Apache County health: please wear a mask at the Round Valley Dome. Masks at the door."] } } },
        { t: ["不干预", "Do not intervene"], do: {} }
      ]
    },
    {
      id: "nov-fb-semis", date: "2009-11-16", icon: "q",
      title: ["半决赛场地", "Semifinal sites"],
      body: ["蓝岭和肖洛都进了 11 月 20 日的半决赛，温斯洛出局。AIA 原计划把两场半决赛都放在梅萨。肖洛主教练兰迪·赖斯多夫和蓝岭主教练保罗·莫罗联名请县里支持在北边打。",
        "Blue Ridge and Show Low have both made the Nov 20 semifinals; Winslow is out. AIA had planned both semifinals in Mesa. Show Low coach Randy Ricedorff and Blue Ridge coach Paul Moro jointly ask the county to back playing up north."],
      opts: [
        { t: ["支持在弗拉格斯塔夫打", "Back Flagstaff as the site"], do: { trust: 2, fed: -1, event: { id: "nov-fb-semis-reply", inDays: 2 } } },
        { t: ["按 AIA 原计划", "Go with AIA's plan"], do: { panic: 2, trust: -1 } }
      ]
    },
    {
      id: "nov-fb-semis-reply", chained: true, icon: "mail",
      title: ["AIA：一场北边，一场南边", "AIA: one north, one south"],
      body: ["AIA 折中：蓝岭那场改在弗拉格斯塔夫的北亚利桑那大学，肖洛那场仍在梅萨。肖洛学区问县里能不能出一辆巴士，送不想自己开车下山的家长。",
        "AIA splits the difference: Blue Ridge's semifinal moves to Northern Arizona University in Flagstaff, and Show Low's stays in Mesa. Show Low Unified asks whether the county will provide a coach for parents who do not want to drive down the mountain."],
      opts: [
        { t: ["出一辆巴士", "Provide a coach"], do: { trust: 2, county: -3, panic: 1 } },
        { t: ["不出", "No"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-fb-pep", date: "2009-11-19", icon: "ppl",
      title: ["肖洛高中的动员会", "Show Low High pep rally"],
      body: ["肖洛高中想在 11 月 19 日下午在体育馆开全校动员会，约 900 名学生。校长问县卫生服务区，在本周缺勤率 9% 的情况下可不可以。",
        "Show Low High wants an all-school pep rally in the gym on the afternoon of Nov 19, about 900 students. With absences at 9% this week, the principal asks Public Health whether that is all right."],
      opts: [
        { t: ["可以，改到室外球场", "Yes, but move it outside to the field"], do: { trust: 2 } },
        { t: ["可以", "Yes"], do: { trust: 2, panic: 1 } },
        { t: ["建议取消", "Recommend cancelling"], do: { trust: -2, panic: -1 } }
      ]
    },
    {
      id: "nov-fb-final", date: "2009-11-23", icon: "q",
      title: ["决赛：蓝岭对肖洛", "Final: Blue Ridge vs Show Low"],
      body: ["3A 决赛是本县两支球队：蓝岭对肖洛，11 月 28 日（星期六）。AIA 定在北亚利桑那大学的 Walkup Skydome，科科尼诺县要求观众限 6,000 人。两校各分 2,500 张票，剩下的公开卖。",
        "The 3A final is an all-Navajo County game: Blue Ridge vs Show Low on Saturday, Nov 28. AIA has it at NAU's Walkup Skydome, and Coconino County caps the crowd at 6,000. Each school gets 2,500 tickets and the rest go on public sale."],
      opts: [
        { t: ["县里组织五辆巴士去弗拉格斯塔夫", "County runs five coaches to Flagstaff"], do: { trust: 3, county: -8, flag: "nov_fb_buses", event: { id: "nov-fb-final-day", inDays: 5 } } },
        { t: ["提议改在肖洛高中主场打", "Propose moving it to Show Low High"], do: { trust: 1, flag: "nov_final_move", mail: "nov-m-aia-final", event: { id: "nov-fb-final-day", inDays: 5 } } },
        { t: ["不插手", "Stay out of it"], do: { event: { id: "nov-fb-final-day", inDays: 5 } } }
      ]
    },
    {
      id: "nov-fb-final-day", chained: true, icon: "info",
      title: ["决赛之夜", "Championship night"],
      body: ["蓝岭 41 比 21 赢了肖洛，拿到 3A 州冠军。Skydome 里坐了大约 5,800 人。回莱克赛德的车队晚上 10 点开始上 260 号公路，莱克赛德的白山大道上已经有人在等。",
        "Blue Ridge beat Show Low 41-21 for the 3A state title, in front of about 5,800 at the Skydome. The caravan back to Lakeside starts onto SR 260 around 10 pm, and people are already waiting along White Mountain Boulevard."],
      opts: [
        { t: ["派警员在白山大道维持秩序", "Send deputies to White Mountain Boulevard"], do: { trust: 2, panic: -1, county: -2, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "22:30", t: ["蓝岭 41 比 21 胜肖洛，夺得 3A 州冠军。车队今晚经 260 号公路回莱克赛德，请注意让行。", "Blue Ridge 41, Show Low 21: Blue Ridge are 3A state champions. The team caravan comes back to Lakeside on SR 260 tonight."] } } },
        { t: ["请派恩托普-莱克赛德警察局自己处理", "Leave it to Pinetop-Lakeside police"], do: {} }
      ]
    },
    {
      id: "nov-fb-deuce", when: { after: "2009-11-29", before: "2009-11-30" }, icon: "ppl",
      title: ["周日的游行", "Sunday parade"],
      body: ["派恩托普-莱克赛德镇长卢克·史密斯想在 11 月 29 日下午给蓝岭球队办一个车队游行，从蓝岭高中沿白山大道到镇政府。肖洛市也想在德斯俱乐部大道上欢迎亚军回家。两边都请县警长办公室派人。",
        "Pinetop-Lakeside Mayor Luke Smith wants a parade for the Blue Ridge team on the afternoon of Nov 29, from the high school along White Mountain Boulevard to town hall. Show Low wants to welcome its runners-up on the Deuce of Clubs. Both ask for sheriff's deputies."],
      opts: [
        { t: ["两边都派人", "Send deputies to both"], do: { trust: 3, county: -2 } },
        { t: ["只派到莱克赛德", "Lakeside only"], do: { trust: 1 } },
        { t: ["建议改到 12 月再办", "Suggest waiting until December"], do: { trust: -2, panic: -1 } }
      ]
    },
    {
      id: "nov-fb-thanks-practice", date: "2009-11-26", icon: "info",
      title: ["感恩节训练", "Thanksgiving practice"],
      body: ["蓝岭和肖洛两队感恩节上午都要训练。肖洛学区问县卫生服务区能不能派一名护士到场给球队做一次症状筛查，决赛前队里不能少人。",
        "Both Blue Ridge and Show Low practice on Thanksgiving morning. Show Low Unified asks Public Health for a nurse to screen the team for symptoms; they cannot afford to lose players before the final."],
      opts: [
        { t: ["两队都派护士", "Send a nurse to both teams"], do: { trust: 2, county: -1 } },
        { t: ["只给教练发筛查表", "Send the coaches a screening form"], do: {} }
      ]
    },
    {
      id: "nov-fb-tickets", when: { after: "2009-11-24", before: "2009-11-27", min: { panic: 45 } }, icon: "warn",
      title: ["决赛票被炒", "Final tickets being scalped"],
      body: ["肖洛有人在 Craigslist 上把 $8 的决赛票卖到 $60。家长打电话到县里，说很多家庭买不到票。学校说票是 AIA 的，学校管不了。",
        "Someone in Show Low is selling $8 final tickets for $60 on Craigslist. Parents are calling the county saying families cannot get tickets. The school says the tickets belong to AIA."],
      opts: [
        { t: ["请 AIA 增加 KVWM 直播，在电台上宣布", "Ask AIA to allow a KVWM broadcast and announce it"], do: { panic: -1, trust: 1 } },
        { t: ["不管", "Leave it"], do: { trust: -1 } }
      ]
    },
    {
      id: "nov-fb-band", date: "2009-11-25", when: { flags: ["nov_fb_buses"] }, icon: "ppl",
      title: ["乐队也要坐巴士", "The band wants the coaches too"],
      body: ["蓝岭高中乐队 74 人、肖洛高中乐队 61 人，原来坐学区的校车。两校问县里的五辆巴士能不能先让给乐队，剩下的座位再给家长。",
        "The Blue Ridge band has 74 members and Show Low's has 61, normally on district buses. Both schools ask whether the county's five coaches can take the bands first and give parents the remaining seats."],
      opts: [
        { t: ["先给乐队", "Bands first"], do: { trust: 1 } },
        { t: ["再加两辆", "Add two more coaches"], do: { trust: 2, county: -3 } }
      ]
    },
    {
      id: "nov-groc-pantry-wk2", chained: true, icon: "ppl",
      title: ["发放点第二周", "Food site, second week"],
      body: ["北帕克大道发放点第二周登记到 1,040 户。县里派去的 6 个人每天站 9 个小时，有两人请了病假。温斯洛支联会说可以每天派 8 名青年志愿者来搬货，16 岁以上，家长签字。",
        "The North Park Drive site is up to 1,040 registered households in its second week. The six county staff there work nine-hour days and two have called in sick. The Winslow stake can send eight youth volunteers a day to move stock, aged 16 and up with parental consent."],
      opts: [
        { t: ["接受青年志愿者", "Accept the youth volunteers"], do: { lds: 3, trust: 1 } },
        { t: ["再从县里调 3 个人", "Move three more county staff over"], do: { trust: 1, county: -4 } }
      ]
    },
    {
      id: "nov-vax-ihs-bill", chained: true, icon: "bank",
      title: ["印第安医疗中心的账单", "The health center's invoice"],
      body: ["温斯洛印第安医疗中心报来第一周账单：给 212 名非原住民家属打了疫苗，每剂 $9，加护士工时，共 $3,870。中心说还有约 300 人已登记。",
        "The Winslow Indian Health Care Center sends its first weekly invoice: 212 non-Native household members vaccinated at $9 a dose plus nursing time, $3,870 in all. About 300 more are signed up."],
      opts: [
        { t: ["照付，继续", "Pay it and continue"], do: { navajo: 2, county: -4 } },
        { t: ["付这一周，之后改到县诊所", "Pay this week, then switch to county clinics"], do: { navajo: -1, county: -4 } }
      ]
    },
    {
      id: "nov-fb-qf", date: "2009-11-14", icon: "info",
      title: ["四分之一决赛结果", "Quarterfinal results"],
      body: ["蓝岭和肖洛都赢了，进入 11 月 20 日的半决赛。温斯洛输了，赛季结束。温斯洛主教练拉斯蒂·罗伯逊说球队周一照常训练到感恩节，给明年的低年级队员。",
        "Blue Ridge and Show Low both won and go to the semifinals on Nov 20. Winslow lost, ending its season. Winslow coach Rusty Robertson says the team will keep practising through Thanksgiving for next year's underclassmen."],
      opts: [
        { t: ["知道了", "Noted"], do: { broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "07:30", t: ["温斯洛斗牛犬队季后赛止步四分之一决赛。周六的温斯洛集市照常。", "The Winslow Bulldogs' season ends in the quarterfinals. Saturday's Winslow market goes ahead as usual."] } } }
      ]
    },
    {
      id: "nov-groc-wic-follow", chained: true, icon: "info",
      title: ["WIC 支票可以在霍尔布鲁克用了", "WIC checks now good in Holbrook"],
      body: ["州卫生服务厅批准温斯洛的 WIC 家庭在 12 月 31 日前可以用支票在霍尔布鲁克 Safeway 买东西。县 WIC 办公室问县里要不要帮这些家庭安排去霍尔布鲁克的车。",
        "ADHS has approved Winslow WIC families using their checks at the Holbrook Safeway through Dec 31. The county WIC office asks whether the county will help these families get to Holbrook."],
      opts: [
        { t: ["县 WIC 办公室帮她们拼车", "Have the WIC office organize car pools"], do: { trust: 2, county: -1 } },
        { t: ["让她们自己去", "They make their own way"], do: {} }
      ]
    }
  ],
  mail: [
    {
      id: "nov-m-adhs-wk2", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS H1N1-AL-1109", date: "2009-11-09", time: "07:50",
      subject: ["11 月 9 日这一周的疫苗配额", "Vaccine allotment, week of Nov 9"],
      body: ["纳瓦霍县：注射剂 2,000 剂（多剂量瓶），FluMist 600 剂。请在 11 月 10 日 17:00 前在州疫苗系统里填好各接种点的分配，逾期按上周比例自动分。",
        "Navajo County: 2,000 injectable doses (multi-dose vials) and 600 FluMist. Enter the split by provider site in the state vaccine system by 17:00 on Nov 10, or it defaults to last week's proportions."],
      acts: [
        { t: ["按上周比例", "Use last week's split"], do: { fed: 1 }, done: ["已按上周比例填报。", "Filed at last week's proportions."] },
        { t: ["多分给温斯洛和北部学校", "Shift more to Winslow and northern schools"], do: { navajo: 2, lds: -1 }, done: ["已调整分配。", "Split adjusted."] }
      ]
    },
    {
      id: "nov-m-adhs-wk3", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS H1N1-AL-1116", date: "2009-11-16", time: "08:05",
      subject: ["11 月 16 日这一周：1,800 剂", "Week of Nov 16: 1,800 doses"],
      body: ["本周注射剂 1,500 剂，其中单剂预充针 60 支，FluMist 300 剂。全州本周到货比预期少两成，生产商说下旬会补上。",
        "This week: 1,500 injectable doses including 60 prefilled single-dose syringes, plus 300 FluMist. Statewide deliveries are 20% below forecast; manufacturers say they will catch up later in the month."],
      acts: [
        { t: ["确认", "Confirm"], do: {}, done: ["已确认。", "Confirmed."] },
        { t: ["在电台上告诉大家", "Tell people on the radio"], do: { panic: -1, broadcast: { ch: "county", name: ["KDJI 1270 AM · 霍尔布鲁克", "KDJI 1270 AM · Holbrook"], time: "12:10", t: ["县卫生服务区：本周到货 1,800 剂，孕妇、六个月以下婴儿的家人、6 个月到 24 岁的人优先。", "County Public Health: 1,800 doses this week. Priority for pregnant women, families of babies under six months, and everyone 6 months to 24 years."] } }, done: ["已安排电台播报。", "Radio spot booked."] }
      ]
    },
    {
      id: "nov-m-adhs-wk4", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS H1N1-AL-1123", date: "2009-11-23", time: "07:45",
      subject: ["感恩节周配送安排", "Thanksgiving week deliveries"],
      body: ["McKesson 11 月 26 日、27 日不送货。本周的 2,400 剂会在 11 月 24 日前送到，请确保两天的冷藏空间。",
        "McKesson will not deliver on Nov 26 or 27. This week's 2,400 doses arrive by Nov 24; make sure you have two days of cold storage."],
      acts: [
        { t: ["向 Summit 借一台冷藏柜", "Borrow a fridge from Summit Healthcare"], do: { trust: 1 }, done: ["Summit 同意借一台。", "Summit will lend one."] },
        { t: ["现有冰箱够用", "Current fridges will do"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-adhs-wk5", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS H1N1-AL-1130", date: "2009-11-30", time: "08:00",
      subject: ["12 月供应展望", "December supply outlook"],
      body: ["州卫生服务厅预计 12 月每周到货比 11 月多一倍。如果供应稳定，州里会考虑 12 月中旬起取消优先顺序，向所有人开放。请各县先准备好大型接种点。",
        "ADHS expects weekly December deliveries to double November's. If supply holds, the state will consider dropping priority groups and opening to everyone from mid-December. Counties should line up mass clinic sites now."],
      attach: true
    },
    {
      id: "nov-m-priority", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS 09-PH-211", date: "2009-11-03", time: "10:20",
      subject: ["重申 H1N1 疫苗优先人群", "H1N1 priority groups restated"],
      body: ["五类优先人群：孕妇；六个月以下婴儿的家人和照护者；医护和急救人员；6 个月到 24 岁；25 到 64 岁有慢性病的人。65 岁以上暂不在内。",
        "Five priority groups: pregnant women; household contacts and caregivers of infants under six months; health care and EMS personnel; everyone 6 months to 24 years; people 25 to 64 with chronic conditions. People 65 and over are not included for now."],
      acts: [
        { t: ["转发给各镇和学区", "Forward to towns and school districts"], do: { fed: 1 }, done: ["已转发。", "Forwarded."] }
      ]
    },
    {
      id: "nov-m-summit-syringes", from: "nb", sender: ["Summit 医疗中心", "Summit Healthcare Regional Medical Center"], date: "2009-11-09", when: { flags: ["nov_vax_kits_borrowed"] }, time: "13:40",
      subject: ["借出 2,000 支针筒", "Loan of 2,000 syringes"],
      body: ["Summit 医疗中心药剂部借给县卫生服务区 2,000 支 1 毫升针筒和配套针头，请 12 月 15 日前以同规格归还。已送到 9th Pl。",
        "Summit Healthcare pharmacy is lending County Public Health 2,000 1 mL syringes with needles, to be returned in kind by Dec 15. Delivered to 9th Place."],
      acts: [
        { t: ["回信致谢", "Send thanks"], do: { trust: 1 }, done: ["已回信。", "Thank-you sent."] }
      ]
    },
    {
      id: "nov-m-tamiflu-list", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS SNS-AV-07", date: "2009-11-06", when: { flags: ["nov_tamiflu_pick"] }, time: "15:10",
      subject: ["达菲混悬液领取单", "Tamiflu suspension pickup"],
      body: ["400 疗程儿童用达菲口服混悬液，11 月 9 日 9:00 到 11:00 在科科尼诺县卫生部门（弗拉格斯塔夫）领取，带县卫生服务区工作证和冷藏箱。按药房分配表发放。",
        "400 courses of pediatric Tamiflu oral suspension, pickup Nov 9, 9 to 11 am, at the Coconino County health department in Flagstaff. Bring Public Health ID and a cooler. Distribute per the attached pharmacy list."],
      attach: true,
      acts: [
        { t: ["通知药房", "Notify pharmacies"], do: { trust: 1, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "17:05", t: ["儿童用达菲混悬液 11 月 10 日起在霍尔布鲁克、肖洛、温斯洛的药房恢复供应，凭处方。", "Children's Tamiflu suspension back at pharmacies in Holbrook, Show Low and Winslow from Nov 10, with a prescription."] } }, done: ["已通知各药房。", "Pharmacies notified."] }
      ]
    },
    {
      id: "nov-m-pf-request", from: "nb", sender: ["亚利桑那州卫生服务厅", "Arizona Department of Health Services"], ref: "ADHS H1N1-PF-38", date: "2009-11-09", when: { flags: ["nov_pf_asked"] }, time: "11:25",
      subject: ["回复：追加单剂预充针", "Re: extra prefilled syringes"],
      body: ["可以在 11 月 23 日那一周追加 100 支单剂预充针，仅限孕妇。全州的预充针都很紧，请不要再追加。",
        "We can add 100 prefilled single-dose syringes the week of Nov 23, for pregnant women only. Prefilled stock is tight statewide; please do not request more."],
      acts: [
        { t: ["确认", "Confirm"], do: {}, done: ["已确认。", "Confirmed."] }
      ]
    },
    {
      id: "nov-m-lcmc-ob", from: "nb", sender: ["小科罗拉多医疗中心", "Little Colorado Medical Center"], date: "2009-11-10", time: "09:15",
      subject: ["产科门诊接种时间", "Obstetrics clinic vaccination hours"],
      body: ["产科门诊每周二、周四 13:00 到 16:00 给预约的孕妇接种，请县卫生服务区每周一送当周的剂量。",
        "The OB clinic will vaccinate booked pregnant patients Tuesdays and Thursdays, 1 to 4 pm. Please have Public Health deliver that week's doses each Monday."],
      acts: [
        { t: ["同意", "Agree"], do: { trust: 1 }, done: ["已同意。", "Agreed."] },
        { t: ["请他们来肖洛取", "Ask them to collect in Show Low"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-ncphsd-staff", from: "county", ref: "NCPHSD 09-118", date: "2009-11-04", time: "07:30",
      subject: ["护士缺 6 人", "Six nurses out"],
      body: ["县卫生服务区：本周 6 名护士病假，学校接种和诊所只能开一半。可以通过弗拉格斯塔夫的护理派遣公司临时雇 4 名注册护士，每人每周约 $2,400，最少四周。",
        "Public Health: six nurses are out sick this week, so school and clinic sessions are at half capacity. A Flagstaff staffing agency can supply four RNs at about $2,400 each per week, four-week minimum."],
      acts: [
        { t: ["雇 4 名，四周", "Hire four for four weeks"], do: { county: -38, trust: 2 }, done: ["已签派遣合同。", "Agency contract signed."] },
        { t: ["雇 2 名", "Hire two"], do: { county: -19, trust: 1 }, done: ["已签两名。", "Two signed."] },
        { t: ["不雇", "Do not hire"], do: { trust: -1 }, done: ["维持现状。", "No change."] }
      ]
    },
    {
      id: "nov-m-ncphsd-tally", from: "county", ref: "NCPHSD 09-131", date: "2009-11-20", time: "17:15",
      subject: ["截至 11 月 20 日的接种数", "Doses given through Nov 20"],
      body: ["全县累计 7,912 剂：学校 3,140，县诊所 3,288，药房 610，伙伴机构 874。按镇分：肖洛 2,410，霍尔布鲁克 1,850，温斯洛 1,520，斯诺弗莱克-泰勒 1,240，其他 892。",
        "County total 7,912 doses: schools 3,140, county clinics 3,288, pharmacies 610, partners 874. By town: Show Low 2,410, Holbrook 1,850, Winslow 1,520, Snowflake-Taylor 1,240, others 892."],
      attach: true,
      acts: [
        { t: ["在县网站和电台公布", "Publish on the county website and radio"], do: { trust: 2, panic: -1, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "08:10", t: ["县卫生服务区：截至 11 月 20 日全县已接种 7,912 剂，温斯洛 1,520 剂。", "County Public Health: 7,912 doses given countywide through Nov 20, 1,520 of them in Winslow."] } }, done: ["已公布。", "Published."] },
        { t: ["只报监事会", "Board only"], do: {}, done: ["已报监事会。", "Sent to the Board."] }
      ]
    },
    {
      id: "nov-m-vis", from: "county", ref: "NCPHSD 09-120", date: "2009-11-05", time: "11:00",
      subject: ["疫苗说明单印数", "Vaccine information sheet printing"],
      body: ["CDC 的 H1N1 疫苗说明单（VIS）英文版和西班牙文版各要再印 5,000 份，约 $700。纳瓦霍族卫生部有纳瓦霍语录音版，可以在诊所候诊区播放。",
        "We need 5,000 more copies each of the CDC H1N1 Vaccine Information Statement in English and Spanish, about $700. The Navajo Division of Health has a Navajo-language recording that can play in clinic waiting areas."],
      acts: [
        { t: ["印，并借纳瓦霍语录音", "Print them and borrow the Navajo recording"], do: { navajo: 1, county: -1 }, done: ["已下单印刷。", "Print order placed."] },
        { t: ["只印英文版", "English only"], do: {}, done: ["已下单。", "Ordered."] }
      ]
    },
    {
      id: "nov-m-school-supt", from: "county", sender: ["县教育总监办公室", "County School Superintendent's Office"], ref: "NCSS 09-44", date: "2009-11-03", when: { flags: ["nov_flumist_school"] }, time: "13:30",
      subject: ["学校接种日历", "School clinic calendar"],
      body: ["各学区报来的接种日期：肖洛 11 月 5 日，霍尔布鲁克 11 月 6 日，斯诺弗莱克 11 月 10 日，蓝岭 11 月 12 日，温斯洛 11 月 6 日，希伯-奥弗加德和约瑟夫城合并到 11 月 13 日。",
        "School clinic dates from the districts: Show Low Nov 5, Holbrook Nov 6, Snowflake Nov 10, Blue Ridge Nov 12, Winslow Nov 6, Heber-Overgaard and Joseph City combined on Nov 13."],
      attach: true
    },
    {
      id: "nov-m-wihcc", from: "navajo", sender: ["温斯洛印第安医疗中心", "Winslow Indian Health Care Center"], date: "2009-11-12", time: "10:45",
      subject: ["本周接种情况", "This week's vaccinations"],
      body: ["本周给登记患者打了 840 剂，伯德斯普林斯、托拉尼湖、特斯托三个分会派车接送老人和孕妇。剩 60 剂留给 11 月 16 日那一周的复诊病人。",
        "We gave 840 doses to registered patients this week. The Birdsprings, Tolani Lake and Teesto chapters drove elders and pregnant women in. Sixty doses are held for follow-up patients the week of Nov 16."],
      acts: [
        { t: ["回信致谢", "Send thanks"], do: { navajo: 1 }, done: ["已回信。", "Thanks sent."] }
      ]
    },
    {
      id: "nov-m-navajo-psa", from: "navajo", ref: "NDOH-ICC 09-77", date: "2009-11-06", time: "14:20",
      subject: ["纳瓦霍语接种广播", "Navajo-language vaccine spots"],
      body: ["纳瓦霍族卫生部事件指挥中心：KTNN 的纳瓦霍语接种提醒每天播四次，到 12 月底，费用 $2,600。提醒里会说明县诊所也给住在保留地外的族人打，县里愿不愿意分摊一半。",
        "Navajo Division of Health incident command: Navajo-language vaccine spots on KTNN, four a day through December, $2,600. The spots will mention that county clinics also serve Navajo members living off the reservation. Will the county pay half?"],
      acts: [
        { t: ["分摊一半", "Pay half"], do: { navajo: 3, county: -1, broadcast: { ch: "navajo", name: ["KTNN 660 AM · 窗岩", "KTNN 660 AM · Window Rock"], time: "11:50", t: ["（纳瓦霍语）住在温斯洛、霍尔布鲁克的族人，也可以去县诊所打 H1N1 疫苗，免费。", "(In Navajo) Members living in Winslow or Holbrook can also get the H1N1 vaccine free at county clinics."] } }, done: ["已同意分摊。", "Agreed to split the cost."] },
        { t: ["婉拒", "Decline"], do: { navajo: -1 }, done: ["已婉拒。", "Declined."] }
      ]
    },
    {
      id: "nov-m-hopi-polacca", from: "nb", sender: ["霍皮医疗中心（波拉卡）", "Hopi Health Care Center, Polacca"], date: "2009-11-16", time: "09:40",
      subject: ["第二次接种日", "Second clinic day"],
      body: ["11 月 21 日（星期六）在波拉卡办第二次接种，面向第一台地和第二台地各村。中心问县里能不能借一辆冷藏车，当天往返。",
        "Second clinic day in Polacca on Saturday, Nov 21, for the First and Second Mesa villages. The center asks to borrow a county refrigerated van for the day."],
      acts: [
        { t: ["借车", "Lend the van"], do: { navajo: 2 }, done: ["已安排车辆。", "Van arranged."] },
        { t: ["车已有安排", "The van is booked"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-safeway-pharm", from: "nb", sender: ["Safeway 霍尔布鲁克店药房", "Safeway Pharmacy, Holbrook"], date: "2009-11-13", time: "15:55",
      subject: ["申请成为 H1N1 接种点", "Request to be an H1N1 provider"],
      body: ["药房已在州里登记，只等县卫生服务区分配剂量。药房可以每天打 120 剂，周六周日也开，不收接种费。",
        "The pharmacy is registered with the state and needs only a county allocation. It can give 120 doses a day, weekends included, with no administration fee."],
      acts: [
        { t: ["每周分 400 剂", "Allocate 400 a week"], do: { trust: 2, broadcast: { ch: "county", name: ["KDJI 1270 AM · 霍尔布鲁克", "KDJI 1270 AM · Holbrook"], time: "07:20", t: ["霍尔布鲁克 Safeway 药房从 11 月 16 日起接种 H1N1 疫苗，每天 9 点到 18 点，优先人群免费。", "The Holbrook Safeway pharmacy gives H1N1 shots from Nov 16, 9 am to 6 pm daily, free for priority groups."] } }, done: ["已分配。", "Allocated."] },
        { t: ["暂不分配", "Not yet"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-npc-roster", from: "nb", sender: ["北地先锋学院护理系", "NPC Nursing Program"], date: "2009-11-14", when: { flags: ["nov_vax_npc"] }, time: "12:00",
      subject: ["学生排班表", "Student roster"],
      body: ["22 名学生分两组，周二上午在霍尔布鲁克、周四上午在温斯洛。每组由一名教员带。第一次上岗 11 月 17 日。",
        "Twenty-two students in two groups: Tuesday mornings in Holbrook and Thursday mornings in Winslow, each with a faculty supervisor. First session Nov 17."],
      attach: true
    },
    {
      id: "nov-m-coconino", from: "nb", sender: ["科科尼诺县卫生部门", "Coconino County Health Department"], date: "2009-11-18", time: "14:05",
      subject: ["勒普附近的跨县接种", "Cross-county clinic near Leupp"],
      body: ["勒普在我县，伯德斯普林斯在贵县，两边的人都去勒普的诊所。我们提议 12 月 2 日在勒普办一次两县联合接种，各出一名护士。",
        "Leupp is in our county and Birdsprings is in yours, and people from both use the Leupp clinic. We propose a joint clinic in Leupp on Dec 2, one nurse from each county."],
      acts: [
        { t: ["同意", "Agree"], do: { navajo: 2, county: -1 }, done: ["已同意。", "Agreed."] },
        { t: ["婉拒", "Decline"], do: {}, done: ["已婉拒。", "Declined."] }
      ]
    },
    {
      id: "nov-m-apache-flumist", from: "nb", sender: ["阿帕奇县卫生部门", "Apache County Health District"], date: "2009-11-19", time: "11:30",
      subject: ["换一点疫苗", "A vaccine swap"],
      body: ["我们多出 400 剂 FluMist，缺注射剂。贵县如果有多的注射剂，愿意一比一换，州里同意即可。",
        "We have 400 surplus FluMist doses and are short of injectable. If you have spare injectable, we will swap one for one, subject to state approval."],
      acts: [
        { t: ["换 200 剂", "Swap 200"], do: { trust: 1 }, done: ["已报州里备案。", "Filed with the state."] },
        { t: ["不换", "No swap"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-wmi", from: "nb", sender: ["《白山独立报》", "White Mountain Independent"], date: "2009-11-18", time: "16:20",
      subject: ["采访：疫苗分配", "Interview request: vaccine distribution"],
      body: ["记者想写一篇白山地区和温斯洛之间疫苗分配的报道，请县卫生服务区在 11 月 20 日截稿前回答五个问题。",
        "A reporter is writing about vaccine distribution between the White Mountains and Winslow and asks Public Health to answer five questions before the Nov 20 deadline."],
      acts: [
        { t: ["接受采访", "Do the interview"], do: { trust: 1 }, done: ["已回答。", "Answered."] },
        { t: ["只给书面数据", "Written figures only"], do: {}, done: ["已发数据。", "Figures sent."] }
      ]
    },
    {
      id: "nov-m-fairgrounds", from: "county", sender: ["纳瓦霍县集市场地", "Navajo County Fairgrounds"], date: "2009-11-21", when: { flags: ["nov_vax_big"] }, time: "08:30",
      subject: ["接种后的场地清理", "Clean-up after the clinic"],
      body: ["集市场地管理员：开车接种后场地垃圾和锥桶要清，约 $1,200。另外 11 月 28 日场地有一场马术活动，问接种能不能在 27 日前撤完。",
        "Fairgrounds manager: clean-up after the drive-through, cones and trash, about $1,200. There is an equestrian event on Nov 28; can the clinic be out by the 27th?"],
      acts: [
        { t: ["付清理费，27 日前撤", "Pay for clean-up, out by the 27th"], do: { county: -1 }, done: ["已安排。", "Arranged."] }
      ]
    },
    {
      id: "nov-m-n95", from: "fed", ref: "ADEM 09-0688", date: "2009-11-05", time: "09:55",
      subject: ["国家战略储备 N95 口罩", "N95 respirators from the Strategic National Stockpile"],
      body: ["州应急管理局转来国家战略储备的 12,000 只 N95 口罩，供医护和急救人员使用。11 月 10 日在霍尔布鲁克公共安全部第 3 区办公室交接。",
        "ADEM is passing on 12,000 N95 respirators from the Strategic National Stockpile for health care and EMS workers. Handover Nov 10 at the DPS District 3 office in Holbrook."],
      acts: [
        { t: ["接收，分给各医院和消防", "Accept and split among hospitals and fire"], do: { fed: 2, trust: 1 }, done: ["已接收。", "Received."] },
        { t: ["接收，先存在县仓库", "Accept and store in the county warehouse"], do: { fed: 1 }, done: ["已入库。", "In storage."] }
      ]
    },
    {
      id: "nov-m-safeway-reply", from: "nb", sender: ["Safeway 霍尔布鲁克店", "Safeway, Holbrook"], date: "2009-11-02", when: { flags: ["nov_ask_safeway"] }, time: "15:40",
      subject: ["回复：往温斯洛送货", "Re: deliveries to Winslow"],
      body: ["店里没有送货车和司机，不能送。可以接受电话订货，每周二上午备好，温斯洛来人一起取。订货电话每天 7:00 到 10:00。",
        "We have no delivery truck or driver, so we cannot deliver. We can take phone orders and have them packed every Tuesday morning for someone from Winslow to collect. Order line 7 to 10 am daily."],
      acts: [
        { t: ["县车每周二去取", "County van collects every Tuesday"], do: { trust: 2, county: -2, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "07:05", t: ["霍尔布鲁克 Safeway 接受温斯洛居民电话订货，每天 7 点到 10 点，周二由县车送到温斯洛市政厅取货。", "The Holbrook Safeway takes phone orders from Winslow residents 7 to 10 am. Pickup Tuesdays at Winslow City Hall by county van."] } }, done: ["已安排每周二取货。", "Tuesday pickups arranged."] },
        { t: ["告诉市里自己安排", "Tell the city to arrange it"], do: {}, done: ["已转给温斯洛市。", "Passed to Winslow."] }
      ]
    },
    {
      id: "nov-m-winslow-council", from: "nb", sender: ["温斯洛市议会", "Winslow City Council"], ref: "Res. 2009-31", date: "2009-11-04", time: "10:30",
      subject: ["关于本市食品供应的决议", "Resolution on the city's food supply"],
      body: ["市议会一致通过决议，请纳瓦霍县把温斯洛列为食品供应优先地区，并在 12 月 31 日前协助找到新的杂货店经营者。",
        "The council unanimously asks Navajo County to treat Winslow as a priority area for food supply and to help find a new grocery operator by Dec 31."],
      acts: [
        { t: ["回函支持", "Reply in support"], do: { trust: 2 }, done: ["已回函。", "Letter sent."] },
        { t: ["列入监事会议程", "Put it on the Board agenda"], do: { trust: 1 }, done: ["已列入议程。", "On the agenda."] }
      ]
    },
    {
      id: "nov-m-stmarys-truck", from: "nb", sender: ["圣玛丽食品银行联盟", "St. Mary's Food Bank Alliance"], date: "2009-11-11", when: { flags: ["nov_pantry_reserve"] }, time: "14:25",
      subject: ["温斯洛的货车班期", "Truck schedule for Winslow"],
      body: ["从凤凰城北上的货车走 87 号公路经佩森到温斯洛，每周四一车，约 22 托盘。这周因司机不够推到周五。卸货需要叉车。",
        "Our truck from Phoenix runs up SR 87 through Payson to Winslow every Thursday, about 22 pallets. This week it slips to Friday for lack of drivers. Unloading needs a forklift."],
      acts: [
        { t: ["县公共工程处派叉车", "Public Works sends a forklift"], do: { trust: 1 }, done: ["已安排叉车。", "Forklift arranged."] },
        { t: ["请他们带尾板车来", "Ask them to send a liftgate truck"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-bashas-equip", from: "nb", sender: ["Bashas' 公司（钱德勒）", "Bashas' Inc., Chandler"], date: "2009-11-12", time: "11:05",
      subject: ["温斯洛店留下的冷柜", "Refrigeration left in the Winslow store"],
      body: ["北帕克大道店里还有 14 组冷藏柜和一间步入式冷库，破产管理人同意以 $18,000 整体出售，买方自己拆运，或者原地使用。",
        "The North Park Drive store still has 14 refrigerated cases and a walk-in cooler. The bankruptcy administrator will sell them as a lot for $18,000, buyer to remove them or use them in place."],
      acts: [
        { t: ["原地买下，供发放点用", "Buy them in place for the food site"], do: { trust: 2, county: -18 }, done: ["已出价。", "Offer made."] },
        { t: ["不买", "Pass"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-azfoodbanks", from: "nb", sender: ["亚利桑那食品银行协会", "Association of Arizona Food Banks"], date: "2009-11-04", time: "09:20",
      subject: ["TEFAP 11 月分配", "November TEFAP allocation"],
      body: ["纳瓦霍县 11 月 TEFAP 物资 14 托盘：罐装蔬菜、花生酱、米、冷冻鸡肉。11 月 10 日送霍尔布鲁克。领取人须登记收入，标准为联邦贫困线的 150%。",
        "Navajo County's November TEFAP allotment, 14 pallets: canned vegetables, peanut butter, rice and frozen chicken, arriving in Holbrook Nov 10. Recipients must self-certify income at or below 150% of the federal poverty line."],
      attach: true
    },
    {
      id: "nov-m-des", from: "nb", sender: ["州经济安全厅温斯洛办公室", "DES Winslow Office"], date: "2009-11-20", time: "16:00",
      subject: ["营养援助办公时间延长", "Longer hours for Nutrition Assistance"],
      body: ["从 11 月 23 日起，温斯洛办公室周一到周四开到 19:00，周六 9:00 到 13:00 只做营养援助面谈。",
        "From Nov 23 the Winslow office stays open until 7 pm Monday to Thursday and runs Nutrition Assistance interviews only on Saturdays, 9 am to 1 pm."],
      acts: [
        { t: ["在电台上通知", "Announce on the radio"], do: { trust: 1, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "12:40", t: ["DES 温斯洛办公室 11 月 23 日起周一到周四开到晚上 7 点，周六上午办食品援助面谈。", "DES Winslow is open until 7 pm Monday to Thursday from Nov 23, with Saturday morning food assistance interviews."] } }, done: ["已通知。", "Announced."] }
      ]
    },
    {
      id: "nov-m-nacog", from: "nb", sender: ["NACOG 老龄事务处", "NACOG Area Agency on Aging"], date: "2009-11-20", when: { flags: ["nov_nacog"] }, time: "11:10",
      subject: ["温斯洛送餐近况", "Winslow meal deliveries update"],
      body: ["县里补的钱到账后，候补名单清空了。现在每天送 138 份，感恩节当天另送 40 份火鸡餐。",
        "With the county funds in, the waiting list is clear. We now deliver 138 meals a day, plus 40 turkey dinners on Thanksgiving Day."]
    },
    {
      id: "nov-m-fleet", from: "county", sender: ["县车队", "County Fleet"], date: "2009-11-06", when: { flags: ["nov_shuttle"] }, time: "16:45",
      subject: ["班车油费和里程", "Van fuel and mileage"],
      body: ["购物班车第一周跑了 264 英里，油费 $71，司机加班 9 小时。15 座车 11 月 9 日要做保养，需要从霍尔布鲁克调一辆备用车。",
        "First week of the shopping van: 264 miles, $71 in fuel, 9 hours of driver overtime. The 15-seater is due for service on Nov 9 and a spare must come over from Holbrook."],
      acts: [
        { t: ["调备用车", "Send the spare"], do: {}, done: ["已调车。", "Spare sent."] }
      ]
    },
    {
      id: "nov-m-lds-storehouse", from: "lds", ref: "Winslow AZ Stake", date: "2009-11-12", time: "08:40",
      subject: ["主教仓库的货 11 月 17 日到", "Storehouse goods arrive Nov 17"],
      body: ["从盐湖城调来的一车主教仓库物资 11 月 17 日到温斯洛，约 18 吨：面粉、奶粉、罐装肉和豆子。支联会中心放不下一半，问能不能借县里在温斯洛的车库存放。",
        "A truck of bishops' storehouse goods from Salt Lake City reaches Winslow on Nov 17, about 18 tons: flour, powdered milk, canned meat and beans. The stake center can hold half; can the rest go in the county's Winslow garage?"],
      acts: [
        { t: ["借车库", "Lend the garage"], do: { lds: 3, trust: 1 }, done: ["已安排。", "Arranged."] },
        { t: ["车库要停扫雪车", "The garage holds the snowplows"], do: { lds: -1 }, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-lds-beef", from: "lds", ref: "Snowflake AZ Stake", date: "2009-11-17", time: "09:05",
      subject: ["福利牧场的牛肉", "Beef from the welfare ranch"],
      body: ["斯诺弗莱克支联会福利牧场（泰勒附近）可以拿出约 4,000 磅冷冻牛肉，给县里的食品发放点。需要在泰勒交接，县里出冷藏车。",
        "The Snowflake stake welfare ranch near Taylor can provide about 4,000 lb of frozen beef for the county food sites. Handover in Taylor; the county brings a refrigerated truck."],
      acts: [
        { t: ["接受，送去温斯洛", "Accept and take it to Winslow"], do: { lds: 4, trust: 2, county: -1 }, done: ["已接收。", "Received."] },
        { t: ["接受，留在霍尔布鲁克", "Accept and keep it in Holbrook"], do: { lds: 3, trust: 1 }, done: ["已接收。", "Received."] }
      ]
    },
    {
      id: "nov-m-tolani", from: "navajo", sender: ["托拉尼湖分会", "Tolani Lake Chapter"], ref: "TLC-11-09-02", date: "2009-11-10", time: "13:15",
      subject: ["分会决议：支持温斯洛周六集市", "Chapter resolution supporting the Winslow market"],
      body: ["分会以 41 票赞成、0 票反对通过决议，支持族人在温斯洛周六集市摆摊，并请县里允许分会的皮卡在集市当天停在市政厅旁。",
        "The chapter voted 41-0 to support members selling at the Winslow Saturday market and asks the county to let chapter pickups park beside City Hall on market days."],
      acts: [
        { t: ["同意", "Agree"], do: { navajo: 2 }, done: ["已回复同意。", "Agreed."] },
        { t: ["请他们找市政府", "Refer to the city"], do: {}, done: ["已转。", "Referred."] }
      ]
    },
    {
      id: "nov-m-walmart", from: "nb", sender: ["Walmart 温斯洛店", "Walmart, Winslow"], date: "2009-11-14", time: "07:55",
      subject: ["周六营业时间", "Saturday hours"],
      body: ["本店周六改为 6:00 开门，加开 3 个收银台。请县里在周六 9:00 到 13:00 派一名副警长在停车场入口。",
        "We now open at 6 am on Saturdays with three more registers. Please station a deputy at the parking lot entrance Saturdays 9 am to 1 pm."],
      acts: [
        { t: ["派人", "Send a deputy"], do: { trust: 1, county: -1 }, done: ["已安排。", "Arranged."] },
        { t: ["请温斯洛警察局", "Ask Winslow police"], do: {}, done: ["已转。", "Referred."] }
      ]
    },
    {
      id: "nov-m-fdpir", from: "navajo", ref: "NN FDPIR", date: "2009-11-18", time: "10:35",
      subject: ["保留地食品分发计划", "Food Distribution Program on Indian Reservations"],
      body: ["纳瓦霍族 FDPIR 办公室：住在保留地边上、在温斯洛买菜的族人，如果符合条件，可以每月在迪尔康或勒普领一箱联邦食品。请县里在发放点贴一张通知。",
        "Navajo Nation FDPIR office: members living near the reservation line who shop in Winslow may qualify for a monthly federal food package at Dilkon or Leupp. Please post a notice at the county food sites."],
      acts: [
        { t: ["贴通知", "Post the notice"], do: { navajo: 1 }, done: ["已贴。", "Posted."] }
      ]
    },
    {
      id: "nov-m-lions", from: "nb", sender: ["温斯洛狮子会", "Winslow Lions Club"], date: "2009-11-16", time: "18:10",
      subject: ["火鸡的登记名单", "Turkey sign-up list"],
      body: ["我们按县发放点的登记表发火鸡，每户一只，先给有 5 口人以上的家庭。请发放点把登记表复印一份给我们，11 月 22 日前。",
        "We will hand out turkeys from the county food site's register, one per household, families of five or more first. Please send us a copy of the register by Nov 22."],
      acts: [
        { t: ["复印给他们", "Send the copy"], do: { trust: 1 }, done: ["已送。", "Sent."] },
        { t: ["登记表不外给", "The register stays private"], do: { trust: -1 }, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-city-permit", from: "nb", sender: ["温斯洛市政府", "City of Winslow"], date: "2009-11-09", when: { flags: ["nov_market_sat"] }, time: "14:50",
      subject: ["周六集市临时许可", "Temporary permit for the Saturday market"],
      body: ["市政府批准市政厅旁空地每周六 9:00 到 14:00 用作集市，到 2010 年 1 月 31 日。要求：每个摊位一张临时摊贩证（$5），卖熟食的要有县食品处理证。",
        "The city approves the lot beside City Hall for a market Saturdays 9 am to 2 pm through Jan 31, 2010. Each stall needs a $5 temporary vendor permit, and cooked food sellers need a county food handler card."]
    },
    {
      id: "nov-m-prices", from: "county", sender: ["县社区服务处", "County Community Services"], date: "2009-11-21", time: "15:30",
      subject: ["温斯洛物价调查", "Winslow price survey"],
      body: ["本周在温斯洛 5 家店、霍尔布鲁克 1 家店记了 20 种常用食品的价格。便利店平均比 Walmart 贵 41%，比霍尔布鲁克 Safeway 贵 33%。",
        "This week staff priced 20 staples at five stores in Winslow and one in Holbrook. Convenience stores average 41% above Walmart and 33% above the Holbrook Safeway."],
      attach: true
    },
    {
      id: "nov-m-kirkpatrick-thanks", from: "nb", sender: ["联邦众议员安·柯克帕特里克办公室", "Office of Rep. Ann Kirkpatrick"], date: "2009-11-19", when: { flags: ["nov_brief_sent"] }, time: "21:40",
      subject: ["收到材料", "Brief received"],
      body: ["谢谢，材料已转给众议员。她会在给农业部的信里引用温斯洛的数字，并问农业部农村发展署有没有可用于农村杂货店的贷款。",
        "Thank you, the brief has gone to the congresswoman. She will cite the Winslow figures in a letter to USDA and ask whether USDA Rural Development has loans for rural grocery stores."]
    },
    {
      id: "nov-m-laposada", from: "nb", sender: ["拉波萨达酒店", "La Posada Hotel"], date: "2009-11-24", time: "13:20",
      subject: ["感恩节送餐名单", "Thanksgiving delivery list"],
      body: ["150 份晚餐 11 月 26 日 10:45 在酒店后门装车。请把送餐地址按街区排好，给每位司机一张单子。",
        "The 150 dinners load at the hotel's back door at 10:45 on Nov 26. Please sort the addresses by neighbourhood and give each driver a list."],
      acts: [
        { t: ["排好名单", "Sort the list"], do: { trust: 1, broadcast: { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "10:00", t: ["拉波萨达酒店今天给送餐名单上的老人送感恩节晚餐，中午前送到。", "La Posada is delivering Thanksgiving dinners to seniors on the meal list today, before noon."] } }, done: ["已排好。", "Sorted."] }
      ]
    },
    {
      id: "nov-m-env-health", from: "county", sender: ["县卫生服务区环境卫生科", "Public Health, Environmental Health"], date: "2009-11-13", time: "12:30",
      subject: ["食品发放点检查", "Food site inspections"],
      body: ["检查了温斯洛三个发放点：支联会中心合格；圣约瑟夫教堂冷藏温度 9°C，要求整改；北帕克大道点地面有积水，已处理。",
        "Inspected three Winslow food sites: the stake center passed; St. Joseph's cooler was at 9°C and must be fixed; standing water at the North Park Drive site has been dealt with."],
      acts: [
        { t: ["给圣约瑟夫教堂借一台冷柜", "Lend St. Joseph's a cooler"], do: { trust: 1 }, done: ["已借出。", "Lent."] },
        { t: ["限期整改", "Order a fix by deadline"], do: {}, done: ["已发整改通知。", "Notice issued."] }
      ]
    },
    {
      id: "nov-m-lease-review", from: "county", sender: ["县检察官办公室", "County Attorney's Office"], date: "2009-11-07", when: { flags: ["nov_bashas_pantry"] }, time: "11:45",
      subject: ["原 Bashas' 店面租约意见", "Opinion on the old Bashas' lease"],
      body: ["县检察官布拉德·卡里昂：租约第 9 条要县里承担业主的全部责任，建议改为各自承担。业主律师已口头同意，书面修改 11 月 10 日前给。",
        "County Attorney Brad Carlyon: Section 9 has the county indemnifying the landlord for everything; he recommends mutual indemnity. The landlord's lawyer agreed by phone and will send the written change by Nov 10."]
    },
    {
      id: "nov-m-aia-crowd", from: "nb", sender: ["亚利桑那校际体育协会", "Arizona Interscholastic Association"], ref: "AIA FB-09-PO", date: "2009-11-02", time: "09:00",
      subject: ["季后赛观众规定回执", "Playoff crowd policy form"],
      body: ["请各县在 11 月 4 日 12:00 前回执：主场观众上限、是否测温、客队球迷能否入场。没有回执的，按主场学校的方案执行。",
        "Each county should return the form by noon on Nov 4: home crowd cap, temperature checks, and whether visiting fans are admitted. Without a reply, the host school's plan applies."],
      acts: [
        { t: ["按县里的方案回执", "Return it with the county's plan"], do: { fed: 1 }, done: ["已回执。", "Form returned."] },
        { t: ["交给学校填", "Let the schools fill it in"], do: {}, done: ["已转学校。", "Passed to schools."] }
      ]
    },
    {
      id: "nov-m-aia-final", from: "nb", sender: ["亚利桑那校际体育协会", "Arizona Interscholastic Association"], date: "2009-11-23", when: { flags: ["nov_final_move"] }, time: "17:30",
      subject: ["回复：决赛场地", "Re: championship site"],
      body: ["谢谢县里的提议。肖洛高中主场座位约 3,000，不够两校的票数，AIA 维持 Walkup Skydome。AIA 同意 KVWM 免费直播决赛。",
        "Thank you for the suggestion. Show Low High seats about 3,000, not enough for both schools, so AIA is keeping the Walkup Skydome. AIA agrees to let KVWM broadcast the final free of charge."],
      acts: [
        { t: ["知道了", "Noted"], do: { broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "18:00", t: ["11 月 28 日 3A 决赛蓝岭对肖洛，KVWM 970 全场直播，18:00 开球。", "Blue Ridge vs Show Low in the 3A final on Nov 28, live on KVWM 970. Kickoff 6 pm."] } }, done: ["已知悉。", "Noted."] }
      ]
    },
    {
      id: "nov-m-showlow-usd", from: "nb", sender: ["肖洛联合学区", "Show Low Unified School District"], date: "2009-11-04", time: "14:15",
      subject: ["请县卫生服务区派人到入口", "Public Health at the gates"],
      body: ["11 月 6 日主场季后赛，学区请县卫生服务区派 4 人在入口测温，学区出 8 名老师协助。开门时间 17:30。",
        "For the Nov 6 home playoff game, the district asks Public Health for four people to run temperature checks at the gates, with eight teachers helping. Gates open at 5:30 pm."],
      acts: [
        { t: ["派 4 人", "Send four"], do: { trust: 1, county: -1 }, done: ["已安排。", "Arranged."] },
        { t: ["派 2 人", "Send two"], do: {}, done: ["已安排两人。", "Two arranged."] }
      ]
    },
    {
      id: "nov-m-blueridge-usd", from: "nb", sender: ["蓝岭联合学区", "Blue Ridge Unified School District"], date: "2009-11-10", time: "10:00",
      subject: ["四分之一决赛的救护车待命", "Ambulance standby for the quarterfinal"],
      body: ["莱克赛德消防区的救护车本周有两辆在送病人去弗拉格斯塔夫，学区请县里协调一辆救护车在 11 月 13 日比赛时待命。",
        "Two of Lakeside Fire District's ambulances are tied up on Flagstaff transfers this week. The district asks the county to arrange an ambulance on standby for the Nov 13 game."],
      acts: [
        { t: ["从肖洛消防区调一辆", "Borrow one from the Show Low Fire District"], do: { trust: 1 }, done: ["已协调。", "Arranged."] },
        { t: ["请学区自己联系", "Ask the district to arrange it"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-winslow-usd", from: "nb", sender: ["温斯洛联合学区", "Winslow Unified School District"], date: "2009-11-09", time: "08:50",
      subject: ["四分之一决赛出行", "Quarterfinal travel"],
      body: ["球队、乐队和工作人员共 112 人，三辆校车。学区要县卫生服务区出一份出行前的健康提示，发给家长。",
        "Team, band and staff, 112 people on three buses. The district wants a pre-trip health notice from Public Health to send to parents."],
      acts: [
        { t: ["写好发过去", "Write and send it"], do: { trust: 1 }, done: ["已发。", "Sent."] }
      ]
    },
    {
      id: "nov-m-payson", from: "nb", sender: ["佩森联合学区", "Payson Unified School District"], date: "2009-11-09", when: { flags: ["nov_fb_payson"] }, time: "15:20",
      subject: ["佩森高中承办中立场比赛", "Payson High hosts the neutral-site game"],
      body: ["佩森高中 11 月 13 日承办温斯洛的四分之一决赛。希拉县卫生部门要求所有观众入场测温。温斯洛一方分到 1,200 张票。",
        "Payson High will host Winslow's quarterfinal on Nov 13. Gila County health requires temperature checks for all spectators. Winslow gets 1,200 tickets."]
    },
    {
      id: "nov-m-kvwm", from: "nb", sender: ["KVWM 970 AM", "KVWM 970 AM"], date: "2009-11-03", time: "11:40",
      subject: ["季后赛转播赞助", "Playoff broadcast sponsorship"],
      body: ["KVWM 想在季后赛转播中插播县卫生服务区的接种提醒，每场 6 条，免费。只需要县里提供 30 秒的录音稿。",
        "KVWM would like to run County Public Health vaccine reminders during playoff broadcasts, six per game, free. The county only needs to supply a 30-second script."],
      acts: [
        { t: ["提供录音稿", "Send a script"], do: { trust: 1, panic: -1, broadcast: { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "19:40", t: ["中场提醒：24 岁以下、孕妇、家里有小婴儿的，请到县卫生服务区预约 H1N1 疫苗。", "Halftime reminder: under 24, pregnant, or caring for a baby? Book your H1N1 shot with County Public Health."] } }, done: ["已提供。", "Script sent."] }
      ]
    },
    {
      id: "nov-m-dps", from: "nb", sender: ["公共安全部第 3 区（霍尔布鲁克）", "DPS Highway Patrol District 3, Holbrook"], date: "2009-11-05", time: "13:05",
      subject: ["季后赛之夜的交通安排", "Traffic plan for playoff nights"],
      body: ["11 月 6 日和 13 日，第 3 区在 260 号公路肖洛到派恩托普之间各加派两辆巡逻车，18:00 到 23:30。",
        "On Nov 6 and Nov 13, District 3 will add two units on SR 260 between Show Low and Pinetop, 6 to 11:30 pm."]
    },
    {
      id: "nov-m-coconino-final", from: "nb", sender: ["科科尼诺县卫生部门", "Coconino County Health Department"], date: "2009-11-24", time: "10:25",
      subject: ["决赛观众须知", "Rules for final spectators"],
      body: ["Skydome 是室内场馆。科科尼诺县要求：观众入场测温，发烧的不能入场；场内建议戴口罩；看台隔排坐。请贵县转告两校球迷。",
        "The Skydome is indoors. Coconino County requires temperature checks at entry, with anyone feverish turned away; masks recommended inside; every other row in the stands. Please pass this on to both schools' fans."],
      acts: [
        { t: ["转告并在电台播报", "Pass it on and announce on the radio"], do: { panic: -1, broadcast: { ch: "nb", name: ["KNAU 88.7 FM · 弗拉格斯塔夫", "KNAU 88.7 FM · Flagstaff"], time: "07:35", t: ["科科尼诺县卫生部门：周六 Skydome 决赛入场测温，看台隔排坐，建议戴口罩。", "Coconino County health: temperature checks at Saturday's final at the Skydome, every other row, masks recommended."] } }, done: ["已转告。", "Passed on."] }
      ]
    },
    {
      id: "nov-m-sheriff-final", from: "county", sender: ["县警长办公室", "Navajo County Sheriff's Office"], date: "2009-11-27", time: "15:00",
      subject: ["决赛之夜勤务安排", "Duty plan for championship night"],
      body: ["11 月 28 日 20:00 到次日 1:00，260 号公路肖洛到莱克赛德加派 4 辆车，检查点照常。需要加班 32 小时。",
        "Nov 28, 8 pm to 1 am: four extra units on SR 260 from Show Low to Lakeside, checkpoints as usual. Requires 32 hours of overtime."],
      acts: [
        { t: ["批准", "Approve"], do: { county: -2, trust: 1 }, done: ["已批准。", "Approved."] },
        { t: ["只加 2 辆", "Two units only"], do: { county: -1 }, done: ["已批准 2 辆。", "Two approved."] }
      ]
    },
    {
      id: "nov-m-nau", from: "nb", sender: ["北亚利桑那大学体育部", "NAU Athletics"], date: "2009-11-25", when: { flags: ["nov_fb_buses"] }, time: "09:30",
      subject: ["巴士停车", "Coach parking"],
      body: ["纳瓦霍县的巴士可以停在 Skydome 北侧的停车场，司机凭车窗卡进出，15:00 开放。",
        "Navajo County's coaches can use the lot north of the Skydome, with window passes for drivers. Opens at 3 pm."]
    },
    {
      id: "nov-m-pinetop-parade", from: "nb", sender: ["派恩托普-莱克赛德镇", "Town of Pinetop-Lakeside"], date: "2009-11-28", time: "11:15",
      subject: ["冠军游行路线", "Championship parade route"],
      body: ["如果蓝岭赢，11 月 29 日 14:00 游行，从蓝岭高中出发沿白山大道到镇政府，约 2 英里，需要封路 1 小时。",
        "If Blue Ridge wins, a parade on Nov 29 at 2 pm from Blue Ridge High along White Mountain Boulevard to town hall, about 2 miles, with the road closed for an hour."],
      acts: [
        { t: ["同意封路", "Approve the closure"], do: { trust: 1 }, done: ["已同意。", "Approved."] }
      ]
    },
    {
      id: "nov-m-boosters", from: "nb", sender: ["蓝岭高中家长会", "Blue Ridge Booster Club"], date: "2009-11-14", time: "20:05",
      subject: ["谢谢借洗手台", "Thanks for the hand-wash units"],
      body: ["周五小卖部收入 $2,780，比去年同期还多。洗手台能再借到 11 月 20 日吗？半决赛在弗拉格斯塔夫，我们想带去。",
        "Friday's snack bar took $2,780, more than last year. Can we keep the hand-wash units until Nov 20? The semifinal is in Flagstaff and we would like to take them along."],
      acts: [
        { t: ["借到 11 月 20 日", "Until Nov 20"], do: { trust: 1 }, done: ["已同意。", "Agreed."] },
        { t: ["收回", "Take them back"], do: {}, done: ["已收回。", "Collected."] }
      ]
    },
    {
      id: "nov-m-parsons-eoc", from: "county", sender: ["助理县行政长官", "Assistant County Manager"], date: "2009-11-01", time: "18:30",
      subject: ["11 月应急行动中心排班", "November EOC roster"],
      body: ["达斯蒂·帕森斯：11 月应急行动中心每天 7:00 到 19:00 有人，夜间一人值守。11 月 11 日和 26 日是假日，按半数排班。排班表附后，有冲突的周三前告诉我。",
        "Dusty Parsons: the EOC is staffed 7 am to 7 pm daily in November, with one person overnight. Nov 11 and 26 are holidays and run at half strength. Roster attached; flag conflicts by Wednesday."],
      attach: true
    },
    {
      id: "nov-m-jayne-budget", from: "county", sender: ["县行政长官办公室", "County Manager's Office"], ref: "CM 09-212", date: "2009-11-10", time: "08:15",
      subject: ["年中预算提醒", "Mid-year budget memo"],
      body: ["县行政长官詹姆斯·杰恩：本财年应急支出已用掉年度预备金的 61%。从今天起，单笔超过 $25K 的应急支出要先报县行政长官办公室。",
        "County Manager James Jayne: emergency spending this fiscal year has used 61% of the annual contingency. From today, any single emergency expense over $25K needs prior sign-off from the County Manager's office."],
      acts: [
        { t: ["照办", "Comply"], do: { county: 10 }, done: ["已通知各部门。", "Departments notified."] },
        { t: ["请他放宽到 $50K", "Ask him to raise it to $50K"], do: { trust: 1 }, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-clerk-agenda", from: "county", sender: ["监事会书记", "Clerk of the Board"], date: "2009-11-09", time: "10:40",
      subject: ["下次监事会会议议程", "Agenda for the next Board meeting"],
      body: ["请各部门 11 月 18 日 17:00 前交议程项目。目前已列：温斯洛食品供应决议、县看守所医疗合同续签、希伯县办公点备用电源采购。",
        "Departments, please submit agenda items by 5 pm on Nov 18. So far: the Winslow food supply resolution, renewal of the jail medical contract, and a backup generator for the Heber county office."],
      acts: [
        { t: ["加一项：购物班车延到 12 月", "Add: extend the shopping van into December"], do: { trust: 1 }, done: ["已提交。", "Submitted."] },
        { t: ["没有新的", "Nothing to add"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-finance", from: "county", sender: ["县财务处", "County Finance"], date: "2009-11-17", time: "16:10",
      subject: ["本周现金情况", "Cash position this week"],
      body: ["一般基金本周收入 $571K，支出 $668K。11 月应急支出累计 $214K，其中食品和班车 $61K，疫苗相关 $78K。",
        "General fund receipts this week $571K, disbursements $668K. November emergency spending to date $214K: food and the van $61K, vaccine-related $78K."],
      attach: true
    },
    {
      id: "nov-m-catalyst", from: "nb", sender: ["Catalyst Paper 斯诺弗莱克厂", "Catalyst Paper, Snowflake Mill"], date: "2009-11-09", time: "06:40",
      subject: ["复工通知", "Restart notice"],
      body: ["纸机今天 6:00 复工，全厂恢复三班倒。外来车辆一律走北门登记。",
        "The paper machine restarts at 6 am today and the mill is back on three shifts. All outside vehicles sign in at the north gate."]
    },
    {
      id: "nov-m-agfd", from: "nb", sender: ["州狩猎渔业厅平托普地区办公室", "Arizona Game and Fish, Pinetop Region"], date: "2009-11-12", time: "09:30",
      subject: ["11 月下旬至 12 月狩猎日期", "Late November and December hunt dates"],
      body: ["本县猎区的麋鹿和鹿狩猎从 11 月 20 日起分批开始。猎人营地集中在希伯南边的森林路和派恩托普东边。执法员会在营地发放县里的健康提示单。",
        "Elk and deer hunts in the county's units start in waves from Nov 20. Camps cluster along forest roads south of Heber and east of Pinetop. Officers will hand out the county health notice at camps."],
      acts: [
        { t: ["送 2,000 份提示单过去", "Send 2,000 notices"], do: { trust: 1 }, done: ["已送。", "Sent."] }
      ]
    },
    {
      id: "nov-m-nws", from: "nb", sender: ["国家气象局弗拉格斯塔夫办公室", "National Weather Service, Flagstaff"], date: "2009-11-15", time: "14:00",
      subject: ["应急管理冬季天气简报", "Winter weather briefing for emergency managers"],
      body: ["未来两周有两次冷空气，莫戈隆边缘可能各下 3 到 8 英寸雪，霍尔布鲁克和温斯洛以小雪和大风为主。11 月 17 日 10:00 电话简报。",
        "Two cold systems in the next two weeks could each bring 3 to 8 inches to the Rim, with light snow and wind in Holbrook and Winslow. Phone briefing Nov 17 at 10 am."],
      acts: [
        { t: ["派人参加简报", "Join the briefing"], do: {}, done: ["已登记。", "Registered."] }
      ]
    },
    {
      id: "nov-m-kayenta", from: "navajo", sender: ["凯恩塔镇区", "Kayenta Township"], date: "2009-11-12", time: "15:45",
      subject: ["驻点副警长的办公室", "Office for the stationed deputies"],
      body: ["镇区可以把镇区办公楼一层的两间房给驻点副警长用，每月 $400 水电费。请县里 11 月 16 日前回复。",
        "The township can give the stationed deputies two ground-floor rooms in the township building for $400 a month in utilities. Please reply by Nov 16."],
      acts: [
        { t: ["接受", "Accept"], do: { navajo: 2 }, done: ["已接受。", "Accepted."] },
        { t: ["副警长用巡逻车办公", "Deputies will work from their vehicles"], do: { navajo: -1 }, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-nps", from: "nb", sender: ["石化林国家公园", "Petrified Forest National Park"], date: "2009-11-05", time: "11:20",
      subject: ["感恩节开放时间", "Thanksgiving hours"],
      body: ["公园感恩节照常开放，8:00 到 17:00。彩绘沙漠游客中心的餐厅关闭一天。",
        "The park is open as usual on Thanksgiving, 8 am to 5 pm. The Painted Desert Visitor Center restaurant is closed that day."],
      acts: [
        { t: ["在电台上告诉大家", "Mention it on the radio"], do: { trust: 1, broadcast: { ch: "county", name: ["KDJI 1270 AM · 霍尔布鲁克", "KDJI 1270 AM · Holbrook"], time: "16:30", t: ["石化林国家公园感恩节照常开放，早 8 点到晚 5 点。", "Petrified Forest National Park is open Thanksgiving Day, 8 am to 5 pm."] } }, done: ["已播报。", "Announced."] }
      ]
    },
    {
      id: "nov-m-navopache", from: "nb", sender: ["Navopache 电力合作社", "Navopache Electric Cooperative"], date: "2009-11-16", time: "10:15",
      subject: ["冬季欠费户转介", "Winter arrears referrals"],
      body: ["合作社列出 312 户欠费超过 60 天，其中 118 户是今年 9 月后开户的。名单已加密发给县社区服务处，请协助办理 LIHEAP。",
        "The co-op lists 312 accounts more than 60 days behind, 118 of them opened since September. The encrypted list has gone to County Community Services for LIHEAP help."],
      acts: [
        { t: ["受理", "Take the referrals"], do: { trust: 1 }, done: ["已受理。", "Accepted."] }
      ]
    },
    {
      id: "nov-m-forest", from: "nb", sender: ["阿帕奇-锡特格里夫斯国家森林", "Apache-Sitgreaves National Forests"], date: "2009-11-10", time: "13:50",
      subject: ["柴火和猎人营地", "Firewood and hunting camps"],
      body: ["林务官克里斯·诺普：个人柴火许可证延长到 12 月 31 日，每户上限 10 考得。猎人营地 14 天限期照常，执法人员会配合县里发提示单。",
        "Forest Supervisor Chris Knopp: personal firewood permits are extended to Dec 31, up to 10 cords per household. The 14-day camping limit stays for hunting camps, and forest officers will help hand out county notices."]
    },
    {
      id: "nov-m-court", from: "county", sender: ["县高等法院行政处", "Superior Court Administration"], date: "2009-11-13", time: "09:10",
      subject: ["陪审员候选人到庭情况", "Juror turnout"],
      body: ["11 月陪审员到庭率 34%。法院考虑把非羁押案件的庭审推到 1 月，请县检察官办公室和公设辩护人办公室 11 月 20 日前回复意见。",
        "November juror turnout is 34%. The court is considering moving non-custody trials to January and asks the County Attorney and Public Defender for views by Nov 20."]
    },
    {
      id: "nov-m-npc-tuition", from: "nb", sender: ["北地先锋学院", "Northland Pioneer College"], date: "2009-11-18", time: "11:30",
      subject: ["县内学费的居住证明", "Residency proof for in-district tuition"],
      body: ["学院董事会同意：持县记录官办公室临时居住证明的学生，春季按县内学费收费，每学分 $62。",
        "The college board agrees that students with a temporary residency letter from the county Recorder pay in-district tuition this spring, $62 a credit."]
    },
    {
      id: "nov-m-holbrook-usd", from: "nb", sender: ["霍尔布鲁克联合学区", "Holbrook Unified School District"], date: "2009-11-23", time: "08:20",
      subject: ["新入学学生人数", "New enrollment count"],
      body: ["截至 11 月 20 日，新入学 211 人，其中小学 129 人。学区需要两间活动教室，问能不能用县里的拖车点的空拖车。",
        "As of Nov 20, 211 new students, 129 in elementary grades. The district needs two portable classrooms and asks whether empty trailers from the county site could be used."],
      acts: [
        { t: ["借两台拖车", "Lend two trailers"], do: { trust: 2 }, done: ["已安排。", "Arranged."] },
        { t: ["拖车要留着住人", "The trailers are for housing"], do: { trust: -1 }, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-navajo-election", from: "navajo", sender: ["纳瓦霍选举管理处", "Navajo Election Administration"], date: "2009-11-24", time: "14:40",
      subject: ["12 月 15 日公投投票点", "Dec 15 referendum polling places"],
      body: ["本县境内 17 个分会投票点的名单和开放时间已定（7:00 到 19:00）。请县警长办公室当天在凯恩塔和迪尔康附近加强巡逻。",
        "The 17 chapter polling places in the county and their hours, 7 am to 7 pm, are set. Please have the Sheriff's Office step up patrols near Kayenta and Dilkon that day."],
      attach: true,
      acts: [
        { t: ["安排巡逻", "Schedule patrols"], do: { navajo: 2 }, done: ["已安排。", "Scheduled."] }
      ]
    },
    {
      id: "nov-m-hopi-election", from: "nb", sender: ["霍皮族选举委员会", "Hopi Tribe Election Board"], date: "2009-11-03", time: "12:20",
      subject: ["初选和大选日期", "Primary and general election dates"],
      body: ["初选 11 月 4 日，大选 11 月 18 日，投票 7:00 到 19:00。各村投票点名单附后。",
        "Primary Nov 4 and general election Nov 18, polls 7 am to 7 pm. Village polling places attached."],
      attach: true,
      acts: [
        { t: ["在电台上转告", "Pass it on by radio"], do: { navajo: 1, broadcast: { ch: "nb", name: ["KUYI 88.1 FM · 霍特维拉", "KUYI 88.1 FM · Hotevilla"], time: "06:30", t: ["霍皮族初选 11 月 4 日，大选 11 月 18 日，早 7 点到晚 7 点。", "Hopi primary Nov 4, general election Nov 18, polls 7 am to 7 pm."] } }, done: ["已转告。", "Passed on."] }
      ]
    },
    {
      id: "nov-m-wmat", from: "nb", sender: ["白山阿帕奇族主席办公室", "White Mountain Apache Tribe, Chairman's Office"], date: "2009-11-19", time: "10:50",
      subject: ["怀特里弗的接种", "Vaccination in Whiteriver"],
      body: ["怀特里弗印第安卫生署医院本周给族人打了 1,600 剂。住在派恩托普和莱克赛德的族人也可以回怀特里弗打，请县里在白山地区告诉大家。",
        "Whiteriver IHS Hospital gave 1,600 doses to tribal members this week. Members living in Pinetop and Lakeside can also come back to Whiteriver. Please let people in the White Mountains know."],
      acts: [
        { t: ["请 KNNB 和 KVWM 播", "Ask KNNB and KVWM to air it"], do: { navajo: 1, broadcast: { ch: "nb", name: ["KNNB 88.1 FM · 怀特里弗", "KNNB 88.1 FM · Whiteriver"], time: "08:15", t: ["怀特里弗医院每天 8 点到 16 点给族人打 H1N1 疫苗，住在派恩托普、莱克赛德的族人也可以来。", "Whiteriver hospital gives tribal members H1N1 shots daily 8 am to 4 pm, including members living in Pinetop and Lakeside."] } }, done: ["已安排。", "Arranged."] }
      ]
    },
    {
      id: "nov-m-veterans", from: "nb", sender: ["霍尔布鲁克退伍军人组织联席会", "Holbrook veterans' groups"], date: "2009-11-09", time: "17:05",
      subject: ["退伍军人节仪式", "Veterans Day ceremony"],
      body: ["11 月 11 日 11:00 在老县法院前举行，升旗、默哀、点名。请县里借 150 把折叠椅，10:00 前送到。",
        "Nov 11 at 11 am in front of the old county courthouse: colors, a moment of silence and roll call. Please lend 150 folding chairs, delivered by 10 am."],
      acts: [
        { t: ["送椅子", "Send the chairs"], do: { trust: 1 }, done: ["已安排。", "Arranged."] }
      ]
    },
    {
      id: "nov-m-chamber", from: "nb", sender: ["霍尔布鲁克商会", "Holbrook Chamber of Commerce"], date: "2009-11-17", time: "13:35",
      subject: ["圣诞游行报名", "Christmas parade entries"],
      body: ["已报名 26 辆彩车，比去年少 9 辆。商会想请县里出一辆扫雪车参加游行，挂灯，往年小孩最喜欢。",
        "Twenty-six floats are signed up, nine fewer than last year. The chamber would like a county snowplow in the parade with lights on it; the kids love it every year."],
      acts: [
        { t: ["出一辆", "Send one"], do: { trust: 2 }, done: ["已答应。", "Agreed."] },
        { t: ["扫雪车要待命", "The plows stay on standby"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-library", from: "county", sender: ["纳瓦霍县图书馆区", "Navajo County Library District"], date: "2009-11-13", time: "14:10",
      subject: ["各馆公共电脑使用量", "Public computer use at branches"],
      body: ["10 月公共电脑使用比 9 月多 47%，温斯洛和霍尔布鲁克最多。图书馆区可以用州图书馆的拨款加 6 台电脑，需要县里出网络费每月 $180。",
        "Public computer use rose 47% from September to October, most in Winslow and Holbrook. The library district can add six computers with a state library grant if the county covers $180 a month in connection fees."],
      acts: [
        { t: ["出网络费", "Cover the fees"], do: { trust: 1 }, done: ["已同意。", "Agreed."] },
        { t: ["不出", "No"], do: {}, done: ["已回复。", "Replied."] }
      ]
    },
    {
      id: "nov-m-aps-lodging", from: "nb", sender: ["APS 乔拉电厂", "APS Cholla Power Plant"], date: "2009-11-16", when: { flags: ["nov_aps_ask"] }, time: "16:15",
      subject: ["承包商住宿", "Contractor lodging"],
      body: ["我们会让主承包商把约 80 人改住到温斯洛和弗拉格斯塔夫，并在电厂内的空地放 20 台房车。霍尔布鲁克的按月房间不再续订。",
        "We will have the prime contractor move about 80 workers to Winslow and Flagstaff and put 20 RVs on open ground inside the plant. Monthly rooms in Holbrook will not be renewed."],
      acts: [
        { t: ["回信致谢", "Send thanks"], do: { trust: 1 }, done: ["已回信。", "Thanks sent."] }
      ]
    },
    {
      id: "nov-m-adem-traffic", from: "fed", ref: "ADEM 09-0731", date: "2009-11-23", time: "09:00",
      subject: ["北上车流周报", "Weekly northbound traffic counts"],
      body: ["上周 77 号公路肖洛以南计数点日均北上 2,140 辆，比前一周少 6%；I-40 温斯洛以西东行 7,800 辆，持平。感恩节周预计增加。",
        "Last week SR 77 south of Show Low averaged 2,140 northbound vehicles a day, down 6% on the week before; I-40 eastbound west of Winslow was flat at 7,800. Expect more over Thanksgiving week."],
      attach: true
    },
    {
      id: "nov-m-sheriff-week", from: "county", sender: ["县警长办公室", "Navajo County Sheriff's Office"], date: "2009-11-30", time: "17:40",
      subject: ["11 月勤务小结", "November duty summary"],
      body: ["11 月出警 1,942 次，其中检查点相关 388 次、交通 512 次、家庭纠纷 141 次。季后赛和感恩节期间加班合计 610 小时。凯恩塔和皮农驻点 11 月 16 日起运行。",
        "November: 1,942 calls for service, 388 checkpoint-related, 512 traffic, 141 domestic. Playoff and Thanksgiving overtime totalled 610 hours. The Kayenta and Piñon posts have run since Nov 16."],
      attach: true
    },
    {
      id: "nov-m-lds-thanks", from: "lds", ref: "Snowflake AZ Stake", date: "2009-11-27", time: "12:30",
      subject: ["12 月的志愿者", "Volunteers for December"],
      body: ["斯诺弗莱克支联会青年 12 月每周六可以出 30 人，帮发放点和老人中心搬货、扫雪。请县社区服务处给一个联系人。",
        "Snowflake stake youth can send 30 volunteers every Saturday in December to move stock and shovel snow at food sites and senior centers. Please give us a contact in County Community Services."],
      acts: [
        { t: ["指定联系人", "Name a contact"], do: { lds: 2 }, done: ["已指定。", "Contact named."] }
      ]
    }
  ],
  broadcasts: [
    { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "07:00", t: ["北帕克大道的 Bashas' 已于 10 月 10 日关门。原来在那里取药的，请把处方转到别的药房。", "The Bashas' on North Park Drive closed on Oct 10. If you filled prescriptions there, please transfer them to another pharmacy."] },
    { ch: "county", name: ["KDJI 1270 AM · 霍尔布鲁克", "KDJI 1270 AM · Holbrook"], time: "08:05", t: ["县卫生服务区：H1N1 疫苗按州里配额分批到货，每批的接种时间和地点在本台公布。", "County Public Health: H1N1 vaccine arrives in batches under the state allotment. Times and places for each batch will be announced here."] },
    { ch: "navajo", name: ["KTNN 660 AM · 窗岩", "KTNN 660 AM · Window Rock"], time: "06:30", t: ["纳瓦霍族卫生部：各分会的 H1N1 接种按印第安卫生署到货安排，请留意本台和分会会所的通知。", "Navajo Division of Health: H1N1 clinics at chapters follow IHS deliveries. Watch for notices on this station and at chapter houses."] },
    { ch: "county", name: ["KVWM 970 AM · 肖洛", "KVWM 970 AM · Show Low"], time: "19:00", t: ["每周五晚 7 点直播白山地区高中橄榄球，肖洛、蓝岭两队比分轮流报。", "High school football from the White Mountains live every Friday at 7 pm, with scores from Show Low and Blue Ridge."] },
    { ch: "nb", name: ["KUYI 88.1 FM · 霍特维拉", "KUYI 88.1 FM · Hotevilla"], time: "12:00", t: ["霍皮族选举委员会：主席和副主席初选 11 月 4 日，大选 11 月 18 日。", "Hopi Tribe Election Board: the primary for chairman and vice chairman is Nov 4, the general election Nov 18."] },
    { ch: "county", name: ["KINO 1230 AM · 温斯洛", "KINO 1230 AM · Winslow"], time: "11:30", t: ["温斯洛老人中心午餐照常 11:30 开饭。行动不便需要送餐的老人，请打电话给 NACOG 老龄事务处登记。", "Lunch at the Winslow senior center is still served at 11:30. Seniors who cannot get out and need meals delivered can sign up with the NACOG Area Agency on Aging."] },
    { ch: "nb", name: ["KTHQ 92.5 FM · 伊格", "KTHQ 92.5 FM · Eagar"], time: "17:45", t: ["圆谷高中本季主场比赛照常在 Round Valley Dome 举行，入口测体温。", "Round Valley home games are still at the Round Valley Dome this season, with temperature checks at the door."] }
  ]
});
