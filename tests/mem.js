// 内存回归：node tests/mem.js [URL] [局数]  连打 N 局（各模式/地图），每局后强制 GC 记录 JS 堆 + 各缓存大小；后半程堆增长 > 阈值判泄漏
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const N=+(process.argv[3]||24);
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc','--enable-precise-memory-info']});
 const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.setViewport({width:1280,height:720});await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await W(1500);
 await pg.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;persist()});
 const maps=['site','junk','desert','ice','factory'],rows=[];
 for(let i=0;i<N;i++){const mode=i%6===5?'race':i%6===4?'ring':'brawl',map=mode==='race'?'track':mode==='ring'?'ring':maps[i%5],car=['tyrant','fang','beast'][i%3];
  await pg.evaluate(([mode,map,car])=>{document.querySelector(`#modeSel [data-mode="${mode}"]`)?.click();menu();matchThenStart(car,map)},[mode,map,car]);await W(9000);
  await pg.evaluate(race=>{const g=__game;if(race){finish();return}for(const c of g.cars)if(!c.isP&&c.alive)hurt(c,1e6,g.player)},mode==='race');await W(2500);
  const r=await pg.evaluate(async()=>{for(let k=0;k<3;k++){gc();await new Promise(r=>setTimeout(r,100))}const H=window.HL||{};return{heap:+(performance.memory.usedJSHeapSize/1048576).toFixed(2),parts:parts.length,fts:fts.length,skin:SKIN.size,shc:SHC.size,hlFr:(H.fr||[]).length,hlEv:(H.evs||[]).length,pk:__v11.PK.length,mn:__items.MN.length,ls:(localStorage.getItem('carbrawl_track')||'').length}});
  rows.push({i,mode,map,...r});console.log(JSON.stringify(rows[rows.length-1]))}
 const h=rows.map(r=>r.heap),half=h.slice(N/2),grow=+(half[half.length-1]-half[0]).toFixed(2);console.log(`heap after GC: first ${h[0]} mid ${half[0]} end ${h[h.length-1]} 后半程增长 ${grow}MB errs=${errs.length}`);
 console.log((grow<1.5&&!errs.length?'✓':'✗')+' 后半程强制 GC 后堆增长 <1.5MB',grow);await b.close();process.exit(grow<1.5&&!errs.length?0:1)})();
