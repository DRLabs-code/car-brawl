// 广告适配层：游戏只调用 AdAdapter.showRewarded(placement) → Promise<boolean>
// 抖音小游戏：window.tt + window.AD_UNIT_ID 存在时走 tt.createRewardedVideoAd；否则走网页模拟。
(function(){
 const cache={};
 function ttRewarded(){const id=window.AD_UNIT_ID;if(!cache[id])cache[id]=tt.createRewardedVideoAd({adUnitId:id});return cache[id]}
 const ttImpl={name:'tt',available:()=>!!(window.tt&&tt.createRewardedVideoAd&&window.AD_UNIT_ID),
  showRewarded(){return new Promise(res=>{const ad=ttRewarded();const f=r=>{ad.offClose(f);res(!!(r&&r.isEnded))};ad.onClose(f);
   ad.show().catch(()=>ad.load().then(()=>ad.show()).catch(()=>{ad.offClose(f);AdAdapter.noAd=true;res(false)}))})}};
 const mockImpl={name:'mock',available:()=>true,showRewarded(){return new Promise(res=>{if(window.__mock)window.__mock(r=>{if(r==='noad')AdAdapter.noAd=true;res(r===true)});else res(true)})}};
 window.AdAdapter={get impl(){return ttImpl.available()?ttImpl:mockImpl},noAd:false,showRewarded(p){this.noAd=false;return this.impl.showRewarded(p)}};
})();
