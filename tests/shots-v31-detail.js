// node tests/shots-v31-detail.js [URL] → landmark_/event_/drop_ 特写（手机横屏）
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const OUT='/workspace/car-brawl/prototype/shots/v31/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const g=await b.newPage();await g.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2000);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.beast.lv=10;persist();menu()});
 for(const [mode,map] of [['brawl','site'],['brawl','junk'],['brawl','desert'],['brawl','ice'],['brawl','factory'],['ring','ring'],['race','track']]){
  await g.evaluate((mode,map)=>{__game.noEnd=true;document.querySelector(`#modeSel [data-mode="${mode}"]`)?.click();matchThenStart('beast',map)},mode,map);await W(5000);
  const lm=await g.evaluate(()=>{const l=__live.S().lm[0];if(!l)return 0;const P=__game.player;P.x=l.x+9;P.z=l.z;P.vx=P.vz=0;return 1});
  if(lm){await W(1200);await g.screenshot({path:`${OUT}landmark_${map}_mob.png`})}
  await g.evaluate(()=>{__game.player.invT=999;__live.evStart()});await W(1400);await g.screenshot({path:`${OUT}event_${map}_mob.png`});
  if(map==='site'){await g.evaluate(()=>{__live.evEnd();__live.dropSpawn()});await W(900);await g.screenshot({path:`${OUT}drop_mob.png`})}
  await g.evaluate(()=>{try{finish()}catch(e){}menu()});await W(500)}
 await b.close()})();
