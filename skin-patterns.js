// 模块 skin-patterns（原 v18）花纹涂装：稀有图案（迷彩×3/火焰/斑马/碳纤维）+ 传说动态（幻彩/霓虹流光/金属电镀）
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
 return TEX[id]=c}
// ---- 在每个方向格把纹理按车头朝向旋转 + 等距压扁后铺满（贴合 16 方向）----
function patSheet(k,id){const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d'),T=tex(id),pt=x.createPattern(T,'repeat');
 for(let i=0;i<16;i++){const cx=(i%4)*F+F/2,cy=(i>>2)*F+F/2,a=i/16*Math.PI*2;x.save();x.beginPath();x.rect((i%4)*F,(i>>2)*F,F,F);x.clip();x.translate(cx,cy);x.scale(1,.55);x.rotate(Math.PI/2-a);x.scale(.9,.9);x.fillStyle=pt;x.fillRect(-F*1.5,-F*1.5,F*3,F*3);x.restore()}return o}
// ---- compose：保持原流程（底→涂装→livery→线稿），涂装步可换成图案 ----
const _comp=compose;
compose=function(k,color,liv){const C=COLORS[color];if(!C||!C.pat||C.dyn)return tag(_comp(k,color,liv),C);const key=k+'|'+color+'|'+(liv||'');if(SKIN.has(key))return SKIN.get(key);
 const W4=F*4,o=mkC(W4,W4),x=o.getContext('2d');x.drawImage(BASE[k],0,0);const t=mkC(W4,W4),tx=t.getContext('2d');tx.drawImage(PAINT[k],0,0);tx.globalCompositeOperation='multiply';tx.drawImage(patSheet(k,color),0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(PAINT[k],0,0);x.drawImage(t,0,0);
 if(liv&&LIVS[liv]&&LAYI[k+'_liv_'+(LIVS[liv].src||liv)]){const lc=LIVS[liv].c||(lum(C.c)>.55?'#1b1420':'#ffffff'),L=LAYI[k+'_liv_'+(LIVS[liv].src||liv)],l=mkC(W4,W4),lx=l.getContext('2d');lx.drawImage(L,0,0,W4,W4);lx.globalCompositeOperation='source-in';lx.fillStyle=lc;lx.fillRect(0,0,W4,W4);x.drawImage(l,0,0)}
 if(LINES[k]){const sp=splitLines(k),dk=lum(C.c)<.3;x.drawImage(dk?sp.dl:sp.d,0,0);x.drawImage(sp.h,0,0);if(dk)x.drawImage(sp.h,0,0)}
 if(SKIN.size>24)SKIN.delete(SKIN.keys().next().value);SKIN.set(key,o);return o};
function tag(o,C){if(C&&C.dyn)o._dyn=C.dyn;return o}
// ---- 传说动态：绘制时在涂装区叠加（只处理当前格 192px；色板相位帧缓存）----
const PH=12,GR={};function grad(mode,ph){const key=mode+ph;if(GR[key])return GR[key];const S=192,c=mkC(S,S),x=c.getContext('2d'),f=ph/PH;
 if(mode==='iri'){const g=x.createLinearGradient(0,0,S,S);for(let i=0;i<=6;i++)g.addColorStop(i/6,`hsl(${(f*360+i*60)%360},95%,60%)`);x.fillStyle=g;x.fillRect(0,0,S,S)}
 else if(mode==='neon'){x.fillStyle='#1a1030';x.fillRect(0,0,S,S);const b=(f*S*2)%(S*2)-S/2;const g=x.createLinearGradient(b-50,0,b+50,S*.4);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.35,'#39f3ff');g.addColorStop(.65,'#ff3bd4');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,S,S)}
 else{const g=x.createLinearGradient(0,0,0,S);g.addColorStop(0,'#f4f6fa');g.addColorStop(.45,'#9aa3b0');g.addColorStop(.55,'#5d6470');g.addColorStop(1,'#d8dde6');x.fillStyle=g;x.fillRect(0,0,S,S);const b=(f*S*2)%(S*2)-S/2;x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.moveTo(b,0);x.lineTo(b+22,0);x.lineTo(b-30,S);x.lineTo(b-52,S);x.fill()}
 return GR[key]=c}
let dynKey=null;const DC=new Map();
// 缓存帧：车型×方向×相位的叠加层；shortcut: 上限 96 张(~14MB)，超出按最早淘汰
function dynCell(mode,k,i,ph){const key=mode+k+i+'|'+ph;let c=DC.get(key);if(c)return c;const S=192;c=mkC(S,S);const x=c.getContext('2d'),sh=mode==='iri'?(i*PH/16|0):0;x.drawImage(PAINT[k],(i%4)*F,(i>>2)*F,F,F,0,0,S,S);x.globalCompositeOperation='source-in';x.drawImage(grad(mode,(ph+sh)%PH),0,0);if(DC.size>=TUNE.skin.dynCache)DC.delete(DC.keys().next().value);DC.set(key,c);return c}
const _dcs=drawCarSprite;drawCarSprite=function(c2d,img,i,x,y,s){_dcs(c2d,img,i,x,y,s);if(!img||!img._dyn||!PAINT[dynKey])return;const mode=img._dyn,ph=((performance.now()/(mode==='iri'?140:90))|0)%PH,S=192;
 const oc=dynCell(mode,dynKey,i,ph);
 c2d.save();c2d.globalCompositeOperation=mode==='chrome'?'overlay':'color';c2d.globalAlpha=mode==='chrome'?.8:.75;c2d.drawImage(oc,0,0,S,S,x-F/2*s,y-F*AY*s,F*s,F*s);if(mode==='neon'){c2d.globalCompositeOperation='lighter';c2d.globalAlpha=.35;c2d.drawImage(oc,0,0,S,S,x-F/2*s,y-F*AY*s,F*s,F*s)}c2d.restore()};
// drawCarSprite 只拿到 img，需要知道车型：包住 drawCar / drawFull 传递
{const _d=drawCar;drawCar=function(c){dynKey=c.k;return _d(c)}}{const _f=drawFull;drawFull=function(c2d,k){dynKey=k;return _f.apply(this,arguments)}}
// ---- 抽奖/宝箱：传说涂装 + 保底 ----
const LEG=()=>Object.keys(COLORS).filter(k=>COLORS[k].lim&&!save.colors[k]);
const LP_N=TUNE.skin.legPity;// 保底：连续 30 次抽奖/开箱未出传说 → 下一次必出
function legRoll(got,base){const l=LEG();if(!l.length)return false;save.legPity=(save.legPity||0)+1;if(Math.random()<base||save.legPity>=LP_N){const k=l[Math.random()*l.length|0];save.colors[k]=true;got['col:'+k]=1;track('legend_skin_get',{id:k,pity:save.legPity>=LP_N,n:save.legPity});save.legPity=0;persist();return true}return false}
{const _s=spinOnce;spinOnce=function(){const got=_s();legRoll(got,TUNE.skin.legSpin);persist();return got}}
{const _o=openChest;openChest=function(){const got=_o();legRoll(got,TUNE.skin.legChest);persist();return got}}

// ---- 车库：按稀有度分组 + 色框 + 图案缩略图；传说款仅抽奖/宝箱 ----
const THUMB={};function thumb(id){if(THUMB[id])return THUMB[id];const C=COLORS[id],c=mkC(48,48),x=c.getContext('2d');if(C.pat&&!C.dyn){x.drawImage(tex(id),0,0,96,96,0,0,48,48)}else if(C.dyn){x.drawImage(grad(C.dyn,3),0,0,192,192,0,0,48,48)}else{x.fillStyle=C.c;x.fillRect(0,0,48,48)}return THUMB[id]=c.toDataURL()}
const RN={n:'普通',r:'稀有',l:'传说'};
function groupSw(){const box=document.querySelector('#garage .swatches');if(!box||box.dataset.g)return;box.dataset.g=1;const btns=[...box.querySelectorAll('[data-col]')];box.innerHTML='';
 for(const r of['n','r','l']){const bs=btns.filter(b=>RAR(b.dataset.col)===r);if(!bs.length)continue;const h=document.createElement('div');h.className='rarh rar-'+r;h.textContent=RN[r]+(r==='r'?' · 图案':r==='l'?' · 动态（抽奖/宝箱）':'');box.appendChild(h);
  for(const b of bs){const id=b.dataset.col,C=COLORS[id];b.classList.add('rar-'+r);if(r!=='n'){const i=b.querySelector('i');if(i){i.style.background=`url(${thumb(id)}) center/cover`}}if(C.lim&&!save.colors[id]){const em=b.querySelector('em');if(em)em.innerHTML='🎰 抽奖'}box.appendChild(b)}}}
{const _rg=renderGarage;renderGarage=function(){_rg.apply(this,arguments);groupSw();const pv=window.__pv&&__pv();if(pv&&pv.t==='color'&&COLORS[pv.id].lim&&!save.colors[pv.id]){const bar=document.querySelector('#garage .trybar');if(bar){bar.querySelectorAll('#tryBuy,#coinAdBtn,button[disabled]').forEach(e=>e.remove());const s=document.createElement('button');s.className='btn sm adbtn';s.id='tryDaily';s.textContent='🎰 每日抽奖/宝箱获得';s.onclick=()=>{track('legend_skin_goto',{id:pv.id});openDaily()};bar.insertBefore(s,bar.querySelector('#tryX'))}}}}
window.__v18={tex,patSheet,legRoll,LEG,LP_N};
})();
