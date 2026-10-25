// v31 回归：node tests/v31.js [URL]  地图耐玩（局中事件×7、补给空投、缩圈开关）+ 画面（标志建筑、撞障碍碎屑）+ 性能
// 事件/空投部分暂停对局、手动 step(1/60)，确定性；FPS 用真实对局
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
const TUNE_GAP=[26,36],TUNE_COIN=40,TUNE_GRIP=4;
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
 for(const [tag,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){
  const g=await b.newPage();g.on('pageerror',e=>errs.push(tag+': '+e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2000);
  await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.beast.lv=10;persist();menu()});
  const R={};
  for(const [mode,map] of [['brawl','site'],['brawl','junk'],['brawl','desert'],['brawl','ice'],['brawl','factory'],['ring','ring'],['race','track']]){
   if(tag==='desk'&&!['site','ring'].includes(map))continue;
   await g.evaluate((mode,map)=>{__game.noEnd=true;document.querySelector(`#modeSel [data-mode="${mode}"]`)?.click();matchThenStart('beast',map)},mode,map);await W(6500);
   R[map]=await g.evaluate(async(map)=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const T=TUNE.live,P=__game.player,cs=__game.cars.filter(c=>!c.isP),out={map,lm:__live.state().lm,amb:__live.S().amb,parts:parts.length};
    // FPS（真实对局，事件/空投未触发）
    let f=0;const t0=performance.now();await new Promise(res=>{const tick=()=>{f++;if(performance.now()-t0<3500)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)});out.fps=+(f/((performance.now()-t0)/1000)).toFixed(1);
    paused=true;await S(100);P.invT=999;P.hp=P.maxhp;cs.forEach(c=>{c.invT=999;c.hp=c.maxhp});
    const st=n=>{for(let i=0;i<n;i++)step(1/60)};
    // 调度：首次事件时间在 first 区间，到点自动触发
    P.alive=true;cs.forEach(c=>{c.alive=true});
    out.next=__live.S().next;time=__live.S().next+.05;__live.S().dropNext=1e9;st(2);out.auto=__live.state().ev;__live.evEnd();
    __live.S().nEv=T.ev.max;const t00=time;time+=100;st(2);out.capped=__live.state().ev;__live.S().nEv=0;time=t00;st(1);P.alive=true;cs.forEach(c=>{c.alive=true});if(map==='ring')cs.forEach((c,i)=>{c.x=ZC[0]+i;c.z=ZC[1]});
    // 事件效果
    if(map==='ice')__maps.HZ.forEach(h=>{if(h.k==='hole'){h.ph='shut';h.t=0;h.T=99}});__live.evStart();const ev=__live.ev;out.ev=ev&&ev.k;
    if(map==='site'){out.beams=__v17.SS.filter(s=>s.k==='warn').length}
    if(map==='junk'){const c=cs[0];c.x=ZC[0]+12;c.z=ZC[1];c.vx=c.vz=0;const d0=Math.hypot(c.x-ZC[0],c.z-ZC[1]);ev.t=T.ev.junk.warn+.05;for(let i=0;i<60;i++){ev.t+=1/60;__live.EV.junk.tick(ev,1/60)}const d1=Math.hypot(c.x-ZC[0],c.z-ZC[1]);out.pull=[+d0.toFixed(1),+d1.toFixed(1)];ev.t=0}
    if(map==='desert'){out.sand0=__v17.HZ.filter(h=>h.k==='sand').length;out.temp=__v17.HZ.filter(h=>h.temp).length}
    if(map==='ice'){const hs=__maps.HZ.filter(h=>h.k==='hole');out.warn=hs.filter(h=>h.ph==='warn').length;out.holes=hs.length;out.temp=hs.filter(h=>h.temp).length}
    if(map==='factory'){const bs=__maps.HZ.filter(h=>h.k==='belt'),d0=bs.map(h=>h.dir);st(Math.round((T.ev.factory.delay+.3)*60));out.flip=bs.every((h,i)=>h.dir===-d0[i])&&bs.length>0}
    if(map==='ring'){const c=cs[0],a=ev.a,x0=c.x,z0=c.z;c.vx=c.vz=0;ev.t=1;for(let i=0;i<60;i++){ev.t+=1/60;__live.EV.ring.tick(ev,1/60)}ev.t=0;out.wind=+((c.x-x0)*Math.cos(a)+(c.z-z0)*Math.sin(a)).toFixed(2)}
    if(map==='track'){const x=P.x,z=P.z;out.rain=terrainAt(x,z);out.ig=[P._ig0,P.iceGrip]}
    // 结束：清理
    while(__live.ev)step(1/60);
    if(map==='desert')out.temp1=__v17.HZ.filter(h=>h.temp).length;if(map==='ice')out.temp1=__maps.HZ.filter(h=>h.temp).length;if(map==='track'){out.rain1=terrainAt(P.x,P.z);out.ig1=P.iceGrip}
    out.nextAfter=+(__live.S().next-time).toFixed(1);
    // 补给空投（非赛道）
    if(map!=='track'){P.alive=true;P.hp=P.maxhp;P.fell=false;P.fallT=0;cs.forEach(c=>{c.alive=true;c.fell=false;c.fallT=0});const c0=save.coins,PK=__v11.PK;PK.length=0;__live.dropSpawn();const d=PK.find(p=>p.big);out.drop=!!d;if(d){const dp=Math.hypot(d.x-P.x,d.z-P.z);out.dropDist=Math.round(dp);P.x=d.x;P.z=d.z;P.vx=P.vz=0;P.shT=0;st(2);out.dropGone=!PK.some(p=>p.big);out.coin=save.coins-c0;out.shield=P.shT>0;out.dropP=__live.stats().dropP}
     PK.length=0;__live.dropSpawn();const d2=PK.find(p=>p.big);if(d2){d2.t=d2.life+1;const ai=cs[0];ai.x=d2.x+10;ai.z=d2.z;st(2);out.expire=!PK.some(p=>p.big)&&save.coins-c0===out.coin}
     PK.length=0;__live.dropSpawn();const d3=PK.find(p=>p.big);if(d3){const ai=cs[1];ai.x=d3.x;ai.z=d3.z;P.x=d3.x+20;P.z=d3.z;st(2);out.dropAI=__live.stats().dropAI}}
    if(map==='site'){P.lv=1;__live.S().nEv=0;time=__live.S().next+.1;st(2);out.lowLv=__live.state().ev;P.lv=10;const ST2=__live.stats(),pk=__v11.PK;ST2.dropP=0;const cA=save.coins;for(let i=0;i<4;i++){pk.length=0;__live.dropSpawn();const d=pk.find(p=>p.big);P.x=d.x;P.z=d.z;P.vx=P.vz=0;st(2)}out.capCoins=save.coins-cA;out.capN=ST2.dropP}
    // 缩圈开关（非赛道）
    if(map==='site'){time=60;TUNE.live.shrink.on=true;st(2);const on=zoneR;TUNE.live.shrink.on=false;st(2);const off=zoneR;TUNE.live.shrink.on=true;out.shrink=[+on.toFixed(1),+off.toFixed(1),+AR.toFixed(1)]}
    // 撞障碍碎屑
    if(map==='site'){const pr=props.find(q=>q.solid&&!q.deco&&q.type!=='rail');if(pr){const c=cs[2];c.x=pr.x-pr.r-c.r+.1;c.z=pr.z;P.x=c.x-3;P.z=c.z;c.vx=14;c.vz=0;c._pv=14;const n0=__live.stats().hit,pc=parts.length;st(1);out.hit=[n0,__live.stats().hit,parts.length-pc]}}
    paused=false;return out},map);
   console.log(tag,JSON.stringify(R[map]));
   await g.evaluate(()=>{try{finish()}catch(e){}menu()});await W(500)}
  const r=R;
  if(tag==='mob'){
   ok(['site','junk','desert','ice','factory'].every(m=>r[m].lm.length>=2)&&r.ring.lm.length===0&&r.track.lm.length===0,'标志建筑：5 张主图各 2–3 个，擂台/赛道无',Object.fromEntries(Object.keys(r).map(m=>[m,r[m].lm.join('/')])));
   ok(['site','junk','desert','ice','factory','ring','track'].every(m=>r[m].auto===r[m].ev&&r[m].ev),'7 张图各有一个局中事件，到点自动触发（first 区间）',Object.fromEntries(Object.keys(r).map(m=>[m,r[m].auto])));
   ok(Object.values(r).every(x=>x.capped===null||x.capped===undefined),'每局事件次数封顶（max）',Object.values(r).map(x=>x.capped));
   ok(r.site.beams>=4,'工地钢梁雨：同时多根预警',r.site.beams);
   ok(r.junk.pull[1]<r.junk.pull[0]-3,'废车场磁吊车：车被吸向中心',r.junk.pull);
   ok(r.desert.temp===2&&r.desert.temp1===0,'沙漠流沙塌陷：新增 2 坑，事件后移除',[r.desert.temp,r.desert.temp1]);
   ok(r.ice.warn===r.ice.holes&&r.ice.temp>=1&&r.ice.temp1===0,'冰湖：全部冰窟窿同时预警 + 临时窟窿，事件后清理',[r.ice.warn,r.ice.holes,r.ice.temp,r.ice.temp1]);
   ok(r.factory.flip===true,'工厂：传送带换向',r.factory.flip);
   ok(r.ring.wind>2,'擂台强风：车被吹动',r.ring.wind);
   ok(r.track.rain==='oil'&&r.track.rain1!=='oil'&&r.track.ig[1]===r.track.ig[0]*TUNE_GRIP&&r.track.ig1===r.track.ig[0],'赛道暴雨：路面偏滑（抓地×4），结束后恢复',[r.track.rain,r.track.rain1,r.track.ig,r.track.ig1]);
   ok(Object.values(r).every(x=>x.nextAfter>=TUNE_GAP[0]-1),'事件结束后按 gap 排下一次',Object.values(r).map(x=>x.nextAfter));
   ok(['site','junk','desert','ice','factory','ring'].every(m=>r[m].drop&&r[m].dropGone&&r[m].coin>=20&&r[m].shield&&r[m].dropP===1&&r[m].expire&&r[m].dropAI>=1),'补给空投：玩家抢到得金币+护盾，超时消失无奖励，AI 也能抢',Object.fromEntries(Object.keys(r).filter(m=>m!=='track').map(m=>[m,[r[m].dropDist,r[m].coin]])));
   ok(r.site.lowLv===null&&r.site.capN===4&&r.site.capCoins>=60&&r.site.capCoins<=TUNE_COIN*3,'新手等级不触发事件；每局只前 3 次空投给金币',{lowLv:r.site.lowLv,capCoins:r.site.capCoins,n:r.site.capN});
   ok(r.site.shrink[0]<r.site.shrink[2]-5&&r.site.shrink[1]===r.site.shrink[2],'缩圈开关：on 缩小，off 保持满圈',r.site.shrink);
   ok(r.site.hit&&r.site.hit[1]>r.site.hit[0]&&r.site.hit[2]>=3,'撞障碍：碎屑+尘土粒子',r.site.hit);
   ok(Object.values(r).every(x=>x.amb===1)&&Object.values(r).every(x=>x.parts<=600),'粒子数在上限内',Object.values(r).map(x=>x.parts));
   ok(Object.values(r).every(x=>x.fps>=50),'手机真实对局 FPS（7 张图）',Object.fromEntries(Object.keys(r).map(m=>[m,r[m].fps])));
  }else ok(['site','ring'].every(m=>r[m].fps>=50&&r[m].ev),'桌面 FPS + 事件',{site:r.site.fps,ring:r.ring.fps});
  await g.close()}
 ok(!errs.length,'无页面报错',errs.slice(0,3));await b.close();const f=L.filter(l=>l[0]==='✗').length;console.log(f?`FAIL ${f}`:'ALL OK');process.exit(f?1:0)})().catch(e=>{console.log('✗ 异常 '+e.stack);process.exit(1)});
