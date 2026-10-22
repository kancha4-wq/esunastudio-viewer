(() => {
  'use strict';
  const root=document.querySelector('[data-discovery-preview]');if(!root)return;
  const key='byu-hp-scroll-v1';let target=0;
  try{const value=JSON.parse(localStorage.getItem(key)||'null');if(value?.version===1&&Number.isSafeInteger(value.y)&&value.y>=0)target=value.y;}catch{}
  let restoring=true,timer;
  try{history.scrollRestoration='manual';}catch{}
  const save=()=>{if(restoring)return;try{localStorage.setItem(key,JSON.stringify({version:1,y:Math.max(0,Math.round(scrollY))}));}catch{}};
  addEventListener('scroll',()=>{if(restoring)return;clearTimeout(timer);timer=setTimeout(save,180);},{passive:true});
  addEventListener('pagehide',save);
  addEventListener('load',()=>{
    let attempts=0;
    const apply=()=>{
      const titleSaved=(()=>{try{return JSON.parse(localStorage.getItem('byu-normal-title-state-v1')||'null')?.active===true;}catch{return false;}})();
      const loaded=root.dataset.ready==='true'&&root.dataset.loading!=='true';
      if((!loaded||titleSaved&&root.dataset.titleMode!=='true')&&++attempts<100){setTimeout(apply,100);return;}
      // Explicit update links take precedence over a previous browsing position.
      let newsAnchor=null;try{if(location.hash.startsWith('#news-'))newsAnchor=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
      if(newsAnchor)newsAnchor.scrollIntoView({block:'start'});
      else scrollTo(0,Math.min(target,Math.max(0,document.documentElement.scrollHeight-innerHeight)));
      if(attempts++<8&&scrollY<target&&document.documentElement.scrollHeight-innerHeight<target){setTimeout(apply,180);return;}
      restoring=false;save();
    };
    setTimeout(apply,80);
  },{once:true});
})();
