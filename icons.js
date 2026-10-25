// v32 图标 + 交互层：自绘 SVG 图标集（内联 sprite，24×24，2px 圆角线条 + 同色半透明填充，统一色板），
// 把界面里的系统 emoji/符号换成图标；点击高光波纹；奖励金币飞入。纯表现层，不改游戏逻辑/DOM 结构：
// emoji 文字原样保留在隐藏的 <i class="eg"> 里，textContent 不变（测试选择器、文本判断都不受影响）。
// 参数在 tune.js 的 ui.*；ui.on=false 则整层关闭（回到系统 emoji）。画布里的飘字/气泡不在 DOM，不处理。
(()=>{'use strict';
const U=(window.TUNE&&TUNE.ui)||{on:true,rip:true,fly:true};if(!U.on)return;
const f='class="f"',k='class="k"';
// ---- 图标（symbol 内：.f=半透明填充，.k=实心；其余为描边） ----
const I={
 warn:`<path ${f} d="M12 3.5 21.5 20h-19z"/><path d="M12 10v4.5M12 17.3v.1"/>`,
 burst:`<polygon class="f" points="12,2.5 14.3,8 20,5.5 17.5,11 21.5,14 15.5,14.7 15,21 12,16.7 9,21 8.5,14.7 2.5,14 6.5,11 4,5.5 9.7,8" stroke-linejoin="round"/>`,
 flag:`<path d="M5 21V3.5"/><path ${f} d="M5 4.5h14l-3 4 3 4H5z"/><path d="M10 4.5v8M15 4.5v8" stroke-width="1.2" opacity=".6"/>`,
 tv:`<rect ${f} x="3" y="5" width="18" height="12.5" rx="3"/><path ${k} d="M10.3 8.8v5.4l4.6-2.7z"/><path d="M8.5 21h7"/>`,
 gift:`<rect ${f} x="4" y="10.5" width="16" height="10" rx="2"/><rect ${f} x="3" y="7" width="18" height="4" rx="1.5"/><path d="M12 7v13.500M12 7C10.200 3 6 3.800 8 6.600M12 7c1.800-4 6-3.200 4-.4"/>`,
 flame:`<path ${f} d="M12 21.500c-4 0-6.500-2.800-6.500-6.200 0-3 2-4.800 3.400-7 .5 1.500 1.300 2.300 2.200 2.800C11 7 12 4.500 13.200 2.500c.3 3.200 4.300 5.200 4.300 11.300 0 4-2.200 7.700-5.500 7.700z"/><path d="M12 20c-1.800 0-3-1.200-3-2.800 0-1.600 1.600-2.400 2.200-4 1.600 1.200 3.800 2.200 3.800 4.400 0 1.500-1.200 2.400-3 2.400z" opacity=".7"/>`,
 trophy:`<path ${f} d="M7 4h10v5.500a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.500a3 3 0 0 0 3 3M17 6h3v1.500a3 3 0 0 1-3 3M12 14.500v3M8 20.500h8M9.500 17.500h5"/>`,
 bolt:`<path ${f} d="M13.500 2.500 5 13.500h6l-1 8 8.500-11.500h-6.200z"/>`,
 car:`<path ${f} d="M3 14.500l1.700-4.700A2 2 0 0 1 6.600 8.500h10.800a2 2 0 0 1 1.900 1.300L21 14.500V18a1 1 0 0 1-1 1h-1.500a1 1 0 0 1-1-1v-1h-11v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3.500 14.500h17"/><circle ${k} cx="7.200" cy="12.200" r="1"/><circle ${k} cx="16.800" cy="12.200" r="1"/>`,
 wrench:`<path ${f} d="M14.500 6.200a4 4 0 0 0-5.100 5.100l-5.900 5.900a1.900 1.900 0 0 0 2.700 2.700l5.900-5.900a4 4 0 0 0 5.100-5.100l-2.600 2.600-2.300-.6-.6-2.300z"/>`,
 users:`<circle ${f} cx="9" cy="8" r="3.200"/><path ${f} d="M3.200 19.500c0-3.300 2.600-5.500 5.800-5.500s5.800 2.200 5.800 5.500z"/><path d="M15.500 5.200a3 3 0 0 1 0 5.700M17.500 14.300c2 .6 3.300 2.400 3.300 5.200h-3"/>`,
 box:`<path ${f} d="M12 3 20.500 7.500v9L12 21l-8.500-4.500v-9z"/><path d="M3.500 7.500 12 12l8.500-4.500M12 12v9"/>`,
 crown:`<path ${f} d="M3.500 18.500 2.500 7.500l5 4 4.500-7 4.500 7 5-4-1 11z"/><path d="M4.500 21.500h15"/>`,
 clip:`<rect ${f} x="5" y="4" width="14" height="17" rx="2.500"/><rect ${f} x="9" y="2.500" width="6" height="3.500" rx="1.200"/><path d="M8.500 11h7M8.500 14.500h7M8.500 18h4"/>`,
 star:`<path ${f} d="M12 3l2.800 5.800 6.400.9-4.600 4.500 1.100 6.300L12 17.500l-5.700 3 1.100-6.300L2.800 9.700l6.400-.9z"/>`,
 star0:`<path d="M12 3l2.800 5.800 6.400.9-4.600 4.500 1.100 6.300L12 17.500l-5.700 3 1.100-6.300L2.800 9.700l6.400-.9z"/>`,
 spk:`<path ${f} d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z"/><path d="M15.500 9a4 4 0 0 1 0 6M18 6.500a8 8 0 0 1 0 11"/>`,
 spk1:`<path ${f} d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z"/><path d="M15.500 9a4 4 0 0 1 0 6"/>`,
 spk0:`<path ${f} d="M4 9.500h3.500L12 6v12l-4.500-3.500H4z"/><path d="M16 9.500l5 5M21 9.500l-5 5"/>`,
 pencil:`<path ${f} d="M4 20l1-4.500L16.500 4a2.100 2.100 0 0 1 3 3L8 18.500z"/><path d="M14.500 6l3 3"/>`,
 book:`<path ${f} d="M4 5.500C4 4.700 4.700 4 5.500 4H11a1 1 0 0 1 1 1v15c0-.8-.6-1.500-1.500-1.500h-5A1.500 1.500 0 0 1 4 17zM20 5.500c0-.8-.7-1.500-1.500-1.500H13a1 1 0 0 0-1 1v15c0-.8.6-1.500 1.500-1.500h5a1.500 1.500 0 0 0 1.500-1.500z"/>`,
 bulb:`<path ${f} d="M12 3a6 6 0 0 0-3.500 10.900c.6.5 1 1.200 1 2h5c0-.8.4-1.500 1-2A6 6 0 0 0 12 3z"/><path d="M9.500 18.500h5M10.500 21h3"/>`,
 up:`<path d="M12 20V5M5.500 11.500 12 5l6.500 6.500" stroke-width="2.600"/>`,
 dice:`<rect ${f} x="3.500" y="3.500" width="17" height="17" rx="4.500"/><circle ${k} cx="8.500" cy="8.500" r="1.300"/><circle ${k} cx="15.500" cy="8.500" r="1.300"/><circle ${k} cx="12" cy="12" r="1.300"/><circle ${k} cx="8.500" cy="15.500" r="1.300"/><circle ${k} cx="15.500" cy="15.500" r="1.300"/>`,
 medal:`<path d="M8 3l4 6.500L16 3"/><circle ${f} cx="12" cy="15" r="6"/><path d="M12 12v6" stroke-width="2.200"/>`,
 shield:`<path ${f} d="M12 3 20 6v6c0 4.500-3.200 7.800-8 9-4.800-1.200-8-4.500-8-9V6z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>`,
 vortex:`<path d="M20.500 12A8.500 8.500 0 0 0 12 3.500 6.500 6.500 0 0 0 5.500 10 4.500 4.500 0 0 0 10 14.500a2.500 2.500 0 0 0 2.500-2.500"/><path d="M3.500 12A8.500 8.500 0 0 0 12 20.500"/>`,
 spark:`<path ${f} d="M12 2.500c.8 4.700 2.800 6.700 7.500 7.500-4.700.8-6.700 2.800-7.500 7.500-.8-4.700-2.800-6.700-7.500-7.500 4.700-.8 6.700-2.800 7.500-7.500z"/><path d="M19 17v4M17 19h4"/>`,
 spark4:`<path ${f} d="M12 3c.9 5 3 7.100 8 8-5 .9-7.100 3-8 8-.9-5-3-7.100-8-8 5-.9 7.100-3 8-8z"/>`,
 check:`<path d="M5 12.500l4.500 4.500L19 7.500" stroke-width="2.800"/>`,
 smile:`<circle ${f} cx="12" cy="12" r="9"/><circle ${k} cx="9" cy="10" r="1.100"/><circle ${k} cx="15" cy="10" r="1.100"/><path d="M8 14c1 2.200 2.600 3 4 3s3-.8 4-3"/>`,
 cry:`<circle ${f} cx="12" cy="12" r="9"/><circle ${k} cx="9" cy="10" r="1.100"/><circle ${k} cx="15" cy="10" r="1.100"/><path d="M8.500 16.500c1-1.500 2.200-2 3.500-2s2.500.5 3.500 2M8 12.500v3"/>`,
 cool:`<circle ${f} cx="12" cy="12" r="9"/><path ${k} d="M6 9.500h5v3.200H6zM13 9.500h5v3.200h-5z"/><path d="M11 10.500h2M8.500 16c1 1.200 2.200 1.800 3.500 1.800s2.500-.6 3.500-1.800"/>`,
 wind:`<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a2.500 2.500 0 1 1-2.500 2.500"/>`,
 eyes:`<ellipse ${f} cx="7.500" cy="12" rx="4.300" ry="5.200"/><ellipse ${f} cx="16.500" cy="12" rx="4.300" ry="5.200"/><circle ${k} cx="8.500" cy="12.500" r="1.800"/><circle ${k} cx="15.500" cy="12.500" r="1.800"/>`,
 palette:`<path ${f} d="M12 3a9 9 0 0 0 0 18c1.500 0 2-1 1.600-2-.5-1.200.3-2.500 1.700-2.500H18a3 3 0 0 0 3-3A9.500 9.500 0 0 0 12 3z"/><circle ${k} cx="7.500" cy="11" r="1.200"/><circle ${k} cx="10" cy="7" r="1.200"/><circle ${k} cx="15" cy="7.200" r="1.200"/>`,
 x:`<path d="M6 6l12 12M18 6 6 18" stroke-width="2.800"/>`,
 pause:`<rect ${k} x="6.500" y="5" width="3.800" height="14" rx="1.300"/><rect ${k} x="13.700" y="5" width="3.800" height="14" rx="1.300"/>`,
 play:`<path ${k} d="M8 5.500v13l11-6.500z" stroke-linejoin="round"/>`,
 arr:`<path d="M4 12h15M13 6l6 6-6 6" stroke-width="2.400"/>`,
 arl:`<path d="M20 12H5M11 6l-6 6 6 6" stroke-width="2.400"/>`,
 chr:`<path d="M9 4.500l7.500 7.500L9 19.500" stroke-width="3"/>`,
 chl:`<path d="M15 4.500 7.500 12l7.500 7.500" stroke-width="3"/>`,
 phone:`<rect ${f} x="7" y="2.500" width="10" height="19" rx="2.800"/><path d="M11 18.500h2"/>`,
 twister:`<path d="M4 5h16M6 9h12M8.500 13h7M10.500 17h3M12 20.500v.1" stroke-width="2.300"/>`,
 rocket:`<path ${f} d="M12 2.500c3.500 2 5 6 4.500 10l-2.200 2.200H9.700L7.500 12.500C7 8.500 8.500 4.500 12 2.500z"/><circle cx="12" cy="9" r="1.800"/><path d="M7.500 12.500 4.500 15l.8 3.500L9 16M16.500 12.500l3 2.500-.8 3.500L15 16M12 17.500v4"/>`,
 bomb:`<circle ${f} cx="10.500" cy="14" r="7"/><path d="M15 8.500l2-2 1.500-1M19.500 3.500v.1M7.500 12a3.500 3.500 0 0 1 2-2"/>`,
 barrel:`<ellipse ${f} cx="12" cy="6" rx="7" ry="2.500"/><path ${f} d="M5 6v12c0 1.400 3.100 2.500 7 2.500s7-1.100 7-2.500V6c0 1.400-3.100 2.500-7 2.500S5 7.400 5 6z"/><path d="M5 12c0 1.400 3.100 2.500 7 2.500s7-1.100 7-2.500"/>`,
 magnet:`<path ${f} d="M5 4v8a7 7 0 0 0 14 0V4h-4.500v8a2.500 2.500 0 0 1-5 0V4z"/><path d="M5 8h4.500M14.500 8H19"/>`,
 pad:`<path ${f} d="M7 8h10a4.500 4.500 0 0 1 4.400 5.400l-.9 4a2.300 2.300 0 0 1-4 .8L14.300 16h-4.600L7.500 18.200a2.300 2.300 0 0 1-4-.8l-.9-4A4.500 4.500 0 0 1 7 8z"/><path d="M8 10.500v3M6.500 12h3"/><circle ${k} cx="15.500" cy="11" r="1"/><circle ${k} cx="17.500" cy="13" r="1"/>`,
 link:`<path d="M10 14a3.500 3.500 0 0 0 5 0l3.200-3.200a3.500 3.500 0 0 0-5-5L12 7M14 10a3.500 3.500 0 0 0-5 0l-3.200 3.200a3.500 3.500 0 0 0 5 5L12 17"/>`,
 target:`<circle ${f} cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.200"/><circle ${k} cx="12" cy="12" r="1.600"/>`,
 puzzle:`<path ${f} d="M10 4.500a2 2 0 0 1 4 0V6h4a1 1 0 0 1 1 1v4h-1.500a2 2 0 0 0 0 4H19v4a1 1 0 0 1-1 1h-4v-1.500a2 2 0 0 0-4 0V20H6a1 1 0 0 1-1-1v-4h1.500a2 2 0 0 0 0-4H5V7a1 1 0 0 1 1-1h4z"/>`,
 heart:`<path ${f} d="M12 20.500C5 15.500 3 11.500 3 8.700A4.700 4.700 0 0 1 12 6.600a4.700 4.700 0 0 1 9 2.100c0 2.800-2 6.800-9 11.800z"/>`,
 heartb:`<path ${f} d="M12 20.500C5 15.500 3 11.500 3 8.700A4.700 4.700 0 0 1 12 6.600a4.700 4.700 0 0 1 9 2.100c0 2.800-2 6.800-9 11.800z"/><path d="M12 6.600l-2 4 3 2-2 4.500"/>`,
 note:`<path d="M9 17.500V5.500l10-2v12"/><circle ${f} cx="6.500" cy="17.500" r="2.500"/><circle ${f} cx="16.500" cy="15.500" r="2.500"/>`,
 lock:`<rect ${f} x="5" y="10.500" width="14" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500M12 14.500v2.500"/>`,
 tools:`<rect ${f} x="3" y="8" width="18" height="12" rx="2.500"/><path d="M9 8V6a1.500 1.500 0 0 1 1.500-1.500h3A1.500 1.500 0 0 1 15 6v2M3 13h18M11 12v3h2v-3"/>`,
 party:`<path ${f} d="M4 20 8.500 8l7.500 7.500z"/><path d="M14 4v2.500M19.500 8.500H17M18 3.500l-1.500 1.500M17.500 13l2.200.5"/>`,
 refresh:`<path d="M20 12a8 8 0 0 1-14 5.300M4 12a8 8 0 0 1 14-5.300M18.500 3v4h-4M5.500 21v-4h4"/>`,
 rain:`<path ${f} d="M7 15.500a4 4 0 0 1-.4-8 5.500 5.500 0 0 1 10.600 1.300A3.400 3.400 0 0 1 17 15.500z"/><path d="M8.500 18.500l-1 2M12.500 18.500l-1 2M16.500 18.500l-1 2"/>`,
 dot:`<circle ${k} cx="12" cy="12" r="6"/>`,
 timer:`<circle ${f} cx="12" cy="13.500" r="7.500"/><path d="M12 9.500v4l2.500 1.500M10 2.500h4M12 2.500V6"/>`,
 gear:`<circle cx="12" cy="12" r="8.400" stroke-width="3" stroke-dasharray="3.100 3.250"/><circle ${f} cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.300"/>`,
 ring:`<circle cx="12" cy="12" r="7.500" stroke-width="3.400"/>`,
 tup:`<path class="k" d="M12 6.500 19 17.500H5z" stroke-linejoin="round"/>`,
 tdn:`<path class="k" d="M12 17.500 5 6.500h14z" stroke-linejoin="round"/>`,
 share:`<path d="M12 15V4M7.500 8.500 12 4l4.500 4.500M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" stroke-width="2.200"/>`,
 dl:`<path d="M12 4v11M7 10.500l5 5 5-5M5 20h14" stroke-width="2.300"/>`
};
// ---- emoji/符号 → [图标, 描边色]（按钮/筹码内自动改成单色 currentColor，空地上用彩色） ----
const M={'⚠':['warn','#ffb020'],'💥':['burst','#ff7a2f'],'🏁':['flag','#e8ecff'],'📺':['tv','#7ee0ff'],'🎁':['gift','#ff6b9d'],'🔥':['flame','#ff7a2f'],'🏆':['trophy','#ffd23f'],'⚡':['bolt','#ffe14d'],'🚗':['car','#9fd0ff'],'🔧':['wrench','#b9c6ee'],'⚒':['wrench','#b9c6ee'],'👥':['users','#9fd0ff'],'🤝':['link','#9fd0ff'],'📦':['box','#e0a864'],'👑':['crown','#ffd23f'],'📋':['clip','#9fe2b4'],'★':['star','#ffd23f'],'⭐':['star','#ffd23f'],'☆':['star0','#ffd23f'],'🔊':['spk','#ffffff'],'🔈':['spk1','#ffffff'],'🔇':['spk0','#c7ccdd'],'✏':['pencil','#ffd23f'],'📖':['book','#b9a8ff'],'💡':['bulb','#ffe14d'],'⬆':['up','#7dffa8'],'🎰':['dice','#ff6b9d'],'🥇':['medal','#ffd23f'],'🥈':['medal','#cfd6e6'],'🥉':['medal','#d98a4a'],'🛡':['shield','#7ee0ff'],'🌀':['vortex','#7ee0ff'],'✨':['spark','#ffe14d'],'✦':['spark4','#ffe14d'],'✓':['check','#7dffa8'],'✔':['check','#7dffa8'],'😎':['cool','#ffd23f'],'😭':['cry','#7ee0ff'],'🙂':['smile','#ffd23f'],'💨':['wind','#cfe8ff'],'👀':['eyes','#e8ecff'],'🎨':['palette','#ff9be0'],'✖':['x','#ff6b6b'],'✕':['x','#ff6b6b'],'❚❚':['pause','currentColor'],'👉':['arr','#ffd23f'],'👈':['arl','#ffd23f'],'📱':['phone','#e8ecff'],'🌪':['twister','#cfe8ff'],'🚀':['rocket','#ff9f6b'],'💣':['bomb','#c7ccdd'],'🛢':['barrel','#ff7a2f'],'🧲':['magnet','#ff6b6b'],'🎮':['pad','#b9a8ff'],'🎯':['target','#ff6b6b'],'🧩':['puzzle','#7dffa8'],'♥':['heart','#ff6b8a'],'♪':['note','#b9a8ff'],'🔒':['lock','#c7ccdd'],'🧰':['tools','#ff9f6b'],'🎉':['party','#ffd23f'],'🔄':['refresh','#7ee0ff'],'🌧':['rain','#9fd0ff'],'🔵':['dot','#4d9fff'],'🔴':['dot','#ff5c5c'],'💔':['heartb','#ff6b8a'],'⏱':['timer','#e8ecff'],'⚙':['gear','#c7ccdd'],'⬇':['dl','currentColor'],'⭕':['ring','#ff5c5c'],'▲':['tup','currentColor'],'▼':['tdn','currentColor'],'▾':['tdn','currentColor'],'↗':['share','currentColor'],'→':['arr','currentColor'],'‹':['chl','currentColor'],'›':['chr','currentColor'],'←':['arl','currentColor'],'▶':['play','currentColor']};
const keys=Object.keys(M).sort((a,b)=>b.length-a.length);
const RE=new RegExp('('+keys.map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?','g');
const NS='http://www.w3.org/2000/svg';
// sprite 注入
const sp=document.createElementNS(NS,'svg');sp.setAttribute('width','0');sp.setAttribute('height','0');sp.setAttribute('aria-hidden','true');sp.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
sp.innerHTML=Object.keys(I).map(n=>`<symbol id="i-${n}" viewBox="0 0 24 24">${I[n]}</symbol>`).join('');document.body.appendChild(sp);
let made=0;
function mk(ch){const [n,c]=M[ch.replace(/\uFE0F/g,'')]||[];if(!n)return null;const e=document.createElement('span');e.className='em';e.dataset.e=ch;e.style.setProperty('--s2',c);e.style.setProperty('--f2',c==='currentColor'?'currentColor':c);
 const g=document.createElement('eg');g.className='eg';g.textContent=ch;const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const u=document.createElementNS(NS,'use');u.setAttribute('href','#i-'+n);s.appendChild(u);e.append(g,s);made++;return e}
const SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|CANVAS|TITLE|svg)$/i;
function wrap(t){if(!t.parentNode||t.parentNode.closest&&t.parentNode.closest('.em,svg'))return;const s=t.data;RE.lastIndex=0;if(!RE.test(s))return;RE.lastIndex=0;
 const fr=document.createDocumentFragment();let i=0,m;while((m=RE.exec(s))){if(m.index>i)fr.append(s.slice(i,m.index));const e=mk(m[0]);fr.append(e||m[0]);i=m.index+m[0].length}if(i<s.length)fr.append(s.slice(i));t.replaceWith(fr)}
function scan(root){if(!root)return;if(root.nodeType===3){wrap(root);return}if(root.nodeType!==1||SKIP.test(root.tagName)||root.classList.contains('em'))return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>SKIP.test(n.parentNode.tagName)||n.parentNode.closest('.em')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),L=[];while(w.nextNode())L.push(w.currentNode);L.forEach(wrap)}
const app=document.getElementById('app')||document.body;scan(app);
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){if(m.target.data&&!m.target.parentNode.closest('.em'))wrap(m.target)}else for(const n of m.addedNodes)scan(n)}}).observe(app,{childList:true,subtree:true,characterData:true});
// ---- 危险按钮：退出/放弃 等不可逆操作统一红色（只加 class） ----
['#pQuit','#rvNo'].forEach(s=>{const e=document.querySelector(s);if(e)e.classList.add('danger')});
// ---- 点击高光：pointerdown 记坐标，加 .rp 播一次扩散（CSS ::after，动画结束摘 class） ----
const RIP='.btn,.modesel button,.tab,.rt,.seg button,.lv2,.sw2,.mini,.gsh,.pchip,.marr';
if(U.rip!==false)document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest(RIP);if(!b||b.disabled)return;const r=b.getBoundingClientRect(),z=r.width?b.offsetWidth/r.width:1;b.style.setProperty('--rx',((e.clientX-r.left)*z|0)+'px');b.style.setProperty('--ry',((e.clientY-r.top)*z|0)+'px');b.classList.remove('rp');void b.offsetWidth;b.classList.add('rp');
 setTimeout(()=>b.classList.remove('rp'),480)},true);
// ---- 奖励金币飞入：金币堆从来源飞到金币筹码（transform+opacity，最多 N 颗，一次性） ----
function tgt(){for(const s of['#menuCoins','#garage .uni','.coinchip']){const e=document.querySelector(s);if(e&&e.offsetParent)return e}return null}
function fly(src,n){if(U.fly===false)return;const t=tgt();if(!t)return;const a=src&&src.getBoundingClientRect?src.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0},b=t.getBoundingClientRect();
 const sx=a.left+a.width/2,sy=a.top+a.height/2,tx=b.left+b.width/2,ty=b.top+b.height/2,N=Math.min(U.flyN||8,Math.max(3,n|0||5)),box=document.createElement('div');box.className='flyc';
 for(let i=0;i<N;i++){const c=document.createElement('i');c.style.cssText=`left:${sx}px;top:${sy}px;--ox:${(Math.random()-.5)*70|0}px;--oy:${(Math.random()-.5)*50|0}px;--dx:${(tx-sx)|0}px;--dy:${(ty-sy)|0}px;animation-delay:${i*45}ms`;box.appendChild(c)}
 document.body.appendChild(box);t.classList.add('bump');setTimeout(()=>t.classList.remove('bump'),N*45+900);setTimeout(()=>box.remove(),N*45+1000)}
window.flyCoins=fly;
// 触发点：金币滚动（coinRoll 增加时）、每日福利/抽奖结果弹层、购买庆祝弹层
if(typeof coinRoll==='function'){const _cr=coinRoll;window.coinRoll=coinRoll=function(a,b){if(b>a)fly(document.querySelector('#garage .buyfx,#garage .gl,#menu .mcar'),Math.min(8,Math.ceil((b-a)/30)));return _cr.apply(this,arguments)}}
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1&&n.classList&&n.classList.contains('dresPop')&&/金币|coin/i.test(n.textContent))fly(n.querySelector('.dresIn')||n,6)}).observe(app,{childList:true,subtree:true});
// 音量滑条：已填充段颜色（CSS 变量 --pv）
const rg=document.getElementById('sVol');if(rg){const up=()=>rg.style.setProperty('--pv',((rg.value-rg.min)/(rg.max-rg.min)*100)+'%');rg.addEventListener('input',up);const st=document.getElementById('settings');if(st)new MutationObserver(up).observe(st,{attributes:true,attributeFilter:['class']});up()}
window.__icons={names:Object.keys(I),map:M,made:()=>made,scan,wrap};
})();
