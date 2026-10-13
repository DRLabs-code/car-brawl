const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));
const D='/workspace/car-brawl/tests/v1shots/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const errs=[];const pg=await b.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.evaluateOnNewDocument(()=>{localStorage.setItem('x','1')});
for(const [vw,vh,tag] of [[390,844,'portrait'],[844,390,'landscape']]){
await pg.setViewport({width:vw,height:vh,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await pg.goto('http://localhost:8765/index.html?t='+Date.now());await W(2500);
await pg.evaluate(()=>{const g=__game;g.save.tutorialDone=true;g.save.tut=true});await pg.reload();await W(2500);
await pg.screenshot({path:D+tag+'_menu.png'});
for(const car of ['tyrant','fang','beast']){
 await pg.evaluate(c=>{const g=__game;g.buildArena('site',g.arenaR(8));g.start(c,{})},car);await W(3500);
 // autopilot toward nearest enemy
 await pg.evaluate(()=>{window.__ap=setInterval(()=>{const g=__game,P=g.player;if(!P||!P.alive)return;let best=null,bd=1e9;for(const c of g.cars)if(c!==P&&c.alive){const d=Math.hypot(c.x-P.x,c.z-P.z);if(d<bd){bd=d;best=c}}if(best){const dx=best.x-P.x,dz=best.z-P.z,L=Math.hypot(dx,dz)||1;g.testInp=[dx/L,dz/L]}},50)});
 await W(5000);await pg.screenshot({path:D+tag+'_battle_'+car+'.png'});
 const st=await pg.evaluate(()=>({alive:__game.cars.filter(c=>c.alive).length,n:__game.cars.length,kinds:[...new Set(__game.cars.map(c=>c.k))],hp:__game.player.hp|0}));console.log(tag,car,JSON.stringify(st));
 await pg.evaluate(()=>{clearInterval(__ap);__game.testInp=null});
}
// result screen
await pg.evaluate(()=>{const g=__game;g.player.hp=0;g.player.alive=false;try{g.finish(false)}catch(e){console.log(e)}});await W(3000);
await pg.screenshot({path:D+tag+'_result.png'});
const vis=await pg.evaluate(()=>!document.getElementById('result').classList.contains('hide'));console.log(tag,'result visible',vis);
const maps=await pg.evaluate(()=>{__game.openMaps&&__game.openMaps('beast');return document.querySelectorAll('#mapList .mapc').length});console.log(tag,'map cards',maps);
await pg.screenshot({path:D+tag+'_maps.png'});
const ad=await pg.evaluate(()=>new Promise(r=>{__game.showRewardedAd(ok=>r({ok,impl:AdAdapter.impl.name}),'test')}));console.log(tag,'ad',JSON.stringify(ad));
}
console.log('errors',JSON.stringify(errs));await b.close()})();
