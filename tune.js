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
 skin:{legPity:30,legSpin:.03,legChest:.06,dynCache:96},
 // 商店：看广告领金币
 coinAd:{max:3,v:100}
};
