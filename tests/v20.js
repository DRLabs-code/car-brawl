// v20 车库可读性：node tests/v20.js [URL]  手机横屏 844×390 下部件图标/文字可见尺寸、碎片进度条缩小、无报错
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const vp of [{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:667,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:1280,height:720}]){const g=await b.newPage();const errs=[];g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);
 await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.shards.ram=7;persist();openGarage()});await W(700);
 await g.evaluate(()=>{const b=document.querySelector('#garage .pchip.ipc[data-id=spike]');b&&b.click()});await W(400);
 const m=await g.evaluate(()=>{const R=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null},F=s=>{const e=document.querySelector(s);return e?parseFloat(getComputedStyle(e).fontSize):0};
  const st=document.querySelector('#garage .gstage'),k=st.getBoundingClientRect().width/1200;
  return{k:+k.toFixed(3),slotIc:R('#garage .gopts .ic').width,craftIc:R('#garage .crow .ic').width,bar:R('#garage .crow .cbar').height,barW:R('#garage .crow .cbar').width,chip:F('#garage .pchip.ipc small')*k,name:F('#garage .crow .cmid b')*k,desc:F('#garage .crow .cmid small')*k,cmp:F('#garage .cmp')*k,
   over:[...document.querySelectorAll('#garage .gopts')].some(e=>e.scrollWidth>e.clientWidth+1)}});
 const tag=vp.width+'x'+vp.height;ok(m.slotIc>=36&&m.craftIc>=36,tag+' 部件图标可见 ≥36px',m);ok(m.chip>=8&&m.name>=10.5&&m.desc>=8&&m.cmp>=8,tag+' 名称/说明可见字号',{chip:m.chip.toFixed(1),name:m.name.toFixed(1),desc:m.desc.toFixed(1)});
 ok(m.bar/m.k<=6.5&&m.barW/m.k<=151,tag+' 碎片进度条缩小',{h:m.bar,w:m.barW});ok(!m.over,tag+' 部件行不溢出');ok(!errs.length,tag+' 无报错',errs);
 await g.screenshot({path:`/workspace/car-brawl/prototype/shots/v20/garage_${tag}.png`});await g.evaluate(()=>{const t=document.querySelector('[data-gtab="look"]');t&&t.click()});await W(400);await g.screenshot({path:`/workspace/car-brawl/prototype/shots/v20/garage_look_${tag}.png`});await g.close()}
await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
