// ===== v15：车辆命名 + 游戏内输入框组件 + 首页精简 =====
// ---------- 输入框组件（DOM 绘制，跟随 #app 旋转；支持中文输入法；抖音走 tt.showKeyboard） ----------
window.TextInput=(()=>{let cur=null;
 function close(){if(!cur)return;cur.el.remove();if(cur.tt){try{tt.hideKeyboard();tt.offKeyboardInput&&tt.offKeyboardInput(cur.ttIn);tt.offKeyboardConfirm&&tt.offKeyboardConfirm(cur.ttOk)}catch(e){}}cur=null}
 function open(o){close();const max=o.max||12,el=document.createElement('div');el.id='tinput';el.className='tin';
  el.innerHTML=`<div class="tinbox"><div class="ptitle">${o.title}</div><small class="tinh">${o.hint||''}</small><div class="tinrow"><input id="tinI" type="text" autocomplete="off" spellcheck="false" enterkeyhint="done"><span id="tinN"></span></div><div class="tinerr" id="tinE"></div>${o.priceHtml?`<div class="tinprice">${o.priceHtml}</div>`:''}<div class="btns"><button class="btn ghost" id="tinX">取消</button><button class="btn" id="tinOk">${o.okText||'确认'}</button></div></div>`;
  $('app').appendChild(el);const I=el.querySelector('#tinI'),N=el.querySelector('#tinN'),E=el.querySelector('#tinE'),OK=el.querySelector('#tinOk');I.value=o.value||'';let comp=false;
  const upd=()=>{const r=o.validate(I.value);N.textContent=`${[...r.v].length}/${max}`;N.classList.toggle('over',[...r.v].length>max);E.textContent=I.value&&!r.ok?r.err:'';OK.disabled=!r.ok||!!o.blocked;if(o.blocked)E.textContent=o.blocked;return r};
  I.addEventListener('compositionstart',()=>comp=true);I.addEventListener('compositionend',()=>{comp=false;upd()});I.addEventListener('input',()=>{if(!comp)upd()});
  I.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!comp)OK.click();if(e.key==='Escape')close()});I.addEventListener('keyup',e=>e.stopPropagation());
  el.querySelector('#tinX').onclick=()=>{close();o.onCancel&&o.onCancel()};
  OK.onclick=()=>{const r=upd();if(!r.ok||o.blocked)return;close();o.onOk(r.v)};
  cur={el,o};upd();
  if(window.tt&&tt.showKeyboard){cur.tt=true;I.readOnly=true;cur.ttIn=r=>{I.value=r.value;upd()};cur.ttOk=r=>{I.value=r.value;upd()};tt.onKeyboardInput(cur.ttIn);tt.onKeyboardConfirm(cur.ttOk);
   const sk=()=>tt.showKeyboard({defaultValue:I.value,maxLength:max*2,multiple:false,confirmHold:false,confirmType:'done'});I.onclick=sk;sk()}
  else setTimeout(()=>{I.focus();I.setSelectionRange(I.value.length,I.value.length)},50);
  return el}
 return{open,close,get isOpen(){return!!cur}}})();
// ---------- 车辆命名 ----------
const RN_COST=()=>Math.max(0,BUILD.renameCost|0),RN_MAX=()=>BUILD.carNameMax||8;
window.carName=k=>save.cars[k]&&save.cars[k].name||'';
window.gNameHtml=(k,b)=>{const cs=save.cars[k],nm=cs.name,free=!cs.nameN,cost=RN_COST(),poor=!free&&save.coins<cost;
 return`<div class="gname">${nm?esc(nm):b.name} <button class="btn sm ghost rnbtn ${poor?'poor':''}" data-rename="${k}">✏️ ${nm?'改名':'命名'}<small>${free?'首次免费':icCoin(cost)}</small></button></div><div class="gtype">${nm?b.name+' · ':''}<span class="gtag">${b.tag}</span></div>`};
function renameCar(k){const cs=save.cars[k],free=!cs.nameN,cost=RN_COST(),poor=!free&&save.coins<cost;track('car_rename_open',{car:k,free});
 TextInput.open({title:`给 ${CARS[k].name} 命名`,hint:`最多 ${RN_MAX()} 个字 · 中英文/数字/常用符号`,value:cs.name||'',max:RN_MAX(),validate:v=>{const r=checkName(v,RN_MAX());if(r.ok&&r.v===cs.name)return{ok:false,v:r.v,err:'和现在的名字一样'};return r},
  blocked:poor?`金币不足（需要 ${cost}，当前 ${save.coins}）`:'',priceHtml:free?'本次 <b>免费</b>（首次命名）':`本次花费 ${icCoin(cost)}，当前 ${icCoin(save.coins)}`,okText:free?'确认（免费）':`确认 · ${cost} 金币`,
  onOk:v=>{const f=!cs.nameN;if(!f){if(save.coins<cost){toast('金币不足');return}save.coins-=cost}cs.name=v;cs.nameN=(cs.nameN||0)+1;const c0=save.coins+(f?0:cost);persist();track('car_rename',{car:k,type:f?'free':'paid',cost:f?0:cost});toast(`已命名「${v}」`+(f?'':`，花费 ${cost} 金币`));sfx('good');setTimeout(()=>{if(!f)coinRoll(c0,save.coins);celebrate('命名成功！','「'+v+'」')},30);
   if(!$('garage').classList.contains('hide'))renderGarage();if(!$('menu').classList.contains('hide'))menu()}})}
window.renameCar=renameCar;
document.addEventListener('click',e=>{const b=e.target.closest('[data-rename]');if(!b)return;e.stopPropagation();const k=b.dataset.rename,cs=save.cars[k];
 if(cs.nameN&&save.coins<RN_COST()){toast(`金币不足：改名需要 ${RN_COST()} 金币`);return}renameCar(k)},true);
{const _s=start;start=function(k,opt){_s(k,opt);if(player)player.cname=carName(k)||''}}
// ---------- 首页精简 ----------
let mFrame=0,mLast=0;const mcv=$('mCarCv'),mx=mcv.getContext('2d');
function menuDraw(t){requestAnimationFrame(menuDraw);if($('menu').classList.contains('hide')||!BASE[gKey])return;if(t-mLast<50)return;mLast=t;mFrame=(mFrame+.25)%16;
 mx.clearRect(0,0,mcv.width,mcv.height);mx.fillStyle='rgba(0,0,0,.28)';mx.beginPath();mx.ellipse(280,262,170,42,0,0,7);mx.fill();drawFull(mx,gKey,save.cars[gKey],Math.floor(mFrame),280,250,1.7,Math.floor(t/60)%3)}
requestAnimationFrame(menuDraw);
function menuCar(){const k=gKey,s=CARS[k],cs=save.cars[k];$('mCarName').textContent=cs.name||s.name;$('mCarType').textContent=(cs.name?s.name+' · ':'')+s.tag;$('mCarLv').textContent='Lv.'+cs.lv+(ptsFree(cs)?` · ${ptsFree(cs)} 点可分配`:'');
 $('mStage').style.setProperty('--c1',s.col);$('mDots').innerHTML=KEYS.map(q=>`<i class="${q===k?'on':''}"></i>`).join('')}
function shift(d){const i=KEYS.indexOf(gKey);gKey=KEYS[(i+d+KEYS.length)%KEYS.length];sfx('ui');menuCar();track('menu_car_switch',{car:gKey})}
$('mPrev').onclick=()=>shift(-1);$('mNext').onclick=()=>shift(1);
{let sx=null,sy=null;const st=$('mStage');const P=e=>e.touches?e.touches[0]||e.changedTouches[0]:e;const rot=()=>document.body.classList.contains('rot');
 st.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY});st.addEventListener('pointerup',e=>{if(sx==null)return;const dx=rot()?e.clientY-sy:e.clientX-sx;sx=null;if(Math.abs(dx)>40)shift(dx<0?1:-1)})}
$('mStart').onclick=()=>{track('menu_start',{car:gKey,mode:__v11.MODE});openMaps(gKey)};
window.menuRefresh=()=>{menuCar();$('mLv').textContent='Lv.'+Math.max(...KEYS.map(k=>save.cars[k].lv));
 $('garDot').classList.toggle('hide',!KEYS.some(k=>ptsFree(save.cars[k])>0)&&!Object.keys(PARTS).some(id=>!save.owned[id]&&canCraft(id)));
 const d=daily();$('dailyDot').classList.toggle('hide',!(d.free>0));
 if(!localStorage.getItem('carbrawl_menuGuide')&&save.tutorialDone){const g=$('mGuide');g.classList.remove('hide');g.innerHTML='<div class="mg1">👉 点这里开始匹配</div><div class="mg2">👈 车库改装、挑战、福利都在这</div>';g.onclick=()=>{g.classList.add('hide');localStorage.setItem('carbrawl_menuGuide','1')};setTimeout(()=>{if(!g.classList.contains('hide'))g.onclick()},6000)}};
// 操作说明（从首页移到设置）
$('sHelp').onclick=()=>{const el=document.createElement('div');el.className='tin';el.innerHTML=`<div class="tinbox"><div class="ptitle">📖 操作说明</div><div class="helpx">📱 <b>手机</b>：左半屏按住拖动 = 浮动摇杆（推得越远油门越大）· 右下「冲刺」冲刺 ·「倒车」倒车<br>⌨️ <b>键盘</b>：W 前进 · S 刹车/倒车 · A/D 转向（方向键同）· 空格冲刺 · Esc 暂停<br>💥 用<b>车头</b>撞对手<b>侧面</b>打出暴击，冲刺中撞击伤害 ×1.5<br>🎁 场上道具：修复包 / 狂暴 / 护盾 / 氮气 / 弹簧，碰到就吃<br>⭕ 推出擂台：圆台缩小，掉下去就淘汰</div><div class="btns"><button class="btn">知道了</button></div></div>`;$('app').appendChild(el);el.querySelector('button').onclick=()=>el.remove();track('help_open',{})};
// 开局前随机小贴士（匹配界面）
const TIPS=['用车头撞对手侧面，打出暴击！','冲刺有冷却，看右下角的圈','冲刺中撞人伤害 ×1.5','残血时附近更容易刷出修复包','护盾能挡下一次 60% 的伤害','推出擂台：靠边别冲刺，容易自己掉下去','耐久越低，在擂台上被撞得越远','每天的挑战做完能开宝箱','车库里可以合成部件、换涂装','被撞毁后可以看视频复活一次'];
{const _m=matchThenStart;matchThenStart=function(k,m){const r=_m(k,m);const t=document.querySelector('#match .mtip');if(t)t.textContent='💡 小贴士：'+TIPS[Math.random()*TIPS.length|0];return r}}
if(!$('menu').classList.contains('hide'))menu();
// ---------- 通用确认框 + 消费反馈 ----------
window.Confirm=o=>{const el=document.createElement('div');el.className='tin';el.id='confirmBox';el.innerHTML=`<div class="tinbox"><div class="ptitle">${o.title}</div><div class="cfm">${o.html}</div><div class="btns"><button class="btn ghost" id="cfX">取消</button><button class="btn" id="cfOk">${o.okText||'确认'}</button></div></div>`;$('app').appendChild(el);
 el.querySelector('#cfX').onclick=()=>{el.remove();o.onCancel&&o.onCancel()};el.querySelector('#cfOk').onclick=()=>{el.remove();o.onOk()};return el};
function coinRoll(from,to){const els=[...document.querySelectorAll('#garage .uni, #menuCoins')];const t0=performance.now(),D=700;const f=t=>{const k=Math.min(1,(t-t0)/D),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));els.forEach(e=>{const c=e.querySelector('.ic.cur b, b');if(c)c.textContent=v});if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f);
 els.forEach(e=>{const m=document.createElement('span');m.className='coinminus';m.textContent=(to-from>0?'+':'')+(to-from);e.appendChild(m);setTimeout(()=>m.remove(),1100)})}
function celebrate(title,sub){const p=$('gPrev')?$('gPrev').closest('.gl'):$('app');const fx=document.createElement('div');fx.className='buyfx';let parts='';for(let i=0;i<26;i++){const a=Math.random()*6.28,r=60+Math.random()*90;parts+=`<i style="--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r}px;--c:${['#ffd23f','#ff7aa8','#7df9ff','#7bd94f','#fff'][i%5]};animation-delay:${Math.random()*.15}s"></i>`}fx.innerHTML=parts;p.appendChild(fx);setTimeout(()=>fx.remove(),1300);
 const pop=document.createElement('div');pop.className='buypop';pop.innerHTML=`<b>${title}</b><small>${sub||''}</small>`;$('app').appendChild(pop);setTimeout(()=>pop.remove(),1800);sfx('good');setTimeout(()=>sfx('good'),160);vib('boom')}
window.coinRoll=coinRoll;window.celebrate=celebrate;
// ---------- 涂装/颜色：免费试穿 → 购买确认 → 反馈；离开自动还原 ----------
let PV=null;window.__pv=()=>PV;
const skinInfo=(t,id)=>t==='color'?{n:COLORS[id].n,p:COLORS[id].p}:{n:LIVS[id].n,p:LIVS[id].p};
window.skinTry=(t,id)=>{if(!t){PV=null;return}PV={k:gKey,t,id};track('skin_preview',{car:gKey,type:t,id});renderGarage()};
{const _df=drawFull;drawFull=function(c2d,k,cs,...a){if(PV){if($('garage').classList.contains('hide')||PV.k!==gKey)PV=null;else if(k===PV.k&&cs===save.cars[k]){cs={...cs,paint:{...cs.paint,[PV.t]:PV.id}}}}return _df(c2d,k,cs,...a)}}
const COINAD_MAX=3,COINAD_V=100;const coinAd=()=>{let d=null;try{d=JSON.parse(localStorage.getItem('carbrawl_coinad'))}catch(e){}if(!d||d.d!==today())d={d:today(),n:0};return d};
function tryBar(){const old=document.querySelector('#garage .trybar');if(old)old.remove();if(!PV||$('garage').classList.contains('hide'))return;const cv=$('gPrev');if(!cv)return;
 const S=skinInfo(PV.t,PV.id),gap=S.p-save.coins,ca=coinAd(),b=document.createElement('div');b.className='trybar';cv.insertAdjacentElement('afterend',b);
 b.innerHTML=`<span class="trytag">试穿中</span><b>${S.n}</b>${gap>0?`<button class="btn sm" disabled>还差 ${gap} 金币</button>${ca.n<COINAD_MAX?`<button class="btn sm adbtn" id="coinAdBtn">📺 领 ${COINAD_V} 金币 ${COINAD_MAX-ca.n}/${COINAD_MAX}</button>`:'<small>今日广告金币已领完</small>'}`:`<button class="btn sm" id="tryBuy">购买 · ${S.p} 金币</button>`}<button class="btn sm ghost" id="tryX">还原</button>`;
 b.querySelector('#tryX').onclick=()=>{PV=null;renderGarage()};
 const ad=b.querySelector('#coinAdBtn');if(ad)ad.onclick=()=>showRewardedAd(ok=>{if(!ok){toast('未看完，没有奖励');return}const d=coinAd();if(d.n>=COINAD_MAX)return;d.n++;localStorage.setItem('carbrawl_coinad',JSON.stringify(d));const c0=save.coins;save.coins+=COINAD_V;persist();track('reward_grant',{placement:'coin_ad',coins:COINAD_V});renderGarage();coinRoll(c0,save.coins);toast(`获得 ${COINAD_V} 金币`)},'coin_ad');
 const by=b.querySelector('#tryBuy');if(by)by.onclick=()=>{const P0={...PV};Confirm({title:'购买确认',html:`购买 <b>${S.n}</b>（${P0.t==='color'?'颜色':'涂装'}）<br>价格 ${icCoin(S.p)}　余额 ${icCoin(save.coins)} → ${icCoin(save.coins-S.p)}`,okText:`确认购买 · ${S.p}`,
  onCancel:()=>track('skin_buy_cancel',{car:P0.k,type:P0.t,id:P0.id}),
  onOk:()=>{if(save.coins<S.p){toast('金币不足');return}const c0=save.coins;save.coins-=S.p;(P0.t==='color'?save.colors:save.livs)[P0.id]=true;const cs=save.cars[P0.k];cs.paint[P0.t]=P0.id;PV=null;persist();track('skin_buy',{car:P0.k,type:P0.t,id:P0.id,cost:S.p});renderGarage();coinRoll(c0,save.coins);celebrate('获得新涂装！',S.n+' · 已自动装备')}})}}
{const _rg=renderGarage;let _lastTab=null;renderGarage=function(){if(PV&&(PV.k!==gKey||(_lastTab!==null&&_lastTab!==gTab)))PV=null;_lastTab=gTab;_rg.apply(this,arguments);tryBar();if(PV){document.querySelectorAll(`#garage [data-${PV.t==='color'?'col':'liv'}]`).forEach(e=>e.classList.toggle('trying',(PV.t==='color'?e.dataset.col:e.dataset.liv)===PV.id))}}}
{const _hide=hideAll;hideAll=function(){PV=null;return _hide()}}
// ---------- v15 结算页重排 + 伤害/冲撞统计 + 一屏适配 ----------
const RS={dmg:0,ram:0};window.__rs=RS;
{const _h=hurt;hurt=function(c,d,by){const hp0=c&&c.alive?c.hp:0;const r=_h.apply(this,arguments);if(by&&player&&by===player&&c!==player&&hp0>0){RS.dmg+=Math.max(0,hp0-Math.max(0,c.hp));if(by.dashT>0&&d>4)RS.ram++}return r}}
{const _s=start;start=function(){RS.dmg=0;RS.ram=0;return _s.apply(this,arguments)}}
(()=>{const card=document.querySelector('#result .rcard'),q=id=>$(id);card.classList.add('r15');
 const top=document.createElement('div');top.className='rtop';const tt=document.createElement('div');tt.className='rtt';top.append(q('rRank'),tt);tt.append(q('rTitle'),q('rStats'));
 card.prepend(top);const mid=document.createElement('div');mid.className='rmid';top.after(mid);const l=document.createElement('div');l.className='rl';const r=document.createElement('div');r.className='rr';mid.append(l,r);l.append(q('hl'));
 const bw=document.createElement('details');bw.className='rbw';bw.innerHTML='<summary>🏁 对手榜 ▾</summary>';bw.append(q('rBoard'));
 r.append(q('rShards'),card.querySelector('.xpRow'),q('rDouble'),q('rHint'),bw);
 const hb=q('hl').querySelector('.hlb');hb.append(q('hlShare'));hb.insertBefore(q('hlShare'),q('hlDl'));q('hlShare').classList.remove('ghost');
 card.append(card.querySelector('.btns'));
 const fit=()=>{card.classList.toggle('nohl',q('hl').classList.contains('hide'));fitAll()};window.__rfit=fit;
 new MutationObserver(()=>requestAnimationFrame(fit)).observe($('result'),{attributes:true,attributeFilter:['class'],subtree:true,childList:true});addEventListener('resize',()=>setTimeout(fit,80));if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(fit,80));
 bw.addEventListener('toggle',fit);
 const _f=finish;finish=function(){const ret=_f.apply(this,arguments);const win=player&&player.alive;setTimeout(()=>{if($('result').classList.contains('hide'))return;
  const st=$('rStats'),k=(st.querySelector('div b')||{}).textContent||'0',sv=st.children[1]?st.children[1].querySelector('b').textContent:'';
  st.innerHTML=`<div><b>${k}</b>击杀</div><div><b>${Math.round(RS.dmg)}</b>伤害</div><div><b>${RS.ram}</b>冲撞</div><div><b>${sv}</b>存活</div>`;top.classList.toggle('lose',!win);
  const h=$('rHint'),fp=player?ptsFree(save.cars[playerKey]):0,can=Object.keys(PARTS).some(id=>!save.owned[id]&&canCraft(id)),up=/升级/.test(h.textContent);
  h.innerHTML=(up?'<span class="rchip">⬆ 升级！</span>':'')+(fp>0?`<span class="rchip" data-go="pts">＋${fp} 属性点</span>`:'')+(can?'<span class="rchip" data-go="craft">🔧 可合成</span>':'');h.classList.toggle('hide',!h.innerHTML);
  h.querySelectorAll('[data-go]').forEach(e=>e.onclick=()=>{track('result_hint_click',{t:e.dataset.go});if(e.dataset.go==='craft')gTab='craft';openGarage(playerKey)});
  $('toGarage').classList.toggle('dot',fp>0||can);fit()},(win?600:300)+60);return ret}})();

// ---------- 全局弹窗适配：所有居中卡片按 #app 实际可见尺寸缩放并绝对居中（真机 Safari 工具栏/旋转/安全区） ----------
function fitAll(){const a=$('app'),AW=a.offsetWidth,AH=a.offsetHeight;
 document.querySelectorAll('#app>.panel:not(.hide)>.rcard, #app>.panel:not(.hide)>.dcw, #app>.panel:not(.hide)>.mbox, #app>.tin>.tinbox, #app>div:not(.hide)>.rcard').forEach(c=>{if(c.closest('#menu,#garage,#hud'))return;
  const sa=getComputedStyle(document.documentElement),pad=12;c.style.transform='none';c.style.position='absolute';c.style.left='50%';c.style.top='50%';c.style.margin='0';
  const s=Math.min(1,(AH-pad*2)/c.offsetHeight,(AW-pad*2)/c.offsetWidth);c.style.transform=`translate(-50%,-50%) scale(${s.toFixed(3)})`;c.dataset.fit=s.toFixed(3)})}
window.fitAll=fitAll;{let q=0;const go=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;fitAll()})};new MutationObserver(go).observe($('app'),{attributes:true,attributeFilter:['class'],subtree:true,childList:true});addEventListener('resize',()=>setTimeout(fitAll,80));if(window.visualViewport)visualViewport.addEventListener('resize',()=>setTimeout(fitAll,80));go()}
