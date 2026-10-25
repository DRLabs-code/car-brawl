// 可调参数集中处（为 Cocos 迁移整理）：手感 / 队伍 / 机关 / 涂装 / 商店。只放数值，不放逻辑。
window.TUNE={
 // 操控手感（v8 preset B）
 feel:{dead:.12,steerGain:2.2,steerDamp:.25,steerRate:10,kbRateLo:8,kbRateHi:5,lowTurn:.35,lowTurnV:5,hiTurnCut:.25,backAng:1.75,backThr:.35,turnLift:.3,
  accK:1.8,accPow:1.6,accMin:.12,coast:.9,gripG:7,slideLo:3,slideHi:8,slideCut:.45,
  dashT:.55,dashKick:.7,dashTop:1.85,dashGrip:1.1,dashYaw:.85,dashCd:2.5,dashOut:2.9,dashDmg:1.5,dashPush:1.4,
  camK:10,camLead:.35,camLeadMax:6,camLeadK:4,camDead:.5,shakeDecay:25,shakeMax:16,zoomIn:.04,zoomOut:.10},
 // v26.1 对手构成（无难度设置）：mix 为 高手/普通/菜鸟 基础比例；玩家每升 1 级把 lvShift 从菜鸟挪给高手（上限 lvShiftMax）；sk 为各档技巧值（0..1），每级 +lvSk，个体随机 ±jit
 opp:{mix:{pro:.2,mid:.5,rookie:.3},sk:{pro:.74,mid:.44,rookie:.16},lvShift:.008,lvShiftMax:.12,lvSk:.01,jit:.06},
 // 开始画面（健康游戏忠告）最少显示秒数
 boot:{splashMin:1.5},
 // 队伍乱斗
 team:{mvpCoins:30},
 // 地图机关
 hz:{beamFirst:8,beamGap:[6,10],beamWarn:1.5,beamDmg:48,beamHalf:[3.6,.9],
  crushR:3.3,crushOpen:4,crushWarn:1.2,crushClose:.5,crushShut:.6,
  sandR:4.6,sandPull:18,sandDps:4,stormFirst:[20,26],stormGap:[22,30],stormDur:7,
  barrelR:6.5,barrelDmg:[8,26],barrelKick:18,crateCoin:.3,crateCoinV:[5,10],crateDrop:.15,hzMargin:2.6,creditWin:4},
 // 涂装：传说保底与概率、动态叠加缓存上限
 // v29 涂装经济：普通/稀有金币购买（price，没列出的=不卖：传说动态与限定拉花只能抽奖/宝箱）；legSpin/legChest 每次抽奖/开箱出传说涂装概率，legPity 连续未出必出；livSpin 抽奖转盘里「限定拉花」格权重（其他格合计 97），livChest 开宝箱额外出限定拉花概率
 skin:{price:{col:{red:120,blue:120,green:150,yellow:150,black:180,white:180,pink:200,orange:200,army:200,teal:220,grape:220,sakura:200,navy:200,camoJ:450,camoD:450,camoS:450,flame:600,zebra:550,carbon:650,digi:500,tiger:600,checker:550,leopard:600,hex:550},liv:{stripe:200,band:150,number:220,roof:150,redStripe:320,pinkBand:280,limeRoof:280}},livSpin:3,livChest:.05,legPity:30,legSpin:.03,legChest:.06,dynCache:96,cacheDesk:32,cacheMobMB:22,dynCacheMob:16,lodMob:true,lodPlayer:false,oppPx:672,midMax:10,nearN:2,fullMax:2,nearR:18,engageT:2.5,holdT:3,promoteGap:.5},// v30 手机对局对手涂装分级：对手 oppPx² 档（须为 4 的倍数；672≈0.58 倍）；最近 nearN 辆（nearR 米内）或 engageT 秒内与玩家碰撞的对手升全分辨率；连续 holdT 秒不满足才降级；每 promoteGap 秒最多升 1 辆；fullMax 同时全分辨率对手硬上限（满了等滞后到期腾位）；midMax 中档副本上限；lodPlayer 玩家也降档（默认否）
 // v31 地图耐玩 + 画面（map-live.js）。shrink：缩圈（on=false 关闭；start 秒后开始，dur 秒缩到半径 min）；
 //  ev：每张图一个局中事件（first/gap 为秒区间，max 每局最多次数，minLv 玩家车等级低于它不触发（新手期不加混乱）；site 钢梁雨 n 根/间隔 stagger/瞄准玩家概率 aim；junk 磁吊车 warn 预警+dur 吸引秒数/pull 吸力速度 m/s（直接挪位置，车的抓地会吃掉侧向速度）/reach 影响半径/blast 爆开半径/kick；desert 新增流沙坑 n 个持续 dur；ice 额外冰窟窿 extra 个；factory 预告 delay 秒后换向；ring 强风 wind 风速 m/s/dur；track 暴雨 dur/drops 雨线数/gripMul 抓地倍数（路面按油污算，×4 后只是偏滑，不影响加速带冲速））；
 //  drop：补给空投（first/gap 秒，life 存活，dist 与玩家的刷新距离区间，coins 玩家抢到的金币区间（每局最多 maxCoin 次给金币，防通胀），shield 护盾秒，aiRange+sk×aiSk AI 追空投距离）；
 //  amb 环境粒子（desk/mob 数量，par 视差）；fx 暗角 vig/色调 tint[r,g,b,a]/斜光 sun/场地光斑 pool+light 色/tick 世界特效间隔；hit 撞障碍碎屑（v 速度阈值、cd 冷却、dust 尘土数、deb 碎屑数）；detail 地面细节密度；lm 标志建筑（sd 离场地边缘距离、gap 间距）
 live:{on:true,shrink:{on:true,start:25,min:10,dur:100},
  ev:{on:true,minLv:3,first:[18,24],gap:[26,36],max:3,site:{n:5,stagger:.45,aim:.55},junk:{warn:1.2,dur:3.2,pull:6,reach:24,blast:7,kick:14},desert:{n:2,dur:9},ice:{extra:2},factory:{delay:2.5},ring:{wind:4.5,dur:6},track:{dur:8,drops:70,gripMul:4}},
  drop:{on:true,first:[14,20],gap:[22,32],life:16,dist:[12,32],coins:[20,40],maxCoin:3,shield:4,aiRange:20,aiSk:14},
  amb:{on:true,desk:36,mob:18,par:.5},
  fx:{on:true,vig:.34,sun:.07,pool:.16,tick:.4,light:{site:'255,238,200',junk:'255,214,170',desert:'255,240,200',ice:'225,243,255',factory:'210,240,255'},tint:{site:[255,208,138,.06],junk:[255,154,90,.07],desert:[255,179,71,.07],ice:[159,212,255,.09],factory:[122,200,255,.06],ring:[80,40,160,.10],track:[255,255,255,.0]}},
  hit:{v:6,cd:.35,dust:4,deb:5},detail:{on:true,density:1},lm:{on:true,sd:[7,12],gap:16}},
 // 撞击平衡：对撞时按各自接近速度分摊伤害（快的一方伤害多、自伤少）；侧/尾撞的攻击方自伤封顶
 hit:{headOnSpeedW:.8,selfCap:24},
 // 竞速模式：圈数、重生、加速带、跳台、AI
 race:{laps:5,respawn:1.6,respawnHp:.6,respawnInv:1.5,boostT:1.4,boostMul:1.38,boostKick:6,jumpMin:9,jumpK:.045,jumpMax:.95,jumpH:46,lateT:20,maxT:240,aiShortcut:.55,aiRam:.5},
 // 攻击道具（持有 1 个，E / 道具键 释放）：w 为刷新权重（原有道具各约 1）；aiHold 为 AI 最长持有秒数；mine.max 为每车场上最多地雷数
 items:{aiHold:9,missile:{w:.7,dmg:22,spd:32,turn:3.2,life:2.6,range:40,kick:14,aiRange:26},mine:{w:.7,dmg:26,arm:.7,life:12,r:2.4,kick:18,max:2},oil:{w:.6,life:10,r:3.6},magnet:{w:.5,t:4,r:16,pull:22}},
 // 竞速追赶：名次在后 from 比例之后的车，拾取时按 up×落后程度 的概率升级为强道具
 catchUp:{from:.4,up:.8,strong:['missile','magnet','boost']},
 // v23 新地图机关。冰湖：冰窟窿 关 shut 秒 → 裂纹预警 warn → 开 open（掉进去重伤并弹出）。工厂：传送带推车 + 电地板 idle → warn → on（持续伤害+减速）
 ice:{holes:[2,3],holeR:3.2,shut:[5,9],warn:1.6,open:3.5,fallDmg:.6,fallKick:20,fallCd:1.5},// fallDmg=掉进冰窟窿扣最大耐久比例，随后弹到洞外；fallCd 秒内不重复判定
 fac:{belts:2,beltL:16,beltW:2.6,beltSpd:7,pads:[2,3],padR:3,idle:[4,7],warn:1.2,on:2.2,dps:24,slow:2.5},
 // v24 特效部件：drill 撞击伤害转回血比例；shockRam 撞击≥min 伤害时对手失控 t 秒；shieldGen 每 cd 秒自动护盾 t 秒；magShell 吸附 r 米内道具；
 // twinDash 第 2 次充能间隔 gap 秒；regenEngine 未受伤 wait 秒后每秒回 hps；boostTire 加速带/加速道具 速度×mul、额外推力 kick、对战加速 t 秒；driftTire 侧滑速度>lat 时冲刺冷却额外 ×k 速度恢复
 parts:{quakeRam:{r:6,kick:14},blastArmor:{cut:.4},lastStand:{hp:.3,spd:1.15,dmg:1.2},anchorTire:{cut:.35},drill:{steal:.3},shockRam:{t:.7,min:6},shieldGen:{cd:14,t:3},magShell:{r:11,spd:16},twinDash:{gap:.35},regenEngine:{wait:3,hps:1.6},boostTire:{mul:1.18,kick:4,t:2.5},driftTire:{lat:4,k:1.2}},
 // v27 新部件：quakeRam 冲刺撞击震开 r 米内其他车（速度 kick）；blastArmor 非撞击伤害（道具/爆炸/机关/电网）×(1-cut)；lastStand 耐久<hp 比例时 速度×spd 撞击×dmg；anchorTire 被撞速度变化 ×(1-cut)
 // 部件经济：合成所需碎片（按稀有度）、掉落稀有度概率（结算/宝箱/抽奖碎片共用）
 // 内存：部件图层（每张 512² ≈1MB 解码）手机端软上限
 mem:{partMob:24},
 eco:{need:{w:10,b:20,p:30,g:40},drop:{w:.6,b:.28,p:.09,g:.03}},
 // 商店：看广告领金币
 coinAd:{max:3,v:100}
};
