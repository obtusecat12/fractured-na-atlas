// 内容包：纳瓦霍县开局（2009年10月14日起）。格式见 docs/CONTENT_GUIDE.md
CONTENT.add({
 "id": "base-2009-10",
 "title": [
  "纳瓦霍县开局",
  "Navajo County opening"
 ],
 "by": "fna",
 "events": [
  {
   "id": "holbrook-winslow-football",
   "date": "2009-10-14",
   "start": true,
   "icon": "q",
   "title": [
    "周五橄榄球赛",
    "Friday football"
   ],
   "body": [
    "霍尔布鲁克高中 Roadrunners 周五晚 7 点主场对温斯洛高中 Bulldogs。往年能来两千多人。州应急管理局建议取消，学区说听县里的。",
    "Holbrook High plays Winslow High at home on Friday at 7 pm. It usually draws over two thousand people. The state recommends cancelling; the school district will follow the county."
   ],
   "opts": [
    {
     "t": [
      "照常举行",
      "Play as usual"
     ],
     "do": {
      "trust": 5,
      "fed": -3
     }
    },
    {
     "t": [
      "限 800 人，入场测体温",
      "Cap at 800, temperature checks at the gate"
     ],
     "do": {
      "trust": 2,
      "panic": -1
     }
    },
    {
     "t": [
      "不卖票，KINO 电台直播",
      "No crowd, live on KINO"
     ],
     "do": {
      "panic": -2,
      "fed": 2
     }
    }
   ]
  },
  {
   "id": "snowflake-mill-idle",
   "date": "2009-10-20",
   "title": [
    "斯诺弗莱克纸厂",
    "Snowflake mill"
   ],
   "body": [
    "Catalyst Paper 通知县里，斯诺弗莱克纸厂下周起再停两周，近 300 人回家。七月已经停过一次。斯诺弗莱克镇长凯利·威利斯问县里能做什么。",
    "Catalyst Paper tells the county the Snowflake mill will idle for two weeks from next week, sending nearly 300 people home. It already idled once in July. Snowflake Mayor Kelly Willis asks what the county can do."
   ],
   "opts": [
    {
     "t": [
      "把停工工人雇来做流调",
      "Hire the idled workers as contact tracers"
     ],
     "do": {
      "trust": 3,
      "lds": 2,
      "county": -120
     },
     "fx": [
      "信任 +3 · 教会 +2 · $120K",
      "Trust +3 · LDS +2 · $120K"
     ]
    },
    {
     "t": [
      "请泰勒支联会的福利委员会接手",
      "Ask the Taylor stake's welfare committee to help"
     ],
     "do": {
      "lds": 3,
      "trust": -1
     },
     "fx": [
      "教会 +3 · 信任 −1",
      "LDS +3 · Trust −1"
     ]
    },
    {
     "t": [
      "县里不出面",
      "Stay out of it"
     ],
     "do": {
      "trust": -3
     },
     "fx": [
      "信任 −3",
      "Trust −3"
     ]
    }
   ]
  },
  {
   "id": "navajo-shelly-acting",
   "date": "2009-10-26",
   "title": [
    "窗岩",
    "Window Rock"
   ],
   "body": [
    "纳瓦霍族议会表决让族长小乔·雪利行政休假，副族长本·谢利代理族长。族应急管理部说，之前和县里谈好的事照旧，但签字要等代理族长办公室。",
    "The Navajo Nation Council votes to put President Joe Shirley Jr. on administrative leave. Vice President Ben Shelly becomes acting president. The Nation's emergency management office says earlier agreements with the county stand, but signatures now go through the acting president's office."
   ],
   "opts": [
    {
     "t": [
      "照常和族应急管理部对接",
      "Keep working through Navajo emergency management"
     ],
     "do": {
      "flag": "shelly"
     },
     "fx": [
      "无变化",
      "No change"
     ]
    },
    {
     "t": [
      "给代理族长办公室去函，确认现有协议",
      "Write to the acting president's office to confirm existing agreements"
     ],
     "do": {
      "navajo": 3,
      "flag": "shelly"
     },
     "fx": [
      "纳瓦霍族 +3",
      "Navajo +3"
     ]
    },
    {
     "t": [
      "暂停新的合作，等族内局势明朗",
      "Pause new joint work until things settle"
     ],
     "do": {
      "navajo": -4,
      "panic": -1,
      "flag": "shelly"
     },
     "fx": [
      "纳瓦霍族 −4 · 恐慌 −1",
      "Navajo −4 · Panic −1"
     ]
    }
   ]
  },
  {
   "id": "kayenta-pinon-deputies",
   "date": "2009-11-16",
   "title": [
    "凯恩塔和皮农",
    "Kayenta and Piñon"
   ],
   "body": [
    "警长 K.C. 克拉克和纳瓦霍族公共安全部谈妥了草案：县警长副手拿族里的委任，在凯恩塔和皮农驻点。需要监事会表决。",
    "Sheriff K.C. Clark and the Navajo Division of Public Safety have a draft: sheriff's deputies take Navajo Nation commissions and are stationed in Kayenta and Piñon. It needs a Board vote."
   ],
   "opts": [
    {
     "t": [
      "列入下次监事会议程",
      "Put it on the Board's next agenda"
     ],
     "do": {
      "navajo": 1,
      "flag": "deputize"
     },
     "fx": [
      "条例页可表决",
      "Votable under Ordinances"
     ]
    },
    {
     "t": [
      "再等一个月",
      "Wait another month"
     ],
     "do": {
      "navajo": -2
     },
     "fx": [
      "纳瓦霍族 −2",
      "Navajo −2"
     ]
    }
   ]
  },
  {
   "id": "hopi-sr77-access",
   "date": "2009-11-18",
   "title": [
    "基科茨莫维",
    "Kykotsmovi"
   ],
   "body": [
    "霍皮族选出了主席勒罗伊·辛戈伊特瓦，12月1日就职。族里问，去霍尔布鲁克的 SR 77 能不能在白天放行族人的车。",
    "The Hopi Tribe has elected Leroy Shingoitewa chairman; he takes office Dec 1. The tribe asks whether Hopi vehicles can use SR 77 to Holbrook during the day."
   ],
   "opts": [
    {
     "t": [
      "白天放行，入城测体温",
      "Daytime access, temperature check at town"
     ],
     "do": {
      "navajo": 2,
      "panic": 1,
      "flag": "hopi_chair"
     },
     "fx": [
      "纳瓦霍族 +2 · 恐慌 +1",
      "Navajo +2 · Panic +1"
     ]
    },
    {
     "t": [
      "只放行送货车",
      "Delivery trucks only"
     ],
     "do": {
      "trust": 1,
      "flag": "hopi_chair"
     },
     "fx": [
      "信任 +1",
      "Trust +1"
     ]
    }
   ]
  }
 ],
 "mail": [
  {
   "id": "fema-ix-trailers",
   "from": "fed",
   "ref": "FEMA IX",
   "subject": [
    "第九区可调 40 台旅行拖车",
    "Region IX can release 40 travel trailers"
   ],
   "body": [
    "南希·沃德办公室：需要县里提供有水电接口的场地。",
    "Nancy Ward's office: the county must provide a site with water and power hookups."
   ],
   "time": "09:05",
   "unread": true,
   "acts": [
    {
     "t": [
      "接受",
      "Accept"
     ],
     "done": [
      "已接受",
      "Accepted"
     ],
     "do": {
      "fed": 5,
      "navajo": -3
     }
    },
    {
     "t": [
      "回复",
      "Reply"
     ],
     "done": [
      "已回复",
      "Replied"
     ],
     "do": {
      "fed": -2
     }
    }
   ]
  },
  {
   "id": "aps-cholla-lane",
   "from": "nb",
   "sender": [
    "乔拉电厂（APS）",
    "Cholla Power Plant (APS)"
   ],
   "subject": [
    "倒班工人过 I-40 检查点要排一小时",
    "Shift workers wait an hour at the I-40 checkpoint"
   ],
   "body": [
    "约瑟夫城的电厂请县里给员工车辆开专用道。",
    "The Joseph City plant asks for a dedicated lane for staff vehicles."
   ],
   "time": "08:40",
   "unread": true,
   "acts": [
    {
     "t": [
      "同意",
      "Agree"
     ],
     "done": [
      "已同意",
      "Agreed"
     ]
    },
    {
     "t": [
      "拒绝",
      "Decline"
     ],
     "done": [
      "已拒绝",
      "Declined"
     ]
    }
   ]
  },
  {
   "id": "adem-09-0412-checkpoint",
   "from": "fed",
   "ref": "ADEM 09-0412",
   "subject": [
    "在 I-40 霍尔布鲁克西口增设体温检查点",
    "Add a temperature checkpoint at the I-40 Holbrook west exit"
   ],
   "body": [
    "随文拨款 $180,000，10月16日前完成。",
    "$180,000 attached. Complete by Oct 16."
   ],
   "time": "10:42",
   "unread": true,
   "acts": [
    {
     "t": [
      "执行",
      "Comply"
     ],
     "done": [
      "已执行",
      "Complyed"
     ],
     "do": {
      "fed": 5,
      "navajo": -3,
      "funds": {
       "fed": 180
      },
      "build": {
       "b": "check",
       "ll": [
        -110.1795,
        34.9078
       ],
       "name": [
        "I-40 西口检查点",
        "I-40 west exit checkpoint"
       ],
       "fund": "fed",
       "eta": 2
      }
     }
    },
    {
     "t": [
      "搁置",
      "Hold"
     ],
     "done": [
      "已搁置",
      "On hold"
     ],
     "do": {
      "fed": -2
     }
    },
    {
     "t": [
      "回复",
      "Reply"
     ],
     "done": [
      "已回复",
      "Replied"
     ]
    }
   ]
  },
  {
   "id": "nndem-117-shopping",
   "from": "navajo",
   "ref": "NNDEM-117",
   "subject": [
    "族人进城采购不应在检查点排队",
    "Nation members should not queue at checkpoints to shop in town"
   ],
   "body": [
    "霍尔布鲁克的 Safeway 是很多家庭最近的超市。",
    "For many families the Safeway in Holbrook is the nearest supermarket."
   ],
   "time": "11:15",
   "unread": true,
   "acts": [
    {
     "t": [
      "同意",
      "Agree"
     ],
     "done": [
      "已同意",
      "Agreed"
     ],
     "do": {
      "navajo": 5,
      "fed": -2
     }
    },
    {
     "t": [
      "回复",
      "Reply"
     ],
     "done": [
      "已回复",
      "Replied"
     ]
    }
   ]
  },
  {
   "id": "lds-storehouse-flour",
   "from": "lds",
   "subject": [
    "主教仓库可调出面粉和罐头",
    "The bishops' storehouse can release flour and canned goods"
   ],
   "body": [
    "约 40 吨。请县里定一个分发地点。",
    "About 40 tons. Please name a distribution site."
   ],
   "time": "昨天 Yesterday",
   "unread": true,
   "acts": [
    {
     "t": [
      "接受",
      "Accept"
     ],
     "done": [
      "已接受",
      "Accepted"
     ],
     "do": {
      "lds": 4,
      "trust": 2
     }
    },
    {
     "t": [
      "回复",
      "Reply"
     ],
     "done": [
      "已回复",
      "Replied"
     ]
    }
   ]
  },
  {
   "id": "apache-nurses-diesel",
   "from": "nb",
   "sender": [
    "阿帕奇县监事会",
    "Apache County Board of Supervisors"
   ],
   "subject": [
    "借两名护士，可用柴油交换",
    "Two nurses on loan, paid in diesel"
   ],
   "body": [
    "6,000 加仑，从圣约翰斯运过来。",
    "6,000 gallons, trucked from St. Johns."
   ],
   "time": "昨天 Yesterday",
   "unread": false,
   "acts": [
    {
     "t": [
      "接受",
      "Accept"
     ],
     "done": [
      "已接受",
      "Accepted"
     ]
    },
    {
     "t": [
      "还价",
      "Counter"
     ],
     "done": [
      "已还价",
      "Countered"
     ]
    },
    {
     "t": [
      "拒绝",
      "Decline"
     ],
     "done": [
      "已拒绝",
      "Declined"
     ]
    }
   ]
  },
  {
   "id": "winslow-lcmc-beds",
   "from": "nb",
   "sender": [
    "温斯洛市议会",
    "Winslow City Council"
   ],
   "subject": [
    "小科罗拉多医疗中心需要 20 张床位的钱",
    "Little Colorado Medical Center needs funding for 20 beds"
   ],
   "body": [
    "$260,000。",
    "$260,000."
   ],
   "time": "10月12日 Oct 12",
   "unread": false,
   "acts": [
    {
     "t": [
      "拨款",
      "Fund"
     ],
     "done": [
      "已拨款",
      "Funded"
     ],
     "do": {
      "county": -260
     }
    },
    {
     "t": [
      "婉拒",
      "Decline"
     ],
     "done": [
      "已婉拒",
      "Declined"
     ]
    }
   ]
  }
 ],
 "broadcasts": [
  {
   "ch": "fed",
   "name": [
    "KPNX 12 · 凤凰城",
    "KPNX 12 · Phoenix"
   ],
   "time": "14:00",
   "t": [
    "州应急管理局：明天上午 9 点公布新的病例标准。",
    "State emergency management: new case criteria at 9 am tomorrow."
   ]
  },
  {
   "ch": "navajo",
   "name": [
    "KTNN 660 AM · 窗岩",
    "KTNN 660 AM · Window Rock"
   ],
   "time": "12:30",
   "t": [
    "族长办公室：族内检测点周末照常开放。",
    "President's office: Nation testing sites stay open this weekend."
   ]
  },
  {
   "ch": "county",
   "name": [
    "KINO 1230 AM · 温斯洛",
    "KINO 1230 AM · Winslow"
   ],
   "time": "09:10",
   "t": [
    "县新闻发布会：今日新增确诊 3 例，均在温斯洛。",
    "County briefing: 3 new confirmed cases today, all in Winslow."
   ]
  },
  {
   "ch": "lds",
   "name": [
    "KNAZ 2 · 弗拉格斯塔夫",
    "KNAZ 2 · Flagstaff"
   ],
   "time": "08:00",
   "t": [
    "斯诺弗莱克的志愿者周六在泰勒分发食品。",
    "Snowflake volunteers hand out food in Taylor on Saturday."
   ]
  }
 ]
});
