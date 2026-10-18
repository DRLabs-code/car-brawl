// v27 回归：node tests/v261.js [URL]  去难度设置+对手分档混合、开始战斗文案、健康游戏忠告+登记号、昵称敏感词（本地/抖音键盘确认）、删测试声音按钮且首点仍解锁音频
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const URL=process.argv[2]||'http://localhost:8765/index.html';const SH='/workspace/car-brawl/prototype/shots/v27/';
const L=[];const ok=(c,n,d)=>{L.push((c?'✓ ':'✗ ')+n+(d!==undefined?' '+JSON.stringify(d):''));console.log(L[L.length-1])};
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=user-gesture-required']});
for(const vp of [{width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true},{width:667,height:375,deviceScaleFactor:2,isMobile:true,hasTouch:true}]){const tag=vp.width+'x'+vp.height;
 const g=await b.newPage();const errs=[];g.on('pageerror',e=>errs.push(e.message));await g.setViewport(vp);await g.goto(URL);await g.evaluate(()=>{localStorage.clear();localStorage.setItem('carbrawl_menuGuide','1')});
 await g.reload({waitUntil:'domcontentloaded'});await W(300);
 const sp=await g.evaluate(()=>{const l=document.getElementById('loading');return{vis:!l.classList.contains('hide'),t:l.innerText,t0:performance.now()}});
 await g.screenshot({path:SH+'splash_'+tag+'.png'});
 ok(sp.vis&&['抵制不良游戏，拒绝盗版游戏。','注意自我保护，谨防受骗上当。','适度游戏益脑，沉迷游戏伤身。','合理安排时间，享受健康生活。'].every(x=>sp.t.includes(x))&&sp.t.includes('健康游戏忠告'),tag+' 开始画面全文显示健康游戏忠告',sp.t.slice(0,80));
 const top=await g.evaluate(()=>{const r=document.getElementById('regNo').getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e&&e.id});ok(top==='regNo',tag+' 登记号不被遮挡（新手引导在下层）',top);
 ok(/著作权登记号/.test(sp.t),tag+' 登记号占位',sp.t.match(/著作权登记号.*/)&&sp.t.match(/著作权登记号.*/)[0]);
 await g.waitForFunction(()=>document.getElementById('loading').classList.contains('hide'),{timeout:20000});const hideAt=await g.evaluate(()=>performance.now());ok(hideAt>=1450,tag+' 开始画面至少 1.5s',Math.round(hideAt));
 await W(400);
 // 首次点击解锁音频（iOS 同路径：capture 监听 touchstart/pointerdown → auUnlock）
 const a0=await g.evaluate(()=>__game.AU.ctx?__game.AU.ctx.state:'none');await g.touchscreen.tap(400,200);await W(400);const a1=await g.evaluate(()=>__game.AU.ctx?__game.AU.ctx.state:'none');ok(a1==='running',tag+' 首次触摸后音频解锁',{a0,a1});
 const st=await g.evaluate(()=>({diff:document.querySelectorAll('#settings [data-diff]').length,test:!!document.getElementById('sTest'),txt:document.getElementById('settings').innerText,start:document.getElementById('mStart').innerText}));
 ok(!st.diff&&!/难度/.test(st.txt),tag+' 设置页无 AI 难度',st.diff);ok(!st.test&&!/测试声音/.test(st.txt),tag+' 设置页无测试声音按钮');ok(/开始战斗/.test(st.start)&&!/匹配/.test(st.start),tag+' 按钮为「开始战斗」',st.start);
 await g.evaluate(()=>{save.tutorialDone=true;persist();hideAll();menu();openSettings('menu')});await W(300);await g.screenshot({path:SH+'settings_'+tag+'.png'});await g.evaluate(()=>{const c=document.getElementById('sClose');c&&c.click()});
 // 对手分档
 const d=await g.evaluate(()=>{const f=lv=>{const c={pro:0,mid:0,rookie:0};for(let i=0;i<4000;i++)c[aiTier(lv)]++;for(const k in c)c[k]=+(c[k]/4000).toFixed(3);return c};const s=[];for(let i=0;i<500;i++)s.push(aiSkill(1));return{l1:f(1),l15:f(15),mn:Math.min(...s),mx:Math.max(...s),T:TUNE.opp}});
 ok(Math.abs(d.l1.pro-d.T.mix.pro)<.03&&Math.abs(d.l1.rookie-d.T.mix.rookie)<.03,tag+' Lv1 分档比例≈tune',d.l1);ok(d.l15.pro>d.l1.pro+.07&&d.l15.rookie<d.l1.rookie-.07,tag+' 高等级高手更多',d.l15);ok(d.mn<.3&&d.mx>.65,tag+' 同局技巧值有高有低',[d.mn,d.mx].map(x=>+x.toFixed(2)));
 // 匹配页 / 开局文案不标 AI / 在线 / 真人
 await g.evaluate(()=>{__game.matchThenStart('beast','site')});await W(300);const mt=await g.evaluate(()=>document.getElementById('match').innerText);await g.screenshot({path:SH+'match_'+tag+'.png'});
 ok(/匹配对手中/.test(mt)&&!/AI|在线|真人|电脑|机器人/.test(mt),tag+' 匹配动画保留且无 AI/在线/真人字样',mt.slice(0,40));
 await W(3800);const it=await g.evaluate(()=>document.getElementById('intro').innerText+'|'+(document.getElementById('modeHint')||{}).textContent);ok(!/简单|困难|普通|AI/.test(it),tag+' 开局提示无难度/AI',it);
 const nk=await g.evaluate(()=>[...document.querySelectorAll('.mcard b')].length);
 await g.evaluate(()=>{__game.quit&&__game.quit()});
 // 敏感词：本地词表
 const cn=await g.evaluate(()=>[checkName('我是傻逼王',12),checkName('赛车小王',12)]);ok(!cn[0].ok&&/\*\*/.test(cn[0].err)&&cn[1].ok,tag+' 网页本地词表命中打码提示',cn[0].err);
 // 抖音环境：只采信键盘确认值；平台屏蔽成 * 的值拒绝
 const tt=await g.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const h={};window.tt={showKeyboard(){},hideKeyboard(){},onKeyboardInput(f){h.in=f},onKeyboardConfirm(f){h.ok=f},onKeyboardComplete(f){h.cp=f},offKeyboardInput(){},offKeyboardConfirm(){},offKeyboardComplete(){}};
  let got=null;TextInput.open({title:'t',value:'',max:12,validate:v=>checkName(v,12),onOk:v=>got=v});const OK=document.getElementById('tinOk'),E=document.getElementById('tinE');
  h.in({value:'飞车侠'});await S(50);const r1={dis:OK.disabled,e:E.textContent};h.ok({value:'飞车**'});await S(50);const r2={dis:OK.disabled,e:E.textContent};h.cp({value:'飞车侠'});await S(50);const r3={dis:OK.disabled};OK.click();await S(50);delete window.tt;return{r1,r2,r3,got,hasCp:!!h.cp}});
 ok(tt.r1.dis&&/完成/.test(tt.r1.e),tag+' 抖音：逐字输入未确认不能提交',tt.r1);ok(tt.r2.dis&&/屏蔽/.test(tt.r2.e),tag+' 抖音：平台屏蔽为 * 的值被拒',tt.r2);ok(!tt.r3.dis&&tt.got==='飞车侠'&&tt.hasCp,tag+' 抖音：键盘完成后的值可提交',tt);
 ok(!errs.length,tag+' 无报错',errs);await g.close()}
await b.close();process.exit(L.some(l=>l[0]==='✗')?1:0)})();
