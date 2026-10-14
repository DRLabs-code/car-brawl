// v17 地图机关：工地坠落钢梁 / 废车场压扁机 / 沙漠流沙+沙尘暴；可撞碎油桶(爆炸AoE)与木箱(掉金币/道具)；AI 躲避与利用；集锦机关击杀加权
(()=>{let HZ=[],BR=[],BEAM={next:8},STORM={next:22,t:0,on:0},SS=[];const HS={beamHit:0,crush:0,sandT:0,boom:0,crate:0,hzKill:0,coin:0,drop:0};
const on=()=>!tut&&running&&mapKey!=='ring'&&MAPS[mapKey]&&['site','junk','desert'].includes(mapKey);
const credit=(c,win=4)=>c.lastBy&&c.lastBy.alive!==undefined&&time-(c.lastByT||-9)<win&&c.lastBy!==c?c.lastBy:null;
function hzKill(c,d,src,by){const was=c.alive;by=by===undefined?credit(c):by;hurt(c,d,by);if(was&&!c.alive){HS.hzKill++;ft(c.x,c.z,4.6,{beam:'钢梁砸中！',crush:'压扁！',boom:'炸飞！'}[src]||'机关击杀！','#ff9a3c',30,true);
  if(by===player||c===player)HL.evs.push({t:time,s:by===player?160:70,x:c.x,z:c.z,txt:by===player?'机关击杀！':'被机关淘汰'});track('hazard_kill',{src,map:mapKey,byP:by===player,victimP:c===player})}}
const free=(x,z,cl)=>{const[i,j]=cellOf(x,z);return GRID.ok[j*GRID.n+i]&&openCell(x,z,cl)};
function pickOpen(cl,avoid){for(let t=0;t<300;t++){const[x,z]=randIn(6);if(!free(x,z,cl))continue;if(avoid.some(a=>Math.hypot(a.x-x,a.z-z)<a.r+cl+4))continue;return[x,z]}return null}
function markGrid(x,z,r){const g=GRID;for(let j=0;j<g.n;j++)for(let i=0;i<g.n;i++){const[a,b]=cellPos(i,j);if(Math.hypot(a-x,b-z)<r+2.6)g.ok[j*g.n+i]=0}}
// 布置：在 buildArena 末尾生成（出生点、道具点都从 GRID.ok 取 → 自动避开机关）
const _ba=buildArena;buildArena=function(mk,R){_ba(mk,R);HZ=[];BR=[];SS=[];BEAM={next:8+Math.random()*3};STORM={next:20+Math.random()*6,t:0,on:0};if(!['site','junk','desert'].includes(mk))return;
 const k=AR/38;
 if(mk==='junk'){const n=AR>42?2:1;for(let i=0;i<n;i++){const p=pickOpen(4.5,HZ);if(p)HZ.push({k:'crush',x:p[0],z:p[1],r:3.3,t:Math.random()*3,ph:'open'})}}
 if(mk==='desert'){const n=AR>42?3:2;for(let i=0;i<n;i++){const p=pickOpen(5.5,HZ);if(p)HZ.push({k:'sand',x:p[0],z:p[1],r:4.6})}}
 for(const h of HZ)markGrid(h.x,h.z,h.r);
 // 可撞碎障碍
 const nb=Math.round(3+AR/14),avoid=HZ.slice();for(let i=0;i<nb;i++){const p=pickOpen(3,avoid.concat(BR.map(b=>({x:b.x,z:b.z,r:2}))));if(!p)continue;const t=i%2===0?'xbarrel':'crate',o={type:t,x:p[0],z:p[1],r:t==='xbarrel'?1.25:1.4,solid:true,brk:true,seed:Math.random()};props.push(o);BR.push(o)}
 // 重建网格后再把机关区挖掉（保证连通 + 可达）
 buildGrid();for(const h of HZ)markGrid(h.x,h.z,h.r)};
// 撞碎
function breakIt(o,by){const i=props.indexOf(o);if(i<0)return;props.splice(i,1);BR.splice(BR.indexOf(o),1);
 if(o.type==='xbarrel'){HS.boom++;boom(o.x,o.z,'#ff7a1a');spark(o.x,o.z,24,'#ffd23f');smoke(o.x,o.z,6);if(nearP(o.x,o.z)>0)sfx('boom');if(nearP(o.x,o.z)>.5){shake=Math.max(shake,10);vib('heavy')}
  for(const c of cars){if(!c.alive||c.dummy)continue;const dx=c.x-o.x,dz=c.z-o.z,d=Math.hypot(dx,dz);if(d<6.5){const f=1-d/6.5;c.vx+=dx/(d||1)*18*f;c.vz+=dz/(d||1)*18*f;hzKill(c,8+26*f,'boom',by===c?null:by)}}track('hazard_break',{t:'barrel',byP:by===player})}
 else{HS.crate++;debris(o.x,o.z,12,'#b0763a');spark(o.x,o.z,8,'#e8c58a');if(nearP(o.x,o.z)>0)sfx('block');const r=Math.random();
  if(r<.3){const v=5+(Math.random()*6|0);if(by===player){save.coins+=v;persist();HS.coin+=v}ft(o.x,o.z,3,`+${v} 金币`,'#ffd23f',20,true)}else if(r<.45&&__v11.PK.length<4){__v11.PK.push({k:['heal','atk','shield','boost','spring'][Math.random()*5|0],x:o.x,z:o.z,t:0,life:14});HS.drop++}
  track('hazard_break',{t:'crate',byP:by===player,drop:r<.45})}
 buildGrid();for(const h of HZ)markGrid(h.x,h.z,h.r)}
let pre=new Map();
const _st=step;step=function(dt){const act=on();if(act)for(const c of cars)pre.set(c,Math.hypot(c.vx,c.vz));_st(dt);if(!act||!running)return;
 for(const o of BR.slice())for(const c of cars){if(!c.alive||c.dummy)continue;const d=Math.hypot(c.x-o.x,c.z-o.z);if(d<o.r+c.r+.35&&(pre.get(c)||0)>5.5){breakIt(o,c);break}}
 // 坠落钢梁
 if(mapKey==='site'){if(time>=BEAM.next&&!SS.some(s=>s.k==='warn')){let x,z;const al=cars.filter(c=>c.alive&&!c.dummy);if(Math.random()<.55&&al.length){const c=al[Math.random()*al.length|0];x=c.x+c.vx*.9+rnd(-2,2);z=c.z+c.vz*.9+rnd(-2,2)}else{const p=pickOpen(2,[]);if(p)[x,z]=p}
   if(x!=null&&sdist(POLY,x,z).s<-2){SS.push({k:'warn',x,z,a:Math.random()*Math.PI,t:0,T:1.5});if(nearP(x,z)>.3)sfx('zap')}BEAM.next=time+6+Math.random()*4}
  for(const s of SS){s.t+=dt;if(s.k==='warn'&&s.t>=s.T){s.k='fall';s.t=0;boom(s.x,s.z,'#9aa3ad');debris(s.x,s.z,10,'#6c7480');if(nearP(s.x,s.z)>0)sfx('boom');if(nearP(s.x,s.z)>.6){shake=Math.max(shake,9);vib('heavy')}
    for(const c of cars){if(!c.alive||c.dummy)continue;if(beamHit(s,c.x,c.z,c.r*.8)){HS.beamHit++;c.vx*=.2;c.vz*=.2;hzKill(c,48,'beam')}}}}
  SS=SS.filter(s=>!(s.k==='fall'&&s.t>2.5))}
 // 压扁机：开 4s → 警示 1.2s → 合 0.5s（中心区直接淘汰）→ 回开
 for(const h of HZ){if(h.k==='crush'){h.t+=dt;const ph=h.ph;if(ph==='open'&&h.t>4){h.ph='warn';h.t=0;if(nearP(h.x,h.z)>.4)sfx('zap')}else if(ph==='warn'&&h.t>1.2){h.ph='close';h.t=0}else if(ph==='close'&&h.t>.5){h.ph='shut';h.t=0;if(nearP(h.x,h.z)>0)sfx('boom');if(nearP(h.x,h.z)>.6)shake=Math.max(shake,8);
     for(const c of cars)if(c.alive&&!c.dummy&&Math.hypot(c.x-h.x,c.z-h.z)<h.r){HS.crush++;c.invT=0;c.shT=0;hzKill(c,1e6,'crush')}}else if(ph==='shut'&&h.t>.6){h.ph='open';h.t=0}
    if(h.ph==='shut'||h.ph==='close'&&h.t>.3)for(const c of cars){if(!c.alive)continue;const dx=c.x-h.x,dz=c.z-h.z,d=Math.hypot(dx,dz);if(d>=h.r&&d<h.r+c.r){c.x=h.x+dx/d*(h.r+c.r);c.z=h.z+dz/d*(h.r+c.r)}}}
  else if(h.k==='sand'){for(const c of cars){if(!c.alive||c.dummy)continue;const dx=h.x-c.x,dz=h.z-c.z,d=Math.hypot(dx,dz);if(d<h.r+1){const f=1-d/(h.r+1);c.vx+=dx/(d||1)*18*(.35+f)*dt;c.vz+=dz/(d||1)*18*(.35+f)*dt;c.vx*=Math.exp(-1.6*f*dt);c.vz*=Math.exp(-1.6*f*dt);if(c.isP)HS.sandT+=dt;if(d<1.4){c.hp-=4*dt;if(c.hp<=0)hzKill(c,1,'sand')}if(Math.random()<dt*8)parts.push({k:'dust',x:c.x,z:c.z,y:.3,vx:rnd(-1,1),vz:rnd(-1,1),vy:.6,t:0,life:.6,s:7})}}}}
 if(mapKey==='desert'){if(!STORM.on&&time>=STORM.next){STORM.on=1;STORM.t=0;toast('🌪 沙尘暴来袭！视野降低');track('sandstorm',{})}if(STORM.on){STORM.t+=dt;if(STORM.t>7){STORM.on=0;STORM.next=time+22+Math.random()*8}}}};
function beamHit(s,x,z,pad){const ca=Math.cos(s.a),sa=Math.sin(s.a),dx=x-s.x,dz=z-s.z,u=dx*ca+dz*sa,v=-dx*sa+dz*ca;return Math.abs(u)<3.6+pad&&Math.abs(v)<.9+pad}
// AI：躲开预警区；有概率把目标推向机关
const _ai=aiThink;aiThink=function(c,dt){let o=_ai(c,dt);if(!on())return o;let[ix,iz,ds]=o;let rx=0,rz=0;const add=(x,z,r,w)=>{const dx=c.x-x,dz=c.z-z,d=Math.hypot(dx,dz);if(d<r+4){const f=w*(1-d/(r+4));rx+=dx/(d||1)*f;rz+=dz/(d||1)*f}};
 for(const s of SS)if(s.k==='warn')add(s.x,s.z,3.6,2.4);for(const h of HZ){if(h.k==='crush')add(h.x,h.z,h.r,h.ph==='open'?.5:2.6);else add(h.x,h.z,h.r,1.2)}
 const ai=c.ai;ai.hzT=(ai.hzT||0)-dt;if(ai.hzT<=0){ai.hzT=2;ai.hzUse=Math.random()<.25+c.sk*.45}
 const t=ai.t;if(ai.hzUse&&t&&t.alive){let best=null,bd=14;for(const h of HZ)if(h.k!=='sand'||true){const d=Math.hypot(t.x-h.x,t.z-h.z);if(d<bd){bd=d;best=h}}for(const s of SS)if(s.k==='warn'){const d=Math.hypot(t.x-s.x,t.z-s.z);if(d<bd){bd=d;best=s}}
  if(best){const ux=(t.x-best.x)/(bd||1),uz=(t.z-best.z)/(bd||1),px=t.x+ux*3,pz=t.z+uz*3,dp=Math.hypot(px-c.x,pz-c.z);let tx,tz;if(dp>2.5&&((c.x-t.x)*ux+(c.z-t.z)*uz)<1){tx=px;tz=pz}else{tx=t.x;tz=t.z;ds=Math.hypot(t.x-c.x,t.z-c.z)<9}const L=Math.hypot(tx-c.x,tz-c.z)||1;ix=(tx-c.x)/L;iz=(tz-c.z)/L;ai.hzPush=(ai.hzPush||0)+dt}}
 if(rx||rz){ix+=rx;iz+=rz;const L=Math.hypot(ix,iz)||1;ix/=L;iz/=L;if(Math.hypot(rx,rz)>.8)ds=false}return[ix,iz,ds]};
// 绘制：地面层（借每帧第一次 shadow 调用插入）+ 上层（坠梁/压板）+ 屏幕层（沙尘暴）
let gDone=false;const _sh=shadow;shadow=function(){if(!gDone&&on()){gDone=true;ground()}return _sh.apply(this,arguments)};
const _r=render;render=function(){gDone=false;_r();if(on()&&STORM.on){const a=Math.min(1,STORM.t/1.2,(7-STORM.t)/1.2)*.42;ctx.setTransform(DPR,0,0,DPR,0,0);const g=ctx.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.85);g.addColorStop(0,`rgba(230,190,120,${a*.45})`);g.addColorStop(1,`rgba(200,150,80,${a*1.6})`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle=`rgba(255,235,190,${a})`;for(let i=0;i<60;i++){const x=((i*137+time*260*(1+i%3*.3))%(W+40))-20,y=(i*71.3+Math.sin(time+i)*20)%H;ctx.fillRect(x,y,3+(i%3)*2,1.5)}}};
function diamond(x,z,r,fill,stroke,lw){ctx.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,p=iso(x+Math.cos(a)*r,z+Math.sin(a)*r);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||2;ctx.stroke()}}
function ground(){for(const h of HZ){if(h.k==='sand'){diamond(h.x,h.z,h.r+1,'rgba(190,140,70,.35)');diamond(h.x,h.z,h.r,'rgba(170,120,55,.55)','#8b5a2b',2);for(let k=0;k<3;k++){const rr=((time*.8+k/3)%1)*h.r;diamond(h.x,h.z,h.r-rr,null,'rgba(120,80,35,.6)',2)}}
  else if(h.k==='crush'){diamond(h.x,h.z,h.r+.6,'#3b3b44','#1b1420',3);const P=iso(h.x,h.z);ctx.save();ctx.beginPath();for(let i=0;i<24;i++){const a=i/24*Math.PI*2,p=iso(h.x+Math.cos(a)*h.r,h.z+Math.sin(a)*h.r);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath();ctx.clip();ctx.fillStyle='#ffc300';ctx.fillRect(P[0]-80,P[1]-40,160,80);ctx.fillStyle='#1b1420';for(let i=-8;i<8;i++){ctx.beginPath();ctx.moveTo(P[0]+i*14,P[1]-40);ctx.lineTo(P[0]+i*14+7,P[1]-40);ctx.lineTo(P[0]+i*14+47,P[1]+40);ctx.lineTo(P[0]+i*14+40,P[1]+40);ctx.fill()}ctx.restore();
   if(h.ph!=='open'){const bl=Math.sin(time*18)>0;diamond(h.x,h.z,h.r,bl?'rgba(255,40,40,.35)':null,'#ff3b3b',3)}}}
 for(const s of SS){if(s.k==='warn'){const f=s.t/s.T,bl=Math.sin(time*(10+f*20))>0;beamPoly(s,0,`rgba(20,10,30,${.15+f*.35})`);beamPoly(s,0,null,bl?'#ff3b3b':'#ffd23f')}else{beamPoly(s,0,'rgba(20,10,30,.35)')}}}
function beamPoly(s,y,fill,stroke){const ca=Math.cos(s.a),sa=Math.sin(s.a),pts=[[-3.6,-.9],[3.6,-.9],[3.6,.9],[-3.6,.9]].map(([u,v])=>{const p=iso(s.x+u*ca-v*sa,s.z+u*sa+v*ca);return[p[0],p[1]-y]});ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.setLineDash([8,5]);ctx.stroke();ctx.setLineDash([])}return pts}
function beamDraw(s,y){const top=beamPoly(s,y+14,null,null),bot=beamPoly(s,y,null,null);ctx.lineJoin='round';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;const q=(pts,f)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f;ctx.fill();ctx.stroke()};
 q([bot[2],bot[3],top[3],top[2]],'#a8402a');q([bot[1],bot[2],top[2],top[1]],'#c2522f');q(top,'#e06a3a');ctx.strokeStyle='#ffd8a8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo((top[0][0]+top[3][0])/2,(top[0][1]+top[3][1])/2);ctx.lineTo((top[1][0]+top[2][0])/2,(top[1][1]+top[2][1])/2);ctx.stroke()}
const _dt=drawTags;drawTags=function(){if(on()){for(const s of SS){if(s.k==='warn'){const f=s.t/s.T;if(f>.55){const y=(1-f)/.45*260;beamDraw(s,y)}}else{ctx.globalAlpha=Math.max(0,1-Math.max(0,s.t-1.8)/.7);beamDraw(s,0);ctx.globalAlpha=1}}
 for(const h of HZ)if(h.k==='crush'){const cl=h.ph==='close'?Math.min(1,h.t/.5):h.ph==='shut'?1:h.ph==='warn'?.04*Math.sin(time*30):0,gap=h.r*(1-Math.max(0,cl));isoBox(h.x-h.r-.6+(h.r-gap),h.z,.6,h.r,2.6,'#8a929c','#4f565f','#6c7480');isoBox(h.x+h.r+.6-(h.r-gap),h.z,.6,h.r,2.6,'#8a929c','#4f565f','#6c7480');
  for(const sd of[-1,1]){const p=iso(h.x+sd*(h.r+1.4),h.z-h.r),on2=h.ph!=='open'&&Math.sin(time*16)>0;ctx.fillStyle='#1b1420';ctx.fillRect(p[0]-3,p[1]-34,6,34);ctx.fillStyle=on2?'#ff3b3b':'#5a1f1f';ctx.beginPath();ctx.arc(p[0],p[1]-38,6,0,7);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.stroke();if(on2){ctx.fillStyle='rgba(255,60,60,.25)';ctx.beginPath();ctx.arc(p[0],p[1]-38,14,0,7);ctx.fill()}}}}
 return _dt()};
const _dp=drawProp;drawProp=function(p){if(p.type==='xbarrel'){const[sx,sy]=iso(p.x,p.z),h=32,r=12;shadow(sx+2,sy+2,18,9,.4);ctx.fillStyle='#1b1420';ctx.fillRect(sx-r-2,sy-h,2*r+4,h);ctx.beginPath();ctx.ellipse(sx,sy,r+2,r/2+2,0,0,7);ctx.fill();const g=ctx.createLinearGradient(sx-r,0,sx+r,0);g.addColorStop(0,'#8e1c1c');g.addColorStop(.35,'#e23b3b');g.addColorStop(1,'#7a1414');ctx.fillStyle=g;ctx.fillRect(sx-r,sy-h,2*r,h);ctx.beginPath();ctx.ellipse(sx,sy,r,r/2,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(sx,sy-h*.78);ctx.lineTo(sx+8,sy-h*.3);ctx.lineTo(sx-8,sy-h*.3);ctx.closePath();ctx.fill();ctx.fillStyle='#1b1420';ctx.fillRect(sx-1,sy-h*.66,2,8);ctx.fillRect(sx-1,sy-h*.4,2,2);ctx.fillStyle='#ff5a5a';ctx.beginPath();ctx.ellipse(sx,sy-h,r,r/2,0,0,7);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.stroke();return}
 if(p.type==='crate'){const[sx,sy]=iso(p.x,p.z);shadow(sx+3,sy+3,26,12,.35);isoBox(p.x,p.z,1.1,1.1,1.3,'#d9a25a','#9a6530','#b67a3e');const t=iso(p.x,p.z);ctx.strokeStyle='#6b4220';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(t[0]-14,t[1]-1.3*HK);ctx.lineTo(t[0]+14,t[1]-1.3*HK);ctx.stroke();return}
 return _dp(p)};
// 仅玩家队伍外的提示：首次进入有机关的地图提示一次
{const _s=start;start=function(k,opt){_s(k,opt);if(opt&&opt.tutorial)return;const tip={site:'⚠ 注意头顶：地面红框=钢梁即将坠落',junk:'⚠ 压扁机红灯闪烁时别进去，把对手推进去！',desert:'⚠ 流沙会把车吸进去，沙尘暴会挡视野'}[mapKey];const key='carbrawl_hzTip_'+mapKey;if(tip&&!localStorage.getItem(key)){localStorage.setItem(key,'1');setTimeout(()=>toast(tip),2300)}}}
window.__v17={get HZ(){return HZ},get BR(){return BR},get SS(){return SS},BEAM:()=>BEAM,STORM:()=>STORM,HS,breakIt,beamHit};
})();
