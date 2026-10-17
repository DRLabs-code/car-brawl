// v21 竞速回归：node tests/race.js [URL]  模式入口/发车/圈数完赛/排名/重生/加速带/跳台/捷径/AI 吃道具/对撞平衡/埋点/FPS + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v21/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const page=async vp=>{const g=await b.newPage();g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.fang.lv=10;s.cars.tyrant.lv=10;persist();menu()});return g};
const auto=g=>g.evaluate(()=>{window.__ap=setInterval(()=>{const P=__game.player;if(!P||!P.rc)return;const Wp=__race.WP,w=Wp[(P.rc.i+2)%Wp.length];const dx=w[0]-P.x,dz=w[1]-P.z,L=Math.hypot(dx,dz)||1;__game.testInp=[dx/L,dz/L]},50)});
const mob={width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true};
// 1) 入口 + 发车 + 完赛
let g=await page(mob);
const btn=await g.evaluate(()=>{const b=document.querySelector('#modeSel [data-mode=race]');if(!b)return null;b.click();return{on:b.classList.contains('on'),hint:document.getElementById('modeHint').textContent,mode:MODE}});
ok(btn&&btn.on&&btn.mode==='race'&&/竞速/.test(btn.hint),'模式按钮/说明',btn);await g.screenshot({path:SH+'mob_menu.png'});
await g.evaluate(()=>document.getElementById('mStart').click());await W(500);const mt=await g.evaluate(()=>document.querySelector('#match .msub')&&document.querySelector('#match .msub').textContent);ok(/环形赛道/.test(mt||''),'开始匹配直接进赛道（不选地图）',mt);
await W(4200);const st=await g.evaluate(()=>{const cs=__game.cars.filter(c=>!c.dummy);return{map:mapKey,n:cs.length,allRc:cs.every(c=>c.rc),behind:cs.every(c=>c.x<-8&&Math.abs(c.z+31)<8),head:cs.every(c=>Math.abs(c.h-Math.PI/2)<.01),zone:zoneR===AR}});
ok(st.map==='track'&&st.allRc&&st.behind&&st.head,'发车格：全部在起跑线后、朝前',st);ok(st.zone,'竞速不缩电网');await g.screenshot({path:SH+'mob_start.png'});
await auto(g);await W(9000);await g.screenshot({path:SH+'mob_race.png'});const hud=await g.evaluate(()=>document.getElementById('raceHud').textContent);ok(/圈/.test(hud)&&/名/.test(hud),'HUD 圈数/名次',hud);
// 重生：撞毁一辆 AI，应在检查点重生
const rs=await g.evaluate(async()=>{const c=__game.cars.find(q=>!q.isP&&q.alive);hurt(c,9999,null);const d=!c.alive;await new Promise(r=>setTimeout(r,2600));return{dead:d,back:c.alive,hp:+(c.hp/c.maxhp).toFixed(2),inv:c.invT>0||c.hp<c.maxhp}});ok(rs.dead&&rs.back&&rs.hp<=.61,'撞毁后重生（60% 耐久）',rs);
const fin=await g.evaluate(async()=>{for(let i=0;i<120&&document.getElementById('result').classList.contains('hide');i++)await new Promise(r=>setTimeout(r,1000));await new Promise(r=>setTimeout(r,400));const S=__race.standings();
 return{done:!document.getElementById('result').classList.contains('hide'),t:__game.time|0,title:document.getElementById('rTitle').textContent,board:document.querySelectorAll('#rBoard .brow').length,mono:S.every((c,i)=>i===0||!c.rc.fin||(S[i-1].rc.fin&&S[i-1].rc.fin<c.rc.fin)),fins:S.filter(c=>c.rc.fin).length,RS:__race.RS,pkAI:__v11.stats.eaten-__v11.stats.eatenP,stats:document.getElementById('rStats').textContent}});
ok(fin.done&&/名/.test(fin.title)&&fin.board>=4,'完赛进结算，名次榜',fin);ok(fin.mono,'完赛名次按冲线顺序');ok(/用时/.test(fin.stats),'结算显示用时');ok(fin.RS.boost>=2,'玩家吃到加速带',fin.RS);ok(fin.pkAI>=1,'AI 会吃道具',fin.pkAI);
await W(800);await g.screenshot({path:SH+'mob_result.png'});
const ev=await g.evaluate(()=>JSON.parse(localStorage.getItem('carbrawl_track')||'[]').map(e=>e.event));ok(['race_start','race_lap','race_end','mode_select'].every(e=>ev.includes(e)),'埋点 race_start/race_lap/race_end',[...new Set(ev.filter(e=>/race|mode/.test(e)))]);
await g.close();
// 2) 机制：加速带提速、跳台（快车飞过泥地/慢车落泥）、AI 走捷径
g=await page({width:1280,height:720});
const mech=await g.evaluate(async()=>{MODE='race';__game.noEnd=true;buildArena('track',arenaR(8));start('fang');await new Promise(r=>setTimeout(r,2500));const P=__game.player,A=__race;
 const res={};// 加速带：停在加速带前沿直线开过
 P.x=6;P.z=-31;P.h=Math.PI/2;P.vx=0;P.vz=12;P.vx=12;P.vz=0;__game.testInp=[1,0];let mx=0;for(let i=0;i<40;i++){await new Promise(r=>setTimeout(r,50));mx=Math.max(mx,Math.hypot(P.vx,P.vz))}res.boostTop=+mx.toFixed(1);res.base=P._spd0||P.spd;
 // 跳台（捷径内）：速度 20 → 腾空
 P.x=44;P.z=-14;P.h=0;P.vx=0;P.vz=20;P.boostT=0;__game.testInp=[0,1];let air=0;for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,30));air=Math.max(air,P.air||0)}res.air=+air.toFixed(2);
 // AI 走捷径计数：看 2 圈内是否有 AI 进入捷径通道
 let sc=0;const seen=new Set();for(let i=0;i<400;i++){await new Promise(r=>setTimeout(r,50));for(const c of __game.cars)if(!c.isP&&c.x>39&&c.x<49&&Math.abs(c.z)<8)seen.add(c.id)}res.aiShortcut=seen.size;
 // FPS
 let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});res.fps=+(fr/4).toFixed(1);return res});
ok(mech.boostTop>21.5,'加速带：超过霓虹毒牙极速 20',mech);ok(mech.air>=.5,'跳台腾空',mech.air);ok(mech.aiShortcut>=1,'AI 会走捷径',mech.aiShortcut);ok(mech.fps>=50,'竞速 8 车 FPS',mech.fps);
await g.screenshot({path:SH+'desk_race.png'});
// 3) 对撞平衡：霓虹毒牙高速正面撞静止的铁壁暴君，毒牙不应伤得比对方重
const bal=await g.evaluate(async()=>{MODE='brawl';__game.noEnd=true;const run=async()=>{buildArena('site',arenaR(4));start('fang',{opps:[1,2,3].map(()=>({k:'tyrant',lv:10,sk:.5,cs:aiCs(10,.5),nick:'t',frame:'#fff'}))});await new Promise(r=>setTimeout(r,2500));const P=__game.player,o=__game.cars.find(c=>!c.isP);
 for(const c of __game.cars)if(c!==P&&c!==o){c.x=999;c.alive=false}const ok=[];for(let k=0;k<3;k++){P.hp=P.maxhp;o.hp=o.maxhp;o.x=0;o.z=-14;o.h=Math.PI;o.vx=o.vz=0;o.ai.hz=9;P.x=0;P.z=-22;P.h=0;P.vx=0;P.vz=20;P.dash=0;__game.testInp=[0,1];
  await new Promise(r=>setTimeout(r,900));ok.push({self:Math.round(P.maxhp-P.hp),dealt:Math.round(o.maxhp-o.hp)})}return{k:o.k,ok}};const now=await run();const H=TUNE.hit,h0={...H};H.headOnSpeedW=0;H.selfCap=1e9;const old=await run();Object.assign(H,h0);return{k:now.k,ok:now.ok,old:old.ok}});
const avg=f=>bal.ok.reduce((s,x)=>s+x[f],0)/bal.ok.length;ok(bal.k==='tyrant'&&avg('dealt')>avg('self')&&avg('self')<P85(),'高速对撞：快车伤害>自伤，且自伤<20%',bal);
function P85(){return 85*.2}
await g.close();ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
