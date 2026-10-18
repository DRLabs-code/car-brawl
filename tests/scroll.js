// v27 回归：node tests/scroll.js [URL]  车库操作后保持滚动位置：外观页 试穿/还原/购买/装备、改装槽位 选部件/装备、合成页 合成/心愿；切页签时右栏回顶部
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v27/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const vp of [{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:667,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:1280,height:720}]){const tag=vp.width+'x'+vp.height;
 const g=await b.newPage();const errs=[];g.on('pageerror',e=>errs.push(e.message));g.on('dialog',d=>d.accept());await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.coins=99999;s.uni=999;for(const id of['spike','plow','ram','dozer','lightArmor','cage','stdEngine','road'])s.owned[id]=true;s.shards.saw=40;persist();openGarage('beast')});await W(700);
 // 工具：找到含某元素的滚动容器
 const H=`window.__sc=e=>{while(e&&e!==document.body){const cs=getComputedStyle(e);if(/auto|scroll/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight+2)return e;e=e.parentElement}return null};
  window.__vis=e=>{const s=__sc(e),a=e.getBoundingClientRect(),c=s.getBoundingClientRect();return a.bottom>c.top&&a.top<c.bottom}`;await g.evaluate(H);
 const act=async(desc,sel,click)=>g.evaluate(async(sel,click)=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const e=document.querySelector(sel);if(!e)return{miss:sel};const sc=__sc(e);e.scrollIntoView({block:'end'});sc.scrollTop+=20;await S(150);const t0=sc.scrollTop;const cols=()=>[...document.querySelectorAll('#garage .gcols>.gcol')];const ci=cols().indexOf(sc.closest('.gcols>.gcol')),gp=sc.classList.contains('gpane');
  (click?document.querySelector(click):e).click();await S(500);const e2=document.querySelector(sel);const sc2=e2?__sc(e2):(()=>{const c=cols()[ci];return gp?c.querySelector('.gpane'):c})();return{t0:Math.round(t0),t1:sc2?Math.round(sc2.scrollTop):-1,vis:e2?__vis(e2):'gone'}},sel,click).then(r=>{ok(r.t0>=10&&Math.abs(r.t1-r.t0)<=3&&r.vis,tag+' '+desc+' 后保持滚动位置',r);return r});
 await g.evaluate(()=>document.querySelector('[data-gtab=look]').click());await W(500);await g.evaluate(H);
 await act('试穿迷彩','#garage [data-col=camoJ]');
 await g.screenshot({path:SH+'look_try_'+tag+'.png'});
 await act('再试穿虎纹','#garage [data-col=tiger]');
 await act('还原试穿','#garage [data-col=tiger]','#tryX');
 await act('试穿后购买','#garage [data-col=digi]');
 await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector('#tryBuy')&&document.querySelector('#tryBuy').click();await S(300);const y=[...document.querySelectorAll('button')].find(b=>/确认|购买/.test(b.textContent)&&b.offsetParent&&b.id!=='tryBuy');y&&y.click();await S(500)});
 const bought=await g.evaluate(()=>({own:!!__game.save.colors.digi,t:Math.round(__sc(document.querySelector('#garage [data-col=digi]')).scrollTop),vis:__vis(document.querySelector('#garage [data-col=digi]'))}));ok(bought.own&&bought.t>20&&bought.vis,tag+' 购买确认后保持滚动位置',bought);
 await act('装备已购涂装','#garage [data-col=digi]');
 await act('点涂装（拉花）','#garage [data-liv=band]');
 // 改装槽位
 await g.evaluate(()=>{gOpen='front';renderGarage()});await W(300);await g.evaluate(H);
 await act('选中部件','#garage .gs.open .pchip[data-id=dozer]');
 await act('装备部件','#garage .gs.open .pchip[data-id=dozer]','#garage [data-eq]');
 // 合成页
 await g.evaluate(()=>{document.querySelector('[data-gtab=craft]').click()});await W(400);
 await act('设心愿','#garage [data-wish=tracks]');
 await act('合成','#garage [data-craft=saw]');
 await g.screenshot({path:SH+'craft_'+tag+'.png'});
 const tb=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const sc=__sc(document.querySelector('#garage .crow'));sc.scrollTop=200;document.querySelector('[data-gtab=look]').click();await S(400);const s2=__sc(document.querySelector('#garage [data-col]'));return s2?Math.round(s2.scrollTop):0});
 ok(tb===0,tag+' 切页签时右栏回顶部',tb);ok(!errs.length,tag+' 无报错',errs);await g.close()}
await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
