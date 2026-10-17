// 模块 mode-race：竞速模式。闭环赛道（双直道 + 两个弯道），3 圈，按检查点进度排名；可互撞，撞毁后在最近检查点重生。
// 道路功能：加速带、跳台（越快飞越远，可越过泥地）、右弯捷径（窄道 + 泥地 + 跳台，快车划算）、减速泥地、弯道轮胎护栏。
(()=>{if(!BUILD.modes.includes('race')){window.__race={off:true};return}
const T=TUNE.race;
if(localStorage.getItem('carbrawl_mode')==='race')MODE='race';
const isR=()=>MODE==='race'&&!tut&&mapKey==='track';
// ---------- 赛道几何（地图单位，建图时 SC=1）----------
const CX=32,RO=40,RI=22,RC=31,SX0=38,SX1=50,SXM=44;
const stad=(r,n)=>{const p=[];for(let i=0;i<=n;i++){const a=-Math.PI/2+Math.PI*i/n;p.push([CX+Math.cos(a)*r,Math.sin(a)*r])}for(let i=0;i<=n;i++){const a=Math.PI/2+Math.PI*i/n;p.push([-CX+Math.cos(a)*r,Math.sin(a)*r])}return p};
const resample=(P,step,closed)=>{const out=[];let acc=0;const n=P.length;for(let i=0;i<(closed?n:n-1);i++){const a=P[i],b=P[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc<=L){const t=acc/L;out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);acc+=step}acc-=L}return out};
// 中心线检查点：从起跑线 (-8,-31) 开始沿 +x 方向
const WP=(()=>{const P=stad(RC,24);let k=0,bd=1e9;const r=resample(P,1,true);r.forEach((p,i)=>{const d=Math.hypot(p[0]+8,p[1]+RC);if(d<bd&&p[1]<0){bd=d;k=i}});const rot=r.slice(k).concat(r.slice(0,k));return rot.filter((p,i)=>i%6===0)})();
const N=WP.length,START=[-8,-RC];
const nearWP=(x,z)=>{let b=0,bd=1e9;WP.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-z);if(d<bd){bd=d;b=i}});return b};
const SW=[[SXM,-26],[SXM,-14],[SXM,-2],[SXM,10],[SXM,22],[SXM-2,29]];// 捷径路线
const iA=nearWP(SXM,-28.6),iB=nearWP(SXM,28.6),SKIP=(iB-iA+N)%N;
const PADS=[{x:14,z:-RC,dx:1,dz:0},{x:20,z:RC,dx:-1,dz:0}],RAMPS=[{x:-6,z:RC,dx:-1,dz:0},{x:SXM,z:-9,dx:0,dz:1}];
const MUD=[{x:-69,z:0,r:3.6},{x:64,z:18.5,r:3.4},{x:64,z:-18.5,r:3.4},{x:SXM,z:2,r:4.2},{x:-19,z:RC,r:3.6}];
MAPS.track=Object.assign({},MAPS.site,{name:'环形赛道',en:'RACE TRACK',desc:'加速带 · 跳台 · 捷径 · 泥地',tiles:['#6b6f78','#646871'],line:'#7c808a',speck:['#5c6068','#7b7f88'],out:['#4f8a3c','#5a9846','#467d35'],rail:['#ff3b3b','#ffffff'],paint:'#ffffffcc',logo:'RACE',zone:{k:'mud',name:'泥地',n:0,r:[3,4]},dust:'#9a9a9a',deco:'site',shape:'环形 · 双直道 · 右弯捷径',poly:stad(RO,14),walls:[],pits:[],mesas:[],zc:[0,-RC]});
const R0=Math.sqrt(pArea(MAPS.track.poly)/Math.PI);// 用这个半径建图 → SC=1
const wallP=(x,z,t)=>({type:t,x,z,r:2.1,solid:true,wall:true,seed:Math.random(),col:'#c0392b'});
function islandWalls(){const out=[],isl=resample(stad(RI,12),3.2,true);
 for(const[x,z]of isl){if(x>SX0-1&&x<SX1+1)continue;out.push(wallP(x,z,Math.abs(x)>CX-1?'tires':'block'))}// 弯道用轮胎护栏，直道用水泥墩
 for(const sx of[SX0,SX1]){const zb=Math.sqrt(RI*RI-(sx-CX)**2);for(let z=-zb+1;z<=zb-1;z+=3.2)out.push(wallP(sx,z,'block'))}return out}
const _build=buildArena;buildArena=function(mk,R){if(mk!=='track')return _build(mk,R);_build(mk,R0);AR=R;
 props=props.filter(p=>!p.solid&&(p.type==='rail'||sdist(POLY,p.x,p.z).s>0)).concat(islandWalls());gzones=MUD.map(m=>({...m}));buildGrid();ZC=[START[0],START[1]];zoneR=AR;updZone();buildFloor();paintTrack()};
function paintTrack(){const x=floor.getContext('2d');x.setTransform(FSC,0,0,FSC,floor.width/2,floor.height/2);
 const poly=(P,fill)=>{x.beginPath();P.forEach(([a,b],i)=>{const[s,t]=iso(a,b);i?x.lineTo(s,t):x.moveTo(s,t)});x.closePath();x.fillStyle=fill;x.fill()};
 poly(stad(RI+.6,16),'#5aa04a');poly([[SX0+1.4,-24],[SX1-1.4,-24],[SX1-1.4,24],[SX0+1.4,24]],'#646871');
 for(const m of MUD){const P=[];for(let k=0;k<20;k++){const t=k/20*Math.PI*2;P.push([m.x+Math.cos(t)*m.r,m.z+Math.sin(t)*m.r])}poly(P,'#6b4f2a');P.forEach(q=>{q[0]=m.x+(q[0]-m.x)*.65;q[1]=m.z+(q[1]-m.z)*.65});poly(P,'#7f5f36')}
 for(let i=0;i<40;i++){const a=Math.random()*7,r=Math.random()*14;const[s,t]=iso(Math.cos(a)*r*1.8,Math.sin(a)*r*.8);x.fillStyle=i%2?'#4f8a3c':'#6cb85a';x.fillRect(s,t,4,2)}
 // 起跑线（黑白格）
 for(let i=0;i<8;i++)for(let j=0;j<2;j++){const z0=-RO+1.5+i*2,x0=START[0]-1+j;poly([[x0,z0],[x0+1,z0],[x0+1,z0+2],[x0,z0+2]],(i+j)%2?'#111':'#fff')}
 const rect=(o,L,Wd,fill)=>{const nx=-o.dz,nz=o.dx,c=[[-L/2,-Wd/2],[L/2,-Wd/2],[L/2,Wd/2],[-L/2,Wd/2]].map(([u,v])=>[o.x+o.dx*u+nx*v,o.z+o.dz*u+nz*v]);poly(c,fill)};
 const chev=(o,col)=>{for(let k=-1;k<=1;k++){const cx=o.x+o.dx*k*2.4,cz=o.z+o.dz*k*2.4,nx=-o.dz,nz=o.dx;poly([[cx+o.dx*1.2,cz+o.dz*1.2],[cx-o.dx*.4+nx*2.6,cz-o.dz*.4+nz*2.6],[cx-o.dx*1.2+nx*2.6,cz-o.dz*1.2+nz*2.6],[cx,cz],[cx-o.dx*1.2-nx*2.6,cz-o.dz*1.2-nz*2.6],[cx-o.dx*.4-nx*2.6,cz-o.dz*.4-nz*2.6]],col)}};
 for(const p of PADS){rect(p,9,8,'#0e6fd6');chev(p,'#7df9ff')}
 for(const r of RAMPS){const w=r.dz?7:9;rect(r,4,w,'#ffc300');for(let k=0;k<4;k++)rect({x:r.x+r.dx*(k-1.5),z:r.z+r.dz*(k-1.5),dx:r.dx,dz:r.dz},.5,w,'#1b1420')}
 x.setTransform(1,0,0,1,0,0)}
// ---------- 模式入口 ----------
const rHint=()=>{const h=$('modeHint');if(h&&MODE==='race')h.textContent=`🏁 竞速：${T.laps} 圈赛道，加速带 · 跳台 · 捷径，可以撞人`};
document.querySelectorAll('#modeSel [data-mode]').forEach(b=>b.addEventListener('click',rHint));{const _m=menu;menu=function(){_m.apply(this,arguments);__v11.modeUI();rHint()}}
{const _om=openMaps;openMaps=function(k){if(MODE==='race'){matchThenStart(k,'track');return}return _om(k)}}
{const _mts=matchThenStart;matchThenStart=function(k,m){if(MODE==='race')m='track';else if(m==='track')m=MAPK[0];return _mts(k,m)}}
{const ag=$('again'),_ag=ag.onclick;ag.onclick=()=>{if(MODE==='race'){matchThenStart(playerKey,'track');return}if(mapKey==='track')mapKey=MAPK[0];_ag()}}
// ---------- 开局：发车格 ----------
let FIN=0,endAt=0,firstFinT=0,RS={boost:0,jump:0,shortcut:0,laps:0};
const _st=start;start=function(k,opt){opt=opt||{};if(MODE!=='race'&&mapKey==='track'&&!opt.tutorial)buildArena(MAPK[0],arenaR(roster(save.cars[k].lv).n));
 if(MODE==='race'&&mapKey!=='track'&&!opt.tutorial)buildArena('track',arenaR(roster(save.cars[k].lv).n));_st(k,opt);if(!isR())return;
 FIN=0;endAt=0;firstFinT=0;RS={boost:0,jump:0,shortcut:0,laps:0};const real=cars.filter(c=>!c.dummy),pi=Math.min(real.length-1,real.length>>1),order=real.filter(c=>!c.isP);order.splice(pi,0,player);
 order.forEach((c,i)=>{c.x=START[0]-4-(i>>1)*6.5-(i&1)*3;c.z=-RC+((i&1)?4:-4);c.h=Math.PI/2;c.vx=c.vz=0;const w=nearWP(c.x,c.z);c.rc={i:w,n:w-N,fin:0,lap:0,sc:null,scLap:-1,lane:rnd(-4,4)};c.air=0;c.boostT=0});
 resetView();$('intro').innerHTML=`<b>${T.laps}</b> 圈竞速<small>${real.length} 辆车 · 加速带/跳台/捷径 · 撞人也算本事！</small>`;track('race_start',{n:real.length,laps:T.laps,car:k,grid:pi+1})};
// ---------- 进度 / 排名 ----------
function prog(c){const rc=c.rc;let best=0;for(let j=1;j<=SKIP+3;j++){const p=WP[(rc.i+j)%N];if(Math.hypot(p[0]-c.x,p[1]-c.z)<10)best=j}if(best){rc.i=(rc.i+best)%N;rc.n+=best}
 const lap=Math.floor(rc.n/N);if(lap>rc.lap){rc.lap=lap;if(c.isP){RS.laps=lap;if(lap<T.laps){toast(lap===T.laps-1?'🔥 最后一圈！':`🏁 第 ${lap+1} 圈`);sfx('good')}track('race_lap',{lap,t:+time.toFixed(1),pos:posOf(c)})}}
 if(!rc.fin&&rc.n>=T.laps*N){rc.fin=++FIN;rc.finT=time;if(FIN===1)firstFinT=time;ft(c.x,c.z,4,c.isP?'冲线！':'第 '+FIN+' 名','#ffd23f',c.isP?34:22,c.isP);if(c.isP){endAt=time+1.4;sfx('good');vib('mid')}}}
const key=c=>c.rc.fin?1e9-c.rc.fin:c.rc.n*100-Math.hypot(WP[(c.rc.i+1)%N][0]-c.x,WP[(c.rc.i+1)%N][1]-c.z);
const standings=()=>cars.filter(c=>!c.dummy&&c.rc).sort((a,b)=>key(b)-key(a));
const posOf=c=>standings().indexOf(c)+1;
// ---------- 道路功能 + 重生 + 结束 ----------
const inRect=(c,o,L,Wd)=>{const u=(c.x-o.x)*o.dx+(c.z-o.z)*o.dz,v=(c.x-o.x)*-o.dz+(c.z-o.z)*o.dx;return Math.abs(u)<L/2&&Math.abs(v)<Wd/2};
const _s=step;step=function(dt){if(!isR()||!running)return _s(dt);
 for(const c of cars){if(c.dummy||!c.rc)continue;c.boostT=Math.max(0,(c.boostT||0)-dt);c.air=Math.max(0,(c.air||0)-dt);
  if(c.alive){const on=PADS.some(p=>inRect(c,p,9,8));if(on&&!c.onPad){c.vx+=Math.sin(c.h)*T.boostKick;c.vz+=Math.cos(c.h)*T.boostKick;if(c.isP){RS.boost++;sfx('dash');ft(c.x,c.z,3,'加速！','#7df9ff',22,true)}}if(on)c.boostT=T.boostT;c.onPad=on;
   if(c.air<=0)for(const r of RAMPS)if(inRect(c,r,4,r.dz?7:9)){const sp=c.vx*r.dx+c.vz*r.dz;if(sp>T.jumpMin){c.air=c.airT=Math.min(T.jumpMax,Math.max(.35,sp*T.jumpK));if(c.isP){RS.jump++;ft(c.x,c.z,3.4,'飞跃！','#ffd23f',24,true);sfx('dash')}}}
   if(c.isP&&c.x>SX0&&c.x<SX1&&Math.abs(c.z)<6&&c.rc.scLap!==c.rc.lap){c.rc.scLap=c.rc.lap;RS.shortcut++;track('race_shortcut',{lap:c.rc.lap})}
   prog(c)}
  else if(c.deadT>T.respawn&&!c.rc.fin){const p=WP[c.rc.i],q=WP[(c.rc.i+1)%N];Object.assign(c,{alive:true,hp:c.maxhp*T.respawnHp,x:p[0],z:p[1],h:Math.atan2(q[0]-p[0],q[1]-p[1]),vx:0,vz:0,fwd:0,deadT:0,fell:false,place:undefined,invT:T.respawnInv});if(c.isP){deadTime=0;camSnap=true;toast('🔧 已重生，继续冲！')}}
  c._spd0=c.spd;if(c.boostT>0)c.spd*=T.boostMul}
 try{_s(dt)}finally{for(const c of cars)if(c._spd0!==undefined){c.spd=c._spd0;c._spd0=undefined}}
 if(running&&!noEnd){const late=firstFinT&&!player.rc.fin&&time-firstFinT>T.lateT;if((endAt&&time>=endAt)||late||time>T.maxT)finish()}};
// 空中：不吃泥地、不和别人碰撞
let AIRC=false;{const _d=drive;drive=function(c){AIRC=isR()&&c.air>0;try{return _d.apply(this,arguments)}finally{AIRC=false}}}
{const _t=terrainAt;terrainAt=function(x,z){return AIRC?null:_t(x,z)}}
{const _c=collide;collide=function(a,b){if(isR()&&(a.air>0||b.air>0))return;return _c(a,b)}}
{const _rh=window.reviveHold;window.reviveHold=reviveHold=()=>isR()&&running?true:_rh()}
// ---------- AI：跑线、捷径、撞人、吃道具、直道冲刺 ----------
const _ai=aiThink;aiThink=function(c,dt){if(!isR())return _ai(c,dt);const rc=c.rc,ai=c.ai,sk=c.sk;if(!rc)return[0,0,false];
 if(rc.sc===null&&((iA-rc.i+N)%N)<=2&&rc.scDec!==rc.lap){rc.scDec=rc.lap;if(Math.random()<T.aiShortcut*(c.spd>17?1.3:.7))rc.sc=0}
 let tx,tz;if(rc.sc!==null){const p=SW[rc.sc];tx=p[0];tz=p[1];if(Math.hypot(p[0]-c.x,p[1]-c.z)<5)rc.sc++;const ad=(rc.i-iA+N)%N;if(rc.sc>=SW.length||rc.i===iB||(ad>=4&&ad<SKIP))rc.sc=null}// 没拐进捷径（被挤出去）就放弃
 if(rc.sc===null){const w=WP[(rc.i+2)%N],w2=WP[(rc.i+3)%N],dx=w2[0]-w[0],dz=w2[1]-w[1],L=Math.hypot(dx,dz)||1;tx=w[0]-dz/L*rc.lane;tz=w[1]+dx/L*rc.lane}
 ai.lt=(ai.lt||0)-dt;if(ai.lt<=0){ai.lt=1.5+Math.random()*2;rc.lane=clamp(rc.lane+rnd(-2,2),-4.5,4.5);ai.tgt=null;
  const fx=Math.sin(c.h),fz=Math.cos(c.h);if(Math.random()<T.aiRam*(.5+sk))for(const o of cars){if(o===c||!o.alive||o.dummy)continue;const dx=o.x-c.x,dz=o.z-c.z,d=Math.hypot(dx,dz);if(d<9&&d>1&&(dx*fx+dz*fz)/d>.5){ai.tgt=o;ai.tgtT=1.2;break}}
  ai.pk=null;try{for(const p of __v11.PK){const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);if(d<14&&(dx*fx+dz*fz)/d>.6){ai.pk=p;break}}}catch(e){}}
 if(ai.tgt&&ai.tgt.alive&&(ai.tgtT-=dt)>0){tx=ai.tgt.x+ai.tgt.vx*.2;tz=ai.tgt.z+ai.tgt.vz*.2}else if(ai.pk&&__v11.PK.includes(ai.pk)){tx=ai.pk.x;tz=ai.pk.z}
 for(const p of props)if(p.solid){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<p.r+2.6){tx+=(c.x-p.x)*.8;tz+=(c.z-p.z)*.8}}
 if(!Number.isFinite(ai.err))ai.err=0;ai.et=(ai.et||0)-dt;if(ai.et<=0){ai.et=.6;ai.err=rnd(-1,1)*(1-sk)*.18}
 const a=Math.atan2(tx-c.x,tz-c.z)+ai.err,fa=Math.atan2(Math.sin(a-c.h),Math.cos(a-c.h)),straight=Math.abs(c.z)>RC-9&&Math.abs(c.x)<CX-6;
 return[Math.sin(a),Math.cos(a),Math.abs(fa)<.15&&(straight||ai.tgt)&&Math.random()<.02+sk*.05]};
// ---------- 渲染：跳台腾空 ----------
{const _dc=drawCar;drawCar=function(c){if(isR()&&c.air>0&&c.alive){const f=1-c.air/c.airT,lift=Math.sin(Math.PI*f)*T.jumpH;ctx.save();ctx.translate(0,-lift);try{return _dc(c)}finally{ctx.restore()}}return _dc(c)}}
// ---------- HUD ----------
const rh=document.createElement('div');rh.id='raceHud';rh.className='hide';$('app').appendChild(rh);let rhS='';
{const _h=hud;hud=function(){_h();const on=isR()&&running&&player&&player.rc&&introT<=0;if(!on){if(rhS){rh.classList.add('hide');rhS=''}return}$('zoneWarn').classList.add('hide');
 const lap=Math.min(T.laps,player.rc.lap+1),pos=posOf(player),n=cars.filter(c=>!c.dummy).length,s=`<b>🏁 ${lap}/${T.laps} 圈</b><b class="rpos">${pos===1?'🥇':pos===2?'🥈':pos===3?'🥉':''} 第 ${pos}/${n} 名</b><small>${time.toFixed(1)}s</small>`;if(s!==rhS){rhS=s;rh.innerHTML=s;rh.classList.remove('hide')}}}
// ---------- 结算 ----------
const _f=finish;finish=function(){if(!isR())return _f.apply(this,arguments);const st=standings(),rank=st.indexOf(player)+1,P=player,was=P.alive,n=st.length,t=P.rc.fin?P.rc.finT:time;
 P.alive=rank===1;if(rank>1){aliveAtDeath=rank;deadTime=time}let r;try{r=_f.apply(this,arguments)}finally{P.alive=was}
 track('race_end',{rank,n,t:+t.toFixed(1),fin:!!P.rc.fin,kills,car:playerKey,...RS});
 const mmss=v=>Math.floor(v/60)+':'+(v%60).toFixed(1).padStart(4,'0');
 const patch=()=>{if($('result').classList.contains('hide'))return;$('rTitle').textContent=P.rc.fin?`🏁 第 ${rank} / ${n} 名 · 用时 ${mmss(t)}`:`🏁 未完赛 · 第 ${rank} / ${n} 名`;$('rRank').textContent=rank===1?'🏆':'#'+rank;$('rRank').className=rank===1?'':'lose';
  const sd=[...$('rStats').children].find(e=>e.textContent.includes('存活'));if(sd)sd.innerHTML=`<b>${mmss(t)}</b>用时`;
  $('rBoard').innerHTML=st.map((c,i)=>`<div class="brow ${c.isP?'me':''}"><span class="bp">${i===0?'🏆':'#'+(i+1)}</span><span class="bf" style="--f:${c.frame||'#fff'}"></span><b>${esc(c.nick||'')}</b><small>${c.s.name} Lv.${c.lv}</small><span class="bk">${c.rc.fin?mmss(c.rc.finT):Math.min(T.laps,c.rc.lap+1)+'/'+T.laps+' 圈'}</span></div>`).join('');
  const s=document.querySelector('#result details summary');if(s)s.textContent='🏁 比赛名次 ▾';window.fitAll&&fitAll()};const d=rank===1?600:300;setTimeout(patch,d);setTimeout(patch,d+140);return r};// 与核心结算同一时刻改写，避免闪一下旧标题
window.__race={WP,SW,PADS,RAMPS,MUD,iA,iB,N,standings,posOf,get RS(){return RS},get FIN(){return FIN}};
})();
