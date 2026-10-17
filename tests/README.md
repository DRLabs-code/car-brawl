# 自动化测试（v13）
先在 prototype/ 起服务：`cd prototype && python3 -m http.server 8765`；依赖 /tmp/pt/node_modules/puppeteer-core + /usr/bin/google-chrome。
- `node tests/matrix.js [desk|land|port|all]`：桌面 36 局（两模式×三图×三车×4/6/8 车），手机横/竖屏各连续 10 局（含再来一局）；查 console 错误、NaN、卡车、FPS、内存、结算页一屏/溢出、结算榜名次。输出 tests/out/。
- `node tests/features.js`：抽奖/广告抽/宝箱/合成/挑战与福利跨日/设置/静音/改名/引导/广告防连点/存档损坏。
- `node tests/flow.js`：完整玩家流程（引导→车库→对战→结算→改装→卡点/AI 脱困→横竖屏摇杆→存档迁移）。
- `node tests/v11-flow.js <tag> <w> <h> <dpr> <mobile0/1>`：道具/复活/擂台/挑战/集锦/埋点。
- `node tests/pickups.js`：道具连吃（一局 35+、同类重复、满血修复包、复活后、刷新点可达、连续 10 局）。
- `node tests/ring-ai.js`：擂台 AI 自己开下台统计。
- 已有：feel-bench.js（操控）、replay-view.js（再来一局镜头回归）。
- `node tests/v15.js`：车辆命名（免费/付费/校验/取消不扣费）、涂装试穿/还原/购买扣费、首页。
- `node tests/result-fit.js`：结算页及弹窗在 iPhone/安卓/桌面各视口（含 Safari 工具栏 390×664、750×340）一屏居中。
- `node tests/team.js`：队伍乱斗（分队 2v2/3v3/4v4、友伤免疫、AI 不锁队友/集火/支援/避让、阵亡观战、全灭判负、结算 MVP、道具兼容、队伍任务、埋点）。
- `node tests/hazards.js`：地图机关（布置与出生/道具点可达、钢梁/压扁机/流沙/沙尘暴、油桶 AoE、木箱掉落、击杀归属与集锦加权、AI 躲避/利用、埋点）。
- `node tests/v18.js`：花纹涂装（稀有度分组、试穿还原、购买扣费、传说仅抽奖+30 次保底、存档、8 车动态涂装 FPS、各车各涂装截图）。
- `node tests/perf.js`：8 车 + 机关场景（工地/废车场/沙漠）每帧 render/step 耗时、FPS、堆；v19 起用于对比优化前后。
- 模块文件（v19 起）：battle-extras.js（原 v11）、ui-shell.js（原 v15）、mode-team.js（原 v16）、map-hazards.js（原 v17）、skin-patterns.js（原 v18）；数值参数集中在 tune.js。
- `node tests/v20.js`：车库可读性（844×390/667×375/1280×720 下部件图标 ≥36px 可见、名称说明字号、碎片进度条缩小、部件行不溢出）。
- `node tests/race.js`：竞速（入口、发车格、HUD、重生、完赛名次/用时、加速带、跳台、AI 捷径/吃道具、对撞平衡新旧对比、埋点、FPS）；matrix 增加 3 局竞速。
