// 模块 maps-plus（v23）：新对战地图 冰湖（冰面打滑 + 冰窟窿周期开裂，掉进去重伤弹出）、工厂（传送带 + 周期电地板）。AI 躲开危险，也会把对手往里推。参数在 TUNE.ice / TUNE.fac
(()=>{const TI=TUNE.ice,TF=TUNE.fac;
MAPS.ice={name:'冰湖',en:'FROZEN LAKE',desc:'冰面打滑 · 冰窟窿周期开裂',tiles:['#e3eef6','#d8e6f0'],line:'#bcd2e2',speck:['#c9dceb','#f6fbff'],out:['#b9cfdf','#c7dae8','#a9c1d4'],rail:['#3d8fd1','#ffffff'],paint:'#4a86b8aa',logo:'ICE',obst:['snow','pine'],zone:{k:'ice',name:'冰面',n:7,r:[4,7]},dust:'#ffffff',deco:'ice',shape:'圆湖 · 中央雪堆 · 开阔冰面',
 poly:[[-44,-8],[-34,-24],[-12,-32],[14,-31],[34,-22],[45,-4],[40,16],[22,29],[-4,32],[-26,27],[-41,12]],walls:[[-4,-2,4,2,'snow'],[-26,-14,-22,-8,'snow'],[24,10,28,16,'snow']],zc:[0,-14]};
MAPS.factory={name:'工厂',en:'FACTORY',desc:'传送带 · 周期电地板 · 机油',tiles:['#a3abb3','#9aa2aa'],line:'#7f8890',speck:['#8d959d','#b8c0c8'],out:['#3d4148','#474b53','#33363c'],rail:['#ffc300','#2b2e34'],paint:'#ffc300cc',logo:'FACTORY',obst:['block','barrel'],zone:{k:'oil',name:'机油',n:3,r:[2.2,3.2]},dust:'#8a9098',deco:'factory',shape:'长方厂房 · 两台机床 · 传送带',
 poly:[[-46,-24],[-40,-30],[40,-30],[46,-24],[46,24],[40,30],[-40,30],[-46,24]],walls:[[-22,-8,-22,8,'block'],[22,-8,22,8,'block'],[-6,-18,6,-18,'barrel'],[-6,18,6,18,'barrel']],zc:[0,0]};
MAPK.push('ice','factory');
let HZ=[];const HS={fall:0,shockT:0,beltT:0,kill:0,push:0};
const on=()=>!tut&&running&&(mapKey==='ice'||mapKey==='factory');
// 冰面 = 打滑地形（和油污同一套抓地规则，防滑链有效）
{const _t=terrainAt;terrainAt=function(x,z){const r=_t(x,z);return r==='ice'?'oil':r}}
const credit=c=>c.lastBy&&c.lastBy!==c&&time-(c.lastByT||-9)<TUNE.hz.creditWin?c.lastBy:null;
function hzHurt(c,d,src){const was=c.alive,by=credit(c);hurt(c,d,by);if(was&&!c.alive){HS.kill++;ft(c.x,c.z,4.6,src==='hole'?'冰窟窿淘汰！':'电击淘汰！','#7df9ff',30,true);
 if(by===player||c===player)HL.evs.push({t:time,s:by===player?160:70,x:c.x,z:c.z,txt:by===player?'机关击杀！':'被机关淘汰'});track('hazard_kill',{src,map:mapKey,byP:by===player,victimP:c===player})}}
const free=(x,z,cl)=>{const[i,j]=cellOf(x,z);return GRID.ok[j*GRID.n+i]&&openCell(x,z,cl)};
function pick(cl,ok){for(let t=0;t<400;t++){const[x,z]=randIn(6);if(free(x,z,cl)&&HZ.every(a=>Math.hypot(a.x-x,a.z-z)>a.r+cl+4)&&(!ok||ok(x,z)))return[x,z]}return null}
function markGrid(x,z,r){const g=GRID;for(let j=0;j<g.n;j++)for(let i=0;i<g.n;i++){const[a,b]=cellPos(i,j);if(Math.hypot(a-x,b-z)<r+TUNE.hz.hzMargin)g.ok[j*g.n+i]=0}}
const cracks=()=>Array.from({length:6},(_,i)=>{const a=i/6*Math.PI*2+rnd(-.3,.3);return[a,rnd(.55,1),a+rnd(-.5,.5)]});
const _ba=buildArena;buildArena=function(mk,R){_ba(mk,R);HZ=[];if(mk!=='ice'&&mk!=='factory')return;const big=AR>42;
 if(mk==='ice'){for(let i=0;i<TI.holes[big?1:0];i++){const p=pick(TI.holeR+1.5);if(p)HZ.push({k:'hole',x:p[0],z:p[1],r:TI.holeR,ph:'shut',t:0,T:rnd(TI.shut[0]*.4,TI.shut[1]),cr:cracks()})}paintIce()}
 else{const L=TF.beltL*(big?1.3:1);for(let i=0;i<TF.belts;i++){const p=pick(2.2,(x,z)=>{for(let k=-4;k<=4;k++)if(!free(x+k*L/8,z,2.2))return false;return true});if(p)HZ.push({k:'belt',x:p[0],z:p[1],L,w:TF.beltW,r:L/2,dir:i%2?1:-1})}
  for(let i=0;i<TF.pads[big?1:0];i++){const p=pick(TF.padR*1.3+1);if(p)HZ.push({k:'pad',x:p[0],z:p[1],r:TF.padR,ph:'idle',t:0,T:rnd(TF.idle[0]*.5,TF.idle[1])})}}
 for(const h of HZ)if(h.k!=='belt')markGrid(h.x,h.z,h.k==='pad'?h.r*1.3:h.r)};
// 冰面斑块烘焙进地面
function paintIce(){const x=floor.getContext('2d');x.save();x.setTransform(FSC,0,0,FSC,floor.ox,floor.oy);for(const g of gzones){const p=iso(g.x,g.z),rx=g.r*K*Math.SQRT2,ry=rx/2;
 x.fillStyle='#9ccbe6';x.beginPath();x.ellipse(p[0],p[1]+2,rx*1.03,ry*1.05,0,0,7);x.fill();const gr=x.createLinearGradient(p[0]-rx,p[1]-ry,p[0]+rx,p[1]+ry);gr.addColorStop(0,'#d9f1fd');gr.addColorStop(1,'#a9d6f0');x.fillStyle=gr;x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();
 x.strokeStyle='#ffffffcc';x.lineWidth=3;for(let k=0;k<3;k++){const o=rnd(-.4,.3);x.beginPath();x.moveTo(p[0]+rx*(o-.25),p[1]+ry*(o-.1));x.lineTo(p[0]+rx*(o+.15),p[1]+ry*(o-.45));x.stroke()}}x.restore()}
const splash=h=>{for(let i=0;i<10;i++){const a=rnd(0,7);parts.push({k:'deb',x:h.x+Math.cos(a)*h.r*.8,z:h.z+Math.sin(a)*h.r*.8,y:1,vx:Math.cos(a)*rnd(3,7),vz:Math.sin(a)*rnd(3,7),vy:rnd(4,8),t:0,life:.9,s:rnd(3,6),col:'#eaf6ff',rot:rnd(0,7),vr:rnd(-12,12)})}spark(h.x,h.z,10,'#bfe9ff')};
const inPad=(c,h)=>Math.abs(c.x-h.x)<h.r&&Math.abs(c.z-h.z)<h.r;
const _st=step;step=function(dt){_st(dt);if(!on())return;
 for(const h of HZ){
  if(h.k==='hole'){if((h.t+=dt)>h.T){h.t=0;if(h.ph==='shut'){h.ph='warn';h.T=TI.warn;if(nearP(h.x,h.z)>.4)sfx('zap')}else if(h.ph==='warn'){h.ph='open';h.T=TI.open;splash(h);if(nearP(h.x,h.z)>0)sfx('boom')}else{h.ph='shut';h.T=rnd(...TI.shut);h.cr=cracks()}}
   if(h.ph==='open')for(const c of cars){if(!c.alive||c.dummy||c.air>0||time<(c.holeCd||0))continue;const dx=c.x-h.x,dz=c.z-h.z,d=Math.hypot(dx,dz);if(d>=h.r-.5)continue;
    // 掉进冰窟窿：重伤（最大耐久 fallDmg）+ 弹到洞外
    HS.fall++;c.holeCd=time+TI.fallCd;splash(h);const ux=d>.1?dx/d:Math.sin(c.h),uz=d>.1?dz/d:Math.cos(c.h);c.x=h.x+ux*(h.r+c.r+.4);c.z=h.z+uz*(h.r+c.r+.4);c.vx=ux*TI.fallKick;c.vz=uz*TI.fallKick;c.flash=.2;
    ft(c.x,c.z,3.6,'掉进冰窟窿！','#7df9ff',c.isP?28:20,c.isP);if(c.isP){vib('heavy');shake=Math.max(shake,10)}hzHurt(c,c.maxhp*TI.fallDmg,'hole')}}
  else if(h.k==='pad'){if((h.t+=dt)>h.T){h.t=0;h.ph=h.ph==='idle'?'warn':h.ph==='warn'?'on':'idle';h.T=h.ph==='idle'?rnd(...TF.idle):h.ph==='warn'?TF.warn:TF.on;if(h.ph==='on'&&nearP(h.x,h.z)>.3)sfx('zap')}
   if(h.ph==='on')for(const c of cars)if(c.alive&&!c.dummy&&inPad(c,h)){if(c.isP)HS.shockT+=dt;const f=Math.exp(-TF.slow*dt);c.vx*=f;c.vz*=f;c.hp-=TF.dps*dt*(c.shT>0?.3:1);c.flash=.06;if(c.hp<=0){c.hp=.01;hzHurt(c,1,'shock')}if(Math.random()<dt*10)spark(c.x,c.z,3,'#7df9ff')}}
  else for(const c of cars)if(c.alive&&!c.dummy&&!(c.air>0)&&Math.abs(c.x-h.x)<h.L/2&&Math.abs(c.z-h.z)<h.w/2+.6){c.x+=h.dir*TF.beltSpd*dt;if(c.isP)HS.beltT+=dt}}};
// AI：躲开预警/开启的冰窟窿和电地板；有概率把目标推进去
const _ai=aiThink;aiThink=function(c,dt){let o=_ai(c,dt);if(!on())return o;let[ix,iz,ds]=o,rx=0,rz=0;const add=(x,z,r,w)=>{const dx=c.x-x,dz=c.z-z,d=Math.hypot(dx,dz);if(d<r+4){const f=w*(1-d/(r+4));rx+=dx/(d||1)*f;rz+=dz/(d||1)*f}};
 const hot=h=>h.k==='hole'?h.ph!=='shut':h.k==='pad'&&h.ph!=='idle';
 for(const h of HZ)if(h.k!=='belt')add(h.x,h.z,h.k==='pad'?h.r*1.3:h.r,hot(h)?2.6:.3);
 const ai=c.ai;ai.mpT=(ai.mpT||0)-dt;if(ai.mpT<=0){ai.mpT=2;ai.mpUse=Math.random()<.25+c.sk*.45}
 const t=ai.t;if(ai.mpUse&&t&&t.alive){let best=null,bd=14;for(const h of HZ)if(hot(h)){const d=Math.hypot(t.x-h.x,t.z-h.z);if(d<bd){bd=d;best=h}}
  if(best){const ux=(t.x-best.x)/(bd||1),uz=(t.z-best.z)/(bd||1),px=t.x+ux*3,pz=t.z+uz*3;let tx=t.x,tz=t.z;if(Math.hypot(px-c.x,pz-c.z)>2.5&&((c.x-t.x)*ux+(c.z-t.z)*uz)<1){tx=px;tz=pz}else ds=Math.hypot(t.x-c.x,t.z-c.z)<9;const L=Math.hypot(tx-c.x,tz-c.z)||1;ix=(tx-c.x)/L;iz=(tz-c.z)/L;HS.push+=dt}}
 if(rx||rz){ix+=rx;iz+=rz;const L=Math.hypot(ix,iz)||1;ix/=L;iz/=L;if(Math.hypot(rx,rz)>.8)ds=false}return[ix,iz,ds]};
// 绘制：地面层（借每帧第一次 shadow 调用）
const ring=(x,z,r,n=24)=>{ctx.beginPath();for(let i=0;i<n;i++){const a=i/n*Math.PI*2,p=iso(x+Math.cos(a)*r,z+Math.sin(a)*r);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath()};
const quad=(x,z,hx,hz)=>{ctx.beginPath();[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].forEach(([a,b],i)=>{const p=iso(x+a,z+b);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath()};
function ground(){ctx.save();ctx.lineJoin='round';for(const h of HZ){
 if(h.k==='hole'){if(h.ph==='open'){const f=Math.min(1,h.t/.25);ring(h.x,h.z,h.r*(.6+.4*f));ctx.fillStyle='#1d4e7a';ctx.fill();ctx.strokeStyle='#f4fbff';ctx.lineWidth=5;ctx.stroke();ring(h.x,h.z,h.r*.62*f);ctx.fillStyle='#2f6fa3';ctx.fill();
   const k=(time*.7)%1;ring(h.x,h.z,h.r*.2+h.r*.5*k);ctx.strokeStyle=`rgba(190,230,255,${.6*(1-k)})`;ctx.lineWidth=2;ctx.stroke();
   for(let i=0;i<5;i++){const a=i*1.3+h.x,p=iso(h.x+Math.cos(a)*h.r*.95,h.z+Math.sin(a)*h.r*.95);ctx.fillStyle='#ffffff';ctx.strokeStyle='#9ccbe6';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p[0]-7,p[1]);ctx.lineTo(p[0],p[1]-4);ctx.lineTo(p[0]+8,p[1]+1);ctx.lineTo(p[0],p[1]+4);ctx.closePath();ctx.fill();ctx.stroke()}}
  else{const w=h.ph==='warn',f=w?h.t/h.T:0;ring(h.x,h.z,h.r);ctx.fillStyle=w?`rgba(60,130,190,${.25+f*.35})`:'rgba(150,200,230,.35)';ctx.fill();if(w){ctx.strokeStyle=Math.sin(time*(10+f*20))>0?'#ff3b3b':'#ffffff';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.stroke();ctx.setLineDash([])}
   ctx.strokeStyle=w?'#2a5f8f':'#8fbcd8';ctx.lineWidth=w?2.5:1.5;for(const[a,l,b]of h.cr){const L=h.r*l*(w?.6+.4*f:.55),p0=iso(h.x,h.z),p1=iso(h.x+Math.cos(a)*L*.55,h.z+Math.sin(a)*L*.55),p2=iso(h.x+Math.cos(b)*L,h.z+Math.sin(b)*L);ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke()}}}
 else if(h.k==='pad'){quad(h.x,h.z,h.r+.5,h.r+.5);ctx.fillStyle='#1b1420';ctx.fill();quad(h.x,h.z,h.r+.3,h.r+.3);ctx.fillStyle=h.ph==='warn'&&Math.sin(time*16)>0?'#ffd23f':'#e0a800';ctx.fill();quad(h.x,h.z,h.r-.3,h.r-.3);ctx.fillStyle=h.ph==='on'?'#2a6a8a':'#5d646d';ctx.fill();ctx.strokeStyle='#3a4048';ctx.lineWidth=2;ctx.stroke();
  for(let i=-1;i<=1;i++){const a=iso(h.x-h.r+.6,h.z+i*h.r*.5),b=iso(h.x+h.r-.6,h.z+i*h.r*.5);ctx.strokeStyle=h.ph==='on'?'#7df9ff':'#7a828c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  if(h.ph==='on'){ctx.strokeStyle='#e8ffff';ctx.lineWidth=2.5;ctx.shadowColor='#7df9ff';ctx.shadowBlur=10;for(let n=0;n<3;n++){ctx.beginPath();let x=h.x-h.r+.4,z=h.z+rnd(-h.r,h.r)*.8;let p=iso(x,z);ctx.moveTo(p[0],p[1]);while(x<h.x+h.r-.4){x+=rnd(.6,1.4);z=clamp(z+rnd(-.9,.9),h.z-h.r+.3,h.z+h.r-.3);p=iso(x,z);ctx.lineTo(p[0],p[1])}ctx.stroke()}ctx.shadowBlur=0}}
 else{const hx=h.L/2,hz=h.w/2;quad(h.x,h.z,hx+.3,hz+.5);ctx.fillStyle='#ffc300';ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;ctx.stroke();quad(h.x,h.z,hx,hz);ctx.fillStyle='#2b2e34';ctx.fill();
  const off=((time*TF.beltSpd)%2+2)%2;ctx.strokeStyle='#8a929c';ctx.lineWidth=3;for(let u=-hx+.4;u<hx-.6;u+=2){const x0=h.x+(h.dir>0?u+off:-u-off),x1=x0+h.dir*.8;if(Math.abs(x0-h.x)>hx-.3||Math.abs(x1-h.x)>hx-.3)continue;const a=iso(x0,h.z-hz*.7),b=iso(x1,h.z),c=iso(x0,h.z+hz*.7);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.stroke()}}}
 ctx.restore()}
let gDone=false;{const _r=render;render=function(){gDone=false;return _r.apply(this,arguments)}}
{const _sh=shadow;shadow=function(){if(!gDone&&on()&&HZ.length){gDone=true;ground()}return _sh.apply(this,arguments)}}
// 新装饰/障碍：松树、雪堆（与现有描边卡通风格一致）
const _dp=drawProp;drawProp=function(p){const[sx,sy]=iso(p.x,p.z),s=p.s||(p.solid?1.2:1);
 if(p.type==='pine'){shadow(sx+3,sy+3,22*s,10*s,.35);ctx.lineJoin='round';ctx.fillStyle='#6b4a2b';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;ctx.fillRect(sx-4*s,sy-14*s,8*s,14*s);ctx.strokeRect(sx-4*s,sy-14*s,8*s,14*s);
  for(let i=0;i<3;i++){const y=sy-12*s-i*16*s,w=(24-i*6)*s;ctx.beginPath();ctx.moveTo(sx-w,y);ctx.lineTo(sx,y-24*s);ctx.lineTo(sx+w,y);ctx.closePath();ctx.fillStyle=i%2?'#3f8a63':'#2f6b4f';ctx.fill();ctx.stroke();ctx.fillStyle='#f4f9fd';ctx.beginPath();ctx.moveTo(sx-w*.45,y-13*s);ctx.lineTo(sx,y-24*s);ctx.lineTo(sx+w*.45,y-13*s);ctx.lineTo(sx+w*.15,y-10*s);ctx.lineTo(sx-w*.1,y-13*s);ctx.closePath();ctx.fill()}return}
 if(p.type==='snow'){shadow(sx+3,sy+3,36*s,16*s,.3);ctx.strokeStyle='#1b1420';ctx.lineWidth=3;ctx.fillStyle='#c9dbe8';ctx.beginPath();ctx.ellipse(sx,sy-6*s,30*s,16*s,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='#f4f9fd';ctx.beginPath();ctx.ellipse(sx-3*s,sy-12*s,25*s,13*s,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(sx+6*s,sy-20*s,14*s,9*s,0,0,7);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(sx+2*s,sy-24*s,6*s,3*s,0,0,7);ctx.fill();return}
 return _dp(p)};
{const _s=start;start=function(k,opt){_s(k,opt);if(opt&&opt.tutorial)return;const tip={ice:'⚠ 冰面会打滑；冰面裂纹闪红=冰窟窿要开了，掉进去重伤',factory:'⚠ 传送带会带着车走；电地板闪黄后通电，别停在上面'}[mapKey];const key='carbrawl_hzTip_'+mapKey;if(tip&&!localStorage.getItem(key)){localStorage.setItem(key,'1');setTimeout(()=>toast(tip),2300)}if(tip)track('map_hazard_start',{map:mapKey,n:HZ.length})}}
window.__maps={get HZ(){return HZ},HS};
})();
