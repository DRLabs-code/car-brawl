// 录制宣传片原始帧：虚拟时钟逐帧推进，30fps，960x540@2x
const p=require('/tmp/pt/node_modules/puppeteer-core');const fs=require('fs');const W=ms=>new Promise(r=>setTimeout(r,ms));
const clip=process.argv[2],OUT='/workspace/car-brawl/promo/frames/'+clip+'/';fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const SPEC={
 crit:{segs:[{car:'beast',lv:1,dur:15}],god:true},
 cars:{segs:[{car:'tyrant',lv:1,dur:5.5},{car:'fang',lv:1,dur:5.5},{car:'beast',lv:1,dur:5.5}],god:true},
 melee:{segs:[{car:'tyrant',lv:12,dur:17}],god:true,big:true}}[clip];
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const pg=await b.newPage();pg.on('pageerror',e=>console.error('PAGEERR',e.message));
await pg.setViewport({width:960,height:540,deviceScaleFactor:2});
await pg.goto('http://localhost:8765/index.html');await W(2500);
await pg.evaluate(()=>{const g=__game;g.save.tutorialDone=true;g.save.tut=true;g.save.settings.mute=true;localStorage.setItem('carbrawl_save_v2',JSON.stringify(g.save))});
await pg.evaluateOnNewDocument(()=>{let T=0,q=[];const B=Date.now();performance.now=()=>T;Date.now=()=>B+T;window.requestAnimationFrame=f=>{q.push(f);return q.length};
 window.__adv=ms=>{T+=ms;const c=q;q=[];c.forEach(f=>{try{f(T)}catch(e){console.error(e)}})};});
await pg.reload();await W(3000);
await pg.evaluate(()=>{for(let i=0;i<60;i++)__adv(33.33);__game.save.tutorialDone=true;__game.save.tut=true;document.querySelectorAll('.panel').forEach(e=>e.classList.add('hide'));const s=document.createElement('style');s.textContent='#hud,#tutBox,#toast,#intro{display:none!important}';document.head.appendChild(s)});
let fi=0;
for(const sg of SPEC.segs){
 await pg.evaluate(sg=>{const g=__game;g.save.cars[sg.car].lv=sg.lv;g.matchThenStart?0:0;g.buildArena('site',g.arenaR(8));g.start(sg.car,{});document.querySelectorAll('.panel').forEach(e=>e.classList.add('hide'));
  for(let i=0;i<100;i++)__adv(33.33); // 跳过开场倒计时
  const P=g.player;const en=g.cars.filter(c=>c!==P);
  // 前 2 秒必有撞击：把一辆敌车摆在玩家正前方横着
  const e=en[0];const fx=Math.sin(P.h),fz=Math.cos(P.h);e.x=P.x+fx*7;e.z=P.z+fz*7;e.h=P.h+Math.PI/2;e.vx=e.vz=0;
  if(en[1]){en[1].x=P.x+fx*16+fz*4;en[1].z=P.z+fz*16-fx*4}
  window.__nd=0;window.__n=g.cars.length;},sg);
 const n=await pg.evaluate(()=>__n);console.error(clip,sg.car,'cars',n);
 const F=Math.round(sg.dur*30);
 for(let f=0;f<F;f++){
  await pg.evaluate((god,f)=>{const g=__game,P=g.player;if(god&&P.alive)P.hp=Math.max(P.hp,P.maxhp*.6);
   let best=null,bd=1e9;for(const c of g.cars)if(c!==P&&c.alive){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c}}
   if(best){const dx=best.x-P.x,dz=best.z-P.z,L=Math.hypot(dx,dz)||1;g.testInp=[dx/L,dz/L];if(L<12&&f-__nd>25){__nd=f;dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}));dispatchEvent(new KeyboardEvent('keyup',{code:'Space'}))}}
   else g.testInp=[0,0];
   // 敌人全灭则复活补位，保证全程有撞击
   if(g.cars.filter(c=>c.alive).length<2){}
   __adv(33.33);document.querySelectorAll('.panel').forEach(e=>e.classList.add('hide'))},!!SPEC.god,f);
  await pg.screenshot({path:OUT+String(fi++).padStart(4,'0')+'.jpg',type:'jpeg',quality:92});
 }
 const st=await pg.evaluate(()=>({alive:__game.cars.filter(c=>c.alive).length}));console.error('end',JSON.stringify(st));
}
await b.close()})();
