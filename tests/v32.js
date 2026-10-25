// v32 回归：node tests/v32.js [URL]  界面皮肤：emoji→SVG 图标、textContent 不变、点击高光、金币飞入、危险按钮、触控尺寸、无“真人/在线”字样、对局 FPS
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
 for(const [tag,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){
  const g=await b.newPage();g.on('pageerror',e=>errs.push(tag+': '+e.message));g.on('dialog',d=>d.accept());await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>{localStorage.clear();localStorage.setItem('carbrawl_menuGuide','1')});await g.reload();await W(1800);
  await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.coins=1234;s.cars.beast.lv=7;persist();menu()});await W(600);
  const ev=f=>g.evaluate(f);
  // 1 emoji → 图标：逐屏扫描，DOM 里不应再有裸 emoji/符号
  const SCAN=`(()=>{const re=/[\\u2190-\\u21ff\\u2300-\\u23ff\\u25a0-\\u27bf\\u2b00-\\u2bff\\u{1F000}-\\u{1FAFF}]/gu,o=[];const w=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(n.parentNode.closest('eg,.eg,script,canvas'))continue;const m=n.data.match(re);if(m)o.push(m.join(''))}return o})()`;
  const left=[],bad=[];let banned=[],ems=0;
  const screens=[['menu',()=>menu()],['garage',()=>{openGarage('beast')}],['craft',()=>document.querySelector('[data-gtab=craft]').click()],['slot',()=>{gOpen='front';renderGarage()}],['look',()=>{document.querySelector('[data-gtab=look]').click()}],['maps',()=>{menu();openMaps('beast')}],['daily',()=>{menu();openDaily()}],['dc',()=>{menu();openDC()}],['settings',()=>{menu();openSettings('menu')}]];
  for(const [n,f] of screens){await g.evaluate(f);await W(350);left.push(...(await g.evaluate(SCAN)).map(x=>n+':'+x));
   const r=await g.evaluate(()=>{const bad=[...document.querySelectorAll('.em use')].filter(u=>!document.querySelector(u.getAttribute('href'))).map(u=>u.getAttribute('href'));const t=[...document.querySelectorAll('.panel:not(.hide),#hud:not(.hide)')].map(e=>e.textContent).join('');return{bad,ban:/真人|在线/.test(t),em:document.querySelectorAll('.em').length}});bad.push(...r.bad);if(r.ban)banned.push(n);ems+=r.em}
  ok(!left.length,'各界面无裸 emoji/符号（全部换成 SVG 图标）',left.slice(0,8));ok(!bad.length,'所有 <use> 都指向存在的 symbol',bad.slice(0,5));ok(ems>40,'图标数量',ems);ok(!banned.length,'界面无“真人/在线”字样',banned);
  // 2 textContent 不变（emoji 保留在隐藏节点里，测试选择器/文本判断不受影响）
  await ev(()=>menu());await W(300);
  const tc=await ev(()=>({mode:document.querySelector('#modeSel [data-mode=brawl]').textContent,gar:document.getElementById('menuGarage').textContent,mute:document.getElementById('muteM').textContent,ico:__icons.names.length,vis:getComputedStyle(document.querySelector('#modeSel .em eg')).clip}));
  ok(tc.mode.includes('🚗')&&tc.mode.includes('乱斗'),'textContent 仍含原 emoji+文字',tc.mode);ok(/🔧/.test(tc.gar)&&/[🔊🔇🔈]/u.test(tc.mute),'侧栏/静音按钮 textContent 不变',[tc.gar,tc.mute]);ok(tc.ico>=55,'图标集数量',tc.ico);
  // 3 动态内容：toast 里的 emoji 也被替换；再次写入 textContent 仍替换
  const dy=await ev(async()=>{toast('🎁 测试 ✓');await new Promise(r=>setTimeout(r,80));const t=document.getElementById('toast');const a=t.querySelectorAll('.em').length;const m=document.getElementById('muteM');m.textContent='🔇';await new Promise(r=>setTimeout(r,50));return{toast:a,mute:m.querySelectorAll('.em').length,txt:m.textContent}});
  ok(dy.toast===2&&dy.mute===1&&dy.txt==='🔇','动态写入的 emoji 即时替换，textContent 保持',dy);
  // 4 点击高光 + 危险按钮 + 触控尺寸
  const rp=await ev(async()=>{const e=document.getElementById('mStart'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.left+20,clientY:r.top+10}));const on=e.classList.contains('rp');const pos=[e.style.getPropertyValue('--rx'),e.style.getPropertyValue('--ry')];await new Promise(r=>setTimeout(r,650));return{on,off:!e.classList.contains('rp'),pos}});
  ok(rp.on&&rp.off,'点击高光：按下加 .rp，动画结束自动移除',rp);
  const sz=await ev(()=>{const h=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().height):0};return{start:h('#mStart'),mode:h('#modeSel button'),side:h('#menuGarage'),mute:h('#muteM'),pause:h('#pauseBtn')}});
  const minH=tag==='mob'?36:40;ok(sz.start>=44&&sz.mode>=minH&&sz.side>=44&&sz.mute>=36,'菜单按钮触控高度',sz);
  await ev(()=>{__game.noEnd=true;matchThenStart('beast','site')});await W(7000);
  const dg=await ev(()=>{togglePause();return{q:document.getElementById('pQuit').classList.contains('danger'),h:Math.round(document.getElementById('pResume').getBoundingClientRect().height),pb:document.getElementById('pauseBtn').querySelectorAll('.em').length}});
  ok(dg.q&&dg.h>=40,"暂停页：退出为危险红按钮，继续≥40px（含面板缩放）",dg);await ev(()=>togglePause());
  // 5 金币飞入
  const fl=await ev(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));menu();await S(300);const n0=document.querySelectorAll('.flyc').length;flyCoins(document.getElementById('mStart'),6);await S(60);const a=document.querySelectorAll('.flyc i').length;await S(1700);const b=document.querySelectorAll('.flyc').length;
   const r0=document.querySelectorAll('.flyc').length;coinRoll(1000,1200);await S(60);const c=document.querySelectorAll('.flyc i').length;return{a,gone:b===0,coinRollFly:c>0,n0,max:Math.min(8,Math.max(3,6))}});
  ok(fl.a===6&&fl.gone&&fl.coinRollFly,'奖励金币飞入：数量受限、结束清理、coinRoll 增加时触发',fl);
  // 6 FPS（真实对局，图标层 + 观察器开启）
  await ev(()=>{menu();__game.noEnd=true;matchThenStart('beast','site')});await W(6500);
  const fps=await ev(async()=>{let f=0;const t0=performance.now();await new Promise(res=>{const tick=()=>{f++;if(performance.now()-t0<3500)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)});return +(f/((performance.now()-t0)/1000)).toFixed(1)});
  ok(fps>=50,'对局 FPS（图标观察器开启）',fps);await g.close()}
 ok(!errs.length,'无页面报错',errs.slice(0,3));await b.close();const f=L.filter(l=>l[0]==='✗').length;console.log(f?`FAIL ${f}`:'ALL OK');process.exit(f?1:0)})().catch(e=>{console.log('✗ 异常 '+e.stack);process.exit(1)});
