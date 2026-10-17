// 可调参数集中处（为 Cocos 迁移整理）：手感 / 队伍 / 机关 / 涂装 / 商店。只放数值，不放逻辑。
window.TUNE={
 // 操控手感（v8 preset B）
 feel:{dead:.12,steerGain:2.2,steerDamp:.25,steerRate:10,kbRateLo:8,kbRateHi:5,lowTurn:.35,lowTurnV:5,hiTurnCut:.25,backAng:1.75,backThr:.35,turnLift:.3,
  accK:1.8,accPow:1.6,accMin:.12,coast:.9,gripG:7,slideLo:3,slideHi:8,slideCut:.45,
  dashT:.55,dashKick:.7,dashTop:1.85,dashGrip:1.1,dashYaw:.85,dashCd:2.5,dashOut:2.9,dashDmg:1.5,dashPush:1.4,
  camK:10,camLead:.35,camLeadMax:6,camLeadK:4,camDead:.5,shakeDecay:25,shakeMax:16,zoomIn:.04,zoomOut:.10},
 // 队伍乱斗
 team:{mvpCoins:30},
 // 地图机关
 hz:{beamFirst:8,beamGap:[6,10],beamWarn:1.5,beamDmg:48,beamHalf:[3.6,.9],
  crushR:3.3,crushOpen:4,crushWarn:1.2,crushClose:.5,crushShut:.6,
  sandR:4.6,sandPull:18,sandDps:4,stormFirst:[20,26],stormGap:[22,30],stormDur:7,
  barrelR:6.5,barrelDmg:[8,26],barrelKick:18,crateCoin:.3,crateCoinV:[5,10],crateDrop:.15,hzMargin:2.6,creditWin:4},
 // 涂装：传说保底与概率、动态叠加缓存上限
 skin:{legPity:30,legSpin:.03,legChest:.06,dynCache:96,cacheDesk:32,cacheMobMB:22,dynCacheMob:16},// 涂装缓存（LRU）：整车 16 向贴图每张约 5.3MB（1152²）；桌面按张数 cacheDesk，手机按体积 cacheMobMB（≈4 张）+ 动态格 16×0.15MB≈2.4MB，合计 <25MB
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
 parts:{drill:{steal:.3},shockRam:{t:.7,min:6},shieldGen:{cd:14,t:3},magShell:{r:11,spd:16},twinDash:{gap:.35},regenEngine:{wait:3,hps:1.6},boostTire:{mul:1.18,kick:4,t:2.5},driftTire:{lat:4,k:1.2}},
 // 商店：看广告领金币
 coinAd:{max:3,v:100}
};
