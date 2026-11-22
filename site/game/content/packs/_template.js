// 模板：复制本文件，改名为 content/packs/<你的包名>.js，再把包名加进 content/manifest.js。
// 写完运行：node tools/validate_content.js
CONTENT.add({
  id: 'my-pack',                                   // 包名，全局唯一
  title: ['包的中文名', 'Pack title in English'],
  by: 'author',
  // 新建筑（可选）。会出现在“建设”栏对应分类里，效果全部由下面的字段决定，不用改引擎。
  // bcats: { med: ['医疗', 'Medical'] },          // 想要新分类时再加；默认可用 life / ctrl / info
  buildings: [
    {
      id: 'my-building', cat: 'life',              // 小写加连字符，不能和已有建筑重名
      zh: '建筑中文名', en: 'Building name',
      cost: 60, days: 2,                           // 千美元；工期天数（按小时推进）
      fund: ['fed', 'county'],                     // 可出资方：fed navajo lds county
      size: [30, 14],                              // 新建的占地（米）；改建现有房子则写 convert: true，不写 size
      // convert: true,
      look: 'tents',                               // 卫星图外观：flat（默认平顶房）tents trailers tanks pad
      roof: '#f0efe8',
      crew: 3, ops: 2,                             // 施工队人数；建成后运营占用人数
      fx: ['恐慌每天 −0.1', 'Panic −0.1/day'],     // 侧栏显示的效果说明，要和下面的数值一致
      run: { daily: { panic: -.1 } },              // 建成后每天生效：house 安置人数 · hold 隔离床位 · stockCap 储备上限天数 · supply 每天物资 · use 每天消耗 · recover 康复率 · spread 传播（-0.1 = −10%） · sight 视野公里 · vol 每周志愿者 · otCut 加班费折扣 · daily {panic, trust}
      onBuilt: { trust: 1 }                        // 完工时一次：trust panic fed navajo lds county stock
    }
  ],
  events: [
    {
      id: 'unique-event-id',                       // 全局唯一，小写加连字符
      date: '2009-10-28',                          // 指定日期触发（YYYY-MM-DD）；或用 when，二选一或同时用
      // when: { after: '2009-11-01', before: '2009-12-31', flags: ['x'], notFlags: ['y'], min: { panic: 40 }, max: { trust: 30 }, chance: 0.2 },
      // chained: true,                            // 只由其他选项的 do.event 触发
      icon: 'info',                                // info warn q err imp ppl globe build law bank mail pkg sheet
      title: ['短标题', 'Short title'],
      body: ['正文：谁、在哪、要县里做什么。', 'Body: who, where, what they need from the county.'],
      foot: ['（可选）底部说明', '(optional) footer note'],
      opts: [
        { t: ['选项一', 'Option one'], do: { trust: 2, county: -50 } },
        { t: ['选项二', 'Option two'], do: { lds: 3, mail: 'unique-mail-id' } },
        { t: ['选项三', 'Option three'], do: { panic: 1, event: { id: 'follow-up-id', inDays: 5 } } }
      ]
    },
    {
      id: 'follow-up-id', chained: true, icon: 'q',
      title: ['后续', 'Follow-up'], body: ['五天后的后续。', 'What happens five days later.'],
      opts: [{ t: ['知道了', 'Noted'], do: {} }]
    }
  ],
  mail: [
    {
      id: 'unique-mail-id',
      date: '2009-10-30',                          // 不写 date = 开局就在收件箱；写了 = 当天送达（或由 do.mail 送达）
      from: 'fed',                                 // fed navajo lds county nb
      // sender: ['发件机构', 'Sending body'],     // from 为 nb 时必填
      ref: 'ADEM 09-0500',                         // 文号，可选
      subject: ['主题', 'Subject'],
      body: ['正文', 'Body'],
      time: '09:30',
      acts: [
        { t: ['接受', 'Accept'], do: { fed: 3, funds: { fed: 120 } }, done: ['已接受', 'Accepted'] },
        { t: ['婉拒', 'Decline'], do: { fed: -2 }, done: ['已婉拒', 'Declined'] }
      ]
    }
  ],
  broadcasts: []
});
