'use strict';
// ================= 常量 / 数据 =================
const K=16;                    // 等距投影：1 世界单位 → 屏幕 x 16px（2:1 菱形）
const HK=K/Math.SQRT1_2*Math.cos(Math.PI/6); // 高度 1 单位 → 屏幕像素
const F=384,FS=0.5,AY=0.58;    // 精灵帧 384px，绘制缩放 0.5，锚点（车辆地面中心）
const R0=38,DIRS=16;
const CARS={
 tyrant:{name:'铁壁暴君',en:'IRON TYRANT',tag:'重型 · 坦克',desc:'血厚车重，正面硬抗',col:'#5d8f3f',col2:'#2f4f22',hp:160,mass:2.0,spd:13,acc:12,turn:2.4,dmg:1.25},
 fang:{name:'霓虹毒牙',en:'NEON FANG',tag:'刺客 · 极速',desc:'极快但脆，绕侧偷袭',col:'#f0207f',col2:'#6d0f3c',hp:85,mass:0.8,spd:20,acc:24,turn:3.2,dmg:1.0},
 beast:{name:'泥岩狂兽',en:'MUD BEAST',tag:'越野 · 均衡',desc:'巨轮好控，乱战能手',col:'#ff7a1a',col2:'#7a3a0c',hp:120,mass:1.3,spd:16,acc:18,turn:3.6,dmg:1.1}};
const KEYS=Object.keys(CARS);
const SAVE_KEY='carbrawl_save_v1';
let save=null;try{save=JSON.parse(localStorage.getItem(SAVE_KEY))}catch(e){}
if(!save||!save.cars)save={cars:{},shards:{}};KEYS.forEach(k=>save.cars[k]=save.cars[k]||{lv:1,xp:0});
const persist=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}};
const need=lv=>50+25*(lv-1),MAXLV=20;
const PARTS=[['尖刺','w'],['铲子','w'],['轻甲','w'],['越野胎','w'],['重甲','b'],['狂暴引擎','b']];
const ZMUL={front:.6,side:1.5,rear:1.2};
// ================= 画布 =================
const cv=document.getElementById('cv');let ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,Z=1;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;Z=Math.max(.62,Math.min(1.1,Math.min(W/430,H/760)))}
addEventListener('resize',resize);resize();
const iso=(x,z)=>[(x-z)*K,(x+z)*K/2];
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
// ================= 资源 =================
const SPR={},WHITE={},DARK={};
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
function tint(img,col,alpha){const c=mkC(img.width,img.height),x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=alpha;x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
// 地面：等距瓦片预渲染
const FW=2*(R0+12)*Math.SQRT2*K/Math.SQRT2*1.0|0; // 足够覆盖
let floor,skid,skx;const FOX=(R0+14)*K*1.0*2/2, FOY=(R0+14)*K/2*2/2;
function rnd(a,b){return a+Math.random()*(b-a)}
function buildFloor(){const ext=R0+14;const w=Math.ceil(ext*2*Math.SQRT2*K)+8,h=Math.ceil(ext*Math.SQRT2*K)+8;floor=mkC(w,h);skid=mkC(w,h);skx=skid.getContext('2d');
 const x=floor.getContext('2d');x.translate(w/2,h/2);
 // 底色（场外泥土草地）
 x.fillStyle='#4b6b3a';x.fillRect(-w/2,-h/2,w,h);
 for(let i=0;i<2500;i++){x.fillStyle=Math.random()<.5?'#55783f':'#3f5c31';const px=rnd(-w/2,w/2),py=rnd(-h/2,h/2);x.fillRect(px,py,rnd(2,5),rnd(1,3))}
 // 瓦片：每 2 单位一块
 const T=2,n=Math.ceil((R0+3)/T);
 for(let i=-n;i<n;i++)for(let j=-n;j<n;j++){const cx=(i+.5)*T,cz=(j+.5)*T,d=Math.hypot(cx,cz);if(d>R0+2.5)continue;
  const [sx,sy]=iso(i*T,j*T);const edge=d>R0-.5;
  const base=edge?'#c9b48a':((i+j)&1?'#d9c79d':'#d2bf93');
  x.beginPath();x.moveTo(sx,sy);const a=iso((i+1)*T,j*T),b=iso((i+1)*T,(j+1)*T),c=iso(i*T,(j+1)*T);x.lineTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.closePath();
  x.fillStyle=base;x.fill();x.strokeStyle='#b9a476';x.lineWidth=1;x.stroke();
  for(let k=0;k<6;k++){const u=Math.random(),v=Math.random();const p=iso((i+u)*T,(j+v)*T);x.fillStyle=Math.random()<.5?'#c6b285':'#e6d6ae';x.beginPath();x.ellipse(p[0],p[1],rnd(1,3),rnd(.5,1.5),0,0,7);x.fill()}}
 // 场地画线（世界圆投影为 2:1 椭圆）
 const ell=(r,st,lw,dash)=>{x.save();x.beginPath();x.ellipse(0,0,r*K*Math.SQRT2,r*K*Math.SQRT2/2,0,0,Math.PI*2);x.strokeStyle=st;x.lineWidth=lw;x.setLineDash(dash||[]);x.stroke();x.restore()};
 ell(R0+3.6,'#5b4630',3.2*K*1.0);ell(R0+2.6,'#3a2c20',3);ell(R0-1.2,'#ffffffaa',4,[18,12]);ell(12,'#e6394688',6);ell(12.6,'#ffffff77',2);
 // 中心徽标
 x.save();x.scale(1,.5);x.rotate(Math.PI/4);x.fillStyle='#e6394655';x.beginPath();x.arc(0,0,5.5*K,0,7);x.fill();x.restore();
 x.save();x.scale(1.2,.6);x.font='900 64px system-ui';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#ffffff55';x.strokeText('SMASH',0,0);x.fillStyle='#b23a48aa';x.fillText('SMASH',0,0);x.restore();
 // 油渍
 for(let i=0;i<14;i++){const a=rnd(0,7),r=rnd(4,R0-4),p=iso(Math.cos(a)*r,Math.sin(a)*r);const g=x.createRadialGradient(p[0],p[1],1,p[0],p[1],rnd(14,30));g.addColorStop(0,'#3a2f2a55');g.addColorStop(1,'#3a2f2a00');x.fillStyle=g;x.beginPath();x.ellipse(p[0],p[1],34,17,0,0,7);x.fill()}
 floor.ox=w/2;floor.oy=h/2}
// ================= 场景物件（深度排序）=================
let props=[];
function buildProps(){props=[];
 // 轮胎堆障碍（碰撞半径 2.1）
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+Math.PI/6;props.push({type:'tires',x:Math.cos(a)*R0*.55,z:Math.sin(a)*R0*.55,r:2.1,solid:true})}
 // 护栏：柱子 + 栏板段
 const N=48;for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,r=R0+2.2;props.push({type:'rail',x0:Math.cos(a0)*r,z0:Math.sin(a0)*r,x1:Math.cos(a1)*r,z1:Math.sin(a1)*r,x:Math.cos((a0+a1)/2)*r,z:Math.sin((a0+a1)/2)*r,i})}
 // 场外装饰轮胎
 for(let i=0;i<10;i++){const a=rnd(0,7),r=R0+rnd(5,9);props.push({type:'tires',x:Math.cos(a)*r,z:Math.sin(a)*r,r:1.6,solid:false,h:1+(Math.random()*2|0)})}
 for(let i=0;i<40;i++){const a=rnd(0,7),r=R0+rnd(7,22);props.push({type:Math.random()<.75?'bush':'cone',x:Math.cos(a)*r,z:Math.sin(a)*r,s:rnd(.8,1.4)})}}
function drawTire(x,y,s){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y,22*s,12*s,0,0,7);ctx.fill();
 ctx.fillStyle='#34303d';ctx.beginPath();ctx.ellipse(x,y-2*s,19*s,10*s,0,0,7);ctx.fill();
 ctx.fillStyle='#4d4858';ctx.beginPath();ctx.ellipse(x,y-4*s,17*s,8.5*s,0,Math.PI,0);ctx.fill();
 ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y-4*s,8*s,4*s,0,0,7);ctx.fill();
 ctx.strokeStyle='#ffffff30';ctx.lineWidth=2*s;ctx.beginPath();ctx.ellipse(x,y-4*s,14*s,7*s,0,Math.PI*1.1,Math.PI*1.6);ctx.stroke()}
function drawProp(p){const [sx,sy]=iso(p.x,p.z);
 if(p.type==='tires'){const s=p.r/2.1*1.35,n=p.h||3;
  shadow(sx,sy,30*s,14*s,.35);
  const offs=p.solid?[[-12,0],[12,0],[0,-7],[0,7]]:[[0,0]];
  for(let L=0;L<n;L++)for(const o of (L===n-1&&p.solid?[[0,0]]:offs)){drawTire(sx+o[0]*s,sy+o[1]*s-L*13*s,s*(p.solid?0.75:0.8))}
  if(p.solid){ctx.fillStyle='#e63946';ctx.beginPath();ctx.ellipse(sx,sy-n*13*s-3,6,3,0,0,7);ctx.fill()}}
 if(p.type==='bush'){const s=p.s;shadow(sx+3,sy+3,30*s,14*s,.35);for(const o of[[-12,-6,14],[10,-8,13],[0,-16,16],[0,-4,12]]){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,(o[2]+2.5)*s,0,7);ctx.fill()}for(const o of[[-12,-6,14],[10,-8,13],[0,-16,16],[0,-4,12]]){const g=ctx.createRadialGradient(sx+o[0]*s-4*s,sy+o[1]*s-6*s,1,sx+o[0]*s,sy+o[1]*s,o[2]*s);g.addColorStop(0,'#9be36a');g.addColorStop(1,'#3f8a3a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,o[2]*s,0,7);ctx.fill()}}
 if(p.type==='cone'){shadow(sx+2,sy+2,12,6,.4);ctx.fillStyle='#1b1420';ctx.beginPath();ctx.moveTo(sx-11,sy+2);ctx.lineTo(sx,sy-28);ctx.lineTo(sx+11,sy+2);ctx.closePath();ctx.fill();ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.moveTo(sx-8,sy);ctx.lineTo(sx,sy-25);ctx.lineTo(sx+8,sy);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(sx-5,sy-14,10,4);ctx.fillStyle='#ffffff66';ctx.fillRect(sx-2,sy-22,2,18)}
 if(p.type==='rail'){const a=iso(p.x0,p.z0),b=iso(p.x1,p.z1),h=22;
  ctx.fillStyle=p.i%2?'#e63946':'#f4f1ea';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(a[0],a[1]-h);ctx.lineTo(b[0],b[1]-h);ctx.lineTo(b[0],b[1]-h+12);ctx.lineTo(a[0],a[1]-h+12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#ffffff99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]-h+2);ctx.lineTo(b[0],b[1]-h+2);ctx.stroke();
  ctx.fillStyle='#6c7480';ctx.fillRect(a[0]-3,a[1]-h-4,6,h+4);ctx.strokeRect(a[0]-3,a[1]-h-4,6,h+4);ctx.fillStyle='#b8c2cc';ctx.fillRect(a[0]-3,a[1]-h-4,6,3)}}
function shadow(x,y,rx,ry,a){const g=ctx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,`rgba(20,10,30,${a})`);g.addColorStop(.6,`rgba(20,10,30,${a*.6})`);g.addColorStop(1,'rgba(20,10,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()}
// ================= 游戏状态 =================
let cars=[],player=null,running=false,time=0,zoneR=R0,pairCD=new Map(),fts=[],parts=[],kills=0,activeT=0,playerKey='beast',aliveAtDeath=0,deadTime=0,shake=0,hitstop=0,ids=0,camX=0,camY=0;
function makeCar(k,isP,lv){const s=CARS[k],b=1+(lv-1)*.015;return{id:ids++,k,s,isP,lv,x:0,z:0,h:0,vx:0,vz:0,hp:s.hp*b,maxhp:s.hp*b,spd:s.spd*b,acc:s.acc,turn:s.turn,dmg:s.dmg*b,mass:s.mass,r:1.7,dash:0,dcd:0,alive:true,flash:0,deadT:0,smokeT:0,ai:{t:null,re:0,pers:['莽夫','刺客','苟王'][Math.random()*3|0]}}}
function start(k){playerKey=k;cars=[];fts=[];parts=[];pairCD.clear();skx.clearRect(0,0,skid.width,skid.height);
 const plv=save.cars[k].lv;player=makeCar(k,true,plv);cars.push(player);
 for(let i=0;i<7;i++)cars.push(makeCar(KEYS[Math.random()*3|0],false,Math.max(1,Math.min(MAXLV,plv+((Math.random()*3|0)-1)))));
 cars.forEach((c,i)=>{const a=i/8*Math.PI*2+Math.PI/4;c.x=Math.cos(a)*R0*.78;c.z=Math.sin(a)*R0*.78;c.h=Math.atan2(-c.x,-c.z)});
 time=0;zoneR=R0;kills=0;activeT=0;deadTime=0;shake=0;hitstop=0;running=true;
 show('menu',0);show('result',0);show('hud',1);document.getElementById('hpName').textContent=CARS[k].name;document.getElementById('lvTag').textContent='Lv.'+plv;
 drawThumb(document.querySelector('#avatar canvas'),k,3,.42)}
// ================= 输入（屏幕方向 → 世界方向）=================
const keys={};let jx=0,jy=0,jid=null,dashReq=false;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space'){dashReq=true;e.preventDefault()}});addEventListener('keyup',e=>keys[e.code]=0);
const joy=document.getElementById('joy'),knob=document.getElementById('knob');
function jmove(e){const r=joy.getBoundingClientRect();let dx=e.clientX-r.left-70,dy=e.clientY-r.top-70;const L=Math.hypot(dx,dy),m=52;if(L>m){dx*=m/L;dy*=m/L}knob.style.transform=`translate(${dx}px,${dy}px)`;jx=dx/m;jy=dy/m}
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
document.getElementById('dash').addEventListener('pointerdown',e=>{e.preventDefault();dashReq=true});
function screenToWorld(sx,sy){// 屏幕 dx=(wx-wz)，dy=(wx+wz)/2 的反解
 const wx=sy+sx/2,wz=sy-sx/2,L=Math.hypot(wx,wz)||1;return[wx/L,wz/L]}
// ================= 特效 =================
function ft(x,z,y,text,color,size,big){fts.push({x,z,y,text,color,size,t:0,big})}
function spark(x,z,n,col){for(let i=0;i<n;i++){const a=rnd(0,7),v=rnd(6,18);parts.push({k:'spark',x,z,y:rnd(.5,1.5),vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(3,9),t:0,life:rnd(.25,.5),col:col||(Math.random()<.5?'#fff3a0':'#ffb703')})}}
function debris(x,z,n,col){for(let i=0;i<n;i++){const a=rnd(0,7),v=rnd(4,11);parts.push({k:'deb',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(5,11),t:0,life:rnd(.8,1.4),col:Math.random()<.6?col:'#6c7480',rot:rnd(0,7),vr:rnd(-12,12),s:rnd(3,6)})}}
function smoke(x,z,n,dark){for(let i=0;i<n;i++)parts.push({k:'smoke',x:x+rnd(-.6,.6),z:z+rnd(-.6,.6),y:rnd(.5,1.5),vx:rnd(-1,1),vz:rnd(-1,1),vy:rnd(1.5,3),t:0,life:rnd(.7,1.3),s:rnd(8,14),dark})}
function boom(x,z,col){parts.push({k:'flash',x,z,y:1,t:0,life:.35});parts.push({k:'ring',x,z,y:0,t:0,life:.5});spark(x,z,26,'#ffd23f');debris(x,z,14,col);smoke(x,z,10,true);for(let i=0;i<8;i++){const a=rnd(0,7),v=rnd(2,6);parts.push({k:'fire',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(2,6),t:0,life:rnd(.4,.7),s:rnd(10,18)})}}
const vib=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};
// ================= 撞击规则（concept.md：角度伤害）=================
function zoneOf(c,ox,oz){let a=Math.atan2(ox-c.x,oz-c.z)-c.h;a=Math.atan2(Math.sin(a),Math.cos(a));const d=Math.abs(a);return d<Math.PI/4?'front':d>Math.PI*3/4?'rear':'side'}
function hurt(c,d,by){if(!c.alive)return;c.hp-=d;c.flash=.12;if(c.hp<=0){c.hp=0;c.alive=false;c.deadT=0;boom(c.x,c.z,c.s.col);ft(c.x,c.z,3,'撞毁！','#ff4d4d',34,true);hitstop=Math.max(hitstop,.12);if(c.isP||by===player)shake=Math.max(shake,14);
 if(by===player&&c!==player){kills++;vib(80)}if(c===player){aliveAtDeath=cars.filter(q=>q.alive).length+1;deadTime=time}}}
function bounce(a,b,nx,nz,rv,push){const tm=a.mass+b.mass,j=rv*1.25;a.vx-=nx*j*b.mass/tm;a.vz-=nz*j*b.mass/tm;b.vx+=nx*j*a.mass/tm*push;b.vz+=nz*j*a.mass/tm*push}
function collide(a,b){const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz),min=a.r+b.r;if(dist>=min||dist===0)return;
 const nx=dx/dist,nz=dz/dist,ov=min-dist,tm=a.mass+b.mass;a.x-=nx*ov*b.mass/tm;a.z-=nz*ov*b.mass/tm;b.x+=nx*ov*a.mass/tm;b.z+=nz*ov*a.mass/tm;
 const rv=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;if(rv<=0)return;
 const key=a.id<b.id?a.id+'_'+b.id:b.id+'_'+a.id;if(pairCD.has(key)&&time-pairCD.get(key)<.45||rv<3){bounce(a,b,nx,nz,rv,1);return}pairCD.set(key,time);
 const za=zoneOf(a,b.x,b.z),zb=zoneOf(b,a.x,a.z),pa=a.vx*nx+a.vz*nz,pb=-(b.vx*nx+b.vz*nz);
 const atk=pa>=pb?a:b,vic=atk===a?b:a,zAtk=atk===a?za:zb,zVic=atk===a?zb:za;
 const base=rv*1.6,mx=(a.x+b.x)/2,mz=(a.z+b.z)/2;let push=1;const mine=a.isP||b.isP;
 spark(mx,mz,8+rv|0);
 if(zAtk==='front'&&zVic==='front'){hurt(a,base*b.dmg*Math.sqrt(b.mass/a.mass)*.6,b);hurt(b,base*a.dmg*Math.sqrt(a.mass/b.mass)*.6,a);
  ft(mx,mz,3.2,'对撞！','#ffffff',26,true);if(mine){shake=Math.max(shake,7);hitstop=Math.max(hitstop,.06)}debris(mx,mz,4,'#b8c2cc')}
 else{const atkMul=zAtk==='front'?1:.5,selfMul=zAtk==='front'?.2:.5,dv=base*atk.dmg*Math.sqrt(atk.mass/vic.mass)*atkMul*ZMUL[zVic];hurt(vic,dv,atk);hurt(atk,base*selfMul*.5,vic);const n=Math.round(dv);
  if(zVic==='side'){ft(vic.x,vic.z,3.6,'暴击！ -'+n,'#ffd23f',34,true);spark(mx,mz,18,'#ffffff');debris(vic.x,vic.z,6,vic.s.col);if(mine){shake=Math.max(shake,11);hitstop=Math.max(hitstop,.09)}if(atk.isP)vib(50)}
  else if(zVic==='rear'){push=1.5;ft(vic.x,vic.z,3.3,'追尾 -'+n,'#ff9a3c',26);smoke(vic.x,vic.z,3);if(mine)shake=Math.max(shake,6)}
  else{ft(vic.x,vic.z,3.1,'格挡 -'+n,'#e0e4f5',19);if(mine)shake=Math.max(shake,3)}
  if(vic.isP)ft(vic.x,vic.z,1.4,{front:'车头受击',side:'⚠ 侧面受击',rear:'车尾受击'}[zVic],'#ff7b7b',15);
  if(atk.isP&&zAtk!=='front')ft(atk.x,atk.z,1.4,'非车头撞击·自伤','#c9c3ff',13)}
 bounce(a,b,nx,nz,rv,push)}
// ================= AI =================
function aiThink(c,dt){const ai=c.ai;ai.re-=dt;
 if(ai.re<=0||!ai.t||!ai.t.alive){ai.re=1+Math.random();const o=cars.filter(q=>q!==c&&q.alive);if(!o.length)return[0,0,false];
  o.sort((p,q)=>ai.pers==='刺客'?p.hp-q.hp:Math.hypot(p.x-c.x,p.z-c.z)-Math.hypot(q.x-c.x,q.z-c.z));ai.t=o[Math.random()<.7?0:Math.min(o.length-1,1+(Math.random()*2|0))]}
 const t=ai.t;let tx=t.x,tz=t.z;const sx=Math.cos(t.h),sz=-Math.sin(t.h),side=((c.x-t.x)*sx+(c.z-t.z)*sz)>0?1:-1,D=Math.hypot(t.x-c.x,t.z-c.z);
 if(D>6){tx+=sx*side*4;tz+=sz*side*4}// 绕到侧面
 if(ai.pers==='苟王'&&time<40&&D>10){tx=c.x*.9-t.x*.1;tz=c.z*.9-t.z*.1}
 if(Math.hypot(c.x,c.z)>zoneR-4){tx=0;tz=0}
 let vx=tx-c.x,vz=tz-c.z;const L=Math.hypot(vx,vz)||1;vx/=L;vz/=L;const fa=Math.atan2(vx,vz)-c.h,ok=Math.abs(Math.atan2(Math.sin(fa),Math.cos(fa)))<.3;
 return[vx,vz,ok&&D<9&&Math.random()<.04+c.lv*.002]}
// ================= 模拟 =================
function step(dt){time+=dt;zoneR=Math.max(10,R0-Math.max(0,time-25)*.3);
 for(const c of cars){if(!c.alive){c.deadT+=dt;c.vx*=.96;c.vz*=.96;if(Math.random()<dt*6)smoke(c.x,c.z,1,true);continue}
  let ix=0,iz=0,dsh=false;
  if(c.isP){let sx=jx+((keys.KeyD||keys.ArrowRight)?1:0)-((keys.KeyA||keys.ArrowLeft)?1:0),sy=jy+((keys.KeyS||keys.ArrowDown)?1:0)-((keys.KeyW||keys.ArrowUp)?1:0);
   const m=Math.min(1,Math.hypot(sx,sy));if(m>.15){const w=screenToWorld(sx,sy);ix=w[0]*m;iz=w[1]*m}dsh=dashReq;dashReq=false;if(m>.2||dsh)activeT+=dt}
  else{const o=aiThink(c,dt);ix=o[0];iz=o[1];dsh=o[2]}
  const mag=Math.min(1,Math.hypot(ix,iz));
  if(mag>.15){let d=Math.atan2(ix,iz)-c.h;d=Math.atan2(Math.sin(d),Math.cos(d));c.h+=Math.sign(d)*Math.min(Math.abs(d),c.turn*dt)}
  c.dcd-=dt;if(dsh&&c.dcd<=0){c.dash=.4;c.dcd=3;smoke(c.x-Math.sin(c.h)*1.8,c.z-Math.cos(c.h)*1.8,4)}c.dash-=dt;
  const fx=Math.sin(c.h),fz=Math.cos(c.h),top=c.spd*(c.dash>0?1.8:1)*Math.max(mag,c.dash>0?1:0),fwd=c.vx*fx+c.vz*fz;
  let lx=c.vx-fx*fwd,lz=c.vz-fz*fwd;const lat=Math.hypot(lx,lz),g=Math.exp(-6*dt);lx*=g;lz*=g;
  let nf=fwd+(c.dash>0?c.acc*3:c.acc)*dt*(fwd<top?1:-.5);if(mag<.15&&c.dash<=0)nf*=Math.exp(-1.5*dt);c.vx=fx*nf+lx;c.vz=fz*nf+lz;
  // 摩擦痕
  if(lat>3.5||c.dash>0){skx.globalAlpha=Math.min(.35,.06+lat*.03);skx.fillStyle='#2b2230';for(const s of[-1,1]){const wx=c.x-fx*1.2+Math.cos(c.h)*s*1.1,wz=c.z-fz*1.2-Math.sin(c.h)*s*1.1,p=iso(wx,wz);skx.beginPath();skx.ellipse(p[0]+floor.ox,p[1]+floor.oy,4,2,0,0,7);skx.fill()}skx.globalAlpha=1}
  if(c.hp/c.maxhp<.35){c.smokeT-=dt;if(c.smokeT<0){c.smokeT=.12;smoke(c.x,c.z,1,true)}}
  if(c.dash>0&&Math.random()<.5)parts.push({k:'fire',x:c.x-fx*2,z:c.z-fz*2,y:.8,vx:-fx*4,vz:-fz*4,vy:1,t:0,life:.25,s:8});
  if(zoneR<R0-.3&&Math.hypot(c.x,c.z)>zoneR+.3){c.hp-=8*dt;c.flash=Math.max(c.flash,.05);if(Math.random()<dt*10)spark(c.x,c.z,2,'#7df9ff');if(c.hp<=0)hurt(c,1,null)}}
 for(const c of cars){c.x+=c.vx*dt;c.z+=c.vz*dt;const d=Math.hypot(c.x,c.z),lim=R0+.8;if(d>lim){c.x*=lim/d;c.z*=lim/d;const nx=c.x/d,nz=c.z/d,vn=c.vx*nx+c.vz*nz;if(vn>0){c.vx-=1.6*vn*nx;c.vz-=1.6*vn*nz;if(vn>6)spark(c.x,c.z,5)}}
  for(const o of props){if(!o.solid)continue;const dx=c.x-o.x,dz=c.z-o.z,L=Math.hypot(dx,dz),m=c.r+o.r;if(L<m){c.x+=dx/L*(m-L);c.z+=dz/L*(m-L);const vn=(c.vx*dx+c.vz*dz)/L;if(vn<0){c.vx-=1.5*vn*dx/L;c.vz-=1.5*vn*dz/L;if(vn<-6)spark(c.x-dx/L*c.r,c.z-dz/L*c.r,4)}}}}
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++)if(cars[i].alive&&cars[j].alive)collide(cars[i],cars[j]);
 if(running&&((!player.alive&&time-deadTime>1.6)||cars.filter(c=>c.alive).length<=1))finish()}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue}
 if(p.vx!==undefined){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;if(p.k==='spark'||p.k==='deb'){p.vy-=25*dt;if(p.y<0){p.y=0;p.vy*=-.4;p.vx*=.6;p.vz*=.6}}if(p.k==='deb')p.rot+=p.vr*dt}}
 for(let i=fts.length-1;i>=0;i--){fts[i].t+=dt;if(fts[i].t>1.1)fts.splice(i,1)}}
// ================= 结算 =================
function finish(){running=false;const win=player.alive,rank=win?1:aliveAtDeath,surv=win?time:deadTime,afk=activeT<surv*.3;
 let xp=Math.min(100,(afk?0:20)+kills*15+Math.floor(surv/30)*5+(win?30:0));
 const sc=save.cars[playerKey],lv0=sc.lv;sc.xp+=xp;while(sc.lv<MAXLV&&sc.xp>=need(sc.lv)){sc.xp-=need(sc.lv);sc.lv++}
 const n=1+(rank<=3?1:0)+Math.min(kills,3)+(win?1:0),got={};for(let i=0;i<n;i++){const p=PARTS[Math.random()<.8?Math.random()*4|0:4+(Math.random()*2|0)];got[p[0]]=got[p[0]]||{n:0,r:p[1]};got[p[0]].n++;save.shards[p[0]]=(save.shards[p[0]]||0)+1}persist();
 setTimeout(()=>{const $=id=>document.getElementById(id);show('hud',0);
  $('rRank').textContent=win?'👑':'#'+rank;$('rRank').className=win?'':'lose';$('rTitle').textContent=win?'最后的幸存者！':'被撞毁 · 第 '+rank+' 名';
  $('rStats').innerHTML=`<div><b>${kills}</b>撞毁</div><div><b>${surv.toFixed(0)}s</b>存活</div><div><b>+${xp}</b>经验${afk?'<br><small>挂机判定</small>':''}</div>`;
  $('rLv').textContent=CARS[playerKey].name+' Lv.'+sc.lv+(sc.lv>lv0?' ⬆':'');$('rXpTxt').textContent=sc.lv>=MAXLV?'MAX':sc.xp+'/'+need(sc.lv);$('rXp').style.width='0';
  $('rShards').innerHTML=Object.entries(got).map(([k,v],i)=>`<span class="shard ${v.r}" style="animation-delay:${.3+i*.12}s">🧩 ${k}碎片 ×${v.n}<small> (累计${save.shards[k]})</small></span>`).join('');
  show('result',1);requestAnimationFrame(()=>requestAnimationFrame(()=>$('rXp').style.width=(sc.lv>=MAXLV?100:sc.xp/need(sc.lv)*100)+'%'))},win?600:300)}
// ================= 渲染 =================
function frameOf(h){let i=Math.round(h/(Math.PI*2)*DIRS)%DIRS;if(i<0)i+=DIRS;return i}
function drawCarSprite(c2d,k,i,x,y,s,src){const img=(src||SPR)[k];c2d.drawImage(img,(i%4)*F,(i>>2)*F,F,F,x-F/2*s,y-F*AY*s,F*s,F*s)}
function drawThumb(cnv,k,i,s){const x=cnv.getContext('2d');x.clearRect(0,0,cnv.width,cnv.height);drawCarSprite(x,k,i,cnv.width/2,cnv.height*.62,s)}
let grassPat=null;function mkGrass(){const c=mkC(64,32),x=c.getContext('2d');x.fillStyle='#4b6b3a';x.fillRect(0,0,64,32);for(let i=0;i<60;i++){x.fillStyle=Math.random()<.5?'#55783f':'#3f5c31';x.fillRect(Math.random()*64,Math.random()*32,rnd(2,4),rnd(1,2))}grassPat=ctx.createPattern(c,'repeat')}
function render(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#4b6b3a';ctx.fillRect(0,0,W,H);
 let tx=0,ty=0;if(player){[tx,ty]=iso(player.x*.82,player.z*.82);ty-=10}camX+=(tx-camX)*.15;camY+=(ty-camY)*.15;
 let shx=0,shy=0;if(shake>0){shx=rnd(-1,1)*shake;shy=rnd(-1,1)*shake}
 ctx.setTransform(DPR*Z,0,0,DPR*Z,DPR*(W/2+shx),DPR*(H/2+shy+H*.04));ctx.translate(-camX,-camY);
 if(!grassPat)mkGrass();ctx.fillStyle=grassPat;ctx.fillRect(camX-2000,camY-2000,4000,4000);ctx.drawImage(floor,-floor.ox,-floor.oy);ctx.drawImage(skid,-floor.ox,-floor.oy);
 // 电网缩圈：场外压暗 + 电弧
 const rx=zoneR*K*Math.SQRT2,ry=rx/2;
 if(zoneR<R0-.3){ctx.save();ctx.beginPath();ctx.rect(-4000,-4000,8000,8000);ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2,true);ctx.fillStyle='rgba(40,20,90,0.38)';ctx.fill('evenodd');ctx.restore();}
 if(zoneR<R0-.3)drawFenceHalf(rx,ry,true);
 // 深度排序：车、物件、粒子阴影
 const list=[];for(const p of props){if(p.baked)continue;list.push({d:p.type==='rail'?(p.x+p.z>0?1e9:-1e9):p.x+p.z,p})}for(const c of cars)list.push({d:c.x+c.z,c});list.sort((a,b)=>a.d-b.d);
 for(const c of cars){const [sx,sy]=iso(c.x,c.z);shadow(sx+4,sy+4,44,24,c.alive?.5:.3)}
 for(const it of list){if(it.p)drawProp(it.p);else drawCar(it.c)}
 if(zoneR<R0-.3)drawFenceHalf(rx,ry,false);
 drawParts();
 for(const c of cars)if(c.alive&&!c.isP)hpBar(c);
 drawFts();
 if(player&&player.alive){const[sx,sy]=iso(player.x,player.z);ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.globalAlpha=.8+.2*Math.sin(time*8);ctx.beginPath();ctx.ellipse(sx,sy,40,20,0,0,7);ctx.stroke();ctx.globalAlpha=1;
  ctx.fillStyle='#ffd23f';ctx.strokeStyle='#1b1420';ctx.lineWidth=3;const ty2=sy-95+Math.sin(time*5)*3;ctx.beginPath();ctx.moveTo(sx,ty2+12);ctx.lineTo(sx-9,ty2);ctx.lineTo(sx+9,ty2);ctx.closePath();ctx.stroke();ctx.fill()}
 // 屏幕外敌人指示
 ctx.setTransform(DPR,0,0,DPR,0,0);
 if(hitstop>0.07){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(0,0,W,H)}
 if(player&&player.alive&&zoneR<R0-.3&&Math.hypot(player.x,player.z)>zoneR+.3){ctx.strokeStyle='rgba(125,249,255,.5)';ctx.lineWidth=16;ctx.strokeRect(0,0,W,H)}}
function drawFenceHalf(rx,ry,back){// 背面半圈先画、正面半圈后画（简化深度）
 const a0=back?Math.PI:0,a1=back?Math.PI*2:Math.PI,N=40;const posts=[];for(let i=0;i<=N;i++){const a=a0+(a1-a0)*i/N;posts.push([Math.cos(a)*rx,Math.sin(a)*ry])}
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let L=0;L<2;L++){ctx.beginPath();posts.forEach((p,i)=>{const j=i%2?rnd(-6,6):0,y=p[1]-14-L*10+rnd(-3,3);i?ctx.lineTo(p[0]+j,y):ctx.moveTo(p[0],y)});ctx.strokeStyle=L?'rgba(180,120,255,.55)':'rgba(125,249,255,.75)';ctx.lineWidth=3;ctx.stroke();ctx.lineWidth=9;ctx.strokeStyle=L?'rgba(180,120,255,.12)':'rgba(125,249,255,.18)';ctx.stroke()}
 ctx.restore();
 for(let i=0;i<posts.length;i+=4){const p=posts[i];ctx.fillStyle='#2d2a3a';ctx.fillRect(p[0]-2.5,p[1]-30,5,30);ctx.fillStyle='#7df9ff';ctx.beginPath();ctx.arc(p[0],p[1]-31,3+Math.random()*1.5,0,7);ctx.fill()}}
function drawCar(c){const [sx,sy]=iso(c.x,c.z),i=frameOf(c.h);
 if(!c.alive){drawCarSprite(ctx,c.k,i,sx,sy+Math.min(6,c.deadT*20),FS,DARK);return}
 const bob=c.dash>0?Math.sin(time*60)*1.5:0;drawCarSprite(ctx,c.k,i,sx,sy+bob,FS);
 if(c.flash>0){ctx.globalAlpha=Math.min(1,c.flash*8);drawCarSprite(ctx,c.k,i,sx,sy+bob,FS,WHITE);ctx.globalAlpha=1;c.flash-=1/60}}
function hpBar(c){const [sx,sy]=iso(c.x,c.z),y=sy-88,w=46,f=c.hp/c.maxhp;ctx.fillStyle='#1b1420';rr(sx-w/2-2,y-2,w+4,10,5);ctx.fill();ctx.fillStyle='#3a2f45';rr(sx-w/2,y,w,6,3);ctx.fill();ctx.fillStyle=f<.35?'#ff4d4d':f<.6?'#ffb703':'#7bd94f';rr(sx-w/2,y,w*f,6,3);ctx.fill();ctx.fillStyle='#ffffff55';ctx.fillRect(sx-w/2+2,y+1,Math.max(0,w*f-4),1.5);
 ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#1b1420';ctx.strokeText('Lv'+c.lv,sx-w/2-10,y+7);ctx.fillStyle='#ffd23f';ctx.fillText('Lv'+c.lv,sx-w/2-10,y+7)}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function drawParts(){for(const p of parts){const [sx,sy0]=iso(p.x,p.z),sy=sy0-p.y*HK,k=p.t/p.life;
 if(p.k==='spark'){ctx.strokeStyle=p.col;ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.moveTo(sx,sy);const e=iso(p.x-p.vx*.03,p.z-p.vz*.03);ctx.lineTo(e[0],e[1]-(p.y-p.vy*.03)*HK);ctx.stroke()}
 else if(p.k==='deb'){ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.globalAlpha=1-Math.max(0,k-.7)/.3;ctx.fillStyle=p.col;ctx.strokeStyle='#1b1420';ctx.lineWidth=1.5;ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.strokeRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.restore();ctx.globalAlpha=1}
 else if(p.k==='smoke'){const r=p.s*(1+k*1.6);ctx.globalAlpha=(1-k)*.55;ctx.fillStyle=p.dark?'#4a4452':'#e8e4ee';ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.globalAlpha=(1-k)*.3;ctx.fillStyle=p.dark?'#6b6475':'#fff';ctx.beginPath();ctx.arc(sx-r*.3,sy-r*.3,r*.55,0,7);ctx.fill();ctx.globalAlpha=1}
 else if(p.k==='fire'){ctx.save();ctx.globalCompositeOperation='lighter';const r=p.s*(1-k*.5);const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,'rgba(255,250,200,.9)');g.addColorStop(.4,'rgba(255,160,40,.7)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='flash'){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+k*90;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,`rgba(255,255,220,${1-k})`);g.addColorStop(1,'rgba(255,140,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='ring'){ctx.strokeStyle=`rgba(255,230,160,${1-k})`;ctx.lineWidth=6*(1-k)+1;ctx.beginPath();ctx.ellipse(sx,sy0,20+k*110,10+k*55,0,0,7);ctx.stroke()}}}
function drawFts(){ctx.textAlign='center';ctx.textBaseline='middle';for(const f of fts){const [sx,sy0]=iso(f.x,f.z),k=f.t/1.1,pop=f.big?(k<.12?.6+k/.12*.7:1.3-Math.min(.3,(k-.12)*1.5)):1;const sy=sy0-f.y*HK-k*40;
 ctx.save();ctx.translate(sx,sy);ctx.scale(pop,pop);ctx.globalAlpha=k>.7?1-(k-.7)/.3:1;ctx.font=`900 ${f.size}px system-ui,"PingFang SC",sans-serif`;ctx.lineJoin='round';ctx.lineWidth=f.size*.28;ctx.strokeStyle='#1b1420';ctx.strokeText(f.text,0,0);
 if(f.big){const g=ctx.createLinearGradient(0,-f.size/2,0,f.size/2);g.addColorStop(0,'#fff');g.addColorStop(.45,f.color);g.addColorStop(1,f.color);ctx.fillStyle=g}else ctx.fillStyle=f.color;ctx.fillText(f.text,0,0);ctx.restore()}ctx.globalAlpha=1}
// ================= HUD =================
let lagHp=1;function hud(){if(!player)return;const f=Math.max(0,player.hp/player.maxhp),$=id=>document.getElementById(id);
 $('hpFill').style.width=f*100+'%';$('hpFill').classList.toggle('low',f<.3);$('hpLag').style.width=f*100+'%';$('hpTxt').textContent=Math.ceil(player.hp)+' / '+Math.round(player.maxhp);
 $('aliveN').textContent=cars.filter(c=>c.alive).length;$('killN').textContent=kills;$('timeN').textContent=time.toFixed(0);$('zoneWarn').classList.toggle('hide',!(time>25&&zoneR>10));
 const cd=Math.max(0,player.dcd/3),C=2*Math.PI*46,e=$('dashCd');e.setAttribute('r',23);e.style.stroke='#1b142077';e.style.strokeWidth=46;e.style.fill='none';e.style.strokeDasharray=`${cd*2*Math.PI*23} 999`}
// ================= 主循环 =================
let last=performance.now();
function loop(now){requestAnimationFrame(loop);let dt=Math.min((now-last)/1000,.05);last=now;
 if(hitstop>0){hitstop-=dt;dt=0}
 if(running||cars.length){if(dt>0){step(dt/2);if(running||true)step(dt/2)}}
 updParts(Math.min((now-(loop.p||now))/1000,.05)||0.016);loop.p=now;shake=Math.max(0,shake-60*.016*1.2);
 if(floor)render();hud()}
// ================= 菜单 =================
const show=(id,v)=>document.getElementById(id).classList.toggle('hide',!v);
function menu(){const box=document.getElementById('cards');box.innerHTML='';const mx={hp:160,spd:20,mass:2,dmg:1.25,turn:3.6};
 for(const k of KEYS){const s=CARS[k],d=document.createElement('div');d.className='card';d.style.background=`linear-gradient(120deg,${s.col},${s.col2})`;
  const bars=[['血量',s.hp/mx.hp],['速度',s.spd/mx.spd],['重量',s.mass/mx.mass],['撞击',s.dmg/mx.dmg],['操控',s.turn/mx.turn]].map(b=>`<div class="sb"><i>${b[0]}</i><u><b style="width:${b[1]*100}%"></b></u></div>`).join('');
  d.innerHTML=`<canvas width="236" height="236"></canvas><div class="info"><div class="nm">${s.name}</div><div class="en">${s.en}</div><span class="tag">${s.tag} · ${s.desc}</span>${bars}</div><span class="lv">Lv.${save.cars[k].lv}</span>`;
  d.onclick=()=>start(k);box.appendChild(d);drawThumb(d.querySelector('canvas'),k,3,.8)}
 show('menu',1);show('result',0);show('hud',0)}
document.getElementById('again').onclick=()=>start(playerKey);document.getElementById('back').onclick=()=>{cars=[];player=null;menu()};
// 菜单背景：缓慢环绕的场地
let menuT=0;
(async()=>{for(const k of KEYS){SPR[k]=await loadImg('sprites/car_'+k+'_16dir.png');WHITE[k]=tint(SPR[k],'#ffffff',.85);DARK[k]=tint(SPR[k],'#1b1420',.6)}
 buildFloor();buildProps();{const old=ctx;ctx=floor.getContext('2d');ctx.setTransform(1,0,0,1,floor.ox,floor.oy);props.filter(p=>p.type==='bush'||p.type==='cone'||(p.type==='tires'&&!p.solid)).sort((a,b)=>a.x+a.z-b.x-b.z).forEach(p=>{drawProp(p);p.baked=true});ctx=old}show('loading',0);menu();requestAnimationFrame(loop)})();
window.__game={start,finish,get cars(){return cars},get time(){return time},set time(v){time=v},save};
