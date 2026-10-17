// v23 回归：node tests/v23.js [URL]  新地图 冰湖/工厂（机关布置、效果、击杀归属、AI 躲避/利用、FPS）+ 攻击道具持有/手动释放（E 键、道具按钮、替换、AI 释放）+ 地雷 12s/每车≤2 + 埋点 + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v23/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [vn,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const g=await b.newPage();g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(1500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.cars.fang.lv=10;persist()});
 // 选图界面有新地图
 const mp=await g.evaluate(async()=>{MODE='brawl';openMaps('fang');await new Promise(r=>setTimeout(r,400));return[...document.querySelectorAll('.mapc b')].map(e=>e.textContent)});
 ok(mp.includes('冰湖')&&mp.includes('工厂'),vn+' 选图有冰湖/工厂',mp);await g.screenshot({path:SH+vn+'_maps.png'});
 for(const mk of['ice','factory']){
  const r=await g.evaluate(async mk=>{const S=ms=>new Promise(r=>setTimeout(r,ms));document.querySelectorAll('.panel').forEach(p=>p.classList.add('hide'));MODE='brawl';__game.noEnd=true;buildArena(mk,arenaR(8));start('fang');await S(2600);
   const HZ=__maps.HZ,cs=__game.cars,R={n:{hole:0,pad:0,belt:0}};for(const h of HZ)R.n[h.k]++;
   R.spawnBad=cs.filter(c=>HZ.some(h=>h.k!=='belt'&&Math.hypot(c.x-h.x,c.z-h.z)<h.r)).length;R.wallBad=HZ.filter(h=>__game.props.some(p=>p.solid&&Math.hypot(p.x-h.x,p.z-h.z)<p.r+(h.k==='belt'?1:h.r))).length;
   R.pkBad=__v11.PK.filter(p=>HZ.some(h=>h.k!=='belt'&&Math.hypot(p.x-h.x,p.z-h.z)<h.r)).length;
   if(mk==='ice'){const g0=gzones[0];R.ter=g0?terrainAt(g0.x,g0.z):null}
   // 截图用：打开一个冰窟窿 / 通电一块地板，把玩家放旁边
   const h=HZ.find(h=>h.k==='hole'||h.k==='pad');if(h){if(h.k==='hole'){h.ph='open';h.t=.5;h.T=99}else{h.ph='on';h.t=0;h.T=99}const P=__game.player;const s=sdist(POLY,h.x-h.r-5,h.z+2).s<-2?-1:1;P.x=h.x+s*(h.r+5);P.z=h.z+2;P.vx=P.vz=0;resetView()}
   await S(400);let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});R.fps=+(fr/3).toFixed(1);return R},mk);
  const need=mk==='ice'?r.n.hole>=2:r.n.belt>=2&&r.n.pad>=2;ok(need&&!r.spawnBad&&!r.wallBad&&!r.pkBad&&(mk!=='ice'||r.ter==='oil'),`${vn} ${mk} 8车 机关布置/出生点/道具点安全${mk==='ice'?'/冰面打滑':''}`,r);ok(r.fps>=50,`${vn} ${mk} 8车 FPS`,r.fps);
  await g.screenshot({path:SH+vn+'_'+mk+'.png'});await g.evaluate(()=>{for(const h of __maps.HZ)if(h.T>=99)h.T=1})}
 if(vn==='desk'){
  const e=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const R={};MODE='brawl';__game.noEnd=true;
   const prep=()=>{const P=__game.player,cs=__game.cars,E=cs.find(c=>!c.isP&&c.alive);for(const c of cs)if(c!==P&&c!==E){c.alive=false;c.x=c.z=-999}E.ai.hz=99;return{P,E}};
   // 冰窟窿：对手被玩家撞过后掉进去 → 淘汰并记玩家击杀
   buildArena('ice',arenaR(6));start('fang');await S(2600);{const{P,E}=prep();const h=__maps.HZ.find(h=>h.k==='hole');const k0=kills;E.hp=E.maxhp;E.x=h.x;E.z=h.z;E.vx=E.vz=0;E.lastBy=P;E.lastByT=time;h.ph='open';h.t=0;h.T=5;await S(300);R.hole={alive:E.alive,hpPct:+(E.hp/E.maxhp).toFixed(2),out:+(Math.hypot(E.x-h.x,E.z-h.z)-h.r).toFixed(1)};
    E.hp=E.maxhp*.3;E.x=h.x;E.z=h.z;E.vx=E.vz=0;E.holeCd=0;E.lastBy=P;E.lastByT=time;await S(300);R.hole.dead=!E.alive;R.hole.credit=kills-k0}
   // AI 躲预警冰窟窿：AI 停在边缘，冰窟窿预警 → 应远离
   start('fang');await S(2600);{const P=__game.player;const h=__maps.HZ.find(h=>h.k==='hole');const A=__game.cars.find(c=>!c.isP);for(const c of __game.cars)if(c!==A&&!c.isP){c.alive=false;c.x=c.z=-999}P.x=h.x+30;P.z=h.z;A.x=h.x+h.r+1;A.z=h.z;A.vx=A.vz=0;A.ai.t=null;h.ph='warn';h.t=0;h.T=9;const d0=Math.hypot(A.x-h.x,A.z-h.z);await S(1500);R.avoid={d0:+d0.toFixed(1),d1:+Math.hypot(A.x-h.x,A.z-h.z).toFixed(1),alive:A.alive};h.T=.1}
   // 电地板：通电时扣血、减速
   buildArena('factory',arenaR(6));start('fang');await S(2600);{const{P,E}=prep();const h=__maps.HZ.find(h=>h.k==='pad');E.x=h.x;E.z=h.z;E.vx=E.vz=0;E.hp=E.maxhp;E.shT=0;h.ph='on';h.t=0;h.T=9;await S(1000);R.pad={dmg:Math.round(E.maxhp-E.hp)};h.T=.1;
    // 传送带：玩家不动也被带走
    const bt=__maps.HZ.find(h=>h.k==='belt');__game.testInp=[0,0];P.x=bt.x;P.z=bt.z;P.vx=P.vz=0;P.h=Math.PI/2;const x0=P.x;await S(800);R.belt={dx:+((P.x-x0)*bt.dir).toFixed(1)};__game.testInp=null}
   R.hs=JSON.parse(JSON.stringify(__maps.HS));return R});
  ok(e.hole.alive&&Math.abs(e.hole.hpPct-.4)<.03&&e.hole.out>0&&e.hole.dead&&e.hole.credit===1,'冰窟窿：满血掉入扣 60% 并弹出；残血掉入淘汰 + 击杀归属',e.hole);ok(e.avoid.alive&&e.avoid.d1>e.avoid.d0+1.5,'AI 躲开预警冰窟窿',e.avoid);ok(e.pad.dmg>=15,'电地板通电扣血',e.pad);ok(e.belt.dx>=3,'传送带带着车走',e.belt);
  // AI 利用机关：目标站在开着的冰窟窿边，AI 应绕到目标另一侧往坑里推
  const use=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));buildArena('ice',arenaR(6));start('fang');await S(2600);const P=__game.player,h=__maps.HZ.find(h=>h.k==='hole'),A=__game.cars.find(c=>!c.isP&&c.alive);
   __game.testInp=[0,0];h.ph='open';h.t=0;h.T=99;const s=sdist(POLY,h.x+h.r+3,h.z).s<-2?1:-1;P.x=h.x+s*(h.r+2.5);P.z=h.z;P.vx=P.vz=0;A.x=h.x+s*(h.r+2.5);A.z=h.z+8;A.vx=A.vz=0;A.ai.t=P;A.ai.tgtT=9;A.ai.mpUse=true;A.ai.mpT=9;const p0=__maps.HS.push;
   const[ix,iz]=aiThink(A,.016),px=P.x+s*3,pz=P.z,L=Math.hypot(px-A.x,pz-A.z),dot=(ix*(px-A.x)+iz*(pz-A.z))/L/(Math.hypot(ix,iz)||1);h.T=.1;__game.testInp=null;return{dot:+dot.toFixed(2),push:__maps.HS.push>p0}});
  ok(use.push&&use.dot>.6,'AI 会绕到目标背后往机关推',use)}
 // 道具持有 / 手动释放
 const it=await g.evaluate(async(vn)=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const R={};MODE='brawl';__game.noEnd=true;buildArena('site',arenaR(6));start('fang');await S(2600);
  const P=__game.player,IB=document.getElementById('itemBtn');for(const c of __game.cars)if(!c.isP){c.ai.hz=99}__game.testInp=[0,0];P.vx=P.vz=0;
  const pick=async k=>{__v11.PK.push({k,x:P.x,z:P.z,t:0,life:25});await S(250)};
  R.empty0=IB.classList.contains('empty');await pick('missile');R.held=P.held;R.ms=__items.MS.length;R.btnOn=!IB.classList.contains('empty');R.icon=IB.querySelector('i').textContent;
  await pick('oil');R.replaced=P.held;const hp0=(P.hp=P.maxhp*.5);await pick('heal');R.heal=P.hp>hp0+1&&P.held==='oil';
  const r=IB.getBoundingClientRect();R.btn={x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,vis:r.width>0&&getComputedStyle(IB).display!=='none'};const d=document.getElementById('dash').getBoundingClientRect();R.dash={x:d.x+d.width/2,y:d.y+d.height/2};
  const ov=(a,b)=>!(a.right<b.left||b.right<a.left||a.bottom<b.top||b.bottom<a.top);R.overlap=['dash','rev','joy'].filter(id=>{const q=document.getElementById(id);return q&&ov(r,q.getBoundingClientRect())});return R},vn);
 ok(it.empty0&&it.held==='missile'&&it.ms===0&&it.btnOn&&it.icon==='🚀',vn+' 拾取攻击道具 → 持有，不立即释放，按钮显示图标',it);ok(it.replaced==='oil','新攻击道具替换旧的',it.replaced);ok(it.heal,'回血类仍即吃即用、不占道具栏');ok(it.btn.vis&&!it.overlap.length,vn+' 道具按钮在冲刺旁、不遮挡',{btn:it.btn,dash:it.dash,overlap:it.overlap});
 await g.screenshot({path:SH+vn+'_held.png'});
 // 释放：桌面按 E，手机点按钮
 if(vn==='desk')await g.keyboard.press('KeyE');else await g.touchscreen.tap(it.btn.x,it.btn.y);await W(300);
 const fr=await g.evaluate(()=>({held:__game.player.held,oil:__items.OIL.length,empty:document.getElementById('itemBtn').classList.contains('empty'),ev:JSON.parse(localStorage.getItem('carbrawl_track')||'[]').filter(e=>e.event==='item_use').map(e=>e.how)}));
 ok(!fr.held&&fr.oil>=1&&fr.empty&&fr.ev.includes(vn==='desk'?'key':'btn'),vn+(vn==='desk'?' E 键':' 点道具按钮')+'释放 + item_use 埋点',fr);
 if(vn==='desk'){
  const m=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const P=__game.player;__game.testInp=[1,0];for(let i=0;i<3;i++){P.held='mine';__items.fire(P,'test');await S(250)}const mine=__items.MN.filter(n=>n.by===P);const R={n:mine.length,life:TUNE.items.mine.life};mine[0].t=TUNE.items.mine.life-.1;await S(300);R.after=__items.MN.filter(n=>n.by===P).length;__game.testInp=null;return R});
  ok(m.n===2&&m.life===12&&m.after===1,'地雷每车最多 2 颗、12 秒消失',m);
  // AI 释放：给每辆 AI 一个攻击道具，3 秒内有人按时机释放，aiHold 秒内全部放完
  const a=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='brawl';buildArena('junk',arenaR(8));start('fang');await S(2600);const ks=['missile','mine','oil','magnet'],ai=__game.cars.filter(c=>!c.isP&&c.alive);ai.forEach((c,i)=>{c.held=ks[i%4];c.heldT=0});const u0=__items.ST.aiUse;
   await S(3000);const early=__items.ST.aiUse-u0;await S((TUNE.items.aiHold-1.5)*1000);return{n:ai.length,early,all:__items.ST.aiUse-u0,left:ai.filter(c=>c.alive&&c.held).length}});
  ok(a.early>=1&&a.left===0,'AI 见机释放道具（超时也会放）',a);
  const ev=await g.evaluate(()=>JSON.parse(localStorage.getItem('carbrawl_track')||'[]').map(e=>e.event));ok(ev.includes('map_hazard_start'),'埋点 map_hazard_start')}
 await g.close()}
ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
