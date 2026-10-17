// 模块 items-plus：新道具 导弹 / 地雷 / 油污 / 磁铁。对战、竞速通用；和原有道具一样「开过去即拾取、立即生效」，AI 会主动去吃、会躲地雷油污。
(()=>{const T=TUNE.items;
Object.assign(PKT,{missile:{n:'导弹',ic:'🚀',col:'#ff7b29',d:'自动锁定前方最近的对手',w:T.missile.w},mine:{n:'地雷',ic:'💣',col:'#9aa0a6',d:'在身后布下地雷',w:T.mine.w},
 oil:{n:'油污',ic:'🛢️',col:'#8f7bd6',d:'在身后泼油，踩到会打滑',w:T.oil.w},magnet:{n:'磁铁',ic:'🧲',col:'#e63946',d:`${T.magnet.t} 秒内把附近对手吸过来`,w:T.magnet.w}});
let MS=[],MN=[],OIL=[];const ST={missile:0,mine:0,oil:0,magnet:0,hitM:0,hitN:0,aiUse:0};
const foe=(c,o)=>o!==c&&o.alive&&!o.dummy&&!(MODE==='team'&&o.team!=null&&o.team===c.team);
function aim(c,x,z,h){const fx=Math.sin(h),fz=Math.cos(h);let best=null,bs=1e9;for(const o of cars){if(!foe(c,o))continue;const dx=o.x-x,dz=o.z-z,d=Math.hypot(dx,dz);if(d>T.missile.range)continue;const s=d*((dx*fx+dz*fz)/(d||1)>.3?1:3);if(s<bs){bs=s;best=o}}return best}
window.onPK=(c,k)=>{if(!T[k])return;ST[k]++;if(!c.isP)ST.aiUse++;const fx=Math.sin(c.h),fz=Math.cos(c.h);
 if(k==='missile'){MS.push({x:c.x+fx*2.6,z:c.z+fz*2.6,h:c.h,by:c,t:aim(c,c.x,c.z,c.h),life:T.missile.life,st:0});if(nearP(c.x,c.z))sfx('dash')}
 else if(k==='mine')MN.push({x:c.x-fx*3.2,z:c.z-fz*3.2,by:c,t:0});
 else if(k==='oil')OIL.push({x:c.x-fx*3.8,z:c.z-fz*3.8,r:T.oil.r,t:0});
 else if(k==='magnet')c.magT=T.magnet.t;
 if(c.isP)track('item_use',{k,mode:MODE})};
const hit=(o,d,by,dx,dz,kick,txt)=>{o.lastBy=by;o.lastByT=time;const L=Math.hypot(dx,dz)||1,im=kick/Math.sqrt(o.mass);o.vx+=dx/L*im;o.vz+=dz/L*im;hurt(o,d,by);ft(o.x,o.z,3.6,txt,'#ff9a3c',o.isP||by===player?26:18,o.isP||by===player);if(nearP(o.x,o.z)>0){sfx('boom');shake=Math.max(shake,o.isP?10:5)}if(o.isP)vib('heavy')};
const blast=(x,z,col)=>{spark(x,z,16,col);smoke(x,z,5);debris(x,z,3,'#555')};
const _s=step;step=function(dt){_s(dt);if(!running||tut)return;
 for(let i=MS.length-1;i>=0;i--){const m=MS[i];m.life-=dt;if(m.t&&!m.t.alive)m.t=aim(m.by,m.x,m.z,m.h);
  if(m.t){let d=Math.atan2(m.t.x-m.x,m.t.z-m.z)-m.h;d=Math.atan2(Math.sin(d),Math.cos(d));m.h+=clamp(d,-T.missile.turn*dt,T.missile.turn*dt)}
  m.x+=Math.sin(m.h)*T.missile.spd*dt;m.z+=Math.cos(m.h)*T.missile.spd*dt;m.st-=dt;if(m.st<=0){m.st=.05;parts.push({k:'smoke',x:m.x,z:m.z,y:.6,vx:0,vz:0,vy:.6,t:0,life:.5,s:6,dark:false})}
  let o=null;for(const c of cars)if(foe(m.by,c)&&Math.hypot(c.x-m.x,c.z-m.z)<c.r+.6){o=c;break}
  const wall=sdist(POLY,m.x,m.z).s>-.5||props.some(p=>p.solid&&Math.hypot(p.x-m.x,p.z-m.z)<p.r+.3);
  if(o){ST.hitM++;hit(o,T.missile.dmg,m.by,Math.sin(m.h),Math.cos(m.h),T.missile.kick,'导弹命中！');blast(m.x,m.z,'#ff7b29');MS.splice(i,1)}else if(wall||m.life<=0){blast(m.x,m.z,'#ffb070');MS.splice(i,1)}}
 for(let i=MN.length-1;i>=0;i--){const n=MN[i];n.t+=dt;if(n.t>T.mine.life){MN.splice(i,1);continue}if(n.t<T.mine.arm)continue;
  const o=cars.find(c=>c.alive&&!c.dummy&&(c!==n.by||n.t>T.mine.arm*3)&&(c===n.by||foe(n.by,c))&&Math.hypot(c.x-n.x,c.z-n.z)<T.mine.r);
  if(o){ST.hitN++;hit(o,T.mine.dmg,o===n.by?null:n.by,o.x-n.x,o.z-n.z,T.mine.kick,'踩雷！');blast(n.x,n.z,'#ffd23f');MN.splice(i,1)}}
 for(let i=OIL.length-1;i>=0;i--)if((OIL[i].t+=dt)>T.oil.life)OIL.splice(i,1);
 for(const c of cars){if(!(c.magT>0))continue;c.magT-=dt;if(!c.alive){c.magT=0;continue}for(const o of cars){if(!foe(c,o))continue;const dx=c.x-o.x,dz=c.z-o.z,d=Math.hypot(dx,dz);if(d<T.magnet.r&&d>c.r+o.r){const f=T.magnet.pull*dt/Math.sqrt(o.mass);o.vx+=dx/d*f;o.vz+=dz/d*f}}}};
{const _t=terrainAt;terrainAt=function(x,z){for(const o of OIL)if(Math.hypot(o.x-x,o.z-z)<o.r)return'oil';return _t(x,z)}}
// AI：前方 8 米内有地雷/油污就绕开
{const _ai=aiThink;aiThink=function(c,dt){const o=_ai(c,dt);let[ix,iz,ds]=o;const L=Math.hypot(ix,iz);if(L<.01)return o;const ux=ix/L,uz=iz/L;
 for(const h of MN.length||OIL.length?MN.concat(OIL):[]){const dx=h.x-c.x,dz=h.z-c.z,d=Math.hypot(dx,dz);if(d<8&&d>.1&&(dx*ux+dz*uz)/d>.6){const s=(dx*uz-dz*ux)>0?-1:1;ix=ux*.5+uz*s*.9;iz=uz*.5-ux*s*.9;break}}return[ix,iz,ds]}}
// 新局清空
{const _st=start;start=function(){MS=[];MN=[];OIL=[];const r=_st.apply(this,arguments);for(const c of cars)c.magT=0;return r}}
// 绘制：地面层（油污、地雷）跟着第一次 shadow()；空中层（导弹、磁铁圈）跟 drawTags
let gDone=false;{const _r=render;render=function(){gDone=false;return _r.apply(this,arguments)}}
const ell=(x,z,r)=>{ctx.beginPath();for(let k=0;k<=16;k++){const a=k/16*Math.PI*2,[s,t]=iso(x+Math.cos(a)*r,z+Math.sin(a)*r);k?ctx.lineTo(s,t):ctx.moveTo(s,t)}ctx.closePath()};
{const _sh=shadow;shadow=function(){if(!gDone&&(OIL.length||MN.length)){gDone=true;ctx.save();
 for(const o of OIL){ctx.globalAlpha=Math.min(1,(T.oil.life-o.t)/1.5)*.85;ell(o.x,o.z,o.r);ctx.fillStyle='#231c33';ctx.fill();ctx.globalAlpha*=.5;ell(o.x-.6,o.z-.4,o.r*.45);ctx.fillStyle='#8f7bd6';ctx.fill()}
 ctx.globalAlpha=1;for(const n of MN){const[sx,sy]=iso(n.x,n.z);ctx.fillStyle='#2a2d33';ctx.beginPath();ctx.ellipse(sx,sy,11,6,0,0,7);ctx.fill();ctx.fillStyle='#55595f';ctx.beginPath();ctx.ellipse(sx,sy-2,8,4,0,0,7);ctx.fill();
  if(n.t>=T.mine.arm&&Math.sin(time*10)>0){ctx.fillStyle='#ff3b3b';ctx.beginPath();ctx.arc(sx,sy-3,2.6,0,7);ctx.fill()}}ctx.restore()}return _sh.apply(this,arguments)}}
{const _dt=drawTags;drawTags=function(){for(const m of MS){const[sx,sy]=iso(m.x,m.z),[ax,ay]=iso(m.x+Math.sin(m.h),m.z+Math.cos(m.h)),a=Math.atan2(ay-sy,ax-sx);ctx.save();ctx.translate(sx,sy-14);ctx.rotate(a);
  ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-17-Math.random()*5,-3);ctx.lineTo(-17-Math.random()*5,3);ctx.closePath();ctx.fill();ctx.fillStyle='#e8edf2';ctx.strokeStyle='#1b1420';ctx.lineWidth=2;ctx.beginPath();ctx.rect(-9,-3.5,14,7);ctx.fill();ctx.stroke();ctx.fillStyle='#e63946';ctx.beginPath();ctx.moveTo(5,-3.5);ctx.lineTo(10,0);ctx.lineTo(5,3.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
 for(const c of cars)if(c.magT>0&&c.alive){const[sx,sy]=iso(c.x,c.z),k=(time*1.5)%1;ctx.save();ctx.strokeStyle='#e63946';ctx.lineWidth=2;ctx.globalAlpha=.6*(1-k);ctx.beginPath();ctx.ellipse(sx,sy,40*(1-k)+10,20*(1-k)+5,0,0,7);ctx.stroke();ctx.restore()}
 return _dt.apply(this,arguments)}}
window.__items={get MS(){return MS},get MN(){return MN},get OIL(){return OIL},ST};
})();
