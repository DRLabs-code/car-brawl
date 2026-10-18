// v24 回归：node tests/v24.js [URL]  8 个特效部件（定义/稀有度/图标/图层/车库说明 + 每个效果实测）、新皮肤（普通/稀有图案/传说动态/限定涂装）、埋点、FPS + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v24/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
const FX=['drill','shockRam','shieldGen','magShell','twinDash','regenEngine','boostTire','driftTire'];
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [vn,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const g=await b.newPage();g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
 await g.evaluate(FX=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.coins=99999;for(const id in PARTS)s.owned[id]=true;s.cars.beast.lv=10;s.cars.beast.equip={front:'drill',armor:'shieldGen',engine:'twinDash',tire:'boostTire'};persist()},FX);
 if(vn==='desk'){const d=await g.evaluate(async FX=>{const per={};for(const id of FX){const p=PARTS[id];per[p.slot]=(per[p.slot]||0)+1}for(const k of['tyrant','fang','beast'])for(const id of FX)partImg(k,id);await new Promise(r=>setTimeout(r,1500));const lay=['tyrant','fang','beast'].every(k=>FX.every(id=>{const im=LAYI[k+'_part_'+id];return im&&im.complete&&im.naturalWidth===512}));
   return{per,rar:FX.map(id=>PARTS[id].r).join(''),fx:FX.every(id=>/✦/.test(PARTS[id].desc)),lay,tune:FX.every(id=>TUNE.parts[id])}},FX);
  ok(Object.values(d.per).every(n=>n>=2)&&Object.keys(d.per).length===4&&d.fx&&d.tune,'每槽位 ≥2 个特效部件，说明含效果，参数在 TUNE.parts',d);ok(d.lay,'3 台车 × 8 个新部件图层已加载');ok(/b/.test(d.rar)&&/p/.test(d.rar)&&/g/.test(d.rar),'稀有度分布 稀有/史诗/传说',d.rar)}
 // 车库：图标 + 说明
 const gar=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));openGarage();await S(700);const ch=document.querySelector('#garage .pchip.ipc[data-id=shockRam]');ch&&ch.click();await S(400);
  const box=document.querySelector('#garage .cmpbox'),ic=document.querySelector('#garage .pchip.ipc[data-id=shockRam] .ic i');const bp=ic?getComputedStyle(ic).backgroundPosition:'';const r=ic?ic.getBoundingClientRect():{width:0};
  return{cmp:box?box.textContent:'',bp,icw:Math.round(r.width),txt:(document.querySelector('#garage').textContent.match(/✦/g)||[]).length,over:[...document.querySelectorAll('#garage .gopts')].some(e=>e.scrollWidth>e.clientWidth+1)}});
 ok(/电击撞角/.test(gar.cmp)&&/✦ 撞击让对手失控/.test(gar.cmp)&&/14\.2857%\s+75%/.test(gar.bp)&&gar.icw>=30&&!gar.over,vn+' 车库：特效部件图标（第 4 行）+ 效果说明，部件行不溢出',gar);await g.screenshot({path:SH+vn+'_garage_front.png'});
 await g.evaluate(async()=>{const e=[...document.querySelectorAll('#garage .crow')].find(e=>/吸血钻头/.test(e.textContent));e&&e.scrollIntoView({block:'center'})});await W(400);await g.screenshot({path:SH+vn+'_garage_craft.png'});
 const sw=await g.evaluate(async()=>{const t=document.querySelector('[data-gtab="look"]');t&&t.click();await new Promise(r=>setTimeout(r,400));const ids=[...document.querySelectorAll('#garage [data-col]')].map(b=>b.dataset.col);const lv=[...document.querySelectorAll('#garage [data-liv]')].map(b=>b.dataset.liv);return{ids,lv}});
 ok(['teal','grape','digi','tiger','lava'].every(i=>sw.ids.includes(i))&&sw.lv.includes('iceRoof'),vn+' 车库有新皮肤（普通/稀有/传说/限定涂装）',sw);await g.screenshot({path:SH+vn+'_garage_skins.png'});
 if(vn==='desk'){
  // 皮肤渲染：图案 + 动态
  const sk=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const s=__game.save;for(const c of['digi','tiger','lava','teal','grape'])s.colors[c]=true;s.livs.iceRoof=true;s.cars.fang.paint={color:'tiger',livery:'iceRoof'};s.cars.tyrant.paint={color:'digi',livery:null};s.cars.beast.paint={color:'lava',livery:null};persist();
   const out={};for(const[k,c]of[['fang','tiger'],['tyrant','digi'],['beast','lava']]){const o=compose(k,c,null);const x=o.getContext('2d').getImageData(0,0,o.width,o.height).data;let n=0;for(let i=3;i<x.length;i+=4*97)if(x[i]>0)n++;out[c]=n}return out});
  ok(Object.values(sk).every(n=>n>50),'新图案/动态皮肤合成正常',sk);
  // 特效实测
  const fx=await g.evaluate(async FX=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const R={};MODE='brawl';__game.noEnd=true;buildArena('site',arenaR(6));start('beast');await S(2600);
   const P=__game.player,cs=__game.cars,E=cs.find(c=>!c.isP);for(const c of cs)if(c!==P&&c!==E){c.alive=false;c.x=c.z=-999}E.ai.hz=99;E.eq=[];__game.testInp=[0,0];const at=(c,x,z,h)=>{c.x=x;c.z=z;c.h=h;c.vx=c.vz=0};const ST=__parts.ST;
   {const pr=__game.props;for(let i=pr.length-1;i>=0;i--){const q=pr[i];if(q.solid&&!q.wall&&q.x>-30&&q.x<30&&q.z>-30&&q.z<-8)pr.splice(i,1)}buildGrid()}
   R.eq=P.eq.slice();
   // 吸血钻头 + 电击撞角：P 高速撞 E
   P.eq=['drill','shockRam'];P.hp=P.maxhp*.5;E.hp=E.maxhp;E.invT=0;P.invT=0;at(P,0,-20,0);at(E,0,-16.6,0);P.vz=20;const hp0=P.hp,s0=ST.steal,k0=ST.shock;let selfD=0;const _hu=hurt;hurt=function(c,d,by){const h=c.hp,r=_hu.apply(this,arguments);if(c===P)selfD+=Math.max(0,h-c.hp);return r};await S(250);hurt=_hu;R.drill={steal:+(ST.steal-s0).toFixed(1),dealt:Math.round(E.maxhp-E.hp),selfD:+selfD.toFixed(1),hpUp:+(P.hp-hp0).toFixed(1)};R.shock={n:ST.shock-k0,stun:+(E.stunT||0).toFixed(2)};
   // 护盾发生器
   P.eq=['shieldGen'];P.shT=0;P.sgT=.05;await S(200);R.shield={shT:+P.shT.toFixed(1)};
   // 磁力外壳：道具被吸过来
   P.eq=['magShell'];at(E,20,-28,0);at(P,-10,-20,0);__v11.PK.length=0;__v11.PK.push({k:'heal',x:-2,z:-20,t:0,life:25});const pk=__v11.PK[0];await S(500);R.mag={d:+Math.hypot(pk.x-P.x,pk.z-P.z).toFixed(1),eaten:!__v11.PK.includes(pk)};
   // 回收引擎：脱战回血
   P.eq=['regenEngine'];P.hp=P.maxhp*.5;P.lastHurtT=time-5;const h1=P.hp;await S(1000);R.regen=+(P.hp-h1).toFixed(2);
   // 漂移胎：侧滑时冷却加快
   P.eq=['driftTire'];P.dcd=3;at(P,0,-20,0);const d0=P.dcd;P.vx=9;await S(300);const dDrift=d0-P.dcd;P.eq=[];P.dcd=3;at(P,0,-20,0);P.vx=9;await S(300);const dBase=3-P.dcd;R.drift={dDrift:+dDrift.toFixed(2),dBase:+dBase.toFixed(2)};
   // 加速带轮胎（对战）：吃加速道具 → 额外加速
   P.eq=['boostTire'];at(P,-10,-20,0);__v11.PK.push({k:'boost',x:-10,z:-20,t:0,life:25});await S(250);R.boostB={btT:+(P.btT||0).toFixed(1)};
   // 双冲刺引擎：连按两次冲刺
   P.eq=['twinDash'];P.ch=1;P.dcd=0;at(P,0,-24,0);__game.testInp=[0,1];return R},FX);
  ok(fx.drill.steal>=2&&Math.abs(fx.drill.steal-fx.drill.selfD-fx.drill.hpUp)<.6&&fx.drill.steal<=fx.drill.dealt*.3+.5,'吸血钻头：撞击回血（回血 = 30%×伤害；净耐久 = 回血 − 自伤）',fx.drill);ok(fx.shock.n>=1&&fx.shock.stun>0,'电击撞角：撞击让对手失控',fx.shock);ok(fx.shield.shT>0,'护盾发生器：定时自动护盾',fx.shield);ok(fx.mag.eaten||fx.mag.d<6,'磁力外壳：吸来道具',fx.mag);ok(fx.regen>=1,'回收引擎：脱战回血',fx.regen);ok(fx.drift.dDrift>fx.drift.dBase*1.5,'漂移胎：漂移时冷却更快',fx.drift);ok(fx.boostB.btT>0,'加速带轮胎（对战）：加速道具额外加速',fx.boostB);
  await g.keyboard.press('Space');await W(650);const tw1=await g.evaluate(()=>({dcd:+__game.player.dcd.toFixed(2),ch:__game.player.ch,badge:document.getElementById('dash').dataset.ch}));await g.keyboard.press('Space');await W(80);
  const tw=await g.evaluate(t=>({...t,dash2:__game.player.dash>0,dcd2:+__game.player.dcd.toFixed(2),n:__parts.ST.dash2}),tw1);ok(tw.ch===0&&tw.dash2&&tw.dcd2>1&&tw.n>=1,'双冲刺引擎：0.35 秒后可再冲一次',tw);
  // 竞速：加速带轮胎过加速带更快
  const rc=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='race';__game.noEnd=true;buildArena('track',arenaR(8));const run=async eq=>{start('fang');await S(2600);const P=__game.player;for(const c of __game.cars)if(c!==P){c.x=-32;c.z=0;c.vx=c.vz=0}__items.MS.length=0;__items.MN.length=0;__items.OIL.length=0;__v11.PK.length=0;P.eq=eq;P.x=6;P.z=-31;P.h=Math.PI/2;P.vx=12;P.vz=0;__game.testInp=[1,0];let mx=0;for(let i=0;i<40;i++){await S(50);mx=Math.max(mx,Math.hypot(P.vx,P.vz))}return+mx.toFixed(1)};const a=await run([]),b=await run(['boostTire']);__game.testInp=null;MODE='brawl';return{base:a,tire:b}});
  ok(rc.tire>rc.base+1,'加速带轮胎（竞速）：过加速带更快',rc);
  // 8 车全员特效部件 FPS + 埋点
  const fp=await g.evaluate(async FX=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='brawl';__game.testInp=null;buildArena('junk',arenaR(8));start('beast');await S(1500);__game.cars.forEach((c,i)=>{if(!c.isP)c.eq=[FX[i%8],FX[(i+3)%8]]});await S(1000);let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});
   return{fps:+(fr/4).toFixed(1),st:JSON.parse(JSON.stringify(__parts.ST)),ev:JSON.parse(localStorage.getItem('carbrawl_track')||'[]').filter(e=>e.event==='fx_part_start').map(e=>e.parts)}},FX);
  ok(fp.fps>=50,'8 车全员特效部件 FPS',fp.fps);ok(fp.ev.length>=1&&/drill/.test(fp.ev.join()),'埋点 fx_part_start',fp.ev.slice(0,2));await g.screenshot({path:SH+'desk_battle_fx.png'})}
 await g.close()}
ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
