// 模块 skin-patterns（原 v18）花纹涂装：稀有图案（迷彩×3/火焰/斑马/碳纤维/数码/虎纹/v29 格旗/豹纹）+ 传说动态（幻彩/霓虹流光/金属电镀/熔岩/v29 星空）
(()=>{const RAR=k=>COLORS[k].rar||'n';
// ---- 图案纹理（世界空间，沿车头方向 +x），一次生成缓存 ----
const TEX={};function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function tex(id){if(TEX[id])return TEX[id];const S=256,c=mkC(S,S),x=c.getContext('2d'),C=COLORS[id],r=rng(id.length*977+13);
 if(C.pat==='camo'){x.fillStyle=C.cols[0];x.fillRect(0,0,S,S);for(let L=1;L<C.cols.length;L++){x.fillStyle=C.cols[L];for(let n=0;n<14;n++){const cx=r()*S,cy=r()*S,rr=14+r()*26;x.beginPath();for(let k=0;k<9;k++){const a=k/9*Math.PI*2,q=rr*(.6+r()*.6);for(const ox of[-S,0,S])for(const oy of[-S,0,S]){}x.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q)}x.closePath();x.fill();
   // 平铺：四边各补一份
   for(const[ox,oy]of[[S,0],[-S,0],[0,S],[0,-S]]){x.save();x.translate(ox,oy);x.fill();x.restore()}}}}
 else if(C.pat==='zebra'){x.fillStyle='#f2f2ee';x.fillRect(0,0,S,S);x.fillStyle='#16151c';for(let i=0;i<9;i++){const y0=i*S/9;x.beginPath();x.moveTo(0,y0);for(let X=0;X<=S;X+=16)x.lineTo(X,y0+Math.sin(X/S*Math.PI*2+i)*7);for(let X=S;X>=0;X-=16)x.lineTo(X,y0+S/22+Math.sin(X/S*Math.PI*2+i+1)*5);x.closePath();x.fill()}}
 else if(C.pat==='carbon'){x.fillStyle='#24252b';x.fillRect(0,0,S,S);for(let j=0;j<S;j+=8)for(let i=0;i<S;i+=8){const o=((i+j)/8)%2;const g=x.createLinearGradient(i,j,i+(o?8:0),j+(o?0:8));g.addColorStop(0,'#3a3c44');g.addColorStop(.5,'#5a5d68');g.addColorStop(1,'#2b2c33');x.fillStyle=g;x.fillRect(i+1,j+1,6,6)}}
 else if(C.pat==='flame'){x.fillStyle='#2b1a1a';x.fillRect(0,0,S,S);for(let n=0;n<7;n++){const y=n*S/7+r()*10,len=S*(.55+r()*.35);for(const[col,w]of[['#ff3b1f',18],['#ff9a1a',12],['#ffe14a',6]]){x.fillStyle=col;x.beginPath();x.moveTo(S,y-w);x.quadraticCurveTo(S-len*.5,y-w*1.4,S-len,y+r()*6-3);x.quadraticCurveTo(S-len*.5,y+w*1.4,S,y+w);x.closePath();x.fill()}}}
 else if(C.pat==='digi'){const q=8;for(let j=0;j<S;j+=q)for(let i=0;i<S;i+=q){x.fillStyle=C.cols[0];x.fillRect(i,j,q,q)}for(let L=1;L<C.cols.length;L++){x.fillStyle=C.cols[L];for(let n=0;n<40;n++){const cx=(r()*S/q|0)*q,cy=(r()*S/q|0)*q,w=(1+r()*4|0)*q,h=(1+r()*3|0)*q;for(const[ox,oy]of[[0,0],[S,0],[-S,0],[0,S],[0,-S]])x.fillRect(cx+ox,cy+oy,w,h)}}}
 else if(C.pat==='tiger'){x.fillStyle='#ff9a1a';x.fillRect(0,0,S,S);x.fillStyle='#16151c';for(let i=0;i<10;i++){const y=i*S/10+r()*8,w=6+r()*8,len=S*(.35+r()*.4),x0=r()*S;for(const ox of[-S,0,S]){x.beginPath();x.moveTo(x0+ox,y-w);x.quadraticCurveTo(x0+ox+len*.5,y-w*.2+r()*8,x0+ox+len,y);x.quadraticCurveTo(x0+ox+len*.5,y+w*.6,x0+ox,y+w);x.closePath();x.fill()}}}
 else if(C.pat==='checker'){const q=32;for(let j=0;j<S;j+=q)for(let i=0;i<S;i+=q){x.fillStyle=((i+j)/q)%2?'#16151c':'#f2f2ee';x.fillRect(i,j,q,q)}}
 else if(C.pat==='leopard'){x.fillStyle='#e0a64a';x.fillRect(0,0,S,S);for(let n=0;n<34;n++){const cx=r()*S,cy=r()*S,rr=7+r()*7;for(const[ox,oy]of[[0,0],[S,0],[-S,0],[0,S],[0,-S]]){x.fillStyle='#2a1a0e';x.beginPath();x.ellipse(cx+ox,cy+oy,rr,rr*.8,r()*3,0,7);x.fill();x.fillStyle='#b5762e';x.beginPath();x.ellipse(cx+ox,cy+oy,rr*.5,rr*.4,0,0,7);x.fill()}}}
 else if(C.pat==='hex'){x.fillStyle='#f5b700';x.fillRect(0,0,S,S);const cols=8,w=S/cols,h=S/8;x.strokeStyle='#5a3a00';x.lineWidth=3;for(let j=-1;j<=8;j++)for(let i=-1;i<=cols;i++){const cx=i*w+(j%2?w/2:0),cy=j*h,R=w/1.75;x.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;x.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R)}x.closePath();x.fillStyle=(((i%cols)+cols)%cols*7+((j%8)+8)%8*3)%5?'#f5b700':'#ffcf3a';x.fill();x.stroke()}}
 return TEX[id]=c}
// ---- 在每个方向格把纹理按车头朝向旋转 + 等距压扁后铺满（贴合 16 方向）----
function patSheet(k,id){const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d'),T=tex(id),pt=x.createPattern(T,'repeat');
 for(let i=0;i<16;i++){const cx=(i%4)*F+F/2,cy=(i>>2)*F+F/2,a=i/16*Math.PI*2;x.save();x.beginPath();x.rect((i%4)*F,(i>>2)*F,F,F);x.clip();x.translate(cx,cy);x.scale(1,.55);x.rotate(Math.PI/2-a);x.scale(.9,.9);x.fillStyle=pt;x.fillRect(-F*1.5,-F*1.5,F*3,F*3);x.restore()}return o}
// ---- compose：保持原流程（底→涂装→livery→线稿），涂装步可换成图案 ----
const _comp=compose;
compose=function(k,color,liv){const C=COLORS[color];if(!C||!C.pat||C.dyn)return tag(_comp(k,color,liv),C);const key=k+'|'+color+'|'+(liv||'');if(SKIN.has(key))return skinGet(key);
 const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d');x.drawImage(BASE[k],0,0);const t=mkC(W4,W4),tx=t.getContext('2d');tx.drawImage(PAINT[k],0,0);tx.globalCompositeOperation='multiply';tx.drawImage(patSheet(k,color),0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(PAINT[k],0,0);x.drawImage(t,0,0);
 if(liv&&LIVS[liv]&&LAYI[k+'_liv_'+(LIVS[liv].src||liv)]){const lc=LIVS[liv].c||(lum(C.c)>.55?'#1b1420':'#ffffff'),L=LAYI[k+'_liv_'+(LIVS[liv].src||liv)],l=mkC(W4,W4),lx=l.getContext('2d');lx.drawImage(L,0,0,W4,W4);lx.globalCompositeOperation='source-in';lx.fillStyle=lc;lx.fillRect(0,0,W4,W4);x.drawImage(l,0,0)}
 if(LINES[k]){const sp=splitLines(k),dk=lum(C.c)<.3;x.drawImage(dk?sp.dl:sp.d,0,0);x.drawImage(sp.h,0,0);if(dk)x.drawImage(sp.h,0,0)}
 return skinPut(key,o)};
function tag(o,C){if(C&&C.dyn)o._dyn=C.dyn;return o}
// ---- 传说动态：绘制时在涂装区叠加（只处理当前格 192px；色板相位帧缓存）----
const PH=12,GR={};function grad(mode,ph){const key=mode+ph;if(GR[key])return GR[key];const S=192,c=mkC(S,S),x=c.getContext('2d'),f=ph/PH;
 if(mode==='iri'){const g=x.createLinearGradient(0,0,S,S);for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsl(${(f*360+i*60)%360},95%,60%)`);x.fillStyle=g;x.fillRect(0,0,S,S)}
 else if(mode==='neon'){x.fillStyle='#1a1030';x.fillRect(0,0,S,S);const b=(f*S*2)%(S*2)-S/2;const g=x.createLinearGradient(b-50,0,b+50,S*.4);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.35,'#39f3ff');g.addColorStop(.65,'#ff3bd4');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,S,S)}
 else if(mode==='lava'){x.fillStyle='#3a0a05';x.fillRect(0,0,S,S);for(let n=0;n<6;n++){const y=((n/6+f)%1)*S*1.2-S*.1;const g=x.createLinearGradient(0,y-18,0,y+18);g.addColorStop(0,'rgba(255,80,0,0)');g.addColorStop(.5,n%2?'#ffb02e':'#ff3b1f');g.addColorStop(1,'rgba(255,80,0,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,y);for(let X=0;X<=S;X+=16)x.lineTo(X,y+Math.sin(X/30+n)*10);x.lineTo(S,y+18);x.lineTo(0,y+18);x.closePath();x.fill()}}
 else if(mode==='galaxy'){x.fillStyle='#0b0f2e';x.fillRect(0,0,S,S);for(const[cx,cy,col]of[[.3,.4,'rgba(178,107,255,.55)'],[.7,.65,'rgba(57,180,255,.45)'],[.5,.2,'rgba(255,90,200,.35)']]){const X=((cx+f)%1)*S,g=x.createRadialGradient(X,cy*S,0,X,cy*S,S*.45);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,S,S)}const r=rng(7);for(let n=0;n<60;n++){const sx=r()*S,sy=r()*S,tw=.35+.65*Math.abs(Math.sin((f+r())*Math.PI*2));x.fillStyle=`rgba(255,255,255,${tw.toFixed(2)})`;x.fillRect(sx,sy,n%7?1.5:3,n%7?1.5:3)}}
 else{const g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,'#f4f6fa');g.addColorStop(.45,'#9aa3b0');g.addColorStop(.55,'#5d6470');g.addColorStop(1,'#d8dde6');x.fillStyle=g;x.fillRect(0,0,S,S);const b=(f*S*2)%(S*2)-S/2;x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.moveTo(b,0);x.lineTo(b+22,0);x.lineTo(b-30,S);x.lineTo(b-52,S);x.fill()}
 return GR[key]=c}
let dynKey=null;const DC=new Map();
// 缓存帧：车型×方向×相位的叠加层；shortcut: 上限 96 张(~14MB)，超出按最早淘汰
function dynCell(mode,k,i,ph){const key=mode+k+i+'|'+ph;let c=DC.get(key);if(c)return c;const S=192;c=mkC(S,S);const x=c.getContext('2d'),sh=mode==='iri'?(i*PH/16|0):0;x.drawImage(PAINT[k],(i%4)*F,(i>>2)*F,F,F,0,0,S,S);x.globalCompositeOperation='source-in';x.drawImage(grad(mode,(ph+sh)%PH),0,0);if(DC.size>=(MOBC?TUNE.skin.dynCacheMob:TUNE.skin.dynCache))DC.delete(DC.keys().next().value);DC.set(key,c);return c}
const _dcs=drawCarSprite;drawCarSprite=function(c2d,img,i,x,y,s){_dcs(c2d,img,i,x,y,s);if(!img||!img._dyn||!PAINT[dynKey])return;const mode=img._dyn,ph=((performance.now()/(mode==='iri'?140:mode==='lava'||mode==='galaxy'?120:90))|0)%PH,S=192;
 const oc=dynCell(mode,dynKey,i,ph);
 c2d.save();const atop=mode==='lava'||mode==='galaxy';c2d.globalCompositeOperation=mode==='chrome'?'overlay':atop?'source-atop':'color';c2d.globalAlpha=mode==='chrome'?.8:atop?.85:.75;c2d.drawImage(oc,0,0,S,S,x-F/2*s,y-F*AY*s,F*s,F*s);if(mode==='neon'){c2d.globalCompositeOperation='lighter';c2d.globalAlpha=.35;c2d.drawImage(oc,0,0,S,S,x-F/2*s,y-F*AY*s,F*s,F*s)}c2d.restore()};
// drawCarSprite 只拿到 img，需要知道车型：包住 drawCar / drawFull 传递
{const _d=drawCar;drawCar=function(c){dynKey=c.k;return _d(c)}}{const _f=drawFull;drawFull=function(c2d,k){dynKey=k;return _f.apply(this,arguments)}}
// ---- 抽奖/宝箱：传说涂装 + 保底 ----
const LEG=()=>Object.keys(COLORS).filter(k=>COLORS[k].lim&&!save.colors[k]);
const LP_N=TUNE.skin.legPity;// 保底：连续 30 次抽奖/开箱未出传说 → 下一次必出
function legRoll(got,base){const l=LEG();if(!l.length)return false;save.legPity=(save.legPity||0)+1;if(Math.random()<base||save.legPity>=LP_N){const k=l[Math.random()*l.length|0];save.colors[k]=true;got['col:'+k]=1;track('legend_skin_get',{id:k,pity:save.legPity>=LP_N,n:save.legPity});save.legPity=0;persist();return true}return false}
{const _s=spinOnce;spinOnce=function(){const got=_s();legRoll(got,TUNE.skin.legSpin);persist();return got}}
{const _o=openChest;openChest=function(){const got=_o();legRoll(got,TUNE.skin.legChest);if(Math.random()<TUNE.skin.livChest&&Object.keys(LIVS).some(l=>LIVS[l].lim&&!save.livs[l]))livGrant(got);persist();return got}}

// ---- 车库：按稀有度分组 + 色框 + 图案缩略图；传说款仅抽奖/宝箱 ----
const THUMB={};function thumb(id){if(THUMB[id])return THUMB[id];const C=COLORS[id],c=mkC(48,48),x=c.getContext('2d');if(C.pat&&!C.dyn){x.drawImage(tex(id),0,0,96,96,0,0,48,48)}else if(C.dyn){x.drawImage(grad(C.dyn,3),0,0,192,192,0,0,48,48)}else{x.fillStyle=C.c;x.fillRect(0,0,48,48)}return THUMB[id]=c.toDataURL()}
const RN={n:'普通',r:'稀有',l:'传说'};
// v29 外观页按稀有度分页签：普通 / 稀有 / 传说 / 拉花，只显示当前页签，减少滚动；各页签记住自己的滚动位置（切页签不重渲染）
let LT=null;const LTS={};const LTN={n:'普通',r:'稀有',l:'传说',liv:'拉花'},LTH={n:'纯色 · 金币购买，所有车通用',r:'图案 · 金币购买',l:'动态涂装 · 仅抽奖/宝箱获得',liv:'拉花 · 基础/换色款金币购买，限定款仅抽奖/宝箱'};
const scroller=el=>{for(let e=el&&el.parentElement;e;e=e.parentElement){const o=getComputedStyle(e).overflowY;if(o==='auto'||o==='scroll')return e}return null};
function groupSw(){const box=document.querySelector('#garage .swatches');if(!box||box.dataset.g)return;box.dataset.g=1;const btns=[...box.querySelectorAll('[data-col]')],lbox=document.querySelector('#garage [data-liv]')&&document.querySelector('#garage [data-liv]').closest('.swatches');box.innerHTML='';
 const cs=save.cars[gKey];if(!LT)LT=RAR(cs.paint.color);
 for(const r of['n','r','l'])for(const b of btns.filter(b=>RAR(b.dataset.col)===r)){const id=b.dataset.col,C=COLORS[id];b.classList.add('rar-'+r);b.dataset.lt=r;if(r!=='n'){const i=b.querySelector('i');if(i){i.style.background=`url(${thumb(id)}) center/cover`}}if(C.lim&&!save.colors[id]){const em=b.querySelector('em');if(em)em.innerHTML='🎰 抽奖'}box.appendChild(b)}
 if(lbox){lbox.dataset.g=1;const lb=[...lbox.querySelectorAll('[data-liv]')];lbox.innerHTML='';for(const r of['n','r','l']){const bs=lb.filter(b=>b.dataset.liv?(LIVS[b.dataset.liv].rar||'n')===r:r==='n');if(!bs.length)continue;const h=document.createElement('div');h.className='rarh rar-'+r;h.textContent={n:'基础',r:'换色款',l:'限定 · 抽奖/宝箱'}[r];lbox.appendChild(h);bs.forEach(b=>lbox.appendChild(b))}}
 document.querySelectorAll('#garage .gst').forEach(g=>{if(g.nextElementSibling===box||g.nextElementSibling===lbox)g.classList.add('hide')});
 const own=r=>r==='liv'?[Object.keys(LIVS).filter(l=>save.livs[l]).length,Object.keys(LIVS).length]:[Object.keys(COLORS).filter(c=>RAR(c)===r&&save.colors[c]).length,Object.keys(COLORS).filter(c=>RAR(c)===r).length];
 const bar=document.createElement('div');bar.className='ltabs';bar.innerHTML=['n','r','l','liv'].map(r=>{const[o,t]=own(r);return`<button class="lt rar-${r}" data-ltab="${r}">${LTN[r]}<small>${o}/${t}</small></button>`}).join('')+'<div class="lth"></div>';box.parentNode.insertBefore(bar,box);
 const apply=()=>{bar.querySelectorAll('.lt').forEach(e=>e.classList.toggle('on',e.dataset.ltab===LT));bar.querySelector('.lth').textContent=LTH[LT];btns.forEach(b=>b.classList.toggle('hide',b.dataset.lt!==LT));box.classList.toggle('hide',LT==='liv');if(lbox)lbox.classList.toggle('hide',LT!=='liv')};apply();
 bar.querySelectorAll('.lt').forEach(e=>e.onclick=()=>{if(e.dataset.ltab===LT)return;const sc=scroller(bar);if(sc)LTS[LT]=sc.scrollTop;LT=e.dataset.ltab;apply();if(sc)sc.scrollTop=LTS[LT]||0;sfx('ui');track('look_tab',{tab:LT})})}
{const _rg=renderGarage;renderGarage=function(){_rg.apply(this,arguments);groupSw();const pv=window.__pv&&__pv();if(pv&&pv.t==='color'&&COLORS[pv.id].lim&&!save.colors[pv.id]){const bar=document.querySelector('#garage .trybar');if(bar){bar.querySelectorAll('#tryBuy,#coinAdBtn,button[disabled]').forEach(e=>e.remove());const s=document.createElement('button');s.className='btn sm adbtn';s.id='tryDaily';s.textContent='🎰 每日抽奖/宝箱获得';s.onclick=()=>{track('legend_skin_goto',{id:pv.id});openDaily()};bar.insertBefore(s,bar.querySelector('#tryX'))}}}}
window.__v18={tex,patSheet,legRoll,LEG,LP_N,get LT(){return LT},set LT(v){LT=v},LTS};
})();
// v26.1 车库重渲染保持滚动位置：试穿/购买/装备/切换车辆等操作后各栏 scrollTop 不变；右栏切页签（外观↔合成）时右栏回顶部
{let lastTab=null;const SEL='#garage .gpane,#garage .gcols>.gcol';const key=e=>{const cols=[...document.querySelectorAll('#garage .gcols>.gcol')],c=e.closest('.gcols>.gcol');return cols.indexOf(c)+'|'+(e.classList.contains('gpane')?'p':'c')};
 const _rg=renderGarage;renderGarage=function(){const keep=[...document.querySelectorAll(SEL)].filter(e=>e.scrollTop>0).map(e=>[key(e),e.scrollTop]),tabChg=lastTab!==null&&lastTab!==gTab;lastTab=gTab;
  const r=_rg.apply(this,arguments);for(const[k,t]of keep){if(tabChg&&k[0]==='2')continue;const e=[...document.querySelectorAll(SEL)].find(e=>key(e)===k);if(e)e.scrollTop=t}return r}}
