// v13 功能回归：抽奖/广告抽/宝箱/合成/挑战跨日/设置/静音/改名/引导/广告防连点/存档损坏
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const pg=await b.newPage();await pg.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errs=[],L=[],ok=(n,c,extra='')=>L.push((c?'✓ ':'✗ ')+n+(extra?' '+extra:''));pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon/.test(m.text())&&errs.push(m.text()));
 pg.on('dialog',d=>d.accept('新名字ABC<b>超长超长超长超长')); const ev=(f,a)=>pg.evaluate(f,a);
 await pg.goto(URL);await ev(()=>localStorage.clear());await pg.reload();await W(1500);
 ok('首次进入为引导',await ev(()=>!!__game.tut&&!document.getElementById('tutBox').classList.contains('hide')));
 await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.tut=null;g.running=false;menu()});await W(300);
 // 改名
 await ev(()=>document.getElementById('menuNick').click());await W(300);const nk=await ev(()=>__game.save.nick);ok('改名过滤<>与截断12字',nk.length<=12&&!/[<>]/.test(nk),nk);
 // 静音
 const m0=await ev(()=>__game.save.settings.mute);await ev(()=>document.getElementById('muteM').click());ok('静音切换',await ev(()=>__game.save.settings.mute)!==m0);await ev(()=>document.getElementById('muteM').click());
 // 设置
 await ev(()=>document.getElementById('menuSet').click());await W(200);ok('设置打开',await ev(()=>!document.getElementById('settings').classList.contains('hide')));
 const s0=await ev(()=>__game.save.settings.sfx);await ev(()=>document.getElementById('s_sfx').click());ok('音效开关切换',(await ev(()=>__game.save.settings.sfx))!==s0);
 await ev(()=>document.getElementById('sClose').click());await W(200);
 // 抽奖
 await ev(()=>document.getElementById('menuDaily').click());await W(300);const c0=await ev(()=>JSON.stringify([__game.save.coins,__game.save.uni,__game.save.shards,__game.save.livs]));
 await ev(()=>document.getElementById('dSpin').click());await W(300);ok('免费抽奖发奖',await ev(()=>JSON.stringify([__game.save.coins,__game.save.uni,__game.save.shards,__game.save.livs]))!==c0);
 for(let i=0;i<5;i++){await ev(()=>document.getElementById('dSpin')?.click());await W(100)}ok('免费次数不为负',await ev(()=>__game.save.daily.free)>=0,String(await ev(()=>__game.save.daily.free)));
 // 广告防连点
 const n0=await ev(()=>document.querySelectorAll('#adMock').length);await ev(()=>{const e=document.getElementById('dChest');e.click();e.click();e.click()});await W(200);ok('广告连点只开一个',await ev(()=>document.querySelectorAll('#adMock').length)===1);
 await W(3600);ok('宝箱看完发奖',await ev(()=>__game.save.daily.chest)===1);
 await ev(()=>document.getElementById('dAdSpin')?.click());await W(300);await ev(()=>document.querySelector('#adMock .adx')?.click());await W(200);ok('广告中途关闭不发奖',await ev(()=>__game.save.daily.adSpin)===0);
 // 合成
 await ev(()=>{const g=__game;g.save.shards.spike=99;g.save.owned.spike=false;g.openGarage('fang')});await W(400);
 await ev(()=>{const t=[...document.querySelectorAll('[data-gtab="craft"]')][0];t&&t.click()});await W(200);
 await ev(()=>{const b=document.querySelector('[data-craft="spike"]');if(b){b.scrollIntoView();b.click()}});await W(400);ok('合成成功',await ev(()=>!!__game.save.owned.spike));
 // 每日挑战跨日
 await ev(()=>menu());const d1=await ev(()=>JSON.parse(localStorage.getItem('carbrawl_dc')).d);await ev(()=>{const d=JSON.parse(localStorage.getItem('carbrawl_dc'));d.d='2000-01-01';d.t.forEach(t=>{t.p=9;t.c=1});d.chest=1;localStorage.setItem('carbrawl_dc',JSON.stringify(d));__game.save.daily.d='2000-01-01';__game.save.daily.free=0});
 await ev(()=>openDC());const d2=await ev(()=>JSON.parse(localStorage.getItem('carbrawl_dc')));ok('挑战跨日重置',d2.d===d1&&d2.t.every(t=>t.p===0&&!t.c)&&!d2.chest);
 await ev(()=>openDaily());ok('福利跨日重置',await ev(()=>__game.save.daily.free)>0);
 // 广告位全部走 AdAdapter
 ok('AdAdapter 存在且为模拟实现',await ev(()=>window.AdAdapter&&AdAdapter.impl.name==='mock'));
 ok('showRewardedAd 走 AdAdapter',await ev(()=>/AdAdapter\.showRewarded/.test(showRewardedAd.toString())));
 // 设置里「重玩引导」
 await ev(()=>{menu();openSettings('menu')});await W(200);await ev(()=>document.getElementById('sTut').click());await W(1500);ok('重玩引导可进入',await ev(()=>!!__game.tut));
 // 存档损坏恢复
 await ev(()=>{for(const k of Object.keys(localStorage))if(/^carbrawl_save/.test(k)&&!/corrupt/.test(k))localStorage.setItem(k,'{broken')});await pg.reload();await W(1500);ok('存档损坏自动备份+不崩',await ev(()=>Object.keys(localStorage).some(k=>/corrupt/.test(k))&&!!__game.save));
 ok('无 console 错误',!errs.length,errs.slice(0,5).join(' | '));
 console.log(L.join('\n'));await b.close();process.exit(L.some(l=>l.startsWith('✗'))?1:0)})();
