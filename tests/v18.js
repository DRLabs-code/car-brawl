// v18 花纹涂装回归：node tests/v18.js [URL]  分组/试穿还原/购买扣费/传说仅抽奖+保底/存档/动态性能 + 各车各涂装截图
const p=require('/tmp/pt/node_modules/puppeteer-core'),fs=require('fs');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html',OUT='/workspace/car-brawl/prototype/shots/v18';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x!==''?' '+JSON.stringify(x):''));
 const pg=await b.newPage();await pg.setViewport({width:1280,height:720});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1500);
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.save.coins=5000;window.__ev=[];const t=window.track;window.track=(e,p)=>{__ev.push(e);t(e,p)};persist()});
 const R=await ev(()=>({r:Object.keys(COLORS).filter(k=>COLORS[k].rar==='r'),l:Object.keys(COLORS).filter(k=>COLORS[k].rar==='l')}));ok('稀有 6 + 传说 3',R.r.length===6&&R.l.length===3,R);
 // 截图：各车 × 各涂装（游戏内实际尺寸 + 2× 放大），16 方向条
 const shots=await ev(()=>{const ids=['gray',...Object.keys(COLORS).filter(k=>COLORS[k].rar)],out={};
  for(const k of KEYS){const cw=150,ch=130,c=document.createElement('canvas');c.width=cw*ids.length;c.height=ch*2+30;const x=c.getContext('2d');x.fillStyle='#2a2340';x.fillRect(0,0,c.width,c.height);x.font='bold 14px sans-serif';x.textAlign='center';
   ids.forEach((id,i)=>{const cs={...save.cars[k],paint:{color:id,livery:null}};drawFull(x,k,cs,3,i*cw+cw/2,92,1,0);drawFull(x,k,{...cs,paint:{color:id,livery:'stripe'}},11,i*cw+cw/2,92+ch,1,0);x.fillStyle=COLORS[id].rar==='l'?'#ffb020':COLORS[id].rar==='r'?'#5fb8ff':'#fff';x.fillText(COLORS[id].n,i*cw+cw/2,c.height-8)});out[k]=c.toDataURL()}
  for(const id of ['camoJ','flame','iri']){const c=document.createElement('canvas');c.width=16*110;c.height=120;const x=c.getContext('2d');x.fillStyle='#2a2340';x.fillRect(0,0,c.width,c.height);for(let i=0;i<16;i++)drawFull(x,'fang',{...save.cars.fang,paint:{color:id,livery:null}},i,i*110+55,84,.6,0);out['dirs_'+id]=c.toDataURL()}return out});
 for(const[k,v]of Object.entries(shots))fs.writeFileSync(`${OUT}/${k.startsWith('dirs')?k:'all_'+k}.png`,Buffer.from(v.split(',')[1],'base64'));
 // 车库分组
 await ev(()=>{openGarage('fang');gTab='look';renderGarage()});await W(400);
 const g=await ev(()=>({h:[...document.querySelectorAll('#garage .rarh')].map(e=>e.textContent),r:document.querySelectorAll('#garage .sw2.rar-r').length,l:document.querySelectorAll('#garage .sw2.rar-l').length}));ok('车库按稀有度分组+色框',g.h.length===3&&g.r===6&&g.l===3,g);
 // 稀有：试穿不扣、离开还原、购买扣费+装备
 await ev(()=>document.querySelector('[data-col="flame"]').click());await W(500);await pg.screenshot({path:`${OUT}/garage_try_flame.png`});
 let s=await ev(()=>({c:__game.save.coins,col:__game.save.cars.fang.paint.color,pv:__pv()&&__pv().id,buy:!!document.getElementById('tryBuy')}));ok('稀有试穿不扣费',s.c===5000&&s.col==='gray'&&s.pv==='flame'&&s.buy,s);
 await ev(()=>$('gBack').click());ok('离开车库还原',await ev(()=>!__pv()&&__game.save.cars.fang.paint.color==='gray'));
 await ev(()=>{openGarage('fang');gTab='look';renderGarage();document.querySelector('[data-col="flame"]').click()});await W(200);await ev(()=>$('tryBuy').click());await W(150);await ev(()=>$('cfOk').click());await W(500);
 s=await ev(()=>({c:__game.save.coins,own:!!__game.save.colors.flame,eq:__game.save.cars.fang.paint.color}));ok('稀有购买扣 600 + 自动装备',s.c===4400&&s.own&&s.eq==='flame',s);
 // 传说：只能抽奖/宝箱
 await ev(()=>document.querySelector('[data-col="iri"]').click());await W(500);await pg.screenshot({path:`${OUT}/garage_try_iri.png`});
 s=await ev(()=>({buy:!!document.getElementById('tryBuy'),daily:!!document.getElementById('tryDaily'),c:__game.save.coins}));ok('传说试穿：无购买，仅抽奖入口',!s.buy&&s.daily&&s.c===4400,s);
 await ev(()=>$('gBack').click());
 // 保底：第 30 次必出
 s=await ev(()=>{const g=__game;g.save.legPity=29;const got=spinOnce();return{got:Object.keys(got).filter(k=>k.startsWith('col:')),pity:g.save.legPity}});ok('抽奖保底第 30 次必出传说',s.got.length===1&&s.pity===0,s);
 s=await ev(()=>{const g=__game;g.save.legPity=0;let n=0,hit=0;for(let i=0;i<60;i++){const got=openChest();if(Object.keys(got).some(k=>k.startsWith('col:')))hit++;n++;if(!__v18.LEG().length)break}return{hit,n,left:__v18.LEG().length}});ok('宝箱出传说直到集齐',s.left===0||s.hit>0,s);
 const evs=await ev(()=>__ev);await ev(()=>{__game.save.legPity=7;persist()});await pg.reload();await W(1500);s=await ev(()=>({lp:__game.save.legPity,flame:!!__game.save.colors.flame,eq:__game.save.cars.fang.paint.color}));ok('存档保留保底计数/图案拥有/装备',s.lp===7&&s.flame&&s.eq==='flame',s);
 // 对战：8 车全动态涂装 vs 全素灰 FPS
 const fps=async col=>ev(async col=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.save.colors[col]=true;g.save.cars.fang.paint.color=col;g.save.cars.fang.lv=10;g.noEnd=true;buildArena('junk',arenaR(8));start('fang',{});for(const c of g.cars){c.invT=99;if(!c.isP)c.skin=compose(c.k,col,null)}
  await new Promise(r=>setTimeout(r,2600));let fr=0;const t0=performance.now();await new Promise(r=>{const f=()=>{fr++;if(performance.now()-t0<4000)requestAnimationFrame(f);else r()};requestAnimationFrame(f)});return+(fr/4).toFixed(1)},col);
 const f0=await fps('gray');await pg.screenshot({path:`${OUT}/battle_gray.png`});const f1=await fps('iri');await pg.screenshot({path:`${OUT}/battle_iri.png`});const f2=await fps('chrome');const f3=await fps('camoJ');await pg.screenshot({path:`${OUT}/battle_camo.png`});
 ok('8 车动态涂装 FPS 不降（≥ 素灰 90%）',f1>=f0*.9&&f2>=f0*.9,{gray:f0,iri:f1,chrome:f2,camo:f3});
 ok('对战中无未拥有涂装（玩家）',await ev(()=>{const cs=__game.save.cars.fang;return __game.save.colors[cs.paint.color]}));
 ok('埋点 skin_preview/skin_buy/legend_skin_get',['skin_preview','skin_buy','legend_skin_get'].every(e=>evs.includes(e)),[...new Set(evs)]);
 ok('无报错',!errs.length,errs);console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
