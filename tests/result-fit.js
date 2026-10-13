// 结算页/各界面真机视口适配：node tests/result-fit.js [URL]  卡片完整在可见区内且居中（含 iPhone 竖持旋转 + Safari 工具栏）
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const OUT='/workspace/car-brawl/prototype/shots/v15';
const VPS=[['desk',1280,720,1],['desk1080',1920,1080,1],['ip_por',390,844,3],['ip_por_bar',390,664,3],['ip_land',844,390,3],['ip_land_bar',750,340,3],['se_por',375,553,2],['and_land',915,412,2.6]];
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x?' '+JSON.stringify(x):''));
 for(const [tag,w,h,d] of VPS){const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.setViewport({width:w,height:h,deviceScaleFactor:d,isMobile:d>1,hasTouch:d>1});
  await pg.goto(URL);await ev0(pg);await W(1200);
  const inView=sel=>pg.evaluate(sel=>{const e=document.querySelector(sel);if(!e||e.offsetParent===null&&getComputedStyle(e).position!=='fixed')return null;const r=e.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;return{in:r.left>=-1&&r.top>=-1&&r.right<=vw+1&&r.bottom<=vh+1,cx:Math.abs((r.left+r.right)/2-vw/2)<12,cy:Math.abs((r.top+r.bottom)/2-vh/2)<12,r:[r.left|0,r.top|0,r.right|0,r.bottom|0]}},sel);
  for(const [name,fn,sel] of [['menu',()=>menu(),'#menu .mstart'],['garage',()=>openGarage('fang'),'#garage .gstage'],['settings',()=>{hideAll();show('settings',1)},'#settings .rcard'],['daily',()=>openDC(),'#dc .rcard, .dcw']]){
   try{await pg.evaluate(fn)}catch(e){}await W(500);const r=await inView(sel);if(r)ok(`${tag} ${name} 在可见区`,r.in,r.r);await pg.screenshot({path:`${OUT}/fit_${tag}_${name}.png`})}
  await pg.evaluate(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.tut=null;buildArena('site',arenaR(4));start('fang',{})});await W(1500);
  await pg.evaluate(()=>{const P=__game.player;for(const c of cars)if(c!==P&&!c.dummy){hurt(P,30,c);hurt(c,9999,P)}});await W(500);
  await pg.evaluate(()=>{const P=__game.player;for(const c of cars)if(c!==P&&c.alive&&!c.dummy)hurt(c,9999,P)});await W(2500);
  const r=await inView('#result .rcard');const fit=await pg.evaluate(()=>document.querySelector('#result .rcard').dataset.fit);
  ok(`${tag} 结算页一屏居中`,r&&r.in&&r.cx&&r.cy,{r,fit});await pg.screenshot({path:`${OUT}/fit_${tag}_result.png`});
  await pg.evaluate(()=>{const d=document.querySelector('#result details');d.open=true});await W(300);const r2=await inView('#result .rcard');ok(`${tag} 展开对手榜仍一屏`,r2&&r2.in,r2);
  ok(`${tag} 无报错`,!errs.length,errs);await pg.close()}
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
async function ev0(pg){await pg.evaluate(()=>localStorage.clear());await pg.reload()}
