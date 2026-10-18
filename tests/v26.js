// v26 回归：node tests/v26.js [URL]  车库外观页色块/名称放大（手机 844×390、667×375 可见尺寸）、槽位只列已拥有部件 +「去合成 →」入口跳转定位、埋点、无报错 + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v26/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const vp of [{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:667,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:1280,height:720}]){const tag=vp.width+'x'+vp.height;
 const g=await b.newPage();const errs=[];g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.owned.spike=true;s.owned.ram=true;s.colors.flame=true;persist();openGarage()});await W(600);
 // 外观页尺寸
 const m=await g.evaluate(async()=>{document.querySelector('[data-gtab=look]').click();await new Promise(r=>setTimeout(r,400));const k=document.querySelector('#garage .gstage').getBoundingClientRect().width/1200;
  const sw=[...document.querySelectorAll('#garage .sw2')].filter(e=>e.offsetParent)/* v29 只量当前页签 */,lv=[...document.querySelectorAll('#garage .lv2')],box=document.querySelector('#garage .swatches');
  const fs=e=>parseFloat(getComputedStyle(e).fontSize)*k;
  return{k:+k.toFixed(3),n:sw.length,ic:Math.min(...sw.map(e=>e.querySelector(':scope>i').getBoundingClientRect().width)),name:Math.min(...sw.map(e=>fs(e.querySelector('small')))),st:Math.min(...sw.map(e=>fs(e.querySelector('em')))),lv:Math.min(...lv.map(fs)),
   cut:sw.filter(e=>{const s=e.querySelector('small');return s.scrollWidth>s.clientWidth+1}).map(e=>e.dataset.col),over:box.scrollWidth>box.clientWidth+1,price:Math.min(...[...document.querySelectorAll('#garage .swatches em .ic b')].map(fs)),coin:Math.max(...sw.map(e=>{const i=e.querySelector('em .ic i');return i?i.getBoundingClientRect().width:0}))}});
 ok(m.ic>=36&&m.name>=11&&m.st>=11&&m.lv>=11&&m.price>=11,tag+' 外观页色块图标 ≥36px、名称/说明/价格/涂装 实际 ≥11px',m);ok(!m.over&&!m.cut.length,tag+' 色块不溢出、名称不截断',m.cut);ok(m.coin/m.k<=23,tag+' 价格金币图标未被放大',m.coin);
 await g.screenshot({path:SH+'garage_look_'+tag+'.png'});await g.evaluate(()=>{const e=document.querySelector('#garage .rarh.rar-l');e&&e.scrollIntoView({block:'start'})});await W(300);await g.screenshot({path:SH+'garage_look2_'+tag+'.png'});
 // 槽位只列已拥有 + 去合成
 const s=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));gOpen='front';renderGarage();await S(300);
  const ids=[...document.querySelectorAll('#garage .gs.open .pchip[data-sel]')].map(e=>e.dataset.id).filter(Boolean),all=Object.keys(PARTS).filter(i=>PARTS[i].slot==='front'),gc=document.querySelector('#garage .gs.open [data-gocraft]');
  return{ids,allOwned:ids.every(i=>__game.save.owned[i]),lock:document.querySelectorAll('#garage .gs.open .pchip.lock').length,gc:gc?gc.textContent:'',nUn:all.filter(i=>!__game.save.owned[i]).length}});
 ok(s.ids.length===2&&s.allOwned&&!s.lock,tag+' 槽位只显示已拥有部件',s);ok(/去合成/.test(s.gc)&&s.gc.includes(String(s.nUn)),tag+' 槽位有「去合成 →」入口（显示未拥有件数）',s.gc);
 await g.screenshot({path:SH+'garage_slot_'+tag+'.png'});
 const j=await g.evaluate(async()=>{document.querySelector('#garage .gs.open [data-gocraft]').click();await new Promise(r=>setTimeout(r,500));const f=document.querySelector('#garage .crow.flash'),pr=document.querySelector('#garage .gcols>.gcol:last-child').getBoundingClientRect(),fr=f&&f.getBoundingClientRect();
  return{tab:gTab,flash:f?f.textContent.slice(0,8):'',inView:!!fr&&fr.top>=pr.top-2&&fr.bottom<=pr.bottom+2,ev:JSON.parse(localStorage.getItem('carbrawl_track')||'[]').filter(e=>e.event==='garage_gocraft').map(e=>e.props||e)}});
 ok(j.tab==='craft'&&j.flash&&j.inView,tag+' 去合成 → 切到碎片合成页并定位高亮该槽位未拥有部件',j);ok(j.ev.length===1,tag+' 埋点 garage_gocraft',j.ev);
 await g.screenshot({path:SH+'garage_gocraft_'+tag+'.png'});
 // 装备中的部件即使未拥有（旧存档）也仍显示
 const k2=await g.evaluate(async()=>{const s=__game.save;s.cars.beast.equip.front='saw';persist();gOpen='front';gTab='look';renderGarage();await new Promise(r=>setTimeout(r,200));return !!document.querySelector('#garage .gs.open .pchip[data-id=saw]')});ok(k2,tag+' 当前装备件始终显示');
 ok(!errs.length,tag+' 无报错',errs);await g.close()}
await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
