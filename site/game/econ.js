// econ.js — 纳瓦霍县一般基金（2009-10 财年实际数 ÷ 52）、借款手段、物价。单位：千美元（$K）。
// 来源见 docs/economy_2009.md（县 2010 财年审计年报 CAFR、单一审计、州财政厅 LGIP、EIA、BLS）。
window.ECON = {
  // 每周基线。tax: 10–11 月物业税集中入账
  rev: [
    { id: 'prop', zh: '物业税', en: 'Property tax', wk: 123, lump: { months: [10, 11], wk: 385 } },
    { id: 'state', zh: '州共享销售税', en: 'State-shared sales tax', wk: 168 },
    { id: 'excise', zh: '县 0.5% 销售税', en: 'County 0.5% excise tax', wk: 105 },
    { id: 'vlt', zh: '车辆牌照税', en: 'Vehicle license tax', wk: 38 },
    { id: 'fees', zh: '规费、罚款及其他', en: 'Fees, fines, other', wk: 60 },
    { id: 'inter', zh: '其他州与联邦转移', en: 'Other state & federal transfers', wk: 85 }
  ],
  exp: [
    { id: 'jail', zh: '县监狱', en: 'Jail', wk: 103 },
    { id: 'sheriff', zh: '警长办公室', en: "Sheriff's Office", wk: 94 },
    { id: 'courts', zh: '法院', en: 'Courts', wk: 107 },
    { id: 'law', zh: '检察官与公设辩护人', en: 'Attorney & public defense', wk: 65 },
    { id: 'health', zh: '贫困医疗与长期护理（ALTCS）', en: 'Indigent health & ALTCS', wk: 93 },
    { id: 'juv', zh: '少年拘留与缓刑', en: 'Juvenile detention & probation', wk: 38 },
    { id: 'admin', zh: '行政及其他', en: 'Administration & other', wk: 154 }
  ],
  checking: 2400, lgip: 6900, lgipRate: .0025,
  flood: 6940,
  debt: [
    { id: 'pro08', zh: '2008 年销售税担保债券', en: '2008 pledged revenue obligations', bal: 6270, rate: '3.5–4%' },
    { id: 'cop', zh: '监狱租购证书', en: 'Jail certificates of participation', bal: 5030, rate: '5–6.25%' }
  ],
  // 借款与拨款
  loans: [
    { id: 'warrant', icon: 'imp', zh: '登记欠款单', en: 'Registered warrants', auto: true, rate: .02,
      d: ['支票账户透支时，县司库登记未付款项，按 2% 计息，到账即付。', 'If checking goes negative, the Treasurer registers unpaid bills at 2% until cash arrives.'] },
    { id: 'interfund', icon: 'sheet', zh: '防洪基金调借', en: 'Interfund loan (Flood Control)', max: 3470, rate: 0, days: 7, due: '2010-06-30',
      d: ['最多调借防洪区余额的一半，零利率，监事会下次例会后到账，2010 年 6 月 30 日前归还。', 'Up to half the Flood Control balance, 0%, after the next Board meeting; repay by Jun 30, 2010.'] },
    { id: 'tan', icon: 'law', zh: '税收预期票据', en: 'Tax anticipation note', max: 1500, rate: .015, days: 28, due: '2010-05-31',
      d: ['以明年 3–5 月物业税为还款来源，年利率 1.5%，约四周到账。', 'Repaid from Mar–May 2010 property tax, 1.5%, about four weeks.'] },
    { id: 'pro', icon: 'build', zh: '销售税担保债券', en: 'Pledged revenue obligation', max: 10000, rate: .0375, days: 63, term: 15,
      d: ['以县 0.5% 销售税担保，15 年，年利率约 3.75%，无需公投，债券律师约九周。', 'Backed by the 0.5% excise tax, 15 years at about 3.75%, no vote; about nine weeks of bond counsel.'] },
    { id: 'gov', icon: 'globe', zh: '州长应急基金', en: "Governor's Emergency Fund", max: 200, grant: true, days: 10, once: true,
      d: ['宣布地方紧急状态后可申请，每次 $200K，不用还。2010 财年全州只有 $2.9M。', 'After a local emergency declaration, $200K per event, no repayment. Statewide pot is $2.9M in FY2010.'] },
    { id: 'go', icon: 'ppl', zh: '一般责任债券', en: 'General obligation bond', vote: true, rate: .042,
      d: ['上限 $149.8M（评估值的 15%），利率约 4.2%，须经选民投票批准。', 'Cap $149.8M (15% of assessed value), about 4.2%, needs voter approval.'] },
    // 主栏插入广告里的虚构贷款方（梅萨的发薪日贷款店，“公共机构部”）。只从广告进入，不在借款列表里出现。
    // 条款照 2009 年亚利桑那州发薪日贷款（A.R.S. 6-1251 起，2010-06-30 到期失效）：每 $100 收 $17.50 / 14 天，最多展期 3 次，同一时间只能有一笔。
    { id: 'sqc', ad: true, icon: 'warn', zh: '萨瓜罗快速现金 预支', en: 'Saguaro Quick Cash advance',
      amts: [50, 100, 250, 500], fee: { 14: 17.5, 30: 35 }, rolls: 3, nsf: 2.5 }
  ],
  // 物价（2009 年 10 月）。k = 短缺弹性
  prices: [
    { zh: '汽油', en: 'Gasoline', u: ['加仑', 'gal'], p: 2.38, k: 1 },
    { zh: '柴油', en: 'Diesel', u: ['加仑', 'gal'], p: 2.75, k: 1 },
    { zh: '丙烷', en: 'Propane', u: ['加仑', 'gal'], p: 1.99, k: 1 },
    { zh: '牛奶', en: 'Milk', u: ['加仑', 'gal'], p: 3.05, k: .5 },
    { zh: '面包', en: 'Bread', u: ['磅', 'lb'], p: 1.39, k: .5 },
    { zh: '鸡蛋', en: 'Eggs', u: ['打', 'doz'], p: 1.60, k: .5 },
    { zh: '牛肉末', en: 'Ground chuck', u: ['磅', 'lb'], p: 2.79, k: .5 },
    { zh: 'N95 口罩', en: 'N95 masks', u: ['盒（20只）', 'box of 20'], p: 14.37, k: 3 },
    { zh: '最低工资', en: 'Minimum wage', u: ['小时', 'hr'], p: 7.25, k: 0 }
  ]
};
