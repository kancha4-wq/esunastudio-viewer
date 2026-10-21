(() => {
  'use strict';
  const root=document.querySelector('[data-discovery-preview]');
  if(!root)return;
  const EXPECTED='0f301fbfaa95ac74b8e58b393f1b14c3194a9cb327ee836084970376a80e08be';
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const norm=s=>String(s||'').normalize('NFKC').toLocaleLowerCase('en-US').replace(/\s/gu,'');
  const host=()=>root.querySelector('.official-store-view');
  const store=()=>root.querySelector('.store-switch [data-store][aria-pressed=true]')?.dataset.store;
  const storeKey=()=>store()==='kobo'?'rakuten_kobo':'amazon';
  let all=[],loaded=false,loading=null,mode=false,query='',initial='all',offset=0,pageSize=10,loadedScope='';
  const stateKey='byu-normal-title-state-v1';let savedState={version:1,active:false,scopes:{}};
  try{const v=JSON.parse(localStorage.getItem(stateKey)||'null');if(v?.version===1&&v.scopes&&typeof v.scopes==='object'&&!Array.isArray(v.scopes))savedState=v;}catch{}
  const restoreScope=()=>{const key=storeKey();if(key===loadedScope)return;loadedScope=key;const v=savedState.scopes[key]||{};query=typeof v.query==='string'?v.query.slice(0,256):'';initial=['all','0-9','A-Z','あ','か','さ','た','な','は','ま','や','ら・わ・ん','読み未確認'].includes(v.initial)?v.initial:'all';pageSize=[10,20,100].includes(v.pageSize)?v.pageSize:10;offset=Number.isSafeInteger(v.offset)&&v.offset>=0&&v.offset<1000000?Math.floor(v.offset/pageSize)*pageSize:0;};
  const saveState=()=>{if(loadedScope)savedState.scopes[loadedScope]={query,initial,offset,pageSize};savedState.active=mode;try{localStorage.setItem(stateKey,JSON.stringify(savedState));}catch{}};
  const css=el('style');
  css.textContent='[data-title-mode=true] .official-store-view>:not(.unified-category-switch):not(.normal-title-panel){display:none!important}[data-title-mode=true] .discovery-live,[data-title-mode=true] .catalogue-content{display:none!important}';
  css.textContent+=' .normal-title-initials{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.normal-title-initials button{min-height:40px;padding:7px 10px;border:1px solid #44738e;border-radius:6px;background:#fff;color:#173d55}.normal-title-initials button[aria-pressed=true]{background:#175b8d;color:#fff;font-weight:700}.normal-title-search-secondary input{width:min(170px,100%)!important;min-width:0}';document.head.append(css);
  const initials=['all','0-9','A-Z','あ','か','さ','た','な','は','ま','や','ら・わ・ん','読み未確認'];
  const kanaGroups={'あ':'あいうえお','か':'かきくけこ','さ':'さしすせそ','た':'たちつてと','な':'なにぬねの','は':'はひふへほ','ま':'まみむめも','や':'やゆよ','ら・わ・ん':'らりるれろわをん'};
  const smallKana={'ぁ':'あ','ぃ':'い','ぅ':'う','ぇ':'え','ぉ':'お','ゃ':'や','ゅ':'ゆ','ょ':'よ','ゎ':'わ','っ':'つ'};
  function initialFor(row){
    const title=String(row.titleReading||row.title||'').normalize('NFKC').trim();if(!title)return '読み未確認';
    let ch=title[0];if(/[0-9]/.test(ch))return '0-9';if(/[A-Za-z]/.test(ch))return 'A-Z';
    if(/[ァ-ヶ]/.test(ch))ch=String.fromCharCode(ch.charCodeAt(0)-96);
    ch=smallKana[ch]||ch.normalize('NFD')[0];
    for(const [group,letters] of Object.entries(kanaGroups))if(letters.includes(ch))return group;
    return '読み未確認';
  }
  function rows(){
    return all.filter(row=>(initial==='all'||initialFor(row)===initial)&&(!norm(query)||norm(row.title).includes(norm(query))))
      .sort((a,b)=>a.title.localeCompare(b.title,'ja')||a.key.localeCompare(b.key,'ja'));
  }
  function card(row){
    const c=el('article');c.className='normal-title-card';c.dataset.titleKey=row.key;
    c.append(el('h3',row.title),el('p',row.mediaSourceText||'分類未確認'));
    if(row.savedReleasedDate)c.append(el('p','保存資料内の電子発売日: '+row.savedReleasedDate));
    if(row.savedUpcomingDate)c.append(el('p','保存資料内の発売予定日: '+row.savedUpcomingDate));
    const link=row.links?.[storeKey()];
    if(link?.destination){const a=el('a',store()==='kobo'?'Koboで開く ↗':'Amazonで開く ↗');a.href=link.destination;a.rel='sponsored noopener';a.target='_blank';a.dataset.linkKind=link.kind||'';c.append(a);}
    const latest=store()==='kobo'?row.koboLatest:null;
    if(latest?.status==='confirmed_latest_product'){
      c.append(el('p',latest.ordinaryVolumeConfirmed?`Kobo確認済み最新通常巻 ${latest.volume}巻 · 電子発売日 ${latest.releasedDate}`:`Kobo確認済み最新電子商品（通常巻番号は未確認） · 電子発売日 ${latest.releasedDate}`));
      c.append(el('p','商品ID: '+latest.productId));
      if(latest.confirmedContentGenre)c.append(el('p','確認済み内容分類: '+latest.confirmedContentGenre));
      if(latest.productUrl){const p=el('a','Koboの商品ページを開く ↗');p.href=latest.affiliateDestination||latest.productUrl;p.rel='sponsored noopener';p.target='_blank';p.dataset.productId=latest.productId;c.append(p);}
    }
    return c;
  }
  function mobileCard(row){
    const c=el('article');c.className='normal-title-card';c.dataset.titleKey=row.key;
    const link=row.links?.[storeKey()],brand=store()==='kobo'?'Kobo':'Amazon';
    const head=el('div');head.className='normal-title-headline';head.append(el('h3',row.title));
    if(link?.destination){const a=el('a','↗');a.href=link.destination;a.rel='sponsored noopener';a.target='_blank';a.dataset.linkKind=link.kind||'';a.className='normal-title-external';a.setAttribute('aria-label',row.title+' - '+brand+'で開く');head.append(a);}
    c.append(head);
    const kind=link?.kind||row.linkKind||'';
    const state=['search','title_search','title_keyword_search_unverified'].includes(kind)?'題名検索（結果未確認）':kind==='publisher_designated_individual_product'?'出版社指定の商品（本文未確認）':['confirmed_individual_product','individual_product'].includes(kind)?'保存資料で確認した商品':'公式シリーズ入口';
    c.append(el('p',state));
    if(row.sameNameReviewPending)c.append(el('p','同名作品の確認待ち'));
    const info=el('details');info.className='normal-title-info';info.append(el('summary','情報'));
    if(row.officialContentGenreSourceText)info.append(el('p',row.officialContentGenreSourceText));
    if(row.savedReleasedDate)info.append(el('p','保存資料内の電子発売日: '+row.savedReleasedDate));
    if(row.savedUpcomingDate)info.append(el('p','保存資料内の発売予定日: '+row.savedUpcomingDate));
    info.append(el('p',brand+'の開く先: '+state));
    const latest=store()==='kobo'?row.koboLatest:null;
    if(latest?.status==='confirmed_latest_product'){
      info.append(el('p',latest.ordinaryVolumeConfirmed?'Kobo確認済み最新通常巻 '+latest.volume+'巻 ・ 電子発売日 '+latest.releasedDate:'Kobo確認済み最新電子商品（通常巻番号は未確認） ・ 電子発売日 '+latest.releasedDate));
      info.append(el('p','商品ID: '+latest.productId));
      if(latest.confirmedContentGenre)info.append(el('p','確認済み内容分類: '+latest.confirmedContentGenre));
      if(latest.productUrl){const p=el('a','Koboの商品ページを開く ↗');p.href=latest.productUrl;p.rel='sponsored noopener';p.target='_blank';p.dataset.productId=latest.productId;p.className='normal-title-product';info.append(p);}
    }
    const amazon=store()==='amazon'?row.amazonLatest:null;
    if(amazon?.status==='saved_latest_electronic_product'){
      info.append(el('p','Amazon保存済み最新電子商品 ・ 電子発売日 '+amazon.releasedDate));
      info.append(el('p','ASIN: '+amazon.asin));
      if(amazon.confirmedContentGenre)info.append(el('p','確認済み内容分類: '+amazon.confirmedContentGenre));
      if(amazon.productUrl){const p=el('a','Amazonの商品ページを開く ↗');p.href=amazon.affiliateDestination||amazon.productUrl;p.rel='sponsored noopener';p.target='_blank';p.className='normal-title-product';info.append(p);}
    }
    c.append(info);return c;
  }
  function draw(){
    const h=host();if(!h||!mode||!['amazon','kobo'].includes(store()))return;restoreScope();
    root.dataset.titleMode='true';let panel=h.querySelector('.normal-title-panel');
    if(!panel){panel=el('section');panel.className='normal-title-panel';h.append(panel);}panel.setAttribute('aria-label','タイトル一覧');panel.replaceChildren();
    const form=el('form'),input=el('input');input.type='search';input.value=query;input.placeholder='題名で検索';input.setAttribute('aria-label','題名で検索');
    const initialsNav=el('nav');initialsNav.className='normal-title-initials';initialsNav.setAttribute('aria-label','題名の頭文字');
    for(const value of initials){const b=el('button',value==='all'?'すべて':value);b.type='button';b.dataset.initialChoice=value;b.setAttribute('aria-pressed',String(initial===value));b.onclick=()=>{initial=value;offset=0;draw();};initialsNav.append(b);}panel.append(initialsNav);
    const go=el('button','検索');go.type='submit';const clear=el('button','解除');clear.type='button';clear.onclick=()=>{query='';offset=0;draw();};
    form.onsubmit=e=>{e.preventDefault();if(e.isComposing)return;query=input.value;offset=0;draw();};form.className='normal-title-search normal-title-search-secondary';form.append(input,go,clear);panel.append(form);
    const list=rows();offset=Math.min(offset,Math.max(0,Math.floor((list.length-1)/pageSize)*pageSize));saveState();panel.dataset.total=String(list.length);panel.dataset.offset=String(offset);panel.dataset.store=storeKey();panel.dataset.initial=initial;panel.dataset.pageSize=String(pageSize);
    panel.append(el('p',`${list.length}件の題名入口（個別商品・電子版の確認件数ではありません）`));
    const sizeRow=el('div');sizeRow.className='normal-title-size-row';sizeRow.append(el('span','表示件数'));
    const segment=el('div');segment.className='normal-title-size-segment';for(const size of [10,20,100]){const b=el('button',String(size));b.type='button';b.setAttribute('aria-label','表示件数 '+size+'件');b.setAttribute('aria-pressed',String(pageSize===size));b.onclick=()=>{pageSize=size;offset=0;draw();};segment.append(b);}sizeRow.append(segment);panel.append(sizeRow);
    const results=el('div');results.className='normal-title-results';list.slice(offset,offset+pageSize).forEach(r=>results.append(mobileCard(r)));panel.append(results);
    const paging=el('nav');paging.className='normal-title-paging';paging.setAttribute('aria-label','ページ移動');
    const previous=el('button','前へ');previous.disabled=offset===0;previous.onclick=()=>{offset=Math.max(0,offset-pageSize);draw();};
    const center=el('button',String(Math.floor(offset/pageSize)+1)+' / '+String(Math.max(1,Math.ceil(list.length/pageSize))));center.className='normal-title-page-badge';center.setAttribute('aria-label','ページを移動');center.onclick=()=>{const last=Math.max(1,Math.ceil(list.length/pageSize)),answer=prompt('移動先のページ番号（1〜'+last+'）',String(Math.floor(offset/pageSize)+1));if(answer===null)return;const number=Number(answer);if(Number.isSafeInteger(number)&&number>=1&&number<=last){offset=(number-1)*pageSize;draw();}else alert('1〜'+last+'ページで指定してください');};
    const next=el('button','次へ');next.disabled=offset+pageSize>=list.length;next.onclick=()=>{offset+=pageSize;draw();};paging.append(previous,center,next);panel.append(paging);
    
  }
  async function load(){
    if(loaded)return;if(!loading)loading=(async()=>{
      const response=await fetch('/viewer/title-search-entrances.json');if(!response.ok)throw Error('Title catalogue HTTP '+response.status);
      const bytes=await response.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      if(hash!==EXPECTED)throw Error('Fixed r256 title asset mismatch');const document=JSON.parse(new TextDecoder().decode(bytes));
      if(document.kind!=='public_title_search_entrances'||document.rows.length!==10612)throw Error('Title schema/count mismatch');
      const seen=new Set();all=document.rows.filter(r=>{const f=[r.title,r.normalUrl,r.media,r.mediaSourceText,r.readershipSourceText,r.officialContentGenreSourceText,r.storeTaxonomySourceText].join('|');if(r.preserveSourceEntry||r.sameNameReviewPending)return true;if(seen.has(f))return false;seen.add(f);return true;});loaded=true;
    })().catch(e=>{loading=null;throw e;});return loading;
  }
  function attach(){const nav=host()?.querySelector('.unified-category-switch');if(!nav||!['amazon','kobo'].includes(store()))return;
    if(!nav.querySelector('[data-title-list-choice]')){const b=el('button','タイトル一覧');b.dataset.titleListChoice='true';b.onclick=async()=>{mode=true;b.disabled=true;try{await load();nav.querySelectorAll('button').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));draw();}finally{b.disabled=false;}};nav.append(b);}}
  root.addEventListener('click',e=>{if(e.target.closest('.unified-category-switch button:not([data-title-list-choice]),.store-switch button,.kind-switch button')){mode=false;saveState();delete root.dataset.titleMode;host()?.querySelector('.normal-title-panel')?.remove();}},true);
  let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;attach();});}).observe(root,{subtree:true,childList:true});
  window.ByuNormalTitleCatalogue={count:()=>all.length,isLoaded:()=>loaded,select:async()=>{mode=true;await load();attach();draw();},rows:()=>all,
     renderCardForVerification:key=>{const row=all.find(r=>r.key===key);return row?card(row):null;}};attach();
  if(savedState.active)window.addEventListener('load',()=>{let attempts=0;const resume=()=>{if(!['amazon','kobo'].includes(store())){if(++attempts<100)setTimeout(resume,100);return;}window.ByuNormalTitleCatalogue.select().catch(console.error);};resume();},{once:true});
})();
