// v30 同帧对比：真实战斗尺寸（Z×DPR=0.75×2），每组 全 1152² / 新 672² / 旧 576²
const p=require('/tmp/pt/node_modules/puppeteer-core');const W=ms=>new Promise(r=>setTimeout(r,ms));const SH='/workspace/car-brawl/prototype/shots/v30/';
(async()=>{const b=await p.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const g=await b.newPage();await g.setViewport({width:844,height:390,deviceScaleFactor:2,isMobile:true,hasTouch:true});await g.goto('http://localhost:8765/index.html');await g.evaluate(()=>localStorage.clear());await g.reload();await W(2500);
const r=await g.evaluate(async()=>{const s=__game.save;s.tut=true;s.tutorialDone=true;persist();hideAll();MODE='brawl';buildArena('site',arenaR(4));start('beast');await new Promise(r=>setTimeout(r,1500));const Z=__game.Z,D=__game.DPR;
 const sets=[['beast','checker','number'],['fang','leopard','stripe'],['tyrant','hex','roof'],['beast','galaxy','auroraStripe']];const CW=240,CH=210,HD=40,SZ=[1152,TUNE.skin.oppPx,576],LB=['全 1152²',TUNE.skin.oppPx+'²（v30 新）','576²（v29 旧）'];
 const out=document.createElement('canvas');out.width=sets.length*3*CW;out.height=HD+2*CH;const ox=out.getContext('2d');ox.fillStyle='#d9d4c7';ox.fillRect(0,0,out.width,out.height);ox.font='bold 22px sans-serif';ox.fillStyle='#222';
 const diff=[0,0,0],n=[0,0,0];
 sets.forEach(([k,c,l],j)=>{const full=compose(k,c,l);const tex=SZ.map(px=>{if(px===1152)return full;const h=document.createElement('canvas');h.width=h.height=px;const hx=h.getContext('2d');hx.imageSmoothingEnabled=true;hx.imageSmoothingQuality='high';hx.drawImage(full,0,0,px,px);if(full._dyn)h._dyn=full._dyn;return h});
  tex.forEach((t,col)=>ox.fillText(LB[col],(j*3+col)*CW+10,28));
  [3,11].forEach((dir,row)=>{const cells=tex.map((t,col)=>{const cv=document.createElement('canvas');cv.width=CW;cv.height=CH;const x=cv.getContext('2d');x.setTransform(Z*D,0,0,Z*D,0,0);drawCarSprite(x,t,dir,CW/(Z*D)/2,CH/(Z*D)*.62,FS);ox.drawImage(cv,(j*3+col)*CW,HD+row*CH);return x.getImageData(0,0,CW,CH).data});
   for(const col of [1,2]){const a=cells[0],bb=cells[col];for(let i=0;i<a.length;i+=4){if(a[i+3]<10&&bb[i+3]<10)continue;n[col]++;diff[col]+=(Math.abs(a[i]-bb[i])+Math.abs(a[i+1]-bb[i+1])+Math.abs(a[i+2]-bb[i+2]))/3}}})});
 ox.strokeStyle='#888';for(let j=1;j<sets.length;j++){ox.beginPath();ox.moveTo(j*3*CW,0);ox.lineTo(j*3*CW,out.height);ox.stroke()}
 // 3 倍放大局部（第 1 组朝向 3，最近邻放大便于看细节）
 const zm=document.createElement('canvas');zm.width=3*CW*2;zm.height=HD+CH*2;const zx=zm.getContext('2d');zx.imageSmoothingEnabled=false;zx.fillStyle='#d9d4c7';zx.fillRect(0,0,zm.width,zm.height);
 for(let col=0;col<3;col++){zx.drawImage(out,col*CW+CW*.2,HD+CH*.15,CW*.6,CH*.6,col*CW*2,HD,CW*2*.9,CH*2*.9);zx.font='bold 22px sans-serif';zx.fillStyle='#222';zx.fillText(LB[col]+' ×3',col*CW*2+10,28)}
 return{url:out.toDataURL(),zoom:zm.toDataURL(),meanDiff672:+(diff[1]/n[1]).toFixed(2),meanDiff576:+(diff[2]/n[2]).toFixed(2),Z,D}});
const fs=require('fs');fs.writeFileSync(SH+'same_frame_full_672_576_844x390.png',Buffer.from(r.url.split(',')[1],'base64'));fs.writeFileSync(SH+'same_frame_zoom3x.png',Buffer.from(r.zoom.split(',')[1],'base64'));
console.log(JSON.stringify({meanDiff672:r.meanDiff672,meanDiff576:r.meanDiff576,Z:r.Z,D:r.D}));await b.close()})();
