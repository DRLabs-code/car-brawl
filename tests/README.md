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
