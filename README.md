# 架空北美世界地图 · Fractured North America Atlas

类《使女的故事》架空世界观的交互式北美地图（2009 年谷歌地图风格 + 书签内复刻的 2009 年网站）。

## 目录
| 路径 | 内容 |
|---|---|
| `site/index.html` | **成品**，单文件，浏览器直接打开即可 |
| `site/` | 网站源码：`src.html` 入口模板，`a1–a4.js` 地图，`chrome.js` 浮动浏览器窗口，`gpage.js` 谷歌首页，`topopage.js` 拓扑图，`cnnpage.js` CNN，`ytpage.js` YouTube，`wikipage.js` 维基，`clpage.js` Craigslist，`bppage.js` The Big Picture，`flpage.js` Flickr；`wiki/ sites/ topo/ cnn/` 下是各站生成脚本（`mk*.py`）与素材 |
| `pipeline/tools/` | 地图数据管线（县→势力分类、边界、灯光、地形、标签）；`npm install` 恢复 node 依赖 |
| `pipeline/build/` | 管线中间产物（势力 geojson、topojson、灯光、字体等）。`night_src.npy`（124MB）未上传，可由 `tools/nightbake.py` 重新生成 |
| `pipeline/notes/` | 各版本技术笔记（v1、v2.5–v3.3） |
| `assets/flags/` | 势力旗帜 |
| `docs/STANDARDS.md` | 全部制作标准 |
| `docs/TASKS.md` | 后续任务 |
| `docs/FACTIONS.md` | 势力与配色 |

## 协作须知
- 动手前先读 `docs/STANDARDS.md`；完成后更新 `docs/TASKS.md`。
- 原始公共数据（美国县界、人口、Natural Earth、夜光、地形栅格，约 230MB）未上传，按 `pipeline/notes` 中的来源重新下载。
- 存档的第三方页面素材（Google、CNN、YouTube、Wikipedia MonoBook、Flickr 等）版权归原所有者，仅作架空创作复刻参考；图片多为 AI 生成的虚构内容。

整理日期：2026-11-14
