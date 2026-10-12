'use strict';
// ================= 常量 / 数据 =================
const K=16;                    // 等距投影：1 世界单位 → 屏幕 x 16px（2:1 菱形）
const HK=K/Math.SQRT1_2*Math.cos(Math.PI/6); // 高度 1 单位 → 屏幕像素
const F=288,FS=192/288,AY=0.58,WF=112,WS=192/112,LF=144,LS=192/144; // 车身 288、轮子 112、部件/涂装层 144（均绘制为 192 世界像素）
const PART_ROW={spike:0,plow:1,lightArmor:2,heavyArmor:3,rageEngine:4,offTire:5},LIV_ROW={stripe:6,band:7,number:8,roof:9};
const COLORS={gray:{n:'素灰',c:'#9aa0a8',p:0},red:{n:'烈焰红',c:'#e63946',p:120},blue:{n:'天际蓝',c:'#2e86de',p:120},green:{n:'荧光绿',c:'#7bd94f',p:150},yellow:{n:'柠檬黄',c:'#ffd23f',p:150},black:{n:'午夜黑',c:'#2b2d36',p:180},white:{n:'珍珠白',c:'#eeeeea',p:180},pink:{n:'霓虹粉',c:'#f0207f',p:200},orange:{n:'越野橙',c:'#ff7a1a',p:200},army:{n:'军绿',c:'#5d8f3f',p:200}};
const LIVS={stripe:{n:'双赛道条纹',p:200},band:{n:'侧腰线',p:150},number:{n:'号码圆标',p:220},roof:{n:'撞色车顶',p:150}};
const R0=38,DIRS=16;
const CARS={
 tyrant:{name:'铁壁暴君',en:'IRON TYRANT',tag:'皮卡 · 重型',desc:'车重血厚，正面硬抗',col:'#5d8f3f',col2:'#2f4f22',hp:160,mass:2.0,spd:13,acc:12,turn:2.4,dmg:1.25,wb:3.0},
 fang:{name:'霓虹毒牙',en:'NEON FANG',tag:'超跑 · 刺客',desc:'极快但脆，绕侧偷袭',col:'#f0207f',col2:'#6d0f3c',hp:85,mass:0.8,spd:20,acc:24,turn:3.2,dmg:1.0,wb:2.8},
 beast:{name:'泥岩狂兽',en:'MUD BEAST',tag:'越野 · 均衡',desc:'抓地稳，乱战能手',col:'#ff7a1a',col2:'#7a3a0c',hp:120,mass:1.3,spd:16,acc:18,turn:3.6,dmg:1.1,wb:2.6}};
const KEYS=Object.keys(CARS);
const PARTS={
 spike:{n:'尖刺',slot:'front',r:'w',need:10,mod:{dmg:1.15},desc:'撞击 +15%'},
 plow:{n:'铲子',slot:'front',r:'w',need:10,mod:{push:1.35,dmg:.95},desc:'推力 +35% · 撞击 −5%'},
 lightArmor:{n:'轻甲',slot:'armor',r:'w',need:10,mod:{hp:1.1,mass:1.05},desc:'血量 +10% · 重量 +5%'},
 offTire:{n:'越野胎',slot:'tire',r:'w',need:10,mod:{turn:1.12,spd:.96},desc:'操控 +12% · 速度 −4%'},
 heavyArmor:{n:'重甲',slot:'armor',r:'b',need:20,mod:{hp:1.35,mass:1.3,spd:.9,acc:.85},desc:'血量 +35% · 重量 +30% · 速度 −10%'},
 rageEngine:{n:'狂暴引擎',slot:'engine',r:'b',need:20,mod:{spd:1.15,acc:1.2,turn:.85},desc:'速度 +15% · 加速 +20% · 操控 −15%'}};
const NAME2ID={};for(const id in PARTS)NAME2ID[PARTS[id].n]=id;
const SLOTS={front:'车头',armor:'装甲',engine:'引擎',tire:'轮胎'};
const STATS={hp:'血量',mass:'重量',spd:'速度',acc:'加速',turn:'操控',dmg:'撞击'};
const PT_MAX=6,PT_PCT=.03,UNI={w:1,b:2},MAXLV=20,need=lv=>50+25*(lv-1);
const ZMUL={front:.6,side:1.5,rear:1.2};
// ================= 存档（版本号 + 损坏容错）=================
const SAVE_KEY='carbrawl_save',SAVE_V=2;
const clampInt=(v,a,b,d)=>{v=Math.floor(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):d};
const defCar=()=>({lv:1,xp:0,pts:{hp:0,mass:0,spd:0,acc:0,turn:0,dmg:0},equip:{front:null,armor:null,engine:null,tire:null},paint:{color:'gray',livery:null}});
const defSave=()=>({v:SAVE_V,cars:{tyrant:defCar(),fang:defCar(),beast:defCar()},shards:{},owned:{},uni:0,coins:0,colors:{gray:true},livs:{},tutorialDone:false,
 settings:{vol:.7,music:true,sfx:true,vibrate:true,quality:'auto',diff:'normal'}});
function sanitize(o){const d=defSave();if(!o||typeof o!=='object'||!o.cars)throw new Error('bad');
 if(!o.v||o.v<2){for(const k of KEYS){const c=o.cars[k];if(c){d.cars[k].lv=clampInt(c.lv,1,MAXLV,1);d.cars[k].xp=clampInt(c.xp,0,1e6,0)}}
  for(const [nm,v] of Object.entries(o.shards||{})){const id=NAME2ID[String(nm).replace(/\(.*\)/,'')];if(id)d.shards[id]=clampInt(v,0,9999,0)}return d}
 for(const k of KEYS){const c=o.cars[k]||{},t=d.cars[k];t.lv=clampInt(c.lv,1,MAXLV,1);t.xp=clampInt(c.xp,0,1e6,0);
  for(const s in t.pts)t.pts[s]=clampInt(c.pts&&c.pts[s],0,PT_MAX,0);if(Object.values(t.pts).reduce((a,b)=>a+b,0)>t.lv-1)for(const s in t.pts)t.pts[s]=0;
  for(const sl in t.equip){const id=c.equip&&c.equip[sl];t.equip[sl]=(id&&PARTS[id]&&PARTS[id].slot===sl&&o.owned&&o.owned[id])?id:null}}
 for(const id in PARTS){d.shards[id]=clampInt(o.shards&&o.shards[id],0,9999,0);if(o.owned&&o.owned[id])d.owned[id]=true}
 d.uni=clampInt(o.uni,0,99999,0);d.coins=clampInt(o.coins,0,9999999,0);for(const c in o.colors||{})if(COLORS[c])d.colors[c]=true;for(const l in o.livs||{})if(LIVS[l])d.livs[l]=true;
 for(const k of KEYS){const pp=(o.cars[k]||{}).paint||{};d.cars[k].paint={color:COLORS[pp.color]&&d.colors[pp.color]?pp.color:'gray',livery:LIVS[pp.livery]&&d.livs[pp.livery]?pp.livery:null}}d.tutorialDone=!!o.tutorialDone;const s=o.settings||{};
 if(typeof s.vol==='number'&&isFinite(s.vol))d.settings.vol=Math.max(0,Math.min(1,s.vol));['music','sfx','vibrate'].forEach(k=>{if(typeof s[k]==='boolean')d.settings[k]=s[k]});
 if(['auto','high','low'].includes(s.quality))d.settings.quality=s.quality;if(['easy','normal','hard'].includes(s.diff))d.settings.diff=s.diff;return d}
let saveWarn='';
function loadSave(){let raw=null;try{raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem('carbrawl_save_v1')}catch(e){return defSave()}
 if(!raw)return defSave();try{return sanitize(JSON.parse(raw))}catch(e){try{localStorage.setItem(SAVE_KEY+'_corrupt_'+Date.now(),raw)}catch(_){}saveWarn='存档损坏，已备份并重置为新存档';return defSave()}}
let save=loadSave();
function persist(){try{save.v=SAVE_V;localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}persist();
function carStats(k,cs){const b=CARS[k],o={hp:b.hp,mass:b.mass,spd:b.spd,acc:b.acc,turn:b.turn,dmg:b.dmg,push:1};
 for(const s in STATS)o[s]*=1+cs.pts[s]*PT_PCT;for(const sl in cs.equip){const p=PARTS[cs.equip[sl]];if(p)for(const m in p.mod)o[m]*=p.mod[m]}return o}
const ptsUsed=cs=>Object.values(cs.pts).reduce((a,b)=>a+b,0),ptsFree=cs=>cs.lv-1-ptsUsed(cs);
// 本局参赛车数 / 初始圈：随玩家车等级递增
const roster=lv=>({n:lv>=10?8:lv>=5?6:4});
// AI 难度：设置档位 + 等级逐步提升 → 0..1
function aiSkill(lv){return Math.min(1,{easy:.12,normal:.42,hard:.72}[save.settings.diff]+(lv-1)*.015)}
// ================= 画布 / 画质 =================
const cv=document.getElementById('cv');let ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,Z=1,QL=save.settings.quality==='low'?'low':'high',PM=1;
function resize(){DPR=Math.min(devicePixelRatio||1,QL==='low'?1:2);PM=QL==='low'?.45:1;W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;
 const land=W>H;Z=land?Math.max(.55,Math.min(1,H/520)):Math.max(.62,Math.min(1.1,Math.min(W/430,H/760)));document.body.classList.toggle('land',land)}
addEventListener('resize',resize);resize();
function setQuality(q){save.settings.quality=q;persist();QL=q==='low'?'low':'high';resize()}
function rnd(a,b){return a+Math.random()*(b-a)}
const iso=(x,z)=>[(x-z)*K,(x+z)*K/2];
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const BASE={},PAINT={},WHL={},LAY={},WHITE={},DARK={},SKIN=new Map();
function compose(k,color,liv){const key=k+'|'+color+'|'+(liv||'');if(SKIN.has(key))return SKIN.get(key);const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d');x.drawImage(BASE[k],0,0);
 const t=mkC(W4,W4),tx=t.getContext('2d');tx.drawImage(PAINT[k],0,0);tx.globalCompositeOperation='multiply';tx.fillStyle=COLORS[color].c;tx.fillRect(0,0,W4,W4);tx.globalCompositeOperation='destination-in';tx.drawImage(PAINT[k],0,0);x.drawImage(t,0,0);
 if(liv){const lc=lum(COLORS[color].c)>.55?'#1b1420':'#ffffff',r=LIV_ROW[liv],l=mkC(W4,W4),lx=l.getContext('2d');for(let i=0;i<16;i++)lx.drawImage(LAY[k],i*LF,r*LF,LF,LF,(i%4)*F,(i>>2)*F,F,F);lx.globalCompositeOperation='source-in';lx.fillStyle=lc;lx.fillRect(0,0,W4,W4);x.drawImage(l,0,0)}
 if(SKIN.size>24)SKIN.delete(SKIN.keys().next().value);SKIN.set(key,o);return o}
function lum(h){const n=parseInt(h.slice(1),16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255}
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
function tint(img,col,alpha){const c=mkC(img.width,img.height),x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=alpha;x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
// ================= 音频（WebAudio 程序化）=================
const AU={ctx:null};
function auInit(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}let a;try{a=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}AU.ctx=a;
 AU.master=a.createGain();AU.master.connect(a.destination);AU.sfx=a.createGain();AU.sfx.connect(AU.master);AU.music=a.createGain();AU.music.connect(AU.master);
 AU.noise=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const o=a.createOscillator();o.type='sawtooth';const o2=a.createOscillator();o2.type='square';const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=a.createGain();g.gain.value=0;
 o.connect(f);o2.connect(f);f.connect(g);g.connect(AU.sfx);o.start();o2.start();AU.eng={o,o2,f,g};auApply();bgmStart()}
function auApply(){if(!AU.ctx)return;const s=save.settings,t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(s.vol,t,.05);AU.sfx.gain.setTargetAtTime(s.sfx?1:0,t,.05);AU.music.gain.setTargetAtTime(s.music?.32:0,t,.05)}
function tone(f,d,type,v,slide,t0,dest){const a=AU.ctx,t=t0||a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+d+.02)}
function noise(d,v,freq,t0,dest,hp){const a=AU.ctx,t=t0||a.currentTime,s=a.createBufferSource();s.buffer=AU.noise;const f=a.createBiquadFilter();f.type=hp?'highpass':'lowpass';f.frequency.setValueAtTime(freq,t);if(!hp)f.frequency.exponentialRampToValueAtTime(Math.max(60,freq*.2),t+d);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest||AU.sfx);s.start(t);s.stop(t+d)}
const SFX={hit:p=>{noise(.15,.12+.3*p,1800);tone(110,.15,'sine',.1+.35*p,.5)},crit:()=>{noise(.22,.45,3500);tone(880,.18,'square',.12,1.5);tone(90,.25,'sine',.5,.4)},
 block:()=>{tone(320,.08,'triangle',.15,.7);noise(.06,.12,2500)},boom:()=>{noise(.9,.7,1200);tone(70,.7,'sine',.6,.3);tone(45,.9,'triangle',.4,.5)},
 dash:()=>{noise(.3,.2,900);tone(200,.25,'sawtooth',.08,2.2)},ui:()=>tone(660,.07,'square',.08,1.3),good:()=>{tone(523,.1,'square',.1);tone(784,.18,'square',.1,0,AU.ctx.currentTime+.09)},
 zap:()=>tone(1500+Math.random()*800,.05,'sawtooth',.03,.5),skid:()=>noise(.12,.05,4000,0,0,true)};
function sfx(n,...a){if(!AU.ctx||!save.settings.sfx)return;try{SFX[n](...a)}catch(e){}}
let bgmStep=0,bgmNext=0;const BASS=[45,45,41,43],ARP=[0,7,12,7,3,7,15,7],midi=n=>440*Math.pow(2,(n-69)/12);
function bgmStart(){if(AU.bgmT)return;bgmNext=AU.ctx.currentTime+.1;AU.bgmT=setInterval(()=>{const a=AU.ctx;if(!a||a.state!=='running')return;const sp=60/124/4;
 while(bgmNext<a.currentTime+.25){const st=bgmStep%64,root=BASS[st>>4];
  if(st%4===0)tone(midi(root),.22,'triangle',.5,0,bgmNext,AU.music);if(st%2===0)tone(midi(root+24+ARP[(st>>1)%8]),.11,'square',.06,0,bgmNext,AU.music);
  if(st%8===4)noise(.07,.18,6000,bgmNext,AU.music,true);if(st%16===0)tone(60,.18,'sine',.5,.4,bgmNext,AU.music);bgmNext+=sp;bgmStep++}},60)}
function engineUpd(){if(!AU.eng)return;const t=AU.ctx.currentTime,on=running&&!paused&&player&&player.alive;const sp=on?Math.abs(player.fwd||0):0,r=on&&player.dash>0?1.35:1;
 AU.eng.o.frequency.setTargetAtTime((48+sp*6.5)*r,t,.06);AU.eng.o2.frequency.setTargetAtTime((24+sp*3.2)*r,t,.06);AU.eng.f.frequency.setTargetAtTime(280+sp*45,t,.06);AU.eng.g.gain.setTargetAtTime(on&&save.settings.sfx?.035+sp*.0035:0,t,.08)}
addEventListener('pointerdown',auInit);addEventListener('keydown',auInit);
// 震动：只对玩家参与的撞击，按强度分档
function vib(level){if(!save.settings.vibrate)return;const p={light:12,mid:30,heavy:[60,30,90],boom:[120,40,160]}[level];try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
// ================= 游戏状态 =================
let cars=[],player=null,running=false,paused=false,time=0,zoneR=R0,zone0=R0,pairCD=new Map(),fts=[],parts=[],kills=0,activeT=0,playerKey='beast',aliveAtDeath=0,deadTime=0,shake=0,hitstop=0,ids=0,camX=0,camY=0,tut=null,introT=0,nCars=8;
function aiCs(lv,sk){const cs=defCar();cs.lv=lv;const ids=Object.keys(PARTS).sort(()=>Math.random()-.5);let np=Math.min(4,Math.floor(lv/3)+(sk>.7?1:0));for(const id of ids){if(np<=0)break;if(!cs.equip[PARTS[id].slot]){cs.equip[PARTS[id].slot]=id;np--}}
 const ck=Object.keys(COLORS).filter(c=>c!=='gray');cs.paint={color:lv>=2?ck[Math.random()*ck.length|0]:'gray',livery:lv>=4?Object.keys(LIVS)[Math.random()*4|0]:null};let n=lv-1;const ks=Object.keys(STATS);while(n>0){const s=ks[Math.random()*6|0];if(cs.pts[s]<PT_MAX){cs.pts[s]++;n--}}
 return cs}
function makeCar(k,isP,cs,sk){const st=carStats(k,cs),sm=isP?1:.86+sk*.2;return{id:ids++,k,s:CARS[k],isP,lv:cs.lv,sk:sk||0,skin:compose(k,cs.paint.color,cs.paint.livery),eq:Object.values(cs.equip).filter(Boolean),x:0,z:0,h:0,vx:0,vz:0,fwd:0,steer:0,yaw:0,hp:st.hp,maxhp:st.hp,spd:st.spd*sm,acc:st.acc*sm,turn:st.turn,dmg:st.dmg,mass:st.mass,push:st.push,r:1.8,
 dash:0,dcd:0,alive:true,flash:0,deadT:0,smokeT:0,dustT:0,roll:0,sus:{px:0,py:0,vx:0,vy:0},bump:0,lastA:0,lastL:0,ai:{t:null,re:0,pers:['莽夫','刺客','苟王'][Math.random()*3|0]}}}
function start(k,opt){opt=opt||{};playerKey=k;cars=[];fts=[];parts=[];pairCD.clear();skx.clearRect(0,0,skid.width,skid.height);paused=false;
 const cs=save.cars[k];player=makeCar(k,true,cs);cars.push(player);tut=null;
 if(opt.tutorial){tut={step:0,t:0};const d=makeCar('tyrant',false,defCar(),0);d.dummy=true;d.hp=d.maxhp=9999;cars.push(d);
  player.x=-9;player.z=-9;player.h=Math.PI/4;d.x=3;d.z=3;d.h=-Math.PI/4;zone0=zoneR=R0;nCars=2}
 else{const ro=roster(cs.lv);nCars=ro.n;if(AR!==arenaR(ro.n))buildArena(mapKey,arenaR(ro.n));zone0=zoneR=AR;ro.r=AR;
  for(let i=1;i<ro.n;i++){const lv=Math.max(1,Math.min(MAXLV,cs.lv+((Math.random()*3|0)-1))),sk=aiSkill(lv);cars.push(makeCar(KEYS[Math.random()*3|0],false,aiCs(lv,sk),sk))}
  cars.forEach((c,i)=>{const a=i/ro.n*Math.PI*2+Math.PI/4;c.x=Math.cos(a)*ro.r*.72;c.z=Math.sin(a)*ro.r*.72;c.h=Math.atan2(-c.x,-c.z)})}
 time=0;kills=0;activeT=0;deadTime=0;shake=0;hitstop=0;running=true;introT=opt.tutorial?0:2.2;
 hideAll();show('hud',1);$('hpName').textContent=CARS[k].name;$('lvTag').textContent='Lv.'+cs.lv;drawThumb(document.querySelector('#avatar canvas'),k,3,.42);
 if(!opt.tutorial){$('intro').innerHTML=`<b>${nCars}</b> 辆车参战<small>Lv.${cs.lv} · ${ {easy:'简单',normal:'普通',hard:'困难'}[save.settings.diff]} · 存活到最后！</small>`;show('intro',1);setTimeout(()=>show('intro',0),2000)}
 updTut()}
// ================= 输入（屏幕方向 → 世界方向）=================
const keys={};let jx=0,jy=0,jid=null,dashReq=false;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space'){dashReq=true;e.preventDefault()}if((e.code==='Escape'||e.code==='KeyP')&&running)togglePause()});addEventListener('keyup',e=>keys[e.code]=0);
const joy=document.getElementById('joy'),knob=document.getElementById('knob');
function jmove(e){const r=joy.getBoundingClientRect(),c=r.width/2;let dx=e.clientX-r.left-c,dy=e.clientY-r.top-c;const L=Math.hypot(dx,dy),m=c*.75;if(L>m){dx*=m/L;dy*=m/L}knob.style.transform=`translate(${dx}px,${dy}px)`;jx=dx/m;jy=dy/m}
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
document.getElementById('dash').addEventListener('pointerdown',e=>{e.preventDefault();dashReq=true});
function screenToWorld(sx,sy){const wx=sy+sx/2,wz=sy-sx/2,L=Math.hypot(wx,wz)||1;return[wx/L,wz/L]}
// ================= 特效 =================
function ft(x,z,y,text,color,size,big){for(const f of fts)if(f.t<.35&&Math.abs(f.x-x)+Math.abs(f.z-z)<3&&Math.abs(f.y-y)<.9)y=f.y+1.1;fts.push({x,z,y,text,color,size,t:0,big})}
function spark(x,z,n,col){for(let i=0,N=Math.ceil(n*PM);i<N;i++){const a=rnd(0,7),v=rnd(6,18);parts.push({k:'spark',x,z,y:rnd(.5,1.5),vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(3,9),t:0,life:rnd(.25,.5),col:col||(Math.random()<.5?'#fff3a0':'#ffb703')})}}
function debris(x,z,n,col){for(let i=0,N=Math.ceil(n*PM);i<N;i++){const a=rnd(0,7),v=rnd(4,11);parts.push({k:'deb',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(5,11),t:0,life:rnd(.8,1.4),col:Math.random()<.6?col:'#6c7480',rot:rnd(0,7),vr:rnd(-12,12),s:rnd(3,6)})}}
function smoke(x,z,n,dark){for(let i=0,N=Math.ceil(n*PM);i<N;i++)parts.push({k:'smoke',x:x+rnd(-.6,.6),z:z+rnd(-.6,.6),y:rnd(.5,1.5),vx:rnd(-1,1),vz:rnd(-1,1),vy:rnd(1.5,3),t:0,life:rnd(.7,1.3),s:rnd(8,14),dark})}
function boom(x,z,col){parts.push({k:'flash',x,z,y:1,t:0,life:.35});parts.push({k:'ring',x,z,y:0,t:0,life:.5});spark(x,z,26,'#ffd23f');debris(x,z,14,col);smoke(x,z,10,true);for(let i=0;i<8;i++){const a=rnd(0,7),v=rnd(2,6);parts.push({k:'fire',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(2,6),t:0,life:rnd(.4,.7),s:rnd(10,18)})}}
// ================= 地图（3 主题）=================
const MAPS={
 site:{name:'工地',en:'CONSTRUCTION',desc:'混凝土块 · 油桶 · 泥浆坑减速',tiles:['#cdc7b9','#c2bcae'],line:'#aaa394',speck:['#b3ad9f','#dcd7cc'],out:['#8a7a5c','#9a8a6a','#76684d'],rail:['#ffc300','#1b1420'],paint:'#ffc300cc',logo:'SITE',obst:['block','barrel'],zone:{k:'mud',name:'泥浆',n:5,r:[3,5]},dust:'#b8ab90',deco:'site'},
 junk:{name:'废车场',en:'JUNKYARD',desc:'报废车堆 · 轮胎 · 油污打滑',tiles:['#948f84','#8a857a'],line:'#77726a',speck:['#7d776d','#a8a397'],out:['#5e5648','#6a6252','#504a3e'],rail:['#b5562d','#7b7b7b'],paint:'#efe7d4bb',logo:'JUNK',obst:['scrap','tires'],zone:{k:'oil',name:'油污',n:6,r:[2.2,3.8]},dust:'#a29c90',deco:'junk'},
 desert:{name:'沙漠',en:'DESERT',desc:'岩石 · 仙人掌 · 软沙扬尘',tiles:['#ebcd8e','#e4c381'],line:'#d5b06a',speck:['#d9b56f','#f5dfab'],out:['#dcab62','#e4b870','#c99a52'],rail:['#8b5a2b','#c9a070'],paint:'#ffffffaa',logo:'DUNE',obst:['rock','cactus'],zone:{k:'sand',name:'软沙',n:6,r:[3.5,6]},dust:'#f2dba2',deco:'desert'}};
const MAPK=Object.keys(MAPS);
let AR=38,MAP=MAPS.site,mapKey='site',floor,skid,skx,FSC=1,props=[],gzones=[];
const arenaR=n=>n>=8?66:n>=6?54:38;            // 4 车=第一版大小；6 车≈2 倍面积；8 车≈3 倍面积
function buildArena(mk,R){mapKey=mk;MAP=MAPS[mk];AR=R;FSC=R<=38?1:R<=54?.72:.6;
 // 地面区域（泥浆/油污/软沙）
 gzones=[];const zn=Math.round(MAP.zone.n*R*R/1444);for(let i=0;i<zn*4&&gzones.length<zn;i++){const a=rnd(0,7),r=rnd(R*.18,R*.85),x=Math.cos(a)*r,z=Math.sin(a)*r,rr=rnd(...MAP.zone.r);if(gzones.every(g=>Math.hypot(g.x-x,g.z-z)>g.r+rr+3))gzones.push({x,z,r:rr})}
 buildFloor();buildProps()}
function buildFloor(){const R=AR,ext=R+14,w=Math.ceil(ext*2*Math.SQRT2*K*FSC)+8,h=Math.ceil(ext*Math.SQRT2*K*FSC)+8;floor=mkC(w,h);skid=mkC(w,h);skx=skid.getContext('2d');
 const x=floor.getContext('2d');x.translate(w/2,h/2);x.scale(FSC,FSC);const M=MAP,W2=w/FSC,H2=h/FSC;
 x.fillStyle=M.out[0];x.fillRect(-W2/2,-H2/2,W2,H2);
 for(let i=0;i<W2*H2/900;i++){x.fillStyle=M.out[1+(Math.random()*2|0)];x.fillRect(rnd(-W2/2,W2/2),rnd(-H2/2,H2/2),rnd(2,6),rnd(1,3))}
 const T=2,n=Math.ceil((R+3)/T);
 for(let i=-n;i<n;i++)for(let j=-n;j<n;j++){const cx=(i+.5)*T,cz=(j+.5)*T,d=Math.hypot(cx,cz);if(d>R+2.5)continue;
  const p0=iso(i*T,j*T),a=iso((i+1)*T,j*T),b=iso((i+1)*T,(j+1)*T),c=iso(i*T,(j+1)*T);x.beginPath();x.moveTo(p0[0],p0[1]);x.lineTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.closePath();
  x.fillStyle=M.tiles[(i+j)&1];x.fill();x.strokeStyle=M.line;x.lineWidth=1;x.stroke();
  for(let k=0;k<5;k++){const p=iso((i+Math.random())*T,(j+Math.random())*T);x.fillStyle=M.speck[Math.random()*2|0];x.beginPath();x.ellipse(p[0],p[1],rnd(1,3),rnd(.5,1.5),0,0,7);x.fill()}}
 const ell=(r,st,lw,dash)=>{x.save();x.beginPath();x.ellipse(0,0,r*K*Math.SQRT2,r*K*Math.SQRT2/2,0,0,Math.PI*2);x.strokeStyle=st;x.lineWidth=lw;x.setLineDash(dash||[]);x.stroke();x.restore()};
 ell(R+3.6,M.out[2],3.2*K);ell(R+2.6,'#2b2230',3);ell(R-1.2,M.paint,4,[18,12]);ell(10,M.paint,5);
 // 主题地面细节
 if(M.deco==='site')for(let i=0;i<R/3;i++){const a=rnd(0,7),r=rnd(4,R-4),p=iso(Math.cos(a)*r,Math.sin(a)*r);x.strokeStyle='#8f887a';x.lineWidth=2;x.beginPath();x.moveTo(p[0],p[1]);for(let k=0;k<4;k++)x.lineTo(p[0]+rnd(-30,30),p[1]+rnd(-12,12));x.stroke()}
 if(M.deco==='junk')for(let i=0;i<R/2;i++){const a=rnd(0,7),r=rnd(4,R-4),p=iso(Math.cos(a)*r,Math.sin(a)*r);x.fillStyle=['#6b4a35','#575247','#8a5a3a'][i%3];x.save();x.translate(p[0],p[1]);x.rotate(rnd(0,3));x.fillRect(-rnd(3,8),-2,rnd(6,16),rnd(3,5));x.restore()}
 if(M.deco==='desert')for(let i=0;i<R*1.5;i++){const a=rnd(0,7),r=rnd(3,R-3),p=iso(Math.cos(a)*r,Math.sin(a)*r);x.strokeStyle='#d2ab63';x.lineWidth=1.5;x.beginPath();x.ellipse(p[0],p[1],rnd(14,30),rnd(4,8),0,Math.PI*1.1,Math.PI*1.9);x.stroke()}
 // 地面效果区
 for(const g of gzones){const p=iso(g.x,g.z),rx=g.r*K*Math.SQRT2,ry=rx/2;x.save();
  if(MAP.zone.k==='mud'){x.fillStyle='#5b4128';x.beginPath();x.ellipse(p[0],p[1]+2,rx*1.04,ry*1.06,0,0,7);x.fill();x.fillStyle='#7a5733';x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();for(let k=0;k<8;k++){x.fillStyle='#9a7448';x.beginPath();x.ellipse(p[0]+rnd(-rx*.6,rx*.6),p[1]+rnd(-ry*.6,ry*.6),rnd(6,14),rnd(2,5),0,0,7);x.fill()}x.fillStyle='#ffffff30';x.beginPath();x.ellipse(p[0]-rx*.3,p[1]-ry*.3,rx*.3,ry*.15,0,0,7);x.fill()}
  if(MAP.zone.k==='oil'){const gr=x.createRadialGradient(p[0],p[1],2,p[0],p[1],rx);gr.addColorStop(0,'#141018d0');gr.addColorStop(.75,'#2a2233b0');gr.addColorStop(1,'#1e182600');x.fillStyle=gr;x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();x.globalAlpha=.35;['#ff4fd8','#4fd8ff','#ffe14f'].forEach((c,k)=>{x.strokeStyle=c;x.lineWidth=3;x.beginPath();x.ellipse(p[0]-rx*.15+k*4,p[1]-ry*.1,rx*(.5-k*.08),ry*(.4-k*.06),0,Math.PI,Math.PI*1.8);x.stroke()})}
  if(MAP.zone.k==='sand'){const gr=x.createRadialGradient(p[0],p[1],2,p[0],p[1],rx);gr.addColorStop(0,'#f7e2ae');gr.addColorStop(1,'#f7e2ae00');x.fillStyle=gr;x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();for(let k=0;k<5;k++){x.strokeStyle='#e6c47e';x.lineWidth=2;x.beginPath();x.ellipse(p[0],p[1]+k*5-10,rx*.7,ry*.3,0,Math.PI*1.15,Math.PI*1.85);x.stroke()}}
  x.restore()}
 x.save();x.scale(1.2,.6);x.font='900 64px system-ui';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#ffffff44';x.strokeText(M.logo,0,0);x.fillStyle='#00000030';x.fillText(M.logo,0,0);x.restore();
 floor.ox=w/2;floor.oy=h/2}
function buildProps(){props=[];const R=AR,M=MAP,no=Math.round(6*R*R/1444);
 for(let i=0,tries=0;props.length<no&&tries<400;tries++){const a=rnd(0,7),r=rnd(R*.3,R*.8),x=Math.cos(a)*r,z=Math.sin(a)*r;if(props.some(p=>Math.hypot(p.x-x,p.z-z)<8)||gzones.some(g=>Math.hypot(g.x-x,g.z-z)<g.r+2.5))continue;
  const t=M.obst[props.length%2];props.push({type:t,x,z,r:t==='barrel'||t==='cactus'?1.3:2.1,solid:true,seed:Math.random(),col:['#c0392b','#2e86de','#27ae60','#8e44ad'][Math.random()*4|0]})}
 const N=Math.round(48*R/38);for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,r=R+2.2;props.push({type:'rail',x0:Math.cos(a0)*r,z0:Math.sin(a0)*r,x1:Math.cos(a1)*r,z1:Math.sin(a1)*r,x:Math.cos((a0+a1)/2)*r,z:Math.sin((a0+a1)/2)*r,i})}
 const decoT={site:['barrel','block','cone'],junk:['tires','scrap','tires'],desert:['rock','cactus','bush']}[M.deco];
 for(let i=0;i<R*1.2;i++){const a=rnd(0,7),r=R+rnd(6,14);props.push({type:decoT[i%3],x:Math.cos(a)*r,z:Math.sin(a)*r,r:1.6,solid:false,h:1+(Math.random()*2|0),s:rnd(.8,1.3),seed:Math.random(),col:'#7f8c8d',deco:true})}
 // 场外装饰烘焙进地面
 const old=ctx;ctx=floor.getContext('2d');ctx.setTransform(FSC,0,0,FSC,floor.ox,floor.oy);props.filter(p=>p.deco).sort((a,b)=>a.x+a.z-b.x-b.z).forEach(p=>{drawProp(p);p.baked=true});ctx=old}
function drawTire(x,y,s){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y,22*s,12*s,0,0,7);ctx.fill();ctx.fillStyle='#34303d';ctx.beginPath();ctx.ellipse(x,y-2*s,19*s,10*s,0,0,7);ctx.fill();
 ctx.fillStyle='#4d4858';ctx.beginPath();ctx.ellipse(x,y-4*s,17*s,8.5*s,0,Math.PI,0);ctx.fill();ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y-4*s,8*s,4*s,0,0,7);ctx.fill();
 ctx.strokeStyle='#ffffff30';ctx.lineWidth=2*s;ctx.beginPath();ctx.ellipse(x,y-4*s,14*s,7*s,0,Math.PI*1.1,Math.PI*1.6);ctx.stroke()}
function isoBox(wx,wz,hw,hd,h,top,left,right){const P=(x,z,y)=>{const p=iso(x,z);return[p[0],p[1]-y*HK]};
 const a=P(wx-hw,wz-hd,h),b=P(wx+hw,wz-hd,h),c=P(wx+hw,wz+hd,h),d=P(wx-hw,wz+hd,h),c0=P(wx+hw,wz+hd,0),b0=P(wx+hw,wz-hd,0),d0=P(wx-hw,wz+hd,0);
 ctx.lineJoin='round';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;
 const poly=(pts,f)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f;ctx.fill();ctx.stroke()};
 poly([b,c,c0,b0],right);poly([d,c,c0,d0],left);poly([a,b,c,d],top)}
function drawProp(p){const [sx,sy]=iso(p.x,p.z),s=p.s||1;
 if(p.type==='tires'){const n=p.h||3,k=p.r/2.1*1.35;shadow(sx,sy,30*k,14*k,.35);const offs=p.solid?[[-12,0],[12,0],[0,-7],[0,7]]:[[0,0]];
  for(let L=0;L<n;L++)for(const o of (L===n-1&&p.solid?[[0,0]]:offs))drawTire(sx+o[0]*k,sy+o[1]*k-L*13*k,k*(p.solid?.75:.8))}
 else if(p.type==='block'){shadow(sx+3,sy+3,40*s,18*s,.35);isoBox(p.x,p.z,1.5*s,1.1*s,1.3*s,'#d9d6cf','#a9a59c','#bfbbb2');const t=iso(p.x,p.z);ctx.fillStyle='#ffc300';ctx.fillRect(t[0]-14,t[1]-1.3*s*HK+6,28,4)}
 else if(p.type==='barrel'){shadow(sx+2,sy+2,18*s,9*s,.4);const h=34*s,r=13*s;ctx.fillStyle='#1b1420';ctx.fillRect(sx-r-2,sy-h,2*r+4,h);ctx.beginPath();ctx.ellipse(sx,sy,r+2,r/2+2,0,0,7);ctx.fill();
  const g=ctx.createLinearGradient(sx-r,0,sx+r,0);g.addColorStop(0,'#c25a00');g.addColorStop(.35,'#ff9a3c');g.addColorStop(1,'#a84a00');ctx.fillStyle=g;ctx.fillRect(sx-r,sy-h,2*r,h);ctx.beginPath();ctx.ellipse(sx,sy,r,r/2,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='#fff';ctx.fillRect(sx-r,sy-h*.62,2*r,5*s);ctx.fillRect(sx-r,sy-h*.32,2*r,5*s);ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.ellipse(sx,sy-h,r,r/2,0,0,7);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.stroke()}
 else if(p.type==='scrap'){shadow(sx+3,sy+3,40*s,18*s,.4);isoBox(p.x,p.z,1.4*s,1.0*s,.9*s,p.col,'#3b3b44','#55555f');const q=iso(p.x,p.z);ctx.save();ctx.translate(0,-.9*s*HK);isoBox(p.x+.2,p.z-.1,1.0*s,.8*s,.7*s,'#9aa3ad','#5e6670','#77808a');ctx.restore();ctx.fillStyle='#1c2a44';ctx.fillRect(q[0]-6,q[1]-1.9*s*HK,14,5)}
 else if(p.type==='rock'){shadow(sx+3,sy+3,36*s,16*s,.35);ctx.fillStyle='#1b1420';ctx.beginPath();const pts=[[-30,0],[-24,-22],[-6,-34],[16,-28],[30,-8],[24,6],[-10,8]];pts.forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.lineWidth=5;ctx.strokeStyle='#1b1420';ctx.stroke();
  ctx.fillStyle='#a07850';ctx.fill();ctx.fillStyle='#c79a6a';ctx.beginPath();[[-24,-22],[-6,-34],[16,-28],[6,-12],[-14,-10]].forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.fill();ctx.fillStyle='#7a5a3a';ctx.beginPath();[[30,-8],[24,6],[-10,8],[6,-12],[16,-28]].forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.fill()}
 else if(p.type==='cactus'){shadow(sx+2,sy+2,16*s,7*s,.4);const cap=(x,y,w,h)=>{ctx.fillStyle='#1b1420';ctx.beginPath();ctx.roundRect(x-w/2-2.5,y-h-2.5,w+5,h+5,w/2+2);ctx.fill();const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#3f9a45');g.addColorStop(.4,'#7fd36a');g.addColorStop(1,'#2f7a38');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h,w/2);ctx.fill()};
  cap(sx,sy,14*s,52*s);cap(sx-13*s,sy-18*s,9*s,22*s);cap(sx+13*s,sy-24*s,9*s,20*s);ctx.fillStyle='#ff6fa8';ctx.beginPath();ctx.arc(sx,sy-52*s,4,0,7);ctx.fill()}
 else if(p.type==='bush'){shadow(sx+3,sy+3,30*s,14*s,.35);const os=[[-12,-6,14],[10,-8,13],[0,-16,16],[0,-4,12]];for(const o of os){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,(o[2]+2.5)*s,0,7);ctx.fill()}for(const o of os){const g=ctx.createRadialGradient(sx+o[0]*s-4*s,sy+o[1]*s-6*s,1,sx+o[0]*s,sy+o[1]*s,o[2]*s);g.addColorStop(0,'#c9c27a');g.addColorStop(1,'#7f8a3a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,o[2]*s,0,7);ctx.fill()}}
 else if(p.type==='cone'){shadow(sx+2,sy+2,12,6,.4);ctx.fillStyle='#1b1420';ctx.beginPath();ctx.moveTo(sx-11,sy+2);ctx.lineTo(sx,sy-28);ctx.lineTo(sx+11,sy+2);ctx.closePath();ctx.fill();ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.moveTo(sx-8,sy);ctx.lineTo(sx,sy-25);ctx.lineTo(sx+8,sy);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(sx-5,sy-14,10,4)}
 else if(p.type==='rail'){const a=iso(p.x0,p.z0),b=iso(p.x1,p.z1),h=22;ctx.fillStyle=MAP.rail[p.i%2];ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(a[0],a[1]-h);ctx.lineTo(b[0],b[1]-h);ctx.lineTo(b[0],b[1]-h+12);ctx.lineTo(a[0],a[1]-h+12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#ffffff77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]-h+2);ctx.lineTo(b[0],b[1]-h+2);ctx.stroke();
  ctx.fillStyle='#6c7480';ctx.fillRect(a[0]-3,a[1]-h-4,6,h+4);ctx.strokeStyle='#1b1420';ctx.strokeRect(a[0]-3,a[1]-h-4,6,h+4)}}
function shadow(x,y,rx,ry,a){const g=ctx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,`rgba(20,10,30,${a})`);g.addColorStop(.6,`rgba(20,10,30,${a*.6})`);g.addColorStop(1,'rgba(20,10,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()}
function mapThumb(mk){const c=mkC(200,120),x=c.getContext('2d'),M=MAPS[mk];x.fillStyle=M.out[0];x.fillRect(0,0,200,120);for(let i=0;i<300;i++){x.fillStyle=M.out[1+(i%2)];x.fillRect(Math.random()*200,Math.random()*120,3,2)}
 x.save();x.translate(100,62);x.beginPath();x.ellipse(0,0,88,44,0,0,7);x.fillStyle=M.tiles[0];x.fill();x.lineWidth=5;x.strokeStyle=M.rail[0];x.setLineDash([10,8]);x.stroke();x.setLineDash([]);x.lineWidth=2;x.strokeStyle='#1b1420';x.stroke();
 x.strokeStyle=M.line;x.lineWidth=1;for(let i=-8;i<=8;i++){x.beginPath();x.moveTo(i*14-40,-40);x.lineTo(i*14+40,40);x.stroke();x.beginPath();x.moveTo(i*14+40,-40);x.lineTo(i*14-40,40);x.stroke()}
 x.globalCompositeOperation='destination-in';x.beginPath();x.ellipse(0,0,88,44,0,0,7);x.fill();x.globalCompositeOperation='source-over';
 const zc={mud:'#7a5733',oil:'#1e1826',sand:'#f7e2ae'}[M.zone.k];[[-40,-8,16],[30,10,13],[10,-22,11]].forEach(q=>{x.fillStyle=zc;x.beginPath();x.ellipse(q[0],q[1],q[2],q[2]/2,0,0,7);x.fill()});
 const ic={block:'#d9d6cf',barrel:'#ff8a2a',scrap:'#2e86de',tires:'#34303d',rock:'#a07850',cactus:'#5fb85a'};[[-60,6],[52,-14],[-12,24],[26,26],[-30,-26],[62,14]].forEach((q,i)=>{x.fillStyle='#1b1420';x.fillRect(q[0]-6,q[1]-12,12,12);x.fillStyle=ic[M.obst[i%2]];x.fillRect(q[0]-4.5,q[1]-10.5,9,9)});
 x.restore();return c}
// ================= 撞击规则（concept.md：角度伤害）=================
function zoneOf(c,ox,oz){let a=Math.atan2(ox-c.x,oz-c.z)-c.h;a=Math.atan2(Math.sin(a),Math.cos(a));const d=Math.abs(a);return d<Math.PI/4?'front':d>Math.PI*3/4?'rear':'side'}
function nearP(x,z){return player?Math.max(0,1-Math.hypot(x-player.x,z-player.z)/34):0}
function hurt(c,d,by){if(!c.alive)return;if(c.dummy){c.flash=.12;return}c.hp-=d;c.flash=.12;if(c.hp<=0){c.hp=0;c.alive=false;c.deadT=0;boom(c.x,c.z,c.s.col);ft(c.x,c.z,3,'撞毁！','#ff4d4d',34,true);hitstop=Math.max(hitstop,.12);
 if(nearP(c.x,c.z)>0)sfx('boom');if(c.isP||by===player){shake=Math.max(shake,14);vib('boom')}if(by===player&&c!==player)kills++;if(c===player){aliveAtDeath=cars.filter(q=>q.alive).length+1;deadTime=time}}}
function bounce(a,b,nx,nz,rv,push){const tm=a.mass+b.mass,j=rv*1.25;a.vx-=nx*j*b.mass/tm;a.vz-=nz*j*b.mass/tm;b.vx+=nx*j*a.mass/tm*push;b.vz+=nz*j*a.mass/tm*push}
function collide(a,b){const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz),min=a.r+b.r;if(dist>=min||dist===0)return;
 const nx=dx/dist,nz=dz/dist,ov=min-dist,tm=a.mass+b.mass;a.x-=nx*ov*b.mass/tm;a.z-=nz*ov*b.mass/tm;b.x+=nx*ov*a.mass/tm;b.z+=nz*ov*a.mass/tm;
 const rv=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;if(rv<=0)return;const mine=a.isP||b.isP;
 const key=a.id<b.id?a.id+'_'+b.id:b.id+'_'+a.id;if(pairCD.has(key)&&time-pairCD.get(key)<.45||rv<3){bounce(a,b,nx,nz,rv,1);if(mine&&rv>1.5&&(!pairCD.has(key)||time-pairCD.get(key)>.3))vib('light');return}pairCD.set(key,time);
 const za=zoneOf(a,b.x,b.z),zb=zoneOf(b,a.x,a.z),pa=a.vx*nx+a.vz*nz,pb=-(b.vx*nx+b.vz*nz);
 const atk=pa>=pb?a:b,vic=atk===a?b:a,zAtk=atk===a?za:zb,zVic=atk===a?zb:za;
 const base=rv*1.6,mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,np=nearP(mx,mz);let push=atk.push||1;
 spark(mx,mz,8+rv|0);
 if(zAtk==='front'&&zVic==='front'){hurt(a,base*b.dmg*Math.sqrt(b.mass/a.mass)*.6,b);hurt(b,base*a.dmg*Math.sqrt(a.mass/b.mass)*.6,a);
  ft(mx,mz,3.2,'对撞！','#ffffff',26,true);if(np)sfx('hit',np);if(mine){shake=Math.max(shake,7);hitstop=Math.max(hitstop,.06);vib('mid')}debris(mx,mz,4,'#b8c2cc')}
 else{const atkMul=zAtk==='front'?1:.5,selfMul=zAtk==='front'?.2:.5,dv=base*atk.dmg*Math.sqrt(atk.mass/vic.mass)*atkMul*ZMUL[zVic];hurt(vic,dv,atk);hurt(atk,base*selfMul*.5,vic);const n=Math.round(dv);
  if(zVic==='side'){ft(vic.x,vic.z,3.6,'暴击！ -'+n,'#ffd23f',34,true);spark(mx,mz,18,'#ffffff');debris(vic.x,vic.z,6,vic.s.col);if(np)sfx('crit');if(mine){shake=Math.max(shake,11);hitstop=Math.max(hitstop,.09);vib('heavy')}
   if(tut&&tut.step===2&&atk.isP){tut.step=3;tut.t=0;sfx('good');updTut()}}
  else if(zVic==='rear'){push*=1.5;ft(vic.x,vic.z,3.3,'追尾 -'+n,'#ff9a3c',26);smoke(vic.x,vic.z,3);if(np)sfx('hit',np*.8);if(mine){shake=Math.max(shake,6);vib('mid')}}
  else{ft(vic.x,vic.z,3.1,'格挡 -'+n,'#e0e4f5',19);if(np)sfx('block');if(mine){shake=Math.max(shake,3);vib('light')}}
  if(vic.isP)ft(vic.x,vic.z,1.4,{front:'车头受击',side:'⚠ 侧面受击',rear:'车尾受击'}[zVic],'#ff7b7b',15);
  if(atk.isP&&zAtk!=='front')ft(atk.x,atk.z,1.4,'非车头撞击·自伤','#c9c3ff',13);
  if(tut&&tut.step===2&&atk.isP&&zVic!=='side')ft(vic.x,vic.z,4.4,'要撞它的侧面哦！','#7df9ff',18,true)}
 bounce(a,b,nx,nz,rv,push)}
// ================= AI（难度 = 设置档位 + 等级）=================
function aiThink(c,dt){const ai=c.ai,sk=c.sk;ai.re-=dt;
 if(ai.re<=0||!ai.t||!ai.t.alive){ai.re=1.9-sk*1.4+Math.random()*.6;const o=cars.filter(q=>q!==c&&q.alive);if(!o.length)return[0,0,false];
  o.sort((p,q)=>ai.pers==='刺客'?p.hp-q.hp:Math.hypot(p.x-c.x,p.z-c.z)-Math.hypot(q.x-c.x,q.z-c.z));ai.t=o[Math.random()<.7?0:Math.min(o.length-1,1+(Math.random()*2|0))];ai.err=rnd(-1,1)*(1-sk)*.7}
 const t=ai.t;let tx=t.x,tz=t.z;const sx=Math.cos(t.h),sz=-Math.sin(t.h),side=((c.x-t.x)*sx+(c.z-t.z)*sz)>0?1:-1,D=Math.hypot(t.x-c.x,t.z-c.z);
 if(D>6&&sk>.3){tx+=sx*side*4;tz+=sz*side*4}
 if(sk>.6&&D<14){tx+=t.vx*.35;tz+=t.vz*.35}// 困难：预判
 if(ai.pers==='苟王'&&time<40&&D>10){tx=c.x*.9-t.x*.1;tz=c.z*.9-t.z*.1}
 if(Math.hypot(c.x,c.z)>zoneR-4){tx=0;tz=0}
 for(const p of props)if(p.solid){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<5){tx+=(c.x-p.x)*1.2;tz+=(c.z-p.z)*1.2}}
 let a=Math.atan2(tx-c.x,tz-c.z)+ai.err;const fa=a-c.h,ok=Math.abs(Math.atan2(Math.sin(fa),Math.cos(fa)))<.3;
 return[Math.sin(a),Math.cos(a),ok&&D<9&&Math.random()<.015+sk*.07]}
// ================= 车辆物理（惯性 / 抓地 / 侧滑 / 悬挂）=================
function terrainAt(x,z){for(const g of gzones)if(Math.hypot(g.x-x,g.z-z)<g.r)return MAP.zone.k;return null}
const sgn=v=>v<0?-1:1;
function drive(c,ix,iz,dsh,dt){const mag=Math.min(1,Math.hypot(ix,iz));let d=0;
 if(mag>.15){d=Math.atan2(ix,iz)-c.h;d=Math.atan2(Math.sin(d),Math.cos(d))}
 const st=mag>.15?Math.max(-1,Math.min(1,d*1.8)):0;c.steer+=Math.max(-5*dt,Math.min(5*dt,st-c.steer));
 c.dcd-=dt;if(dsh&&c.dcd<=0){c.dash=.4;c.dcd=3;smoke(c.x-Math.sin(c.h)*1.8,c.z-Math.cos(c.h)*1.8,4);if(c.isP)sfx('dash')}c.dash-=dt;
 const ter=terrainAt(c.x,c.z),fx=Math.sin(c.h),fz=Math.cos(c.h);let fwd=c.vx*fx+c.vz*fz,lx=c.vx-fx*fwd,lz=c.vz-fz*fwd;const lat=Math.hypot(lx,lz),pf=fwd;
 const thr=mag>.15?mag*(1-Math.min(.6,Math.abs(d)/2.6)):0,top=c.spd*(c.dash>0?1.8:1)*(ter==='mud'?.6:ter==='sand'?.82:1);
 if(c.dash>0)fwd+=c.acc*3*dt;else if(thr>0&&fwd<top*thr)fwd+=c.acc*thr*dt*(fwd<0?2:1);else fwd*=Math.exp(-(thr>0?.4:1.3)*dt);
 if(fwd>top)fwd-=(fwd-top)*2.5*dt;if(ter==='mud')fwd*=Math.exp(-1.2*dt);
 const yaw=c.steer*c.turn*Math.max(-1,Math.min(1,fwd/6))*(c.dash>0?.7:1);c.h+=yaw*dt;
 let G=7*c.turn/3;if(ter==='oil')G*=.18;else if(ter==='sand')G*=.6;if(c.dash>0)G*=.55;const drift=lat>5.5||ter==='oil'&&lat>2.5;if(drift)G*=.5;
 const gk=Math.exp(-G*dt);lx*=gk;lz*=gk;const nfx=Math.sin(c.h),nfz=Math.cos(c.h);
 // 侧滑速度部分转回前进方向（转向时车速保留，形成甩尾）
 c.vx=nfx*fwd+lx;c.vz=nfz*fwd+lz;c.fwd=fwd;
 // 悬挂：加速抬头/刹车点头/转弯侧倾/颠簸
 const aL=(fwd-pf)/Math.max(dt,1e-3),aT=yaw*fwd;c.lastA+=(aL-c.lastA)*Math.min(1,dt*10);c.lastL+=(aT-c.lastL)*Math.min(1,dt*10);
 const dsx=(nfx-nfz),dsy=(nfx+nfz)/2,dl=Math.hypot(dsx,dsy)||1,rsx=(nfz+nfx),rsy=(nfz-nfx)/2,rl=Math.hypot(rsx,rsy)||1;
 const kA=-Math.max(-4,Math.min(4,c.lastA*.12)),kT=Math.max(-4,Math.min(4,c.lastL*.06));
 const tx=dsx/dl*kA+rsx/rl*kT,ty=dsy/dl*kA+rsy/rl*kT-Math.max(0,c.lastA)*.05;
 c.sus.vx+=((tx-c.sus.px)*140-c.sus.vx*13)*dt;c.sus.vy+=((ty-c.sus.py)*140-c.sus.vy*13)*dt;c.sus.px+=c.sus.vx*dt;c.sus.py+=c.sus.vy*dt;
 const spd=Math.hypot(c.vx,c.vz);c.bump=spd>1.5?Math.sin(time*(18+spd)+c.id)*(.35+spd*.03)*(ter==='sand'||ter==='mud'?2.2:1):0;
 c.roll+=fwd*dt/(2*Math.PI*.55/14)*3;
 // 尘土 / 泥点 / 胎烟 / 胎痕
 c.dustT-=dt;const rx=c.x-nfx*1.3,rz=c.z-nfz*1.3,cx=Math.cos(c.h),cz=-Math.sin(c.h);
 if(spd>4&&c.dustT<=0){c.dustT=(ter?.03:.07)/(PM||1);for(const s of[-1,1]){const wx=rx+cx*s*1.0,wz=rz+cz*s*1.0;
  if(ter==='mud'){parts.push({k:'mud',x:wx,z:wz,y:.3,vx:-nfx*rnd(2,6)+rnd(-2,2),vz:-nfz*rnd(2,6)+rnd(-2,2),vy:rnd(3,7),t:0,life:.7,s:rnd(2,4)})}
  else parts.push({k:'dust',x:wx,z:wz,y:.2,vx:-nfx*2+rnd(-1,1),vz:-nfz*2+rnd(-1,1),vy:rnd(.3,1),t:0,life:ter==='sand'?1.2:.7,s:ter==='sand'?rnd(9,14):rnd(5,8),col:MAP.dust})}}
 if(drift||c.dash>0||(ter==='oil'&&spd>4)){skx.globalAlpha=Math.min(.38,.08+lat*.03);skx.fillStyle=ter==='mud'?'#4a3420':'#2b2230';for(const s of[-1,1]){const p=iso(rx+cx*s*1.0,rz+cz*s*1.0);skx.beginPath();skx.ellipse((p[0])*FSC+floor.ox,(p[1])*FSC+floor.oy,4*FSC,2*FSC,0,0,7);skx.fill()}skx.globalAlpha=1;
  if(drift&&Math.random()<.5*PM)parts.push({k:'smoke',x:rx+rnd(-.5,.5),z:rz+rnd(-.5,.5),y:.3,vx:rnd(-1,1),vz:rnd(-1,1),vy:rnd(.8,1.6),t:0,life:.9,s:rnd(7,11),dark:false});if(c.isP&&drift&&Math.random()<dt*8)sfx('skid')}}
// ================= 模拟 =================
function step(dt){time+=dt;zoneR=tut?AR:Math.max(10,zone0-Math.max(0,time-25)*(zone0-10)/100);if(introT>0)introT-=dt;
 for(const c of cars){if(!c.alive){c.deadT+=dt;c.vx*=.96;c.vz*=.96;if(Math.random()<dt*6)smoke(c.x,c.z,1,true);continue}
  let ix=0,iz=0,dsh=false;
  if(c.isP){let sx=jx+((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0),sy=jy+((keys.KeyS||keys.ArrowDown)?1:0)-((keys.KeyW||keys.ArrowUp)?1:0);
   const m=Math.min(1,Math.hypot(sx,sy));if(m>.15){const w=screenToWorld(sx,sy);ix=w[0]*m;iz=w[1]*m}dsh=dashReq&&(!tut||tut.step>=1);dashReq=false;if(m>.2||dsh)activeT+=dt;if(introT>0){ix=iz=0;dsh=false}}
  else if(c.dummy){c.vx*=Math.exp(-3*dt);c.vz*=Math.exp(-3*dt);c.x+=(3-c.x)*dt*.5;c.z+=(3-c.z)*dt*.5}
  else if(introT<=0){const o=aiThink(c,dt);ix=o[0];iz=o[1];dsh=o[2]}
  if(!c.dummy)drive(c,ix,iz,dsh,dt);
  if(c.hp/c.maxhp<.35){c.smokeT-=dt;if(c.smokeT<0){c.smokeT=.12;smoke(c.x,c.z,1,true)}}
  if(c.dash>0&&Math.random()<.5)parts.push({k:'fire',x:c.x-Math.sin(c.h)*2.2,z:c.z-Math.cos(c.h)*2.2,y:.8,vx:-Math.sin(c.h)*4,vz:-Math.cos(c.h)*4,vy:1,t:0,life:.25,s:8});
  if(zoneR<AR-.3&&Math.hypot(c.x,c.z)>zoneR+.3){c.hp-=8*dt;c.flash=Math.max(c.flash,.05);if(Math.random()<dt*10)spark(c.x,c.z,2,'#7df9ff');if(c.isP&&Math.random()<dt*6)sfx('zap');if(c.hp<=0)hurt(c,1,null)}}
 for(const c of cars){c.x+=c.vx*dt;c.z+=c.vz*dt;const d=Math.hypot(c.x,c.z),lim=AR+.6;if(d>lim){c.x*=lim/d;c.z*=lim/d;const nx=c.x/d,nz=c.z/d,vn=c.vx*nx+c.vz*nz;if(vn>0){c.vx-=1.6*vn*nx;c.vz-=1.6*vn*nz;if(vn>6){spark(c.x,c.z,5);if(c.isP){vib('light');sfx('block')}}}}
  for(const o of props){if(!o.solid)continue;const dx=c.x-o.x,dz=c.z-o.z,L=Math.hypot(dx,dz),m=c.r+o.r;if(L<m&&L>0){c.x+=dx/L*(m-L);c.z+=dz/L*(m-L);const vn=(c.vx*dx+c.vz*dz)/L;if(vn<0){c.vx-=1.5*vn*dx/L;c.vz-=1.5*vn*dz/L;if(vn<-6){spark(c.x-dx/L*c.r,c.z-dz/L*c.r,4);if(c.isP){vib('light');sfx('block')}}}}}}
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++)if(cars[i].alive&&cars[j].alive)collide(cars[i],cars[j]);
 if(tut)tutStep(dt);
 else if(running&&((!player.alive&&time-deadTime>1.6)||cars.filter(c=>c.alive).length<=1))finish()}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue}
 if(p.vx!==undefined){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;if(p.k==='spark'||p.k==='deb'||p.k==='mud'){p.vy-=25*dt;if(p.y<0){p.y=0;p.vy*=-.3;p.vx*=.5;p.vz*=.5}}if(p.k==='deb')p.rot+=p.vr*dt}}
 for(let i=fts.length-1;i>=0;i--){fts[i].t+=dt;if(fts[i].t>1.1)fts.splice(i,1)}
 if(parts.length>500*PM+100)parts.splice(0,parts.length-(500*PM+100))}
// ================= 结算（经验 / 碎片）=================
function finish(){running=false;const win=player.alive,rank=win?1:aliveAtDeath,surv=win?time:deadTime,afk=activeT<surv*.3;
 let xp=Math.min(100,(afk?0:20)+kills*15+Math.floor(surv/30)*5+(win?30:0));
 const sc=save.cars[playerKey],lv0=sc.lv;sc.xp+=xp;while(sc.lv<MAXLV&&sc.xp>=need(sc.lv)){sc.xp-=need(sc.lv);sc.lv++}if(sc.lv>=MAXLV)sc.xp=0;
 const coins=(afk?0:15)+kills*12+(win?40:rank<=Math.ceil(nCars/2)?15:0)+Math.floor(surv/20)*3;save.coins+=coins;
 const n=1+(rank<=Math.ceil(nCars/2)?1:0)+Math.min(kills,3)+(win?1:0),got={},W=Object.keys(PARTS).filter(id=>PARTS[id].r==='w'),B=Object.keys(PARTS).filter(id=>PARTS[id].r==='b');
 for(let i=0;i<n;i++){const id=Math.random()<.75?W[Math.random()*W.length|0]:B[Math.random()*B.length|0],p=PARTS[id];
  if(save.owned[id]){save.uni+=UNI[p.r];got.uni=(got.uni||0)+UNI[p.r]}else{save.shards[id]=(save.shards[id]||0)+1;got[id]=(got[id]||0)+1}}persist();
 setTimeout(()=>{show('hud',0);
  $('rRank').textContent=win?'👑':'#'+rank;$('rRank').className=win?'':'lose';$('rTitle').textContent=win?'最后的幸存者！':'被撞毁 · 第 '+rank+' / '+nCars+' 名';
  $('rStats').innerHTML=`<div><b>${kills}</b>撞毁</div><div><b>${surv.toFixed(0)}s</b>存活</div><div><b>+${xp}</b>经验${afk?'<br><small>挂机判定</small>':''}</div><div><b>+${coins}</b>金币</div>`;
  $('rLv').textContent=CARS[playerKey].name+' Lv.'+sc.lv+(sc.lv>lv0?' ⬆':'');$('rXpTxt').textContent=sc.lv>=MAXLV?'MAX':sc.xp+'/'+need(sc.lv);$('rXp').style.width='0';
  $('rShards').innerHTML=Object.entries(got).map(([k,v],i)=>k==='uni'?`<span class="shard u" style="animation-delay:${.3+i*.12}s">✨ 通用碎片 +${v}</span>`:`<span class="shard ${PARTS[k].r}" style="animation-delay:${.3+i*.12}s">🧩 ${PARTS[k].n} ×${v}<small> (${save.shards[k]}/${PARTS[k].need})</small></span>`).join('');
  const fp=ptsFree(sc),can=Object.keys(PARTS).some(id=>!save.owned[id]&&canCraft(id));
  $('rHint').innerHTML=(sc.lv>lv0?`<b>升级！</b>`:'')+(fp>0?` 有 <b>${fp}</b> 点属性可分配`:'')+(can?' · 有部件可<b>合成</b>':'');$('rHint').classList.toggle('hide',!(fp>0||can));
  show('result',1);if(sc.lv>lv0)sfx('good');requestAnimationFrame(()=>requestAnimationFrame(()=>$('rXp').style.width=(sc.lv>=MAXLV?100:sc.xp/need(sc.lv)*100)+'%'))},win?600:300)}
// ================= 渲染 =================
function frameOf(h){let i=Math.round(h/(Math.PI*2)*DIRS)%DIRS;if(i<0)i+=DIRS;return i}
function drawCarSprite(c2d,img,i,x,y,s){c2d.drawImage(img,(i%4)*F,(i>>2)*F,F,F,x-F/2*s,y-F*AY*s,F*s,F*s)}
function drawHalf(c2d,img,i,x,y){const h=F/2;c2d.drawImage(img,(i%4)*h,(i>>2)*h,h,h,x-96,y-192*AY,192,192)}
function drawParts(c2d,k,eq,i,x,y,sc){for(const id of eq){const r=PART_ROW[id];c2d.drawImage(LAY[k],i*LF,r*LF,LF,LF,x-LF/2*LS*sc,y-LF*AY*LS*sc,LF*LS*sc,LF*LS*sc)}}
function drawFull(c2d,k,cs,i,x,y,sc,rl){drawWheels(c2d,k,i,1,rl||0,x,y,WS*sc);drawCarSprite(c2d,compose(k,cs.paint.color,cs.paint.livery),i,x,y,FS*sc);drawParts(c2d,k,Object.values(cs.equip).filter(Boolean),i,x,y,sc)}
function drawWheels(c2d,k,i,st,rl,x,y,s){const idx=i*9+st*3+rl,img=WHL[k];c2d.drawImage(img,(idx%12)*WF,(idx/12|0)*WF,WF,WF,x-WF/2*s,y-WF*AY*s,WF*s,WF*s)}
function drawThumb(cnv,k,i,s){const x=cnv.getContext('2d');x.clearRect(0,0,cnv.width,cnv.height);drawFull(x,k,save.cars[k],i,cnv.width/2,cnv.height*.62,s*2)}
function render(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=MAP.out[0];ctx.fillRect(0,0,W,H);
 let tx=0,ty=0;if(player){[tx,ty]=iso(player.x*.85,player.z*.85);ty-=10}camX+=(tx-camX)*.15;camY+=(ty-camY)*.15;
 let shx=0,shy=0;if(shake>0){shx=rnd(-1,1)*shake;shy=rnd(-1,1)*shake}
 ctx.setTransform(DPR*Z,0,0,DPR*Z,DPR*(W/2+shx),DPR*(H/2+shy+H*.04));ctx.translate(-camX,-camY);
 ctx.drawImage(floor,-floor.ox/FSC,-floor.oy/FSC,floor.width/FSC,floor.height/FSC);ctx.drawImage(skid,-floor.ox/FSC,-floor.oy/FSC,skid.width/FSC,skid.height/FSC);
 const rx=zoneR*K*Math.SQRT2,ry=rx/2,fence=zoneR<AR-.3;
 if(fence){ctx.save();ctx.beginPath();ctx.rect(-6000,-6000,12000,12000);ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2,true);ctx.fillStyle='rgba(40,20,90,0.38)';ctx.fill('evenodd');ctx.restore();drawFenceHalf(rx,ry,true)}
 const list=[];for(const p of props){if(p.baked)continue;list.push({d:p.type==='rail'?(p.x+p.z>0?1e9:-1e9):p.x+p.z,p})}for(const c of cars)list.push({d:c.x+c.z,c});list.sort((a,b)=>a.d-b.d);
 for(const c of cars){const [sx,sy]=iso(c.x,c.z);shadow(sx+4,sy+4,46,25,c.alive?.5:.3)}
 for(const it of list){if(it.p)drawProp(it.p);else drawCar(it.c)}
 if(fence)drawFenceHalf(rx,ry,false);
 drawParts();for(const c of cars)if(c.alive&&!c.isP&&!c.dummy)hpBar(c);drawFts();
 if(tut&&tut.step===2){const d=cars[1],[sx,sy]=iso(d.x,d.z),b=Math.sin(time*6)*6;ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#1b1420';ctx.strokeText('撞它侧面 ↓',sx,sy-110+b);ctx.fillStyle='#7df9ff';ctx.fillText('撞它侧面 ↓',sx,sy-110+b)}
 if(player&&player.alive){const[sx,sy]=iso(player.x,player.z);ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.globalAlpha=.8+.2*Math.sin(time*8);ctx.beginPath();ctx.ellipse(sx,sy,42,21,0,0,7);ctx.stroke();ctx.globalAlpha=1;
  ctx.fillStyle='#ffd23f';ctx.strokeStyle='#1b1420';ctx.lineWidth=3;const ty2=sy-100+Math.sin(time*5)*3;ctx.beginPath();ctx.moveTo(sx,ty2+12);ctx.lineTo(sx-9,ty2);ctx.lineTo(sx+9,ty2);ctx.closePath();ctx.stroke();ctx.fill()}
 ctx.setTransform(DPR,0,0,DPR,0,0);if(hitstop>0.07){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(0,0,W,H)}
 if(player&&player.alive&&fence&&Math.hypot(player.x,player.z)>zoneR+.3){ctx.strokeStyle='rgba(125,249,255,.5)';ctx.lineWidth=16;ctx.strokeRect(0,0,W,H)}}
function drawFenceHalf(rx,ry,back){// 背面半圈先画、正面半圈后画（简化深度）
 const a0=back?Math.PI:0,a1=back?Math.PI*2:Math.PI,N=40;const posts=[];for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N;posts.push([Math.cos(a)*rx,Math.sin(a)*ry])}
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let L=0;L<2;L++){ctx.beginPath();posts.forEach((p,i)=>{const j=i%2?rnd(-6,6):0,y=p[1]-14-L*10+rnd(-3,3);i?ctx.lineTo(p[0]+j,y):ctx.moveTo(p[0],y)});ctx.strokeStyle=L?'rgba(180,120,255,.55)':'rgba(125,249,255,.75)';ctx.lineWidth=3;ctx.stroke();ctx.lineWidth=9;ctx.strokeStyle=L?'rgba(180,120,255,.12)':'rgba(125,249,255,.18)';ctx.stroke()}
 ctx.restore();
 for(let i=0;i<posts.length;i+=4){const p=posts[i];ctx.fillStyle='#2d2a3a';ctx.fillRect(p[0]-2.5,p[1]-30,5,30);ctx.fillStyle='#7df9ff';ctx.beginPath();ctx.arc(p[0],p[1]-31,3+Math.random()*1.5,0,7);ctx.fill()}}
function drawCar(c){const [sx,sy]=iso(c.x,c.z),i=frameOf(c.h),st=c.steer>.3?2:c.steer<-.3?0:1,rl=((Math.floor(c.roll)%3)+3)%3;
 if(!c.alive){const y=sy+Math.min(6,c.deadT*20);drawWheels(ctx,c.k,i,1,0,sx,y,WS);drawCarSprite(ctx,c.skin,i,sx,y,FS);drawHalf(ctx,DARK[c.k],i,sx,y);return}
 const bx=sx+c.sus.px,by=sy+c.sus.py+c.bump;drawWheels(ctx,c.k,i,st,rl,sx,sy+c.bump*.3,WS);drawCarSprite(ctx,c.skin,i,bx,by,FS);drawParts(ctx,c.k,c.eq,i,bx,by,1);
 if(c.flash>0){ctx.globalAlpha=Math.min(1,c.flash*8);drawHalf(ctx,WHITE[c.k],i,bx,by);ctx.globalAlpha=1;c.flash-=1/60}}
function hpBar(c){const [sx,sy]=iso(c.x,c.z),y=sy-88,w=46,f=c.hp/c.maxhp;ctx.fillStyle='#1b1420';rr(sx-w/2-2,y-2,w+4,10,5);ctx.fill();ctx.fillStyle='#3a2f45';rr(sx-w/2,y,w,6,3);ctx.fill();ctx.fillStyle=f<.35?'#ff4d4d':f<.6?'#ffb703':'#7bd94f';rr(sx-w/2,y,w*f,6,3);ctx.fill();ctx.fillStyle='#ffffff55';ctx.fillRect(sx-w/2+2,y+1,Math.max(0,w*f-4),1.5);
 ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#1b1420';ctx.strokeText('Lv'+c.lv,sx-w/2-10,y+7);ctx.fillStyle='#ffd23f';ctx.fillText('Lv'+c.lv,sx-w/2-10,y+7)}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function drawParts(){for(const p of parts){const [sx,sy0]=iso(p.x,p.z),sy=sy0-p.y*HK,k=p.t/p.life;
 if(p.k==='spark'){ctx.strokeStyle=p.col;ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.moveTo(sx,sy);const e=iso(p.x-p.vx*.03,p.z-p.vz*.03);ctx.lineTo(e[0],e[1]-(p.y-p.vy*.03)*HK);ctx.stroke()}
 else if(p.k==='deb'){ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.globalAlpha=1-Math.max(0,k-.7)/.3;ctx.fillStyle=p.col;ctx.strokeStyle='#1b1420';ctx.lineWidth=1.5;ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.strokeRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.restore();ctx.globalAlpha=1}
 else if(p.k==='dust'){const r=p.s*(1+k*1.8);ctx.globalAlpha=(1-k)*.5;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.globalAlpha=1}
 else if(p.k==='mud'){ctx.fillStyle='#5b3d22';ctx.strokeStyle='#1b1420';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx,sy,p.s,0,7);ctx.fill();ctx.stroke()}
 else if(p.k==='smoke'){const r=p.s*(1+k*1.6);ctx.globalAlpha=(1-k)*.55;ctx.fillStyle=p.dark?'#4a4452':'#e8e4ee';ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.globalAlpha=(1-k)*.3;ctx.fillStyle=p.dark?'#6b6475':'#fff';ctx.beginPath();ctx.arc(sx-r*.3,sy-r*.3,r*.55,0,7);ctx.fill();ctx.globalAlpha=1}
 else if(p.k==='fire'){ctx.save();ctx.globalCompositeOperation='lighter';const r=p.s*(1-k*.5);const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,'rgba(255,250,200,.9)');g.addColorStop(.4,'rgba(255,160,40,.7)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='flash'){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+k*90;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,`rgba(255,255,220,${1-k})`);g.addColorStop(1,'rgba(255,140,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='ring'){ctx.strokeStyle=`rgba(255,230,160,${1-k})`;ctx.lineWidth=6*(1-k)+1;ctx.beginPath();ctx.ellipse(sx,sy0,20+k*110,10+k*55,0,0,7);ctx.stroke()}}}
function drawFts(){ctx.textAlign='center';ctx.textBaseline='middle';for(const f of fts){const [sx,sy0]=iso(f.x,f.z),k=f.t/1.1,pop=f.big?(k<.12?.6+k/.12*.7:1.3-Math.min(.3,(k-.12)*1.5)):1;const sy=sy0-f.y*HK-k*40;
 ctx.save();ctx.translate(sx,sy);ctx.scale(pop,pop);ctx.globalAlpha=k>.7?1-(k-.7)/.3:1;ctx.font=`900 ${f.size}px system-ui,"PingFang SC",sans-serif`;ctx.lineJoin='round';ctx.lineWidth=f.size*.28;ctx.strokeStyle='#1b1420';ctx.strokeText(f.text,0,0);
 if(f.big){const g=ctx.createLinearGradient(0,-f.size/2,0,f.size/2);g.addColorStop(0,'#fff');g.addColorStop(.45,f.color);g.addColorStop(1,f.color);ctx.fillStyle=g}else ctx.fillStyle=f.color;ctx.fillText(f.text,0,0);ctx.restore()}ctx.globalAlpha=1}
// ================= HUD =================
const $=id=>document.getElementById(id);
function hud(){if(!player||!running)return;const f=Math.max(0,player.hp/player.maxhp);
 $('hpFill').style.width=f*100+'%';$('hpFill').classList.toggle('low',f<.3);$('hpLag').style.width=f*100+'%';$('hpTxt').textContent=Math.ceil(player.hp)+' / '+Math.round(player.maxhp);
 $('aliveN').textContent=cars.filter(c=>c.alive&&!c.dummy).length+'/'+nCars;$('killN').textContent=kills;$('timeN').textContent=time.toFixed(0);$('zoneWarn').classList.toggle('hide',!(!tut&&time>25&&zoneR>10));
 const e=$('dashCd'),cd=Math.max(0,player.dcd/3);e.setAttribute('r',23);e.style.stroke='#1b142077';e.style.strokeWidth=46;e.style.fill='none';e.style.strokeDasharray=`${cd*2*Math.PI*23} 999`}
const PANELS=['menu','result','hud','garage','settings','pause','maps','tutBox','intro'];
const show=(id,v)=>$(id).classList.toggle('hide',!v);
function hideAll(){PANELS.forEach(p=>show(p,0))}
let toastT=0;function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.add('hide'),2200)}
document.addEventListener('click',e=>{if(e.target.closest('button,.card,.mapc,.tab'))sfx('ui')},true);
// ================= 新手引导 =================
const TUT=[['① 移动','拖动左下<b>摇杆</b>（电脑：WASD）开动小车，往哪推就往屏幕哪个方向开','joy'],['② 冲刺','点右下<b>冲刺</b>（电脑：空格），冲刺 0.4 秒，冷却 3 秒','dash'],['③ 暴击','用<b>车头</b>撞假人的<b>侧面</b>，打出 1.5 倍暴击！撞车头只有 0.6 倍',''],['④ 改装','漂亮！送你 <b>10 片尖刺碎片</b>，去车库合成并装上吧',''],];
function updTut(){['joy','dash'].forEach(i=>$(i).classList.remove('glow'));if(!tut){show('tutBox',0);return}const s=TUT[tut.step];show('tutBox',1);
 $('tutBox').innerHTML=`<div class="tt">新手引导 ${s[0]}</div><div>${s[1]}</div>${tut.step===3?'<button class="btn" id="tutGo">去车库 →</button>':''}<button class="skip" id="tutSkip">跳过引导</button>`;
 if(s[2])$(s[2]).classList.add('glow');if(tut.step===3)$('tutGo').onclick=()=>endTut(true);$('tutSkip').onclick=()=>endTut(false)}
function tutStep(dt){tut.t+=dt;if(tut.step===0&&activeT>1.2){tut.step=1;sfx('good');updTut()}else if(tut.step===1&&player.dcd>0&&player.dcd<2.6){tut.step=2;sfx('good');updTut()}}
function endTut(toGarage){if(!save.tutorialDone){save.tutorialDone=true;save.shards.spike=Math.max(save.shards.spike||0,PARTS.spike.need);persist()}tut=null;running=false;cars=[];player=null;['joy','dash'].forEach(i=>$(i).classList.remove('glow'));
 if(toGarage){garageGuide=true;openGarage('beast')}else menu()}
// ================= 车库（改装 / 加点 / 合成）=================
let gKey='beast',garageGuide=false,afterGarage=null;
function canCraft(id){const p=PARTS[id],have=save.shards[id]||0;return have>=p.need||save.uni>=(p.need-have)*UNI[p.r]}
function openGarage(k){gKey=k||gKey;hideAll();show('garage',1);renderGarage()}
function renderGarage(){const cs=save.cars[gKey],st=carStats(gKey,cs),b=CARS[gKey],fp=ptsFree(cs);
 const tabs=KEYS.map(k=>`<button class="tab ${k===gKey?'on':''}" data-car="${k}" style="--c:${CARS[k].col}">${CARS[k].name}<small>Lv.${save.cars[k].lv}</small></button>`).join('');
 const stats=Object.keys(STATS).map(s=>{const v=cs.pts[s],pct=Math.round((st[s]/b[s]-1)*100);return`<div class="srow"><span class="sn">${STATS[s]}</span><span class="pips">${Array.from({length:PT_MAX},(_,i)=>`<i class="${i<v?'on':''}"></i>`).join('')}</span><span class="sv">${pct>=0?'+':''}${pct}%</span><button class="mini" data-pt="${s}" data-d="-1" ${v<=0?'disabled':''}>−</button><button class="mini" data-pt="${s}" data-d="1" ${fp<=0||v>=PT_MAX?'disabled':''}>＋</button></div>`}).join('');
 const slots=Object.keys(SLOTS).map(sl=>{const opts=Object.keys(PARTS).filter(id=>PARTS[id].slot===sl&&save.owned[id]);const cur=cs.equip[sl];
  return`<div class="slot"><span class="sn">${SLOTS[sl]}</span>${opts.length?opts.map(id=>`<button class="pchip ${PARTS[id].r} ${cur===id?'on':''}" data-eq="${sl}" data-id="${id}">${PARTS[id].n}</button>`).join('')+(cur?`<button class="pchip x" data-eq="${sl}" data-id="">卸下</button>`:''):'<span class="empty">素车 · 未拥有部件</span>'}${cur?`<small>${PARTS[cur].desc}</small>`:''}</div>`}).join('');
 const craft=Object.keys(PARTS).map(id=>{const p=PARTS[id],have=save.shards[id]||0,own=save.owned[id],gap=Math.max(0,p.need-have),uniNeed=gap*UNI[p.r];
  const btn=own?'<span class="owned">已拥有</span>':have>=p.need?`<button class="btn sm ${garageGuide&&id==='spike'?'glow':''}" data-craft="${id}">合成</button>`:save.uni>=uniNeed?`<button class="btn sm ghost" data-craft="${id}">通用补齐 −${uniNeed}</button>`:`<span class="lack">差 ${gap}</span>`;
  return`<div class="crow"><span class="rar ${p.r}">${p.r==='w'?'普通':'稀有'}</span><b>${p.n}</b><small>${SLOTS[p.slot]} · ${p.desc}</small><div class="cbar"><div style="width:${Math.min(100,have/p.need*100)}%"></div><span>${Math.min(have,p.need)}/${p.need}</span></div>${btn}</div>`}).join('');
 const guide=garageGuide?`<div class="gguide">引导：${save.owned.spike?(cs.equip.front==='spike'?'③ 完成！点【出战】试试新车头':'② 在【车头】点「尖刺」装上'):'① 在下方部件列表点【合成】尖刺'}</div>`:'';
 $('garage').innerHTML=`<div class="gwrap"><div class="ghead"><button class="btn ghost sm" id="gBack">← 返回</button><b>车库</b><span class="uni">🪙 ${save.coins} · ✨ ${save.uni}</span></div>${guide}<div class="tabs">${tabs}</div>
 <div class="gtop"><canvas id="gPrev" width="300" height="220"></canvas><div class="ginfo"><div class="gname">${b.name}</div><div class="gtag">${b.tag}</div><div class="xpRow"><span>Lv.${cs.lv}</span><div class="xpBar"><div style="width:${cs.lv>=MAXLV?100:cs.xp/need(cs.lv)*100}%"></div></div><span>${cs.lv>=MAXLV?'MAX':cs.xp+'/'+need(cs.lv)}</span></div>
 <div class="gnum">血量 ${Math.round(st.hp)} · 速度 ${st.spd.toFixed(1)} · 重量 ${st.mass.toFixed(2)}<br>加速 ${st.acc.toFixed(1)} · 操控 ${st.turn.toFixed(2)} · 撞击 ${st.dmg.toFixed(2)}</div></div></div>
 <div class="gsec"><div class="gst">属性加点 <span>可用 <b>${fp}</b> 点 · 每点 +3% · 单项上限 ${PT_MAX}</span><button class="mini wide" id="gReset" ${ptsUsed(cs)?'':'disabled'}>免费洗点</button></div>${stats}</div>
 <div class="gsec"><div class="gst">外观 · 颜色 <span>金币购买，买过所有车可用</span></div><div class="swatches">${Object.keys(COLORS).map(c=>`<button class="sw2 ${cs.paint.color===c?'on':''}" data-col="${c}" style="--c:${COLORS[c].c}"><i></i><small>${COLORS[c].n}</small><em>${save.colors[c]?(cs.paint.color===c?'使用中':'已拥有'):'🪙'+COLORS[c].p}</em></button>`).join('')}</div>
 <div class="gst" style="margin-top:6px">涂装</div><div class="swatches"><button class="lv2 ${!cs.paint.livery?'on':''}" data-liv="">无</button>${Object.keys(LIVS).map(l=>`<button class="lv2 ${cs.paint.livery===l?'on':''}" data-liv="${l}">${LIVS[l].n}<em>${save.livs[l]?'':'🪙'+LIVS[l].p}</em></button>`).join('')}</div></div>
 <div class="gsec"><div class="gst">改装槽位 <span>未装部件 = 真实车型素车</span></div>${slots}</div>
 <div class="gsec"><div class="gst">部件碎片 · 合成 <span>重复碎片自动转通用（普通 1 / 稀有 2）</span></div>${craft}</div>
 <div class="gfoot"><button class="btn" id="gGo">出战 ▶</button></div></div>`;
 $('gBack').onclick=()=>{garageGuide=false;menu()};$('gGo').onclick=()=>{garageGuide=false;openMaps(gKey)};
 $('gReset').onclick=()=>{for(const s in cs.pts)cs.pts[s]=0;persist();toast('已免费洗点');renderGarage()}}
$('garage').addEventListener('click',e=>{const t=e.target.closest('button');if(!t||t.disabled)return;const cs=save.cars[gKey];
 if(t.dataset.car){gKey=t.dataset.car;renderGarage()}
 else if(t.dataset.col){const c=t.dataset.col;if(!save.colors[c]){if(save.coins<COLORS[c].p){toast('金币不足');return}save.coins-=COLORS[c].p;save.colors[c]=true;toast('已购买：'+COLORS[c].n)}cs.paint.color=c;persist();sfx('good');renderGarage()}
 else if(t.dataset.liv!==undefined){const l=t.dataset.liv||null;if(l&&!save.livs[l]){if(save.coins<LIVS[l].p){toast('金币不足');return}save.coins-=LIVS[l].p;save.livs[l]=true;toast('已购买：'+LIVS[l].n)}cs.paint.livery=l;persist();sfx('good');renderGarage()}
 else if(t.dataset.pt){const s=t.dataset.pt,d=+t.dataset.d;if(d>0&&ptsFree(cs)>0&&cs.pts[s]<PT_MAX)cs.pts[s]++;if(d<0&&cs.pts[s]>0)cs.pts[s]--;persist();renderGarage()}
 else if(t.dataset.eq!==undefined){cs.equip[t.dataset.eq]=t.dataset.id||null;persist();sfx('good');renderGarage()}
 else if(t.dataset.craft){const id=t.dataset.craft,p=PARTS[id],have=save.shards[id]||0;if(save.owned[id])return;if(have>=p.need)save.shards[id]=have-p.need;else{const u=(p.need-have)*UNI[p.r];if(save.uni<u)return;save.uni-=u;save.shards[id]=0}
  save.owned[id]=true;persist();sfx('good');toast('合成成功：'+p.n);renderGarage()}});
// ================= 地图选择 =================
let mapCar='beast';
function openMaps(k){mapCar=k;hideAll();show('maps',1);const box=$('mapList');box.innerHTML='';const cs=save.cars[k],ro=roster(cs.lv);
 $('mapsSub').textContent=`${CARS[k].name} Lv.${cs.lv} · 本局 ${ro.n} 辆车 · 场地 ${ro.n===4?'标准':ro.n===6?'2 倍':'3 倍'}大小`;
 [...MAPK,'random'].forEach(mk=>{const d=document.createElement('div');d.className='mapc';if(mk==='random'){d.innerHTML='<div class="rnd">？</div><b>随机</b><small>三选一</small>'}else{const M=MAPS[mk];d.appendChild(mapThumb(mk));d.insertAdjacentHTML('beforeend',`<b>${M.name}</b><small>${M.desc}</small>`)}
  d.onclick=()=>{const m=mk==='random'?MAPK[Math.random()*3|0]:mk;buildArena(m,arenaR(ro.n));start(k)};box.appendChild(d)})}
$('mapsBack').onclick=()=>menu();
// ================= 设置 / 暂停 =================
let settingsFrom='menu';
function openSettings(from){settingsFrom=from;show('settings',1);const s=save.settings;
 $('sVol').value=Math.round(s.vol*100);$('sVolV').textContent=Math.round(s.vol*100)+'%';['music','sfx','vibrate'].forEach(k=>$('s_'+k).checked=s[k]);
 document.querySelectorAll('[data-q]').forEach(b=>b.classList.toggle('on',b.dataset.q===s.quality));document.querySelectorAll('[data-diff]').forEach(b=>b.classList.toggle('on',b.dataset.diff===s.diff));
 $('sQNow').textContent='当前：'+(QL==='low'?'低':'高')}
$('sVol').oninput=e=>{save.settings.vol=e.target.value/100;$('sVolV').textContent=e.target.value+'%';auInit();auApply();persist()};
['music','sfx','vibrate'].forEach(k=>$('s_'+k).onchange=e=>{save.settings[k]=e.target.checked;auInit();auApply();persist();if(k==='vibrate'&&e.target.checked)vib('mid')});
document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{setQuality(b.dataset.q);openSettings(settingsFrom)});
document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{save.settings.diff=b.dataset.diff;persist();openSettings(settingsFrom)});
$('sClose').onclick=()=>{show('settings',0)};$('sTut').onclick=()=>{show('settings',0);hideAll();buildArena('site',38);start('beast',{tutorial:true})};
function togglePause(){if(!running)return;paused=!paused;show('pause',paused);if(!paused)show('settings',0)}
$('pauseBtn').onclick=togglePause;$('pResume').onclick=togglePause;$('pSet').onclick=()=>openSettings('pause');$('pQuit').onclick=()=>{paused=false;running=false;tut=null;cars=[];player=null;menu()};
$('menuSet').onclick=()=>openSettings('menu');$('menuGarage').onclick=()=>openGarage(gKey);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)togglePause()});
// ================= 主循环 + 自动降画质 =================
let last=performance.now(),fpsN=0,fpsT=0,lowStreak=0;
function loop(now){requestAnimationFrame(loop);const raw=(now-last)/1000;let dt=Math.min(raw,.05);last=now;
 if(save.settings.quality==='auto'&&running&&!paused){fpsN++;fpsT+=raw;if(fpsT>2){const fps=fpsN/fpsT;fpsN=0;fpsT=0;if(fps<44&&QL==='high'){if(++lowStreak>=1){QL='low';resize();toast('帧率偏低，已自动降低画质')}}else lowStreak=0}}
 if(paused){render();engineUpd();return}
 if(hitstop>0){hitstop-=dt;dt=0}
 if(cars.length&&dt>0){step(dt/2);step(dt/2)}
 updParts(Math.min(raw,.05));shake=Math.max(0,shake-1.2);
 if(floor)render();hud();engineUpd();
 if(!$('garage').classList.contains('hide')){const c=$('gPrev');if(c){const x=c.getContext('2d'),i=Math.floor(now/180)%16;x.clearRect(0,0,300,220);drawFull(x,gKey,save.cars[gKey],i,150,140,1.25,Math.floor(now/60)%3)}}}
// ================= 菜单 =================
function menu(){hideAll();running=false;const box=$('cards');box.innerHTML='';const mx={hp:160,spd:20,mass:2,dmg:1.25,turn:3.6};
 for(const k of KEYS){const s=CARS[k],d=document.createElement('div');d.className='card';d.style.background=`linear-gradient(120deg,${s.col},${s.col2})`;const st=carStats(k,save.cars[k]);
  const bars=[['血量',st.hp/mx.hp],['速度',st.spd/mx.spd],['重量',st.mass/mx.mass],['撞击',st.dmg/mx.dmg],['操控',st.turn/mx.turn]].map(b=>`<div class="sb"><i>${b[0]}</i><u><b style="width:${Math.min(100,b[1]*100)}%"></b></u></div>`).join('');
  const fp=ptsFree(save.cars[k]);d.innerHTML=`<canvas width="236" height="236"></canvas><div class="info"><div class="nm">${s.name}</div><div class="en">${s.en}</div><span class="tag">${s.tag} · ${s.desc}</span>${bars}</div><span class="lv">Lv.${save.cars[k].lv}${fp?` · ${fp}点`:''}</span>`;
  d.onclick=()=>{gKey=k;openMaps(k)};box.appendChild(d);drawThumb(d.querySelector('canvas'),k,3,.8)}
 $('menuCoins').textContent='🪙 '+save.coins;show('menu',1);if(saveWarn){toast(saveWarn);saveWarn=''}}
$('again').onclick=()=>{buildArena(mapKey,arenaR(roster(save.cars[playerKey].lv).n));start(playerKey)};$('back').onclick=()=>{cars=[];player=null;menu()};$('toGarage').onclick=()=>{cars=[];player=null;openGarage(playerKey)};
(async()=>{for(const k of KEYS){[BASE[k],PAINT[k],WHL[k],LAY[k]]=await Promise.all(['base','paint','wheels','layers'].map(n=>loadImg('sprites/car_'+k+'_'+n+'.png')));const hb=mkC(F*2,F*2);hb.getContext('2d').drawImage(BASE[k],0,0,F*2,F*2);WHITE[k]=tint(hb,'#ffffff',.85);DARK[k]=tint(hb,'#1b1420',.6)}
 buildArena('site',38);show('loading',0);if(!save.tutorialDone){hideAll();start('beast',{tutorial:true})}else menu();requestAnimationFrame(loop)})();
window.__game={start,finish,openGarage,openMaps,buildArena,get cars(){return cars},get time(){return time},set time(v){time=v},get save(){return save},get tut(){return tut},get QL(){return QL}};
