# 《车手大作战》车辆美术风格指南

## 1. 总体风格
**2D 等距视角（isometric，2:1 菱形网格）精致卡通风**：夸张比例（大轮、宽身、矮重心）、鲜明配色、**粗深色描边 + 三阶卡通光影 + 车窗反光 + 软阴影**，像手游里的玩具车，绝不是平涂色块。

三条支柱：
1. **一眼认车**：剪影和标志造型在任意朝向下都能分清。
2. **打击感优先**：火花、碎片、烟雾、飘字、震屏、顿帧，比细节更重要。
3. **轻量**：纯 2D 精灵 + 预渲染地面，低端机也能 60 帧。

## 2. 配色规范
| 用途 | 颜色 | Hex |
|---|---|---|
| 皮卡主色 | 军绿 | #5D8F3F |
| 皮卡辅色 | 铁灰 | #5A5F66 |
| 刺客主色 | 霓虹品红 | #F0207F |
| 刺客辅色 | 炭黑 | #1E1E24 |
| 越野主色 | 警示橙 | #FF7A1A |
| 越野辅色 | 泥土棕 | #7A4E2D |
| 金属件通用 | 亮钢 | #B8C2CC |
| 轮胎通用 | 胎黑 | #2A2A2E |
| 强调/发光 | 电光黄 | #FFD23F |
| 伤害提示 | 危险红 | #E63946 |
| 描边 | 深紫黑 | #1B1420 |
| 霓虹灯带 | 霓虹青 | #2EF2FF |
| 电网/缩圈 | 电光青 | #7DF9FF |
| 车窗 | 深夜蓝 | #182033 |
| 场外 | 草地绿 | #4B6B3A |
| 竞技场地面 | 沙米 | #E8D8B0 |
| 场地边缘 | 冷蓝灰 | #6C8EA4 |

规则：每辆车 1 主色 + 1 辅色 + 1 强调色；主色占车身约 60%。车辆颜色饱和度高于场地，保证从背景中跳出来。玩家可换涂装，但轮廓不变。

色板图：`art/palette.png`（含 hex 标注，可直接导入美术工具）。

## 3. 视角与投影（等距 2:1）
- 世界坐标 (x, z) 计算物理和伤害，渲染时投影：`屏幕x = (x − z) × 16`，`屏幕y = (x + z) × 8`，高度 1 单位 ≈ 19.6px（缩放 1 时）。
- 等价于正交相机：方位角 45°，俯角 30°。一块地面瓦片 = 2×2 世界单位 = 64×32px 菱形。
- 深度排序：按 `x + z` 从小到大绘制；护栏按所在半圈固定前后层（后半圈在车下，前半圈在车上）。
- 摇杆方向是屏幕方向，反解到世界：`wx = sy + sx/2，wz = sy − sx/2` 后归一化，保证"往上推车就往屏幕上方开"。

## 4. 精灵规格
| 资源 | 规格 |
|---|---|
| 车辆精灵 | 16 朝向（每 22.5°），单帧 384×384（2 倍图，游戏内按 0.5 绘制），4×4 图集 1536×1536 |
| 锚点 | 帧内水平居中、竖直 58% 处 = 车辆地面中心，所有朝向一致 |
| 朝向编号 | 第 i 帧对应世界朝向 h = i × 22.5°；h=0 朝世界 +z（屏幕左下） |
| 命名 | `car_<车名>_16dir.png`，如 `car_tyrant_16dir.png`；正式版用 `car_tyrant_drive_dir00..15` |
| 地面瓦片 | 64×32 菱形，接缝处外扩 1px 防漏边 |
| 场景物件 | 轮胎堆、护栏段、路锥、灌木：锚点在接地点 |
| 受击/撞毁 | 运行时生成白色闪光版与压暗版，无需额外出图 |

## 5. 描边、光照与材质
- **描边**：统一深紫黑 `#1B1420`，车辆约 2.5px（游戏内尺寸），场景物件 2-3px，UI 3-4px。
- **光照**：主光来自屏幕左上，三阶卡通分层（暗 / 中 / 亮），亮面加高光块；车窗深蓝 `#182033` + 一道白色斜反光。
- **阴影**：车底和物件下方用软边椭圆阴影（深紫半透明），不做实时投影。
- **发光**：霓虹灯带、尾灯、射灯用纯色不受光材质，特效用叠加（lighter）混合。
- **制作方式**：原型中用低多边形模型（`bake/bake.html`）离线渲染 16 朝向 + 剪影膨胀描边；正式版可由美术重绘或继续用此流程，但需要统一光照方向。

## 6. 轮廓原则
- **剪影测试**：涂黑后三辆车一眼能分清（皮卡的高车身 + 后货斗、超跑的低矮楔形、越野的方盒车身 + 圆灯 + 外挂备胎）。
- 车头方向在任意朝向下都要明确（铲刀 / 尖刺 / 前保险杠颜色区分）。
- 避免细长突出物，部件要粗壮，在 50px 宽的显示尺寸下仍清楚。

## 7. 部件挂点规范（等距精灵版）
- 部件精灵同样 16 朝向，与车身共用锚点；每辆车为每个朝向提供挂点像素偏移表：`Mount_Front`、`Mount_Top`、`Mount_Armor_L/R/Back`、`Mount_Engine`、`Wheel_*`、`FX_Exhaust`、`FX_Hit`。
- 绘制顺序按朝向决定（如车头朝屏幕后方时车头部件画在车身之前）。
- 首版建议：性能部件只影响数值 + 小图标，外观上先只做车头部件和涂装换色，控制组合数量。

## 8. 三辆首发车

**原则**：比例贴近真实车型，只稍微放大轮子和车身以保证小屏可读；未装部件的白板状态就是真实车的素车版本，改装件在其上叠加。
- 铁壁暴君：参考全尺寸皮卡——高车身、长发动机舱、双座驾驶室、后部开放货斗、大镀铬格栅。
- 霓虹毒牙：美式肌肉车风格（v10 起）——长车头、短尾、宽体轮拱、溜背座舱、进气鼓包引擎盖、左右各三条竖向尾灯、双排气；车头用自创菱形「毒牙」徽标，不使用任何真实品牌车标或车名，也不 1:1 复刻某款真车。
- 泥岩狂兽：参考硬派越野（牧马人 / 陆巡一类的方正造型）——方盒车身、圆形大灯、七孔竖格栅、黑色轮眉、外挂备胎、车顶行李架；**不是大脚怪兽车**。
- 精灵分两层烘焙：车身层 16 朝向（`car_<名>_body.png`，4×4，384px），轮子层 16 朝向 × 3 档转向 × 3 帧滚动（`car_<名>_wheels.png`，12×12，160px），两层互为深度遮罩，叠加即为完整车。

### ① 铁壁暴君（Iron Tyrant）· 皮卡式小卡车
- **性格**：沉稳、"不动如山"，慢慢逼近，一撞就是重击。
- **外观要点**：高车身、长发动机舱、双座驾驶室、后部开放货斗、大镀铬格栅与方灯、黑色保险杠；军绿 + 铁灰。
- **属性倾向**：血量 ★★★★★ 重量 ★★★★★ 撞击 ★★★★ 速度 ★★ 加速 ★ 操控 ★★

**AI 提示词（中）**：2D 等距视角游戏精灵概念图，精致卡通手游风，比例接近真实车（轮子略放大），粗深色描边，三阶卡通光影，车窗高光反光，软阴影，等距三分之四视角，纯色背景，未改装素车，全尺寸皮卡，高车身，开放货斗，大镀铬格栅，军绿色车身配铁灰与黑色保险杠
**AI prompt (EN)**: isometric 2D game sprite concept art, polished cartoon mobile game style, realistic car proportions slightly exaggerated wheels, thick dark outline, cel shading with highlights, glossy window reflections, soft drop shadow, three-quarter isometric view (2:1), plain background, stock unmodified version, full-size pickup truck, tall body, open cargo bed, big chrome grille, army green paint with gunmetal and black bumpers

### ② 霓虹毒牙（Neon Fang）· 美式肌肉车（v10 起，原为低矮超跑）
- **性格**：狡猾、傲慢，绕后偷袭残血目标，一击即走。
- **外观要点**：中置引擎超跑比例——低矮修长楔形车身、深色座舱靠后、侧进气口、细长青色灯带、红色尾灯条；品红 + 炭黑。
- **属性倾向**：速度 ★★★★★ 加速 ★★★★ 撞击 ★★★ 操控 ★★★ 血量 ★★ 重量 ★

**AI 提示词（中）**：2D 等距视角游戏精灵概念图，精致卡通手游风，比例接近真实车（轮子略放大），粗深色描边，三阶卡通光影，车窗高光反光，软阴影，等距三分之四视角，纯色背景，未改装素车，中置引擎超跑，低矮修长楔形车身，座舱靠后，侧进气口，青色细灯带，品红色车身配炭黑
**AI prompt (EN)**: isometric 2D game sprite concept art, polished cartoon mobile game style, realistic car proportions slightly exaggerated wheels, thick dark outline, cel shading with highlights, glossy window reflections, soft drop shadow, three-quarter isometric view (2:1), plain background, stock unmodified version, mid-engine supercar, low long wedge body, cab-rear canopy, side air intakes, thin cyan light strips, magenta paint with charcoal black

### ③ 泥岩狂兽（Mud Beast）· 硬派方正越野车
- **性格**：狂野、好斗，享受混战，越野胎不怕任何地形。
- **外观要点**：硬派越野比例（方盒车身、短前后悬）——圆形大灯、七孔竖格栅、黑色轮眉、外挂备胎、车顶行李架；**不是大脚怪兽车**；警示橙 + 黑。
- **属性倾向**：操控 ★★★★ 血量 ★★★ 重量 ★★★ 撞击 ★★★ 加速 ★★★ 速度 ★★★（均衡型）

**AI 提示词（中）**：2D 等距视角游戏精灵概念图，精致卡通手游风，比例接近真实车（轮子略放大），粗深色描边，三阶卡通光影，车窗高光反光，软阴影，等距三分之四视角，纯色背景，未改装素车，硬派方正越野车，方盒车身，圆形大灯，七孔竖格栅，黑色轮眉，外挂备胎，车顶行李架，警示橙车身配黑色
**AI prompt (EN)**: isometric 2D game sprite concept art, polished cartoon mobile game style, realistic car proportions slightly exaggerated wheels, thick dark outline, cel shading with highlights, glossy window reflections, soft drop shadow, three-quarter isometric view (2:1), plain background, stock unmodified version, boxy classic off-road SUV, square body, round headlights, seven-slot vertical grille, black fender flares, rear-mounted spare tire, roof rack, safety orange paint with black trim, not a monster truck
