(() => {
  'use strict';
  // Both identifiers and URL forms are pinned in title-search-entrances.json.
  const amazonTag='esunastudio-22';
  const koboBase='https://hb.afl.rakuten.co.jp/hgc/0692d36a.fbab3045.0692d36b.5f295641/';
  function href(raw){
    if(typeof raw!=='string'||!raw.startsWith('https://'))return raw;
    let url;try{url=new URL(raw);}catch{return raw;}
    if(['www.amazon.co.jp','amazon.co.jp'].includes(url.hostname)){
      if(url.searchParams.has('tag'))return raw;
      url.searchParams.append('tag',amazonTag);return url.href;
    }
    if(url.hostname==='books.rakuten.co.jp')return koboBase+'?pc='+encodeURIComponent(raw)+'&m='+encodeURIComponent(raw);
    return raw;
  }
  window.ByuHpAffiliate={href};
})();
