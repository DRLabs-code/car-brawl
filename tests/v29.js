// v29 回归：node tests/v29.js [URL]  涂装扩充（30 色/13 拉花、各档价格与概率取自 TUNE.skin、传说/限定只能抽奖宝箱）、外观页稀有度页签（只显示当前页签、各页签保持滚动）、手机对局对手半分辨率贴图（玩家全分辨率）、新涂装 8 车 FPS、埋点
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v29/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{require('fs').mkdirSync(SH,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
 const open=async(vp,tag)=>{const g=await b.newPage();g.on('pageerror',e=>errs.push(tag+': '+e.message));g.on('dialog',d=>d.accept());await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
  await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;persist();hideAll();menu()});return g};
 // ===== 内容/价格/概率（桌面）=====
 const g=await open({width:1280,height:720},'desk');
 const c=await g.evaluate(()=>{const by=o=>Object.values(o).reduce((a,c)=>(a[c.rar||'n']=(a[c.rar||'n']||0)+1,a),{});const P=TUNE.skin.price;
  const sell=[...Object.entries(COLORS).map(([k,v])=>['col',k,v]),...Object.entries(LIVS).map(([k,v])=>['liv',k,v])];
  return{nc:Object.keys(COLORS).length,nl:Object.keys(LIVS).length,bc:by(COLORS),bl:by(LIVS),
   priceOk:sell.every(([t,k,v])=>v.lim?v.p===0&&P[t][k]===undefined:k==='gray'||(v.p>0&&v.p===P[t][k])),limRar:sell.every(([t,k,v])=>!v.lim||v.rar==='l'),
   spinW:POOL.find(q=>q.k==='liv').w===TUNE.skin.livSpin,odds:['legSpin','legChest','legPity','livSpin','livChest'].every(k=>typeof TUNE.skin[k]==='number')}});
 ok(c.nc===30&&c.bc.n===14&&c.bc.r===11&&c.bc.l===5,'颜色 30 款：纯色 14 / 图案 11 / 传说动态 5',c.bc);
 ok(c.nl===13&&c.bl.n===4&&c.bl.r===3&&c.bl.l===6,'拉花 13 款：基础 4 / 换色 3 / 限定 6',c.bl);
 ok(c.priceOk&&c.limRar,'普通/稀有价格取自 TUNE.skin.price；传说/限定不卖（价格 0、不在价目表）');ok(c.spinW&&c.odds,'抽奖拉花格权重与各概率取自 TUNE.skin');
 // 宝箱/抽奖：随机数打桩，确定性验证
 const ch=await g.evaluate(()=>{const s=__game.save,rr=Math.random;const lim=()=>Object.keys(LIVS).filter(l=>LIVS[l].lim&&s.livs[l]).length,leg=()=>Object.keys(COLORS).filter(k=>COLORS[k].lim&&s.colors[k]).length;
  const l0=lim(),g0=leg();Math.random=()=>0;const a=openChest();Math.random=rr;const l1=lim(),g1=leg();
  const t0=TUNE.skin.livChest;TUNE.skin.livChest=0;s.legPity=0;Math.random=()=>.999;openChest();Math.random=rr;TUNE.skin.livChest=t0;const l2=lim();
  const ev=JSON.parse(localStorage.getItem('carbrawl_track')).map(e=>e.event);return{liv:l1-l0,leg:g1-g0,noLiv:l2===l1,keys:Object.keys(a).filter(k=>/:/.test(k)),ev:ev.includes('lim_liv_get')&&ev.includes('legend_skin_get')}});
 ok(ch.liv===1&&ch.leg===1&&ch.noLiv&&ch.ev,'宝箱：按 livChest/legChest 出限定拉花/传说涂装，概率 0 时不出；埋点 lim_liv_get/legend_skin_get',ch);
 // 购买：稀有图案用金币，价格按 tune；传说只能去抽奖
 const buy=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const s=__game.save;s.coins=5000;persist();openGarage('beast');gTab='look';renderGarage();await S(300);
  document.querySelector('[data-ltab=r]').click();await S(100);document.querySelector('#garage [data-col=hex]').click();await S(300);const tb=document.querySelector('#tryBuy');tb&&tb.click();await S(300);
  const y=[...document.querySelectorAll('button')].find(b=>/确认|购买/.test(b.textContent)&&b.offsetParent&&b.id!=='tryBuy');y&&y.click();await S(400);const own=!!s.colors.hex,coins=s.coins;
  document.querySelector('[data-ltab=l]').click();await S(100);document.querySelector('#garage [data-col=galaxy]').click();await S(300);return{own,spent:5000-coins,price:TUNE.skin.price.col.hex,galBuy:!!document.querySelector('#tryBuy'),galGo:!!document.querySelector('#tryDaily'),owned:!!s.colors.galaxy}});
 ok(buy.own&&buy.spent===buy.price,'稀有图案「蜂巢」金币购买，扣费 = TUNE.skin.price',buy);ok(!buy.galBuy&&buy.galGo,'传说「星空」没有购买按钮，只有「每日抽奖/宝箱获得」',buy);
 await g.close();
 // ===== 外观页签 =====
 for(const vp of [{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:667,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:1280,height:720}]){const tag=vp.width+'x'+vp.height;const q=await open(vp,tag);
  const r=await q.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const s=__game.save;s.coins=99999;s.colors.camoJ=true;s.cars.beast.paint.color='camoJ';persist();__v18.LT=null;openGarage('beast');gTab='look';renderGarage();await S(300);
   const sc=e=>{for(;e;e=e.parentElement){const o=getComputedStyle(e).overflowY;if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight+2)return e}return null};const vis=()=>[...document.querySelectorAll('#garage [data-col],#garage [data-liv]')].filter(e=>e.offsetParent).map(e=>e.dataset.col?RAR0(e.dataset.col):'liv');
   window.RAR0=k=>COLORS[k].rar||'n';const tabs=[...document.querySelectorAll('#garage .ltabs .lt')].map(e=>e.textContent);const def=__v18.LT,v0=[...new Set(vis())];
   const go=async t=>{document.querySelector(`[data-ltab="${t}"]`).click();await S(150)};await go('n');const sn=sc(document.querySelector('#garage [data-col=red]'));sn.scrollTop=90;await S(50);const tn=sn.scrollTop;
   await go('liv');const sl=sc(document.querySelector('#garage [data-liv=band]'));sl.scrollTop=40;await S(50);const tl=sl.scrollTop;await go('n');const backN=sc(document.querySelector('#garage [data-col=red]')).scrollTop;await go('liv');const backL=sc(document.querySelector('#garage [data-liv=band]')).scrollTop;
   await go('n');document.querySelector('#garage [data-col=pink]').click();await S(400);const afterTry=sc(document.querySelector('#garage [data-col=red]')).scrollTop,stillN=__v18.LT==='n'&&[...new Set(vis())].join()==='n';
   const hN=sn.scrollHeight;return{tabs,def,v0,tn,tl,backN,backL,afterTry,stillN,hN,ev:JSON.parse(localStorage.getItem('carbrawl_track')).filter(e=>e.event==='look_tab').length}});
  ok(r.tabs.length===4&&/普通1\/14/.test(r.tabs[0])&&/稀有1\/11/.test(r.tabs[1])&&/传说0\/5/.test(r.tabs[2])&&/拉花0\/13/.test(r.tabs[3]),tag+' 4 个页签含已拥有/总数',r.tabs);
  ok(r.def==='r'&&r.v0.join()==='r',tag+' 默认打开当前颜色（迷彩）所在的稀有页签，只显示该页签',{def:r.def,v0:r.v0});
  ok(r.tn>=40&&r.tl>=20&&Math.abs(r.backN-r.tn)<=2&&Math.abs(r.backL-r.tl)<=2,tag+' 普通/拉花页签各自记住滚动位置',r);
  ok(r.stillN&&Math.abs(r.afterTry-r.tn)<=2,tag+' 页签内试穿（重渲染）后页签与滚动不变',{afterTry:r.afterTry,tn:r.tn,stillN:r.stillN});
  ok(r.ev>=3,tag+' 埋点 look_tab',r.ev);await q.screenshot({path:`${SH}v29_look_${tag}.png`});await q.close()}
 // ===== 半分辨率 + 新涂装 FPS =====
 for(const [tag,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){const q=await open(vp,tag);
  const r=await q.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const s=__game.save;s.colors.galaxy=true;s.livs.auroraStripe=true;s.cars.beast.paint={color:'galaxy',livery:'auroraStripe'};persist();
   const opp=['iri','checker','lava','leopard','hex','sakura','navy'];hideAll();MODE='brawl';__game.noEnd=true;buildArena('junk',arenaR(8));start('beast');await S(400);const cs=__game.cars.filter(c=>!c.isP);
   TUNE.skin.nearN=0;TUNE.skin.engageT=0;/* v30：这里只测对手默认档，升级见 v30.js */cs.forEach((c,i)=>{c.skinK=[opp[i%opp.length],i%2?'pinkBand':null];c.skin=battleSkin(c.k,...c.skinK,false)});for(const c of __game.cars){c.invT=99}
   let f=0;const t0=performance.now();await new Promise(res=>{const tick=()=>{f++;if(performance.now()-t0<4000)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)});const fps=f/((performance.now()-t0)/1000);
   const P=__game.player,uniq=new Set(__game.cars.map(c=>c.skin)),mb=[...uniq].reduce((a,o)=>a+o.width*o.height*4,0)/1048576,full=__game.cars.length*1152*1152*4/1048576;
   return{mobc:matchMedia('(pointer:coarse)').matches,pW:P.skin.width,oW:[...new Set(cs.map(c=>c.skin.width))],dyn:cs.some(c=>c.skin._dyn),opx:TUNE.skin.oppPx,fps:+fps.toFixed(1),mb:+mb.toFixed(1),fullMB:+full.toFixed(1),n:__game.cars.length}});
  if(tag==='mob')ok(r.mobc&&r.pW===1152&&r.oW.join()===String(r.opx)&&r.dyn,'手机：玩家全分辨率 1152²，对手默认档 oppPx²（v30 起 672²，动态涂装保留）',r);else ok(r.pW===1152&&r.oW.join()==='1152','桌面：全部全分辨率',r);
  if(tag==='mob'){const exp=(1152*1152*4+(r.n-1)*r.opx*r.opx*4)/1048576;ok(Math.abs(r.mb-exp)<.2&&r.mb<r.fullMB*.6,`手机：${r.n} 车对局贴图内存 = 1 张全分辨率 + ${r.n-1} 张对手档`,{mb:r.mb,exp:+exp.toFixed(1),full:r.fullMB})}
  ok(r.fps>=50,tag+' 8 车新涂装（星空/格旗/豹纹/蜂巢/幻彩/熔岩 + 拉花）FPS',r.fps);await q.screenshot({path:`${SH}v29_battle_${tag}.png`});await q.close()}
 ok(!errs.length,'无页面报错',errs.slice(0,3));await b.close();const f=L.filter(l=>l[0]==='✗').length;console.log(f?`FAIL ${f}`:'ALL OK');process.exit(f?1:0)})().catch(e=>{console.log('✗ 异常 '+e.stack);process.exit(1)});
