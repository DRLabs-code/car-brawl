// ===== v11：对战道具 / 广告复活 / 推出擂台 / 每日挑战 / 冲撞集锦 =====
(()=>{const L=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
if(AB.revive===undefined)AB.revive=1;
// ---------- 推出擂台地图 ----------
const circ=Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return[Math.cos(a)*30,Math.sin(a)*30]});
MAPS.ring=Object.assign({},MAPS.site,{name:'推出擂台',en:'PUSH-OUT RING',desc:'圆台持续缩小 · 掉下台即淘汰',tiles:['#4a3f7a','#40366b'],line:'#6a5fa8',speck:['#574c8c','#3a3062'],out:['#0b0816','#120d22','#0a0714'],rail:['#7df9ff','#1b1420'],paint:'#7df9ffaa',logo:'RING',zone:{k:'mud',name:'',n:0,r:[3,5]},dust:'#9a90d0',shape:'圆形擂台',poly:circ,walls:[],pits:[],mesas:[],zc:[0,0]});
MODE=localStorage.getItem('carbrawl_mode')==='ring'?'ring':'brawl';if(!BUILD.modes.includes(MODE))MODE=BUILD.modes[0];
const _build=buildArena;buildArena=function(mk,R){_build(mk,R);if(mk==='ring'){props=[];gzones=[];buildGrid();ZC=[0,0];updZone();buildFloor()}};
window.ringZone=()=>{const t=Math.max(0,time-2.5);let f=1-.62*Math.min(1,t/55);if(t>55)f-=Math.min(.25,(t-55)/12*.25);return AR*Math.max(.12,f)};
window.ringFall=(c,dt)=>{if(!c.alive||c.dummy)return;if(sdist(ZPOLY,c.x,c.z).s>.4){c.fallT=(c.fallT||0)+dt;if(c.fallT>.18){c.fell=true;c.shT=0;c.invT=0;const by=c.lastBy&&time-c.lastByT<5&&c.lastBy!==c?c.lastBy:null;ft(c.x,c.z,2.4,'落台！','#7df9ff',30,true);track('ring_fall',{isP:!!c.isP,byP:by===player,self:!by});hurt(c,1e6,by)}}else c.fallT=0};
window.ringUnder=()=>{ctx.save();ctx.beginPath();ctx.rect(-6000,-6000,12000,12000);ZPOLY.forEach((q,i)=>{const p=iso(q[0],q[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.fillStyle='rgba(6,4,14,.93)';ctx.fill('evenodd');
 ctx.beginPath();ZPOLY.forEach((q,i)=>{const p=iso(q[0],q[1]);i?ctx.lineTo(p[0],p[1]+14):ctx.moveTo(p[0],p[1]+14)});ctx.closePath();ctx.strokeStyle='#2a2150';ctx.lineWidth=14;ctx.stroke();
 ctx.beginPath();ZPOLY.forEach((q,i)=>{const p=iso(q[0],q[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.strokeStyle='#7df9ff';ctx.lineWidth=4;ctx.shadowColor='#7df9ff';ctx.shadowBlur=14;ctx.globalAlpha=.75+.25*Math.sin(time*5);ctx.stroke();ctx.restore()};
// ---------- 道具 ----------
const PKT={heal:{n:'修复包',ic:'🔧',col:'#3ddc84',d:'恢复30%耐久',w:1},atk:{n:'狂暴',ic:'🔥',col:'#ff4d4d',d:'8秒撞击伤害×1.4',w:1},shield:{n:'护盾',ic:'🛡️',col:'#4aa8ff',d:'8秒内下次受击减伤60%',w:1},boost:{n:'氮气',ic:'⚡',col:'#ffc300',d:'冲刺冷却立即刷新',w:1},spring:{n:'弹簧',ic:'🌀',col:'#c77dff',d:'弹开周围车辆',w:.8}};
window.PKT=PKT;let PK=[],pkNext=10,pkN=0;
function pkType(){let s=0;for(const k in PKT)s+=PKT[k].w;let r=Math.random()*s;for(const k in PKT){r-=PKT[k].w;if(r<0)return k}return'heal'}
function pkPos(near){for(let k=0;k<60;k++){let x,z;if(near&&k<30){const a=Math.random()*7,r=5+Math.random()*6;x=near.x+Math.cos(a)*r;z=near.z+Math.sin(a)*r}else[x,z]=randIn(4);
 if(!inPoly(ZPOLY,x,z)||sdist(ZPOLY,x,z).s>-3||!openCell(x,z,2))continue;{const[ci,cj]=cellOf(x,z);if(!GRID.ok[cj*GRID.n+ci])continue}/* v14：只刷在车能开到的主战场格（以前会刷进封闭工棚/坑/台地里，吃不到又占满 3 个名额） */if(PK.some(p=>Math.hypot(p.x-x,p.z-z)<8)||cars.some(c=>c.alive&&Math.hypot(c.x-x,c.z-z)<3))continue;return[x,z]}return null}
function pkSpawn(){const low=cars.filter(c=>c.alive&&!c.dummy&&c.hp<c.maxhp*.4);let k=pkType(),near=null;if(low.length&&Math.random()<.4){k='heal';near=low[Math.random()*low.length|0]}
 const p=pkPos(near);if(!p)return;PK.push({k,x:p[0],z:p[1],t:0,life:25});PKS.spawn++;track('pickup_spawn',{type:k,mode:MODE,lowHp:!!near})}
const PKS={eaten:0,eatenP:0,spawn:0};function applyPK(c,k,src){const T=PKT[k],full=k==='heal'&&c.hp>=c.maxhp-.5,again=(k==='atk'&&c.atkT>0)||(k==='shield'&&c.shT>0);if(src!=='revive'){PKS.eaten++;if(c.isP)PKS.eatenP++}
 if(k==='heal'){c.hp=Math.min(c.maxhp,c.hp+c.maxhp*.3)}else if(k==='atk')c.atkT=8;else if(k==='shield')c.shT=8;else if(k==='boost'){c.dcd=0}
 else if(k==='spring'){for(const o of cars){if(o===c||!o.alive||o.dummy)continue;const dx=o.x-c.x,dz=o.z-c.z,d=Math.hypot(dx,dz);if(d<9&&d>.01){const im=(26*(1-d/9)+10)/Math.sqrt(o.mass);o.vx+=dx/d*im;o.vz+=dz/d*im;o.lastBy=c;o.lastByT=time;o.flash=.12}}
  parts.push({k:'ring',x:c.x,z:c.z,y:0,t:0,life:.5});spark(c.x,c.z,14,T.col);if(nearP(c.x,c.z)>0)shake=Math.max(shake,8)}
 ft(c.x,c.z,3.2,T.n+'！',T.col,c.isP?26:20,c.isP);
 if(c.isP){toast(full?`${T.ic} ${T.n}：耐久已满（已拾取）`:again?`${T.ic} ${T.n}：时长刷新为 8 秒`:`${T.ic} ${T.n}：${T.d}`);sfx('good');vib('hit');if(src!=='revive')dcAdd('pickup')}
 track('pickup_get',{type:k,isP:!!c.isP,mode:MODE,src:src||'field'})}
function pkIcon(x,k,cx,cy,s){x.save();x.translate(cx,cy);x.fillStyle='#fff';x.strokeStyle='#fff';x.lineWidth=s*.22;x.lineCap='round';x.lineJoin='round';x.beginPath();
 if(k==='heal'){x.rect(-s*.15,-s*.55,s*.3,s*1.1);x.rect(-s*.55,-s*.15,s*1.1,s*.3);x.fill()}
 else if(k==='atk'){x.moveTo(0,-s*.7);x.quadraticCurveTo(s*.6,-s*.1,s*.4,s*.35);x.quadraticCurveTo(0,s*.75,-s*.4,s*.35);x.quadraticCurveTo(-s*.5,-s*.1,-s*.1,-s*.3);x.quadraticCurveTo(0,-s*.1,0,-s*.7);x.fill()}
 else if(k==='shield'){x.moveTo(0,-s*.65);x.lineTo(s*.55,-s*.4);x.quadraticCurveTo(s*.5,s*.35,0,s*.7);x.quadraticCurveTo(-s*.5,s*.35,-s*.55,-s*.4);x.closePath();x.fill()}
 else if(k==='boost'){x.moveTo(s*.15,-s*.7);x.lineTo(-s*.4,s*.1);x.lineTo(-s*.02,s*.1);x.lineTo(-s*.15,s*.7);x.lineTo(s*.4,-s*.1);x.lineTo(s*.02,-s*.1);x.closePath();x.fill()}
 else{x.moveTo(-s*.45,s*.55);for(let i=0;i<4;i++){x.lineTo(s*.45,s*(.4-i*.3));x.lineTo(-s*.45,s*(.25-i*.3))}x.stroke()}
 x.restore()}
const _tags=drawTags;drawTags=function(){if(running||PK.length){for(const p of PK){const[sx,sy0]=iso(p.x,p.z),b=Math.sin((p.t+p.x)*4)*4,sy=sy0-26+b,T=PKT[p.k];if(p.life-p.t<4&&Math.sin(p.t*16)<0)continue;
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(sx,sy0,16,8,0,0,7);ctx.fill();ctx.save();ctx.shadowColor=T.col;ctx.shadowBlur=14;ctx.fillStyle=T.col;ctx.beginPath();ctx.arc(sx,sy,16,0,7);ctx.fill();ctx.restore();
 ctx.lineWidth=3;ctx.strokeStyle='#1b1420';ctx.beginPath();ctx.arc(sx,sy,16,0,7);ctx.stroke();pkIcon(ctx,p.k,sx,sy,15);
 ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1b1420';ctx.strokeText(T.n,sx,sy+30);ctx.fillStyle='#fff';ctx.fillText(T.n,sx,sy+30)}}
 for(const c of cars){if(!c.alive)continue;const[sx,sy]=iso(c.x,c.z);
  if(c.atkT>0){ctx.save();ctx.globalAlpha=.35+.2*Math.sin(time*14);ctx.fillStyle='#ff3030';ctx.shadowColor='#ff2020';ctx.shadowBlur=18;ctx.beginPath();ctx.ellipse(sx,sy-6,50,26,0,0,7);ctx.fill();ctx.restore()}
  if(c.shT>0){ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle='#7cc4ff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx,sy-18,54,40,0,0,7);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle='#7cc4ff';ctx.fill();ctx.restore()}
  if(c.invT>0&&Math.sin(time*20)>0){ctx.save();ctx.globalAlpha=.3;ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(sx,sy-10,46,26,0,0,7);ctx.fill();ctx.restore()}}
 _tags()};
// HUD 状态图标
const hudEl=$('hud'),bf=document.createElement('div');bf.id='buffs';hudEl.appendChild(bf);let bfS='';
function buffHud(){const p=player;let s='';if(p&&p.alive){if(p.atkT>0)s+=`<span class="buf atk">🔥 狂暴 <b>${Math.ceil(p.atkT)}</b></span>`;if(p.shT>0)s+=`<span class="buf sh">🛡️ 护盾 <b>${Math.ceil(p.shT)}</b></span>`;if(p.invT>0)s+=`<span class="buf inv">✨ 无敌</span>`}if(s!==bfS){bf.innerHTML=s;bfS=s}}
// ---------- 伤害修正 / 事件 ----------
const _hurt=hurt;hurt=function(c,d,by){if(!c||!c.alive||c.dummy||!running)return _hurt(c,d,by);
 if(MODE==='ring'&&d<1e5&&!(by&&by!==c))d=Math.min(d,Math.max(0,c.hp-1));if(by&&by!==c){if(c.invT>0)return;if(by.atkT>0)d*=1.4;if(MODE==='ring'&&d<1e5){d=Math.min(d*.4,Math.max(0,c.hp-1));const dx=c.x-by.x,dz=c.z-by.z,l=Math.hypot(dx,dz)||1,im=Math.min(14,d*.35)*(1+(1-c.hp/c.maxhp)*1.5)/Math.sqrt(c.mass);c.vx+=dx/l*im;c.vz+=dz/l*im}if(c.shT>0&&d<1e5){d*=.4;c.shT=0;ft(c.x,c.z,3,'护盾抵挡','#7cc4ff',22);track('shield_block',{isP:!!c.isP})}c.lastBy=by;c.lastByT=time}
 const dashing=by&&by.dash>0;_hurt(c,d,by);const killed=!c.alive;
 if(!tut&&by){if(killed&&by===player){dcAdd('kill');if(dashing)dcAdd('dashKill');if(c.fell)dcAdd('ringFall')}
  if((by===player||c===player)&&d>3){const s=(by===player?1:.5)*(Math.min(d,80)*(dashing?1.6:1)+(killed?60:0));HL.evs.push({t:time,s,x:c.x,z:c.z,txt:killed?(by===player?(c.fell?'推下台！':'撞毁！'):'被撞毁'):dashing?'冲撞！':''})}}};
// ---------- AI：抢道具 + 擂台不自己开下去 ----------
const _ai=aiThink;aiThink=function(c,dt){let o=_ai(c,dt);if(!running||tut)return o;
 if(PK.length&&!(c.ai.t&&c.ai.t.alive&&Math.hypot(c.ai.t.x-c.x,c.ai.t.z-c.z)<6)){let best=null,bd=1e9;for(const p of PK){let w=Math.hypot(p.x-c.x,p.z-c.z);if(p.k==='heal')w*=c.hp<c.maxhp*.5?.45:1.8;if(w<bd){bd=w;best=p}}
  if(best&&bd<12+c.sk*10){const dx=best.x-c.x,dz=best.z-c.z,l=Math.hypot(dx,dz)||1;o=[dx/l,dz/l,false]}}
 if(MODE==='ring'){const px=c.x+c.vx*.45,pz=c.z+c.vz*.45,s=-Math.max(sdist(ZPOLY,c.x,c.z).s,sdist(ZPOLY,px,pz).s),lim=5+zoneR*.2;
  if(s<lim){const dx=ZC[0]-c.x,dz=ZC[1]-c.z,l=Math.hypot(dx,dz)||1,w=s<lim*.45?1:Math.min(1,(lim-s)/lim+.3);let ix=o[0]*(1-w)+dx/l*w*1.8,iz=o[1]*(1-w)+dz/l*w*1.8;const m=Math.hypot(ix,iz)||1;o=[ix/m,iz/m,!!o[2]&&s>lim*.75]}}
 return o};
// ---------- 复活 ----------
let RV={used:false,pending:false,ok:false,tm:null};
window.reviveHold=()=>{if(tut||!running||!AB.revive)return false;if(RV.pending)return true;if(RV.used)return false;
 if(cars.filter(c=>c.alive&&!c.dummy&&c!==player).length<2)return false;RV.used=true;RV.pending=true;let n=6;track('revive_offer',{mode:MODE,t:Math.round(time)});
 const el=$('revive');const draw=()=>{el.innerHTML=`<div class="rcard rvc"><div class="ptitle">💥 被撞毁了！</div><div class="rvt">看视频立即复活<br><small>恢复 50% 耐久 · 2 秒无敌 · 随机送 1 个道具</small></div><div class="rvcd">${n}</div><div class="col"><button class="btn adbtn" id="rvAd">📺 看视频复活</button><button class="btn ghost" id="rvNo">放弃</button></div><small class="rvn">每局限 1 次</small></div>`;
  $('rvAd').onclick=()=>{clearInterval(RV.tm);show('revive',0);showRewardedAd(ok=>{if(ok)doRevive();else{toast('未看完，无法复活');RV.pending=false}},'revive')};$('rvNo').onclick=()=>{clearInterval(RV.tm);show('revive',0);RV.pending=false;track('revive_skip',{})}};
 draw();show('revive',1);RV.tm=setInterval(()=>{if(paused)return;n--;if(n<=0){clearInterval(RV.tm);show('revive',0);RV.pending=false;track('revive_timeout',{})}else{const e=el.querySelector('.rvcd');if(e)e.textContent=n}},1000);return true};
function doRevive(){const p=player;let best=[ZC[0],ZC[1]],bs=-1;for(let i=0;i<50;i++){const q=randIn(4);if(!inPoly(ZPOLY,q[0],q[1])||sdist(ZPOLY,q[0],q[1]).s>-5||!openCell(q[0],q[1],3))continue;const m=Math.min(...cars.filter(c=>c.alive&&c!==p).map(c=>Math.hypot(c.x-q[0],c.z-q[1])));if(m>bs){bs=m;best=q}}
 if(MODE==='ring')best=[ZC[0],ZC[1]];p.alive=true;p.hp=p.maxhp*.5;p.x=best[0];p.z=best[1];p.vx=p.vz=0;p.fwd=0;p.deadT=0;p.fell=false;p.fallT=0;p.place=undefined;p.invT=2;p.dcd=0;deadTime=0;
 const k=pkType();applyPK(p,k,'revive');ft(p.x,p.z,4,'复活！','#ffd23f',32,true);sfx('good');RV.pending=false;RV.ok=true;camSnap=true;track('revive_done',{mode:MODE,gift:k})}
// ---------- 每日挑战 ----------
const DCP={dashKill:{n:'冲撞击杀',d:'冲刺中撞毁对手',ic:'💥',g:2,r:{coins:80}},kill:{n:'撞毁对手',d:'任意模式撞毁对手',ic:'🚗',g:5,r:{coins:60}},play:{n:'完成对局',d:'完成任意对局',ic:'🎮',g:3,r:{coins:50}},
 pickup:{n:'拾取道具',d:'对战中拾取道具',ic:'🎁',g:4,r:{shards:3}},win:{n:'乱斗夺冠',d:'在乱斗模式获得第一',ic:'👑',g:1,r:{shards:4}},ringWin:{n:'擂台称王',d:'在推出擂台获胜',ic:'⭕',g:1,r:{coins:120}},ringFall:{n:'推下擂台',d:'把对手推下擂台',ic:'🌀',g:3,r:{coins:80}}};
const DC_SLOTS=[['dashKill','kill','play'],['pickup','win'],['ringWin','ringFall']],DC_CHEST={coins:150,shards:5};
function dcGet(){let d=L('carbrawl_dc',null);const td=today();if(!d||d.d!==td){let h=0;for(const ch of String(td))h=(h*31+ch.charCodeAt(0))>>>0;d={d:td,t:DC_SLOTS.map((s,i)=>({id:s[(h>>(i*3))%s.length],p:0,c:0})),chest:0,seen:0};S('carbrawl_dc',d);track('dc_new_day',{tasks:d.t.map(t=>t.id).join(',')})}return d}
window.dcAdd=(id,n=1)=>{const d=dcGet();for(const t of d.t){if(t.id!==id||t.p>=DCP[id].g)continue;t.p=Math.min(DCP[id].g,t.p+n);if(t.p>=DCP[id].g){toast(`📋 挑战完成：${DCP[id].n}，去领奖！`);track('dc_complete',{id})}}S('carbrawl_dc',d);dcDot()};
const dcBadge=()=>{const d=dcGet();return!d.seen||d.t.some(t=>t.p>=DCP[t.id].g&&!t.c)||(d.t.every(t=>t.c)&&!d.chest)};
function dcDot(){const e=$('dcDot');if(e)e.classList.toggle('hide',!dcBadge())}
function giveR(r){const got={};if(r.coins)save.coins+=r.coins;for(let i=0;i<(r.shards||0);i++)grantShards(rollPart(),1,got);persist();
 return[r.coins?`${r.coins} 金币`:'',...Object.entries(got).map(([k,v])=>k==='uni'?`通用碎片×${v}`:`${PARTS[k].n}碎片×${v}`)].filter(Boolean).join('、')}
const rTxt=r=>[r.coins?icCoin(r.coins):'',r.shards?`<span class="dcsh">🧩×${r.shards}</span>`:''].join('');
function dcRender(){const d=dcGet(),all=d.t.every(t=>t.c);$('dc').innerHTML=`<div class="rcard dcw"><div class="ptitle">📋 每日挑战</div><small class="dcsub">每天 0 点刷新 · 全部领取后开宝箱</small>
 ${d.t.map((t,i)=>{const P=DCP[t.id],done=t.p>=P.g;return`<div class="dcrow ${t.c?'got':done?'done':''}"><span class="dci">${P.ic}</span><div class="dcm"><b>${P.n} <em>${t.p}/${P.g}</em></b><small>${P.d}</small><div class="dcbar"><i style="width:${t.p/P.g*100}%"></i></div></div><div class="dcr">${rTxt(P.r)}</div><button class="btn sm ${done&&!t.c?'':'ghost'}" data-dc="${i}" ${done&&!t.c?'':'disabled'}>${t.c?'已领取':done?'领取':'进行中'}</button></div>`}).join('')}
 <div class="dcchest ${all&&!d.chest?'ready':''}"><span class="dci">🎁</span><div class="dcm"><b>全部完成宝箱</b><small>${d.t.filter(t=>t.c).length}/3 已领取</small></div><div class="dcr">${rTxt(DC_CHEST)}</div><button class="btn sm ${all&&!d.chest?'':'ghost'}" id="dcChest" ${all&&!d.chest?'':'disabled'}>${d.chest?'已开启':'开宝箱'}</button></div>
 <div class="btns"><button class="btn ghost" id="dcBack">返回</button></div></div>`;
 $('dc').querySelectorAll('[data-dc]').forEach(b=>b.onclick=()=>{const d=dcGet(),t=d.t[+b.dataset.dc];if(t.c||t.p<DCP[t.id].g)return;t.c=1;S('carbrawl_dc',d);const g=giveR(DCP[t.id].r);toast('获得 '+g);sfx('good');track('dc_claim',{id:t.id});dcRender();dcDot()});
 $('dcChest').onclick=()=>{const d=dcGet();if(d.chest||!d.t.every(t=>t.c))return;d.chest=1;S('carbrawl_dc',d);const g=giveR(DC_CHEST);toast('🎁 宝箱：'+g);sfx('good');track('dc_chest',{});dcRender();dcDot()};
 $('dcBack').onclick=()=>menu()}
window.openDC=()=>{hideAll();show('dc',1);const d=dcGet();d.seen=1;S('carbrawl_dc',d);dcRender();dcDot();track('dc_open',{})};
PANELS.push('dc','revive');$('menuDC').onclick=openDC;
// ---------- 模式选择 ----------
function modeUI(){document.querySelectorAll('#modeSel [data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===MODE));const h=$('modeHint');if(h)h.textContent=MODE==='ring'?'⭕ 圆台持续缩小，把对手推下台！约 60 秒':'🚗 经典乱斗：电网收缩，撞到最后一个'}
{const ms=$('modeSel'),h=document.createElement('div');if(BUILD.modes.length<2)ms.style.display='none';ms.querySelectorAll('[data-mode]').forEach(b=>{if(!BUILD.modes.includes(b.dataset.mode))b.remove()});h.id='modeHint';ms.after(h);ms.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{MODE=b.dataset.mode;localStorage.setItem('carbrawl_mode',MODE);sfx('ui');modeUI();track('mode_select',{mode:MODE})})}
const _menu=menu;menu=function(){HL.play=false;_menu();modeUI();dcDot()};
const _om=openMaps;openMaps=function(k){if(MODE==='ring'){matchThenStart(k,'ring');return}_om(k)};
const _mts=matchThenStart;matchThenStart=function(k,m){if(MODE!=='ring'&&m==='ring')m=MAPK[0];if(MODE==='ring')m='ring';return _mts(k,m)};
$('again').onclick=()=>{if(MODE==='ring')mapKey='ring';else if(mapKey==='ring')mapKey=MAPK[0];buildArena(mapKey,arenaR(roster(save.cars[playerKey].lv).n));start(playerKey)};
// ---------- 冲撞集锦 ----------
const HL={fr:[],evs:[],acc:0,play:false,blob:null,rec:null};window.HL=HL;
const TTREC={rm:null,start(){try{if(window.tt&&tt.getGameRecorderManager){this.rm=tt.getGameRecorderManager();if(this.on){try{this.rm.stop()}catch(e){}}this.rm.start({duration:300});this.on=true}}catch(e){this.rm=null}},
 clip(before,after,cb){if(!this.rm)return cb&&cb(null);try{this.rm.onStop(r=>{this.rm.clipVideo({path:r.videoPath,timeRange:[before,after],success:o=>cb(o.videoPath),fail:()=>cb(r.videoPath)})});this.rm.stop();this.on=false}catch(e){cb&&cb(null)}}};
window.TTREC=TTREC;
// 发布到抖音小游戏时：tt 录屏得到 videoPath 后走 tt.shareAppMessage；Web 走 navigator.share / 下载
window.shareHighlight=function(blob,meta){meta=meta||{};
 if(window.tt&&tt.shareAppMessage&&meta.videoPath){tt.shareAppMessage({channel:'video',title:'车手大作战 · 冲撞集锦',extra:{videoPath:meta.videoPath,videoTopics:['车手大作战']},success:()=>track('hl_share',{via:'tt'}),fail:()=>track('hl_share_fail',{via:'tt'})});return'tt'}
 const f=blob&&new File([blob],hlName(blob),{type:blob.type});if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'车手大作战 · 冲撞集锦'}).then(()=>track('hl_share',{via:'web'})).catch(()=>{});return'web'}
 hlDownload(blob);toast('已保存视频，可手动分享');track('hl_share',{via:'download'});return'download'};
const hlName=b=>'车手大作战-冲撞集锦.'+(/mp4/.test(b.type)?'mp4':'webm');
function hlDownload(b){if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=hlName(b);document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
$('hlDl').onclick=()=>{hlDownload(HL.blob);track('hl_download',{size:HL.blob&&HL.blob.size})};$('hlShare').onclick=()=>shareHighlight(HL.blob,{videoPath:HL.ttPath});
function hlRecord(){HL.fr.push({t:time,c:cars.map(c=>[c.x,c.z,c.h,c.alive,c.hp,c.dash,c.yaw||0,c.roll||0,c.fwd])});while(HL.fr.length&&HL.fr[0].t<time-15)HL.fr.shift()}
function hlPick(){const F=HL.fr;if(F.length<10)return null;const tA=F[0].t,tB=F[F.length-1].t;let best=null,bs=0;
 for(const e of HL.evs){const t1=Math.min(tB,e.t+1.6),t0=Math.max(tA,t1-5);const s=HL.evs.filter(q=>q.t>=t0&&q.t<=t1).reduce((a,q)=>a+q.s,0);if(s>bs){bs=s;best=[t0,t1]}}
 return{t0:best?best[0]:Math.max(tA,tB-5),t1:best?best[1]:tB,score:Math.round(bs)}}
function hlApply(T){const F=HL.fr;let i=HL.fi||0;if(i>=F.length||F[i].t>T)i=0;while(i<F.length-1&&F[i+1].t<=T)i++;HL.fi=i;const f=F[i];
 f.c.forEach((s,j)=>{const c=cars[j];if(!c)return;if(c.alive&&!s[3]){boom(s[0],s[1],c.s.col);shake=Math.max(shake,10)}[c.x,c.z,c.h]=s;c.alive=s[3];c.hp=s[4];c.dash=s[5];c.yaw=s[6];c.roll=s[7];c.fwd=s[8];c.vx=c.vz=0})}
function hlStep(dt){const vis=!$('result').classList.contains('hide');if(!vis){HL.tt=0;return}// 结算面板渲染（读取 alive/名次）之前不改车辆状态
 const prev=HL.t0+HL.tt;HL.tt+=dt;const T=HL.t0+HL.tt;
 if(HL.tt<dt*1.5&&!HL.blob&&!HL.rec)hlRecStart();
 for(const e of HL.evs)if(e.t>prev&&e.t<=T){spark(e.x,e.z,18,'#ffd23f');if(e.txt)ft(e.x,e.z,3,e.txt,'#ffd23f',30,true);shake=Math.max(shake,9)}
 if(T>HL.t1+.5){if(HL.rec){try{HL.rec.stop()}catch(e){}HL.rec=null}HL.tt=0;HL.fi=0;HL.loops=(HL.loops||0)+1;if(HL.fr.length)cars.forEach((c,j)=>{const s=HL.fr[0].c[j];if(s)c.alive=s[3]})}else hlApply(T)}
function hlRecStart(){const c=$('hlCv');if(!window.MediaRecorder||!c.captureStream)return;const mt=['video/mp4;codecs=avc1','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mt)return;
 try{const r=new MediaRecorder(c.captureStream(30),{mimeType:mt,videoBitsPerSecond:2.5e6}),ch=[];r.ondataavailable=e=>e.data.size&&ch.push(e.data);r.onstop=()=>{HL.blob=new Blob(ch,{type:mt.split(';')[0]});$('hlDl').disabled=$('hlShare').disabled=false;$('hlTxt').textContent=`${(HL.t1-HL.t0+.5).toFixed(1)} 秒 · 可下载/分享`;track('hl_ready',{size:HL.blob.size,type:HL.blob.type,dur:+(HL.t1-HL.t0).toFixed(1)})};r.start(200);HL.rec=r}catch(e){HL.rec=null}}
function hlDraw(){const c=$('hlCv'),x=c.getContext('2d'),sw=cv.width*.62,sh=sw*c.height/c.width;x.drawImage(cv,(cv.width-sw)/2,(cv.height-sh)/2+cv.height*.04,sw,sh,0,0,c.width,c.height);
 x.fillStyle='rgba(0,0,0,.45)';x.fillRect(0,0,c.width,22);x.font='900 13px system-ui';x.textAlign='left';x.fillStyle='#ffd23f';x.fillText('💥 冲撞集锦',8,16);x.textAlign='right';x.fillStyle='#fff';x.fillText('车手大作战',c.width-8,16);
 x.fillStyle='#ffd23f';x.fillRect(0,c.height-4,c.width*Math.min(1,HL.tt/(HL.t1-HL.t0+.5)),4)}
const _render=render;render=function(){_render();if(HL.play&&!$('result').classList.contains('hide'))hlDraw()};
// ---------- 生命周期 ----------
const _start=start;start=function(k,opt){opt=opt||{};if(HL.rec){try{HL.rec.stop()}catch(e){}HL.rec=null}HL.play=false;HL.fr=[];HL.evs=[];HL.blob=null;HL.loops=0;HL.ttPath=null;$('hl').classList.add('hide');$('hlDl').disabled=$('hlShare').disabled=true;
 if(opt.tutorial&&MODE==='ring'){MODE='brawl'}
 _start(k,opt);PK=[];pkNext=10;pkN=0;clearInterval(RV.tm);RV={used:false,pending:false,ok:false,tm:null};
 for(const c of cars){c.atkT=c.shT=c.invT=0;c.fell=false;c.fallT=0;c.lastBy=null;if(MODE==='ring'&&!opt.tutorial)c.push=(c.push||1)*1.5}
 $('zoneWarn').textContent=MODE==='ring'&&!opt.tutorial?'⭕ 擂台缩小中，别掉下去！':'⚡ 电网收缩中';
 if(!opt.tutorial){TTREC.start();track('match_mode',{mode:MODE,cars:nCars})}};
const _step=step;step=function(dt){if(HL.play&&!running){hlStep(dt);return}_step(dt);if(!running||tut)return;
 for(const c of cars){if(c.atkT>0)c.atkT-=dt;if(c.shT>0)c.shT-=dt;if(c.invT>0)c.invT-=dt}
 if(time>=pkNext&&PK.length<3){pkSpawn();pkNext=time+4+Math.random()*3}
 for(let i=PK.length-1;i>=0;i--){const p=PK[i];p.t+=dt;if(p.t>p.life||!inPoly(ZPOLY,p.x,p.z)){PK.splice(i,1);continue}for(const c of cars)if(c.alive&&!c.dummy&&Math.hypot(c.x-p.x,c.z-p.z)<2.6){PK.splice(i,1);applyPK(c,p.k);if(c.isP)pkN++;break}}
 HL.acc+=dt;if(HL.acc>=1/30){HL.acc=0;hlRecord()}buffHud()};
const _fin=finish;finish=function(){const win=player.alive;clearInterval(RV.tm);show('revive',0);RV.pending=false;_fin();if(tut)return;
 dcAdd('play');if(win)dcAdd(MODE==='ring'?'ringWin':'win');PK=[];bf.innerHTML='';bfS='';
 track('match_end_v11',{mode:MODE,win,kills,pickups:pkN,revived:RV.ok,t:Math.round(time)});
 const w=hlPick();if(w){HL.t0=w.t0;HL.t1=w.t1;HL.tt=0;HL.fi=0;HL.play=true;$('hl').classList.remove('hide');$('hlTxt').textContent='生成中…';track('hl_build',{score:w.score,dur:+(w.t1-w.t0).toFixed(1)});
  TTREC.clip(Math.ceil(time-w.t0)+1,0,p=>{HL.ttPath=p})}};
window.__v11={stats:PKS,get PK(){return PK},set pkNext(v){pkNext=v},applyPK,pkSpawn,RV:()=>RV,doRevive,dcGet,DCP,HL,hlPick,get MODE(){return MODE},set MODE(v){MODE=v}};
dcDot();modeUI();
})();
// v13：结算卡分两列容器（横屏矮屏时左右排布，一屏放下；其他情况 display:contents 保持原样）
(()=>{const cd=document.querySelector('#result .rcard');if(!cd||cd.querySelector('.rc1'))return;const c1=document.createElement('div'),c2=document.createElement('div');c1.className='rc1';c2.className='rc2';
 const right=['rShards','rDouble','rHint','hl'];[...cd.children].forEach(e=>{(right.includes(e.id)||e.classList.contains('btns')?c2:c1).appendChild(e)});cd.append(c1,c2)})();
(()=>{const f=()=>{const a=$('app'),w=a.offsetWidth,h=a.offsetHeight;document.body.classList.toggle('short',w>h);document.body.classList.toggle('tiny',w>h&&h<=540);document.body.style.setProperty('--rw',w+'px');document.body.style.setProperty('--rh',h+'px')};addEventListener('resize',()=>setTimeout(f,60));f();setTimeout(f,300)})();
