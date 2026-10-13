const p=require('/tmp/pt/node_modules/puppeteer-core');const D='/workspace/car-brawl/prototype/shots/flow/';const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage();await pg.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],log=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const shot=n=>pg.screenshot({path:D+n+'.png'});const ev=f=>pg.evaluate(f);const click=async s=>{const ok=await pg.evaluate(s=>{let e=document.querySelector(s);if(!e){const m=s.match(/data-sel="(\w+)"/);const tb=/data-(craft|fill|wish)/.test(s)?'craft':/data-(col|liv)/.test(s)?'look':null;if(m){const o=document.querySelector(`[data-open="${m[1]}"]`);o&&o.click()}if(tb){const t=document.querySelector(`[data-gtab="${tb}"]`);t&&t.click()}e=document.querySelector(s)}if(!e)return false;e.scrollIntoView({block:'center'});e.click();return true},s);if(!ok)throw new Error('missing '+s);await W(300)};
await pg.goto('http://localhost:8765/index.html');await ev(()=>localStorage.clear());await pg.reload();await W(2500);
log.push('启动后引导步骤: '+await ev(()=>__game.tut&&__game.tut.step));await shot('01_tut_move');
await pg.keyboard.down('KeyW');await W(1800);await pg.keyboard.up('KeyW');log.push('移动后: '+await ev(()=>__game.tut.step));
await pg.keyboard.press('Space');await W(900);log.push('冲刺后: '+await ev(()=>__game.tut.step));
await pg.keyboard.down('KeyS');await W(700);log.push('倒车中 fwd='+(await ev(()=>__game.player.fwd)).toFixed(2)+' rev='+await ev(()=>__game.player.rev));await shot('02b_tut_reverse');await W(900);await pg.keyboard.up('KeyS');log.push('倒车后步骤: '+await ev(()=>__game.tut.step));await shot('02_tut_crit');
for(let k=0;k<10&&await ev(()=>__game.tut.step)<4;k++){await ev(()=>{const c=__game.cars[0],d=__game.cars[1];c.x=d.x-5.5;c.z=d.z-5.5;c.h=Math.PI/4;c.vx=10;c.vz=10;c.dash=0});await W(900)}
log.push('撞侧面后: '+await ev(()=>__game.tut.step));await shot('03_tut_done');
await click('#tutGo');await shot('04_garage_guide');
await click('[data-craft="spike"]');await click('[data-sel="front"][data-id="spike"]');log.push('对比框: '+await ev(()=>document.querySelector('.cmpbox').innerText.replace(/\n/g,' ')));await shot('05a_compare');await click('.cmpbox [data-eq="front"][data-id="spike"]');log.push('装备: '+await ev(()=>JSON.stringify(__game.save.cars.beast.equip)));await shot('05_garage_equipped');
await click('#gGo');await shot('06_maps');
await pg.evaluate(()=>document.querySelectorAll('.mapc')[0].click());await W(1600);await shot('06b_matching');await W(3300);await shot('07_intro');log.push('车数: '+await ev(()=>__game.cars.length));
await W(2000);await pg.keyboard.down('KeyW');await W(2500);await pg.keyboard.up('KeyW');await pg.keyboard.down('KeyD');await W(1500);await shot('08_battle');log.push('昵称: '+await ev(()=>JSON.stringify(__game.cars.map(c=>c.nick)))+' 池='+await ev(()=>__game.NICKS.length));await pg.keyboard.up('KeyD');
await click('#pauseBtn');await shot('09_pause');await click('#pSet');await shot('10_settings');await click('#sClose');await click('#pResume');
await W(3000);await ev(()=>{__game.save.cars.beast.xp=45});await ev(()=>__game.finish());await W(2600);await shot('11_result');log.push('结算榜: '+await ev(()=>document.getElementById('rBoard').innerText.replace(/\n/g,' ')));
log.push('结算后: '+await ev(()=>JSON.stringify({lv:__game.save.cars.beast.lv,xp:__game.save.cars.beast.xp,coins:__game.save.coins,sh:__game.save.shards,uni:__game.save.uni})));
await click('#toGarage');await ev(()=>{__game.save.uni=40});await pg.evaluate(()=>__game.openGarage('beast'));await W(300);
await click('[data-pt="dmg"][data-d="1"]');log.push('加点: '+await ev(()=>JSON.stringify(__game.save.cars.beast.pts)));
await click('[data-craft="heavyArmor"]');await click('[data-sel="armor"][data-id="heavyArmor"]');await click('.cmpbox [data-eq="armor"]');
await ev(()=>{__game.save.owned.plow=true;__game.save.owned.saw=true});await pg.evaluate(()=>__game.openGarage('beast'));await W(300);await click('[data-sel="front"][data-id="saw"]');log.push('替换对比: '+await ev(()=>document.querySelector('.cmpbox').innerText.replace(/\n/g,' ')));await shot('12a_compare_replace');await click('.cmpbox [data-eq="front"]');
log.push('替换后: '+await ev(()=>JSON.stringify({front:__game.save.cars.beast.equip.front,spikeOwned:__game.save.owned.spike})));
await click('[data-sel="front"][data-id="saw"]');await click('.cmpbox [data-eq="front"][data-id=""]');log.push('卸下后: '+await ev(()=>__game.save.cars.beast.equip.front));
await click('[data-sel="front"][data-id="saw"]');await click('.cmpbox [data-eq="front"]');log.push('重装: '+await ev(()=>__game.save.cars.beast.equip.front));log.push('二次改装: '+await ev(()=>JSON.stringify({eq:__game.save.cars.beast.equip,uni:__game.save.uni})));const c0=await ev(()=>{__game.save.coins+=500;return __game.save.coins});await click('[data-col="red"]');await click('[data-liv="stripe"]');
log.push('买外观: '+await ev(()=>JSON.stringify({paint:__game.save.cars.beast.paint,coins:__game.save.coins,colors:__game.save.colors,livs:__game.save.livs}))+' 购前 '+c0);
await click('[data-col="blue"]');await click('[data-col="red"]');log.push('已拥有颜色再选不扣费: '+await ev(()=>__game.save.coins));
await ev(()=>{const g=document.querySelector('.gwrap');});await shot('12_garage_upgrade');
await click('#gReset');log.push('洗点: '+await ev(()=>JSON.stringify(__game.save.cars.beast.pts)));await click('[data-pt="hp"][data-d="1"]');
await click('#gGo');await pg.evaluate(()=>document.querySelectorAll('.mapc')[2].click());await W(7000);await pg.keyboard.down('KeyS');await W(2500);await pg.keyboard.up('KeyS');await shot('13_battle_desert');log.push('AI改装: '+await ev(()=>JSON.stringify(__game.cars.map(c=>c.eq.length))));
const fps=await ev(()=>new Promise(r=>{let n=0,t=performance.now();const f=()=>{n++;if(performance.now()-t<2000)requestAnimationFrame(f);else r(n/2)};f()}));log.push('fps(4车沙漠): '+fps);
// 8 车大场地
await ev(()=>{__game.save.cars.fang.lv=12;__game.buildArena('junk',66);__game.start('fang')});await W(3500);await pg.keyboard.down('KeyW');await W(2000);await pg.keyboard.up('KeyW');await shot('14_battle_junk_8cars');
log.push('Lv12 车数/AI部件数: '+await ev(()=>__game.cars.length+' '+JSON.stringify(__game.cars.map(c=>c.eq.length))));
const fps2=await ev(()=>new Promise(r=>{let n=0,t=performance.now();const f=()=>{n++;if(performance.now()-t<2000)requestAnimationFrame(f);else r(n/2)};f()}));log.push('fps(8车): '+fps2+' QL='+await ev(()=>__game.QL));
// 卡住测试：玩家顶着角落/窄道/车堆 3 秒
for(const m of ['site','junk','desert']){await pg.evaluate(m=>{__game.save.cars.fang.lv=12;__game.buildArena(m,66);__game.start('fang');__game.noEnd=true;__game.cars.forEach((c,i)=>{if(i){c.x=999;c.z=999;c.alive=false}})},m);await W(2300);
 const spots=await pg.evaluate(()=>{const P=__game.POLY,out=[];const v=P[0],n=P[1];// 角落：第一个顶点内 2.5
  const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length;let L=Math.hypot(cx-v[0],cz-v[1]);out.push({n:'corner',x:v[0]+(cx-v[0])/L*3,z:v[1]+(cz-v[1])/L*3,tx:v[0],tz:v[1]});
  const w=__game.props.filter(p=>p.wall);const a=w[Math.floor(w.length/2)];out.push({n:'pile',x:a.x+3.2,z:a.z+3.2,tx:a.x,tz:a.z});
  const b=w[0];out.push({n:'wallEnd',x:b.x-3,z:b.z+1,tx:b.x,tz:b.z});return out});
 for(const sp of spots){const r0=await pg.evaluate(sp=>{const c=__game.player;c.x=sp.x;c.z=sp.z;c.vx=c.vz=0;c.h=Math.atan2(sp.tx-sp.x,sp.tz-sp.z);c.stuckT=0;const L=Math.hypot(sp.tx-sp.x,sp.tz-sp.z);__game.testInp=[(sp.tx-sp.x)/L,(sp.tz-sp.z)/L];return __game.stuckLog.p},sp);
  await W(1200);await shot('30_stuck_'+m+'_'+sp.n);await W(2000);
  const r=await pg.evaluate(sp=>{__game.testInp=null;const c=__game.player;return{moved:Math.hypot(c.x-sp.x,c.z-sp.z).toFixed(1),unstick:__game.stuckLog.p}},sp);
  await pg.keyboard.down('KeyS');await W(1200);const rv=await ev(()=>{const c=__game.player;return c.fwd.toFixed(1)});await pg.keyboard.up('KeyS');
  log.push(`玩家卡点 ${m}/${sp.n}: 顶墙3.2s后位移 ${r.moved}，脱困触发 ${r.unstick-r0} 次，倒车速度 ${rv}`)}}
// AI 强制卡角测试：AI 顶在角落、目标在角落外侧
for(const m of ['site','junk','desert']){const r=await pg.evaluate(async m=>{__game.buildArena(m,66);__game.start('fang');__game.noEnd=true;await new Promise(r=>setTimeout(r,2400));const P=__game.POLY,v=P[0],cs=__game.cars;const cx=P.reduce((a,p)=>a+p[0],0)/P.length,cz=P.reduce((a,p)=>a+p[1],0)/P.length,L=Math.hypot(cx-v[0],cz-v[1]);
 const a=cs[1];a.x=v[0]+(cx-v[0])/L*2.6;a.z=v[1]+(cz-v[1])/L*2.6;a.h=Math.atan2(v[0]-a.x,v[1]-a.z);a.vx=a.vz=0;const p=cs[0];p.hp=1e6;p.x=v[0]-(cx-v[0])/L*0.1;p.z=v[1]-(cz-v[1])/L*.1;
 for(let i=2;i<cs.length;i++){cs[i].alive=false;cs[i].x=999}a.ai.t=p;a.ai.re=99;const b0=__game.stuckLog.ai,x0=a.x,z0=a.z;await new Promise(r=>setTimeout(r,4000));return{back:__game.stuckLog.ai-b0,moved:Math.hypot(a.x-x0,a.z-z0).toFixed(1)}},m);
 await shot('32_ai_corner_'+m);await ev(()=>{__game.noEnd=false});log.push('AI 卡角 '+m+': 自动倒车 '+r.back+' 次, 4s 位移 '+r.moved)}
// AI 寻路卡死检测（各图 20s，统计 3s 内位移<2 的次数）
for(const m of ['site','junk','desert']){await pg.evaluate(m=>{__game.save.cars.fang.lv=12;__game.buildArena(m,66);__game.start('fang');__game.cars[0].hp=1e6},m);await shot('20_overview_'+m);await W(2500);
 const r=await ev(()=>new Promise(res=>{let st=0,last=__game.cars.map(c=>[c.x,c.z]);let n=0;const iv=setInterval(()=>{__game.cars.forEach((c,i)=>{if(i&&c.alive&&Math.hypot(c.x-last[i][0],c.z-last[i][1])<2)st++});last=__game.cars.map(c=>[c.x,c.z]);if(++n>=6){clearInterval(iv);res(st)}},3000)}));await ev(()=>{__game.noEnd=false});const sl=await ev(()=>__game.stuckLog.ai);await shot('31_ai_'+m);log.push('AI 3s 位移<2 次数 '+m+': '+r+' / '+7*6+'，AI自动倒车脱困累计 '+sl)}
// 横屏
log.push('竖屏视口 rot='+await ev(()=>document.body.classList.contains('rot')));await shot('14b_portrait_rotated');
// 竖屏旋转下触摸摇杆：屏幕上向下拖 = 游戏画面向右
{const jb=await pg.$eval('#joy',e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});const cdp=await pg.target().createCDPSession();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jb[0],y:jb[1]}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:jb[0],y:jb[1]+40}]});await W(200);
 log.push('竖屏触摸(屏幕向下拖)→ 摇杆本地 '+await ev(()=>{const k=document.getElementById('knob').style.transform;return k}));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
await pg.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});await W(1200);log.push('横屏视口 rot='+await ev(()=>document.body.classList.contains('rot')));await shot('15_land_battle');
{const jb=await pg.$eval('#joy',e=>{const r=e.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]});const cdp=await pg.target().createCDPSession();
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:jb[0],y:jb[1]}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:jb[0]+40,y:jb[1]}]});await W(200);
 log.push('横屏触摸(向右拖)→ 摇杆本地 '+await ev(()=>document.getElementById('knob').style.transform));await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
await pg.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await W(800);
await ev(()=>{__game.finish()});await W(2500);await click('#back');await shot('16_land_menu');
// 损坏存档
await ev(()=>localStorage.setItem('carbrawl_save','{broken json'));await pg.reload();await W(2200);await shot('17_corrupt');
log.push('损坏后: '+await ev(()=>JSON.stringify({v:JSON.parse(localStorage.getItem('carbrawl_save')).v,backup:Object.keys(localStorage).filter(k=>k.includes('corrupt')).length,tut:!!__game.tut})));
// v1 迁移
await ev(()=>{localStorage.clear();localStorage.setItem('carbrawl_save_v1',JSON.stringify({cars:{fang:{lv:3,xp:10}},shards:{'尖刺(白)':4}}))});await pg.reload();await W(2000);
log.push('v1迁移: '+await ev(()=>JSON.stringify({fang:__game.save.cars.fang,sh:__game.save.shards.spike,v:__game.save.v})));
console.log(log.join('\n'));console.log('ERR',JSON.stringify(errs));await b.close()})();
