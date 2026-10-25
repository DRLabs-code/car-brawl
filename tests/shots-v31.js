// node tests/shots-v31.js <before|after> [URL]  → prototype/shots/v31/<tag>_<map>_<mob|desk>.png
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const tag=process.argv[2]||'after',URL=process.argv[3]||'http://localhost:8765/index.html';const OUT='/workspace/car-brawl/prototype/shots/v31/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 for(const [vn,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){
  const g=await b.newPage();await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2000);
  await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.beast.lv=10;persist();menu()});
  for(const [mode,map] of [['brawl','site'],['brawl','junk'],['brawl','desert'],['brawl','ice'],['brawl','factory'],['ring','ring'],['race','track']]){
   await g.evaluate((mode,map)=>{__game.noEnd=true;document.querySelector(`#modeSel [data-mode="${mode}"]`)?.click();matchThenStart('beast',map)},mode,map);await W(9000);
   await g.screenshot({path:`${OUT}${tag}_${map}_${vn}.png`});await g.evaluate(()=>{try{finish()}catch(e){}menu()});await W(500)}
  await g.close()}
 await b.close()})();
