// 模块 map-live（v31）：让地图耐玩 + 有画面感。参数全在 TUNE.live。
//  ① 补给空投（抢点奖励）：定时刷一个大补给，光柱+屏幕边缘箭头指路，先到先得：额外一个道具 + 短护盾 + 金币（玩家，每局前 maxCoin 次）
//  ② 每张图一个局中事件：工地钢梁雨 / 废车场磁吊车 / 沙漠流沙塌陷 / 冰湖全湖开裂 / 工厂传送带换向 / 擂台强风 / 赛道暴雨路滑（横幅预告；玩家车 Lv<minLv 不触发）
//  ③ 画面：地面细节（车辙/油渍/裂缝/碎石/积水/划痕，建图时烘焙一次）、每张图标志性建筑（起重机/车堆/棕榈/冰屋/烟囱…，烘焙）、
//     色调烘进地面 + 屏幕暗角（预烘小图，只画四边条带）、环境粒子（灰尘/烟/沙粒/雪/火星，数量封顶）、冰面反光、烟囱冒烟、工厂火花、撞障碍的碎屑和尘土
(()=>{const T=TUNE.live;if(!T.on){window.__live={off:true};return}
const MOBC2=matchMedia('(pointer:coarse)').matches,MAIN=['site','junk','desert','ice','factory'];
let S={},ST={};
const act=()=>!tut&&running;
const free=(x,z,cl)=>{const[i,j]=cellOf(x,z);return GRID.ok[j*GRID.n+i]&&openCell(x,z,cl)};
const openPt=(cl,far)=>{for(let t=0;t<200;t++){const[x,z]=randIn(6);if(free(x,z,cl)&&(!far||cars.every(c=>!c.alive||Math.hypot(c.x-x,c.z-z)>far)))return[x,z]}return null};
const scr=(x,z)=>{const p=iso(x,z),k=Z*camZ;return[(p[0]-camX)*k+W/2,(p[1]-camY)*k+H/2+H*.04]};
// ================= 烘焙：地面细节 + 标志性建筑 =================
function bake(fn){const old=ctx,x=floor.getContext('2d');x.save();x.setTransform(FSC,0,0,FSC,floor.ox,floor.oy);ctx=x;fn(x);ctx=old;x.restore()}
function detail(x){const M=MAP,k=AR/38,dk=M.deco,P=T.detail,n=v=>Math.round(v*k*P.density);
 const okp=q=>!(M.mesas||[]).some(m=>Math.hypot(m[0]*SC-q[0],m[1]*SC-q[1])<m[2]*SC+2)&&!(M.pits||[]).some(p=>q[0]>p[0][0]*SC-3&&q[0]<p[1][0]*SC+3&&q[1]>p[0][1]*SC-3&&q[1]<p[2][1]*SC+3);
 const rq=()=>{for(let i=0;i<30;i++){const q=randIn(3);if(okp(q))return q}return randIn(3)};
 const trk=(col,a,w,dbl)=>{let[wx,wz]=rq(),ang=rnd(0,6.3);const cu=rnd(-.06,.06),L=[[],[]];for(let i=0;i<18;i++){ang+=cu;wx+=Math.cos(ang)*1.5;wz+=Math.sin(ang)*1.5;for(let s=0;s<(dbl?2:1);s++){const o=s?.55:-.55;L[s].push(iso(wx-Math.sin(ang)*o*(dbl?1:0),wz+Math.cos(ang)*o*(dbl?1:0)))}}
  x.save();x.globalAlpha=a;x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.lineJoin='round';for(const l of L)if(l.length){x.beginPath();l.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke()}x.restore()};
 const stain=(rgb,rx,a)=>{const q=rq(),p=iso(q[0],q[1]),r=rx*K*Math.SQRT2,g=x.createRadialGradient(p[0],p[1],1,p[0],p[1],r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.7,`rgba(${rgb},${a*.5})`);g.addColorStop(1,`rgba(${rgb},0)`);x.fillStyle=g;x.beginPath();x.ellipse(p[0],p[1],r,r/2,0,0,7);x.fill()};
 const dots=(cols,cnt,sp)=>{const q=rq(),p=iso(q[0],q[1]);for(let i=0;i<cnt;i++){x.fillStyle=cols[i%cols.length];x.beginPath();x.ellipse(p[0]+rnd(-sp,sp),p[1]+rnd(-sp/2,sp/2),rnd(1.2,3.2),rnd(.8,1.8),rnd(0,3),0,7);x.fill()}};
 const crack=(col,w)=>{const q=rq();let p=iso(q[0],q[1]);x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(p[0],p[1]);let a=rnd(0,6.3);for(let i=0;i<7;i++){a+=rnd(-.7,.7);p=[p[0]+Math.cos(a)*rnd(8,16),p[1]+Math.sin(a)*rnd(4,8)];x.lineTo(p[0],p[1]);if(i%3===1){const b=a+rnd(-1.2,1.2);x.moveTo(p[0],p[1]);x.lineTo(p[0]+Math.cos(b)*10,p[1]+Math.sin(b)*5);x.moveTo(p[0],p[1])}}x.stroke()};
 const puddle=()=>{const q=rq(),p=iso(q[0],q[1]),rx=rnd(1.6,3)*K*Math.SQRT2,ry=rx/2;x.fillStyle='rgba(120,160,185,.55)';x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();x.strokeStyle='rgba(60,90,110,.6)';x.lineWidth=2;x.stroke();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2.5;x.beginPath();x.ellipse(p[0]-rx*.2,p[1]-ry*.25,rx*.45,ry*.3,0,Math.PI*1.1,Math.PI*1.75);x.stroke()};
 x.save();
 if(dk==='site'){for(let i=0;i<n(7);i++)trk('#6b5a40',.24,2.2,1);for(let i=0;i<n(5);i++)stain('40,28,16',rnd(1,2),.5);for(let i=0;i<n(3);i++)puddle();for(let i=0;i<n(10);i++)dots(['#8f887a','#6f685c','#b3ad9f'],6,14);for(let i=0;i<n(4);i++)crack('rgba(90,82,70,.55)',1.6)}
 else if(dk==='junk'){for(let i=0;i<n(9);i++)trk('#2c2824',.32,2.6,1);for(let i=0;i<n(9);i++)stain('20,14,22',rnd(1,2.4),.6);for(let i=0;i<n(5);i++)stain('150,80,40',rnd(1.2,2),.4);for(let i=0;i<n(8);i++)dots(['#cfe6f0','#9fc2d4','#6b4a35'],7,16);for(let i=0;i<n(3);i++)crack('rgba(50,44,36,.6)',1.8)}
 else if(dk==='desert'){for(let i=0;i<n(6);i++)trk('#b38a48',.3,2.4,1);for(let i=0;i<n(14);i++)dots(['#c9a064','#8a6a3a','#e8d09a'],6,16);for(let i=0;i<n(4);i++)crack('rgba(170,125,60,.6)',1.8);for(let i=0;i<n(3);i++)stain('250,236,190',rnd(2,3.5),.5)}
 else if(dk==='ice'){for(let i=0;i<n(11);i++)trk('#ffffff',.55,1.6,0);for(let i=0;i<n(6);i++)stain('255,255,255',rnd(1.6,3),.7);for(let i=0;i<n(6);i++)crack('rgba(120,170,205,.75)',1.8);for(let i=0;i<n(4);i++)dots(['#ffffff','#d6ecf9'],6,18)}
 else if(dk==='factory'){for(let i=0;i<n(5);i++)trk('#3b3f46',.28,2.2,1);for(let i=0;i<n(6);i++)stain('15,15,20',rnd(1,2),.55);for(let i=0;i<n(5);i++){stain('10,10,14',rnd(1.2,2),.7);dots(['#ff9a3c','#ffd23f'],4,8)}for(let i=0;i<n(3);i++)crack('rgba(60,64,70,.6)',1.6)}
 x.restore();
 // 墙根环境光遮蔽（深色软边）+ 场地中心光斑
 const poly=(P,st,lw)=>{x.save();x.beginPath();P.forEach((q,i)=>{const p=iso(q[0],q[1]);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.closePath();x.strokeStyle=st;x.lineWidth=lw;x.lineJoin='round';x.stroke();x.restore()};
 const inn=POLY.map(([px,pz])=>{const cx=px-ZC[0],cz=pz-ZC[1],L=Math.hypot(cx,cz)||1;return[px-cx/L*1.2,pz-cz/L*1.2]});
 poly(inn,'rgba(10,6,20,.10)',26);poly(inn,'rgba(10,6,20,.12)',12);
 const lp=iso(ZC[0],ZC[1]),R=AR*K*1.15,g=x.createRadialGradient(lp[0],lp[1],R*.1,lp[0],lp[1],R);g.addColorStop(0,`rgba(${T.fx.light[dk]},${T.fx.pool})`);g.addColorStop(1,`rgba(${T.fx.light[dk]},0)`);x.fillStyle=g;x.beginPath();x.ellipse(lp[0],lp[1],R,R/2,0,0,7);x.fill()}
const LMD={
 crane(sx,sy){shadow(sx+10,sy+6,60,22,.35);const Y='#f2b705',O='#1b1420';ctx.lineJoin='round';ctx.fillStyle=Y;ctx.strokeStyle=O;ctx.lineWidth=3;ctx.fillRect(sx-9,sy-150,18,150);ctx.strokeRect(sx-9,sy-150,18,150);ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<7;i++){const y=sy-i*21;ctx.moveTo(sx-9,y);ctx.lineTo(sx+9,y-21);ctx.moveTo(sx+9,y);ctx.lineTo(sx-9,y-21)}ctx.stroke();
  ctx.lineWidth=3;ctx.fillRect(sx-62,sy-172,128,10);ctx.strokeRect(sx-62,sy-172,128,10);ctx.fillStyle='#6c7480';ctx.fillRect(sx-62,sy-162,22,16);ctx.strokeRect(sx-62,sy-162,22,16);ctx.fillStyle='#e9eef3';ctx.fillRect(sx-16,sy-186,18,14);ctx.strokeRect(sx-16,sy-186,18,14);
  ctx.beginPath();ctx.moveTo(sx+46,sy-162);ctx.lineTo(sx+46,sy-106);ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#c0392b';ctx.fillRect(sx+41,sy-106,10,10);ctx.strokeRect(sx+41,sy-106,10,10);ctx.fillStyle='#d9a25a';ctx.fillRect(sx+32,sy-94,28,18);ctx.strokeRect(sx+32,sy-94,28,18);ctx.fillStyle='#ff3b3b';ctx.beginPath();ctx.arc(sx,sy-192,3.5,0,7);ctx.fill()},
 lamp(sx,sy){shadow(sx+4,sy+3,22,9,.35);ctx.fillStyle='#1b1420';ctx.fillRect(sx-5,sy-112,10,112);ctx.fillStyle='#5d646d';ctx.fillRect(sx-3,sy-110,6,110);ctx.fillStyle='#1b1420';ctx.beginPath();ctx.roundRect(sx-16,sy-124,34,12,3);ctx.fill();ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.roundRect(sx-14,sy-122,30,8,2);ctx.fill();
  let g=ctx.createRadialGradient(sx+2,sy-118,2,sx+2,sy-118,46);g.addColorStop(0,'rgba(255,240,170,.55)');g.addColorStop(1,'rgba(255,240,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+2,sy-118,46,0,7);ctx.fill();
  g=ctx.createRadialGradient(sx,sy+2,2,sx,sy+2,78);g.addColorStop(0,'rgba(255,236,160,.30)');g.addColorStop(1,'rgba(255,236,160,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(sx,sy+2,78,36,0,0,7);ctx.fill()},
 carstack(sx,sy,p){shadow(sx+6,sy+4,66,26,.4);const C=[['#b5562d','#7f3a1b','#9a4623'],['#3f6fa8','#274a75','#335d90'],['#c7b037','#8e7d22','#ab9729']];for(let i=0;i<3;i++){ctx.save();ctx.translate(0,-i*.95*HK);isoBox(p.x+(i-1)*.25,p.z+(i%2?.15:-.1),2.5,1.25,.9,C[i][0],C[i][1],C[i][2]);ctx.restore()}drawTire(sx+44,sy+2,.55)},
 palm(sx,sy){shadow(sx+8,sy+4,40,16,.3);const O='#1b1420';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx+14,sy-60,sx+6,sy-118);ctx.strokeStyle=O;ctx.lineWidth=13;ctx.stroke();ctx.strokeStyle='#a9763f';ctx.lineWidth=8;ctx.stroke();
  const tx=sx+6,ty=sy-118;for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.62,l=58,ex=tx+Math.cos(a)*l,ey=ty+Math.sin(a)*l*.7+18;ctx.fillStyle=i%2?'#2f8f46':'#3fae57';ctx.strokeStyle=O;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+Math.cos(a)*l*.5,ty+Math.sin(a)*l*.8-14,ex,ey);ctx.quadraticCurveTo(tx+Math.cos(a)*l*.5,ty+Math.sin(a)*l*.8+2,tx,ty);ctx.fill();ctx.stroke()}
  ctx.fillStyle='#6b4220';for(const o of[-5,5]){ctx.beginPath();ctx.arc(tx+o,ty+7,5,0,7);ctx.fill()}},
 bones(sx,sy){shadow(sx+4,sy+3,64,20,.28);const O='#1b1420',B='#efe6d0';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx-46,sy);ctx.lineTo(sx+50,sy);ctx.strokeStyle=O;ctx.lineWidth=12;ctx.stroke();ctx.strokeStyle=B;ctx.lineWidth=6;ctx.stroke();
  for(let i=0;i<5;i++){const x=sx-38+i*18,h=46-Math.abs(i-2)*9;ctx.beginPath();ctx.moveTo(x,sy);ctx.quadraticCurveTo(x+4,sy-h*1.5,x+22,sy-h*.3);ctx.strokeStyle=O;ctx.lineWidth=10;ctx.stroke();ctx.strokeStyle=B;ctx.lineWidth=5;ctx.stroke()}
  ctx.fillStyle=B;ctx.strokeStyle=O;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx+62,sy-6,17,12,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=O;ctx.beginPath();ctx.arc(sx+58,sy-8,3.2,0,7);ctx.arc(sx+68,sy-8,3.2,0,7);ctx.fill()},
 igloo(sx,sy){shadow(sx+6,sy+4,62,22,.3);const O='#1b1420';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(sx-54,sy);ctx.bezierCurveTo(sx-54,sy-82,sx+54,sy-82,sx+54,sy);ctx.ellipse(sx,sy,54,17,0,0,Math.PI);ctx.closePath();const g=ctx.createLinearGradient(sx-54,0,sx+54,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#bcd6e8');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=O;ctx.lineWidth=3.5;ctx.stroke();
  ctx.strokeStyle='#a9c6da';ctx.lineWidth=1.8;for(let i=1;i<4;i++){ctx.beginPath();ctx.ellipse(sx,sy-4,54-i*3,17+i*14,0,Math.PI,0);ctx.stroke()}ctx.fillStyle='#24384d';ctx.strokeStyle=O;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx+16,sy-4,17,13,0,Math.PI,0);ctx.lineTo(sx+33,sy+2);ctx.lineTo(sx-1,sy+2);ctx.closePath();ctx.fill();ctx.stroke()},
 chimney(sx,sy,p){shadow(sx+12,sy+5,50,18,.4);const O='#1b1420',H=190;ctx.lineJoin='round';const g=ctx.createLinearGradient(sx-17,0,sx+17,0);g.addColorStop(0,'#8d5a47');g.addColorStop(.5,'#c0795f');g.addColorStop(1,'#6a3f31');ctx.fillStyle=g;ctx.strokeStyle=O;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(sx-18,sy);ctx.lineTo(sx-11,sy-H);ctx.lineTo(sx+11,sy-H);ctx.lineTo(sx+18,sy);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.clip();for(let i=0;i<2;i++){const y=sy-H+14+i*26;ctx.fillStyle='#ffc300';ctx.fillRect(sx-20,y,40,12);ctx.fillStyle=O;for(let k=-3;k<4;k++){ctx.beginPath();ctx.moveTo(sx+k*8-4,y);ctx.lineTo(sx+k*8+4,y);ctx.lineTo(sx+k*8,y+12);ctx.lineTo(sx+k*8-8,y+12);ctx.fill()}}ctx.restore();
  ctx.fillStyle='#2b2e34';ctx.beginPath();ctx.ellipse(sx,sy-H,12,5,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='#ff3b3b';ctx.beginPath();ctx.arc(sx,sy-H-8,3.2,0,7);ctx.fill()}};
const LMT={site:['crane','lamp'],junk:['carstack','lamp','carstack'],desert:['palm','bones','palm'],ice:['igloo','igloo'],factory:['chimney','lamp','chimney']};
const _dp=drawProp;drawProp=function(p){const f=LMD[p.type];if(f){const[sx,sy]=iso(p.x,p.z);f(sx,sy,p);return}return _dp(p)};
function landmarks(mk){const L=[];if(!T.lm.on||!LMT[mk])return L;const E=AR_EXT+14,cand=[];for(let t=0;t<600&&cand.length<60;t++){const x=rnd(-E,E),z=rnd(-E,E),sd=sdist(POLY,x,z).s;if(sd>=T.lm.sd[0]&&sd<=T.lm.sd[1])cand.push([x,z])}
 cand.sort((a,b)=>a[0]+a[1]-b[0]-b[1]);const back=cand.slice(0,Math.max(6,cand.length>>1));
 for(const type of LMT[mk]){for(let t=0;t<40;t++){const c=back[Math.random()*back.length|0];if(!c||L.some(o=>Math.hypot(o.x-c[0],o.z-c[1])<T.lm.gap))continue;const p={type,x:c[0],z:c[1],r:2.5,solid:false,deco:true,lm:true,seed:Math.random()};L.push(p);props.push(p);break}}
 return L}
const _ba=buildArena;buildArena=function(mk,R){_ba(mk,R);S.lm=[];if(!MAIN.includes(mk))return;if(T.detail.on)bake(detail);
 const L=landmarks(mk);if(L.length)bake(()=>{L.sort((a,b)=>a.x+a.z-b.x-b.z).forEach(p=>{drawProp(p);p.baked=true})});S.lm=L;const tc=T.fx.tint[MAP.deco];if(T.fx.on&&tc&&tc[3]>0)bake(x=>{x.fillStyle=`rgba(${tc[0]},${tc[1]},${tc[2]},${tc[3]})`;x.fillRect(-floor.ox/FSC,-floor.oy/FSC,floor.width/FSC,floor.height/FSC)})};
// ================= 局中事件 =================
const TE=T.ev,TH=TUNE.hz;
const EV={
 site:{k:'beams',name:'钢梁雨',tip:'⚠ 钢梁雨！地面红框=坠落点',dur:()=>TE.site.n*TE.site.stagger+TH.beamWarn+1.5,
  start(){const SS=__v17.SS,al=cars.filter(c=>c.alive&&!c.dummy);for(let i=0;i<TE.site.n;i++){let x,z;if(al.length&&Math.random()<TE.site.aim){const c=al[Math.random()*al.length|0];x=c.x+c.vx*.9+rnd(-3,3);z=c.z+c.vz*.9+rnd(-3,3)}else{const p=openPt(2);if(p)[x,z]=p}
    if(x!=null&&sdist(POLY,x,z).s<-2)SS.push({k:'warn',x,z,a:Math.random()*Math.PI,t:-i*TE.site.stagger,T:TH.beamWarn})}sfx('zap')}},
 junk:{k:'magnet',name:'磁吊车',tip:'⚠ 磁吊车启动！被吸向中心，别扎堆',dur:()=>TE.junk.warn+TE.junk.dur,
  start(e){e.p=[ZC[0],ZC[1]];sfx('zap')},
  tick(e,dt){if(e.t<TE.junk.warn||e.t>TE.junk.warn+TE.junk.dur-.05)return;const f=Math.min(1,(e.t-TE.junk.warn)/.6);for(const c of cars){if(!c.alive||c.dummy)continue;const dx=e.p[0]-c.x,dz=e.p[1]-c.z,d=Math.hypot(dx,dz)||1;if(d>TE.junk.reach)continue;const a=TE.junk.pull*f*Math.min(1,d/6)*dt;c.x+=dx/d*a;c.z+=dz/d*a}},
  end(e){const[px,pz]=e.p;parts.push({k:'ring',x:px,z:pz,y:0,t:0,life:.5});spark(px,pz,18,'#9fe8ff');smoke(px,pz,6);debris(px,pz,8,'#6c7480');if(nearP(px,pz)>0)sfx('boom');if(nearP(px,pz)>.4){shake=Math.max(shake,9);vib('heavy')}
   for(const c of cars){if(!c.alive||c.dummy)continue;const dx=c.x-px,dz=c.z-pz,d=Math.hypot(dx,dz);if(d<TE.junk.blast){const f=1-d/TE.junk.blast,u=d>.1?[dx/d,dz/d]:[Math.cos(c.h),Math.sin(c.h)];c.vx+=u[0]*TE.junk.kick*(.4+f);c.vz+=u[1]*TE.junk.kick*(.4+f)}}}},
 desert:{k:'sink',name:'流沙塌陷',tip:'⚠ 流沙塌陷！出现新的流沙坑',dur:()=>TE.desert.dur,
  start(e){e.pits=[];for(let i=0;i<TE.desert.n;i++){const p=openPt(TH.sandR+1,6);if(p){const h={k:'sand',x:p[0],z:p[1],r:TH.sandR,temp:1};__v17.HZ.push(h);e.pits.push(h);parts.push({k:'ring',x:p[0],z:p[1],y:0,t:0,life:.6})}}sfx('zap')},
  end(e){const HZ=__v17.HZ;for(const h of e.pits){const i=HZ.indexOf(h);if(i>=0)HZ.splice(i,1)}}},
 ice:{k:'crack',name:'冰面开裂',tip:'⚠ 冰面开裂！红框=冰窟窿马上打开',dur:()=>TUNE.ice.warn+TUNE.ice.open+1.5,
  start(e){const HZ=__maps.HZ,TI=TUNE.ice;for(const h of HZ)if(h.k==='hole'&&h.ph==='shut'){h.ph='warn';h.T=TI.warn;h.t=0}
   e.tmp=[];for(let i=0;i<TE.ice.extra;i++){const p=openPt(TI.holeR+1.5,6);if(p&&HZ.every(a=>Math.hypot(a.x-p[0],a.z-p[1])>a.r+TI.holeR+3)){const h={k:'hole',x:p[0],z:p[1],r:TI.holeR,ph:'warn',t:0,T:TI.warn,temp:1,cr:Array.from({length:6},(_,j)=>{const a=j/6*Math.PI*2+rnd(-.3,.3);return[a,rnd(.55,1),a+rnd(-.5,.5)]})};HZ.push(h);e.tmp.push(h)}}sfx('zap')},
  tick(e){const HZ=__maps.HZ;for(const h of e.tmp)if(h.ph==='shut'&&e.t>1){const i=HZ.indexOf(h);if(i>=0)HZ.splice(i,1)}},
  end(e){const HZ=__maps.HZ;for(const h of e.tmp){const i=HZ.indexOf(h);if(i>=0)HZ.splice(i,1)}}},
 factory:{k:'reverse',name:'传送带换向',tip:'⚠ 传送带即将换向！',dur:()=>TE.factory.delay+2,
  start(){sfx('zap')},
  tick(e){if(!e.flip&&e.t>=TE.factory.delay){e.flip=1;const TF=TUNE.fac;for(const h of __maps.HZ){if(h.k==='belt'){h.dir*=-1;for(let i=0;i<6;i++)spark(h.x+rnd(-h.L/2,h.L/2),h.z,4,'#ffd23f')}else if(h.k==='pad'&&h.ph==='idle'){h.ph='warn';h.T=TF.warn;h.t=0}}ban('🔄 传送带换向！','#ffd23f');sfx('block')}}},
 ring:{k:'wind',name:'强风',tip:'💨 强风来袭！别被吹下擂台',dur:()=>TE.ring.dur,
  start(e){e.a=rnd(0,Math.PI*2);sfx('zap')},
  tick(e,dt){const f=Math.min(1,e.t/.8,(e.dur-e.t)/.8+.2)*TE.ring.wind*dt,wx=Math.cos(e.a)*f,wz=Math.sin(e.a)*f;for(const c of cars)if(c.alive&&!c.dummy){c.x+=wx;c.z+=wz}}},
 track:{k:'rain',name:'暴雨',tip:'🌧 暴雨！路面湿滑',dur:()=>TE.track.dur,start(){for(const c of cars){c._ig0=c.iceGrip;c.iceGrip=c.iceGrip*TE.track.gripMul}sfx('zap')},end(){for(const c of cars)if(c._ig0!==undefined){c.iceGrip=c._ig0;c._ig0=undefined}}}};
const _ta=terrainAt;terrainAt=function(x,z){const r=_ta(x,z);return r||(S.ev&&S.ev.k==='rain'&&running?'oil':r)};
function ban(txt,col,sub){S.banner={t:0,txt,col:col||'#ffd23f',sub}}
function evStart(mk){const d=EV[mk];if(!d)return;const e=S.ev={k:d.k,name:d.name,t:0,dur:d.dur(),d};d.start&&d.start(e);S.nEv++;ST.ev++;ST.names.push(d.k);ban(d.tip,'#ff9a3c');track('map_event',{map:mk,ev:d.k,t:Math.round(time)})}
function evEnd(){const e=S.ev;if(!e)return;e.d.end&&e.d.end(e);S.ev=null;S.next=time+rnd(...TE.gap)}
// ================= 补给空投 =================
const TD=T.drop;
function dropPos(){const PK=__v11.PK;for(let k=0;k<90;k++){const[x,z]=randIn(4);if(!inPoly(ZPOLY,x,z)||sdist(ZPOLY,x,z).s>-4||!openCell(x,z,2))continue;const[ci,cj]=cellOf(x,z);if(!GRID.ok[cj*GRID.n+ci])continue;
  if(PK.some(p=>Math.hypot(p.x-x,p.z-z)<8)||cars.some(c=>c.alive&&Math.hypot(c.x-x,c.z-z)<5))continue;const dp=player?Math.hypot(player.x-x,player.z-z):20;if(k<50&&(dp<TD.dist[0]||dp>TD.dist[1]))continue;return[x,z]}return null}
function dropSpawn(){const p=dropPos();if(!p)return;const ks=Object.keys(PKT);__v11.PK.push({k:ks[Math.random()*ks.length|0],x:p[0],z:p[1],t:0,life:TD.life,big:true});S.drops++;ST.drop++;ban('📦 补给空投！先到先得：双倍道具 + 护盾 + 金币','#ffd23f');sfx('good');track('drop_spawn',{map:mapKey})}
function dropGot(c,b){const ks=Object.keys(PKT),k2=ks[Math.random()*ks.length|0];__v11.applyPK(c,k2,'drop');c.shT=Math.max(c.shT||0,TD.shield);ft(c.x,c.z,5,'📦 空投到手！','#ffd23f',c.isP?30:22,c.isP);
 if(c.isP&&ST.dropP<TD.maxCoin){const v=TD.coins[0]+(Math.random()*(TD.coins[1]-TD.coins[0]+1)|0);save.coins+=v;persist();ST.coin+=v;ft(c.x,c.z,3.4,`+${v} 金币`,'#ffd23f',24,true);vib('hit')}else if(!c.isP)ST.dropAI++;if(c.isP)ST.dropP++;sfx('good');track('drop_get',{isP:!!c.isP,map:mapKey})}
// ================= 步进 =================
const NAMES={rock:'#a07850',cactus:'#5aa45a',barrel:'#ff9a3c',xbarrel:'#e23b3b',crate:'#b0763a',block:'#b7b1a4',scrap:'#6c7480',tires:'#2b2b30',snow:'#eef6ff',pine:'#2f7a45'};
let hitT=new WeakMap();
const _st=step;step=function(dt){const PK=__v11.PK,bigs=act()?PK.filter(p=>p.big).map(p=>({x:p.x,z:p.z,o:p,t:p.t,life:p.life})):[];if(act())for(const c of cars)c._pv=Math.hypot(c.vx,c.vz);_st(dt);if(!act())return;
 for(const b of bigs)if(PK.indexOf(b.o)<0){let w=null,bd=3.4;for(const c of cars)if(c.alive&&!c.dummy){const d=Math.hypot(c.x-b.x,c.z-b.z);if(d<bd){bd=d;w=c}}if(w)dropGot(w,b)}
 if(TE.on&&!S.ev&&S.nEv<TE.max&&time>=S.next&&player&&(player.lv||1)>=TE.minLv)evStart(MODE==='ring'?'ring':MODE==='race'?'track':mapKey);
 if(S.ev){S.ev.t+=dt;S.ev.d.tick&&S.ev.d.tick(S.ev,dt);if(S.ev.t>=S.ev.dur)evEnd()}
 if(TD.on&&MODE!=='race'&&time>=S.dropNext&&!PK.some(p=>p.big)){S.dropNext=time+rnd(...TD.gap);dropSpawn()}
 if(S.banner){S.banner.t+=dt;if(S.banner.t>2.8)S.banner=null}
 // 撞障碍：碎屑 + 尘土
 const H2=T.hit;if(MODE!=='ring')for(const c of cars){if(!c.alive||c.dummy||nearP(c.x,c.z)<=0)continue;const v=Math.max(c._pv||0,Math.hypot(c.vx,c.vz));if(v<H2.v||time-(hitT.get(c)||-9)<H2.cd)continue;
  for(const p of props){if(!p.solid||p.deco||p.type==='rail')continue;const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<p.r+c.r+.3){hitT.set(c,time);const col=NAMES[p.type]||'#9aa3ad',mx=(c.x+p.x)/2,mz=(c.z+p.z)/2;for(let i=0,N=Math.ceil(H2.dust*PM);i<N;i++)parts.push({k:'dust',x:mx+rnd(-.6,.6),z:mz+rnd(-.6,.6),y:.4,vx:rnd(-2,2),vz:rnd(-2,2),vy:rnd(.6,1.6),t:0,life:rnd(.5,.9),s:rnd(6,11),col:MAP.dust||'#c9bfa8'});debris(mx,mz,H2.deb,col);ST.hit++;break}}}
 // 世界固定的动态：烟囱冒烟、工厂火花
 S.fxT=(S.fxT||0)-dt;if(S.fxT<=0){S.fxT=T.fx.tick;for(const p of S.lm||[]){if(p.type==='chimney'&&nearP(p.x,p.z)>0&&parts.length<400*PM)parts.push({k:'smoke',x:p.x,z:p.z,y:190/HK,vx:rnd(.4,1.1),vz:rnd(.2,.8),vy:rnd(1.2,2.2),t:0,life:rnd(2,3),s:rnd(9,15),dark:false})}
  if(mapKey==='factory'&&MODE!=='ring'&&Math.random()<.5){const bs=(__maps.HZ||[]).filter(h=>h.k==='belt');if(bs.length){const h=bs[Math.random()*bs.length|0];if(nearP(h.x,h.z)>0)spark(h.x+(Math.random()<.5?-1:1)*h.L/2,h.z,3,'#ffb347')}}}};
// AI 抢空投
const _ai=aiThink;aiThink=function(c,dt){let o=_ai(c,dt);if(!act())return o;const b=__v11.PK.find(p=>p.big);if(!b)return o;const d=Math.hypot(b.x-c.x,b.z-c.z),t=c.ai&&c.ai.t;if(d<TD.aiRange+c.sk*TD.aiSk&&!(t&&t.alive&&Math.hypot(t.x-c.x,t.z-c.z)<5)){const l=d||1;return[(b.x-c.x)/l,(b.z-c.z)/l,false]}return o};
// ================= 绘制 =================
const _dt=drawTags;drawTags=function(){if(act()||__v11.PK.length){for(const p of __v11.PK)if(p.big){const[sx,sy]=iso(p.x,p.z),k=(time*1.2)%1,a=Math.min(1,(p.life-p.t)/2);ctx.save();ctx.globalAlpha=a;const g=ctx.createLinearGradient(0,sy-340,0,sy);g.addColorStop(0,'rgba(255,210,63,0)');g.addColorStop(1,'rgba(255,210,63,.5)');ctx.fillStyle=g;ctx.fillRect(sx-14,sy-340,28,340);ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.globalAlpha=a*(1-k);ctx.beginPath();ctx.ellipse(sx,sy,30+k*50,15+k*25,0,0,7);ctx.stroke();ctx.restore()}}
 const e=S.ev;if(e&&act()){if(e.k==='magnet'){const[sx,sy]=iso(e.p[0],e.p[1]),pull=e.t>=TE.junk.warn,bl=Math.sin(time*18)>0;ctx.save();ctx.lineWidth=3;ctx.strokeStyle=pull?'#9fe8ff':bl?'#ff3b3b':'#ffd23f';ctx.setLineDash([10,7]);ctx.beginPath();ctx.ellipse(sx,sy,TE.junk.reach*K*Math.SQRT2,TE.junk.reach*K*Math.SQRT2/2,0,0,7);ctx.stroke();ctx.setLineDash([]);
   const hy=sy-150;ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(sx,hy,34,15,0,0,7);ctx.fill();ctx.fillStyle=pull?'#7df9ff':'#c0392b';ctx.beginPath();ctx.ellipse(sx,hy-3,28,11,0,0,7);ctx.fill();ctx.fillStyle='#8a929c';ctx.fillRect(sx-5,hy-60,10,50);
   if(pull){ctx.strokeStyle='#e8ffff';ctx.lineWidth=2.2;for(let n=0;n<4;n++){ctx.beginPath();let x=sx+rnd(-22,22),y=hy+8;ctx.moveTo(x,y);while(y<sy-4){y+=rnd(14,24);x+=rnd(-14,14);ctx.lineTo(x,Math.min(y,sy))}ctx.stroke()}}ctx.restore()}
  else if(e.k==='reverse'&&!e.flip){const bl=Math.sin(time*14)>0;ctx.save();ctx.lineWidth=4;ctx.strokeStyle=bl?'#ff3b3b':'#ffd23f';for(const h of __maps.HZ)if(h.k==='belt'){ctx.beginPath();[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([a,b],i)=>{const p=iso(h.x+a*(h.L/2+.4),h.z+b*(h.w/2+.6));i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.stroke()}ctx.restore()}}
 if(MAP.zone&&MAP.zone.k==='ice'&&MODE!=='ring'&&act())glints();
 return _dt()};
function glints(){ctx.save();ctx.fillStyle='#ffffff';for(const g of gzones){const s=scr(g.x,g.z);if(s[0]<-120||s[0]>W+120||s[1]<-80||s[1]>H+80)continue;for(let i=0;i<2;i++){const ph=(time*.5+g.x*.13+i*.5)%1,a=Math.sin(ph*Math.PI),p=iso(g.x+Math.cos(g.z+i*3)*g.r*.5*(ph-.5)*2,g.z+Math.sin(g.x+i*2)*g.r*.4),r=2+4*a;ctx.globalAlpha=a*.9;ctx.beginPath();ctx.moveTo(p[0]-r*2,p[1]);ctx.lineTo(p[0],p[1]-r);ctx.lineTo(p[0]+r*2,p[1]);ctx.lineTo(p[0],p[1]+r);ctx.closePath();ctx.fill()}}ctx.restore()}
// 屏幕层：暗角 + 环境粒子 + 事件特效 + 横幅 + 空投箭头
let VIG=null,VK='';const AMB=[];const smokeSpr=(()=>{const c=mkC(48,48),x=c.getContext('2d'),g=x.createRadialGradient(24,24,2,24,24,24);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,48,48);return c})();
function vig(){const key=W+'x'+H+mapKey+MODE;if(VK===key)return VIG;VK=key;const w=Math.ceil(W/4),h=Math.ceil(H/4),c=mkC(w,h),x=c.getContext('2d'),F=T.fx,dk=MAP.deco;if(MAIN.indexOf(mapKey)<0){const tc=F.tint[MODE==='ring'?'ring':'track'];x.fillStyle=`rgba(${tc[0]},${tc[1]},${tc[2]},${tc[3]})`;x.fillRect(0,0,w,h)}
 let g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,`rgba(255,250,235,${F.sun})`);g.addColorStop(.5,'rgba(255,250,235,0)');g.addColorStop(1,`rgba(10,6,24,${F.sun*1.4})`);x.fillStyle=g;x.fillRect(0,0,w,h);
 g=x.createRadialGradient(w/2,h*.52,Math.min(w,h)*.38,w/2,h*.52,Math.hypot(w,h)*.56);g.addColorStop(0,'rgba(10,6,24,0)');g.addColorStop(1,`rgba(10,6,24,${F.vig})`);x.fillStyle=g;x.fillRect(0,0,w,h);return VIG=c}
function ambInit(){AMB.length=0;const n=Math.round(T.amb[MOBC2?'mob':'desk']*(QL==='low'?.5:1));for(let i=0;i<n;i++)AMB.push({x:Math.random(),y:Math.random(),s:Math.random(),v:.6+Math.random()*.8,ph:Math.random()*7})}
const AK={site:['dust','rgba(236,224,196,'],junk:['smoke','rgba(120,112,104,'],desert:['sand','rgba(255,236,190,'],ice:['snow','rgba(255,255,255,'],factory:['ember','rgba(255,160,60,'],ring:['ember','rgba(125,249,255,'],track:['dust','rgba(255,255,255,']};
function ambDraw(){const key=MODE==='ring'?'ring':MODE==='race'?'track':MAP.deco,[ty,col]=AK[key]||AK.site,w=W+80,h=H+80,par=T.amb.par;ctx.save();for(const p of AMB){let x,y;
  if(ty==='sand'){x=((p.x*w-time*(220+p.v*160)-camX*par)%w+w)%w-40;y=((p.y*h+Math.sin(time*.7+p.ph)*8-camY*par*.5)%h+h)%h-40;ctx.strokeStyle=col+(.18+.25*p.s)+')';ctx.lineWidth=1+p.s;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14+p.s*22,y+3);ctx.stroke()}
  else if(ty==='snow'){x=((p.x*w+Math.sin(time*.9+p.ph)*24-time*30-camX*par)%w+w)%w-40;y=((p.y*h+time*(30+p.v*30)-camY*par)%h+h)%h-40;ctx.fillStyle=col+(.55+.35*p.s)+')';ctx.beginPath();ctx.arc(x,y,1+p.s*1.8,0,7);ctx.fill()}
  else if(ty==='ember'){x=((p.x*w+Math.sin(time*1.3+p.ph)*14-camX*par)%w+w)%w-40;y=((p.y*h-time*(26+p.v*40)-camY*par)%h+h)%h-40;ctx.fillStyle=col+(.5+.4*Math.sin(time*6+p.ph))+')';ctx.fillRect(x,y,1.8+p.s*1.4,1.8+p.s*1.4)}
  else if(ty==='smoke'){x=((p.x*w+time*(8+p.v*6)-camX*par*.7)%w+w)%w-40;y=((p.y*h-time*(6+p.v*5)-camY*par*.7)%h+h)%h-40;const r=18+p.s*34;ctx.globalAlpha=.1+.07*p.s;ctx.drawImage(smokeSpr,x-r,y-r,r*2,r*2);ctx.globalAlpha=1}
  else{x=((p.x*w+time*(10+p.v*14)-camX*par)%w+w)%w-40;y=((p.y*h+Math.sin(time*.8+p.ph)*10-time*4-camY*par)%h+h)%h-40;ctx.fillStyle=col+(.25+.3*p.s)+')';ctx.beginPath();ctx.arc(x,y,.9+p.s*1.5,0,7);ctx.fill()}}ctx.restore()}
function evScreen(){const e=S.ev;if(!e)return;if(e.k==='rain'){ctx.save();ctx.fillStyle=`rgba(30,50,90,${.16*Math.min(1,e.t/.8,(e.dur-e.t)/.8+.2)})`;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(200,225,255,.55)';ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<T.ev.track.drops;i++){const x=((i*89.7+time*140)%(W+60))-30,y=((i*61.3+time*620*(1+i%3*.15))%(H+40))-20;ctx.moveTo(x,y);ctx.lineTo(x-5,y+16)}ctx.stroke();ctx.restore()}
 else if(e.k==='wind'){ctx.save();ctx.strokeStyle='rgba(220,250,255,.5)';ctx.lineWidth=2;const ca=Math.cos(e.a),sa=Math.sin(e.a);ctx.beginPath();for(let i=0;i<26;i++){const u=((i*131+time*520)%(W+160))-80,v=(i*53.1)%H;const x=ca>=0?u:W-u,y=v;ctx.moveTo(x,y);ctx.lineTo(x+ca*46,y+sa*46*.6)}ctx.stroke();ctx.restore()}}
function arrow(){const b=__v11.PK.find(p=>p.big);if(!b||!player)return;const s=scr(b.x,b.z),m=34;if(s[0]>m&&s[0]<W-m&&s[1]>m+30&&s[1]<H-m)return;const cx=W/2,cy=H/2,dx=s[0]-cx,dz=s[1]-cy,t=Math.min((W/2-m)/Math.abs(dx||1e-6),(H/2-m)/Math.abs(dz||1e-6)),x=cx+dx*t,y=cy+dz*t,a=Math.atan2(dz,dx),d=Math.hypot(b.x-player.x,b.z-player.z);
 ctx.save();ctx.translate(x,y);ctx.globalAlpha=.75+.25*Math.sin(time*8);ctx.rotate(a);ctx.fillStyle='#ffd23f';ctx.strokeStyle='#1b1420';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-8,-11);ctx.lineTo(-3,0);ctx.lineTo(-8,11);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-a);ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#1b1420';ctx.strokeText('📦 '+Math.round(d)+'m',-Math.cos(a)*6,-Math.sin(a)*6-16);ctx.fillStyle='#fff';ctx.fillText('📦 '+Math.round(d)+'m',-Math.cos(a)*6,-Math.sin(a)*6-16);ctx.restore()}
function banner(){const b=S.banner;if(!b)return;const k=b.t,a=Math.min(1,k/.15,(2.8-k)/.5),pop=k<.18?.7+k/.18*.3:1;ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(W/2,H*.26);ctx.scale(pop,pop);ctx.font='900 22px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const w=ctx.measureText(b.txt).width+36;ctx.fillStyle='rgba(20,12,30,.72)';ctx.beginPath();ctx.roundRect(-w/2,-20,w,40,20);ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#1b1420';ctx.strokeText(b.txt,0,1);ctx.fillStyle=b.col;ctx.fillText(b.txt,0,1);ctx.restore()}
const _r=render;render=function(){_r();if(!running&&!window.__liveAlways)return;ctx.setTransform(DPR,0,0,DPR,0,0);if(T.fx.on){const v=vig(),bh=Math.round(H*.2),bw=Math.round(W*.16),sh=v.height*.2|0,sw=v.width*.16|0;ctx.drawImage(v,0,0,v.width,sh,0,0,W,bh);ctx.drawImage(v,0,v.height-sh,v.width,sh,0,H-bh,W,bh);ctx.drawImage(v,0,sh,sw,v.height-2*sh,0,bh,bw,H-2*bh);ctx.drawImage(v,v.width-sw,sh,sw,v.height-2*sh,W-bw,bh,bw,H-2*bh)}if(!S.amb){S.amb=1;ambInit()}if(T.amb.on&&AMB.length)ambDraw();if(act()){evScreen();arrow();banner()}};
// ================= 开局 =================
const _s=start;start=function(k,opt){_s(k,opt);S={ev:null,next:time+rnd(...TE.first),nEv:0,dropNext:time+rnd(...TD.first),drops:0,banner:null,amb:0,lm:S.lm||[]};ST={ev:0,names:[],drop:0,dropP:0,dropAI:0,coin:0,hit:0};ambInit();S.amb=1;hitT=new WeakMap()};
window.__live={state:()=>({ev:S.ev&&S.ev.k,nEv:S.nEv,next:S.next,dropNext:S.dropNext,drops:S.drops,stats:ST,lm:(S.lm||[]).map(p=>p.type)}),stats:()=>ST,evStart:()=>evStart(MODE==='ring'?'ring':MODE==='race'?'track':mapKey),evEnd,get ev(){return S.ev},dropSpawn,dropPos,S:()=>S,EV,bake,detail,landmarks};
})();
