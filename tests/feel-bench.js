// 手感对比基准：node feel-bench.js <prototype目录> [标签]
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));
const dir=process.argv[2]||'/workspace/car-brawl/prototype',tag=process.argv[3]||'new';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const pg=await b.newPage();pg.on('pageerror',e=>console.error('PAGEERR',e.message));pg.on('console',m=>{if(m.type()==='error')console.error('CERR',m.text())});await pg.setViewport({width:844,height:390});await pg.goto('file://'+dir+'/index.html?t='+Date.now());await W(900);
const res={};
for(const car of ['beast','fang','tyrant']){
 const setup=async()=>pg.evaluate(car=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.buildArena('desert',g.arenaR(8));g.start(car,{});g.noEnd=true;
   const P=g.player;g.cars.forEach(c=>{if(c!==P){c.alive=false;c.x=c.z=9999}});g.props.length=0;g.POLY.length=0;g.POLY.push([-500,-500],[500,-500],[500,500],[-500,500]);if(g.GRID.reach.fill)g.GRID.reach.fill(1);window.__ctr=null;
   P.x=g.ZC[0];P.z=g.ZC[1]-14;P.vx=P.vz=0;P.h=0;P.hp=1e6;},car);
 // 驱动工具：在页面里逐帧运行控制器直到结束，按模拟时间计
 const run=(fn,arg)=>pg.evaluate((src,arg)=>new Promise(res=>{const g=__game,P=g.player,f=new Function('g','P','S','arg',src);const S={t0:g.time,arg};
   const tick=()=>{const t=g.time-S.t0;const r=f(g,P,S,arg);if(r!==undefined){g.testInp=[0,0];res(r)}else requestAnimationFrame(tick)};tick()}),fn.toString().replace(/^[^{]*{/,'').replace(/}$/,''),arg);
 await setup();await W(2600);// 等开场倒计时
 const top=await pg.evaluate(()=>__game.player.spd);
 // 1 起步：0→80% 极速
 const launch=await run(function(){const t=g.time-S.t0;g.testInp=[Math.sin(P.h0??(P.h0=P.h)),Math.cos(P.h0)];const sp=Math.hypot(P.vx,P.vz);if(sp>=P.spd*.8)return +t.toFixed(2);if(t>4)return 9});
 // 2 掉头：先全速直行 1.5s，再把方向推到正后方，计到"沿新方向速度 ≥60% 极速"
 await setup();await W(2500);
 const ut=await run(function(){const t=g.time-S.t0;if(!S.ph){g.testInp=[0,1];if(t>1.5){S.ph=1;S.t1=t;S.minF=0}return}
  g.testInp=[0,-1];S.minF=Math.min(S.minF,P.fwd);if(-P.vz>=P.spd*.6)return{t:+(t-S.t1).toFixed(2),wentReverse:S.minF<-1};if(t-S.t1>6)return{t:9,wentReverse:S.minF<-1}});
 // 3 静止推侧向：计到位移 5
 await setup();await W(2500);
 const side=await run(function(){const t=g.time-S.t0;if(S.x0===undefined){S.x0=P.x;S.z0=P.z}g.testInp=[1,0];if(Math.hypot(P.x-S.x0,P.z-S.z0)>=5)return +t.toFixed(2);if(t>5)return 9});
 // 4 S 弯：沿 z 前进，路点左右交替 ±5，每 9 单位一个
 await setup();await W(2500);
 const sb=await run(function(){const t=g.time-S.t0;if(!S.wp){S.wp=[];for(let i=1;i<=4;i++)S.wp.push([P.x+(i%2?5:-5),P.z+i*9]);S.i=0;S.flip=0;S.last=0;S.prevYaw=P.h}
  const w=S.wp[S.i],dx=w[0]-P.x,dz=w[1]-P.z,L=Math.hypot(dx,dz);if(L<2.5){S.i++;if(S.i>=S.wp.length)return{t:+t.toFixed(2),weave:S.flip}}
  g.testInp=[dx/L,dz/L];const yr=P.h-S.prevYaw;S.prevYaw=P.h;const sg=Math.sign(Math.round(yr*500));if(sg&&S.last&&sg!==S.last)S.flip++;if(sg)S.last=sg;if(t>12)return{t:99,weave:S.flip,reached:S.i}});
 // 5 冲刺净位移：全速 1.2s 后，比较 1.2s 内有/无冲刺的位移
 const dashRun=async withDash=>{await setup();await W(2500);return run(function(){const t=g.time-S.t0;g.testInp=[0,1];if(t>1.2&&!S.s){S.s=1;S.z1=P.z;S.t1=t;if(arg)window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}))}
   if(S.s&&t-S.t1>=1.2)return +(P.z-S.z1).toFixed(1)},withDash)};
 const dNo=await dashRun(false),dYes=await dashRun(true);
 // 6 冲刺撞靶：静止目标在前方 10，玩家起步 0.3s 后冲刺
 await setup();await W(2500);
 const hit=await run(function(){const t=g.time-S.t0;if(!S.v){S.v=g.cars.find(c=>c!==g.player);S.v.alive=true;S.v.x=P.x;S.v.z=P.z+12;S.v.vx=S.v.vz=0;S.v.h=Math.PI/2;S.v.hp=S.v.mhp=1e4;S.v.ai.hz=99;S.hp0=S.v.hp}
  g.testInp=[0,1];if(t>.3&&!S.d){S.d=1;window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}))}
  if(S.v.hp<S.hp0-.5&&!S.done){S.done=1;S.tH=t}if(S.done&&t-S.tH>.15)return{dmg:+(S.hp0-S.v.hp).toFixed(1),t:+S.tH.toFixed(2)};if(t>4)return{dmg:0}});
 res[car]={top:+top.toFixed(1),launch80:launch,uturn:ut,sideStart5:side,sBend:sb,dashNet:+(dYes-dNo).toFixed(1),dist12_noDash:dNo,dashHit:hit};
 console.error(tag,car,JSON.stringify(res[car]));}
require('fs').writeFileSync('/workspace/car-brawl/tests/feel-'+tag+'.json',JSON.stringify(res,null,1));await b.close()})();
