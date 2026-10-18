// v28 修复回归：node tests/v28fix.js [URL]
//  1) 没拉到广告（无填充/加载失败）提示「暂时没有可播放的广告」，中途关闭仍提示「未看完」；埋点 ad_nofill / ad_close（网页模拟 + 抖音 tt 实现各测一遍）
//  2) 抖音冲撞集锦：录屏剪辑拿到视频后「分享」可点、文案提示可分享到抖音、点分享调 tt.shareAppMessage(videoPath)；抖音隐藏「下载」，网页保留
//  3) 匹配卡缩略图：部件图层还没加载时，加载完成后整张重画（与加载完再画的参考图逐像素一致）
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v28/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
// 假 tt：录屏管理器（onStop 给 videoPath、clipVideo 成功）、激励视频（__adMode: nofill=show/load 都失败，close=未看完关闭，ok=看完）、分享记录
const FAKE_TT=()=>{window.AD_UNIT_ID='test-unit';window.__adMode='nofill';window.__share=null;let stopCb=null;const rm={start(){},stop(){setTimeout(()=>stopCb&&stopCb({videoPath:'ttfile://rec.mp4'}),50)},onStop(f){stopCb=f},clipVideo(o){setTimeout(()=>o.success({videoPath:'ttfile://clip.mp4'}),50)}};
 const ad={cbs:[],onClose(f){this.cbs.push(f)},offClose(f){this.cbs=this.cbs.filter(x=>x!==f)},show(){const m=window.__adMode;if(m==='nofill')return Promise.reject({errCode:1004});setTimeout(()=>this.cbs.slice().forEach(f=>f({isEnded:m==='ok'})),100);return Promise.resolve()},load(){return window.__adMode==='nofill'?Promise.reject({errCode:1004}):Promise.resolve()}};
 window.tt={getGameRecorderManager:()=>rm,createRewardedVideoAd:()=>ad,shareAppMessage:o=>{window.__share=o;o.success&&o.success()}}};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
 const open=async(fake)=>{const g=await b.newPage();g.on('pageerror',e=>errs.push((fake?'tt: ':'web: ')+e.message));await g.setViewport({width:1280,height:720});if(fake)await g.evaluateOnNewDocument(FAKE_TT);await g.goto(URL);await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
  await g.evaluate(()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;persist();hideAll();menu()});await W(300);return g};
 const evs=g=>g.evaluate(()=>JSON.parse(localStorage.getItem('carbrawl_track')||'[]').map(e=>e.event));
 // 宝箱按钮走一次激励视频，返回提示文字、宝箱次数、新增埋点
 const chest=async(g,setup)=>{await g.evaluate(setup);await g.evaluate(()=>{openDaily()});await W(200);const e0=(await evs(g)).length;await g.evaluate(()=>$('dChest').click());await W(900);
  return g.evaluate(e0=>({toast:$('toast').classList.contains('hide')?'':$('toast').textContent,chest:daily().chest||0,ev:JSON.parse(localStorage.getItem('carbrawl_track')).slice(e0).map(e=>e.event).filter(e=>/^ad_/.test(e))}),e0)};
 // ===== 网页 =====
 const g=await open(false);
 ok(await g.evaluate(()=>!$('hlDl').classList.contains('hide')),'网页：集锦「下载」按钮保留');
 let r=await chest(g,()=>{window.__mock0=window.__mock0||window.__mock;window.__mock=res=>setTimeout(()=>res('noad'),50)});ok(/暂时没有可播放的广告/.test(r.toast)&&r.chest===0&&r.ev.includes('ad_nofill')&&!r.ev.includes('ad_close'),'网页：没拉到广告 → 提示暂时没有广告、不发奖、埋点 ad_nofill',r);
 r=await chest(g,()=>{window.__mock=res=>setTimeout(()=>res(false),50)});ok(/未看完，没有奖励/.test(r.toast)&&r.chest===0&&r.ev.includes('ad_close'),'网页：中途关闭 → 提示未看完、埋点 ad_close',r);
 r=await chest(g,()=>{window.__mock=res=>setTimeout(()=>res(true),50)});ok(r.chest===1&&r.ev.includes('ad_complete'),'网页：看完 → 开宝箱',r);
 r=await chest(g,()=>{window.__mock=res=>setTimeout(()=>res(false),50)});ok(/未看完/.test(r.toast),'网页：上一次是没广告，这次中途关闭 → 不残留「没有广告」提示',r);
 await g.evaluate(()=>{window.__mock=window.__mock0;$('toast').classList.add('hide')});
 // 匹配卡缩略图
 const th=await g.evaluate(async()=>{const k='beast',id='quakeRam',cs=__game.save.cars[k];__game.save.owned[id]=true;cs.equip.front=id;persist();
  for(const q of Object.keys(LAYI))if(/_part_/.test(q))delete LAYI[q];PLU.clear();
  hideAll();matchThenStart(k,'site');const cv=document.querySelector('#match .me canvas')||document.querySelector('.mcard.me canvas');const before=!!(LAYI[k+'_part_'+id]&&LAYI[k+'_part_'+id].complete&&LAYI[k+'_part_'+id].naturalWidth);
  const snap=c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data);const s0=snap(cv);await new Promise(r=>setTimeout(r,1200));const s1=snap(cv);
  const ref=document.createElement('canvas');ref.width=cv.width;ref.height=cv.height;drawFull(ref.getContext('2d'),k,cs,3,48,52,.32);const s2=snap(ref);
  const diff=(a,b)=>a.reduce((n,v,i)=>n+(Math.abs(v-b[i])>8?1:0),0);return{loadedAtCall:before,diffFirstVsRef:diff(s0,s2),diffLaterVsRef:diff(s1,s2)}});
 ok(!th.loadedAtCall&&th.diffFirstVsRef>50&&th.diffLaterVsRef===0,'匹配卡缩略图：部件图层未加载时先画车身，加载后重画、与参考图一致',th);
 await g.screenshot({path:SH+'fix_match_thumb.png'});await g.close();
 // ===== 抖音（假 tt）=====
 const t=await open(true);
 ok(await t.evaluate(()=>AdAdapter.impl.name==='tt'&&$('hlDl').classList.contains('hide')),'抖音：走 tt 激励视频实现；集锦「下载」隐藏');
 r=await chest(t,()=>{window.__adMode='nofill'});ok(/暂时没有可播放的广告/.test(r.toast)&&r.chest===0&&r.ev.includes('ad_nofill'),'抖音：show/load 都失败 → 提示暂时没有广告、埋点 ad_nofill',r);
 r=await chest(t,()=>{window.__adMode='close'});ok(/未看完，没有奖励/.test(r.toast)&&r.chest===0&&r.ev.includes('ad_close'),'抖音：没看完关闭 → 提示未看完',r);
 r=await chest(t,()=>{window.__adMode='ok'});ok(r.chest===1,'抖音：看完 → 开宝箱',r);
 // 复活没广告：提示
 const rv=await t.evaluate(async()=>{window.__adMode='nofill';__game.AB.revive=true;hideAll();start('beast');await new Promise(r=>setTimeout(r,1500));hurt(__game.player,9999,null);await new Promise(r=>setTimeout(r,2200));if(!$('rvAd'))return{offer:false};const offer=!$('revive').classList.contains('hide');$('rvAd').click();await new Promise(r=>setTimeout(r,600));return{offer,toast:$('toast').textContent,revived:JSON.parse(localStorage.getItem('carbrawl_track')).some(e=>e.event==='revive_done')}});
 ok(rv.offer&&/暂时没有可播放的广告/.test(rv.toast)&&!rv.revived,'抖音：复活没广告 → 提示暂时没有广告',rv);
 // 集锦分享
 const sh=await t.evaluate(async()=>{hideAll();start('beast');await new Promise(r=>setTimeout(r,2500));const P=__game.player;for(const c of cars)if(c!==P&&!c.dummy){hurt(P,20,c);hurt(c,9999,P)}
  await new Promise(r=>setTimeout(r,800));for(const c of cars)if(c!==P&&c.alive&&!c.dummy)hurt(c,9999,P);await new Promise(r=>setTimeout(r,3500));
  const o={hl:!$('hl').classList.contains('hide'),share:!$('hlShare').disabled,dl:$('hlDl').classList.contains('hide'),txt:$('hlTxt').textContent,path:HL.ttPath};$('hlShare').click();await new Promise(r=>setTimeout(r,200));o.shared=window.__share&&window.__share.extra.videoPath;return o});
 ok(sh.hl&&sh.share&&sh.dl&&/录屏已生成/.test(sh.txt)&&sh.path==='ttfile://clip.mp4'&&sh.shared==='ttfile://clip.mp4','抖音：录屏剪辑完成 → 分享可点、文案提示、点分享传剪辑视频',sh);
 await t.screenshot({path:SH+'fix_tt_share.png'});
 ok(!errs.length,'无页面报错',errs.slice(0,3));await b.close();const f=L.filter(l=>l[0]==='✗').length;console.log(f?`FAIL ${f}`:'ALL OK');process.exit(f?1:0)})().catch(e=>{console.log('✗ 异常 '+e.stack);process.exit(1)});
