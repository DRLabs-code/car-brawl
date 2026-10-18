// v30 回归：node tests/v30.js [URL]  手机对手涂装分级：默认 oppPx 档、最近 nearN 辆/交战对手升全分辨率、滞后降级（不抖动）、限速、8 车最坏内存 ≤24MB、FPS；桌面全分辨率
// 分级逻辑用「暂停对局 + 手动推进 time + 调 lodStep」确定性地测（实时对局里倒计时/AI 会挪车，结果不稳）；FPS 用真实对局
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v30/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{require('fs').mkdirSync(SH,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
 for(const [tag,vp] of [['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['desk',{width:1280,height:720}]]){
  const g=await b.newPage();g.on('pageerror',e=>errs.push(tag+': '+e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
  const r=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.beast.lv=10;s.cars.beast.paint={color:'galaxy',livery:'auroraStripe'};persist();
   hideAll();MODE='brawl';__game.noEnd=true;start('beast');await S(800);
   // FPS：真实对局（AI 开动、分级在跑）
   let f=0;const t0=performance.now();await new Promise(res=>{const tick=()=>{f++;if(performance.now()-t0<4000)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)});const fps=+(f/((performance.now()-t0)/1000)).toFixed(1);
   const lp0=__lod.promo,ld0=__lod.demote;
   paused=true;await S(100);const P=__game.player,cs=__game.cars.filter(c=>!c.isP),T=TUNE.skin,gap=T.promoteGap;T.promoteGap=0;
   const sk=[['checker','pinkBand'],['leopard',null],['hex','redStripe'],['iri',null],['lava','number'],['navy','limeRoof'],['sakura','stripe']];// 7 个对手全不同涂装（最坏内存）
   cs.forEach((c,i)=>{c.alive=true;c.skinK=sk[i%sk.length];c.skin=battleSkin(c.k,...c.skinK,false);c._full=false;c._engT=null;c._lodT=null});
   const put=(c,d,a)=>{c.x=P.x+Math.cos(a)*d;c.z=P.z+Math.sin(a)*d};const far=()=>cs.forEach((c,i)=>put(c,T.nearR+4+i,i*.9));
   const adv=sec=>{for(let k=0;k<Math.round(sec*10);k++){time+=.1;__lod.lodStep()}};const W2=()=>cs.map(c=>c.skin.width);
   const mem=()=>[...new Set([...__game.cars.map(c=>c.skin),...__lod.MID.values()])].reduce((a,o)=>a+o.width*o.height*4,0)/1048576;
   const out={n:__game.cars.length,opx:T.oppPx,mobc:matchMedia('(pointer:coarse)').matches,fps,live:{promo:__lod.promo-lp0,demote:__lod.demote-ld0}};
   far();adv(1.2);out.w0=W2();out.mem0=+mem().toFixed(1);
   put(cs[0],5,0);put(cs[1],7,2);adv(.3);out.w1=W2();out.mem1=+mem().toFixed(1);
   let mm=0;put(cs[2],3,4);adv(.3);out.w2=W2();mm=Math.max(mm,mem());adv(T.holdT-.8);out.w2b=W2();mm=Math.max(mm,mem());adv(1);out.w3=W2();out.memMax=+Math.max(mm,mem()).toFixed(1);
   far();adv(T.holdT+.5);out.wFar=W2();
   const p0=__lod.promo,d0=__lod.demote;for(let k=0;k<60;k++){put(cs[0],T.nearR+(k%2?.5:-.5),0);adv(.1)}out.jitter={promo:__lod.promo-p0,demote:__lod.demote-d0};
   far();adv(T.holdT+.5);const E=cs[5];const e0=E.skin.width;put(E,P.r+E.r-.3,1);collide(P,E);put(E,T.nearR+9,1);adv(.2);out.eng=[e0,E.skin.width];adv(T.engageT+T.holdT+.3);out.engOff=E.skin.width;
   // 限速：恢复 promoteGap，3 辆同时靠近 → 立即只升 1 辆
   far();adv(T.holdT+.5);T.promoteGap=gap;await S(gap*1000+50);put(cs[0],4,0);put(cs[1],5,2);adv(.2);out.rate=W2().filter(w=>w===1152).length;
   // 升级一次（缓存命中）耗时
   const t1=performance.now();cs[3]._full=false;put(cs[3],3,3);T.promoteGap=0;__lod.lodStep();out.promoteMs=+(performance.now()-t1).toFixed(1);T.promoteGap=gap;
   paused=false;
   out.worstMB=+((1152*1152*4*(1+T.nearN)+(out.n-1-T.nearN)*T.oppPx*T.oppPx*4)/1048576).toFixed(1);return out});
  console.log(tag,JSON.stringify(r));const F=1152,O=r.opx,cnt=(a,v)=>a.filter(x=>x===v).length;
  if(tag==='mob'){
   ok(r.mobc&&r.n===8&&r.w0.every(w=>w===O),'手机 8 车：对手默认 oppPx 档',{n:r.n,opx:O,w0:r.w0,mem0:r.mem0});
   ok(r.w1[0]===F&&r.w1[1]===F&&cnt(r.w1,F)===2,'最近 2 辆实时升到全分辨率，其余保持',{w1:r.w1});
   ok(r.w2[2]===O&&cnt(r.w2,F)===2&&cnt(r.w2b,F)===2&&r.w2b[1]===F&&r.w3[2]===F&&r.w3[0]===F&&r.w3[1]===O&&cnt(r.w3,F)===2&&r.wFar.every(w=>w===O),'第 3 辆更近：被挤出的保持 holdT 秒（滞后）再降级，第 3 辆接位升级（同时最多 fullMax=2 辆）；全远离后全部降回',{w2:r.w2,w2b:r.w2b,w3:r.w3,wFar:r.wFar});
   ok(r.worstMB<=24.1&&r.memMax<=24.1&&r.mem1<=24.1,'8 车全不同涂装：最坏（2 辆升级）内存 ≤24MB',{worst:r.worstMB,measured2up:r.mem1,measuredDuringSwap:r.memMax,noPromo:r.mem0});
   ok(r.jitter.promo<=1&&r.jitter.demote===0,'nearR 边界来回 6 秒：最多升 1 次、不降（不抖动、不反复重烘）',r.jitter);
   ok(r.eng[0]===O&&r.eng[1]===F&&r.engOff===O,'和玩家碰撞的远处对手升全分辨率，脱战 engageT+holdT 后降回',{eng:r.eng,off:r.engOff});
   ok(r.rate===1,'限速：多辆同时靠近，promoteGap 内只升 1 辆',r.rate);
   ok(r.promoteMs<20,'单次升级耗时（全尺寸 LRU 未命中时含重烘，每 promoteGap 最多一次）',r.promoteMs+'ms');
   ok(r.fps>=50,'手机 8 车真实对局（分级运行中）FPS',{fps:r.fps,live:r.live});
  }else ok(r.w0.every(w=>w===F)&&r.w1.every(w=>w===F)&&r.fps>=50,'桌面：全部全分辨率、不分级',{w0:r.w0,fps:r.fps});
  await g.screenshot({path:`${SH}v30_battle_${tag}.png`});await g.close()}
 ok(!errs.length,'无页面报错',errs.slice(0,3));await b.close();const f=L.filter(l=>l[0]==='✗').length;console.log(f?`FAIL ${f}`:'ALL OK');process.exit(f?1:0)})().catch(e=>{console.log('✗ 异常 '+e.stack);process.exit(1)});
