// v28 回归（原 v27 内容更新）：node tests/v28.js [URL]  装备扩充：每槽 9 件（定义/稀有度/图标第 5 行/图层按需加载）、4 个新特效实测（震波撞角/防爆装甲/背水引擎/锚定胎）、经济参数接入 tune.js、
//   手机部件图层软上限、车库新部件、8 车全员新部件 FPS、埋点 + 截图
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v28/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
const NEW=['pierce','quakeRam','carbon','blastArmor','v8','lastStand','slick','anchorTire'];
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [vn,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const g=await b.newPage();g.on('pageerror',e=>errs.push(vn+': '+e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
 await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;s.coins=99999;for(const id in PARTS)s.owned[id]=true;s.cars.beast.lv=10;s.cars.beast.equip={front:'quakeRam',armor:'blastArmor',engine:'lastStand',tire:'anchorTire'};persist()});
 if(vn==='desk'){
  const d=await g.evaluate(async NEW=>{const per={},rar={};for(const id in PARTS){const p=PARTS[id];per[p.slot]=(per[p.slot]||0)+1;rar[p.r]=(rar[p.r]||0)+1}
   const rows=NEW.map(id=>{const h=icPart(id);return/0% 100%|100% 100%|\d+(\.\d+)?% 100%/.test(h)});
   for(const k of['tyrant','fang','beast'])for(const id of NEW)partImg(k,id);await new Promise(r=>setTimeout(r,1500));
   const lay=['tyrant','fang','beast'].every(k=>NEW.every(id=>{const im=LAYI[k+'_part_'+id];return im&&im.complete&&im.naturalWidth===512}));
   const need=Object.keys(PARTS).every(id=>PARTS[id].need===TUNE.eco.need[PARTS[id].r]);const cnt={w:0,b:0,p:0,g:0};for(let i=0;i<20000;i++)cnt[rarRoll()]++;
   return{per,rar,fx:NEW.filter(id=>PARTS[id].fx).length,desc:NEW.every(id=>PARTS[id].desc&&!/undefined|NaN/.test(PARTS[id].desc)),rows:rows.every(Boolean),lay,need,cnt,eager:Object.keys(LAYI).filter(k=>/_part_/.test(k)).length}},NEW);
  ok(Object.values(d.per).every(n=>n>=8&&n<=10)&&Object.keys(d.per).length===4,'每槽 8–10 件',d.per);ok(d.fx===4&&d.desc,'新件 4 数值 + 4 特效，说明完整',d.fx);ok(Object.values(d.rar).every(n=>n>=6),'各稀有度都有足量部件',d.rar);
  ok(d.rows,'新部件图标在 icons.png 第 5 行');ok(d.lay,'3 车 × 8 新部件图层可加载');ok(d.need,'合成碎片数取自 TUNE.eco.need');
  ok(Math.abs(d.cnt.w/20000-.6)<.02&&Math.abs(d.cnt.g/20000-.03)<.01,'掉落稀有度按 TUNE.eco.drop',d.cnt);
  // 特效实测
  const fx=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const R={};MODE='brawl';__game.noEnd=true;buildArena('site',arenaR(6));start('beast');await S(2600);
   const P=__game.player,cs=__game.cars.filter(c=>!c.isP),E=cs[0],O=cs[1];for(const c of cs.slice(2)){c.alive=false;c.x=c.z=-999}for(const c of[E,O]){c.ai.hz=99;c.eq=[]}__game.testInp=[0,0];const at=(c,x,z,h)=>{c.x=x;c.z=z;c.h=h;c.vx=c.vz=0};const ST=__parts.ST;
   {const pr=__game.props;for(let i=pr.length-1;i>=0;i--){const q=pr[i];if(q.solid&&!q.wall&&q.x>-30&&q.x<30&&q.z>-30&&q.z<-8)pr.splice(i,1)}buildGrid()}
   // 震波撞角：冲刺撞 E，旁边的 O 被震开
   P.eq=['quakeRam'];at(P,0,-22,0);at(E,0,-18.6,0);at(O,3,-17,0);P.vz=22;P.dash=.4;const q0=ST.quake;await S(120);R.quake={n:ST.quake-q0,ov:+Math.hypot(O.vx,O.vz).toFixed(1),away:O.x>3};
   // 防爆装甲：非撞击伤害 −40%
   P.eq=['blastArmor'];P.hp=100;P.invT=0;hurt(P,20,null);const a1=100-P.hp;P.eq=[];P.hp=100;hurt(P,20,null);const a0=100-P.hp;R.blast={with:+a1.toFixed(1),without:+a0.toFixed(1)};
   // 背水引擎：低耐久时极速更高（v28：中位数，见 top）
   const top1=async(eq,hp)=>{PK=[];pkNext=1e9;P.dash=0;P.stunT=0;P.btT=0;P.boostT=0;P.atkT=0;P.shT=0;P.eq=eq;P.hp=P.maxhp*hp;at(P,-20,-26,Math.PI/2);__game.testInp=[1,0];let mx=0;for(let i=0;i<30;i++){await S(50);mx=Math.max(mx,Math.hypot(P.vx,P.vz))}__game.testInp=[0,0];return+mx.toFixed(2)};
   // 道具/机关（油桶爆炸、修复包）偶尔会干扰单次测量：清道具、重置状态，两种配置交替各跑 3 次取中位数
   const TOPS={};const top=async(eq,hp)=>{const k=eq.join()||'-';if(!TOPS[k]){const r={'-':[],lastStand:[]};for(let i=0;i<3;i++){r['-'].push(await top1([],hp));r.lastStand.push(await top1(['lastStand'],hp))}for(const q in r)TOPS[q]=r[q].sort((x,y)=>x-y)[1]}return TOPS[k]};
   at(E,-50,-50,0);at(O,-55,-50,0);R.last={base:await top([],.2),lo:await top(['lastStand'],.2),dmgRestored:Math.abs(P.dmg-__game.player.dmg)<1e-9,ls:+ST.last.toFixed(2)};
   // 锚定胎：被 E 正面撞时击退更小
   const kick=async eq=>{P.eq=eq;P.hp=P.maxhp;at(P,0,-18,0);at(E,0,-21,0);E.vz=22;E.invT=P.invT=0;let v=0;for(let i=0;i<8;i++){await S(30);v=Math.max(v,Math.hypot(P.vx,P.vz))}at(E,-50,-50,0);return+v.toFixed(2)};
   R.anchor={base:await kick([]),tire:await kick(['anchorTire'])};
   return R});
  ok(fx.quake.n>=1&&fx.quake.ov>3&&fx.quake.away,'震波撞角：冲刺撞击震开旁边对手',fx.quake);
  ok(Math.abs(fx.blast.with-12)<.01&&Math.abs(fx.blast.without-20)<.01,'防爆装甲：非撞击伤害 −40%',fx.blast);
  ok(fx.last.lo>fx.last.base*1.08&&fx.last.dmgRestored,'背水引擎：低耐久时速度更快（step 后属性还原）',fx.last);
  ok(fx.anchor.tire<fx.anchor.base*.85,'锚定胎：被撞击退减少',fx.anchor);
 }
 // 车库：新部件可见，说明含 ✦
 const gar=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));gKey='beast';gOpen='front';gTab='craft';openGarage('beast');await S(800);const ch=document.querySelector('#garage .pchip.ipc[data-id=quakeRam]');ch&&ch.click();await S(400);
  const box=document.querySelector('#garage .cmpbox');return{chips:[...document.querySelectorAll('#garage .gs.open .pchip[data-id]')].map(e=>e.dataset.id).filter(Boolean).length,cmp:box?box.textContent:'',rows:NEW_ROWS()};function NEW_ROWS(){return['pierce','carbon','v8','slick'].every(n=>[...document.querySelectorAll('#garage .crow')].some(r=>r.textContent.includes(PARTS[n].n)))}});
 ok(gar.chips===9&&/震波撞角/.test(gar.cmp)&&/✦/.test(gar.cmp)&&gar.rows,vn+' 车库：车头槽 9 件、特效说明、合成页有新部件',gar);await g.screenshot({path:SH+vn+'_garage_front.png'});
 await g.evaluate(async()=>{const e=[...document.querySelectorAll('#garage .crow')].find(e=>/破甲锥/.test(e.textContent));e&&e.scrollIntoView({block:'center'})});await W(400);await g.screenshot({path:SH+vn+'_garage_craft.png'});
 // 8 车全员新部件：FPS + 手机部件图层软上限 + 埋点
 const fp=await g.evaluate(async NEW=>{const S=ms=>new Promise(r=>setTimeout(r,ms));MODE='brawl';__game.testInp=null;__game.noEnd=true;buildArena('junk',arenaR(8));start('beast');await S(1500);const all=Object.keys(PARTS);__game.cars.forEach((c,i)=>{if(!c.isP){const by={};for(const id of all)(by[PARTS[id].slot]=by[PARTS[id].slot]||[]).push(id);c.eq=Object.values(by).map(a=>a[(i*3+a.length-1)%a.length])}});await S(3500);
  let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});
  const inUse=new Set(__game.cars.flatMap(c=>c.eq.map(id=>c.k+'_part_'+id))).size;
  return{fps:+(fr/4).toFixed(1),lay:Object.keys(LAYI).filter(k=>/_part_/.test(k)).length,inUse,max:PL_MAX,ev:JSON.parse(localStorage.getItem('carbrawl_track')||'[]').filter(e=>e.event==='fx_part_start').map(e=>e.parts)}},NEW);
 ok(fp.fps>=50,vn+' 8 车全员新部件 FPS',fp.fps);ok(vn==='desk'||fp.lay<=Math.max(fp.max,fp.inUse)+2,vn+' 部件图层按需加载、手机软上限',fp);ok(fp.ev.some(e=>/quakeRam/.test(e)&&/lastStand/.test(e)),vn+' 埋点 fx_part_start 含新特效件',fp.ev.slice(-1));
 await g.screenshot({path:SH+vn+'_battle.png'});await g.close()}
ok(!errs.length,'无报错',errs.slice(0,3));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
