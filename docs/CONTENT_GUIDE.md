# 内容包格式（事件 · 公文 · 广播）

游戏里的事件弹窗、Gmail 公文、电台广播都来自 `site/game/content/packs/*.js`。
每个文件调用一次 `CONTENT.add({...})`。新增内容不需要改游戏代码：

1. 复制 `content/packs/_template.js`，改名为 `content/packs/<包名>.js`。
2. 把包名加进 `content/manifest.js` 的 `CONTENT_PACKS`。
3. 运行 `node tools/validate_content.js`，全部通过再提交。

可以先不加进清单，直接检查单个文件：`node tools/validate_content.js path/to/new-pack.js`。

## 事件 events

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 全局唯一，小写英文加连字符 |
| `date` | 三选一 | `YYYY-MM-DD`，当天 0 点触发 |
| `when` | 三选一 | 条件触发，每天检查一次，触发后不再重复 |
| `chained` | 三选一 | `true`：只由别的选项的 `do.event` 触发 |
| `start` | 否 | 开局事件，全游戏只能有一个 |
| `icon` | 否 | `info warn q err imp ppl globe build law bank mail pkg sheet`（Win7 原版图标） |
| `title` `body` | 是 | `[中文, English]` |
| `foot` | 否 | 对话框底部灰条里的说明 |
| `opts` | 是 | 1–4 个选项，每个 `{ t, do, fx? }` |

`fx` 可省略：游戏按 `do` 自动生成「信任 +3 · 教会 +2 · $120K」。只有效果写不进 `do` 时（比如「条例页可表决」）才手写 `fx: [中, 英]`。

### when 条件

```js
when: {
  after: '2009-11-01', before: '2009-12-31',   // 日期窗口（含当天）
  flags: ['shelly'], notFlags: ['deputize'],   // 需要 / 不能有的旗标
  min: { panic: 40 }, max: { trust: 30 },       // trust panic fed navajo lds county
  chance: 0.2                                    // 每天的触发概率（按日期固定，可复现）
}
```

## 公文 mail

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 全局唯一 |
| `from` | 是 | `fed` `navajo` `lds` `county` `nb`（邻近机构） |
| `sender` | `nb` 时必填 | `[中, 英]` 发件机构名 |
| `ref` | 否 | 文号，如 `ADEM 09-0412` |
| `subject` `body` | 是 | `[中, 英]` |
| `date` | 否 | 不写 = 开局在收件箱；写 = 当天送达 |
| `when` | 否 | 与 `date` 同用：当天满足条件才送达 |
| `time` | 否 | 收件箱里显示的时间 |
| `unread` | 否 | 开局邮件是否未读 |
| `attach` | 否 | `true` 显示回形针 |
| `acts` | 否 | 按钮 `{ t, do, done }`，`done` 是处理后显示的文字 |

## 效果 do

| 键 | 例子 | 作用 |
|---|---|---|
| `trust` `panic` | `trust: 3` | 信任、恐慌（0–100） |
| `fed` `navajo` `lds` | `navajo: -2` | 三方关系 |
| `county` | `county: -120` | 县支票账户，单位千美元 |
| `funds` | `funds: { fed: 180 }` | 各方专项资金（fed navajo lds county） |
| `flag` / `unflag` | `flag: 'shelly'` 或数组 | 设置 / 清除旗标，供 `when` 和条例使用 |
| `mail` | `mail: 'id'` 或数组 | 立即送达公文 |
| `event` | `event: { id: 'x', inDays: 5 }` | 若干天后触发 `chained` 事件 |
| `build` | `build: { b: 'check', ll: [-110.18, 34.91], name: [中, 英], fund: 'fed', eta: 2 }` | 在地图上开工，`b` 取 data.js 的 buildings |
| `notice` | `notice: [中, 英]` | 顶部黄色通知条 |
| `promise` | `promise: { zh, en, left: 3, cost: 15, by: [中, 英] }` | 新增承诺 |
| `broadcast` | `broadcast: { ch, name, time, t }` | 新增广播 |

## 写作规则（必须遵守）

- 时间：游戏从 2009 年 10 月 14 日开始。所有日期写绝对日期，不写「明天」「下周」。
- 基调：日常生活照常进行。不恐怖、不末日、不孤立。难民就是普通人口，莫诺卡西病是一种传染病。灵异内容只能是传闻或彩蛋。
- 真实性：机构、地名、职务用 2009 年的真实名称。查不到的人名不要编，写职务（「斯诺弗莱克镇长」）。不使用已核实不存在的东西：2009 年纳瓦霍族没有宵禁；Winslow Mail 2007 年已停刊。
- 文风：像公文、短讯、来电记录。写谁、在哪、要什么、多少钱、什么期限。不写解说，不写抒情，不写「这将考验你的领导力」之类的话。
- 数字：钱按千美元算，量级参照 `docs/economy_2009.md`（县一般基金每周收入约 $579K、支出约 $654K）。单个事件一般不超过 ±$300K，关系值一般 ±1 到 ±6。
- 双语：每段文字都要 `[中文, English]`，两种语言意思一致。

## 给其他 AI 的提示词模板

```
你在为一款 2009 年亚利桑那州纳瓦霍县应急管理游戏批量写内容包。
输出一个 JavaScript 文件，内容只有一次 CONTENT.add({...}) 调用，格式严格按照下面的说明和模板。
[粘贴本文件「事件」「公文」「效果」「写作规则」四节，以及 content/packs/_template.js]

本次要求：
- 包名：<pack-id>
- 时间范围：<2009-11-01 至 2009-11-30>
- 主题：<比如：H1N1 疫苗到货晚、N95 缺货、Bashas' 温斯洛店 2009 年 10 月 10 日关门后的买菜问题>
- 数量：<12> 个事件、<8> 封公文，其中至少 <3> 个用 when 条件触发，至少 <2> 组用 do.event 串联
- id 前缀：<nov->
只输出代码，不要解释。
```

生成后运行 `node tools/validate_content.js 新文件.js`，把报错原样贴回给 AI 修改，直到全部通过。
