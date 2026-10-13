// v15 回归：node tests/v15.js [URL]  车辆命名（免费/付费/校验/取消不扣费）+ 涂装试穿/还原/购买扣费 + 首页
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const OUT=process.argv[3]||'/workspace/car-brawl/prototype/shots/v15';
(async()=>{require('fs').mkdirSync(OUT,{recursive:true});const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const L=[],ok=(n,c,x='')=>L.push((c?'✓ ':'✗ ')+n+(x?' '+JSON.stringify(x):''));
 for(const [tag,vp] of [['desk',{width:1280,height:720}],['mob',{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true}],['por',{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}]]){
 const pg=await b.newPage();await pg.setViewport(vp);const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1200);
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.save.coins=700;window.__ev=[];const t=window.track;window.track=(e,p)=>{__ev.push([e,p]);t(e,p)};menu()});await W(900);
 await pg.screenshot({path:`${OUT}/${tag}_menu_guide.png`});await ev(()=>{const g=document.getElementById('mGuide');g.onclick&&g.onclick()});await W(300);await pg.screenshot({path:`${OUT}/${tag}_menu.png`});
 const k0=await ev(()=>gKey);await ev(()=>$('mNext').click());await W(400);ok(tag+' 首页切车',await ev(k=>gKey!==k,k0));await pg.screenshot({path:`${OUT}/${tag}_menu_next.png`});
 if(tag!=='desk'){await pg.close();continue}
 // 改名：免费
 await ev(()=>openGarage('fang'));await W(500);await ev(()=>document.querySelector('[data-rename="fang"]').click());await W(300);
 ok('输入框打开',await ev(()=>!!document.getElementById('tinI')));await pg.type('#tinI','  ');await ev(()=>$('tinOk').click());ok('空名被拒',await ev(()=>!!document.getElementById('tinI')&&$('tinE').textContent.length>0));
 await ev(()=>{$('tinI').value='傻逼车';$('tinI').dispatchEvent(new Event('input'));$('tinOk').click()});ok('敏感词被拒',await ev(()=>!!document.getElementById('tinI')));
 await ev(()=>{$('tinI').value='  小黑鲨  ';$('tinI').dispatchEvent(new Event('input'))});await pg.screenshot({path:`${OUT}/desk_rename_input.png`});await ev(()=>$('tinOk').click());await W(400);
 let s=await ev(()=>({n:__game.save.cars.fang.name,c:__game.save.coins}));ok('首次免费命名',s.n==='小黑鲨'&&s.c===700,s);
 // 付费改名：取消不扣费，确认扣 500
 await ev(()=>document.querySelector('[data-rename="fang"]').click());await W(200);await ev(()=>{$('tinI').value='Fang号';$('tinI').dispatchEvent(new Event('input'))});await pg.screenshot({path:`${OUT}/desk_rename_paid.png`});await ev(()=>$('tinX').click());
 s=await ev(()=>({n:__game.save.cars.fang.name,c:__game.save.coins}));ok('付费改名取消不扣费',s.n==='小黑鲨'&&s.c===700,s);
 await ev(()=>document.querySelector('[data-rename="fang"]').click());await W(200);await ev(()=>{$('tinI').value='Fang号';$('tinI').dispatchEvent(new Event('input'));$('tinOk').click()});await W(300);await ev(()=>{const c=document.getElementById('cfOk');c&&c.click()});await W(400);
 s=await ev(()=>({n:__game.save.cars.fang.name,c:__game.save.coins}));ok('付费改名扣 500',s.n==='Fang号'&&s.c===200,s);await pg.screenshot({path:`${OUT}/desk_garage_named.png`});
 // 涂装：试穿/还原/购买
 await ev(()=>{__game.save.coins=1000;gTab='look';renderGarage()});await W(300);
 const cid=await ev(()=>Object.keys(COLORS).find(c=>!__game.save.colors[c]&&COLORS[c].p>0));const orig=await ev(()=>__game.save.cars.fang.paint.color);
 await ev(c=>document.querySelector(`[data-col="${c}"]`).click(),cid);await W(500);
 s=await ev(()=>({pv:__pv(),c:__game.save.coins,col:__game.save.cars.fang.paint.color,bar:!!document.querySelector('.trybar #tryBuy')}));ok('试穿不扣费不改存档',s.pv&&s.c===1000&&s.col===orig&&s.bar,s);await pg.screenshot({path:`${OUT}/desk_skin_try.png`});
 await ev(()=>$('gBack').click());await W(300);ok('离开车库还原',await ev(()=>!__pv()&&__game.save.cars.fang.paint.color!==undefined));
 await ev(c=>{openGarage('fang');gTab='look';renderGarage();document.querySelector(`[data-col="${c}"]`).click()},cid);await W(200);
 await ev(()=>{const t=document.querySelector('[data-gtab]:not(.on)');t&&t.click()});await W(200);ok('切页还原',await ev(()=>!__pv()));
 await ev(c=>{gTab='look';renderGarage();document.querySelector(`[data-col="${c}"]`).click()},cid);await W(200);
 await ev(()=>{const o=KEYS.find(k=>k!=='fang');gKey=o;renderGarage()});ok('切车还原',await ev(()=>!__pv()));
 // 进对战：未拥有颜色绝不出现
 await ev(c=>{gKey='fang';gTab='look';renderGarage();document.querySelector(`[data-col="${c}"]`).click()},cid);await W(200);
 await ev(()=>{__game.noEnd=true;buildArena('site',arenaR(4));start('fang',{})});await W(1500);ok('对战中无未拥有涂装',await ev(c=>{const P=__game.player,cs=__game.save.cars.fang;return P.skin===compose('fang',cs.paint.color,cs.paint.livery)&&P.skin!==compose('fang',c,cs.paint.livery)&&!__pv()},cid));
 await ev(()=>{running=false;menu()});
 // 购买：取消→不扣；确认→扣费+拥有+装备
 await ev(c=>{openGarage('fang');gTab='look';renderGarage();document.querySelector(`[data-col="${c}"]`).click()},cid);await W(200);
 await ev(()=>$('tryBuy').click());await W(200);await pg.screenshot({path:`${OUT}/desk_skin_confirm.png`});await ev(()=>$('cfX').click());
 s=await ev(c=>({c:__game.save.coins,own:!!__game.save.colors[c]}),cid);ok('购买取消不扣',s.c===1000&&!s.own,s);
 const price=await ev(c=>COLORS[c].p,cid);await ev(()=>$('tryBuy').click());await W(100);await ev(()=>$('cfOk').click());await W(350);await pg.screenshot({path:`${OUT}/desk_skin_bought.png`});await W(900);
 s=await ev(c=>({c:__game.save.coins,own:!!__game.save.colors[c],eq:__game.save.cars.fang.paint.color===c,pv:__pv()}),cid);ok('购买扣费+自动装备',s.c===1000-price&&s.own&&s.eq&&!s.pv,s);
 // 金币不足
 const lid=await ev(()=>Object.keys(LIVS).find(l=>!__game.save.livs[l]&&!LIVS[l].lim));await ev(l=>{__game.save.coins=10;renderGarage();document.querySelector(`[data-liv="${l}"]`).click()},lid);await W(300);
 s=await ev(()=>({poor:!!document.querySelector('.trybar button[disabled]'),txt:(document.querySelector('.trybar')||{}).textContent,ad:!!$('coinAdBtn')}));ok('金币不足置灰+还差+广告入口',s.poor&&/还差/.test(s.txt)&&s.ad,s);await pg.screenshot({path:`${OUT}/desk_skin_poor.png`});
 const evs=await ev(()=>__ev.map(e=>e[0]));ok('埋点',['skin_preview','skin_buy','skin_buy_cancel','car_rename'].every(e=>evs.includes(e)),[...new Set(evs)]);
 ok('无报错',!errs.length,errs);await pg.close()}
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
