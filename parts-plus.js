// 模块 parts-plus（v24）：特效部件效果，对战/竞速通用。参数在 TUNE.parts，部件定义（名称/槽位/稀有度/说明）在 game.js PARTS
// 吸血钻头：撞击伤害转回血 · 电击撞角：撞击让对手失控 · 护盾发生器：定时自动护盾 · 磁力外壳：吸道具
// 双冲刺引擎：2 次充能 · 回收引擎：脱战回血 · 加速带轮胎：加速带/加速道具更强 · 漂移胎：漂移加快冲刺冷却
// v27：震波撞角：冲刺撞击震开周围车 · 防爆装甲：非撞击伤害（道具/爆炸/机关）减免 · 背水引擎：低耐久加速加伤 · 锚定胎：被撞击退减少
(()=>{const T=TUNE.parts,has=(c,id)=>!!(c&&c.eq&&c.eq.includes(id));const ST={steal:0,shock:0,shield:0,mag:0,dash2:0,regen:0,boost:0,drift:0,quake:0,blast:0,last:0,anchor:0};
// 撞击：collide 里第一次 hurt 是主撞击（之后是反伤/自伤），只对主撞击生效
let hitN=0;{const _c=collide;collide=function(a,b){const an=[a,b].filter(c=>has(c,'anchorTire')).map(c=>[c,c.vx,c.vz]);hitN=1;try{return _c.apply(this,arguments)}finally{hitN=0;
 for(const[c,vx,vz]of an){const k=1-T.anchorTire.cut,dx=c.vx-vx,dz=c.vz-vz;if(dx||dz){c.vx=vx+dx*k;c.vz=vz+dz*k;ST.anchor+=Math.hypot(dx,dz)*T.anchorTire.cut}}}}}
{const _h=hurt;hurt=function(c,d,by){const hp0=c.hp,main=hitN===1;if(hitN)hitN++;
 if(!hitN&&d>0&&d<9999&&has(c,'blastArmor')){const cut=d*T.blastArmor.cut;d-=cut;ST.blast+=cut}
 const r=_h.call(this,c,d,by),dealt=Math.max(0,hp0-c.hp);if(dealt>0)c.lastHurtT=time;
 if(main&&by&&by!==c&&dealt>0&&by.alive){
  if(has(by,'drill')){const h=Math.min(by.maxhp-by.hp,dealt*T.drill.steal);if(h>0){by.hp+=h;ST.steal+=h;if(h>=2&&(by.isP||nearP(by.x,by.z)>.5))ft(by.x,by.z,3,'+'+Math.round(h),'#7bd94f',by.isP?22:16,by.isP)}}
  if(has(by,'quakeRam')&&by.dash>0){let n=0;for(const o of cars){if(o===by||o===c||!o.alive||o.dummy||(o.team!=null&&o.team===by.team))continue;const dx=o.x-c.x,dz=o.z-c.z,dd=Math.hypot(dx,dz);if(dd<T.quakeRam.r&&dd>.01){const k=T.quakeRam.kick*(1-dd/T.quakeRam.r*.5);o.vx+=dx/dd*k;o.vz+=dz/dd*k;n++}}if(n){ST.quake+=n;spark(c.x,c.z,16,'#c77dff');if(by.isP||nearP(c.x,c.z)>.5)ft(c.x,c.z,3.6,'震波！','#d8b4ff',by.isP?24:18,by.isP)}}
  if(has(by,'shockRam')&&dealt>=T.shockRam.min&&c.alive){c.stunT=T.shockRam.t;ST.shock++;spark(c.x,c.z,10,'#7df9ff');if(c.isP||by.isP)ft(c.x,c.z,3.4,'电击失控！','#7df9ff',c.isP?24:18,true)}}
 return r}}
// 驾驶：失控时无输入；双冲刺第一次冲刺后只等 gap 秒；漂移胎侧滑时冷却加快
{const _d=drive;drive=function(c,ix,iz,dsh,dt,rev){if(c.stunT>0){c.stunT-=dt;ix=iz=0;dsh=false;rev=false}
 const tw=has(c,'twinDash');if(tw){if(c.ch==null)c.ch=1;if(c.ch<1&&(c.chT-=dt)<=0)c.ch=1}
 const r=_d.call(this,c,ix,iz,dsh,dt,rev);
 if(tw&&c.dash>0&&c.dcd===c.dcdMax&&c.dcd>T.twinDash.gap&&c.ch>=1){c.ch=0;c.chT=c.dcd;c.dcd=c.dcdMax=T.twinDash.gap;ST.dash2++}
 if(has(c,'driftTire')&&c.dcd>0){const lat=Math.abs(c.vx*Math.cos(c.h)-c.vz*Math.sin(c.h));if(lat>T.driftTire.lat){c.dcd-=dt*T.driftTire.k;ST.drift+=dt}}
 return r}}
// 加速带轮胎：对战里拿加速道具 → 额外加速 t 秒
{const _on=window.onPK;window.onPK=function(c,k,src){if(_on)_on.apply(this,arguments);if(k==='boost'&&has(c,'boostTire')){c.btT=T.boostTire.t;ST.boost++}}}
const _s=step;step=function(dt){const act=running&&!tut;const bt=[];
 if(act)for(const c of cars)if(has(c,'boostTire')&&((c.boostT||0)>0||(c.btT||0)>0)){bt.push([c,c.spd]);c.spd*=T.boostTire.mul}
 const ls=[];if(act)for(const c of cars)if(c.alive&&has(c,'lastStand')&&c.hp<c.maxhp*T.lastStand.hp){ls.push([c,c.spd,c.dmg]);c.spd*=T.lastStand.spd;c.dmg*=T.lastStand.dmg;ST.last+=dt;if(!c._ls){c._ls=1;if(c.isP||nearP(c.x,c.z)>.5)ft(c.x,c.z,3.4,'背水一战！','#ff7b29',c.isP?24:18,c.isP)}}else if(c._ls&&c.hp>=c.maxhp*T.lastStand.hp)c._ls=0;
 try{_s(dt)}finally{for(const[c,v,d]of ls){c.spd=v;c.dmg=d}for(const[c,v]of bt)c.spd=v}
 if(!act)return;
 for(const c of cars){if(!c.alive||c.dummy||!c.eq||!c.eq.length)continue;
  if(has(c,'boostTire')){if(c.onPad&&!c._op){c.vx+=Math.sin(c.h)*T.boostTire.kick;c.vz+=Math.cos(c.h)*T.boostTire.kick;ST.boost++}c._op=c.onPad;if(c.btT>0)c.btT-=dt}
  if(has(c,'shieldGen')){c.sgT=(c.sgT==null?T.shieldGen.cd*.5:c.sgT)-dt;if(c.sgT<=0){c.sgT=T.shieldGen.cd;if(!(c.shT>0)){c.shT=T.shieldGen.t;ST.shield++;if(c.isP)ft(c.x,c.z,3,'护盾启动','#7cc4ff',20,true)}}}
  if(has(c,'regenEngine')&&c.hp<c.maxhp&&time-(c.lastHurtT||-99)>T.regenEngine.wait){const h=Math.min(c.maxhp-c.hp,T.regenEngine.hps*dt);c.hp+=h;ST.regen+=h}
  if(has(c,'magShell'))for(const p of __v11.PK){const dx=c.x-p.x,dz=c.z-p.z,d=Math.hypot(dx,dz);if(d<T.magShell.r&&d>.5){const v=Math.min(d-.4,T.magShell.spd*dt);p.x+=dx/d*v;p.z+=dz/d*v;ST.mag+=v}}}
 // 冲刺键角标：双冲刺显示可用次数
 if(player){const db=$('dash'),n=has(player,'twinDash')?(player.dcd<=0?1:0)+(player.ch>=1&&player.dcd<=T.twinDash.gap?1:0):-1,v=n<0?'':String(n);if(db.dataset.ch!==v){if(v)db.dataset.ch=v;else delete db.dataset.ch}}};
{const _st=start;start=function(){const r=_st.apply(this,arguments);for(const c of cars){if(c.eq)for(const id of c.eq)partImg(c.k,id);c._ls=0;c.stunT=0;c.ch=1;c.chT=0;c.btT=0;c.sgT=null;c.lastHurtT=-99}return r}}
// 失控：车上方电弧
{const _dt=drawTags;drawTags=function(){for(const c of cars)if(c.alive&&c.stunT>0){const[sx,sy]=iso(c.x,c.z);ctx.save();ctx.strokeStyle='#bff8ff';ctx.lineWidth=2;ctx.shadowColor='#7df9ff';ctx.shadowBlur=8;for(let n=0;n<2;n++){ctx.beginPath();let x=sx-18,y=sy-34-n*8;ctx.moveTo(x,y);while(x<sx+18){x+=rnd(4,8);ctx.lineTo(x,y+rnd(-6,6))}ctx.stroke()}ctx.restore()}return _dt.apply(this,arguments)}}
// 埋点：开局记录玩家装备的特效部件
{const FX=Object.keys(PARTS).filter(id=>PARTS[id].fx);const _st=start;start=function(k,opt){const r=_st.apply(this,arguments);if(!(opt&&opt.tutorial)&&player){const f=player.eq.filter(id=>FX.includes(id));if(f.length)track('fx_part_start',{parts:f.join(','),mode:MODE,map:mapKey})}return r}}
window.__parts={ST,has};
})();
