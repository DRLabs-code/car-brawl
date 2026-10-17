'use strict';
// ================= 常量 / 数据 =================
const K=16;                    // 等距投影：1 世界单位 → 屏幕 x 16px（2:1 菱形）
const HK=K/Math.SQRT1_2*Math.cos(Math.PI/6); // 高度 1 单位 → 屏幕像素
const F=288,FS=192/288,AY=0.58,WF=112,WS=192/112,LF=144,LS=192/144; // 车身 288、轮子 112、部件/涂装层 144（均绘制为 192 世界像素）

const COLORS={gray:{n:'素灰',c:'#9aa0a8',p:0},red:{n:'烈焰红',c:'#e63946',p:120},blue:{n:'天际蓝',c:'#2e86de',p:120},green:{n:'荧光绿',c:'#7bd94f',p:150},yellow:{n:'柠檬黄',c:'#ffd23f',p:150},black:{n:'午夜黑',c:'#2b2d36',p:180},white:{n:'珍珠白',c:'#eeeeea',p:180},pink:{n:'霓虹粉',c:'#f0207f',p:200},orange:{n:'越野橙',c:'#ff7a1a',p:200},army:{n:'军绿',c:'#5d8f3f',p:200},
 camoJ:{n:'丛林迷彩',c:'#5d7a3a',p:450,rar:'r',pat:'camo',cols:['#7f9a52','#4f6a2e','#2f3f1c','#a8b47a']},camoD:{n:'沙漠迷彩',c:'#c9a46a',p:450,rar:'r',pat:'camo',cols:['#d8bb84','#b08a52','#8a6a3c','#efdcae']},camoS:{n:'雪地迷彩',c:'#d8dde4',p:450,rar:'r',pat:'camo',cols:['#eef1f5','#b9c2cc','#7d8894','#ffffff']},
 flame:{n:'火焰',c:'#ff5a1f',p:600,rar:'r',pat:'flame'},zebra:{n:'斑马条纹',c:'#cfcfcf',p:550,rar:'r',pat:'zebra'},carbon:{n:'碳纤维',c:'#33343b',p:650,rar:'r',pat:'carbon'},
 iri:{n:'幻彩',c:'#c9a6ff',p:0,rar:'l',lim:true,dyn:'iri'},neonFlow:{n:'霓虹流光',c:'#3a2a66',p:0,rar:'l',lim:true,dyn:'neon'},chrome:{n:'金属电镀',c:'#c4cad4',p:0,rar:'l',lim:true,dyn:'chrome'}};
const LIVS={stripe:{n:'双赛道条纹',p:200},band:{n:'侧腰线',p:150},number:{n:'号码圆标',p:220},roof:{n:'撞色车顶',p:150},
 goldStripe:{n:'鎏金条纹',p:0,lim:true,src:'stripe',c:'#ffc300'},neonBand:{n:'霓虹腰线',p:0,lim:true,src:'band',c:'#39f3ff'},flameNum:{n:'烈焰号码',p:0,lim:true,src:'number',c:'#ff5a1f'}};// lim=限定，仅抽奖获得
const R0=38,DIRS=16;
const CARS={
 tyrant:{name:'铁壁暴君',en:'IRON TYRANT',tag:'皮卡 · 重型',desc:'车重血厚，正面硬抗',col:'#5d8f3f',col2:'#2f4f22',hp:160,mass:2.0,spd:13,acc:12,turn:2.4,dmg:1.25,wb:3.0},
 fang:{name:'霓虹毒牙',en:'NEON FANG',tag:'肌肉车 · 刺客',desc:'极快但脆，绕侧偷袭',col:'#f0207f',col2:'#6d0f3c',hp:85,mass:0.8,spd:20,acc:24,turn:3.2,dmg:1.0,wb:2.8},
 beast:{name:'泥岩狂兽',en:'MUD BEAST',tag:'越野 · 均衡',desc:'抓地稳，乱战能手',col:'#ff7a1a',col2:'#7a3a0c',hp:120,mass:1.3,spd:16,acc:18,turn:3.6,dmg:1.1,wb:2.6}};
const KEYS=Object.keys(CARS);
const PARTS={
 spike:{n:'尖刺',slot:'front',r:'w',mod:{dmg:1.15}},
 plow:{n:'铲刀',slot:'front',r:'w',mod:{push:1.35,dmg:.95}},
 ram:{n:'撞锤',slot:'front',r:'b',mod:{dmg:1.25,mass:1.08,spd:.95}},
 dozer:{n:'推土板',slot:'front',r:'b',mod:{push:1.5,mass:1.15,spd:.92}},
 saw:{n:'电锯',slot:'front',r:'b',mod:{dmg:1.2,hp:.95,sideBonus:1.15}},
 lightArmor:{n:'轻甲',slot:'armor',r:'w',mod:{hp:1.1,mass:1.05}},
 cage:{n:'笼式护栏',slot:'armor',r:'w',mod:{hp:1.12,rearRes:.75,mass:1.06}},
 heavyArmor:{n:'重甲',slot:'armor',r:'b',mod:{hp:1.35,mass:1.3,spd:.9,acc:.85}},
 reactive:{n:'反应装甲',slot:'armor',r:'b',mod:{hp:1.18,critRes:.75,mass:1.12}},
 spikeArmor:{n:'尖刺装甲',slot:'armor',r:'b',mod:{hp:1.08,thorns:.25,mass:1.08}},
 stdEngine:{n:'标准引擎',slot:'engine',r:'w',mod:{acc:1.06,spd:1.03}},
 turbo:{n:'涡轮',slot:'engine',r:'w',mod:{spd:1.1,acc:1.08,turn:.96}},
 rageEngine:{n:'狂暴引擎',slot:'engine',r:'b',mod:{spd:1.15,acc:1.2,turn:.85}},
 nitro:{n:'氮气',slot:'engine',r:'b',mod:{dashCd:.65,dashPow:1.2}},
 electric:{n:'电动',slot:'engine',r:'b',mod:{acc:1.3,spd:.95,turn:1.05}},
 road:{n:'公路胎',slot:'tire',r:'w',mod:{spd:1.06,turn:.95}},
 offTire:{n:'越野胎',slot:'tire',r:'w',mod:{turn:1.08,spd:.96,terr:.5}},
 wide:{n:'宽胎',slot:'tire',r:'b',mod:{turn:1.18,spd:.94}},
 chains:{n:'防滑链',slot:'tire',r:'b',mod:{iceGrip:3,spd:.95,terr:.8}},
 tracks:{n:'履带',slot:'tire',r:'b',mod:{mass:1.15,hp:1.1,turn:.9,spd:.88,terr:0}}};
const MODN={hp:'血量',mass:'重量',spd:'速度',acc:'加速',turn:'操控',dmg:'撞击',push:'推力',sideBonus:'侧撞伤害',rearRes:'车尾受伤',critRes:'暴击受伤',thorns:'反伤',dashCd:'冲刺冷却',dashPow:'冲刺推力',terr:'地形减速',iceGrip:'油污抓地'};
const RAR_OF={spike:'w',plow:'w',lightArmor:'w',cage:'w',stdEngine:'w',turbo:'w',road:'w',offTire:'w',ram:'b',heavyArmor:'b',rageEngine:'b',wide:'b',dozer:'p',reactive:'p',electric:'p',chains:'p',saw:'g',spikeArmor:'g',nitro:'g',tracks:'g'};const RARN={w:'普通',b:'稀有',p:'史诗',g:'传说'};
const ICO=['spike','plow','ram','dozer','saw','lightArmor','cage','heavyArmor','reactive','spikeArmor','stdEngine','turbo','rageEngine','nitro','electric','road','offTire','wide','chains','tracks'];
// 图标：sprites/icons.png（8×3，每格 128）；部件 0-19、金币 20、通用碎片 21
function ico(n,cls,cnt,title){const c=n%8,r=n/8|0;return`<span class="ic ${cls||''}" title="${title||''}"><i style="background-position:${c/7*100}% ${r/2*100}%"></i>${cnt!==undefined?`<b>${cnt}</b>`:''}</span>`}
const icPart=(id,cnt,shard,noLbl)=>{const h=ico(ICO.indexOf(id),'r-'+PARTS[id].r+(shard?' sh':''),cnt,PARTS[id].n+(shard?'碎片':''));return noLbl?h:`<span class="icw">${h}<em class="lbl">${PARTS[id].n}${shard?'碎片':''}</em></span>`},icCoin=cnt=>ico(20,'cur',cnt,'金币'),icUni=cnt=>ico(21,'cur',cnt,'通用碎片');
for(const id in PARTS){const p=PARTS[id];p.r=RAR_OF[id];p.need={w:10,b:20,p:30,g:40}[p.r];p.desc=Object.entries(p.mod).map(([k,v])=>k==='thorns'?`反伤 ${v*100}%`:k==='terr'?(v===0?'无视地形减速':`地形减速 −${Math.round((1-v)*100)}%`):k==='iceGrip'?'油污抓地 ×3':`${MODN[k]} ${v>=1?'+':'−'}${Math.round(Math.abs(v-1)*100)}%`).join(' · ')}
const NAME2ID={};for(const id in PARTS)NAME2ID[PARTS[id].n]=id;
const SLOTS={front:'车头',armor:'装甲',engine:'引擎',tire:'轮胎'};
const STATS={hp:'血量',mass:'重量',spd:'速度',acc:'加速',turn:'操控',dmg:'撞击'};
const PT_MAX=6,PT_PCT=.03,UNI={w:1,b:2,p:3,g:4},MAXLV=20,need=lv=>50+25*(lv-1);
const ZMUL={front:.6,side:1.5,rear:1.2};
// ================= 存档（版本号 + 损坏容错）=================
const SAVE_KEY='carbrawl_save',SAVE_V=2;
const clampInt=(v,a,b,d)=>{v=Math.floor(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):d};
const defCar=()=>({lv:1,xp:0,pts:{hp:0,mass:0,spd:0,acc:0,turn:0,dmg:0},equip:{front:null,armor:null,engine:null,tire:null},paint:{color:'gray',livery:null}});
const defSave=()=>({v:SAVE_V,cars:{tyrant:defCar(),fang:defCar(),beast:defCar()},shards:{},owned:{},uni:0,coins:0,colors:{gray:true},livs:{},tutorialDone:false,nick:'',
 settings:{vol:.7,mute:false,music:true,sfx:true,vibrate:true,quality:'auto',diff:'normal'}});
// v15 名称校验：去首尾空格、禁空、限长、字符白名单、简单敏感词；返回 {ok,v,err}
function badWords(){return['傻逼','傻b','煞笔','sb','nmsl','fuck','shit','bitch','操你','草泥马','尼玛','妈的','他妈','去死','色情','黄片','约炮','赌博','博彩','毒品','习近平','共产党','法轮','台独','官方','客服','管理员','admin','gm']}
function checkName(raw,max){const v=String(raw==null?'':raw).replace(/^[\s\u3000]+|[\s\u3000]+$/g,'');if(!v)return{ok:false,v,err:'名字不能为空'};
 if([...v].length>max)return{ok:false,v,err:`最多 ${max} 个字`};if(!/^[\u4e00-\u9fa5A-Za-z0-9 _\-·.!?~@#&*+=()（）！？。、★☆♥♪]+$/.test(v))return{ok:false,v,err:'只能用中英文、数字和常用符号'};
 const n=v.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g,'');if(badWords().some(w=>n.includes(w)))return{ok:false,v,err:'包含不允许的词，请换一个'};return{ok:true,v}}
function sanitize(o){const d=defSave();if(!o||typeof o!=='object'||!o.cars)throw new Error('bad');
 if(!o.v||o.v<2){for(const k of KEYS){const c=o.cars[k];if(c){d.cars[k].lv=clampInt(c.lv,1,MAXLV,1);d.cars[k].xp=clampInt(c.xp,0,1e6,0)}}
  for(const [nm,v] of Object.entries(o.shards||{})){const id=NAME2ID[String(nm).replace(/\(.*\)/,'')];if(id)d.shards[id]=clampInt(v,0,9999,0)}return d}
 for(const k of KEYS){const c=o.cars[k]||{},t=d.cars[k];t.lv=clampInt(c.lv,1,MAXLV,1);t.xp=clampInt(c.xp,0,1e6,0);
  for(const s in t.pts)t.pts[s]=clampInt(c.pts&&c.pts[s],0,PT_MAX,0);if(Object.values(t.pts).reduce((a,b)=>a+b,0)>t.lv-1)for(const s in t.pts)t.pts[s]=0;
  for(const sl in t.equip){const id=c.equip&&c.equip[sl];t.equip[sl]=(id&&PARTS[id]&&PARTS[id].slot===sl&&o.owned&&o.owned[id])?id:null}
  if(typeof c.name==='string'){const r=checkName(c.name,8);if(r.ok)t.name=r.v}t.nameN=clampInt(c.nameN,0,9999,t.name?1:0)}
 for(const id in PARTS){d.shards[id]=clampInt(o.shards&&o.shards[id],0,9999,0);if(o.owned&&o.owned[id])d.owned[id]=true}
 if(typeof o.nick==='string'&&o.nick.trim())d.nick=[...o.nick.replace(/[<>\s]/g,'')].slice(0,12).join('');d.uni=clampInt(o.uni,0,99999,0);d.coins=clampInt(o.coins,0,9999999,0);for(const c in o.colors||{})if(COLORS[c])d.colors[c]=true;for(const l in o.livs||{})if(LIVS[l])d.livs[l]=true;if(o.daily&&typeof o.daily==='object')d.daily={d:String(o.daily.d||''),free:clampInt(o.daily.free,0,3,3),adSpin:clampInt(o.daily.adSpin,0,9,0),chest:clampInt(o.daily.chest,0,9,0),fill:clampInt(o.daily.fill,0,9,0)};if(o.wish&&PARTS[o.wish])d.wish=o.wish;d.pity=clampInt(o.pity,0,99,0);d.legPity=clampInt(o.legPity,0,999,0);
 for(const k of KEYS){const pp=(o.cars[k]||{}).paint||{};d.cars[k].paint={color:COLORS[pp.color]&&d.colors[pp.color]?pp.color:'gray',livery:LIVS[pp.livery]&&d.livs[pp.livery]?pp.livery:null}}d.tutorialDone=!!o.tutorialDone;const s=o.settings||{};
 if(typeof s.vol==='number'&&isFinite(s.vol))d.settings.vol=Math.max(0,Math.min(1,s.vol));['mute','music','sfx','vibrate'].forEach(k=>{if(typeof s[k]==='boolean')d.settings[k]=s[k]});
 if(['auto','high','low'].includes(s.quality))d.settings.quality=s.quality;if(['easy','normal','hard'].includes(s.diff))d.settings.diff=s.diff;return d}
let saveWarn='';
function loadSave(){let raw=null;try{raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem('carbrawl_save_v1')}catch(e){return defSave()}
 if(!raw)return defSave();try{return sanitize(JSON.parse(raw))}catch(e){try{localStorage.setItem(SAVE_KEY+'_corrupt_'+Date.now(),raw)}catch(_){}saveWarn='存档损坏，已备份并重置为新存档';return defSave()}}
let save=loadSave();
function persist(){try{save.v=SAVE_V;localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}persist();
function carStats(k,cs){const b=CARS[k],o={hp:b.hp,mass:b.mass,spd:b.spd,acc:b.acc,turn:b.turn,dmg:b.dmg,push:1,sideBonus:1,rearRes:1,critRes:1,thorns:0,dashCd:1,dashPow:1,terr:1,iceGrip:1};
 for(const s in STATS)o[s]*=1+cs.pts[s]*PT_PCT;for(const sl in cs.equip){const p=PARTS[cs.equip[sl]];if(p)for(const m in p.mod){if(m==='thorns')o.thorns+=p.mod[m];else if(m==='terr')o.terr=Math.min(o.terr,p.mod[m]);else o[m]*=p.mod[m]}}return o}
const ptsUsed=cs=>Object.values(cs.pts).reduce((a,b)=>a+b,0),ptsFree=cs=>cs.lv-1-ptsUsed(cs);
// 本局参赛车数 / 初始圈：随玩家车等级递增
const roster=lv=>({n:lv>=10?8:lv>=5?6:4});
// AI 难度：设置档位 + 等级逐步提升 → 0..1
function aiSkill(lv){return Math.min(1,{easy:.12,normal:.42,hard:.72}[save.settings.diff]+(lv-1)*.015)}
// ================= 画布 / 画质 =================
const cv=document.getElementById('cv');let ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,Z=1,QL=save.settings.quality==='low'?'low':'high',PM=1;
let ROT=false;
// 竖持手机：整个 #app 旋转 90°，始终以横屏画面运行；屏幕坐标 → 游戏坐标
// v15 真机视口：iOS Safari 地址栏/工具栏会让 innerHeight 与可见区不一致，统一用 visualViewport
function VVW(){const v=window.visualViewport;return Math.round(v&&v.width||innerWidth)}function VVH(){const v=window.visualViewport;return Math.round(v&&v.height||innerHeight)}
function toLocal(cx,cy){return ROT?[cy,VVW()-cx]:[cx,cy]}
function resize(){DPR=Math.min(devicePixelRatio||1,QL==='low'?1:2);PM=QL==='low'?.45:1;const vw=VVW(),vh=VVH(),rot=vh>vw;ROT=rot;W=rot?vh:vw;H=rot?vw:vh;document.body.classList.toggle('rot',rot);const ds=document.documentElement.style;ds.setProperty('--aw',W+'px');ds.setProperty('--ah',H+'px');ds.setProperty('--vl',vw+'px');window.scrollTo(0,0);cv.style.width=W+'px';cv.style.height=H+'px';cv.width=W*DPR|0;cv.height=H*DPR|0;
 const land=true;Z=land?Math.max(.55,Math.min(1,H/520)):Math.max(.62,Math.min(1.1,Math.min(W/430,H/760)));document.body.classList.toggle('land',land)}
addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(VVW()!==(ROT?H:W)||VVH()!==(ROT?W:H))resize()});addEventListener('orientationchange',()=>setTimeout(resize,200));
let triedLock=false;addEventListener('pointerdown',()=>{if(triedLock)return;triedLock=true;try{const d=document.documentElement,p=d.requestFullscreen?d.requestFullscreen({navigationUI:'hide'}):null;Promise.resolve(p).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape')).then(()=>setTimeout(resize,300)).catch(()=>{})}catch(e){}},{capture:true});resize();
function setQuality(q){save.settings.quality=q;persist();QL=q==='low'?'low':'high';resize()}
function rnd(a,b){return a+Math.random()*(b-a)}
const iso=(x,z)=>[(x-z)*K,(x+z)*K/2];
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const BASE={},PAINT={},WHL={},LAYI={},WHITE={},DARK={},SKIN=new Map();
const LINES={},LSPLIT={},ASSET_V=12;
function splitLines(k){if(LSPLIT[k])return LSPLIT[k];const im=LINES[k],w=im.width,h=im.height,mk=()=>{const c=mkC(w,h);return[c,c.getContext('2d')]};const[s0,x0]=mk();x0.drawImage(im,0,0);const D=x0.getImageData(0,0,w,h),Hh=new ImageData(w,h),Dd=new ImageData(w,h);
 for(let i=0;i<D.data.length;i+=4){if(!D.data[i+3])continue;const T=D.data[i]>128?Hh:Dd;for(let j=0;j<4;j++)T.data[i+j]=D.data[i+j]}
 const[d,dx]=mk(),[hc,hx]=mk(),[dl,lx]=mk();dx.putImageData(Dd,0,0);hx.putImageData(Hh,0,0);lx.putImageData(Dd,0,0);lx.globalCompositeOperation='source-in';lx.fillStyle='#7a7290';lx.fillRect(0,0,w,h);
 return LSPLIT[k]={d,h:hc,dl}}
function compose(k,color,liv){const key=k+'|'+color+'|'+(liv||'');if(SKIN.has(key))return SKIN.get(key);const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d');x.drawImage(BASE[k],0,0);
 const t=mkC(W4,W4),tx=t.getContext('2d');tx.drawImage(PAINT[k],0,0);tx.globalCompositeOperation='multiply';tx.fillStyle=COLORS[color].c;tx.fillRect(0,0,W4,W4);tx.globalCompositeOperation='destination-in';tx.drawImage(PAINT[k],0,0);x.drawImage(t,0,0);
 if(liv&&LIVS[liv]&&LAYI[k+'_liv_'+(LIVS[liv].src||liv)]){const lc=LIVS[liv].c||(lum(COLORS[color].c)>.55?'#1b1420':'#ffffff'),L=LAYI[k+'_liv_'+(LIVS[liv].src||liv)],l=mkC(W4,W4),lx=l.getContext('2d');lx.drawImage(L,0,0,W4,W4);lx.globalCompositeOperation='source-in';lx.fillStyle=lc;lx.fillRect(0,0,W4,W4);x.drawImage(l,0,0)}
 if(LINES[k]){const sp=splitLines(k),dk=lum(COLORS[color].c)<.3;x.drawImage(dk?sp.dl:sp.d,0,0);x.drawImage(sp.h,0,0);if(dk)x.drawImage(sp.h,0,0)}
 if(SKIN.size>32)SKIN.delete(SKIN.keys().next().value);SKIN.set(key,o);return o}
function lum(h){const n=parseInt(h.slice(1),16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255}
function loadImg(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src})}
function tint(img,col,alpha){const c=mkC(img.width,img.height),x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=alpha;x.fillStyle=col;x.fillRect(0,0,c.width,c.height);return c}
// ================= 音频（WebAudio 程序化）=================
const AU={ctx:null};
// iOS：必须在用户手势的同步回调里创建/resume AudioContext，并播放一个极短静音 buffer 解锁。尊重静音键（不绕过）。
function auResume(){const a=AU.ctx;if(a&&a.state!=='running'&&a.state!=='closed'){const p=a.resume();if(p&&p.then)p.then(auStatus,auStatus)}auStatus()}
function auUnlock(){auInit();const a=AU.ctx;if(!a)return;try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0)}catch(e){}auResume()}
function auStatus(){const el=document.getElementById('auHint');if(!el)return;const ok=AU.ctx&&AU.ctx.state==='running',on=!save.settings.mute&&save.settings.vol>0&&(save.settings.music||save.settings.sfx);el.classList.toggle('hide',ok||!on);el.textContent=AU.ctx?'🔇 点击屏幕开启声音':'🔈 点击开启声音'}
function auInit(){if(AU.ctx){if(AU.ctx.state!=='running')auResume();return}let a;try{a=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}AU.ctx=a;
 a.onstatechange=()=>{auStatus();if(a.state==='interrupted'||a.state==='suspended')setTimeout(()=>{if(!document.hidden)auResume()},300)};
 AU.master=a.createGain();AU.an=a.createAnalyser();AU.an.fftSize=1024;AU.master.connect(AU.an);AU.an.connect(a.destination);AU.sfx=a.createGain();AU.sfx.connect(AU.master);AU.music=a.createGain();AU.music.connect(AU.master);
 AU.noise=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const o=a.createOscillator();o.type='sawtooth';const o2=a.createOscillator();o2.type='square';const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=400;const g=a.createGain();g.gain.value=0;
 o.connect(f);o2.connect(f);f.connect(g);g.connect(AU.sfx);o.start();o2.start();AU.eng={o,o2,f,g};auApply();bgmStart()}
function auApply(){if(!AU.ctx)return;const s=save.settings,t=AU.ctx.currentTime;AU.master.gain.setTargetAtTime(s.mute?0:s.vol,t,.05);AU.sfx.gain.setTargetAtTime(s.sfx?1:0,t,.05);AU.music.gain.setTargetAtTime(s.music?.32:0,t,.05)}
function tone(f,d,type,v,slide,t0,dest){const a=AU.ctx,t=t0||a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+d+.02)}
function noise(d,v,freq,t0,dest,hp){const a=AU.ctx,t=t0||a.currentTime,s=a.createBufferSource();s.buffer=AU.noise;const f=a.createBiquadFilter();f.type=hp?'highpass':'lowpass';f.frequency.setValueAtTime(freq,t);if(!hp)f.frequency.exponentialRampToValueAtTime(Math.max(60,freq*.2),t+d);const g=a.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest||AU.sfx);s.start(t);s.stop(t+d)}
const SFX={hit:p=>{noise(.15,.12+.3*p,1800);tone(110,.15,'sine',.1+.35*p,.5)},crit:()=>{noise(.22,.45,3500);tone(880,.18,'square',.12,1.5);tone(90,.25,'sine',.5,.4)},
 block:()=>{tone(320,.08,'triangle',.15,.7);noise(.06,.12,2500)},boom:()=>{noise(.9,.7,1200);tone(70,.7,'sine',.6,.3);tone(45,.9,'triangle',.4,.5)},
 dash:()=>{noise(.3,.2,900);tone(200,.25,'sawtooth',.08,2.2);setTimeout(()=>{if(AU.ctx){noise(.55,.14,2400);tone(110,.5,'sawtooth',.05,3)}},70)},ui:()=>tone(660,.07,'square',.08,1.3),good:()=>{tone(523,.1,'square',.1);tone(784,.18,'square',.1,0,AU.ctx.currentTime+.09)},
 zap:()=>tone(1500+Math.random()*800,.05,'sawtooth',.03,.5),skid:()=>noise(.12,.05,4000,0,0,true)};
function sfx(n,...a){if(!AU.ctx||!save.settings.sfx||save.settings.mute)return;try{SFX[n](...a)}catch(e){}}
let bgmStep=0,bgmNext=0;const BASS=[45,45,41,43],ARP=[0,7,12,7,3,7,15,7],midi=n=>440*Math.pow(2,(n-69)/12);
function bgmStart(){if(AU.bgmT)return;bgmNext=AU.ctx.currentTime+.1;AU.bgmT=setInterval(()=>{const a=AU.ctx;if(!a||a.state!=='running')return;if(bgmNext<a.currentTime-.3)bgmNext=a.currentTime+.05;const sp=60/124/4;
 while(bgmNext<a.currentTime+.25){const st=bgmStep%64,root=BASS[st>>4];
  if(st%4===0)tone(midi(root),.22,'triangle',.5,0,bgmNext,AU.music);if(st%2===0)tone(midi(root+24+ARP[(st>>1)%8]),.11,'square',.06,0,bgmNext,AU.music);
  if(st%8===4)noise(.07,.18,6000,bgmNext,AU.music,true);if(st%16===0)tone(60,.18,'sine',.5,.4,bgmNext,AU.music);bgmNext+=sp;bgmStep++}},60)}
function engineUpd(){if(!AU.eng)return;const t=AU.ctx.currentTime,on=running&&!paused&&player&&player.alive;const sp=on?Math.abs(player.fwd||0):0,r=on&&player.dash>0?1.35:1;
 AU.eng.o.frequency.setTargetAtTime((48+sp*6.5)*r,t,.06);AU.eng.o2.frequency.setTargetAtTime((24+sp*3.2)*r,t,.06);AU.eng.f.frequency.setTargetAtTime(280+sp*45,t,.06);AU.eng.g.gain.setTargetAtTime(on&&save.settings.sfx?.035+sp*.0035:0,t,.08)}
['touchstart','touchend','pointerdown','mousedown','click','keydown'].forEach(t=>addEventListener(t,auUnlock,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden){AU.ctx.suspend&&AU.ctx.suspend()}else auResume()});addEventListener('pageshow',()=>AU.ctx&&auResume());addEventListener('focus',()=>AU.ctx&&auResume());
function audioLevel(){if(!AU.an)return 0;const d=new Float32Array(AU.an.fftSize);AU.an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;return Math.sqrt(s/d.length)}
// 震动：只对玩家参与的撞击，按强度分档
function vib(level){if(!save.settings.vibrate)return;const p={light:12,mid:30,heavy:[60,30,90],boom:[120,40,160]}[level];try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
// ================= 游戏状态 =================
let MODE='brawl';
let cars=[],player=null,running=false,paused=false,time=0,zoneR=R0,zone0=R0,pairCD=new Map(),fts=[],parts=[],kills=0,activeT=0,playerKey='beast',aliveAtDeath=0,deadTime=0,shake=0,hitstop=0,ids=0,camX=0,camY=0,tut=null,introT=0,nCars=8;
function aiCs(lv,sk){const cs=defCar();cs.lv=lv;const ids=Object.keys(PARTS).sort(()=>Math.random()-.5);let np=Math.min(4,Math.floor(lv/3)+(sk>.7?1:0));for(const id of ids){if(np<=0)break;if(!cs.equip[PARTS[id].slot]){cs.equip[PARTS[id].slot]=id;np--}}
 const ck=Object.keys(COLORS).filter(c=>c!=='gray'&&(!COLORS[c].rar||COLORS[c].rar==='r'&&lv>=5||COLORS[c].rar==='l'&&lv>=10&&Math.random()<.3));cs.paint={color:lv>=2?ck[Math.random()*ck.length|0]:'gray',livery:lv>=4?Object.keys(LIVS)[Math.random()*4|0]:null};let n=lv-1;const ks=Object.keys(STATS);while(n>0){const s=ks[Math.random()*6|0];if(cs.pts[s]<PT_MAX){cs.pts[s]++;n--}}
 return cs}
function makeCar(k,isP,cs,sk){const st=carStats(k,cs),sm=isP?1:.86+sk*.2;return{id:ids++,k,s:CARS[k],isP,lv:cs.lv,sk:sk||0,skin:compose(k,cs.paint.color,cs.paint.livery),eq:Object.values(cs.equip).filter(Boolean),x:0,z:0,h:0,vx:0,vz:0,fwd:0,steer:0,yaw:0,hp:st.hp,maxhp:st.hp,spd:st.spd*sm,acc:st.acc*sm,turn:st.turn,dmg:st.dmg,mass:st.mass,push:st.push,sideBonus:st.sideBonus,rearRes:st.rearRes,critRes:st.critRes,thorns:st.thorns,dashCd:st.dashCd,dashPow:st.dashPow,terr:st.terr,iceGrip:st.iceGrip,r:1.8,
 dash:0,dcd:0,alive:true,flash:0,deadT:0,smokeT:0,dustT:0,roll:0,sus:{px:0,py:0,vx:0,vy:0},bump:0,lastA:0,lastL:0,ai:{t:null,re:0,pers:['莽夫','刺客','苟王'][Math.random()*3|0]}}}
function start(k,opt){opt=opt||{};playerKey=k;cars=[];fts=[];parts=[];pairCD.clear();skx.clearRect(0,0,skid.width,skid.height);paused=false;
 const cs=save.cars[k];player=makeCar(k,true,cs);if(!save.nick){save.nick=randNick();persist()}player.nick=save.nick;player.frame='#ffc300';cars.push(player);tut=null;
 if(opt.tutorial){tut={step:0,t:0};const d=makeCar('tyrant',false,defCar(),0);d.dummy=true;d.nick='训练假人';d.frame='#9aa0b4';d.hp=d.maxhp=9999;cars.push(d);
  player.x=-8*SC;player.z=-22*SC;player.h=Math.PI/4;d.x=2*SC;d.z=-14*SC;props=props.filter(p=>!p.solid||p.wall||Math.hypot(p.x-d.x,p.z-d.z)>9&&Math.hypot(p.x-player.x,p.z-player.z)>6);d.h=-Math.PI/4;zone0=zoneR=AR;updZone();nCars=2}
 else{const ro=roster(cs.lv);nCars=ro.n;if(AR!==arenaR(ro.n))buildArena(mapKey,arenaR(ro.n));zone0=zoneR=AR;ro.r=AR;
  const opps=opt.opps||Array.from({length:ro.n-1},()=>{const lv=Math.max(1,Math.min(MAXLV,cs.lv+((Math.random()*3|0)-1))),sk=aiSkill(lv);return{k:KEYS[Math.random()*3|0],lv,sk,cs:aiCs(lv,sk),nick:randNick(),frame:FRAMES[Math.random()*FRAMES.length|0]}});
  for(const o of opps){const c=makeCar(o.k,false,o.cs,o.sk);c.nick=o.nick;c.frame=o.frame;cars.push(c)}
  const sp=spawnPts(ro.n);cars.forEach((c,i)=>{c.x=sp[i][0];c.z=sp[i][1];c.h=Math.atan2(ZC[0]-c.x,ZC[1]-c.z)});updZone()}
 time=0;kills=0;activeT=0;deadTime=0;shake=0;hitstop=0;running=true;resetView();introT=opt.tutorial?0:2.2;
 hideAll();show('hud',1);$('hpName').textContent=CARS[k].name;$('lvTag').textContent='Lv.'+cs.lv;drawThumb(document.querySelector('#avatar canvas'),k,3,.42);
 if(!opt.tutorial){$('intro').innerHTML=`<b>${nCars}</b> 辆车参战<small>Lv.${cs.lv} · ${ {easy:'简单',normal:'普通',hard:'困难'}[save.settings.diff]} · 存活到最后！</small>`;show('intro',1);setTimeout(()=>show('intro',0),2000)}
 updTut()}
// ================= 输入（屏幕方向 → 世界方向）=================
const keys={};let jx=0,jy=0,jid=null,dashReq=false;
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space'){dashReq=true;e.preventDefault()}if((e.code==='Escape'||e.code==='KeyP')&&running)togglePause()});addEventListener('keyup',e=>keys[e.code]=0);
const joy=document.getElementById('joy'),knob=document.getElementById('knob');
function jmove(e){const r=joy.getBoundingClientRect(),[ox,oy]=toLocal(r.left+r.width/2,r.top+r.height/2),[px,py]=toLocal(e.clientX,e.clientY),c=joy.offsetWidth/2;let dx=px-ox,dy=py-oy;const L=Math.hypot(dx,dy),m=c*.75;if(L>m){dx*=m/L;dy*=m/L}knob.style.transform=`translate(${dx}px,${dy}px)`;jx=dx/m;jy=dy/m}
joy.addEventListener('pointerdown',e=>{jid=e.pointerId;joy.setPointerCapture(jid);jmove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});
const jend=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;knob.style.transform=''}};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);joy.addEventListener('lostpointercapture',jend);
// 浮动摇杆：左半屏任意位置按下即以该点为摇杆中心
{const cvE=document.getElementById('cv');const home=()=>{joy.style.left=joy.style.top=joy.style.bottom='';joy.classList.remove('float')};
 cvE.addEventListener('pointerdown',e=>{if(!running||paused||jid!==null)return;const[px,py]=toLocal(e.clientX,e.clientY),aw=ROT?innerHeight:innerWidth,ah=ROT?innerWidth:innerHeight;if(px>aw*.5||py<ah*.25)return;
  const w=joy.offsetWidth,h=joy.offsetHeight;joy.classList.add('float');joy.style.left=clamp(px-w/2,6,aw*.5-w/2)+'px';joy.style.top=clamp(py-h/2,6,ah-h-6)+'px';joy.style.bottom='auto';
  jid=e.pointerId;cvE.setPointerCapture(jid);jmove(e);e.preventDefault()});
 cvE.addEventListener('pointermove',e=>{if(e.pointerId===jid)jmove(e)});const je=e=>{if(e.pointerId===jid){jid=null;jx=jy=0;knob.style.transform='';home()}};['pointerup','pointercancel','lostpointercapture'].forEach(t=>cvE.addEventListener(t,je))}
addEventListener('blur',()=>{jid=null;jx=jy=0;knob.style.transform='';revHold=false;for(const k in keys)keys[k]=0});
let revHold=false;const rvb=document.getElementById('rev');rvb.addEventListener('pointerdown',e=>{e.preventDefault();revHold=true;rvb.setPointerCapture(e.pointerId);rvb.classList.add('on')});['pointerup','pointercancel','lostpointercapture'].forEach(t=>rvb.addEventListener(t,()=>{revHold=false;rvb.classList.remove('on')}));
document.getElementById('dash').addEventListener('pointerdown',e=>{e.preventDefault();dashReq=true});
function screenToWorld(sx,sy){const wx=sy+sx/2,wz=sy-sx/2,L=Math.hypot(wx,wz)||1;return[wx/L,wz/L]}
// ================= 特效 =================
function ft(x,z,y,text,color,size,big){for(const f of fts)if(f.t<.35&&Math.abs(f.x-x)+Math.abs(f.z-z)<3&&Math.abs(f.y-y)<.9)y=f.y+1.1;fts.push({x,z,y,text,color,size,t:0,big})}
function spark(x,z,n,col){for(let i=0,N=Math.ceil(n*PM);i<N;i++){const a=rnd(0,7),v=rnd(6,18);parts.push({k:'spark',x,z,y:rnd(.5,1.5),vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(3,9),t:0,life:rnd(.25,.5),col:col||(Math.random()<.5?'#fff3a0':'#ffb703')})}}
function debris(x,z,n,col){for(let i=0,N=Math.ceil(n*PM);i<N;i++){const a=rnd(0,7),v=rnd(4,11);parts.push({k:'deb',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(5,11),t:0,life:rnd(.8,1.4),col:Math.random()<.6?col:'#6c7480',rot:rnd(0,7),vr:rnd(-12,12),s:rnd(3,6)})}}
function smoke(x,z,n,dark){for(let i=0,N=Math.ceil(n*PM);i<N;i++)parts.push({k:'smoke',x:x+rnd(-.6,.6),z:z+rnd(-.6,.6),y:rnd(.5,1.5),vx:rnd(-1,1),vz:rnd(-1,1),vy:rnd(1.5,3),t:0,life:rnd(.7,1.3),s:rnd(8,14),dark})}
function boom(x,z,col){parts.push({k:'flash',x,z,y:1,t:0,life:.35});parts.push({k:'ring',x,z,y:0,t:0,life:.5});spark(x,z,26,'#ffd23f');debris(x,z,14,col);smoke(x,z,10,true);for(let i=0;i<8;i++){const a=rnd(0,7),v=rnd(2,6);parts.push({k:'fire',x,z,y:1,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:rnd(2,6),t:0,life:rnd(.4,.7),s:rnd(10,18)})}}
// ================= 地图（3 主题）=================
const MAPS={
 site:{name:'工地',en:'CONSTRUCTION',desc:'混凝土块 · 油桶 · 泥浆坑减速',tiles:['#cdc7b9','#c2bcae'],line:'#aaa394',speck:['#b3ad9f','#dcd7cc'],out:['#8a7a5c','#9a8a6a','#76684d'],rail:['#ffc300','#1b1420'],paint:'#ffc300cc',logo:'SITE',obst:['block','barrel'],zone:{k:'mud',name:'泥浆',n:5,r:[3,5]},dust:'#b8ab90',deco:'site',shape:'长方形 · 中央工棚 · 两侧通道',poly:[[-42,-24],[-38,-28],[38,-28],[42,-24],[42,24],[38,28],[-38,28],[-42,24]],walls:[[-14,-5,14,-5,'block'],[-14,5,14,5,'block'],[-14,-5,-14,5,'block'],[14,-5,14,5,'block'],[-30,-13,-30,-22,'barrel'],[30,13,30,22,'barrel'],[-30,22,-30,17,'barrel'],[30,-22,30,-17,'barrel']],pits:[[[-13,-4],[13,-4],[13,4],[-13,4]]],zc:[0,-16]},
 junk:{name:'废车场',en:'JUNKYARD',desc:'报废车堆 · 轮胎 · 油污打滑',tiles:['#948f84','#8a857a'],line:'#77726a',speck:['#7d776d','#a8a397'],out:['#5e5648','#6a6252','#504a3e'],rail:['#b5562d','#7b7b7b'],paint:'#efe7d4bb',logo:'JUNK',obst:['scrap','tires'],zone:{k:'oil',name:'油污',n:6,r:[2.2,3.8]},dust:'#a29c90',deco:'junk',shape:'不规则 · 弯道夹道 · 车堆隔断',poly:[[-44,-6],[-30,-26],[-6,-30],[8,-18],[28,-30],[46,-14],[44,12],[26,28],[4,26],[-6,12],[-22,28],[-40,20]],walls:[[-26,-4,-12,6,'scrap'],[14,2,28,-8,'scrap'],[-4,-22,-4,-10,'scrap'],[30,10,36,18,'tires'],[-34,-14,-26,-18,'tires'],[10,14,18,18,'tires']],zc:[0,-2]},
 desert:{name:'沙漠',en:'DESERT',desc:'岩石 · 仙人掌 · 软沙扬尘',tiles:['#ebcd8e','#e4c381'],line:'#d5b06a',speck:['#d9b56f','#f5dfab'],out:['#dcab62','#e4b870','#c99a52'],rail:['#8b5a2b','#c9a070'],paint:'#ffffffaa',logo:'DUNE',obst:['rock','cactus'],zone:{k:'sand',name:'软沙',n:6,r:[3.5,6]},dust:'#f2dba2',deco:'desert',shape:'狭长峡谷 · 中部窄口 · 两侧高台',poly:[[-60,-6],[-46,-18],[-22,-16],[-8,-10],[8,-10],[24,-18],[48,-16],[62,-2],[50,14],[26,16],[8,9],[-8,9],[-26,18],[-50,14]],walls:[[0,-1,0,1,'rock']],mesas:[[-38,0,9],[38,0,9]],zc:[0,5]}};
const MAPK=Object.keys(MAPS);
let AR=38,MAP=MAPS.site,mapKey='site',floor,skid,skx,FSC=1,props=[],gzones=[];
const arenaR=n=>MODE==='ring'?(n>=8?28:n>=6?24:20):n>=8?66:n>=6?54:38;            // 半径当量：4 车=第一版面积；6 车≈2 倍；8 车≈3 倍
// ---- 多边形工具 ----
let POLY=[],ZC=[0,0],ZPOLY=[],SC=1,GRID=null;
function inPoly(P,x,z){let o=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[a,b]=P[i],[c,d]=P[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)o=!o}return o}
function nearEdge(P,x,z){let best=1e9,q=null;for(let i=0,j=P.length-1;i<P.length;j=i++){const[a,b]=P[j],[c,d]=P[i],ex=c-a,ez=d-b,t=Math.max(0,Math.min(1,((x-a)*ex+(z-b)*ez)/(ex*ex+ez*ez))),px=a+ex*t,pz=b+ez*t,dd=Math.hypot(x-px,z-pz);if(dd<best){best=dd;q=[px,pz]}}return{d:best,q}}
function sdist(P,x,z){const e=nearEdge(P,x,z),ins=inPoly(P,x,z),dd=e.d||1e-6;return{s:ins?-e.d:e.d,nx:(ins?e.q[0]-x:x-e.q[0])/dd,nz:(ins?e.q[1]-z:z-e.q[1])/dd}}
const scaleP=(P,c,f)=>P.map(([x,z])=>[c[0]+(x-c[0])*f,c[1]+(z-c[1])*f]);
const pArea=P=>{let A=0;for(let i=0,j=P.length-1;i<P.length;j=i++)A+=P[j][0]*P[i][1]-P[i][0]*P[j][1];return Math.abs(A/2)};
function randIn(m){for(let k=0;k<200;k++){const x=rnd(-90,90),z=rnd(-90,90);if(inPoly(POLY,x,z)&&sdist(POLY,x,z).s<-m)return[x,z]}return[ZC[0],ZC[1]]}
function updZone(){ZPOLY=scaleP(POLY,ZC,zoneR/AR)}
function buildArena(mk,R){mapKey=mk;MAP=MAPS[mk];AR=R;SC=R*Math.sqrt(Math.PI/pArea(MAP.poly));POLY=MAP.poly.map(([x,z])=>[x*SC,z*SC]);ZC=[MAP.zc[0]*SC,MAP.zc[1]*SC];zoneR=AR;updZone();
 let mx=0;for(const[x,z]of POLY)mx=Math.max(mx,Math.abs(x),Math.abs(z));AR_EXT=mx;FSC=Math.min(1,52/(mx+14));
 buildProps0();
 gzones=[];const zn=Math.round(MAP.zone.n*R*R/1444);for(let i=0;i<zn*6&&gzones.length<zn;i++){const[x,z]=randIn(5),rr=rnd(...MAP.zone.r);if(gzones.every(g=>Math.hypot(g.x-x,g.z-z)>g.r+rr+3)&&props.every(p=>!p.solid||Math.hypot(p.x-x,p.z-z)>rr+p.r+1)&&!(MAP.mesas||[]).some(m=>Math.hypot(m[0]*SC-x,m[1]*SC-z)<m[2]*SC+rr))gzones.push({x,z,r:rr})}
 buildGrid();{let best=null,bd=1e9;for(let j=0;j<GRID.n;j++)for(let i=0;i<GRID.n;i++)if(GRID.ok[j*GRID.n+i]){const[x,z]=cellPos(i,j);if(!openCell(x,z,5))continue;const d=Math.hypot(x-ZC[0],z-ZC[1]);if(d<bd){bd=d;best=[x,z]}}if(best)ZC=best;updZone()}buildFloor();buildProps1()}
let AR_EXT=40;
function buildFloor(){const ext=AR_EXT+14,w=Math.ceil(ext*2*Math.SQRT2*K*FSC)+8,h=Math.ceil(ext*Math.SQRT2*K*FSC)+8;floor=mkC(w,h);skid=mkC(w,h);skx=skid.getContext('2d');
 const x=floor.getContext('2d');x.translate(w/2,h/2);x.scale(FSC,FSC);const M=MAP,W2=w/FSC,H2=h/FSC;
 x.fillStyle=M.out[0];x.fillRect(-W2/2,-H2/2,W2,H2);
 for(let i=0;i<W2*H2/900;i++){x.fillStyle=M.out[1+(Math.random()*2|0)];x.fillRect(rnd(-W2/2,W2/2),rnd(-H2/2,H2/2),rnd(2,6),rnd(1,3))}
 const T=2,n=Math.ceil(ext/T);
 for(let i=-n;i<n;i++)for(let j=-n;j<n;j++){const cx=(i+.5)*T,cz=(j+.5)*T;if(sdist(POLY,cx,cz).s>2.6)continue;
  const p0=iso(i*T,j*T),a=iso((i+1)*T,j*T),b=iso((i+1)*T,(j+1)*T),c=iso(i*T,(j+1)*T);x.beginPath();x.moveTo(p0[0],p0[1]);x.lineTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.lineTo(c[0],c[1]);x.closePath();
  x.fillStyle=M.tiles[(i+j)&1];x.fill();x.strokeStyle=M.line;x.lineWidth=1;x.stroke();
  for(let k=0;k<5;k++){const p=iso((i+Math.random())*T,(j+Math.random())*T);x.fillStyle=M.speck[Math.random()*2|0];x.beginPath();x.ellipse(p[0],p[1],rnd(1,3),rnd(.5,1.5),0,0,7);x.fill()}}
 const sp=(P,st,lw,dash)=>{x.save();x.beginPath();P.forEach((q,i)=>{const p=iso(q[0],q[1]);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.closePath();x.strokeStyle=st;x.lineWidth=lw;x.setLineDash(dash||[]);x.lineJoin='round';x.stroke();x.restore()};
 const off=d=>POLY.map(([px,pz])=>{const e=sdist(POLY,px,pz);const cx=px-ZC[0],cz=pz-ZC[1],L=Math.hypot(cx,cz)||1;return[px+cx/L*d,pz+cz/L*d]});
 sp(off(3.4),M.out[2],3.2*K);sp(off(2.4),'#2b2230',3);sp(off(-1.4),M.paint,4,[18,12]);sp(scaleP(POLY,ZC,10/AR),M.paint,4,[8,8]);
 // 中央工棚地基坑
 for(const pit of M.pits||[]){const P=pit.map(([a,b])=>iso(a*SC,b*SC));x.fillStyle='#8f887a';x.beginPath();P.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();x.strokeStyle='#ffc300';x.lineWidth=6;x.setLineDash([14,10]);x.stroke();x.setLineDash([]);
  for(let k=0;k<10;k++){const q=iso(rnd(pit[0][0],pit[1][0])*SC,rnd(pit[0][1],pit[2][1])*SC);x.fillStyle=['#a0998a','#6f685c'][k%2];x.fillRect(q[0]-8,q[1]-3,16,6)}}
 // 沙漠高台
 for(const [mx2,mz2,mr] of M.mesas||[]){const c=iso(mx2*SC,mz2*SC),rx=mr*SC*K*Math.SQRT2,ry=rx/2;x.fillStyle='#b98a4c';x.beginPath();x.ellipse(c[0],c[1]+14,rx,ry,0,0,7);x.fill();x.fillStyle='#f3d79a';x.beginPath();x.ellipse(c[0],c[1],rx,ry,0,0,7);x.fill();x.strokeStyle='#d5b06a';x.lineWidth=2;for(let k=1;k<4;k++){x.beginPath();x.ellipse(c[0],c[1],rx*k/4,ry*k/4,0,0,7);x.stroke()}}
 const rp=()=>randIn(4);
 if(M.deco==='site')for(let i=0;i<AR/3;i++){const q=rp(),p=iso(q[0],q[1]);x.strokeStyle='#8f887a';x.lineWidth=2;x.beginPath();x.moveTo(p[0],p[1]);for(let k=0;k<4;k++)x.lineTo(p[0]+rnd(-30,30),p[1]+rnd(-12,12));x.stroke()}
 if(M.deco==='junk')for(let i=0;i<AR/2;i++){const q=rp(),p=iso(q[0],q[1]);x.fillStyle=['#6b4a35','#575247','#8a5a3a'][i%3];x.save();x.translate(p[0],p[1]);x.rotate(rnd(0,3));x.fillRect(-rnd(3,8),-2,rnd(6,16),rnd(3,5));x.restore()}
 if(M.deco==='desert')for(let i=0;i<AR*1.5;i++){const q=rp(),p=iso(q[0],q[1]);x.strokeStyle='#d2ab63';x.lineWidth=1.5;x.beginPath();x.ellipse(p[0],p[1],rnd(14,30),rnd(4,8),0,Math.PI*1.1,Math.PI*1.9);x.stroke()}
 for(const g of gzones){const p=iso(g.x,g.z),rx=g.r*K*Math.SQRT2,ry=rx/2;x.save();
  if(MAP.zone.k==='mud'){x.fillStyle='#5b4128';x.beginPath();x.ellipse(p[0],p[1]+2,rx*1.04,ry*1.06,0,0,7);x.fill();x.fillStyle='#7a5733';x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();for(let k=0;k<8;k++){x.fillStyle='#9a7448';x.beginPath();x.ellipse(p[0]+rnd(-rx*.6,rx*.6),p[1]+rnd(-ry*.6,ry*.6),rnd(6,14),rnd(2,5),0,0,7);x.fill()}x.fillStyle='#ffffff30';x.beginPath();x.ellipse(p[0]-rx*.3,p[1]-ry*.3,rx*.3,ry*.15,0,0,7);x.fill()}
  if(MAP.zone.k==='oil'){const gr=x.createRadialGradient(p[0],p[1],2,p[0],p[1],rx);gr.addColorStop(0,'#141018d0');gr.addColorStop(.75,'#2a2233b0');gr.addColorStop(1,'#1e182600');x.fillStyle=gr;x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();x.globalAlpha=.35;['#ff4fd8','#4fd8ff','#ffe14f'].forEach((c,k)=>{x.strokeStyle=c;x.lineWidth=3;x.beginPath();x.ellipse(p[0]-rx*.15+k*4,p[1]-ry*.1,rx*(.5-k*.08),ry*(.4-k*.06),0,Math.PI,Math.PI*1.8);x.stroke()})}
  if(MAP.zone.k==='sand'){const gr=x.createRadialGradient(p[0],p[1],2,p[0],p[1],rx);gr.addColorStop(0,'#f7e2ae');gr.addColorStop(1,'#f7e2ae00');x.fillStyle=gr;x.beginPath();x.ellipse(p[0],p[1],rx,ry,0,0,7);x.fill();for(let k=0;k<5;k++){x.strokeStyle='#e6c47e';x.lineWidth=2;x.beginPath();x.ellipse(p[0],p[1]+k*5-10,rx*.7,ry*.3,0,Math.PI*1.15,Math.PI*1.85);x.stroke()}}
  x.restore()}
 const lp=iso(ZC[0],ZC[1]);x.save();x.translate(lp[0],lp[1]);x.scale(1.2,.6);x.font='900 64px system-ui';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='#ffffff44';x.strokeText(M.logo,0,0);x.fillStyle='#00000030';x.fillText(M.logo,0,0);x.restore();
 floor.ox=w/2;floor.oy=h/2}
function wallProps(M,sc){const out=[];const rr=t=>t==='barrel'||t==='cactus'?1.3:t==='rock'?2.0:2.1;
 for(const [x0,z0,x1,z1,t] of M.walls||[]){const L=Math.hypot(x1-x0,z1-z0)*sc,n=Math.max(1,Math.round(L/(rr(t)*1.6)));for(let i=0;i<=n;i++){const x=(x0+(x1-x0)*i/n)*sc,z=(z0+(z1-z0)*i/n)*sc;if(out.some(p=>Math.hypot(p.x-x,p.z-z)<1))continue;out.push({type:t,x,z,r:rr(t),solid:true,wall:true,seed:Math.random(),col:['#c0392b','#2e86de','#27ae60','#8e44ad'][Math.random()*4|0]})}}
 for(const [mx,mz,mr] of M.mesas||[]){const R=mr*sc,n=Math.round(R*Math.PI*2/3.2);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;if(Math.abs(Math.cos(a))>.9)continue;out.push({type:'rock',x:mx*sc+Math.cos(a)*R,z:mz*sc+Math.sin(a)*R,r:2,solid:true,wall:true,seed:Math.random()})}}// 东西两侧留坡道口
 return out}
function buildProps0(){const M=MAP;props=wallProps(M,SC);const no=Math.round(3*AR*AR/1444);
 for(let tries=0,k=0;k<no&&tries<400;tries++){const[x,z]=randIn(5);if(props.some(p=>Math.hypot(p.x-x,p.z-z)<8)||Math.hypot(x-ZC[0],z-ZC[1])<6)continue;
  const t=M.obst[k%2];k++;props.push({type:t,x,z,r:t==='barrel'||t==='cactus'?1.3:2.1,solid:true,seed:Math.random(),col:['#c0392b','#2e86de','#27ae60','#8e44ad'][Math.random()*4|0]})}}
function buildProps1(){const M=MAP,R=AR;
 let ri=0;for(let e=0;e<POLY.length;e++){const[a,b]=POLY[e],[c,d]=POLY[(e+1)%POLY.length],L=Math.hypot(c-a,d-b),n=Math.max(1,Math.round(L/4.6));let nx=(d-b)/L,nz=-(c-a)/L;if(inPoly(POLY,(a+c)/2+nx*.5,(b+d)/2+nz*.5)){nx=-nx;nz=-nz}
  for(let i=0;i<n;i++){const x0=a+(c-a)*i/n+nx*2.2,z0=b+(d-b)*i/n+nz*2.2,x1=a+(c-a)*(i+1)/n+nx*2.2,z1=b+(d-b)*(i+1)/n+nz*2.2;props.push({type:'rail',x0,z0,x1,z1,x:(x0+x1)/2,z:(z0+z1)/2,nx,nz,i:ri++})}}
 const decoT={site:['barrel','block','cone'],junk:['tires','scrap','tires'],desert:['rock','cactus','bush']}[M.deco];
 for(let i=0,t=0;i<R*1.4&&t<2000;t++){const x=rnd(-AR_EXT-14,AR_EXT+14),z=rnd(-AR_EXT-14,AR_EXT+14),sd=sdist(POLY,x,z).s;if(sd<5.5||sd>14)continue;i++;props.push({type:decoT[i%3],x,z,r:1.6,solid:false,h:1+(Math.random()*2|0),s:rnd(.8,1.3),seed:Math.random(),col:'#7f8c8d',deco:true})}
 // 场外装饰烘焙进地面
 const old=ctx;ctx=floor.getContext('2d');ctx.setTransform(FSC,0,0,FSC,floor.ox,floor.oy);props.filter(p=>p.deco).sort((a,b)=>a.x+a.z-b.x-b.z).forEach(p=>{drawProp(p);p.baked=true});ctx=old}
function drawTire(x,y,s){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y,22*s,12*s,0,0,7);ctx.fill();ctx.fillStyle='#34303d';ctx.beginPath();ctx.ellipse(x,y-2*s,19*s,10*s,0,0,7);ctx.fill();
 ctx.fillStyle='#4d4858';ctx.beginPath();ctx.ellipse(x,y-4*s,17*s,8.5*s,0,Math.PI,0);ctx.fill();ctx.fillStyle='#1b1420';ctx.beginPath();ctx.ellipse(x,y-4*s,8*s,4*s,0,0,7);ctx.fill();
 ctx.strokeStyle='#ffffff30';ctx.lineWidth=2*s;ctx.beginPath();ctx.ellipse(x,y-4*s,14*s,7*s,0,Math.PI*1.1,Math.PI*1.6);ctx.stroke()}
function isoBox(wx,wz,hw,hd,h,top,left,right){const P=(x,z,y)=>{const p=iso(x,z);return[p[0],p[1]-y*HK]};
 const a=P(wx-hw,wz-hd,h),b=P(wx+hw,wz-hd,h),c=P(wx+hw,wz+hd,h),d=P(wx-hw,wz+hd,h),c0=P(wx+hw,wz+hd,0),b0=P(wx+hw,wz-hd,0),d0=P(wx-hw,wz+hd,0);
 ctx.lineJoin='round';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;
 const poly=(pts,f)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f;ctx.fill();ctx.stroke()};
 poly([b,c,c0,b0],right);poly([d,c,c0,d0],left);poly([a,b,c,d],top)}
function drawProp(p){const [sx,sy]=iso(p.x,p.z),s=p.s||1;
 if(p.type==='tires'){const n=p.h||3,k=p.r/2.1*1.35;shadow(sx,sy,30*k,14*k,.35);const offs=p.solid?[[-12,0],[12,0],[0,-7],[0,7]]:[[0,0]];
  for(let L=0;L<n;L++)for(const o of (L===n-1&&p.solid?[[0,0]]:offs))drawTire(sx+o[0]*k,sy+o[1]*k-L*13*k,k*(p.solid?.75:.8))}
 else if(p.type==='block'){shadow(sx+3,sy+3,40*s,18*s,.35);isoBox(p.x,p.z,1.5*s,1.1*s,1.3*s,'#d9d6cf','#a9a59c','#bfbbb2');const t=iso(p.x,p.z);ctx.fillStyle='#ffc300';ctx.fillRect(t[0]-14,t[1]-1.3*s*HK+6,28,4)}
 else if(p.type==='barrel'){shadow(sx+2,sy+2,18*s,9*s,.4);const h=34*s,r=13*s;ctx.fillStyle='#1b1420';ctx.fillRect(sx-r-2,sy-h,2*r+4,h);ctx.beginPath();ctx.ellipse(sx,sy,r+2,r/2+2,0,0,7);ctx.fill();
  const g=ctx.createLinearGradient(sx-r,0,sx+r,0);g.addColorStop(0,'#c25a00');g.addColorStop(.35,'#ff9a3c');g.addColorStop(1,'#a84a00');ctx.fillStyle=g;ctx.fillRect(sx-r,sy-h,2*r,h);ctx.beginPath();ctx.ellipse(sx,sy,r,r/2,0,0,Math.PI);ctx.fill();
  ctx.fillStyle='#fff';ctx.fillRect(sx-r,sy-h*.62,2*r,5*s);ctx.fillRect(sx-r,sy-h*.32,2*r,5*s);ctx.fillStyle='#ff8a2a';ctx.beginPath();ctx.ellipse(sx,sy-h,r,r/2,0,0,7);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.stroke()}
 else if(p.type==='scrap'){shadow(sx+3,sy+3,40*s,18*s,.4);isoBox(p.x,p.z,1.4*s,1.0*s,.9*s,p.col,'#3b3b44','#55555f');const q=iso(p.x,p.z);ctx.save();ctx.translate(0,-.9*s*HK);isoBox(p.x+.2,p.z-.1,1.0*s,.8*s,.7*s,'#9aa3ad','#5e6670','#77808a');ctx.restore();ctx.fillStyle='#1c2a44';ctx.fillRect(q[0]-6,q[1]-1.9*s*HK,14,5)}
 else if(p.type==='rock'){shadow(sx+3,sy+3,36*s,16*s,.35);ctx.fillStyle='#1b1420';ctx.beginPath();const pts=[[-30,0],[-24,-22],[-6,-34],[16,-28],[30,-8],[24,6],[-10,8]];pts.forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.lineWidth=5;ctx.strokeStyle='#1b1420';ctx.stroke();
  ctx.fillStyle='#a07850';ctx.fill();ctx.fillStyle='#c79a6a';ctx.beginPath();[[-24,-22],[-6,-34],[16,-28],[6,-12],[-14,-10]].forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.fill();ctx.fillStyle='#7a5a3a';ctx.beginPath();[[30,-8],[24,6],[-10,8],[6,-12],[16,-28]].forEach((q,i)=>i?ctx.lineTo(sx+q[0]*s,sy+q[1]*s):ctx.moveTo(sx+q[0]*s,sy+q[1]*s));ctx.closePath();ctx.fill()}
 else if(p.type==='cactus'){shadow(sx+2,sy+2,16*s,7*s,.4);const cap=(x,y,w,h)=>{ctx.fillStyle='#1b1420';ctx.beginPath();ctx.roundRect(x-w/2-2.5,y-h-2.5,w+5,h+5,w/2+2);ctx.fill();const g=ctx.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,'#3f9a45');g.addColorStop(.4,'#7fd36a');g.addColorStop(1,'#2f7a38');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x-w/2,y-h,w,h,w/2);ctx.fill()};
  cap(sx,sy,14*s,52*s);cap(sx-13*s,sy-18*s,9*s,22*s);cap(sx+13*s,sy-24*s,9*s,20*s);ctx.fillStyle='#ff6fa8';ctx.beginPath();ctx.arc(sx,sy-52*s,4,0,7);ctx.fill()}
 else if(p.type==='bush'){shadow(sx+3,sy+3,30*s,14*s,.35);const os=[[-12,-6,14],[10,-8,13],[0,-16,16],[0,-4,12]];for(const o of os){ctx.fillStyle='#1b1420';ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,(o[2]+2.5)*s,0,7);ctx.fill()}for(const o of os){const g=ctx.createRadialGradient(sx+o[0]*s-4*s,sy+o[1]*s-6*s,1,sx+o[0]*s,sy+o[1]*s,o[2]*s);g.addColorStop(0,'#c9c27a');g.addColorStop(1,'#7f8a3a');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+o[0]*s,sy+o[1]*s,o[2]*s,0,7);ctx.fill()}}
 else if(p.type==='cone'){shadow(sx+2,sy+2,12,6,.4);ctx.fillStyle='#1b1420';ctx.beginPath();ctx.moveTo(sx-11,sy+2);ctx.lineTo(sx,sy-28);ctx.lineTo(sx+11,sy+2);ctx.closePath();ctx.fill();ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.moveTo(sx-8,sy);ctx.lineTo(sx,sy-25);ctx.lineTo(sx+8,sy);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(sx-5,sy-14,10,4)}
 else if(p.type==='rail'){const a=iso(p.x0,p.z0),b=iso(p.x1,p.z1),h=22;ctx.fillStyle=MAP.rail[p.i%2];ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(a[0],a[1]-h);ctx.lineTo(b[0],b[1]-h);ctx.lineTo(b[0],b[1]-h+12);ctx.lineTo(a[0],a[1]-h+12);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#ffffff77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]-h+2);ctx.lineTo(b[0],b[1]-h+2);ctx.stroke();
  ctx.fillStyle='#6c7480';ctx.fillRect(a[0]-3,a[1]-h-4,6,h+4);ctx.strokeStyle='#1b1420';ctx.strokeRect(a[0]-3,a[1]-h-4,6,h+4)}}
// 阴影贴图缓存：每种尺寸只建一次渐变，绘制用 globalAlpha（原来每帧每物体 createRadialGradient）
const SHC=new Map();function shadow(x,y,rx,ry,a){const k=rx*1e3+ry;let c=SHC.get(k);if(!c){const w=Math.ceil(rx*2)+2,h=Math.ceil(ry*2)+2;c=mkC(w,h);const q=c.getContext('2d'),g=q.createRadialGradient(w/2,h/2,0,w/2,h/2,rx);g.addColorStop(0,'rgba(20,10,30,1)');g.addColorStop(.6,'rgba(20,10,30,.6)');g.addColorStop(1,'rgba(20,10,30,0)');q.fillStyle=g;q.beginPath();q.ellipse(w/2,h/2,rx,ry,0,0,7);q.fill();if(SHC.size>256)SHC.clear();SHC.set(k,c)}
 const o=ctx.globalAlpha;ctx.globalAlpha=o*a;ctx.drawImage(c,x-c.width/2,y-c.height/2);ctx.globalAlpha=o}
function mapThumb(mk){const c=mkC(200,120),x=c.getContext('2d'),M=MAPS[mk];x.fillStyle=M.out[0];x.fillRect(0,0,200,120);for(let i=0;i<300;i++){x.fillStyle=M.out[1+(i%2)];x.fillRect(Math.random()*200,Math.random()*120,3,2)}
 const P=M.poly.map(([a,b])=>iso(a,b));let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;P.forEach(([a,b])=>{x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b)});const k=Math.min(184/(x1-x0),104/(y1-y0)),ox=100-(x0+x1)/2*k,oy=60-(y0+y1)/2*k,T=(a,b)=>{const p=iso(a,b);return[ox+p[0]*k,oy+p[1]*k]};
 const path=()=>{x.beginPath();M.poly.forEach(([a,b],i)=>{const p=T(a,b);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.closePath()};
 path();x.fillStyle=M.tiles[0];x.fill();x.lineWidth=5;x.strokeStyle=M.rail[0];x.setLineDash([10,8]);x.stroke();x.setLineDash([]);x.lineWidth=2;x.strokeStyle='#1b1420';x.stroke();
 for(const pit of M.pits||[]){x.beginPath();pit.forEach(([a,b],i)=>{const p=T(a,b);i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.closePath();x.fillStyle='#8f887a';x.fill()}
 for(const[mx,mz,mr] of M.mesas||[]){const p=T(mx,mz);x.fillStyle='#b98a4c';x.beginPath();x.ellipse(p[0],p[1]+3,mr*k*K*1.41,mr*k*K*.7,0,0,7);x.fill();x.fillStyle='#f3d79a';x.beginPath();x.ellipse(p[0],p[1],mr*k*K*1.41,mr*k*K*.7,0,0,7);x.fill()}
 const ic={block:'#d9d6cf',barrel:'#ff8a2a',scrap:'#2e86de',tires:'#34303d',rock:'#a07850',cactus:'#5fb85a'};
 for(const p of wallProps(M,1)){const q=T(p.x,p.z);x.fillStyle='#1b1420';x.fillRect(q[0]-3.5,q[1]-3.5,7,7);x.fillStyle=ic[p.type];x.fillRect(q[0]-2.5,q[1]-2.5,5,5)}
 return c}
// ================= 寻路网格（A*，绕障碍）=================
const GC=2.5;
function buildGrid(){const ext=AR_EXT+2,n=Math.ceil(ext*2/GC),ok=new Uint8Array(n*n),sol=props.filter(p=>p.solid);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=-ext+(i+.5)*GC,z=-ext+(j+.5)*GC;ok[j*n+i]=sdist(POLY,x,z).s<-1.6&&sol.every(p=>Math.hypot(p.x-x,p.z-z)>p.r+1.7)?1:0}
 // 自由格（车中心可在的位置）→ 连通分量；只保留主战场（最大分量）
 const fr=new Uint8Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const x=-ext+(i+.5)*GC,z=-ext+(j+.5)*GC;fr[j*n+i]=sdist(POLY,x,z).s<0&&sol.every(p=>Math.hypot(p.x-x,p.z-z)>p.r+.4)&&!(MAP.pits||[]).some(pt=>inPoly(pt.map(([a,b])=>[a*SC,b*SC]),x,z))?1:0}
 const comp=new Int32Array(n*n).fill(-1),sizes=[];for(let k=0;k<n*n;k++){if(!fr[k]||comp[k]>=0)continue;const id=sizes.length;let sz=0;const st=[k];comp[k]=id;while(st.length){const q=st.pop();sz++;const qi=q%n,qj=q/n|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=qi+di,b=qj+dj;if(a<0||b<0||a>=n||b>=n)continue;const k2=b*n+a;if(fr[k2]&&comp[k2]<0){comp[k2]=id;st.push(k2)}}}sizes.push(sz)}
 const main=sizes.indexOf(Math.max(...sizes)),reach=new Uint8Array(n*n);for(let k=0;k<n*n;k++)reach[k]=comp[k]===main?1:0;
 for(let k=0;k<n*n;k++)if(!reach[k])ok[k]=0;// 寻路/出生只用主战场
 GRID={n,ext,ok,reach,dead:sizes.length-1}}
const cellOf=(x,z)=>{const g=GRID;return[Math.max(0,Math.min(g.n-1,Math.floor((x+g.ext)/GC))),Math.max(0,Math.min(g.n-1,Math.floor((z+g.ext)/GC)))]};
const cellPos=(i,j)=>[-GRID.ext+(i+.5)*GC,-GRID.ext+(j+.5)*GC];
function los(x0,z0,x1,z1){const L=Math.hypot(x1-x0,z1-z0),n=Math.ceil(L/1.2);for(let k=1;k<n;k++){const[i,j]=cellOf(x0+(x1-x0)*k/n,z0+(z1-z0)*k/n);if(!GRID.ok[j*GRID.n+i])return false}return true}
function nearOk(i,j){const g=GRID;if(g.ok[j*g.n+i])return[i,j];for(let r=1;r<40;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<g.n&&b<g.n&&g.ok[b*g.n+a])return[a,b]}return[i,j]}
function findPath(x0,z0,x1,z1){const g=GRID,N=g.n,[si,sj]=nearOk(...cellOf(x0,z0)),[ti,tj]=nearOk(...cellOf(x1,z1)),S=sj*N+si,Tg=tj*N+ti;
 const gs=new Float32Array(N*N).fill(1e9),from=new Int32Array(N*N).fill(-1),open=[S];gs[S]=0;const h=k=>Math.hypot(k%N-ti,(k/N|0)-tj);let it=0;
 while(open.length&&it++<3000){let bi=0;for(let k=1;k<open.length;k++)if(gs[open[k]]+h(open[k])<gs[open[bi]]+h(open[bi]))bi=k;const cur=open[bi];open[bi]=open[open.length-1];open.pop();if(cur===Tg)break;
  const ci=cur%N,cj=cur/N|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const a=ci+di,b=cj+dj;if(a<0||b<0||a>=N||b>=N)continue;const k=b*N+a;if(!g.ok[k]||di&&dj&&(!g.ok[cj*N+a]||!g.ok[b*N+ci]))continue;const ng=gs[cur]+(di&&dj?1.414:1);if(ng<gs[k]){if(gs[k]>=1e9)open.push(k);gs[k]=ng;from[k]=cur}}}
 if(from[Tg]<0&&Tg!==S)return null;const path=[];for(let k=Tg;k!==S&&k>=0;k=from[k])path.push(cellPos(k%N,k/N|0));return path.reverse()}
function openCell(x,z,cl){const sol=props.filter(p=>p.solid);return sol.every(p=>Math.hypot(p.x-x,p.z-z)>p.r+cl)&&sdist(POLY,x,z).s<-cl}
function spawnPts(n){let cl=4.5,c=[];for(;cl>=2;cl-=.5){c=[];for(let j=0;j<GRID.n;j++)for(let i=0;i<GRID.n;i++)if(GRID.ok[j*GRID.n+i]){const[x,z]=cellPos(i,j);if(openCell(x,z,cl)&&Math.hypot(x-ZC[0],z-ZC[1])>6)c.push([x,z])}if(c.length>=n*3)break}
 const out=[c[Math.random()*c.length|0]];while(out.length<n){let best=null,bd=-1;for(let k=0;k<c.length;k++){const d=Math.min(...out.map(o=>Math.hypot(o[0]-c[k][0],o[1]-c[k][1])))+Math.random()*2;if(d>bd){bd=d;best=c[k]}}out.push(best)}return out}
// ================= 撞击规则（concept.md：角度伤害）=================
function zoneOf(c,ox,oz){let a=Math.atan2(ox-c.x,oz-c.z)-c.h;a=Math.atan2(Math.sin(a),Math.cos(a));const d=Math.abs(a);return d<Math.PI/4?'front':d>Math.PI*3/4?'rear':'side'}
function nearP(x,z){return player?Math.max(0,1-Math.hypot(x-player.x,z-player.z)/34):0}
function hurt(c,d,by){if(!c.alive)return;if(by&&by!==c&&!c.isP&&c.ai&&d>4){if(Math.random()<.6+c.sk*.3){c.ai.t=by;c.ai.re=.8+Math.random();c.ai.grudge=4}bubble(c,'hurt')}if(by&&by!==c&&!by.isP&&d>12)bubble(by,'hitGood');if(c.dummy){c.flash=.12;return}c.hp-=d;c.flash=.12;if(c.hp<=0){c.hp=0;c.alive=false;c.deadT=0;boom(c.x,c.z,c.s.col);ft(c.x,c.z,3,'撞毁！','#ff4d4d',34,true);hitstop=Math.max(hitstop,.12);
 if(nearP(c.x,c.z)>0)sfx('boom');if(c.isP||by===player){shake=Math.max(shake,14);vib('boom')}if(by&&by!==c){by.kc=(by.kc||0)+1;bubble(by,'kill',true)}c.place=cars.filter(q=>q.alive&&!q.dummy).length+1;bubble(c,'die');if(by===player&&c!==player)kills++;if(c===player){aliveAtDeath=cars.filter(q=>q.alive).length+1;deadTime=time}}}
function bounce(a,b,nx,nz,rv,push){const tm=a.mass+b.mass,j=rv*1.25;a.vx-=nx*j*b.mass/tm;a.vz-=nz*j*b.mass/tm;b.vx+=nx*j*a.mass/tm*push;b.vz+=nz*j*a.mass/tm*push}
function collide(a,b){const dx=b.x-a.x,dz=b.z-a.z,dist=Math.hypot(dx,dz),min=a.r+b.r;if(dist>=min||dist===0)return;
 const nx=dx/dist,nz=dz/dist,ov=min-dist,tm=a.mass+b.mass;a.x-=nx*ov*b.mass/tm;a.z-=nz*ov*b.mass/tm;b.x+=nx*ov*a.mass/tm;b.z+=nz*ov*a.mass/tm;
 const rv=(a.vx-b.vx)*nx+(a.vz-b.vz)*nz;if(rv<=0)return;const mine=a.isP||b.isP;
 const key=a.id<b.id?a.id+'_'+b.id:b.id+'_'+a.id;if(pairCD.has(key)&&time-pairCD.get(key)<.45||rv<3){bounce(a,b,nx,nz,rv,1);if(mine&&rv>1.5&&(!pairCD.has(key)||time-pairCD.get(key)>.3))vib('light');return}pairCD.set(key,time);
 const za=zoneOf(a,b.x,b.z),zb=zoneOf(b,a.x,a.z),pa=a.vx*nx+a.vz*nz,pb=-(b.vx*nx+b.vz*nz);
 const atk=pa>=pb?a:b,vic=atk===a?b:a,zAtk=atk===a?za:zb,zVic=atk===a?zb:za;
 const dHit=atk.dash>0&&zAtk==='front',base=(dHit?Math.min(rv,atk.spd*1.3)*FEEL.dashDmg:rv)*1.6,mx=(a.x+b.x)/2,mz=(a.z+b.z)/2,np=nearP(mx,mz);let push=(atk.push||1)*(dHit?FEEL.dashPush:1);
 if(dHit){ft(mx,mz,4.4,'冲撞！','#7df9ff',30,true);spark(mx,mz,14,'#7df9ff');if(mine){shake=Math.max(shake,12);hitstop=Math.max(hitstop,.09);vib('heavy')}}
 spark(mx,mz,8+rv|0);
 if(zAtk==='front'&&zVic==='front'){hurt(a,base*b.dmg*Math.sqrt(b.mass/a.mass)*.6,b);hurt(b,base*a.dmg*Math.sqrt(a.mass/b.mass)*.6,a);
  ft(mx,mz,3.2,'对撞！','#ffffff',26,true);if(np)sfx('hit',np);if(mine){shake=Math.max(shake,7);hitstop=Math.max(hitstop,.06);vib('mid')}debris(mx,mz,4,'#b8c2cc')}
 else{const atkMul=zAtk==='front'?1:.5,selfMul=zAtk==='front'?.2:.5,dv=base*atk.dmg*Math.sqrt(atk.mass/vic.mass)*atkMul*ZMUL[zVic]*(zVic==='side'?atk.sideBonus*vic.critRes:zVic==='rear'?vic.rearRes:1);hurt(vic,dv,atk);if(vic.thorns>0&&atk.alive){hurt(atk,dv*vic.thorns,vic);if(nearP(mx,mz))ft(atk.x,atk.z,2.6,'反伤 -'+Math.round(dv*vic.thorns),'#c9c3ff',16)}hurt(atk,base*selfMul*.5,vic);const n=Math.round(dv);
  if(zVic==='side'){ft(vic.x,vic.z,3.6,'暴击！ -'+n,'#ffd23f',34,true);spark(mx,mz,18,'#ffffff');debris(vic.x,vic.z,6,vic.s.col);if(np)sfx('crit');if(mine){shake=Math.max(shake,11);hitstop=Math.max(hitstop,.09);vib('heavy')}
   if(tut&&tut.step===3&&atk.isP){tut.step=4;tut.t=0;sfx('good');updTut()}}
  else if(zVic==='rear'){push*=1.5;ft(vic.x,vic.z,3.3,'追尾 -'+n,'#ff9a3c',26);smoke(vic.x,vic.z,3);if(np)sfx('hit',np*.8);if(mine){shake=Math.max(shake,6);vib('mid')}}
  else{ft(vic.x,vic.z,3.1,'格挡 -'+n,'#e0e4f5',19);if(np)sfx('block');if(mine){shake=Math.max(shake,3);vib('light')}}
  if(vic.isP)ft(vic.x,vic.z,1.4,{front:'车头受击',side:'⚠ 侧面受击',rear:'车尾受击'}[zVic],'#ff7b7b',15);
  if(atk.isP&&zAtk!=='front')ft(atk.x,atk.z,1.4,'非车头撞击·自伤','#c9c3ff',13);
  if(tut&&tut.step===3&&atk.isP&&zVic!=='side')ft(vic.x,vic.z,4.4,'要撞它的侧面哦！','#7df9ff',18,true)}
 bounce(a,b,nx,nz,rv,push)}
// ================= AI（难度 = 设置档位 + 等级）=================
function aiThink(c,dt){const ai=c.ai,sk=c.sk;ai.re-=dt;
 // 人性化：犹豫 / 转向失误 / 反应延迟
 ai.hz=(ai.hz||0)-dt;if(ai.hz>0)return[0,0,false];if(Math.random()<dt*(.08+.12*(1-sk))){ai.hz=.25+Math.random()*.6;return[0,0,false]}
 ai.mis=(ai.mis||0)-dt;if(ai.mis<=0&&Math.random()<dt*(.05+.2*(1-sk))){ai.mis=.4+Math.random()*.5;ai.misA=(Math.random()<.5?-1:1)*(.5+Math.random()*.7)}
 if(Math.random()<dt*.03)bubble(c,'idle');
 if(ai.re<=0||!ai.t||!ai.t.alive){ai.re=1.9-sk*1.4+Math.random()*.6;const o=cars.filter(q=>q!==c&&q.alive);if(!o.length)return[0,0,false];
  o.sort((p,q)=>ai.pers==='刺客'?p.hp-q.hp:Math.hypot(p.x-c.x,p.z-c.z)-Math.hypot(q.x-c.x,q.z-c.z));ai.t=o[Math.random()<.7?0:Math.min(o.length-1,1+(Math.random()*2|0))];ai.err=rnd(-1,1)*(1-sk)*.7}
 const t=ai.t;let tx=t.x,tz=t.z;const sx=Math.cos(t.h),sz=-Math.sin(t.h),side=((c.x-t.x)*sx+(c.z-t.z)*sz)>0?1:-1,D=Math.hypot(t.x-c.x,t.z-c.z);
 if(D>6&&sk>.3){tx+=sx*side*4;tz+=sz*side*4}
 if(sk>.6&&D<14){tx+=t.vx*.35;tz+=t.vz*.35}// 困难：预判
 if(ai.pers==='苟王'&&time<40&&D>10){tx=c.x*.9-t.x*.1;tz=c.z*.9-t.z*.1}
 if(zoneR<AR-.3&&sdist(ZPOLY,c.x,c.z).s>-4){tx=ZC[0];tz=ZC[1]}
 if(!los(c.x,c.z,tx,tz)){ai.pt=(ai.pt||0)-dt;if(ai.pt<=0||!ai.path){ai.pt=.5;ai.path=findPath(c.x,c.z,tx,tz)}
  if(ai.path&&ai.path.length){while(ai.path.length>1&&Math.hypot(ai.path[0][0]-c.x,ai.path[0][1]-c.z)<2.5)ai.path.shift();let w=0;for(let k=Math.min(ai.path.length-1,6);k>0;k--)if(los(c.x,c.z,ai.path[k][0],ai.path[k][1])){w=k;break}tx=ai.path[w][0];tz=ai.path[w][1]}}else ai.path=null
 for(const p of props)if(p.solid){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<p.r+2.6){tx+=(c.x-p.x)*.8;tz+=(c.z-p.z)*.8}}
 let a=Math.atan2(tx-c.x,tz-c.z)+ai.err+(ai.mis>0?ai.misA:0);const fa=a-c.h,ok=Math.abs(Math.atan2(Math.sin(fa),Math.cos(fa)))<.3;
 return[Math.sin(a),Math.cos(a),ok&&D<9&&Math.random()<.015+sk*.07]}
// ================= 车辆物理（惯性 / 抓地 / 侧滑 / 悬挂）=================
function terrainAt(x,z){for(const g of gzones)if(Math.hypot(g.x-x,g.z-z)<g.r)return MAP.zone.k;return null}
const sgn=v=>v<0?-1:1;
// ================= 手感参数（预设 B · 街机）集中于此 =================
const FEEL=TUNE.feel;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const DBG=/[?&]dbg=1/.test(location.search);let camZ=1,dashFxT=-9,leadX=0,leadZ=0,camSnap=true;
// 开局统一重置镜头/缩放/画布状态（防止上一局的冲刺镜头时间戳等残留）
function resetView(){camZ=1;dashFxT=-9;leadX=leadZ=0;shake=0;hitstop=0;camSnap=true;resize()}
function speedLines(){const k=Math.min(1,player.dash/.15),n=QL==='low'?10:18,cx=W/2,cy=H/2,R0=Math.min(W,H)*.32,R1=Math.hypot(W,H)*.6;ctx.save();ctx.lineCap='round';
 for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.sin(time*37+i*7.1)*.18,r0=R0+((time*900+i*131)%220),l=40+((i*53)%60);ctx.globalAlpha=.4*k;ctx.strokeStyle=i%3?'#ffffff':'#bdf3ff';ctx.lineWidth=1.5+(i%3);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*Math.min(R1,r0+l),cy+Math.sin(a)*Math.min(R1,r0+l));ctx.stroke()}
 const g=ctx.createRadialGradient(cx,cy,Math.min(W,H)*.35,cx,cy,Math.hypot(W,H)*.6);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(20,10,40,${.35*k})`);ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
function drive(c,ix,iz,dsh,dt,revBtn){const F=FEEL,mag=Math.min(1,Math.hypot(ix,iz));let d=0;
 if(mag>F.dead){d=Math.atan2(ix,iz)-c.h;d=Math.atan2(Math.sin(d),Math.cos(d))}
 // 倒车只由倒车键（AI 脱困同样走这里）触发；摇杆往后推 = 小半径掉头
 const kb=c.isP&&c.kb;const back=!!revBtn;let st;const yr=c.yr||0,pf0=c.fwd||0,fs=pf0<-.2?-1:1;
 if(kb)st=kb.s;
 else if(back&&mag>F.dead){let dr=d-Math.PI*sgn(d);dr=Math.atan2(Math.sin(dr),Math.cos(dr));st=clamp(-dr*F.steerGain,-1,1)}// 倒车：车尾对准摇杆方向
 else st=mag>F.dead?clamp(d*F.steerGain-yr*fs*F.steerDamp,-1,1):0;// PD 转向，消除蛇行
 const sr=kb?F.kbRateLo+(F.kbRateHi-F.kbRateLo)*clamp(Math.abs(pf0)/c.spd,0,1):F.steerRate;c.steer+=clamp(st-c.steer,-sr*dt,sr*dt);
 const ter=terrainAt(c.x,c.z),fx=Math.sin(c.h),fz=Math.cos(c.h);let fwd=c.vx*fx+c.vz*fz,lx=c.vx-fx*fwd,lz=c.vz-fz*fwd;const lat=Math.hypot(lx,lz),pf=fwd;
 const tmul=ter==='mud'?1-.4*c.terr:ter==='sand'?1-.18*c.terr:1;
 c.dcd-=dt;if(dsh&&c.dcd<=0){c.dash=F.dashT;c.dcd=F.dashCd*c.dashCd;c.dcdMax=c.dcd;fwd=Math.min(c.spd*F.dashTop*c.dashPow*tmul,Math.max(fwd,c.spd*.6)+c.spd*F.dashKick*c.dashPow);
  smoke(c.x-fx*1.8,c.z-fz*1.8,6);if(c.isP){sfx('dash');vib('mid');shake=Math.max(shake,5);hitstop=Math.max(hitstop,.03);dashFxT=time}}c.dash-=dt;
 const thr=kb?(kb.t&&!back?1:0):mag>F.dead&&!back?(Math.abs(d)>F.backAng?mag*F.backThr:mag*(1-F.turnLift*sstep(.6,1.6,Math.abs(d)))):0,top=c.spd*(c.dash>0?F.dashTop*c.dashPow:1)*tmul;
 c.brake=false;const rm=revBtn||kb?1:Math.max(.5,mag);
 if(c.dash>0)fwd+=c.acc*3*dt;
 else if(back){if(fwd>.8){fwd=Math.max(0,fwd-(c.acc*2.6+fwd*2)*dt);c.brake=true}else if(fwd>-top*.4*rm)fwd-=c.acc*.9*dt;else fwd+=(-top*.4*rm-fwd)*3*dt}
 else if(thr>0&&fwd<top*thr)fwd+=c.acc*F.accK*thr*Math.max(F.accMin,1-Math.pow(Math.max(0,fwd)/top,F.accPow))*dt*(fwd<0?2.5:1);// 快起慢收
 else fwd*=Math.exp(-(thr>0?.4:F.coast)*dt);// 松油门滑行更久
 if(!back&&thr<=0&&Math.abs(fwd)<.6)fwd*=Math.exp(-6*dt);
 c.rev=fwd<-.3&&back;c.inp=back||thr>.05;
 if(fwd>top)fwd-=(fwd-top)*(c.dash>0?2.5:F.dashOut)*dt;if(ter==='mud')fwd*=Math.exp(-1.2*c.terr*dt);
 const sp=Math.abs(fwd),lowF=F.lowTurn+(1-F.lowTurn)*Math.min(1,sp/F.lowTurnV),hiF=1-F.hiTurnCut*clamp((sp-.6*c.spd)/(.4*c.spd),0,1);
 const yaw=c.steer*c.turn*lowF*hiF*(fwd<-.2?-1:1)*(c.dash>0?F.dashYaw:1);c.h+=yaw*dt;c.yr=yaw;
 let G=F.gripG*c.turn/3;if(ter==='oil')G*=Math.min(1,.18*c.iceGrip);else if(ter==='sand')G*=1-.4*c.terr;if(c.dash>0)G*=F.dashGrip;const drift=lat>5.5||ter==='oil'&&lat>2.5;G*=1-F.slideCut*sstep(F.slideLo,F.slideHi,lat);// 抓地连续变化
 const gk=Math.exp(-G*dt);lx*=gk;lz*=gk;const nfx=Math.sin(c.h),nfz=Math.cos(c.h);
 // 侧滑速度部分转回前进方向（转向时车速保留，形成甩尾）
 c.vx=nfx*fwd+lx;c.vz=nfz*fwd+lz;c.fwd=fwd;
 // 悬挂：加速抬头/刹车点头/转弯侧倾/颠簸
 const aL=(fwd-pf)/Math.max(dt,1e-3),aT=yaw*fwd;c.lastA+=(aL-c.lastA)*Math.min(1,dt*10);c.lastL+=(aT-c.lastL)*Math.min(1,dt*10);
 const dsx=(nfx-nfz),dsy=(nfx+nfz)/2,dl=Math.hypot(dsx,dsy)||1,rsx=(nfz+nfx),rsy=(nfz-nfx)/2,rl=Math.hypot(rsx,rsy)||1;
 const kA=-Math.max(-4,Math.min(4,c.lastA*.12)),kT=Math.max(-4,Math.min(4,c.lastL*.06));
 const tx=dsx/dl*kA+rsx/rl*kT,ty=dsy/dl*kA+rsy/rl*kT-Math.max(0,c.lastA)*.05;
 c.sus.vx+=((tx-c.sus.px)*140-c.sus.vx*13)*dt;c.sus.vy+=((ty-c.sus.py)*140-c.sus.vy*13)*dt;c.sus.px+=c.sus.vx*dt;c.sus.py+=c.sus.vy*dt;
 const spd=Math.hypot(c.vx,c.vz);c.bump=spd>1.5?Math.sin(time*(18+spd)+c.id)*(.35+spd*.03)*(ter==='sand'||ter==='mud'?2.2:1):0;
 c.roll+=fwd*dt/(2*Math.PI*.55/14)*3;
 // 尘土 / 泥点 / 胎烟 / 胎痕
 c.dustT-=dt;const rx=c.x-nfx*1.3,rz=c.z-nfz*1.3,cx=Math.cos(c.h),cz=-Math.sin(c.h);
 if(spd>4&&c.dustT<=0){c.dustT=(ter?.03:.07)/(PM||1);for(const s of[-1,1]){const wx=rx+cx*s*1.0,wz=rz+cz*s*1.0;
  if(ter==='mud'){parts.push({k:'mud',x:wx,z:wz,y:.3,vx:-nfx*rnd(2,6)+rnd(-2,2),vz:-nfz*rnd(2,6)+rnd(-2,2),vy:rnd(3,7),t:0,life:.7,s:rnd(2,4)})}
  else parts.push({k:'dust',x:wx,z:wz,y:.2,vx:-nfx*2+rnd(-1,1),vz:-nfz*2+rnd(-1,1),vy:rnd(.3,1),t:0,life:ter==='sand'?1.2:.7,s:ter==='sand'?rnd(9,14):rnd(5,8),col:MAP.dust})}}
 if(drift||c.dash>0||(ter==='oil'&&spd>4)){skx.globalAlpha=Math.min(.38,.08+lat*.03);skx.fillStyle=ter==='mud'?'#4a3420':'#2b2230';for(const s of[-1,1]){const p=iso(rx+cx*s*1.0,rz+cz*s*1.0);skx.beginPath();skx.ellipse((p[0])*FSC+floor.ox,(p[1])*FSC+floor.oy,4*FSC,2*FSC,0,0,7);skx.fill()}skx.globalAlpha=1;
  if(drift&&Math.random()<.5*PM)parts.push({k:'smoke',x:rx+rnd(-.5,.5),z:rz+rnd(-.5,.5),y:.3,vx:rnd(-1,1),vz:rnd(-1,1),vy:rnd(.8,1.6),t:0,life:.9,s:rnd(7,11),dark:false});if(c.isP&&drift&&Math.random()<dt*8)sfx('skid')}}
// ================= 脱困 =================
let rescueT=0,rescueLog=0,stuckLog={p:0,ai:0},testInp=null,noEnd=false;
function unstick(c){let nx=0,nz=0;for(const o of props){if(!o.solid)continue;const dx=c.x-o.x,dz=c.z-o.z,L=Math.hypot(dx,dz);if(L<c.r+o.r+2.5&&L>0){nx+=dx/L/L;nz+=dz/L/L}}
 const sd=sdist(POLY,c.x,c.z);if(sd.s>-3){nx-=sd.nx*.6;nz-=sd.nz*.6}let L=Math.hypot(nx,nz);if(L<1e-3){nx=-Math.sin(c.h);nz=-Math.cos(c.h);L=1}nx/=L;nz/=L;
 c.vx=nx*7;c.vz=nz*7;c.x+=nx*.6;c.z+=nz*.6;smoke(c.x,c.z,3)}
// ================= 模拟 =================
function step(dt){time+=dt;zoneR=tut?AR:MODE==='ring'?ringZone():Math.max(10,zone0-Math.max(0,time-25)*(zone0-10)/100);updZone();if(introT>0)introT-=dt;
 for(const c of cars){if(!c.alive){c.deadT+=dt;c.vx*=.96;c.vz*=.96;if(Math.random()<dt*6)smoke(c.x,c.z,1,true);continue}
  let ix=0,iz=0,dsh=false;
  if(c.isP){const kW=keys.KeyW||keys.ArrowUp?1:0,kS=keys.KeyS||keys.ArrowDown?1:0,kT=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);let sx=jx,sy=jy;
   const jm=Math.hypot(jx,jy);c.kb=jm<=FEEL.dead&&(kW||kS||kT)&&!testInp?{t:kW&&!kS?1:0,s:kT,b:kS}:null;
   const m=c.kb?(kW||kS?1:0):Math.min(1,jm),rb=revHold||(c.kb?kS:0);if(jm>FEEL.dead){const w=screenToWorld(sx,sy);ix=w[0]*m;iz=w[1]*m}if(testInp){ix=testInp[0];iz=testInp[1]}dsh=dashReq&&(!tut||tut.step>=1);dashReq=false;if(m>.2||dsh)activeT+=dt;c._rb=rb&&(!tut||tut.step>=2);if(introT>0){ix=iz=0;dsh=false;c._rb=false}}
  else if(c.dummy){c.vx*=Math.exp(-3*dt);c.vz*=Math.exp(-3*dt);c.x+=(3-c.x)*dt*.5;c.z+=(3-c.z)*dt*.5}
  else if(introT<=0){const o=aiThink(c,dt);ix=o[0];iz=o[1];dsh=o[2];c._rb=false;
   if(c.ai.back>0){c.ai.back-=dt;c._rb=true;ix=Math.sin(c.h+c.ai.bs*1.2);iz=Math.cos(c.h+c.ai.bs*1.2);ix=-ix;iz=-iz;dsh=false;if(c.ai.back<=0)c.ai.path=null}}
  if(!c.dummy)drive(c,ix,iz,dsh,dt,c._rb);
  // 卡住检测：有油门但几乎不动
  if(!c.dummy&&introT<=0){const sp=Math.hypot(c.vx,c.vz);if(c.inp&&sp<1.2)c.stuckT=(c.stuckT||0)+dt;else c.stuckT=Math.max(0,(c.stuckT||0)-dt*2);
   if(c.isP&&c.stuckT>1.5){unstick(c);c.stuckT=0;ft(c.x,c.z,2.6,'脱困','#7df9ff',16);stuckLog.p++}
   else if(!c.isP&&c.stuckT>1&&!(c.ai.back>0)){c.ai.back=.9;c.ai.bs=Math.random()<.5?-1:1;c.stuckT=0;stuckLog.ai++}}
  if(c.hp/c.maxhp<.35){c.smokeT-=dt;if(c.smokeT<0){c.smokeT=.12;smoke(c.x,c.z,1,true)}}
  if(c.dash>0&&(c.isP||Math.random()<.5))parts.push({k:'fire',x:c.x-Math.sin(c.h)*2.2,z:c.z-Math.cos(c.h)*2.2,y:.8,vx:-Math.sin(c.h)*4,vz:-Math.cos(c.h)*4,vy:1,t:0,life:.25,s:8});
  if(MODE==='ring'){ringFall(c,dt)}else if(zoneR<AR-.3&&sdist(ZPOLY,c.x,c.z).s>.3){c.hp-=8*dt;c.flash=Math.max(c.flash,.05);if(Math.random()<dt*10)spark(c.x,c.z,2,'#7df9ff');if(c.isP&&Math.random()<dt*6)sfx('zap');if(c.hp<=0)hurt(c,1,null)}}
 for(const c of cars){c.x+=c.vx*dt;c.z+=c.vz*dt;for(let it=0;it<3;it++){const sd=MODE==='ring'?{s:-1}:sdist(POLY,c.x,c.z);if(sd.s>.4){const nx=sd.nx,nz=sd.nz;c.x-=nx*(sd.s-.4);c.z-=nz*(sd.s-.4);const vn=c.vx*nx+c.vz*nz;if(vn>0){c.vx-=(vn>6?1.4:1.05)*vn*nx;c.vz-=(vn>6?1.4:1.05)*vn*nz;if(vn>6){spark(c.x,c.z,5);if(c.isP){vib('light');sfx('block')}}}}
  for(const o of props){if(!o.solid)continue;const dx=c.x-o.x,dz=c.z-o.z,L=Math.hypot(dx,dz),m=c.r+o.r;if(L<m&&L>0){c.x+=dx/L*(m-L+.02);c.z+=dz/L*(m-L+.02);const vn=(c.vx*dx+c.vz*dz)/L;if(vn<0){const k=vn<-6?1.4:1.05;c.vx-=k*vn*dx/L;c.vz-=k*vn*dz/L;if(vn<-6&&it===0){spark(c.x-dx/L*c.r,c.z-dz/L*c.r,4);if(c.isP){vib('light');sfx('block')}}}}}}}
 rescueT-=dt;if(rescueT<=0){rescueT=.25;for(const c of cars){if(!c.alive||c.dummy)continue;const[i,j]=cellOf(c.x,c.z);if(GRID.reach[j*GRID.n+i]){c.offT=0;continue}
  // 不在主战场：检查邻格（贴墙时中心可能落在障碍格）
  let near=false;for(let dj=-1;dj<=1&&!near;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<GRID.n&&b<GRID.n&&GRID.reach[b*GRID.n+a]){near=true;break}}
  c.offT=(c.offT||0)+(near?.1:.25);if(c.offT>.5){const[a,b]=nearOk(i,j),[x,z]=cellPos(a,b);c.x=x;c.z=z;c.vx=c.vz=0;c.offT=0;smoke(x,z,4);rescueLog++;if(c.isP)ft(x,z,2.6,'已传送回场地','#7df9ff',16)}}}
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++)if(cars[i].alive&&cars[j].alive)collide(cars[i],cars[j]);
 if(tut)tutStep(dt);
 else if(running&&!noEnd&&((!player.alive&&time-deadTime>1.6&&!reviveHold())||cars.filter(c=>c.alive).length<=1))finish()}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue}
 if(p.vx!==undefined){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;if(p.k==='spark'||p.k==='deb'||p.k==='mud'){p.vy-=25*dt;if(p.y<0){p.y=0;p.vy*=-.3;p.vx*=.5;p.vz*=.5}}if(p.k==='deb')p.rot+=p.vr*dt}}
 for(let i=fts.length-1;i>=0;i--){fts[i].t+=dt;if(fts[i].t>1.1)fts.splice(i,1)}
 if(parts.length>500*PM+100)parts.splice(0,parts.length-(500*PM+100))}
// ================= 结算（经验 / 碎片）=================
function finish(){running=false;const win=player.alive,rank=win?1:aliveAtDeath,surv=win?time:deadTime,afk=activeT<surv*.3;
 let xp=Math.min(100,(afk?0:20)+kills*15+Math.floor(surv/30)*5+(win?30:0));
 const sc=save.cars[playerKey],lv0=sc.lv;sc.xp+=xp;while(sc.lv<MAXLV&&sc.xp>=need(sc.lv)){sc.xp-=need(sc.lv);sc.lv++}if(sc.lv>=MAXLV)sc.xp=0;
 const coins=(afk?0:15)+kills*12+(win?40:rank<=Math.ceil(nCars/2)?15:0)+Math.floor(surv/20)*3;save.coins+=coins;
 const n=1+(rank<=Math.ceil(nCars/2)?1:0)+Math.min(kills,3)+(win?1:0),got={},POOL=r=>Object.keys(PARTS).filter(id=>PARTS[id].r===r);
 for(let i=0;i<n;i++){const q=Math.random(),pl=POOL(q<.6?'w':q<.88?'b':q<.97?'p':'g'),id=pl[Math.random()*pl.length|0],p=PARTS[id];
  if(save.owned[id]){save.uni+=UNI[p.r];got.uni=(got.uni||0)+UNI[p.r]}else{save.shards[id]=(save.shards[id]||0)+1;got[id]=(got[id]||0)+1}}persist();
 setTimeout(()=>{show('hud',0);
  $('rRank').textContent=win?'👑':'#'+rank;$('rRank').className=win?'':'lose';$('rTitle').textContent=win?'最后的幸存者！':'被撞毁 · 第 '+rank+' / '+nCars+' 名';
  $('rStats').innerHTML=`<div><b>${kills}</b>撞毁</div><div><b>${surv.toFixed(0)}s</b>存活</div><div><b>+${xp}</b>经验${afk?'<br><small>挂机判定</small>':''}</div><div><b>+${coins}</b>金币</div>`;
  $('rLv').textContent=CARS[playerKey].name+' Lv.'+sc.lv+(sc.lv>lv0?' ⬆':'');$('rXpTxt').textContent=sc.lv>=MAXLV?'MAX':sc.xp+'/'+need(sc.lv);$('rXp').style.width='0';
  lastGot=got;$('rDouble').disabled=false;$('rDouble').innerHTML='📺 看视频 碎片翻倍';const dshow=AB.double&&Object.keys(got).length>0;show('rDouble',dshow);if(dshow)track('ad_entry_show',{placement:'result_double'});
  $('rShards').innerHTML=`<span class="drop" style="animation-delay:.2s">${icCoin('+'+coins)}<small>金币</small></span>`+Object.entries(got).map(([k,v],i)=>k==='uni'?`<span class="drop" style="animation-delay:${.3+i*.12}s">${icUni('+'+v)}<small>通用碎片</small></span>`:`<span class="drop" style="animation-delay:${.3+i*.12}s">${icPart(k,'+'+v,true)}<small>${save.shards[k]}/${PARTS[k].need}</small></span>`).join('');
  const fp=ptsFree(sc),can=Object.keys(PARTS).some(id=>!save.owned[id]&&canCraft(id));
  $('rHint').innerHTML=(sc.lv>lv0?`<b>升级！</b>`:'')+(fp>0?` 有 <b>${fp}</b> 点属性可分配`:'')+(can?' · 有部件可<b>合成</b>':'');$('rHint').classList.toggle('hide',!(fp>0||can));
  const alv=cars.filter(c=>!c.dummy&&c.alive).sort((a,b)=>b.hp/b.maxhp-a.hp/a.maxhp),board=cars.filter(c=>!c.dummy).map(c=>({c,p:c.alive?alv.indexOf(c)+1:c.place||nCars})).sort((a,b)=>a.p-b.p);$('rBoard').innerHTML=board.map(({c,p})=>`<div class="brow ${c.isP?'me':''}"><span class="bp">${p===1?'👑':'#'+p}</span><span class="bf" style="--f:${c.frame||'#fff'}"></span><b>${esc(c.nick||'')}</b><small>${c.cname?esc(c.cname)+' · ':''}${c.s.name} Lv.${c.lv}</small><span class="bk">💥${c.kc||0}</span></div>`).join('');
  show('result',1);if(sc.lv>lv0)sfx('good');requestAnimationFrame(()=>requestAnimationFrame(()=>$('rXp').style.width=(sc.lv>=MAXLV?100:sc.xp/need(sc.lv)*100)+'%'))},win?600:300)}
// ================= 渲染 =================
function frameOf(h){let i=Math.round(h/(Math.PI*2)*DIRS)%DIRS;if(i<0)i+=DIRS;return i}
function drawCarSprite(c2d,img,i,x,y,s){c2d.drawImage(img,(i%4)*F,(i>>2)*F,F,F,x-F/2*s,y-F*AY*s,F*s,F*s)}
function drawHalf(c2d,img,i,x,y){const h=F/2;c2d.drawImage(img,(i%4)*h,(i>>2)*h,h,h,x-96,y-192*AY,192,192)}
function drawPartLayers(c2d,k,eq,i,x,y,sc){const LF=128,LS=192/128;for(const id of eq){const L=LAYI[k+'_part_'+id];if(!L)continue;c2d.drawImage(L,(i%4)*LF,(i>>2)*LF,LF,LF,x-LF/2*LS*sc,y-LF*AY*LS*sc,LF*LS*sc,LF*LS*sc)}}
function drawFull(c2d,k,cs,i,x,y,sc,rl){drawWheels(c2d,k,i,1,rl||0,x,y,WS*sc);drawCarSprite(c2d,compose(k,cs.paint.color,cs.paint.livery),i,x,y,FS*sc);drawPartLayers(c2d,k,Object.values(cs.equip).filter(Boolean),i,x,y,sc)}
function drawWheels(c2d,k,i,st,rl,x,y,s){const idx=i*9+st*3+rl,img=WHL[k];c2d.drawImage(img,(idx%12)*WF,(idx/12|0)*WF,WF,WF,x-WF/2*s,y-WF*AY*s,WF*s,WF*s)}
function drawThumb(cnv,k,i,s){const x=cnv.getContext('2d');x.clearRect(0,0,cnv.width,cnv.height);drawFull(x,k,save.cars[k],i,cnv.width/2,cnv.height*.62,s*2)}
const RL=[],byD=(a,b)=>a._d-b._d;
function render(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=MAP.out[0];ctx.fillRect(0,0,W,H);
 let tx=camX,ty=camY;const F=FEEL,rdt=Math.min(.05,frameDt||.016);if(player){const dl=player.dash>0?1.6:1;let lx2=clamp(player.vx*F.camLead*dl,-F.camLeadMax*dl,F.camLeadMax*dl),lz2=clamp(player.vz*F.camLead*dl,-F.camLeadMax*dl,F.camLeadMax*dl);const kL=1-Math.exp(-F.camLeadK*rdt);leadX+=(lx2-leadX)*kL;leadZ+=(lz2-leadZ)*kL;[tx,ty]=iso(player.x+leadX,player.z+leadZ);ty-=10}
 if(camSnap&&player){camX=tx;camY=ty;camSnap=false}const kC=1-Math.exp(-F.camK*rdt);if(Math.hypot(tx-camX,ty-camY)>F.camDead){camX+=(tx-camX)*kC;camY+=(ty-camY)*kC}
 // 冲刺镜头：先推近 80ms，再拉远 200ms，保持，结束后 300ms 回位
 const de=time-dashFxT,dOn=player&&player.dash>0;let zt=1;if(de>=0&&de<.08)zt=1+F.zoomIn*(de/.08);else if(dOn)zt=1-F.zoomOut*Math.min(1,(de-.08)/.2);camZ+=(zt-camZ)*(de>=0&&de<.08?1:1-Math.exp(-(dOn?10:7)*rdt));
 let shx=0,shy=0;if(shake>0){const a=FEEL.shakeMax*Math.pow(Math.min(1,shake/14),2);shx=rnd(-1,1)*a;shy=rnd(-1,1)*a}
 if(!(camZ>=.8&&camZ<=1.1))camZ=1;ctx.setTransform(DPR*Z*camZ,0,0,DPR*Z*camZ,DPR*(W/2+shx),DPR*(H/2+shy+H*.04));ctx.translate(-camX,-camY);
 ctx.drawImage(floor,-floor.ox/FSC,-floor.oy/FSC,floor.width/FSC,floor.height/FSC);ctx.drawImage(skid,-floor.ox/FSC,-floor.oy/FSC,skid.width/FSC,skid.height/FSC);
 const fence=zoneR<AR-.3;
 if(MODE==='ring')ringUnder();else if(fence){ctx.save();ctx.beginPath();ctx.rect(-6000,-6000,12000,12000);ZPOLY.forEach((q,i)=>{const p=iso(q[0],q[1]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.fillStyle='rgba(40,20,90,0.38)';ctx.fill('evenodd');ctx.restore();drawFencePoly(true)}
 const list=RL;list.length=0;for(const p of props){if(p.baked)continue;p._d=p.type==='rail'?(p.nx+p.nz>0?1e9:-1e9):p.x+p.z;list.push(p)}for(const c of cars){c._d=c.x+c.z;list.push(c)}list.sort(byD);// 复用数组，不再每帧分配包装对象
 for(const c of cars){const [sx,sy]=iso(c.x,c.z);shadow(sx+4,sy+4,46,25,c.alive?.5:.3)}
 for(const it of list){if(it.isP===undefined)drawProp(it);else drawCar(it)}
 if(fence&&MODE!=='ring')drawFencePoly(false);
 drawParts();for(const q of TLQ)tailLights(...q);TLQ.length=0;drawTags();drawFts();
 if(tut&&tut.step===3){const d=cars[1],[sx,sy]=iso(d.x,d.z),b=Math.sin(time*6)*6;ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#1b1420';ctx.strokeText('撞它侧面 ↓',sx,sy-110+b);ctx.fillStyle='#7df9ff';ctx.fillText('撞它侧面 ↓',sx,sy-110+b)}
 if(player&&player.alive){const[sx,sy]=iso(player.x,player.z);ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.globalAlpha=.8+.2*Math.sin(time*8);ctx.beginPath();ctx.ellipse(sx,sy,42,21,0,0,7);ctx.stroke();ctx.globalAlpha=1;
  }
 ctx.setTransform(DPR,0,0,DPR,0,0);if(player&&player.dash>0&&!paused)speedLines();if(DBG&&player){ctx.font='12px monospace';ctx.textAlign='left';ctx.fillStyle='#0008';ctx.fillRect(8,H-92,250,84);ctx.fillStyle='#7f7';[`fwd ${player.fwd.toFixed(1)}/${player.spd.toFixed(1)}  lat ${Math.hypot(player.vx,player.vz).toFixed(1)}`,`steer ${player.steer.toFixed(2)}  yaw ${(player.yr||0).toFixed(2)}`,`dash ${Math.max(0,player.dash).toFixed(2)}  cd ${Math.max(0,player.dcd).toFixed(2)}`,`camZ ${camZ.toFixed(3)}  shake ${shake.toFixed(1)}`,`joy ${jx.toFixed(2)},${jy.toFixed(2)}`].forEach((t,i)=>ctx.fillText(t,14,H-74+i*15))}if(hitstop>0.07){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(0,0,W,H)}
 if(player&&player.alive&&fence&&sdist(ZPOLY,player.x,player.z).s>.3){ctx.strokeStyle='rgba(125,249,255,.5)';ctx.lineWidth=16;ctx.strokeRect(0,0,W,H)}}
function drawFencePoly(back){// 外法线朝向镜头外的边先画（背面），其余后画
 const P=ZPOLY;for(let e=0;e<P.length;e++){const[a,b]=P[e],[c,d]=P[(e+1)%P.length],L=Math.hypot(c-a,d-b);if(L<.1)continue;let nx=(d-b)/L,nz=-(c-a)/L;if(inPoly(P,(a+c)/2+nx*.3,(b+d)/2+nz*.3)){nx=-nx;nz=-nz}if((nx+nz<0)!==back)continue;const N=Math.max(2,Math.round(L/1.5)),posts=[];for(let i=0;i<=N;i++)posts.push(iso(a+(c-a)*i/N,b+(d-b)*i/N));drawFence(posts)}}
function drawFence(posts){
 ctx.save();ctx.globalCompositeOperation='lighter';
 for(let L=0;L<2;L++){ctx.beginPath();posts.forEach((p,i)=>{const j=i%2?rnd(-6,6):0,y=p[1]-14-L*10+rnd(-3,3);i?ctx.lineTo(p[0]+j,y):ctx.moveTo(p[0],y)});ctx.strokeStyle=L?'rgba(180,120,255,.55)':'rgba(125,249,255,.75)';ctx.lineWidth=3;ctx.stroke();ctx.lineWidth=9;ctx.strokeStyle=L?'rgba(180,120,255,.12)':'rgba(125,249,255,.18)';ctx.stroke()}
 ctx.restore();
 for(let i=0;i<posts.length;i+=4){const p=posts[i];ctx.fillStyle='#2d2a3a';ctx.fillRect(p[0]-2.5,p[1]-30,5,30);ctx.fillStyle='#7df9ff';ctx.beginPath();ctx.arc(p[0],p[1]-31,3+Math.random()*1.5,0,7);ctx.fill()}}
function drawCar(c){const [sx,sy]=iso(c.x,c.z),i=frameOf(c.h),st=c.steer>.3?2:c.steer<-.3?0:1,rl=((Math.floor(c.roll)%3)+3)%3;
 if(!c.alive){const y=sy+Math.min(6,c.deadT*20);drawWheels(ctx,c.k,i,1,0,sx,y,WS);drawCarSprite(ctx,c.skin,i,sx,y,FS);drawHalf(ctx,DARK[c.k],i,sx,y);return}
 const bx=sx+c.sus.px,by=sy+c.sus.py+c.bump;drawWheels(ctx,c.k,i,st,rl,sx,sy+c.bump*.3,WS);drawCarSprite(ctx,c.skin,i,bx,by,FS);drawPartLayers(ctx,c.k,c.eq,i,bx,by,1);
 if(c.rev||c.brake)TLQ.push([c,bx-sx,by-sy]);
 if(c.flash>0){ctx.globalAlpha=Math.min(1,c.flash*8);drawHalf(ctx,WHITE[c.k],i,bx,by);ctx.globalAlpha=1;c.flash-=1/60}}
const TLQ=[];
const TAIL={tyrant:[2.3,.9,1.5],fang:[2.2,.85,1.0],beast:[2.0,.9,1.45]};
function tailLights(c,ox,oy){const[tz,tx,ty]=TAIL[c.k],fx=Math.sin(c.h),fz=Math.cos(c.h),lx=Math.cos(c.h),lz=-Math.sin(c.h),pts=[];
 for(const s of[-1,1]){const wx=c.x-fx*tz+lx*s*tx,wz=c.z-fz*tz+lz*s*tx,p=iso(wx,wz);pts.push([p[0]+ox,p[1]+oy-ty*HK,(wx-c.x)*(fx)+(wz-c.z)*fz])}
 const vis=fx+fz<.35;if(!vis)return;// 车尾朝镜头时才看得到
 ctx.save();for(const[x,y] of pts){const R=c.rev?14:11,g=ctx.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,'rgba(255,40,40,.75)');g.addColorStop(1,'rgba(255,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
  ctx.fillStyle='#1b1420';ctx.fillRect(x-5,y-3.5,10,7);ctx.fillStyle='#ff2a2a';ctx.fillRect(x-4,y-2.5,8,5);ctx.fillStyle=c.rev?'#fff':'#ffb0b0';ctx.fillRect(x-1.5,y-1.5,3,3)}ctx.restore()}
function fitText(t,max){if(ctx.measureText(t).width<=max)return t;const a=[...t];while(a.length>1&&ctx.measureText(a.join('')+'…').width>max)a.pop();return a.join('')+'…'}
function drawTags(){const tg=[];for(const c of cars){if(!c.alive)continue;const[sx,sy]=iso(c.x,c.z);tg.push({c,x:sx,y:sy-92})}
 tg.sort((a,b)=>a.y-b.y);for(let i=0;i<tg.length;i++)for(let j=0;j<i;j++){const A=tg[i],B=tg[j];if(Math.abs(A.x-B.x)<74&&Math.abs(A.y-B.y)<24)A.y=Math.min(A.y,B.y-24)}// 简单防重叠：上推
 for(const t of tg)tagOf(t.c,t.x,t.y)}
function tagOf(c,sx,y){const w=50,f=c.hp/c.maxhp,isP=c.isP;
 ctx.fillStyle='#1b1420';rr(sx-w/2-2,y-2,w+4,9,4.5);ctx.fill();ctx.fillStyle='#3a2f45';rr(sx-w/2,y,w,5,2.5);ctx.fill();ctx.fillStyle=f<.35?'#ff4d4d':f<.6?'#ffb703':isP?'#ffd23f':'#7bd94f';rr(sx-w/2,y,w*Math.max(0,f),5,2.5);ctx.fill();
 ctx.font='800 11px system-ui';const nm=(c.cname?fitText(c.nick||'',56)+'·'+fitText(c.cname,56):fitText(c.nick||'',78))+' ',lv='Lv'+c.lv;const tw=ctx.measureText(nm).width,lw=ctx.measureText(lv).width,W2=tw+lw+8,x0=sx-W2/2,ty=y-6;
 ctx.fillStyle='rgba(27,20,32,.72)';rr(x0-3,ty-11,W2+6,14,7);ctx.fill();ctx.strokeStyle=c.frame||'#fff';ctx.lineWidth=1.5;ctx.stroke();
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=isP?'#ffd23f':c.dummy?'#c9c9d6':'#ffffff';ctx.fillText(nm,x0+2,ty);ctx.fillStyle=isP?'#fff3a8':'#9be7ff';ctx.fillText(lv,x0+2+tw,ty);
 if(isP){const b=Math.sin(time*5)*2;ctx.fillStyle='#ffd23f';ctx.strokeStyle='#1b1420';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(sx,ty-14+b+8);ctx.lineTo(sx-6,ty-14+b);ctx.lineTo(sx+6,ty-14+b);ctx.closePath();ctx.stroke();ctx.fill()}
 if(c.bub&&c.bub.t>0){c.bub.t-=1/60;ctx.font='800 12px system-ui';const bw=ctx.measureText(c.bub.txt).width+14,by=ty-22;ctx.globalAlpha=Math.min(1,c.bub.t*3);ctx.fillStyle='#fff';rr(sx-bw/2,by-16,bw,20,10);ctx.fill();ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(sx-4,by+4);ctx.lineTo(sx,by+9);ctx.lineTo(sx+4,by+4);ctx.fill();ctx.fillStyle='#1b1420';ctx.textAlign='center';ctx.fillText(c.bub.txt,sx,by-1);ctx.globalAlpha=1}}
function hpBar(c){tagOf(c,...(()=>{const[sx,sy]=iso(c.x,c.z);return[sx,sy-92]})())}

function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):ctx.rect(x,y,w,h)}
function drawParts(){for(const p of parts){const [sx,sy0]=iso(p.x,p.z),sy=sy0-p.y*HK,k=p.t/p.life;
 if(p.k==='spark'){ctx.strokeStyle=p.col;ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.moveTo(sx,sy);const e=iso(p.x-p.vx*.03,p.z-p.vz*.03);ctx.lineTo(e[0],e[1]-(p.y-p.vy*.03)*HK);ctx.stroke()}
 else if(p.k==='deb'){ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot);ctx.globalAlpha=1-Math.max(0,k-.7)/.3;ctx.fillStyle=p.col;ctx.strokeStyle='#1b1420';ctx.lineWidth=1.5;ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.strokeRect(-p.s/2,-p.s/3,p.s,p.s*.66);ctx.restore();ctx.globalAlpha=1}
 else if(p.k==='dust'){const r=p.s*(1+k*1.8);ctx.globalAlpha=(1-k)*.5;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.globalAlpha=1}
 else if(p.k==='mud'){ctx.fillStyle='#5b3d22';ctx.strokeStyle='#1b1420';ctx.lineWidth=1;ctx.beginPath();ctx.arc(sx,sy,p.s,0,7);ctx.fill();ctx.stroke()}
 else if(p.k==='smoke'){const r=p.s*(1+k*1.6);ctx.globalAlpha=(1-k)*.55;ctx.fillStyle=p.dark?'#4a4452':'#e8e4ee';ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.globalAlpha=(1-k)*.3;ctx.fillStyle=p.dark?'#6b6475':'#fff';ctx.beginPath();ctx.arc(sx-r*.3,sy-r*.3,r*.55,0,7);ctx.fill();ctx.globalAlpha=1}
 else if(p.k==='fire'){ctx.save();ctx.globalCompositeOperation='lighter';const r=p.s*(1-k*.5);const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,'rgba(255,250,200,.9)');g.addColorStop(.4,'rgba(255,160,40,.7)');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='flash'){ctx.save();ctx.globalCompositeOperation='lighter';const r=40+k*90;const g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,`rgba(255,255,220,${1-k})`);g.addColorStop(1,'rgba(255,140,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill();ctx.restore()}
 else if(p.k==='ring'){ctx.strokeStyle=`rgba(255,230,160,${1-k})`;ctx.lineWidth=6*(1-k)+1;ctx.beginPath();ctx.ellipse(sx,sy0,20+k*110,10+k*55,0,0,7);ctx.stroke()}}}
function drawFts(){ctx.textAlign='center';ctx.textBaseline='middle';for(const f of fts){const [sx,sy0]=iso(f.x,f.z),k=f.t/1.1,pop=f.big?(k<.12?.6+k/.12*.7:1.3-Math.min(.3,(k-.12)*1.5)):1;const sy=sy0-f.y*HK-k*40;
 ctx.save();ctx.translate(sx,sy);ctx.scale(pop,pop);ctx.globalAlpha=k>.7?1-(k-.7)/.3:1;ctx.font=`900 ${f.size}px system-ui,"PingFang SC",sans-serif`;ctx.lineJoin='round';ctx.lineWidth=f.size*.28;ctx.strokeStyle='#1b1420';ctx.strokeText(f.text,0,0);
 if(f.big){const g=ctx.createLinearGradient(0,-f.size/2,0,f.size/2);g.addColorStop(0,'#fff');g.addColorStop(.45,f.color);g.addColorStop(1,f.color);ctx.fillStyle=g}else ctx.fillStyle=f.color;ctx.fillText(f.text,0,0);ctx.restore()}ctx.globalAlpha=1}
// ================= HUD =================
const $=id=>document.getElementById(id);
function hud(){if(!player||!running)return;const f=Math.max(0,player.hp/player.maxhp);
 $('hpFill').style.width=f*100+'%';$('hpFill').classList.toggle('low',f<.3);$('hpLag').style.width=f*100+'%';$('hpTxt').textContent=Math.ceil(player.hp)+' / '+Math.round(player.maxhp);
 $('aliveN').textContent=cars.filter(c=>c.alive&&!c.dummy).length+'/'+nCars;$('killN').textContent=kills;$('timeN').textContent=time.toFixed(0);$('zoneWarn').classList.toggle('hide',!(!tut&&time>25&&zoneR>10));
 const e=$('dashCd'),cd=Math.max(0,player.dcd/(player.dcdMax||FEEL.dashCd));const db=$('dash'),rdy=player.dcd<=0;if(rdy&&db._cd){db.classList.remove('ready');void db.offsetWidth;db.classList.add('ready');sfx('ui')}db._cd=!rdy;db.classList.toggle('cooling',!rdy);e.setAttribute('r',23);e.style.stroke='#1b142077';e.style.strokeWidth=46;e.style.fill='none';e.style.strokeDasharray=`${cd*2*Math.PI*23} 999`}
const PANELS=['match','daily','menu','result','hud','garage','settings','pause','maps','tutBox','intro'];
const show=(id,v)=>$(id).classList.toggle('hide',!v);
function hideAll(){PANELS.forEach(p=>show(p,0))}
let toastT=0;function toast(t){const e=$('toast');e.textContent=t;e.classList.remove('hide');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.add('hide'),2200)}
document.addEventListener('click',e=>{if(e.target.closest('button,.card,.mapc,.tab'))sfx('ui')},true);
// ================= 新手引导 =================
const TUT=[['① 移动','在左半屏任意位置按住拖动<b>摇杆</b>：往哪推车就开向哪，推得越远越快；往回推是掉头（倒车请用倒车键）。电脑：W 前进 · S 刹车/倒车 · A/D 左右转','joy'],['② 冲刺','点右下<b>冲刺</b>（电脑：空格），瞬间爆发冲刺约 0.55 秒，冲刺中用车头撞人伤害 ×1.5「冲撞！」，冷却 2.5 秒（按钮圈转满即可再用）','dash'],['③ 倒车','按住<b>倒车</b>键（电脑：S/↓），或把摇杆推向车尾方向：先刹车再倒车，倒车时尾灯亮、转向反向','rev'],['④ 暴击','用<b>车头</b>撞假人的<b>侧面</b>，打出 1.5 倍暴击！撞车头只有 0.6 倍',''],['⑤ 改装','漂亮！新手奖励：',''],];
function updTut(){['joy','dash','rev'].forEach(i=>$(i).classList.remove('glow'));if(!tut){show('tutBox',0);return}const s=TUT[tut.step];show('tutBox',1);
 $('tutBox').innerHTML=`<div class="tt">新手引导 ${s[0]}</div><div>${s[1]}</div>${tut.step===4?`<div class="rew">${icPart('spike','×10',true)}<small>尖刺碎片 · 去车库合成并装上</small></div>`:''}${tut.step===4?'<button class="btn" id="tutGo">去车库 →</button>':''}<button class="skip" id="tutSkip">跳过引导</button>`;
 if(s[2])$(s[2]).classList.add('glow');if(tut.step===4)$('tutGo').onclick=()=>endTut(true);$('tutSkip').onclick=()=>endTut(false)}
function tutStep(dt){tut.t+=dt;if(tut.step===0&&activeT>1.2){tut.step=1;sfx('good');updTut()}else if(tut.step===1&&player.dcd>0&&player.dcd<2.6){tut.step=2;sfx('good');updTut()}else if(tut.step===2){if(player.fwd<-2)tut.rv=(tut.rv||0)+dt;if(tut.rv>.6){tut.step=3;sfx('good');updTut()}}}
function endTut(toGarage){if(!save.tutorialDone){save.tutorialDone=true;save.shards.spike=Math.max(save.shards.spike||0,PARTS.spike.need);persist()}tut=null;running=false;cars=[];player=null;['joy','dash'].forEach(i=>$(i).classList.remove('glow'));
 if(toGarage){garageGuide=true;openGarage('beast')}else menu()}
// ================= 车库（改装 / 加点 / 合成）=================
let gKey='beast',garageGuide=false,afterGarage=null;
function canCraft(id){const p=PARTS[id],have=save.shards[id]||0;return have>=p.need||save.uni>=(p.need-have)*UNI[p.r]}
function openGarage(k){gKey=k||gKey;hideAll();show('garage',1);renderGarage()}
let gSel=null,gOpen='front',gTab='craft';
function fitUI(){const rot=document.body.classList.contains('rot'),aw=rot?VVH():VVW(),ah=rot?VVW():VVH();document.documentElement.style.setProperty('--uz',Math.max(1,Math.min(aw/1000,ah/720,2)).toFixed(3))}
addEventListener('resize',fitUI);setTimeout(fitUI,0);
function fitStage(){fitUI();const st=document.querySelector('#garage .gstage');if(!st)return;const W=VVW(),H=VVH(),rot=document.body.classList.contains('rot'),aw=rot?H:W,ah=rot?W:H;const k=Math.min(aw/1200,ah/675);st.style.transform=`translate(-50%,-50%) scale(${k})`}
addEventListener('resize',()=>setTimeout(fitStage,50));
function renderGarage(){const cs=save.cars[gKey],st=carStats(gKey,cs),b=CARS[gKey],fp=ptsFree(cs);
 const tabs=KEYS.map(k=>`<button class="tab ${k===gKey?'on':''}" data-car="${k}" style="--c:${CARS[k].col}">${CARS[k].name}<small>Lv.${save.cars[k].lv}</small></button>`).join('');
 const stats=Object.keys(STATS).map(s=>{const v=cs.pts[s],pct=Math.round((st[s]/b[s]-1)*100);return`<div class="srow"><span class="sn">${STATS[s]}</span><span class="pips">${Array.from({length:PT_MAX},(_,i)=>`<i class="${i<v?'on':''}"></i>`).join('')}</span><span class="sv">${pct>=0?'+':''}${pct}%</span><button class="mini" data-pt="${s}" data-d="-1" ${v<=0?'disabled':''}>−</button><button class="mini" data-pt="${s}" data-d="1" ${fp<=0||v>=PT_MAX?'disabled':''}>＋</button></div>`}).join('');
 const cmpRow=(sl,id)=>{const cur=cs.equip[sl];if(id===undefined||id===cur&&false)return'';const t=JSON.parse(JSON.stringify(cs));t.equip[sl]=id||null;const a=st,n=carStats(gKey,t);
  const keys=['hp','spd','acc','turn','mass','dmg','push','sideBonus','rearRes','critRes','thorns','dashCd','dashPow','terr','iceGrip'],low={mass:0,rearRes:1,critRes:1,dashCd:1,terr:1};
  const rows=keys.map(k=>{const va=a[k],vb=n[k];if(Math.abs(va-vb)<1e-6)return'';const up=vb>va,good=k in low?!up:up,fmt=v=>k==='hp'?Math.round(v):k==='thorns'?Math.round(v*100)+'%':['push','sideBonus','rearRes','critRes','dashCd','dashPow','terr','iceGrip'].includes(k)?Math.round(v*100)+'%':v.toFixed(2);
   return`<span class="cmp ${good?'g':'b'}">${MODN[k]} ${fmt(va)}→<b>${fmt(vb)}</b> ${up?'▲':'▼'}</span>`}).join('');
  const own=!id||save.owned[id],act=id===cur?(cur?`<button class="btn sm ghost" data-eq="${sl}" data-id="">卸下</button>`:'<span class="owned">当前</span>'):own?`<button class="btn sm ${garageGuide&&id==='spike'?'glow':''}" data-eq="${sl}" data-id="${id||''}">${id?(cur?'装备（替换 '+PARTS[cur].n+'）':'装备'):'卸下 '+PARTS[cur].n}</button>`:'<span class="lack">未拥有 · 去下方合成</span>';
  return`<div class="cmpbox">${id?icPart(id,undefined,false,true):''}<b>${id?PARTS[id].n:'空槽'}</b> <small>${id?PARTS[id].desc:'不装部件（素车）'}</small><div class="cmps">${id===cur?'<span class="cmp">当前装备中</span>':rows||'<span class="cmp">属性无变化</span>'}</div>${act}</div>`};
 const fillShown=[];const craft=Object.keys(PARTS).map(id=>{const p=PARTS[id],have=save.shards[id]||0,own=save.owned[id],gap=Math.max(0,p.need-have),uniNeed=gap*UNI[p.r];
  const dl=daily(),canFill=AB.fill&&!own&&gap>0&&gap<=Math.ceil(p.need*AB.fillPct)&&(dl.fill||0)<3&&have<p.need;if(canFill)fillShown.push(id);
  const btn=canFill?`<span class="bcol"><button class="btn sm adbtn" data-fill="${id}">📺 补齐 +${gap} 碎片</button><small>今日 ${3-(dl.fill||0)}/3</small></span>`:own?'<span class="owned">已拥有</span>':have>=p.need?`<button class="btn sm ${garageGuide&&id==='spike'?'glow':''}" data-craft="${id}">合成</button>`:save.uni>=uniNeed?`<button class="btn sm ghost" data-craft="${id}">${icUni('')} 通用×${uniNeed} 补齐</button>`:`<span class="lack">差 ${gap}</span>`;
  return`<div class="crow ic2">${own?'':`<button class="wish ${save.wish===id?'on':''}" data-wish="${id}">${save.wish===id?'★':'☆'}</button>`}${icPart(id,own?'✓':Math.min(have,p.need)+'/'+p.need,!own)}<div class="cmid"><b>${p.n} <span class="rar ${p.r}">${RARN[p.r]}</span></b><small>${SLOTS[p.slot]} · ${p.desc}</small><div class="cbar"><div style="width:${own?100:Math.min(100,have/p.need*100)}%"></div></div></div>${btn}</div>`}).join('');
 const guide=garageGuide?`<div class="gguide">引导：${save.owned.spike?(cs.equip.front==='spike'?'③ 完成！点【出战】试试新车头':'② 在中间【车头】槽位点「尖刺」，看属性对比后点【装备】'):'① 在右侧【碎片合成】点尖刺的【合成】'}</div>`:'';
 if(garageGuide)gTab=save.owned.spike?gTab:'craft';if(garageGuide&&save.owned.spike&&!gOpen)gOpen='front';
 const slotsH=Object.keys(SLOTS).map(sl=>{const cur=cs.equip[sl],op=gOpen===sl,opts=Object.keys(PARTS).filter(id=>PARTS[id].slot===sl),sel=gSel&&gSel.sl===sl?gSel.id:undefined;
  return`<div class="gs ${op?'open':''}"><button class="gsh" data-open="${sl}">${cur?icPart(cur,undefined,false,true):'<span class="ic empty"><i></i></span>'}<span class="gst2"><b>${SLOTS[sl]}</b><small>${cur?PARTS[cur].n:'空槽'}</small></span><em>${op?'▲':'▼'}</em></button>${op?`<div class="gsb"><div class="gopts"><button class="pchip ipc x ${!cur?'on':''} ${sel===null?'sel':''}" data-sel="${sl}" data-id=""><span class="ic empty"><i></i></span><small>空槽</small></button>${opts.map(id=>`<button class="pchip ipc ${cur===id?'on':''} ${sel===id?'sel':''} ${save.owned[id]?'':'lock'}" data-sel="${sl}" data-id="${id}">${icPart(id,undefined,false,true)}${save.owned[id]?'':'<em class="lk">🔒</em>'}<small>${PARTS[id].n}</small></button>`).join('')}</div>${sel!==undefined?cmpRow(sl,sel):cur?`<small class="gdesc">${PARTS[cur].desc}</small>`:'<small class="gdesc">点部件查看属性对比</small>'}</div>`:''}</div>`}).join('');
 const look=`<div class="gst">颜色 <span>金币购买，所有车通用</span></div><div class="swatches">${Object.keys(COLORS).map(c=>`<button class="sw2 ${cs.paint.color===c?'on':''}" data-col="${c}" style="--c:${COLORS[c].c}"><i></i><small>${COLORS[c].n}</small><em>${save.colors[c]?(cs.paint.color===c?'使用中':'已拥有'):ico(20,'cur mini',COLORS[c].p)}</em></button>`).join('')}</div>
 <div class="gst" style="margin-top:8px">涂装</div><div class="swatches"><button class="lv2 ${!cs.paint.livery?'on':''}" data-liv="">无</button>${Object.keys(LIVS).map(l=>`<button class="lv2 ${cs.paint.livery===l?'on':''}" data-liv="${l}">${LIVS[l].n}<em>${save.livs[l]?'':LIVS[l].lim?'<i class="limt">限定·抽奖</i>':ico(20,'cur mini',LIVS[l].p)}</em></button>`).join('')}</div>`;
 $('garage').innerHTML=`<div class="gstage"><div class="ghead"><button class="btn ghost sm" id="gBack">← 返回</button><b>车库</b><div class="tabs">${tabs}</div><span class="uni">${icCoin(save.coins)}${icUni(save.uni)}</span></div>${guide}
 <div class="gcols"><div class="gcol gl"><canvas id="gPrev" width="300" height="200"></canvas>${gNameHtml(gKey,b)}<div class="xpRow"><span>Lv.${cs.lv}</span><div class="xpBar"><div style="width:${cs.lv>=MAXLV?100:cs.xp/need(cs.lv)*100}%"></div></div><span>${cs.lv>=MAXLV?'MAX':cs.xp+'/'+need(cs.lv)}</span></div>
 <div class="gnum">血量 ${Math.round(st.hp)} · 速度 ${st.spd.toFixed(1)} · 重量 ${st.mass.toFixed(2)} · 加速 ${st.acc.toFixed(1)} · 操控 ${st.turn.toFixed(2)} · 撞击 ${st.dmg.toFixed(2)}</div>
 <div class="gst">属性加点 <span>可用 <b>${fp}</b> 点 · 每点 +3%</span><button class="mini wide" id="gReset" ${ptsUsed(cs)?'':'disabled'}>免费洗点</button></div><div class="gpane">${stats}</div></div>
 <div class="gcol gm"><div class="gst">改装槽位 <span>每槽一个 · 未装 = 素车</span></div><div class="gpane">${slotsH}</div></div>
 <div class="gcol gr"><div class="rtabs"><button class="rt ${gTab==='look'?'on':''}" data-gtab="look">外观 / 涂装</button><button class="rt ${gTab==='craft'?'on':''}" data-gtab="craft">碎片合成</button></div><div class="gpane">${gTab==='look'?look:`<div class="gst"><span>重复碎片自动转通用（白1/蓝2/紫3/金4）</span></div>${craft}`}</div></div></div>
 <div class="gfoot"><button class="btn" id="gGo">出战 ▶</button></div></div>`;
 fitStage();
 fillShown.forEach(id=>track('ad_entry_show',{placement:'targeted_fill',part:id}));
 $('gBack').onclick=()=>{garageGuide=false;menu()};$('gGo').onclick=()=>{garageGuide=false;openMaps(gKey)};
 $('gReset').onclick=()=>{for(const s in cs.pts)cs.pts[s]=0;persist();toast('已免费洗点');renderGarage()}}
$('garage').addEventListener('click',e=>{const t=e.target.closest('button');if(!t||t.disabled)return;const cs=save.cars[gKey];
 if(t.dataset.car){gKey=t.dataset.car;gSel=null;renderGarage()}
 else if(t.dataset.col){const c=t.dataset.col;if(!save.colors[c]){skinTry('color',c);return}skinTry(null);cs.paint.color=c;persist();sfx('good');renderGarage()}
 else if(t.dataset.liv!==undefined){const l=t.dataset.liv||null;if(l&&!save.livs[l]&&LIVS[l].lim){toast('限定涂装：每日抽奖获得');return}if(l&&!save.livs[l]){skinTry('livery',l);return}skinTry(null);cs.paint.livery=l;persist();sfx('good');renderGarage()}
 else if(t.dataset.pt){const s=t.dataset.pt,d=+t.dataset.d;if(d>0&&ptsFree(cs)>0&&cs.pts[s]<PT_MAX)cs.pts[s]++;if(d<0&&cs.pts[s]>0)cs.pts[s]--;persist();renderGarage()}
 else if(t.dataset.open){gOpen=gOpen===t.dataset.open?null:t.dataset.open;gSel=null;renderGarage()}
 else if(t.dataset.gtab){gTab=t.dataset.gtab;renderGarage()}
 else if(t.dataset.sel!==undefined){gSel={sl:t.dataset.sel,id:t.dataset.id||null};renderGarage()}
 else if(t.dataset.eq!==undefined){const sl=t.dataset.eq,id=t.dataset.id||null,old=cs.equip[sl];if(id&&!save.owned[id])return;cs.equip[sl]=id;persist();sfx('good');toast(id?(old?`已装备 ${PARTS[id].n}，${PARTS[old].n} 回到库存`:`已装备 ${PARTS[id].n}`):`已卸下 ${PARTS[old].n}（空槽）`);gSel=null;renderGarage()}
 else if(t.dataset.wish){const id=t.dataset.wish;save.wish=save.wish===id?null:id;save.pity=0;persist();toast(save.wish?'心愿部件：'+PARTS[id].n:'已取消心愿');renderGarage()}
 else if(t.dataset.fill){const id=t.dataset.fill,p=PARTS[id];showRewardedAd(ok=>{if(!ok)return toast('未看完，没有奖励');const d=daily(),have=save.shards[id]||0,gap=p.need-have;if((d.fill||0)>=3||save.owned[id]||gap<=0||gap>Math.ceil(p.need*AB.fillPct))return;d.fill=(d.fill||0)+1;save.shards[id]=p.need;persist();track('reward_grant',{placement:'targeted_fill',part:id,n:gap});toast(`已补齐 ${p.n} 碎片 +${gap}，可以合成了`);renderGarage()},'targeted_fill')}
 else if(t.dataset.craft){const id=t.dataset.craft,p=PARTS[id],have=save.shards[id]||0;if(save.owned[id])return;if(have>=p.need)save.shards[id]=have-p.need;else{const u=(p.need-have)*UNI[p.r];if(save.uni<u)return;save.uni-=u;save.shards[id]=0}
  save.owned[id]=true;persist();sfx('good');toast('合成成功：'+p.n);renderGarage()}});
// ================= 地图选择 =================
let mapCar='beast';
function openMaps(k){mapCar=k;hideAll();show('maps',1);const box=$('mapList');box.innerHTML='';const cs=save.cars[k],ro=roster(cs.lv);
 $('mapsSub').textContent=`${CARS[k].name} Lv.${cs.lv} · 本局 ${ro.n} 辆车 · 场地 ${ro.n===4?'标准':ro.n===6?'2 倍':'3 倍'}大小`;
 ((BUILD.maps&&BUILD.maps.filter(m=>MAPK.includes(m)))||[...MAPK,'random']).forEach(mk=>{const d=document.createElement('div');d.className='mapc';if(mk==='random'){d.innerHTML='<div class="rnd">？</div><b>随机</b><small>三选一</small>'}else{const M=MAPS[mk];d.appendChild(mapThumb(mk));d.insertAdjacentHTML('beforeend',`<b>${M.name}</b><small>${M.shape}<br>${M.desc}</small>`)}
  d.onclick=()=>{const m=mk==='random'?MAPK[Math.random()*3|0]:mk;matchThenStart(k,m)};box.appendChild(d)})}
$('mapsBack').onclick=()=>menu();
// ================= 设置 / 暂停 =================
let settingsFrom='menu';
function openSettings(from){settingsFrom=from;show('settings',1);const s=save.settings;
 $('sVol').value=Math.round(s.vol*100);$('sVolV').textContent=Math.round(s.vol*100)+'%';['music','sfx','vibrate'].forEach(k=>$('s_'+k).checked=s[k]);
 document.querySelectorAll('[data-q]').forEach(b=>b.classList.toggle('on',b.dataset.q===s.quality));document.querySelectorAll('[data-diff]').forEach(b=>b.classList.toggle('on',b.dataset.diff===s.diff));
 $('sQNow').textContent='当前：'+(QL==='low'?'低':'高')}
function updMute(){const s=save.settings,off=s.mute||s.vol<=0||!s.music&&!s.sfx;['muteM','muteH'].forEach(i=>{const e=$(i);if(e){e.textContent=off?'🔇':'🔊';e.classList.toggle('off',off);e.title=off?'已静音（点我开启）':'声音开（点我静音）'}})}
['muteM','muteH'].forEach(i=>$(i).addEventListener('click',e=>{e.stopPropagation();const s=save.settings;const off=s.mute||!s.music&&!s.sfx;if(off){s.mute=false;if(!s.music&&!s.sfx){s.music=true;s.sfx=true}if(s.vol<=0)s.vol=.7}else s.mute=true;persist();auUnlock();auApply();updMute();auStatus();if(!s.mute)setTimeout(()=>sfx('ui'),50);toast(s.mute?'已静音':'声音已开启')}));
setTimeout(updMute,0);
$('sTest').onclick=()=>{if(save.settings.mute){save.settings.mute=false;persist();updMute()}auUnlock();auApply();setTimeout(()=>{sfx('ui');sfx('hit',1);setTimeout(()=>sfx('crit'),250)},60);setTimeout(()=>{$('sAuSt').textContent=AU.ctx?('音频：'+AU.ctx.state+(save.settings.sfx?'':' · 音效已关')+' · iPhone 静音键开启时无声'):'音频不可用'},150)};
$('sVol').oninput=e=>{save.settings.vol=e.target.value/100;$('sVolV').textContent=e.target.value+'%';auInit();auApply();persist()};
['music','sfx','vibrate'].forEach(k=>$('s_'+k).onchange=e=>{save.settings[k]=e.target.checked;if(k!=='vibrate'&&e.target.checked)save.settings.mute=false;updMute();auInit();auApply();persist();if(k==='vibrate'&&e.target.checked)vib('mid')});
document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{setQuality(b.dataset.q);openSettings(settingsFrom)});
document.querySelectorAll('[data-diff]').forEach(b=>b.onclick=()=>{save.settings.diff=b.dataset.diff;persist();openSettings(settingsFrom)});
$('sClose').onclick=()=>{show('settings',0)};$('sTut').onclick=()=>{show('settings',0);hideAll();buildArena('site',38);start('beast',{tutorial:true})};
function togglePause(){if(!running)return;paused=!paused;show('pause',paused);if(!paused)show('settings',0)}
$('pauseBtn').onclick=togglePause;$('pResume').onclick=togglePause;$('pSet').onclick=()=>openSettings('pause');$('pQuit').onclick=()=>{paused=false;running=false;tut=null;cars=[];player=null;menu()};

// ================= 昵称 / 匹配 =================
const NA=['小','老','阿','大','暴躁','佛系','快乐','无敌','秋名山','深夜','路口','隔壁','甩尾','漂移','飙车','追风','铁头','咸鱼','奶茶','柠檬','橘子','月下','南城','北巷','夏天的','不吃香菜的','爱吃辣的','会飞的','迷路的','早睡的'];
const NB=['车神','老司机','小飞侠','铁皮','旋风','排气管','螺丝钉','方向盘','轮胎','油门','刹车片','后视镜','小卡车','皮卡丘丘','大G','老爷车','碰碰车','涡轮','火花塞','加油站','停车场','洗车工','交警队长','驾校学员','小绵羊'];
const EN=['Tom','Jack','Kiki','momo','Leo','Amy','Max','Coco','Ray','Zed','Nana','Ken','Lucky','Sunny','Ace','Neo','Bobo','Yuki','Vivi','Sam'];
const PY=['xiaoming','dage','laowang','ahua','zhuzhu','qiuqiu','miaomiao','tuzi','dudu','yangyang'];
const ABBR=['zzz','xswl','yyds','awsl','QAQ','orz','GG','nb','ok','hhh','TT','LOL','666','2333','emmm'];
const SEP=['_','·','~','','',''];
const NICKS=(()=>{const set=new Set(),P=a=>a[Math.random()*a.length|0],N=()=>String(Math.random()<.5?Math.floor(Math.random()*100):[666,888,520,1314,2026,99,7,233,1024][Math.random()*9|0]);
 const styles=[()=>P(['阿','小','老'])+P(['强','飞','明','杰','花','宝','龙','白','七','九']),// 阿强
  ()=>P(EN)+P(SEP)+P(NB),()=>P(NA)+P(NB)+(Math.random()<.5?N():''),()=>P(ABBR),()=>P(PY)+(Math.random()<.6?N():''),()=>P(EN)+N(),()=>P(NB)+P(['丶','~','_','']),
  ()=>P(NA)+P(['王','哥','姐','侠','怪','君']),()=>P(PY)+P(SEP)+P(EN),()=>P(ABBR)+P(SEP)+P(NB),()=>P(['🔥','⚡','😎','🚗','✨','💨',''])+P(NB)+P(['🔥','⚡','😎','']),()=>P(EN).toLowerCase()+P(['_','.',''])+P(PY)];
 let k=0;while(set.size<1300&&k<60000){k++;const n=P(styles)();if(n.length>=2&&[...n].length<=12)set.add(n)}
 ['嘟嘟嘟','别撞我啊','一路向北','晚风','阿呆','小陈同学','DriftKing','Turbo','鱼丸粗面','芝士奶盖','起风了','山海','深夜飙车王666','Tom_小飞侠','不想上班的周末去兜风','车技一般般','撞墙专业户','zzz','秋名山·老司机','x_x'].forEach(x=>{if([...x].length>=1)set.add(x)});return[...set]})();
const FRAMES=['#7bd94f','#4dabf7','#b26bff','#ffc300','#ff6b9d','#ff8a2a','#39f3ff','#e8edf2'];
const RN_K='carbrawl_recentNicks';function randNick(){let r=[];try{r=JSON.parse(localStorage.getItem(RN_K)||'[]')}catch(e){}if(!Array.isArray(r))r=[];const used=new Set(r);used.add(save&&save.nick);
 let n,t=0;do{n=NICKS[Math.random()*NICKS.length|0];t++}while(used.has(n)&&t<200);r.push(n);if(r.length>400)r=r.slice(-400);try{localStorage.setItem(RN_K,JSON.stringify(r))}catch(e){}return n}
const BUBBLE={hitGood:['666','漂亮！','吃我一撞！','哈哈哈','稳！'],hurt:['给我等着！','啊这…','你别跑！','疼疼疼','记住你了'],kill:['拿下！','GG','下一个！','太简单了'],idle:['冲冲冲','谁来单挑','别躲了','🙂','👀','…'],die:['我还会回来的','GG','不服！','😭']};
let bubT=0;
function bubble(c,kind,force){if(!c||c.isP||c.dummy||!running)return;if(!force&&(time<bubT||Math.random()>.45))return;bubT=time+2.2+Math.random()*2;const L=BUBBLE[kind];c.bub={t:2,txt:L[Math.random()*L.length|0]}}
// 匹配对手（开局前 2-4 秒动画）
function matchThenStart(k,m){const cs=save.cars[k],ro=roster(cs.lv),opps=[];
 for(let i=1;i<ro.n;i++){const lv=Math.max(1,Math.min(MAXLV,cs.lv+((Math.random()*3|0)-1))),sk=aiSkill(lv);opps.push({k:KEYS[Math.random()*3|0],lv,sk,cs:aiCs(lv,sk),nick:randNick(),frame:FRAMES[Math.random()*FRAMES.length|0]})}
 hideAll();show('match',1);const el=$('match');const dur=1000+Math.random()*2000;lastMatch={dur,at:[]};
 el.innerHTML=`<div class="mt">匹配对手中<span class="dots"></span></div><div class="msub">${MAPS[m].name} · ${ro.n} 辆车</div><div class="mcards"><div class="mcard me" style="--f:#ffc300"><canvas width="96" height="72"></canvas><b>${esc(save.nick)}</b><small>Lv.${cs.lv}</small></div>${opps.map(()=>'<div class="mcard wait"><div class="spin"></div><b>…</b></div>').join('')}</div><div class="mtip">提示：用车头撞对手侧面打出暴击</div>`;
 drawFull(el.querySelector('.me canvas').getContext('2d'),k,cs,3,48,52,.32);
 const cards=[...el.querySelectorAll('.mcard.wait')];const ts=opps.map(()=>dur*(.08+Math.random()*.8)).sort((a,b)=>a-b);lastMatch.at=ts;opps.forEach((o,i)=>setTimeout(()=>{const c=cards[i];c.className='mcard in';c.style.setProperty('--f',o.frame);c.innerHTML=`<canvas width="96" height="72"></canvas><b>${esc(o.nick)}</b><small>Lv.${o.lv}</small>`;drawFull(c.querySelector('canvas').getContext('2d'),o.k,o.cs,3,48,52,.32);sfx('ui')},ts[i]));
 matchTimer=setTimeout(()=>{el.querySelector('.mt').innerHTML='匹配成功！';sfx('good');setTimeout(()=>{show('match',0);buildArena(m,arenaR(ro.n));start(k,{opps})},600)},dur)}
let matchTimer=null,lastMatch=null;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function editNick(){TextInput.open({title:'修改昵称',hint:'1-12 个字，中英文/数字/常用符号',value:save.nick,max:12,validate:v=>checkName(v,12),onOk:v=>{save.nick=v;persist();menu();toast('昵称已修改');track('nick_rename',{})}})}
// ================= 激励视频（模拟广告模块）=================
// ---- 埋点 + A/B ----
const AB=(()=>{let g=localStorage.getItem('carbrawl_ab_group');if(!g){g=Math.random()<.5?'A':'B';localStorage.setItem('carbrawl_ab_group',g)}
 const base={group:g,double:1,spin:1,chest:1,fill:1,pityN:g==='A'?6:4,fillPct:.2};// 分组差异：保底次数 A=6 / B=4
 try{Object.assign(base,JSON.parse(localStorage.getItem('carbrawl_ab')||'{}'))}catch(e){}
 const q=new URLSearchParams(location.search).get('ab');if(q)q.split(',').forEach(kv=>{const[k,v]=kv.split(':');if(k in base)base[k]=k==='group'?v:+v});return base})();
function track(event,props){const e={t:Date.now(),event,ab:AB.group,...(props||{})};try{const L=JSON.parse(localStorage.getItem('carbrawl_track')||'[]');L.push(e);if(L.length>500)L.splice(0,L.length-500);localStorage.setItem('carbrawl_track',JSON.stringify(L))}catch(x){}console.log('[track]',event,JSON.stringify(props||{}))}
// 统一接口：showRewardedAd(cb) → cb(true) 发奖 / cb(false) 中途关闭。上线抖音时替换为 tt.createRewardedVideoAd({adUnitId}) 的 show()/onClose(res.isEnded)。
// 激励视频统一走 AdAdapter（ads.js：抖音 tt 实现 / 网页模拟实现）；模拟实现的 UI 由这里注入 window.__mock
let adBusy=false;
window.__mock=res=>{const o=document.createElement('div');o.id='adMock';let t=3;o.innerHTML=`<div class="adbox"><div class="adtag">广告 · 模拟</div><div class="adart"><i></i></div><div class="adtxt">激励视频播放中…</div><div class="adcd"><b>${t}</b> 秒后可领取奖励</div><button class="adx">✕ 关闭（不发奖）</button></div>`;$('app').appendChild(o);
 const iv=setInterval(()=>{t--;if(t>0){o.querySelector('.adcd b').textContent=t;return}clearInterval(iv);o.remove();sfx('good');res(true)},1000);
 o.querySelector('.adx').onclick=()=>{clearInterval(iv);o.remove();res(false)}};
function showRewardedAd(cb0,placement){placement=placement||'unknown';if(adBusy){track('ad_busy',{placement});return}adBusy=true;track('ad_click',{placement});
 const cb=ok=>{adBusy=false;track(ok?'ad_complete':'ad_close',{placement,impl:AdAdapter.impl.name});cb0(ok)};track('ad_start',{placement});
 AdAdapter.showRewarded(placement).then(cb,()=>cb(false))}
let lastGot=null;
function grantShards(id,n,got){const p=PARTS[id];for(let i=0;i<n;i++){if(save.owned[id]){save.uni+=UNI[p.r];got.uni=(got.uni||0)+UNI[p.r]}else{save.shards[id]=(save.shards[id]||0)+1;got[id]=(got[id]||0)+1}}}
function rollPart(){const q=Math.random(),r=q<.6?'w':q<.88?'b':q<.97?'p':'g',pl=Object.keys(PARTS).filter(id=>PARTS[id].r===r);return pl[Math.random()*pl.length|0]}
const gotHTML=got=>(got._pity?'<div class="dbl">★ 心愿保底触发</div>':'')+Object.entries(got).filter(([k])=>k!=='_pity').map(([k,v],i)=>`<span class="drop" style="animation-delay:${.15+i*.1}s">${k==='coins'?icCoin('+'+v):k==='uni'?icUni('+'+v):k.startsWith('liv:')||k.startsWith('col:')?`<span class="ic r-g livic"><i></i><em>🎨</em></span>`:icPart(k,'+'+v,true)}<small>${k==='coins'?'金币':k==='uni'?'通用碎片':k.startsWith('col:')?'传说 '+COLORS[k.slice(4)].n:k.startsWith('liv:')?'限定 '+LIVS[k.slice(4)].n:save.shards[k]+'/'+PARTS[k].need}</small></span>`).join('');
$('rDouble').onclick=()=>{if(!lastGot)return;showRewardedAd(ok=>{if(!ok){toast('未看完，没有奖励');return}const g2={};for(const[k,v] of Object.entries(lastGot)){if(k==='uni'){save.uni+=v;g2.uni=(g2.uni||0)+v}else grantShards(k,v,g2)}persist();lastGot=null;
 $('rDouble').disabled=true;$('rDouble').textContent='✓ 已翻倍';$('rShards').insertAdjacentHTML('beforeend','<div class="dbl">翻倍追加</div>'+gotHTML(g2));track('reward_grant',{placement:'result_double',got:g2});toast('碎片已翻倍！')},'result_double')};
// ---- 每日福利：抽奖 + 宝箱 ----
const DAY_FREE=3,DAY_AD_SPIN=5,DAY_CHEST=3;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function daily(){if(!save.daily||save.daily.d!==today())save.daily={d:today(),free:DAY_FREE,adSpin:0,chest:0,fill:0};return save.daily}
const POOL=[{w:26,k:'coins',v:50},{w:14,k:'coins',v:120},{w:4,k:'coins',v:300},{w:18,k:'uni',v:3},{w:8,k:'uni',v:8},{w:22,k:'shard',v:2},{w:5,k:'shard',v:5},{w:3,k:'liv'}];
function wishOk(){return save.wish&&PARTS[save.wish]&&!save.owned[save.wish]}
function pityPre(got){if(wishOk()&&(save.pity||0)>=AB.pityN-1){grantShards(save.wish,3,got);got._pity=1}}
function pityPost(got){if(!wishOk())return;if(got[save.wish])save.pity=0;else save.pity=(save.pity||0)+1}
function spinOnce(){let q=Math.random()*POOL.reduce((a,p)=>a+p.w,0),it=POOL[0];for(const p of POOL){q-=p.w;if(q<=0){it=p;break}}const got={};
 if(it.k==='coins'){save.coins+=it.v;got.coins=it.v}else if(it.k==='uni'){save.uni+=it.v;got.uni=it.v}else if(it.k==='shard')grantShards(rollPart(),it.v,got);
 else{const lim=Object.keys(LIVS).filter(l=>LIVS[l].lim&&!save.livs[l]);if(lim.length){const l=lim[Math.random()*lim.length|0];save.livs[l]=true;got['liv:'+l]=1}else{save.coins+=300;got.coins=300}}
 if(!got._pity)pityPre(got);pityPost(got);persist();return got}
function openChest(){const got={},n=5+(Math.random()*4|0);pityPre(got);for(let i=0;i<n;i++)grantShards(rollPart(),1,got);pityPost(got);persist();return got}
function openDaily(){hideAll();show('daily',1);renderDaily()}
function renderDaily(res){const d=daily();persist();
 $('daily').innerHTML=`<div class="rcard dl"><div class="ptitle">🎁 每日福利</div><div class="dcols">
 <div class="dcol"><div class="dh">幸运抽奖</div><div class="wheel">${POOL.map(p=>`<span>${p.k==='coins'?icCoin(p.v):p.k==='uni'?icUni(p.v):p.k==='shard'?`<span class="icw"><span class="ic r-b sh"><i style="background-position:${4/7*100}% 0"></i><b>×${p.v}</b></span><em class="lbl">随机碎片</em></span>`:'<span class="icw"><span class="ic r-g livic"><i></i><em>🎨</em><b>限定</b></span><em class="lbl">限定涂装</em></span>'}</span>`).join('')}</div>
  <button class="btn" id="dSpin" ${d.free<=0?'disabled':''}>免费抽 ${d.free}/${DAY_FREE}</button><button class="btn ghost" id="dAdSpin" ${d.free>0||d.adSpin>=DAY_AD_SPIN?'disabled':''}>📺 看视频再抽 ${DAY_AD_SPIN-d.adSpin}/${DAY_AD_SPIN}</button><small>奖池：金币、通用碎片、随机部件碎片、<b>限定涂装</b>（鎏金条纹/霓虹腰线/烈焰号码）</small></div>
 <div class="dcol"><div class="dh">碎片宝箱</div><div class="chest">🧰</div><button class="btn" id="dChest" ${d.chest>=DAY_CHEST?'disabled':''}>📺 看视频开箱 ${DAY_CHEST-d.chest}/${DAY_CHEST}</button><small>每箱 5-8 片<b>随机</b>部件碎片（已拥有自动转通用）</small></div></div>
 <div class="wishline">${wishOk()?`心愿 ${icPart(save.wish,undefined,false,true)} <b>${PARTS[save.wish].n}</b> · 保底 ${save.pity||0}/${AB.pityN}（连续未出则下次必出）`:'在车库部件列表点 ☆ 标记心愿部件，抽奖/宝箱有保底'}</div>${res?`<div class="dresPop"><div class="dresIn"><div class="dh">🎉 获得</div><div class="dres">${gotHTML(res)}</div><button class="btn sm" onclick="this.closest('.dresPop').remove()">好的</button></div></div>`:''}<button class="btn ghost" id="dBack">← 返回</button></div>`;
 $('dBack').onclick=()=>menu();if(!AB.spin)$('dAdSpin').remove();if(!AB.chest)$('dChest').closest('.dcol').remove();['dAdSpin','dChest'].forEach(i=>{const e=$(i);if(e&&!e.disabled)track('ad_entry_show',{placement:i==='dChest'?'chest':'daily_ad_spin'})});
 $('dSpin').onclick=()=>{const d=daily();if(d.free<=0)return;d.free--;const g=spinOnce();track('reward_grant',{placement:'daily_free_spin',got:g});sfx('good');renderDaily(g)};
 $('dAdSpin').onclick=()=>showRewardedAd(ok=>{if(!ok)return toast('未看完，没有奖励');const d=daily();if(d.adSpin>=DAY_AD_SPIN)return;d.adSpin++;const g=spinOnce();track('reward_grant',{placement:'daily_ad_spin',got:g});renderDaily(g)},'daily_ad_spin');
 $('dChest').onclick=()=>showRewardedAd(ok=>{if(!ok)return toast('未看完，没有奖励');const d=daily();if(d.chest>=DAY_CHEST)return;d.chest++;const g=openChest();track('reward_grant',{placement:'chest',got:g});renderDaily(g)},'chest')}
$('menuDaily').onclick=openDaily;$('menuNick').onclick=editNick;
$('menuSet').onclick=()=>openSettings('menu');$('menuGarage').onclick=()=>openGarage(gKey);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)togglePause()});
// ================= 主循环 + 自动降画质 =================
let last=performance.now(),fpsN=0,fpsT=0,lowStreak=0;
let frameDt=.016;
function loop(now){requestAnimationFrame(loop);const raw=(now-last)/1000;let dt=Math.min(raw,.05);last=now;frameDt=dt;
 if(save.settings.quality==='auto'&&running&&!paused){fpsN++;fpsT+=raw;if(fpsT>2){const fps=fpsN/fpsT;fpsN=0;fpsT=0;if(fps<44&&QL==='high'){if(++lowStreak>=1){QL='low';resize();toast('帧率偏低，已自动降低画质')}}else lowStreak=0}}
 if(paused){render();engineUpd();return}
 if(hitstop>0){hitstop-=dt;dt=0}
 if(cars.length&&dt>0){step(dt/2);step(dt/2)}
 updParts(Math.min(raw,.05));shake=Math.max(0,shake-FEEL.shakeDecay*Math.min(raw,.05));
 if(floor)render();hud();engineUpd();
 if(!$('garage').classList.contains('hide')){const c=$('gPrev');if(c){const x=c.getContext('2d'),i=Math.floor(now/(window.__pv&&__pv()?320:180))%16;x.clearRect(0,0,300,220);drawFull(x,gKey,save.cars[gKey],i,150,140,1.25,Math.floor(now/60)%3)}}}
// ================= 菜单 =================
function menu(){hideAll();if(!save.nick){save.nick=randNick();persist()}$('nickTxt').textContent=save.nick;setTimeout(auStatus,0);running=false;if(!KEYS.includes(gKey))gKey=KEYS[0];
 $('menuCoins').innerHTML=icCoin(save.coins)+icUni(save.uni);show('menu',1);if(window.menuRefresh)menuRefresh();if(saveWarn){toast(saveWarn);saveWarn=''}}
$('again').onclick=()=>{buildArena(mapKey,arenaR(roster(save.cars[playerKey].lv).n));start(playerKey)};$('back').onclick=()=>{cars=[];player=null;menu()};$('toGarage').onclick=()=>{cars=[];player=null;openGarage(playerKey)};
(async()=>{for(const k of KEYS){[BASE[k],PAINT[k],WHL[k],LINES[k]]=await Promise.all(['base','paint','wheels','lines'].map(n=>loadImg('sprites/car_'+k+'_'+n+'.png?v='+ASSET_V)));await Promise.all([...Object.keys(PARTS).map(p=>'part_'+p),...Object.keys(LIVS).filter(l=>!LIVS[l].src).map(l=>'liv_'+l)].map(n=>loadImg('sprites/car_'+k+'_'+n+'.png?v='+ASSET_V).then(im=>LAYI[k+'_'+n]=im)));const hb=mkC(F*2,F*2);hb.getContext('2d').drawImage(BASE[k],0,0,F*2,F*2);WHITE[k]=tint(hb,'#ffffff',.85);DARK[k]=tint(hb,'#1b1420',.6)}
 buildArena('site',38);show('loading',0);if(!save.tutorialDone){hideAll();start('beast',{tutorial:true})}else menu();requestAnimationFrame(loop)})();
window.__game={get DPR(){return DPR},get Z(){return Z},get camX(){return camX},FEEL,get camZ(){return camZ},keys,NICKS,randNick,get lastMatch(){return lastMatch},matchThenStart,editNick,get nick(){return save.nick},audioLevel,sfx,get AU(){return AU},auUnlock,AB,track,openChest,spinOnce,renderGarage,openDaily,showRewardedAd,daily,openCell,sdist,arenaR,get GRID(){return GRID},get rescueLog(){return rescueLog},get ZC(){return ZC},get ZPOLY(){return ZPOLY},cellOf,set noEnd(v){noEnd=v},set testInp(v){testInp=v},get player(){return player},get stuckLog(){return stuckLog},get props(){return props},get POLY(){return POLY},start,finish,openGarage,openMaps,buildArena,get cars(){return cars},get time(){return time},set time(v){time=v},get save(){return save},get tut(){return tut},get QL(){return QL}};
