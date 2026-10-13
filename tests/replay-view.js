// 再来一局镜头/画布回归测试：node replay-view.js <prototype目录> <标签>
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));
const dir=process.argv[2],tag=process.argv[3],D='/workspace/car-brawl/prototype/shots/replay/';require('fs').mkdirSync(D,{recursive:true});
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});let fail=0;const out=[];
for(const [vw,vh,dpr,mob] of [[844,390,3,1],[390,844,3,1],[1280,720,1,0]]){const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.setViewport({width:vw,height:vh,deviceScaleFactor:dpr,isMobile:!!mob,hasTouch:!!mob});await pg.goto('file://'+dir+'/index.html?t='+Date.now());await W(900);const vt=`${vw}x${vh}`;
 await pg.evaluate(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.persist&&g.persist()});
 const st=()=>pg.evaluate(()=>{const g=__game,c=document.getElementById('cv');return{cv:c.width+'x'+c.height,css:c.style.width+'x'+c.style.height,dpr:g.DPR??null,Z:g.Z!=null?+g.Z.toFixed(3):null,camZ:+(g.camZ??1).toFixed(3)}});
 const play=async()=>{await W(2600);// 开场
   await pg.evaluate(()=>{__game.time=80;window.dispatchEvent(new KeyboardEvent('keydown',{code:'Space'}))});await W(250);// 局末冲刺
   await pg.evaluate(()=>__game.finish(true));await W(1200)};
 const rec=async(n)=>{await W(5200);const s=await st();await pg.screenshot({path:D+`${tag}_${vt}_${n}.png`});out.push({tag,vt,n,...s});if(!(s.camZ>=.85&&s.camZ<=1.1))fail++;};
 await pg.evaluate(()=>{const g=__game;g.buildArena('site',g.arenaR(4));g.start('beast',{})});await W(300);const s0=await st();out.push({tag,vt,n:'g1',...s0});await pg.screenshot({path:D+`${tag}_${vt}_g1.png`});
 await play();
 for(let i=2;i<=4;i++){await pg.evaluate(()=>document.getElementById('again').click());await rec('g'+i);await play()}
 // 结算 → 车库 → 出战
 await pg.evaluate(()=>{const b=[...document.querySelectorAll('#result button')].find(x=>x.textContent.includes('车库'));b&&b.click()});await W(500);
 await pg.evaluate(()=>document.getElementById('gGo').click());await W(400);await pg.evaluate(()=>document.querySelector('.mapc').click());await rec('garage');await play();
 // 看广告翻倍 → 再来一局
 await pg.evaluate(()=>{const b=document.getElementById('rDouble');b&&b.click()});await W(4500);await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/领取|好的|关闭/.test(x.textContent)&&x.offsetParent);b&&b.click()});await W(400);
 await pg.evaluate(()=>document.getElementById('again').click());await rec('afterAd');
 if(errs.length){console.error('PAGEERR',errs);fail++}await pg.close()}
for(const o of out)console.log(JSON.stringify(o));console.log(tag,'FAIL',fail);require('fs').writeFileSync(`/workspace/car-brawl/tests/replay-${tag}.json`,JSON.stringify(out,null,1));await b.close()})();
