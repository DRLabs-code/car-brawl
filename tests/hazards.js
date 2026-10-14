// v17 地图机关回归：node tests/hazards.js [URL]
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html',OUT='/workspace/car-brawl/prototype/shots/v17';
(async()=>{require('fs').mkdirSync(OUT,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x!==''?' '+JSON.stringify(x):''));
 for(const [tag,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const pg=await b.newPage();await pg.setViewport(vp);const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1200);
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;__v11.MODE='brawl';window.__ev=[];const t=window.track;window.track=(e,p)=>{__ev.push(e);t(e,p)}});
 for(const m of tag==='desk'?['site','junk','desert']:['site','junk','desert']){for(const n of tag==='desk'?[4,8]:[6]){
  await ev(([m,n])=>{const g=__game;g.noEnd=true;buildArena(m,arenaR(n));start('fang',{opps:undefined});for(const c of g.cars)c.invT=99},[m,n]);await W(2600);
  const s=await ev(()=>{const HZ=__v17.HZ,BR=__v17.BR,inHz=(x,z)=>HZ.some(h=>Math.hypot(h.x-x,h.z-z)<h.r+1);let spBad=0,pkBad=0,pkUn=0;for(let i=0;i<20;i++){for(const q of spawnPts(cars.length))if(inHz(q[0],q[1]))spBad++}
   for(let i=0;i<200;i++){__v11.PK.length=0;__v11.pkSpawn();const q=__v11.PK[0];if(!q)continue;if(inHz(q.x,q.z))pkBad++;const[a,b]=cellOf(q.x,q.z);if(!GRID.reach[b*GRID.n+a])pkUn++}__v11.PK.length=0;
   const brUn=BR.filter(o=>{const r=findPath(cars[0].x,cars[0].z,o.x+o.r+2,o.z);return!r}).length;return{map:mapKey,hz:HZ.map(h=>h.k),br:BR.length,spBad,pkBad,pkUn,brUn,aliveStart:cars.every(c=>c.alive)}});
  const need={site:0,junk:1,desert:2}[m];ok(`${tag} ${m} ${n}车 机关布置/出生点与道具点可达`,s.hz.length>=need&&s.br>=3&&!s.spBad&&!s.pkBad&&!s.pkUn&&s.aliveStart,s);
  if(n===(tag==='desk'?8:6)){
   // 机关演示截图
   await ev(()=>{const g=__game,P=g.player;if(mapKey==='site'){__v17.SS.push({k:'warn',x:P.x+6,z:P.z+2,a:.6,t:.9,T:1.5})}if(mapKey==='desert'){__v17.STORM().next=time;const s=__v17.HZ.find(h=>h.k==='sand');if(s){P.x=s.x-s.r-3;P.z=s.z+3;resetView()}}const h=__v17.HZ.find(h=>h.k==='crush');if(h){P.x=h.x-h.r-4;P.z=h.z+2;h.ph='close';h.t=.2}const o=__v17.BR[0];if(o&&!h&&mapKey!=='site'){P.x=o.x-4;P.z=o.z}});await W(m==='desert'?1600:450);
   await pg.screenshot({path:`${OUT}/${tag}_${m}_hazard.png`});
  }}
  // 行为测试（桌面）
  if(tag==='desk'){
   const r=await ev(async m=>{const g=__game,P=g.player,E=g.cars.find(c=>!c.isP);const out={};for(const c of g.cars){c.invT=0;c.shT=0}
    if(m==='site'){const k0=kills;E.hp=E.maxhp=40;E.vx=E.vz=0;E.lastBy=P;E.lastByT=time;__v17.SS.push({k:'warn',x:E.x,z:E.z,a:0,t:1.45,T:1.5});E.ai.hz=5;await new Promise(r=>setTimeout(r,300));out.beamKill=!E.alive;out.credit=kills-k0;out.hl=HL.evs.some(e=>e.txt==='机关击杀！'&&e.s>=160)}
    if(m==='junk'){const h=__v17.HZ.find(h=>h.k==='crush');const k0=kills;E.x=h.x;E.z=h.z;E.vx=E.vz=0;E.ai.hz=5;E.lastBy=P;E.lastByT=time;h.ph='close';h.t=.45;await new Promise(r=>setTimeout(r,300));out.crushKill=!E.alive;out.credit=kills-k0}
    if(m==='desert'){const h=__v17.HZ.find(h=>h.k==='sand');P.x=h.x+h.r-.5;P.z=h.z;P.vx=P.vz=0;const d0=Math.hypot(P.x-h.x,P.z-h.z);await new Promise(r=>setTimeout(r,600));out.pull=+(d0-Math.hypot(P.x-h.x,P.z-h.z)).toFixed(2);out.storm=__v17.STORM().on}
    // 油桶：玩家高速撞上 → 爆炸伤害附近敌人
    const o=__v17.BR.find(o=>o.type==='xbarrel');if(o){const F=g.cars.filter(c=>!c.isP&&c.alive)[0];if(F){F.x=o.x+3;F.z=o.z;F.vx=F.vz=0;F.invT=0}const h0=F?F.hp:0;P.x=o.x-o.r-P.r-.3;P.z=o.z;P.vx=12;P.vz=0;await new Promise(r=>setTimeout(r,250));out.barrelGone=!__v17.BR.includes(o);out.barrelDmg=F?Math.round(h0-F.hp):-1}
    const cr=__v17.BR.find(o=>o.type==='crate');if(cr){const c0=g.save.coins,rr=Math.random;Math.random=()=>.1;__v17.breakIt(cr,P);Math.random=rr;out.crateCoin=g.save.coins-c0}
    return out},m);
   const okm={site:r.beamKill&&r.credit===1&&r.hl,junk:r.crushKill&&r.credit===1,desert:r.pull>.3&&r.storm}[m];ok(`desk ${m} 机关效果+击杀归属/集锦加权`,okm&&r.barrelGone&&r.barrelDmg>5&&r.crateCoin>0,r);
   // AI：40 秒自然对局，看躲避与利用
   const ai=await ev(async()=>{const g=__game;g.noEnd=true;for(const c of g.cars)c.invT=0;g.player.invT=999;const s0={...__v17.HS};await new Promise(r=>setTimeout(r,20000));const push=g.cars.reduce((a,c)=>a+(c.ai&&c.ai.hzPush||0),0);return{hzKill:__v17.HS.hzKill-s0.hzKill,beamHit:__v17.HS.beamHit-s0.beamHit,crush:__v17.HS.crush-s0.crush,boom:__v17.HS.boom-s0.boom,push:+push.toFixed(1),alive:g.cars.filter(c=>c.alive).length}});
   ok(`desk ${m} AI 20s 自然对局（躲避/利用）`,m==='desert'||ai.push>0,ai);
  }}
 const evs=await ev(()=>__ev);ok(tag+' 埋点 hazard_break/hazard_kill',tag!=='desk'||evs.includes('hazard_break')&&evs.includes('hazard_kill'),[...new Set(evs.filter(e=>/hazard|sand/.test(e)))]);
 ok(tag+' 无报错',!errs.length,errs);await pg.close()}
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
