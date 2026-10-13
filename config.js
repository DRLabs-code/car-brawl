// 构建配置：默认全部内容。裁剪版（如首发只开工地+乱斗）改这里或加 URL 参数 ?maps=site&modes=brawl
window.BUILD=(()=>{const q=new URLSearchParams(location.search),B={maps:null,modes:['brawl','ring'],renameCost:500,carNameMax:8};
 if(q.get('maps'))B.maps=q.get('maps').split(',');if(q.get('modes'))B.modes=q.get('modes').split(',').filter(m=>m==='brawl'||m==='ring');if(!B.modes.length)B.modes=['brawl'];return B})();
