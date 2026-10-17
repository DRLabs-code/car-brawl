// v22 道具回归（v23 起：拾取后持有，这里拾取后立即 fire）：node tests/items.js [URL]  导弹/地雷/油污/磁铁效果、AI 会用、竞速追赶道具、竞速每日任务、埋点、FPS + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v22/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [vn,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const g=await b.newPage();g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.fang.lv=10;persist()});
 const r=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='brawl';__game.noEnd=true;buildArena('site',arenaR(8));start('fang');await S(2600);
  const P=__game.player,cs=__game.cars,o=cs.find(c=>!c.isP),R={};const freeze=()=>{for(const c of cs)if(!c.isP){c.ai.hz=99}};
  const solo=()=>{for(const c of cs)if(c!==P&&c!==o){c.alive=false;c.x=c.z=0}o.alive=true;o.hp=o.maxhp;P.hp=P.maxhp;P.invT=0;o.invT=0;freeze()};
  const give=async k=>{__v11.PK.push({k,x:P.x,z:P.z,t:0,life:25});await S(150);__items.fire(P,'test')};const at=(c,x,z,h)=>{c.x=x;c.z=z;c.h=h;c.vx=c.vz=0};__game.testInp=[0,0];
  // 测试区清掉随机障碍（否则偶尔挡住导弹/磁铁）
  {const pr=__game.props;for(let i=pr.length-1;i>=0;i--){const q=pr[i];if(q.solid&&!q.wall&&q.x>-14&&q.x<18&&q.z>-34&&q.z<-12)pr.splice(i,1)}buildGrid()}
  // 导弹
  solo();at(P,0,-30,0);at(o,4,-16,0);await give('missile');await S(1500);R.missile={hit:__items.ST.hitM,dmg:Math.round(o.maxhp-o.hp),left:__items.MS.length};
  // 地雷：玩家拿到后在身后布雷，把对手放上去
  solo();at(P,-10,-20,0);await give('mine');await S(200);const m=__items.MN[0];await S(900);if(m)at(o,m.x,m.z,0);await S(300);R.mine={laid:!!m,hit:__items.ST.hitN,dmg:Math.round(o.maxhp-o.hp)};
  // 油污
  solo();at(P,10,-20,0);await give('oil');await S(200);const q=__items.OIL[0];R.oil={laid:!!q,ter:q?terrainAt(q.x,q.z):null};
  // 磁铁
  solo();at(P,0,-20,0);at(o,12,-20,0);await give('magnet');await S(200);const d0=Math.hypot(o.x-P.x,o.z-P.z);await S(1000);R.magnet={d0:+d0.toFixed(1),d1:+Math.hypot(o.x-P.x,o.z-P.z).toFixed(1),magT:+P.magT.toFixed(1),oa:o.alive,pa:P.alive,ov:+Math.hypot(o.vx,o.vz).toFixed(2),inv:o.invT>0,mass:o.mass,run:running};
  // AI 会用：8 车正常打，在每辆 AI 面前放新道具
  buildArena('junk',arenaR(8));start('fang');await S(2600);const u0=__items.ST.aiUse;const ks=['missile','mine','oil','magnet'];
  for(let t=0;t<6;t++){for(const c of __game.cars)if(!c.isP&&c.alive)__v11.PK.push({k:ks[(t+c.id)%4],x:c.x+Math.sin(c.h)*4,z:c.z+Math.cos(c.h)*4,t:0,life:25});await S(1500)}R.aiUse=__items.ST.aiUse-u0;
  let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});R.fps=+(fr/4).toFixed(1);R.n={ms:__items.MS.length,mn:__items.MN.length,oil:__items.OIL.length};
  return R});
 if(vn==='desk'){ok(r.missile.hit>=1&&r.missile.dmg>=15,'导弹锁定并命中',r.missile);ok(r.mine.laid&&r.mine.hit>=1&&r.mine.dmg>=20,'地雷布在身后并引爆',r.mine);ok(r.oil.laid&&r.oil.ter==='oil','油污让地面打滑',r.oil);ok(r.magnet.d1<r.magnet.d0-1,'磁铁吸近对手',r.magnet);ok(r.aiUse>=5,'AI 会吃新道具',r.aiUse)}
 ok(r.fps>=50,vn+' 8 车+道具 FPS',{fps:r.fps,n:r.n});await g.screenshot({path:SH+vn+'_items.png'});
 if(vn==='desk'){// 竞速：落后追赶道具 + 每日竞速任务
  const rc=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='race';__game.noEnd=true;localStorage.setItem('carbrawl_dc',JSON.stringify({d:today(),t:[{id:'racePlay',p:0,c:0},{id:'raceTop3',p:0,c:0},{id:'kill',p:0,c:0}],chest:0,seen:0}));
   buildArena('track',arenaR(8));start('fang');await S(2600);const P=__game.player,cs=__game.cars.filter(c=>!c.dummy);
   cs.forEach((c,i)=>c.rc.n=c.isP?-40:i*5);const last=__race.posOf(P);let up=0;for(let i=0;i<200;i++)if(TUNE.catchUp.strong.includes(pkRoll(P,'heal')))up++;
   cs.forEach((c,i)=>c.rc.n=c.isP?999:i);const first=__race.posOf(P);let up1=0;for(let i=0;i<200;i++)if(pkRoll(P,'heal')!=='heal')up1++;
   const dcRaw=localStorage.getItem('carbrawl_dc');__game.noEnd=false;finish();await S(900);const d=JSON.parse(localStorage.getItem('carbrawl_dc'));
   return{last,up,first,up1,dc:d.t.map(t=>t.id+':'+t.p),day:JSON.parse(dcRaw).d,inDCP:typeof __v11.DC_SLOTS==='object'&&__v11.DC_SLOTS.flat().includes('racePlay'),title:document.getElementById('rTitle').textContent}});
  ok(rc.up>=80&&rc.up1===0,'竞速追赶：最后一名常拿强道具，第一名不变',rc);ok(rc.inDCP&&/racePlay:1/.test(rc.dc.join())&&/raceTop3:1/.test(rc.dc.join()),'每日挑战含竞速任务并计数',rc.dc);
  await g.evaluate(()=>{document.querySelector('#menuDC')&&menu();const b=document.getElementById('menuDC');b&&b.click()});await W(700);await g.screenshot({path:SH+'desk_dc.png'});
  const ev=await g.evaluate(()=>JSON.parse(localStorage.getItem('carbrawl_track')||'[]').map(e=>e.event));ok(ev.includes('item_use'),'埋点 item_use')}
 await g.close()}
ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
