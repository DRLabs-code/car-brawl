// node tests/shots-v32.js <before|after> [URL] → prototype/shots/v32/<tag>_<screen>_<vp>.png  (全部界面，手机横屏 844x390 + 桌面 1280x720)
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const tag=process.argv[2]||'after',URL=process.argv[3]||'http://localhost:8765/index.html';const OUT='/workspace/car-brawl/prototype/shots/v32/';
require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 for(const [vn,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){
  const g=await b.newPage();g.on('dialog',d=>d.accept());await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>{localStorage.clear();localStorage.setItem('carbrawl_menuGuide','1')});await g.reload();await W(1800);
  const left=new Set();const shot=async n=>{await W(900);(await g.evaluate(()=>{const re=/[\u2190-\u21ff\u2300-\u23ff\u25a0-\u27bf\u2b00-\u2bff\u{1F000}-\u{1FAFF}]/gu,o=[];const w=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(n.parentNode.closest('.eg,script,canvas'))continue;const m=n.data.match(re);if(m)o.push(m.join('')+'@'+(n.parentNode.id||n.parentNode.className))}return o})).forEach(x=>left.add(n+':'+x));await g.screenshot({path:`${OUT}${tag}_${n}_${vn}.png`})};
  const ev=f=>g.evaluate(f);
  await shot('loading0');
  await ev(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.coins=1234;s.uni=12;s.cars.beast.lv=7;s.cars.beast.xp=40;s.shards.spike=3;s.shards.plow=6;s.owned.plow=true;persist();menu()});await shot('menu');
  await ev(()=>document.querySelector('#modeSel [data-mode="ring"]').click());await shot('menu_mode');
  await ev(()=>{openGarage('beast');document.querySelector('[data-gtab=look]').click()});await shot('garage_look');
  await ev(()=>{const e=document.querySelector('[data-ltab=liv]');e&&e.click()});await shot('garage_liv');
  await ev(()=>document.querySelector('[data-gtab=craft]').click());await shot('garage_craft');
  await ev(()=>{document.querySelector('[data-gtab=look]').click();gOpen='front';renderGarage()});await shot('garage_slot');
  await ev(()=>{gOpen=null;skinTry('color','red')});await shot('garage_trybar');
  await ev(()=>{skinTry(null);celebrate('合成成功','尖刺 已加入库存')});await shot('garage_celebrate');
  await ev(()=>{menu();document.querySelector('#modeSel [data-mode="brawl"]').click();openMaps('beast')});await shot('maps');
  await ev(()=>{menu();openDaily()});await shot('daily');
  await ev(()=>{menu();openDC()});await shot('dc');
  await ev(()=>{menu();openSettings('menu')});await shot('settings');
  await ev(()=>{menu();editNick()});await shot('nick');
  await ev(()=>{try{TextInput.close&&TextInput.close()}catch(e){}menu();toast('已装备 尖刺')});await shot('toast');
  await ev(()=>{__game.noEnd=true;matchThenStart('beast','site')});await shot('match');await W(6500);await shot('hud');
  await ev(()=>{__live.dropSpawn()});await shot('hud_event');
  await ev(()=>togglePause());await shot('pause');
  await ev(()=>openSettings('pause'));await shot('settings_pause');
  await ev(()=>{show('settings',0);togglePause();reviveHold()});await shot('revive');
  await ev(()=>{try{clearInterval(RV.tm)}catch(e){}show('revive',0);finish()});await W(1200);await shot('result');
  await ev(()=>menu());
  await ev(()=>{__game.noEnd=true;document.querySelector('#modeSel [data-mode="race"]').click();matchThenStart('beast','track')});await W(7500);await shot('hud_race');
  await ev(()=>{finish()});await W(1200);await shot('result_race');
  console.log(vn,'LEFTOVER',[...left].join(' | '));await g.close()}
 await b.close()})().catch(e=>{console.log(e);process.exit(1)});
