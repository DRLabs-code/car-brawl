// 性能基准：node tests/perf.js [URL] → 8 车 + 机关场景下每帧 step/render 耗时(ms)与 FPS、堆
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});const pg=await b.newPage();await pg.setViewport({width:1280,height:720});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await W(1500);const out={};
 for(const m of['site','junk','desert']){await pg.evaluate(m=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.save.cars.fang.lv=10;g.noEnd=true;__v11.MODE='brawl';buildArena(m,arenaR(8));start('fang',{});for(const c of g.cars)c.invT=999;if(m==='desert')__v17.STORM().next=0},m);await W(3000);
  out[m]=await pg.evaluate(async()=>{const R=render,S=step;let rt=0,st=0,n=0,sn=0;render=function(){const t=performance.now();R();rt+=performance.now()-t;n++};step=function(d){const t=performance.now();S(d);st+=performance.now()-t;sn++};
   const h0=performance.memory.usedJSHeapSize;let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<6000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});render=R;step=S;
   return{fps:+(fr/6).toFixed(1),renderMs:+(rt/n).toFixed(2),stepMs:+(st/sn).toFixed(3),heapMB:+(performance.memory.usedJSHeapSize/1048576).toFixed(1)}})}
 console.log(JSON.stringify(out),errs.length?'ERR '+errs[0]:'');await b.close()})();
