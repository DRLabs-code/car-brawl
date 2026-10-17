// 模块 mode-team（原 v16）队伍乱斗：2v2/3v3/4v4（随等级）、AI 队友协同、友伤免疫、全灭判负、队伍色光环/血条、两队匹配页、队伍结算+MVP、队伍任务
(()=>{if(!BUILD.modes.includes('team')){window.__v16={off:true};return}
const TC=['#3d9bff','#ff5a5a'],TN=['蓝队','红队'];
if(localStorage.getItem('carbrawl_mode')==='team')MODE='team';
const isT=()=>MODE==='team'&&!tut;
const mates=(c,alive=true)=>cars.filter(q=>q!==c&&!q.dummy&&q.team===c.team&&(!alive||q.alive)),foes=c=>cars.filter(q=>!q.dummy&&q.alive&&q.team!==c.team);
const teamAlive=t=>cars.filter(c=>!c.dummy&&c.alive&&c.team===t).length;
// 模式页签说明
const tHint=()=>{const h=$('modeHint');if(h&&MODE==='team')h.textContent='👥 队伍乱斗：和 AI 队友组队，全灭对面即胜'};document.querySelectorAll('#modeSel [data-mode]').forEach(b=>b.addEventListener('click',tHint));{const _m=menu;menu=function(){_m.apply(this,arguments);__v11.modeUI();tHint()}}
// 每日挑战：队伍任务

{const _a=window.dcAdd;window.dcAdd=dcAdd=(id,n)=>_a(MODE==='team'&&id==='win'?'teamWin':id,n)}
// 匹配页：两队
const _mts=matchThenStart;matchThenStart=function(k,m){if(MODE!=='team')return _mts(k,m);if(m==='ring'||!MAPS[m])m=MAPK[0];
 const cs=save.cars[k],n=roster(cs.lv).n,ts=n/2,opps=[];
 for(let i=1;i<n;i++){const lv=Math.max(1,Math.min(MAXLV,cs.lv+((Math.random()*3|0)-1))),sk=aiSkill(lv);opps.push({k:KEYS[Math.random()*3|0],lv,sk,cs:aiCs(lv,sk),nick:randNick(),frame:TC[i<ts?0:1]})}
 hideAll();show('match',1);const el=$('match'),dur=1000+Math.random()*2000;lastMatch={dur,at:[]};
 const card=(o,me)=>`<div class="mcard ${me?'me':'wait'}" style="--f:${me?'#ffc300':TC[0]}">${me?`<canvas width="96" height="72"></canvas><b>${esc(save.nick)}</b><small>Lv.${cs.lv}</small>`:'<div class="spin"></div><b>…</b>'}</div>`;
 el.innerHTML=`<div class="mt">匹配队友与对手中<span class="dots"></span></div><div class="msub">${MAPS[m].name} · 队伍乱斗 ${ts}v${ts}</div><div class="mteams"><div class="mteam t0"><div class="mth">🔵 ${TN[0]}</div><div class="mcards">${card(null,1)}${opps.slice(0,ts-1).map(()=>card()).join('')}</div></div><div class="mvs">VS</div><div class="mteam t1"><div class="mth">🔴 ${TN[1]}</div><div class="mcards">${opps.slice(ts-1).map(()=>card()).join('')}</div></div></div><div class="mtip">💡 小贴士：${['友军撞击不掉血，放心挤','和队友一起撞同一个目标最快','队友被围攻时去支援！','全队都被撞毁才算输，被撞毁后可观战'][Math.random()*4|0]}</div>`;
 drawFull(el.querySelector('.me canvas').getContext('2d'),k,cs,3,48,52,.32);
 const cards=[...el.querySelectorAll('.mcard.wait')],ts2=opps.map(()=>dur*(.08+Math.random()*.8)).sort((a,b)=>a-b);lastMatch.at=ts2;
 opps.forEach((o,i)=>setTimeout(()=>{const c=cards[i];c.className='mcard in';c.style.setProperty('--f',o.frame);c.innerHTML=`<canvas width="96" height="72"></canvas><b>${esc(o.nick)}</b><small>Lv.${o.lv}</small>`;drawFull(c.querySelector('canvas').getContext('2d'),o.k,o.cs,3,48,52,.32);sfx('ui')},ts2[i]));
 track('team_match',{n:ts});
 matchTimer=setTimeout(()=>{el.querySelector('.mt').innerHTML='匹配成功！';sfx('good');setTimeout(()=>{show('match',0);buildArena(m,arenaR(n));start(k,{opps})},600)},dur)};
{const _om=openMaps;openMaps=function(k){if(MODE==='team'&&mapKey==='ring')mapKey=MAPK[0];return _om(k)}}
{const ag=$('again'),_ag=ag.onclick;ag.onclick=()=>{if(MODE==='team'){if(mapKey==='ring')mapKey=MAPK[0];matchThenStart(playerKey,mapKey)}else _ag()}}
// 开局：分队、两侧出生、队伍色
const _st=start;start=function(k,opt){opt=opt||{};if(MODE==='team'&&mapKey==='ring'&&!opt.tutorial)buildArena(MAPK[0],arenaR(roster(save.cars[k].lv).n));_st(k,opt);if(opt.tutorial||MODE!=='team'){cars.forEach(c=>c.team=c.isP?0:undefined);return}
 const real=cars.filter(c=>!c.dummy),ts=real.length/2;real.forEach((c,i)=>{c.team=i<ts?0:1;c.dmgDone=0;if(!c.isP)c.frame=TC[c.team]});
 const pos=real.map(c=>[c.x,c.z]).sort((a,b)=>Math.atan2(a[1]-ZC[1],a[0]-ZC[0])-Math.atan2(b[1]-ZC[1],b[0]-ZC[0]));const off=Math.random()*pos.length|0;
 real.forEach((c,i)=>{const p=pos[(i+off)%pos.length];c.x=p[0];c.z=p[1];c.h=Math.atan2(ZC[0]-c.x,ZC[1]-c.z)});resetView();
 $('intro').innerHTML=`<b>${ts}v${ts}</b> 队伍乱斗<small>你在 <span style="color:${TC[0]}">${TN[0]}</span> · 撞毁全部 <span style="color:${TC[1]}">${TN[1]}</span>！</small>`;track('team_start',{n:ts,map:mapKey})};
// 友伤免疫 + 伤害统计 + 协同击杀
const _h=hurt;hurt=function(c,d,by){if(isT()&&c&&by&&by!==c&&by.team===c.team)return;const hp0=c&&c.alive?c.hp:0;const r=_h.apply(this,arguments);
 if(isT()&&by&&by!==c&&c&&hp0>0){by.dmgDone=(by.dmgDone||0)+Math.max(0,hp0-Math.max(0,c.hp));c.hitBy=c.hitBy||{};c.hitBy[by.id]=time;
  if(!c.alive){const assist=mates(by,false).some(m=>c.hitBy[m.id]&&time-c.hitBy[m.id]<4);if(assist&&by.team===0){if(by===player)dcAdd('teamAssist');ft(c.x,c.z,4.2,'集火！','#7df9ff',22,true)}
   if(by.team===0&&by!==player&&player){HL.evs.push({t:time,s:45,x:c.x,z:c.z,txt:'队友击杀'});bubble(by,'kill',true)}
   const a=teamAlive(0),b=teamAlive(1);if(a&&b)toast(`${TN[0]} ${a} : ${b} ${TN[1]}`)}}return r};
// 友军碰撞：只轻推，不触发伤害/特效
const _col=collide;collide=function(a,b){if(!isT()||a.team!==b.team)return _col(a,b);const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz),min=a.r+b.r;if(dist>=min||dist===0)return;
 const nx=dx/dist,nz=dz/dist,ov=min-dist,tm=a.mass+b.mass;a.x-=nx*ov*b.mass/tm;a.z-=nz*ov*b.mass/tm;b.x+=nx*ov*a.mass/tm;b.z+=nz*ov*a.mass/tm;const rv=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;if(rv>0)bounce(a,b,nx,nz,rv*.45,.6)};
// AI：只锁敌人；支援被围攻的队友；集火；不撞队友
const _ai=aiThink;aiThink=function(c,dt){if(!isT())return _ai(c,dt);const ai=c.ai;if(ai.t&&ai.t.team===c.team)ai.t=null;
 ai.tt=(ai.tt||0)-dt;if(ai.tt<=0){ai.tt=.8+Math.random()*.6;const fs=foes(c);if(fs.length){const ms=mates(c);let pick=null;
  const hurtM=ms.filter(m=>m.lastBy&&m.lastBy.alive&&m.lastBy.team!==c.team&&time-(m.lastByT||0)<2.5&&Math.hypot(m.x-c.x,m.z-c.z)<36).sort((p,q)=>p.hp/p.maxhp-q.hp/q.maxhp)[0];
  if(hurtM&&Math.random()<.5+c.sk*.4){pick=hurtM.lastBy;ai.mode='support'}else if(Math.random()<.45+c.sk*.4){const cnt=new Map();for(const m of ms)if(m.isP?false:m.ai.t&&m.ai.t.alive&&m.ai.t.team!==c.team)cnt.set(m.ai.t,(cnt.get(m.ai.t)||0)+1);
   if(player&&player.team===c.team&&player.alive){let best=null,bd=1e9;for(const f of fs){const d=Math.hypot(f.x-player.x,f.z-player.z);if(d<bd){bd=d;best=f}}if(best&&bd<20)cnt.set(best,(cnt.get(best)||0)+1.5)}
   let bc=0;for(const[f,n]of cnt)if(n>bc){bc=n;pick=f}if(pick)ai.mode='focus'}
  if(pick){ai.t=pick;ai.re=1.2+Math.random();if(!Number.isFinite(ai.err))ai.err=rnd(-1,1)*(1-c.sk)*.7}}}
 const all=cars;cars=all.filter(q=>q===c||q.team!==c.team);let o;try{o=_ai(c,dt)}finally{cars=all}
 // 避让队友：前方锥内有队友则侧偏，并取消冲刺
 let [ix,iz,ds]=o;if(!Number.isFinite(ix)||!Number.isFinite(iz)){ai.err=0;ix=0;iz=0}const L=Math.hypot(ix,iz);if(L>.01){const ux=ix/L,uz=iz/L;for(const m of mates(c)){const dx=m.x-c.x,dz=m.z-c.z,d=Math.hypot(dx,dz);if(d<8&&d>0){const along=(dx*ux+dz*uz)/d;if(along>.7){const side=(dx*uz-dz*ux)>0?-1:1;ix=ux*.6+uz*side*.8;iz=uz*.6-ux*side*.8;ds=false;c.avoidN=(c.avoidN||0)+1}}}}
 return[ix,iz,ds]};
// 队伍色光环 + 血条
const _dc=drawCar;drawCar=function(c){if(isT()&&c.alive&&c.team!=null){const[sx,sy]=iso(c.x,c.z);ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle=TC[c.team];ctx.lineWidth=c.isP?4:3;ctx.beginPath();ctx.ellipse(sx,sy-2,30,15,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.18;ctx.fillStyle=TC[c.team];ctx.fill();ctx.restore()}return _dc(c)};
const _tg=tagOf;tagOf=function(c,sx,y){_tg(c,sx,y);if(isT()&&c.team!=null&&!c.dummy){const w=50,f=Math.max(0,c.hp/c.maxhp);ctx.fillStyle=TC[c.team];rr(sx-w/2,y,w*f,5,2.5);ctx.fill();if(f<.35&&Math.sin(time*12)>0){ctx.fillStyle='rgba(255,255,255,.55)';rr(sx-w/2,y,w*f,5,2.5);ctx.fill()}
 ctx.font='900 9px system-ui';ctx.textAlign='center';ctx.fillStyle=TC[c.team];ctx.fillText(c.team===0?'友':'敌',sx-w/2-8,y+6)}};
// 队伍比分 HUD
const sb=document.createElement('div');sb.id='teamSb';sb.className='hide';$('app').appendChild(sb);
// 胜负：玩家阵亡后可观战，全灭判负
{const _rh=window.reviveHold;window.reviveHold=reviveHold=()=>{const r=_rh();if(r)return r;return isT()&&running&&teamAlive(0)>0&&teamAlive(1)>0}}
const _r=render;render=function(){if(isT()&&running&&player&&!player.alive){const m=mates(player)[0];if(m){const P=player;player=m;try{_r()}finally{player=P}spec(m);return}}spec(null);return _r()};
const spec=m=>{const e=$('teamSb');if(!e)return;if(!isT()||!running){e.classList.add('hide');return}e.classList.remove('hide');e.innerHTML=`<b style="color:${TC[0]}">${TN[0]} ${teamAlive(0)}</b> : <b style="color:${TC[1]}">${teamAlive(1)} ${TN[1]}</b>${m?`<small>👀 观战：${esc(m.nick)}</small>`:''}`};
const _s=step;step=function(dt){_s(dt);if(isT()&&running&&!noEnd&&(teamAlive(0)===0||teamAlive(1)===0)&&!(teamAlive(0)===0&&reviveHoldPending()))finish()};
const reviveHoldPending=()=>{try{return __v11.RV().pending}catch(e){return false}};
// 结算：队伍胜负 + MVP
const _f=finish;finish=function(){if(!isT())return _f.apply(this,arguments);const A0=teamAlive(0),A1=teamAlive(1),tw=A0>0,P=player,was=P.alive;if(tw&&!was)P.alive=true;let r;try{r=_f.apply(this,arguments)}finally{P.alive=was}
 const real=cars.filter(c=>!c.dummy),AL=new Map(real.map(c=>[c,c===P?was:c.alive])),mvp=real.slice().sort((a,b)=>((b.kc||0)*120+(b.dmgDone||0))-((a.kc||0)*120+(a.dmgDone||0)))[0],me=mvp===P;
 if(me){save.coins+=TUNE.team.mvpCoins;persist()}dcAdd('teamPlay');track('team_end',{win:tw,mvp:me,n:real.length/2,kills,alive:A0});
 setTimeout(()=>{if($('result').classList.contains('hide'))return;$('rTitle').innerHTML=`${tw?'🏆 '+TN[0]+'胜利！':'💔 '+TN[0]+'全灭'}<small class="tsc"> 存活 ${A0} : ${A1}</small>`;$('rRank').textContent=tw?'🏆':'✖';$('rRank').className=tw?'':'lose';
  const mv=document.createElement('div');mv.className='mvp';mv.innerHTML=`⭐ MVP <b style="color:${mvp.team===0?TC[0]:TC[1]}">${esc(mvp.nick||'')}</b> 💥${mvp.kc||0} · ${Math.round(mvp.dmgDone||0)} 伤害${me?' <em>你是 MVP！+${TUNE.team.mvpCoins} 金币</em>':''}`;const st=$('rStats');st.parentElement.querySelectorAll('.mvp').forEach(e=>e.remove());st.after(mv);
  const row=c=>`<div class="brow ${c.isP?'me':''}" style="border-left:4px solid ${TC[c.team]}"><span class="bp">${c===mvp?'⭐':AL.get(c)?'✔':'✖'}</span><b>${esc(c.nick||'')}</b><small>${c.s.name} Lv.${c.lv}</small><span class="bk">💥${c.kc||0}</span></div>`;
  $('rBoard').innerHTML=[0,1].map(t=>`<div class="tcol"><div class="mth" style="color:${TC[t]}">${TN[t]}${t===(tw?0:1)?' 🏆':''}</div>${real.filter(c=>c.team===t).map(row).join('')}</div>`).join('');
  const s=document.querySelector('#result details summary');if(s)s.textContent='👥 两队战绩 ▾';const hb=document.querySelector('#hl .hlb b');if(hb)hb.textContent='💥 队伍集锦';window.fitAll&&fitAll()},(tw?600:300)+140);return r};
window.__v16={TC,teamAlive,mates,foes};
})();
