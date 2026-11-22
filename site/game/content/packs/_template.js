// 模板：复制本文件，改名为 content/packs/<你的包名>.js，再把包名加进 content/manifest.js。
// 写完运行：node tools/validate_content.js
CONTENT.add({
  id: 'my-pack',                                   // 包名，全局唯一
  title: ['包的中文名', 'Pack title in English'],
  by: 'author',
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
