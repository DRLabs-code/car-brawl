// v13 自动化矩阵：node tests/matrix.js [desk|land|port|all] [baseURL]
// 两模式 × 三地图 × 三车 × 4/6/8 车；连续「再来一局」；监控 console 错误、NaN、卡车、FPS、内存、结算页溢出
const p=require('/tmp/pt/node_modules/puppeteer-core'),fs=require('fs');const W=ms=>new Promise(r=>setTimeout(r,ms));
const which=process.argv[2]||'all',URL=process.argv[3]||'http://localhost:8765/index.html',OUT=__dirname+'/out/';fs.mkdirSync(OUT,{recursive:true});
const VP={desk:{width:1280,height:720,deviceScaleFactor:1},land:{width:844,height:390,deviceScaleFactor:3,isMobile:true,hasTouch:true},port:{width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true}};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required','--enable-precise-memory-info']});
 const report={};
 for(const vn of which==='all'?Object.keys(VP):[which]){const pg=await b.newPage();await pg.setViewport(VP[vn]);const errs=[];pg.on('pageerror',e=>errs.push('pageerror: '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/favicon/.test(m.text()))errs.push('console: '+m.text())});
  await pg.goto(URL);await pg.evaluate(()=>localStorage.clear());await pg.reload();await W(1500);
  await pg.evaluate(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.tut=null;g.save.nick='矩阵测试';menu()});
  const games=[];const combos=[];
  if(vn==='desk'){for(const mode of['brawl','ring'])for(const map of mode==='ring'?['ring']:['site','junk','desert'])for(const car of['tyrant','fang','beast'])for(const lv of[1,5,10])combos.push({mode,map,car,lv});['site','junk','desert'].forEach((map,i)=>[1,5,10].forEach((lv,j)=>combos.push({mode:'team',map,car:['tyrant','fang','beast'][(i+j)%3],lv})))}
  else for(let i=0;i<10;i++)combos.push({mode:i%3===2?'ring':'brawl',map:i%3===2?'ring':['site','junk','desert'][i%3],car:['tyrant','fang','beast'][i%3],lv:[1,5,10][i%3],again:i>0&&i%3!==0});
  for(const [gi,c] of combos.entries()){
   await pg.evaluate(c=>{const g=__game;document.querySelector(`#modeSel [data-mode="${c.mode}"]`)?.click();g.save.cars[c.car].lv=c.lv;if(c.again&&!document.getElementById('result').classList.contains('hide')){mapKey=c.map;document.getElementById('again').click()}else{menu();matchThenStart(c.car,c.map)}},c);
   await W(c.again?2800:6200);
   // 观察 3 秒：NaN / 卡住 / FPS
   const obs=await pg.evaluate(async()=>{const g=__game,pos=g.cars.map(c=>[c.x,c.z]);let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});
    const nan=g.cars.filter(c=>[c.x,c.z,c.vx,c.vz,c.hp,c.h].some(v=>!Number.isFinite(v))).length,stuck=g.cars.filter((c,i)=>c.alive&&!c.isP&&Math.hypot(c.x-pos[i][0],c.z-pos[i][1])<1).length;
    return{n:g.cars.length,map:mapKey,mode:__v11.MODE,AR,fps:+(fr/3).toFixed(1),nan,stuck,camZ:+g.camZ.toFixed(3),heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null,timers:0}});
   // 结束：偶数局赢（撞毁其他车），奇数局输（玩家撞毁并放弃复活）
   const win=gi%2===0;await pg.evaluate(win=>{const g=__game;if(win){for(const c of g.cars)if(!c.isP&&c.alive)hurt(c,1e6,g.player)}else{g.player.invT=0;hurt(g.player,1e6,g.cars.find(c=>!c.isP&&c.alive))}},win);
   if(!win){await W(2300);await pg.evaluate(()=>document.getElementById('rvNo')?.click());await W(300);await pg.evaluate(()=>{const g=__game;for(const c of g.cars)if(!c.isP&&c.alive)hurt(c,1e6,null)})}
   await W(1500);
   const res=await pg.evaluate(()=>{const r=document.getElementById('result'),cd=r.querySelector('.rcard'),R=cd.getBoundingClientRect(),vis=!r.classList.contains('hide');
    const over=[...document.querySelectorAll('#result *')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&(b.right>innerWidth+1||b.left<-1)}).length;
    return{vis,fit:R.top>=-1&&R.bottom<=innerHeight+1,cardH:Math.round(R.height),vh:innerHeight,scroll:r.scrollHeight>r.clientHeight+2,hOver:over,hl:!document.getElementById('hl').classList.contains('hide'),meCrown:(document.querySelector('#rBoard .brow.me .bp')||{}).textContent==='👑',title:document.getElementById('rTitle').textContent}});
   games.push({...c,...obs,...res});if(gi===0||gi===combos.length-1)await pg.screenshot({path:OUT+`${vn}_result_${gi}.png`});
  }
  const heap=games.map(g=>g.heap).filter(Boolean);
  report[vn]={games,errs,heapStart:heap[0],heapEnd:heap[heap.length-1]};await pg.close()}
 fs.writeFileSync(OUT+'matrix-report.json',JSON.stringify(report,null,1));
 for(const vn in report){const r=report[vn],bad=r.games.filter(g=>!g.vis||g.nan||g.stuck>1||!g.fit||g.hOver||g.camZ<.8||g.camZ>1.1||(g.mode==='ring')!==(g.map==='ring')||(g.mode==='team'&&g.n!==({1:4,5:6,10:8})[g.lv]));
  console.log(`[${vn}] games=${r.games.length} errs=${r.errs.length} heap ${r.heapStart}→${r.heapEnd}MB fps min ${Math.min(...r.games.map(g=>g.fps))} avg ${(r.games.reduce((a,g)=>a+g.fps,0)/r.games.length).toFixed(1)} result-fit ${r.games.filter(g=>g.fit).length}/${r.games.length} problems=${bad.length}`);
  for(const g of bad)console.log('  ✗',JSON.stringify(g));for(const e of [...new Set(r.errs)].slice(0,10))console.log('  ERR',e)}
 await b.close()})();
