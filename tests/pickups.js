// 道具连吃回归：node tests/pickups.js [URL]  一局内连吃 30+（每类重复、状态未结束再吃、满血修复包、复活后）+ 连续 10 局自然刷新拾取
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage();await pg.setViewport({width:1280,height:720});
 const errs=[],L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x?' '+x:''));pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1500);
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.tut=null;g.noEnd=true;buildArena('site',arenaR(4));start('fang',{})});await W(2800);
 // 把道具直接放到玩家车上，逐个吃
 const eat=async k=>ev(async k=>{const g=__game,P=g.player,n0=__v11.stats.eaten;__v11.PK.push({k,x:P.x,z:P.z,t:0,life:25});const t0=performance.now();while(__v11.PK.some(q=>q.k===k&&Math.abs(q.x-P.x)<.01)&&performance.now()-t0<1500)await new Promise(r=>setTimeout(r,30));return{left:__v11.PK.length,eaten:__v11.stats.eaten-n0,atk:+P.atkT.toFixed(2),sh:+P.shT.toFixed(2),hp:P.hp,max:P.maxhp}},k);
 const ks=['heal','atk','shield','boost','spring'];let fails=0,res=[];
 for(let i=0;i<35;i++){const k=ks[i%5];const r=await eat(k);res.push(r);if(r.eaten!==1)fails++}
 ok('一局连吃 35 个全部吃到',fails===0,'失败 '+fails);
 // 满血修复包也消耗
 await ev(()=>{const P=__game.player;P.hp=P.maxhp});const rh=await eat('heal');ok('满血吃修复包也消耗',rh.eaten===1);
 // 同类刷新不叠加：吃两次狂暴，时长仍 8s、倍率仍 1.4
 await eat('atk');await W(1000);const a2=await eat('atk');ok('狂暴重复只刷新时长（≤8s）',a2.atk<=8&&a2.atk>7.5,String(a2.atk));
 const mul=await ev(()=>{const g=__game,P=g.player,o=g.cars.find(c=>!c.isP&&c.alive);o.shT=0;o.invT=0;const h=o.hp;hurt(o,10,P);return h-o.hp});ok('狂暴倍率不叠加 ×1.4',Math.abs(mul-14)<.01,String(mul));
 await eat('shield');const s2=await eat('shield');ok('护盾重复只刷新时长',s2.sh<=8&&s2.sh>7.5,String(s2.sh));
 // 复活后还能吃
 await ev(()=>{const g=__game;g.noEnd=false;g.cars.forEach(c=>{if(!c.isP){c.alive=true;c.hp=c.maxhp}});g.player.invT=0;g.player.shT=0;hurt(g.player,1e6,g.cars[1])});await W(2200);await ev(()=>__v11.doRevive());await W(300);
 let rf=0;for(const k of ks){const r=await eat(k);if(r.eaten!==1)rf++}ok('复活后连吃 5 个',rf===0,'失败 '+rf);
 // 吃完场上计数正常、能继续刷新
 const sp=await ev(async()=>{const s0=__v11.stats.spawn;__v11.PK.length=0;__v11.pkNext=0;await new Promise(r=>setTimeout(r,2500));return __v11.stats.spawn-s0});ok('吃空后继续自然刷新',sp>0,String(sp));
 const unr=await ev(()=>{let bad=0;for(let i=0;i<300;i++){__v11.PK.length=0;__v11.pkSpawn();const q=__v11.PK[0];if(!q)continue;const[a,b]=cellOf(q.x,q.z);if(!GRID.ok[b*GRID.n+a])bad++}__v11.PK.length=0;return bad});ok('300 次刷新无不可达点',unr===0,String(unr));
 // 连续 10 局：每局自然刷新 + 玩家开过去吃
 let tot=0,eatN=0,bad=0;for(let m=0;m<10;m++){await ev(()=>{const g=__game;g.noEnd=true;buildArena(['site','junk','desert'][Math.random()*3|0],arenaR(4));start(['fang','tyrant','beast'][Math.random()*3|0],{})});await W(2600);await ev(()=>{const P=__game.player,h=window.hurt;window.__keep=setInterval(()=>{if(P.alive)P.hp=P.maxhp},50)});
  const r=await ev(async()=>{const g=__game,P=g.player;g.time=10;let seen=0,got=0;for(let i=0;i<8;i++){__v11.pkNext=0;await new Promise(r=>setTimeout(r,400));const q=__v11.PK[0];if(!q)continue;if(!P.alive)break;P.hp=P.maxhp;seen++;const n0=__v11.stats.eatenP;P.x=q.x+1;P.z=q.z;P.vx=P.vz=0;await new Promise(r=>setTimeout(r,500));if(__v11.stats.eatenP>n0)got++;else{const still=__v11.PK.includes(q);window.__miss=(window.__miss||[]).concat([{still,d:+Math.hypot(P.x-q.x,P.z-q.z).toFixed(2),alive:P.alive,k:q.k,t:+q.t.toFixed(1),run:running}])}}return{seen,got,miss:window.__miss||[]}});
  tot+=r.seen;eatN+=r.got;if(r.got<r.seen){bad++;console.log("miss",JSON.stringify(r.miss.slice(-2)))}}
 ok('连续 10 局开过去都能吃',bad===0,`${eatN}/${tot}`);
 ok('无 console 错误',!errs.length,errs.slice(0,3).join(' | '));
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
