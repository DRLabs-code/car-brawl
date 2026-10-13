const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const D='/workspace/car-brawl/prototype/shots/v11/';
const [tag,vw,vh,dpr,mob]=process.argv.slice(2);
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage();await pg.setViewport({width:+vw,height:+vh,deviceScaleFactor:+dpr,isMobile:mob==='1',hasTouch:mob==='1'});
const errs=[],log=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&!/favicon|404/.test(m.text())&&errs.push(m.text()));
const shot=n=>pg.screenshot({path:D+tag+'_'+n+'.png'});const ev=(f,a)=>pg.evaluate(f,a);const L=s=>{log.push(s);};
await pg.goto('http://localhost:8765/index.html');await ev(()=>localStorage.clear());await pg.reload();await W(1500);
await ev(()=>{const g=__game;g.save.tut=true;g.save.tutorialDone=true;g.save.coins=500;g.save.nick='测试车手';g.persist&&g.persist();g.tut=null;});
await ev(()=>menu());await W(600);
L('红点(新的一天): '+await ev(()=>!document.getElementById('dcDot').classList.contains('hide')));
await shot('01_menu_brawl');
// 每日挑战面板
await ev(()=>openDC());await W(400);L('任务: '+await ev(()=>__v11.dcGet().t.map(t=>t.id).join(',')));await shot('02_daily_challenges');
await ev(()=>document.getElementById('dcBack').click());await W(300);L('看过后红点: '+await ev(()=>!document.getElementById('dcDot').classList.contains('hide')));
// 乱斗：选车→地图→匹配
await ev(()=>document.querySelector('#modeSel [data-mode="brawl"]').click());
await ev(()=>document.querySelector('#cards > *').click());await W(500);await shot('03_maps');
await ev(()=>{const e=document.querySelector('#mapList [data-map], #mapList > *');e&&e.click()});await W(300);
const go=await ev(()=>{const e=[...document.querySelectorAll('#maps button')].find(b=>/开战|出发|开始|匹配/.test(b.textContent));if(e){e.click();return e.textContent}return null});L('地图按钮: '+go);
await W(3800);L('对战中: '+await ev(()=>__game.cars.length)+' 车, MODE='+await ev(()=>__v11.MODE));
await W(2500);await ev(()=>{__game.time=9.9});await W(1500);
L('道具生成: '+await ev(()=>__v11.PK.map(p=>p.k).join(',')));
for(const k of ['heal','atk','shield','boost','spring'])await ev(k=>__v11.applyPK(__game.player,k),k);
await ev(()=>{const P=__game.player;for(let i=0;i<2;i++)__v11.pkSpawn();const q=__v11.PK[0];if(q){q.x=P.x+3;q.z=P.z+3}});await W(200);await shot('04_pickups_buffs');
L('buff: atk='+(await ev(()=>__game.player.atkT)).toFixed(1)+' sh='+(await ev(()=>__game.player.shT)).toFixed(1)+' HUD='+await ev(()=>document.getElementById('buffs').innerText.replace(/\n/g,' ')));
// 伤害修正：攻击 1.4、护盾 0.4
const dm=await ev(()=>{const g=__game,P=g.player,o=g.cars.find(c=>c!==P&&c.alive);o.shT=0;o.atkT=0;P.atkT=8;const h0=o.hp;hurt(o,10,P);const a=h0-o.hp;o.shT=8;const h1=o.hp;hurt(o,10,P);const s=h1-o.hp;P.atkT=0;return[a,s,o.shT]});L('攻击强化 10→'+dm[0].toFixed(1)+'，护盾 14→'+dm[1].toFixed(1)+'，护盾已消耗 shT='+dm[2]);
// AI 抢道具
const ai=await ev(async()=>{const g=__game,o=g.cars.find(c=>!c.isP&&c.alive);__v11.PK.length=0;__v11.PK.push({k:'boost',x:o.x+6,z:o.z,t:0,life:25});const d0=Math.hypot(6,0);await new Promise(r=>setTimeout(r,1500));const q=__v11.PK.find(p=>p.k==='boost'&&p.life===25);return q?'未拾取 d='+Math.hypot(q.x-o.x,q.z-o.z).toFixed(1):'AI 已拾取'});L('AI 抢道具: '+ai);
// 冲撞事件 → 集锦
await ev(()=>{const g=__game,P=g.player;const o=g.cars.find(c=>!c.isP&&c.alive);P.dash=.3;hurt(o,40,P);P.dash=0});
// 复活
await ev(()=>{const g=__game;g.player.invT=0;g.player.shT=0;g.cars.forEach(c=>{if(!c.isP){c.alive=true;c.hp=c.maxhp}});hurt(g.player,1e6,g.cars.find(c=>!c.isP&&c.alive))});await W(2200);
L('复活弹窗: '+await ev(()=>!document.getElementById('revive').classList.contains('hide')));await shot('05_revive_offer');
await ev(()=>document.getElementById('rvAd')?.click());await W(4200);
L('复活后 alive='+await ev(()=>__game.player.alive)+' hp%='+await ev(()=>Math.round(__game.player.hp/__game.player.maxhp*100))+' 再次死亡是否再弹: ');await shot('06_revived');
await ev(()=>{const g=__game;g.player.invT=0;g.player.shT=0;hurt(g.player,1e6,g.cars.find(c=>!c.isP&&c.alive))});await W(2600);
L('第二次死亡→结算: '+await ev(()=>!document.getElementById('result').classList.contains('hide'))+' 复活窗='+await ev(()=>!document.getElementById('revive').classList.contains('hide')));
await W(7000);L('集锦: '+await ev(()=>({play:HL.play,t0:+HL.t0.toFixed(1),t1:+HL.t1.toFixed(1),evs:HL.evs.length,blob:HL.blob&&HL.blob.size,type:HL.blob&&HL.blob.type,txt:document.getElementById('hlTxt').textContent})).then(JSON.stringify));
await ev(()=>document.getElementById('hl').scrollIntoView({block:'center'}));await W(300);await shot('07_result_highlight');
await ev(()=>{window.__dl=0;const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download)window.__dl++;else o.call(this)};document.getElementById('hlDl').click();document.getElementById('hlShare').click()});L('下载触发: '+await ev(()=>window.__dl));
// 再来一局 → 擂台模式
await ev(()=>{document.getElementById('back').click()});await W(500);
await ev(()=>document.querySelector('#modeSel [data-mode="ring"]').click());await W(200);await shot('08_menu_ring');
await ev(()=>document.querySelector('#cards > *').click());await W(3800);
L('擂台: map='+await ev(()=>__game.mapKey||mapKey)+' AR='+await ev(()=>AR)+' props='+await ev(()=>props.length));
await W(2600);await shot('09_ring_start');
// AI 不自己掉台：统计 AI 落台但 lastBy 为空的次数
await ev(()=>{__game.player.invT=1e9;window.__selfFall=0;const o=window.track;window.track=function(e,p){if(e==='ring_fall'&&!p.isP&&!p.byP)window.__rf=(window.__rf||[]).concat([p]);return o.apply(this,arguments)}});
await ev(()=>{__game.time=40});await W(6000);await shot('10_ring_shrunk');
const rs=await ev(()=>({alive:__game.cars.filter(c=>c.alive).length,falls:(window.__rf||[]).length,zr:+zoneR.toFixed(1)}));L('擂台 40→46s: '+JSON.stringify(rs));
await ev(()=>{__game.player.invT=0;__game.time=58});await W(9000);
L('擂台结束: result='+await ev(()=>!document.getElementById('result').classList.contains('hide'))+' t='+await ev(()=>Math.round(__game.time)));await W(4000);await shot('11_ring_result');
// 每日挑战进度 + 领奖
await ev(()=>{const d=__v11.dcGet();for(const t of d.t)dcAdd(t.id,9)});await ev(()=>menu());await W(300);L('完成后红点: '+await ev(()=>!document.getElementById('dcDot').classList.contains('hide')));
await ev(()=>openDC());await W(300);await shot('12_dc_done');const c0=await ev(()=>__game.save.coins);
for(let i=0;i<3;i++)await ev(i=>document.querySelector(`[data-dc="${i}"]`).click(),i);await W(200);await shot('13_dc_claimed');
await ev(()=>document.getElementById('dcChest').click());await W(300);L('领奖金币 '+c0+'→'+await ev(()=>__game.save.coins)+' chest='+await ev(()=>__v11.dcGet().chest));await shot('14_dc_chest');
await ev(()=>menu());await W(200);L('全部领取后红点: '+await ev(()=>!document.getElementById('dcDot').classList.contains('hide')));
const tr=await ev(()=>{const L=JSON.parse(localStorage.getItem('carbrawl_track')||'[]');const m={};for(const e of L)m[e.event]=(m[e.event]||0)+1;return m});
L('埋点: '+Object.keys(tr).filter(k=>/pickup|revive|ring|mode|dc_|hl_|shield|match/.test(k)).map(k=>k+'×'+tr[k]).join(' '));
L('错误: '+(errs.length?errs.join(' | '):'无'));console.log(log.join('\n'));require('fs').writeFileSync(D+tag+'_log.txt',log.join('\n'));await b.close()})();
