// v25 回归：node tests/v25.js [URL]  涂装缓存 LRU：手机上限（≈25MB 内）、桌面上限、LRU 命中保留、8 车混合动态/图案涂装 FPS 不降
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [vn,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const g=await b.newPage();g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;for(const c in COLORS)s.colors[c]=true;persist()});
 const c=await g.evaluate(()=>{const ids=Object.keys(COLORS),ks=['tyrant','fang','beast'];SKIN.clear();const first=compose('fang','red',null);let n=0;for(const id of ids)for(const k of ks){compose(k,id,null);n++;if(n%3===0)compose('fang','red',null)}
  const mb=[...SKIN.values()].reduce((a,o)=>a+o.width*o.height*4,0)/1048576;return{mob:MOBC,max:SKIN_MAX,maxMB:SKIN_MB,tMB:TUNE.skin.cacheMobMB,tD:TUNE.skin.cacheDesk,size:SKIN.size,n,mb:+mb.toFixed(1),kept:SKIN.get('fang|red|')===first,dynMax:MOBC?TUNE.skin.dynCacheMob:TUNE.skin.dynCache}});
 if(vn==='mob')ok(c.mob&&c.maxMB===c.tMB&&c.mb<=c.maxMB&&c.mb+c.dynMax*0.15<=25,'手机涂装缓存上限 ≤25MB（整车贴图 + 动态格）',c);else ok(!c.mob&&c.max===c.tD&&c.size<=c.max,'桌面缓存上限 32',c);
 ok(c.kept,vn+' LRU：常用涂装不被淘汰',c.kept);
 // FPS：8 车全素灰 vs 混合动态/图案
 const f=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const fps=async()=>{let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});return+(fr/4).toFixed(1)};
  MODE='brawl';__game.noEnd=true;buildArena('site',arenaR(8));start('fang');await S(2500);const cs=__game.cars;cs.forEach(c=>c.skin=compose(c.k,'gray',null));await S(500);const a=await fps();
  const mix=['iri','chrome','neonFlow','lava','tiger','digi','camoJ','flame'];cs.forEach((c,i)=>c.skin=compose(c.k,mix[i%8],null));await S(500);const m=await fps();return{gray:a,mix:m,size:SKIN.size}});
 ok(f.mix>=Math.min(50,f.gray*.9),vn+' 8 车混合动态/图案涂装 FPS 不降',f);
 await g.screenshot({path:'/workspace/car-brawl/prototype/shots/v25/'+vn+'_mixskins.png'});await g.close()}
ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
