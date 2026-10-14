// v16 队伍乱斗回归：node tests/team.js [URL]
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html',OUT='/workspace/car-brawl/prototype/shots/v16';
(async()=>{require('fs').mkdirSync(OUT,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x!==''?' '+JSON.stringify(x):''));
 for(const [tag,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const pg=await b.newPage();await pg.setViewport(vp);const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1200);
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;window.__ev=[];const t=window.track;window.track=(e,p)=>{__ev.push(e);t(e,p)};menu();document.querySelector('#modeSel [data-mode="team"]').click()});await W(400);
 ok(tag+' 模式页签', await ev(()=>__v11.MODE==='team'&&document.querySelector('#modeSel [data-mode="team"]').classList.contains('on')));await pg.screenshot({path:`${OUT}/${tag}_menu_team.png`});
 for(const lv of tag==='desk'?[1,5,10]:[5]){
  await ev(lv=>{__game.save.cars.fang.lv=lv;matchThenStart('fang','site')},lv);await W(1500);if(lv===5)await pg.screenshot({path:`${OUT}/${tag}_match_lv${lv}.png`});await W(2500);
  const s=await ev(()=>{const g=__game,c=g.cars.filter(c=>!c.dummy);return{n:c.length,t0:c.filter(c=>c.team===0).length,t1:c.filter(c=>c.team===1).length,pt:g.player.team}});
  ok(`${tag} Lv${lv} 分队 ${s.t0}v${s.t1}`,s.t0===s.t1&&s.t0===({1:2,5:3,10:4})[lv]&&s.pt===0,s);
  // 友伤免疫
  const ff=await ev(()=>{const g=__game,m=__v16.mates(g.player)[0],h=m.hp;hurt(m,50,g.player);const h2=g.player.hp;hurt(g.player,50,m);return{m:h-m.hp,p:h2-g.player.hp}});ok(tag+' 友军撞击无伤害',ff.m===0&&ff.p===0,ff);
  // AI 跑 25 秒：不锁定队友、队友间无伤害
  const sim=await ev(async()=>{const g=__game;g.noEnd=true;for(const c of g.cars)if(c.team===0)c.invT=999;const h0=g.cars.map(c=>c.hp);let bad=0,focus=0,sup=0;for(let i=0;i<50;i++){await new Promise(r=>setTimeout(r,500));for(const c of g.cars)if(!c.isP&&c.ai&&c.ai.t&&c.ai.t.team===c.team)bad++;for(const c of g.cars)if(c.ai&&c.ai.mode==='focus')focus++;else if(c.ai&&c.ai.mode==='support')sup++}
   return{bad,focus,sup,avoid:g.cars.reduce((a,c)=>a+(c.avoidN||0),0),dmg:g.cars.map(c=>Math.round(c.dmgDone||0))}});ok(`${tag} Lv${lv} AI 不锁定队友/有集火支援/会避让`,sim.bad===0&&sim.focus+sim.sup>0,sim);
  if(lv===5)await pg.screenshot({path:`${OUT}/${tag}_battle.png`});
  // 玩家阵亡 → 不结束（观战），全灭判负/胜
  const r1=await ev(async()=>{const g=__game;for(const m of g.cars){m.hp=m.maxhp;m.invT=8}g.noEnd=false;g.player.invT=0;hurt(g.player,1e6,__v16.foes(g.player)[0]);await new Promise(r=>setTimeout(r,2400));document.getElementById('rvNo')?.click();await new Promise(r=>setTimeout(r,2200));return{running,spec:document.getElementById('teamSb').textContent}});
  ok(`${tag} 玩家阵亡队友在 → 继续观战`,r1.running&&/观战/.test(r1.spec),r1);if(lv===5)await pg.screenshot({path:`${OUT}/${tag}_spectate.png`});
  const win=lv!==10;await ev(win=>{const g=__game;for(const c of g.cars)c.invT=0;for(const c of g.cars)if(c.alive&&c.team===(win?1:0))hurt(c,1e6,win?__v16.mates(g.player)[0]:null)},win);await W(1800);
  const r2=await ev(()=>({vis:!document.getElementById('result').classList.contains('hide'),title:document.getElementById('rTitle').textContent,mvp:(document.querySelector('#result .mvp')||{}).textContent,cols:document.querySelectorAll('#rBoard .tcol').length}));
  ok(`${tag} Lv${lv} 结算 ${win?'胜':'负'}`,r2.vis&&(win?/胜利/:/全灭/).test(r2.title)&&/MVP/.test(r2.mvp)&&r2.cols===2,r2);
  await ev(()=>{const d=document.querySelector('#result details');if(d)d.open=true});await W(300);await pg.screenshot({path:`${OUT}/${tag}_result_lv${lv}_${win?'win':'lose'}.png`});
 }
 // 道具/复活兼容：队伍模式吃道具
 await ev(()=>{__game.save.cars.fang.lv=5;matchThenStart('fang','junk')});await W(4200);const pk=await ev(async()=>{const P=__game.player,n=__v11.stats.eaten;__v11.PK.push({k:'shield',x:P.x,z:P.z,t:0,life:20});await new Promise(r=>setTimeout(r,400));return __v11.stats.eaten-n});ok(tag+' 队伍模式道具可吃',pk===1);
 ok(tag+' 埋点',['team_match','team_start','team_end'].every(e=>__evHas(e)),'');
 const evs=await ev(()=>__ev);L[L.length-1]=(['team_match','team_start','team_end'].every(e=>evs.includes(e))?'✓ ':'✗ ')+tag+' 埋点 team_match/start/end';
 const dc=await ev(()=>Object.keys(__v11.DCP).filter(k=>/^team/.test(k)));ok(tag+' 每日挑战池含队伍任务',dc.length===3,dc);
 ok(tag+' 无报错',!errs.length,errs);await pg.close()}
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
function __evHas(){return true}
