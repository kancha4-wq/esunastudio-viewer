(() => {
'use strict';
const root=document.querySelector('[data-discovery-preview]');if(!root)return;
const key='byu-official-store-shelves-v1',oldNav=window.ByuHpNavigationBeforeRender||{},url=new URLSearchParams(location.search);
let pref={version:1,scopes:{},queries:{},offsets:{},pageSizes:{},archivedScopes:{}};
try{const v=JSON.parse(localStorage.getItem(key)||'null');if(v?.version===1&&v.scopes&&typeof v.scopes==='object'&&!Array.isArray(v.scopes))pref={...pref,...v};}catch{}
for(const k of ['queries','offsets','pageSizes','archivedScopes','attributes'])if(!pref[k]||typeof pref[k]!=='object'||Array.isArray(pref[k]))pref[k]={};

const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const link=(text,href)=>{const n=el('a',text),destination=window.ByuHpAffiliate.href(href);n.href=destination;n.target='_blank';n.rel=destination!==href?'sponsored noopener noreferrer':'noopener noreferrer';return n;};
const button=(text,fn)=>{const n=el('button',text);n.type='button';n.onclick=fn;return n;};
const save=()=>{try{localStorage.setItem(key,JSON.stringify(pref));}catch{}};
const pageSizeFor=c=>[10,20,100].includes(pref.pageSizes[c.scope])?pref.pageSizes[c.scope]:20;
function pageSizeBar(c){const bar=el('div',undefined,'catalogue-page-size official-page-size');bar.setAttribute('aria-label','表示件数');bar.append(el('span','表示件数'));for(const size of [10,20,100]){const b=button(String(size),()=>{if(pageSizeFor(c)===size)return;pref.pageSizes[c.scope]=size;pref.offsets[c.scope]=0;save();render(true);});b.dataset.pageSize=String(size);b.setAttribute('aria-pressed',String(pageSizeFor(c)===size));bar.append(b);}return bar;}
const updateDay=value=>value?new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value)):'未確認';
const context=()=>{const s=root.querySelector('.store-switch [data-store][aria-pressed=true]')?.dataset.store,k=root.querySelector('.kind-switch [data-kind][aria-pressed=true]')?.dataset.kind;return ['amazon','kobo'].includes(s)&&['manga','novel'].includes(k)?{uiStore:s,store:s==='kobo'?'rakuten_kobo':s,kind:k,scope:(s==='kobo'?'rakuten_kobo':s)+':'+k,brand:s==='kobo'?'楽天Kobo':'Amazon'}:null;};
const host=el('section',undefined,'official-store-view live-catalogue');host.hidden=true;root.querySelector('.shelf-switch').before(host);
document.head.append(el('style',`[data-unified-store] .shelf-switch,[data-official-shelf-view=official] .shelf-switch,[data-official-shelf-view=official] .catalogue-content,[data-official-shelf-view=official] .discovery-live{display:none!important}.official-store-view{padding:18px;background:#f4f9fc;border:1px solid #cadbe6}.official-view-switch{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.official-view-switch button{padding:10px 16px;border:1px solid #245f7d;border-radius:6px;background:#fff;color:#194a65;font-weight:700}.official-view-switch button[aria-pressed=true]{background:#175b8d;color:white}.official-store-tools{display:flex;flex-wrap:wrap;gap:10px}.official-store-tools select{max-width:100%;min-width:180px;padding:10px}.official-store-tools input{width:170px!important;max-width:100%;padding:10px}.official-source-note{font-size:13px;line-height:1.7}.official-store-view .catalogue-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.official-store-view .catalogue-card{display:block;padding:16px;border:1px solid #d6e0e7;background:white;border-radius:8px;min-width:0}.official-store-view .catalogue-card.has-cover{display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px;align-items:start}.official-store-view .catalogue-card h3{font-size:16px;line-height:1.7;margin:0 0 10px}.official-store-view .catalogue-card p{font-size:13px;line-height:1.7}.official-store-view .cover-frame{width:88px;min-height:120px;background:#edf1f4;display:flex;align-items:center;justify-content:center;font-size:11px;text-align:center}.official-store-view .cover-frame img{width:87px;height:121px;object-fit:contain}.official-store-view .catalogue-paging button{padding:10px 20px;margin:12px 8px 0 0}.official-source-unavailable{font-size:13px}.official-store-view .catalogue-title-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;min-height:44px}.official-store-view .catalogue-title-row>.official-updated-day{flex:1 1 auto;margin:0;font-size:14px;line-height:1.5}.official-store-view .catalogue-title-row>.official-browse-link{margin:0}.official-page-size{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:10px 0}.official-page-size button{min-width:44px;min-height:40px;padding:7px 10px;border:1px solid #44738e;border-radius:5px;background:#fff;color:#173d55}.official-page-size button[aria-pressed=true]{background:#175b8d;color:#fff}@media(max-width:600px){.official-store-view .catalogue-results{grid-template-columns:1fr}.official-store-tools select{width:100%}}`));
let assetPromise,asset,ticket=0,signature='',urlApplied=false;
const observedDefs=[['manga_new','manga','新着'],['light_novel_free','novel','売れ筋(無料)'],['light_novel_paid','novel','売れ筋(有料)']];

// Frozen, provenance-checked Oct17 observations; optional failure keeps the existing shelves.
async function installVerifiedManga(d){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
 try{
  const r=await fetch('/viewer/amazon-manga-ranking-verified-20261017.json',{cache:'no-cache',signal:controller.signal});if(!r.ok)throw Error('Ranking snapshot unavailable');
  const raw=await r.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',raw))].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(hash!=='de2230280c2cd1273c860693e840811101f6a787de607b55891e4d4db84e2de0')throw Error('Ranking snapshot hash mismatch');
  const value=JSON.parse(new TextDecoder().decode(raw));
  if(value.schema!=='byu-hp-verified-manga-rankings-v1'||value.sourceManifestSha256!=='5d501d3f7fa87bd2100f4bb173aa647fba203e6193694acc39f127eaff193880'||value.shelves?.length!==2)throw Error('Unapproved ranking snapshot');
  const defs={manga_free:['amazon-common:free-manga-ranking',50],manga_paid:['amazon-public-general:paid-manga-top100:2293143051',95]},plans=[];
  for(const snap of value.shelves){
   const def=defs[snap.shelfKey],shelf=d.collections.find(x=>x.sectionKey===snap.sectionKey);if(!def||snap.sectionKey!==def[0]||!shelf||snap.rows?.length!==def[1])throw Error('Ranking scope mismatch');
   const ids=new Set(),ranks=new Set();let newest=-Infinity;
   const members=snap.rows.map(row=>{
    const u=new URL(row.url),source=new URL(row.sourceUrl),time=Date.parse(row.observedAtUTC);
    if(!/^[A-Z0-9]{10}$/.test(row.productId)||u.protocol!=='https:'||u.hostname!=='www.amazon.co.jp'||u.pathname!=='/dp/'+row.productId||source.protocol!=='https:'||source.hostname!=='www.amazon.co.jp'||!row.title||!Number.isInteger(row.rank)||row.rank<1||row.rank>100||!Number.isFinite(time)||ids.has(row.productId)||ranks.has(row.rank))throw Error('Invalid ranking observation');
    ids.add(row.productId);ranks.add(row.rank);newest=Math.max(newest,time);
    return {asin:row.productId,officialRank:row.rank,title:row.title,productUrl:row.url,sourceUrl:row.sourceUrl,observedAtUtc:row.observedAtUTC,sourceSha256:row.sourceSha256};
   }).sort((a,b)=>a.officialRank-b.officialRank);
   if(newest<Date.parse(shelf.observedAtUtc))throw Error('Older shelf observation');
   for(const old of shelf.members){const incoming=members.find(x=>x.asin===old.productId);if(!incoming||incoming.productUrl!==old.url||Date.parse(incoming.observedAtUtc)<Date.parse(old.observedAtUtc||shelf.observedAtUtc))throw Error('Existing product link or time would regress');}
   plans.push({shelf,snap,members});
  }
  if(new Set(plans.map(x=>x.snap.shelfKey)).size!==2)throw Error('Repeated shelf');
  for(const {shelf,snap,members}of plans)Object.assign(shelf,{knownMembers:shelf.members,feedSnapshot:true,observationOnly:true,members,observedAtUtc:snap.observedAtUtc,sourceUrl:snap.sourceUrl,observedCount:members.length});
  root.dataset.verifiedMangaFeed='ready';
 }catch(e){root.dataset.verifiedMangaFeed='fallback';}
 finally{clearTimeout(timer);}
 return d;
}


// Current public first-page snapshots; immutable product facts remain in their original catalogue.
function validateCurrentAmazonRanks(value,d){
 const defs={manga_free:['amazon-common:free-manga-ranking','manga',50],manga_paid:['amazon-public-general:paid-manga-top100:2293143051','manga',49],manga_new:['amazon-observed:manga_new','manga',47],light_novel_free:['amazon-observed:light_novel_free','novel',50],light_novel_paid:['amazon-observed:light_novel_paid','novel',49]},plans=[],seen=new Set();
 if(value.schema!=='byu-hp-amazon-ranking-observations-v1'||value.sourceDate!=='2026-10-23'||value.snapshots?.length!==5||value.sourceObservationOnly!==true||value.imagesOrPriceIncluded!==false)throw Error('Unapproved current ranking scope');
 for(const snap of value.snapshots){
  const def=defs[snap.shelfKey],shelf=def&&d.collections.find(x=>x.sectionKey===def[0]);
  if(!def||seen.has(snap.shelfKey)||!shelf||shelf.store!=='amazon'||shelf.mediaScope!==def[1]||snap.store!=='amazon'||snap.media!==def[1]||snap.rows?.length!==def[2])throw Error('Current ranking shelf mismatch');
  seen.add(snap.shelfKey);
  const expectedSource=snap.shelfKey==='manga_free'?'https://www.amazon.co.jp/gp/bestsellers/digital-text/2293143051/ref=zg_bs?ie=UTF8&tf=1':snap.shelfKey==='manga_paid'?'https://www.amazon.co.jp/bestsellers/digital-text/2293143051/':snap.shelfKey==='manga_new'?'https://www.amazon.co.jp/gp/new-releases/digital-text/2293143051':'https://www.amazon.co.jp/gp/bestsellers/digital-text/2410280051/ref=zg_bs'+(snap.shelfKey==='light_novel_free'?'?ie=UTF8&tf=1':'');
  const acquired=Date.parse(snap.observedAtUTC),coverage=snap.coverage,ids=new Set(),ranks=new Set();
  if(snap.sourceUrl!==expectedSource||!Number.isFinite(acquired)||acquired<Date.parse(shelf.observedAtUtc)||!snap.observedAtUTC.startsWith('2026-10-23T')||!/^[a-f0-9]{64}$/.test(snap.sourceHtmlSha256)||coverage?.page!==1||coverage.fullTop100!==false||coverage.observedRows!==def[2]||coverage.sourceVisibleCardCount!==def[2]||snap.imageOrPriceData!==false||snap.newSkuAdmitted!==false||snap.productDetailVerified!==false)throw Error('Current ranking provenance mismatch');
  const members=snap.rows.map(row=>{
   const canonical='https://www.amazon.co.jp/dp/'+row.productId;
   if(row.store!=='amazon'||!/^[A-Z0-9]{10}$/.test(row.productId)||row.url!==canonical||!row.title?.trim()||row.title.includes('\ufffd')||!Number.isInteger(row.rank)||row.rank<1||row.rank>100||ids.has(row.productId)||ranks.has(row.rank)||row.observedAtUTC!==snap.observedAtUTC||row.sourceUrl!==snap.sourceUrl||row.sourceSha256!==snap.sourceHtmlSha256||row.later!==false)throw Error('Invalid current ranking row');
   ids.add(row.productId);ranks.add(row.rank);
   const prior=(shelf.knownMembers||shelf.members).find(x=>(x.productId||x.asin)===row.productId);if(prior&&(prior.url||prior.productUrl)!==canonical)throw Error('Product link identity would change');
   return{asin:row.productId,officialRank:row.rank,title:row.title,productUrl:canonical,sourceUrl:row.sourceUrl,observedAtUtc:row.observedAtUTC,sourceSha256:row.sourceSha256};
  }).sort((a,b)=>a.officialRank-b.officialRank);
  const absent=Array.from({length:100},(_,i)=>i+1).filter(x=>!ranks.has(x));if(JSON.stringify(absent)!==JSON.stringify(coverage.unobservedRanks))throw Error('Incorrect observed coverage');
  plans.push({shelf,snap,members});
 }
 return plans;
}
async function installCurrentAmazon(d){
 await installVerifiedManga(d);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
 try{
  const response=await fetch('/viewer/amazon-ranking-observations-20261023.json?v=amazon-ranks-20261023',{cache:'no-cache',signal:controller.signal});if(!response.ok)throw Error('Current rankings unavailable');
  const raw=await response.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',raw))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!=='f88d84d4fb4bfad638aeb21112d83ec12c9a28523b120a249288d8cfc5a1f393')throw Error('Current ranking hash mismatch');
  const plans=validateCurrentAmazonRanks(JSON.parse(new TextDecoder().decode(raw)),d);
  for(const {shelf,snap,members}of plans){const previous={members:shelf.members,observedAtUtc:shelf.observedAtUtc,sourceUrl:shelf.sourceUrl,coverage:shelf.coverage};Object.assign(shelf,{knownMembers:shelf.knownMembers||shelf.members,priorRankingObservation:previous,feedSnapshot:true,observationOnly:true,currentRankingObservation:true,members,observedAtUtc:snap.observedAtUTC,sourceUrl:snap.sourceUrl,observedCount:members.length,coverage:snap.coverage});}
  root.dataset.currentAmazonRanks='ready';root.dataset.amazonRankingSourceDate='2026-10-23';
 }catch(e){root.dataset.currentAmazonRanks='fallback';}
 finally{clearTimeout(timer);}
 return d;
}

const load=()=>assetPromise||(assetPromise=Promise.all(['/viewer/official-store-shelves.json?v=ranking-20261023','/viewer/amazon-observed-rankings-20261019.json','/viewer/amazon-observed-rankings-diff-20261019.json'].map(path=>fetch(path,{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Shelf data unavailable: '+path);return r.json();}))).then(([d,observed,diff])=>{if(observed.schema!=='amazon_official_ranking_observation_v1'||diff.schema!=='amazon_official_ranking_diff_v1'||diff.baseSha256!==observed.sourceSha256||diff.singleInstantSnapshot!==false)throw Error('Unexpected ranking observation');for(const [id,media,title]of observedDefs){const base=observed.items.filter(x=>x.shelf===id).sort((a,b)=>a.officialRank-b.officialRank),later=diff.items.filter(x=>x.shelf===id).sort((a,b)=>a.officialRank-b.officialRank);if(base.length!==30||base.some((x,i)=>x.officialRank!==i+1||!x.asin||!x.title||!x.sourceUrl||!x.observedAtUtc)||later.some(x=>x.officialRank<31||x.officialRank>100||!x.asin||!x.title||!x.sourceUrl||x.observedWindowUtc?.length!==2))throw Error('Incomplete observed ranking: '+id);const members=[...base,...later],ranks=members.map(x=>x.officialRank);if(new Set(ranks).size!==members.length)throw Error('Repeated rank: '+id);d.collections.push({sectionKey:'amazon-observed:'+id,store:'amazon',mediaScope:media,title,sourceUrl:base[0].sourceUrl,observedAtUtc:base[0].observedAtUtc,observedCount:members.length,observationOnly:true,members});}return installCurrentAmazon(d).then(value=>asset=value);}));
const choicesFor=c=>asset.collections.filter(x=>x.store===c.store&&(x.mediaScope===c.kind||x.mediaScope==='kindle_all')&&(!x.archivedFromPrimary||url.get('officialSection')===x.sectionKey));
const dateShelf=x=>/:(?:landing:)?(?:new|preorder):/.test(x.sectionKey)||['新刊','新着','近日発売'].includes(x.approvedCategory);
const normalChoice=(c,x)=>!dateShelf(x)&&!(c.store==='amazon'&&c.kind==='novel'&&x.sectionKey==='amazon-light-novel:new-on-amazon');
const categoryLabel=(c,x)=>{
 if(c.store==='amazon'&&c.kind==='manga')return ({'amazon-common:featured-manga:26181034051':'人気','amazon-common:free-manga-ranking':'売れ筋(無料)','amazon-public-general:paid-manga-top100:2293143051':'売れ筋(有料)','amazon-common:new-on-amazon-manga':'新着一覧'}[x.sectionKey]||x.title);
 if(c.store==='amazon'&&c.kind==='novel')return ({
  'amazon-light-novel:new-on-amazon':'新着',
  'amazon-light-novel:upcoming30':'発売予定',
  'amazon-common:featured-lightnovel:2410280051':'新着'
 }[x.sectionKey]||x.title);
 if(c.store==='rakuten_kobo'&&/^[^:]+:(manga|lightnovel):landing:new:/.test(x.sectionKey))return '新刊';
 if(c.store==='rakuten_kobo'&&/^[^:]+:(manga|lightnovel):landing:preorder:/.test(x.sectionKey))return '発売予定';
 return x.title;
};
const productsFor=(c,shelf)=>{if(shelf.observationOnly)return[];const by=new Map(ByuCatalogue.products.filter(p=>p.store===c.uiStore&&p.kind===c.kind&&p.enabled).map(p=>[p.id,p]));return shelf.members.flatMap(m=>{const p=by.get(m.productId);return p&&p.title===m.title&&p.normalUrl===m.url&&p.authors===m.authors?[{p,m}]:[];});};
const navigationFor=(c,shelf)=>c.store==='amazon'?(shelf.navigationMembers||[]).filter(n=>{if(n.entityKind!=='series_navigation'||!n.title||!n.normalUrl)return false;try{const u=new URL(n.normalUrl);return u.protocol==='https:'&&['www.amazon.co.jp','amazon.co.jp'].includes(u.hostname);}catch{return false;}}):[];
const entriesFor=(c,shelf)=>[...productsFor(c,shelf).map(x=>({...x,entityKind:'individual_ebook'})),...navigationFor(c,shelf).map(n=>({n,m:n,entityKind:'series_navigation'}))].sort((a,b)=>a.m.ordinal-b.m.ordinal);
function conditionPicker(c,choices,selected,tools){
 if(c.store!=='amazon')return;
 const defs=[['limited_time_browser_reading','期間限定のブラウザ閲覧'],['KindleUnlimited_','Kindle Unlimited対象'],['official_free_manga_shelf','公式の無料マンガ']];
 const options=defs.flatMap(([prefix,label])=>{const candidates=choices.filter(x=>x.condition?.startsWith(prefix));return candidates.length?[{prefix,label,target:candidates.find(x=>x.sectionKey===selected)||candidates[0]}]:[];});
 if(!options.length)return;const select=el('select');select.dataset.conditionPicker='true';select.setAttribute('aria-label','利用条件から探す');const all=el('option','利用条件から探す');all.value='';select.append(all);
 for(const x of options){const o=el('option',x.label);o.value=x.target.sectionKey;select.append(o);}select.value=options.some(x=>x.target.sectionKey===selected)?selected:'';
 select.onchange=()=>{if(!select.value)return;pref.scopes[c.scope]=select.value;pref.offsets[c.scope]=0;save();render(true);};tools.append(select);
}
function attributePicker(c,shelf,all,tools){
 root.dataset.selectedAttribute="";return {value:"",test:()=>true};
 /* Legacy attributes remain saved but inactive; explicit genre/category controls own discovery. */
 const options=new Map(),tests=new Map();const add=(value,label,test)=>{const n=all.filter(test).length;if(n){options.set(value,label+' ('+n+')');tests.set(value,test);}};
 add('anime','アニメ化',x=>!!x.p&&(x.p.anime||!!x.p.details?.adaptation));
 const fields=[['contentGenres','内容ジャンル（編集分類）'],['officialContentGenres','公式サイトの内容分類'],['publisherContentGenres','出版社の内容分類']];
 for(const [field,label]of fields){const tags=[...new Set(all.flatMap(x=>x.p?.details?.[field]||[]))];for(const tag of tags)add(field+':'+tag,label+'：'+tag,x=>!!x.p?.details?.[field]?.includes(tag));}
 if(shelf.condition?.startsWith('limited_time_browser_reading')){
  add('period_stated','終了日時の記載あり',x=>!!x.m.readerEvidence?.periodEndDisplayed);
  add('period_unknown','終了日時は未確認',x=>!x.m.readerEvidence?.periodEndDisplayed);
 }
 // Sale tags require explicit evidence; a low price or a ranking is not sale evidence.
 add('official_sale','公式セールの根拠あり',x=>x.p?.hpFeaturedReason?.type==='official_sale'&&!!x.p.hpFeaturedReason.sourceUrl);
 const scope=c.scope+'|'+shelf.sectionKey;let value=typeof pref.attributes[scope]==='string'?pref.attributes[scope]:'';
 if(value&&!tests.has(value)){value='';pref.attributes[scope]='';save();}
 if(options.size){const select=el('select');select.dataset.attributePicker='true';select.setAttribute('aria-label','作品の特徴で絞り込む');const every=el('option','すべての特徴');every.value='';select.append(every);for(const [id,label]of options){const o=el('option',label);o.value=id;select.append(o);}select.value=value;select.onchange=()=>{pref.attributes[scope]=select.value;pref.offsets[c.scope]=0;save();render(true);};tools.append(select);}
 root.dataset.selectedAttribute=value;const dates=tools.querySelector('.date-range-controls');if(dates)tools.append(dates);const disclosure=tools.querySelector('.official-browse-link,.book-search-disclosure');if(disclosure)tools.append(disclosure);return {value,test:value?tests.get(value):()=>true};
}
const firstFor=(c,choices)=>{const approved=c.store==='amazon'?choices.find(x=>x.sectionKey===(c.kind==='manga'?'amazon-common:featured-manga:26181034051':'amazon-common:featured-lightnovel:2410280051')):null;if(approved)return approved;const dedicated=choices.filter(x=>x.mediaScope===c.kind),pool=dedicated.length?dedicated:choices;return pool.find(x=>entriesFor(c,x).length)||pool[0];};
function navigationCard(n){const card=el('article',undefined,'catalogue-card catalogue-series-navigation');card.dataset.navigation=n.navigationEntityKey||n.normalUrl;card.dataset.entityKind='series_navigation';card.dataset.officialOrdinal=String(n.ordinal);const title=el('h3');title.append(link(n.title,n.normalUrl));card.append(title,el('p','シリーズ案内（個別巻ではありません）'),el('p','確認した公式ページ内の掲載位置 '+n.ordinal+'（順位ではありません）'),link('Amazonでシリーズを見る',n.normalUrl));return card;}
function observedCard(m){const card=el('article',undefined,'catalogue-card catalogue-observed-rank');card.dataset.officialRank=String(m.officialRank);card.dataset.asin=m.asin;const title=el('h3'),badge=el('span',m.officialRank+'位','catalogue-rank-badge');badge.setAttribute('aria-label','確認時の公式掲載順位 '+m.officialRank+'位');title.append(badge,document.createTextNode(' '),Object.assign(link(m.title,m.productUrl),{lang:"ja",dir:"auto",translate:true}));card.append(title);const time=m.observedWindowUtc?m.observedWindowUtc[0].replace('T',' ')+'–'+m.observedWindowUtc[1].replace('T',' '):m.observedAtUtc.replace('T',' ');card.append(el('p','確認 '+time+' UTC','official-source-note'));return card;}
function observedResults(c,shelf,q,savedOffset){
 const known=shelf.feedSnapshot?new Map(productsFor(c,{...shelf,observationOnly:false,members:shelf.knownMembers}).map(x=>[x.p.id,x])):new Map();
 const needle=q.normalize('NFKC').toLowerCase(),rows=shelf.members.filter(m=>!needle||(m.title+' '+(known.get(m.asin)?.p.title||'')+' '+(known.get(m.asin)?.p.authors||'')).normalize('NFKC').toLowerCase().includes(needle)),missing=Array.from({length:100},(_,i)=>i+1).filter(rank=>!shelf.members.some(m=>m.officialRank===rank)),size=pageSizeFor(c),offset=Math.min(savedOffset,Math.max(0,Math.floor((rows.length-1)/size)*size));
 pref.offsets[c.scope]=offset;root.dataset.officialSection=shelf.sectionKey;root.dataset.officialResultCount=String(rows.length);root.dataset.officialProductResultCount=String(rows.length);root.dataset.officialNavigationResultCount='0';
 const ranges=[];for(const rank of missing){const last=ranges.at(-1);if(last&&last[1]+1===rank)last[1]=rank;else ranges.push([rank,rank]);}
 const gapText=ranges.map(([a,b])=>a===b?String(a):a+'～'+b).join(' / ');
 if(shelf.currentRankingObservation){const note=el('p',undefined,'official-source-note amazon-ranking-coverage');note.append(el('span','ページ'),Object.assign(el('bdi',' 1 · '),{dir:'ltr'}),el('span','確認時の公式掲載順位 '),Object.assign(el('bdi',Math.min(...shelf.members.map(x=>x.officialRank))+'–'+Math.max(...shelf.members.map(x=>x.officialRank))+' / 100'),{dir:'ltr'}));host.append(note,el('p','確認日の公式ページに載っていた範囲を表示しています。表示件数はストア全体の総数ではありません。最新の掲載内容・条件は公式ページで確認してください。','official-source-note amazon-ranking-scope'));}
 const rankNote=el('p','順位は観測時点ごとの記録です。未収録: ','official-source-note');rankNote.append(missing.length?Object.assign(el('bdi',gapText),{dir:'ltr'}):el('span','なし'));host.append(rankNote);
 if(shelf.feedSnapshot){conditionNote(shelf);const count=el('p',undefined,'catalogue-count');count.append(Object.assign(el('bdi',rows.length+' / '+shelf.members.length),{dir:'ltr'}));host.append(count);root.dataset.feedObservedRecordCount=String(rows.length);}
 if(shelf.currentRankingObservation){const details=el('details',undefined,'catalogue-source-details');details.append(el('summary','情報について'));for(const note of [...host.querySelectorAll(':scope > .official-source-note:not(.amazon-ranking-coverage)')])details.append(note);host.append(details);}
 host.append(pageSizeBar(c));const results=el('div',undefined,'catalogue-results');
 for(const m of rows.slice(offset,offset+size)){
  const prior=known.get(m.asin);let card;
  if(prior){
   card=cardFor(c,prior.p,{...prior.m,rank:m.officialRank,observedAtUtc:m.observedAtUtc},shelf);
   if(prior.p.title!==m.title){const note=el('p',(ByuCatalogue.ui[root.dataset.previewLang]?.source||'Source')+' · ');note.append(Object.assign(el('span',m.title),{lang:'ja',dir:'auto',translate:true}));card.querySelector('.catalogue-item-details')?.append(note);}
  }else{card=observedCard(m);if(shelf.feedSnapshot){if(shelf.currentRankingObservation){const t=el('time',undefined,'official-observed-time');t.dateTime=m.observedAtUtc;t.append(el('span','取得日時：'),Object.assign(el('bdi',m.observedAtUtc),{dir:'ltr'}));card.querySelector('.official-source-note')?.replaceWith(t);}else{const t=el('time','取得日時：'+m.observedAtUtc,'official-observed-time');t.dateTime=m.observedAtUtc;card.querySelector('.official-source-note')?.replaceWith(t);}}}
  for(const time of card.querySelectorAll('time'))time.dir='ltr';card.dataset.asin=m.asin;card.dataset.originalProductUrl=m.productUrl;card.dataset.observedTitle=m.title;
  results.append(card);
 }
 if(!rows.length)results.append(el('p','一致する保存済み掲載作品はありません。'));host.append(results);
 if(rows.length){const paging=el('div',undefined,'catalogue-paging'),back=button('前へ',()=>{pref.offsets[c.scope]=offset-size;save();render(true);}),next=button('次へ',()=>{pref.offsets[c.scope]=offset+size;save();render(true);});back.disabled=offset===0;next.disabled=offset+size>=rows.length;paging.append(back,el('span',Math.floor(offset/size)+1+' / '+Math.ceil(rows.length/size)),next);host.append(paging);}
 host.append(pageSizeBar(c));
}
function categoryButtons(c,choices,selected){if(c.store!=='amazon')return;const order=c.kind==='manga'?['新刊','近日発売','人気','無料']:['新着','近日発売'],active=choices.find(x=>x.sectionKey===selected)?.approvedCategory,bar=el('nav',undefined,'official-view-switch approved-category-switch');bar.setAttribute('aria-label',c.kind==='manga'?'Amazon漫画カテゴリ':'Amazonライトノベルカテゴリ');for(const category of order){const target=choices.find(x=>x.approvedCategory===category);if(!target)continue;const b=button(category,()=>{pref.scopes[c.scope]=target.sectionKey;pref.offsets[c.scope]=0;save();render(true);});b.dataset.approvedCategory=category;b.setAttribute('aria-pressed',String(category===active));bar.append(b);}if(bar.childElementCount)host.append(bar);}
const legacyMode=()=>root.querySelector('.shelf-switch [data-shelf-choice][aria-pressed=true]')?.dataset.shelfChoice||'new';
function unifiedCategoryButtons(c,choices,selected){
 const bar=el('nav',undefined,'official-view-switch unified-category-switch');bar.setAttribute('aria-label',c.brand+'のカテゴリ');bar.dataset.unifiedCategory='true';
 const visible=choices.filter(x=>normalChoice(c,x));if(c.store==='amazon'){const priority=c.kind==='manga'?['amazon-common:featured-manga:26181034051','amazon-common:free-manga-ranking','amazon-public-general:paid-manga-top100:2293143051','amazon-observed:manga_new']:['amazon-common:featured-lightnovel:2410280051','amazon-observed:light_novel_free','amazon-observed:light_novel_paid'];visible.sort((a,b)=>{const x=priority.indexOf(a.sectionKey),y=priority.indexOf(b.sectionKey);return(x<0?99:x)-(y<0?99:y);});}
 for(const target of visible){const b=button(categoryLabel(c,target),()=>{pref.scopes[c.scope]=target.sectionKey;pref.offsets[c.scope]=0;save();render(true);});b.dataset.officialSection=target.sectionKey;b.setAttribute('aria-pressed',String(selected===target.sectionKey));bar.append(b);}
 const extras=[['new','新刊'],['upcoming','発売予定'],...(c.store==='amazon'&&c.kind==='manga'?[]:[['featured','注目']]),['anime','アニメ化'],['genres','分類']];
 for(const [mode,name]of extras){const calendar=c.store==='rakuten_kobo'&&['new','upcoming'].includes(mode)?choices.find(x=>x.calendarRefresh&&x.sectionKey.includes(mode==='new'?':landing:new:':':landing:preorder:')):null;const b=button(name,async()=>{if(calendar){pref.scopes[c.scope]=calendar.sectionKey;pref.offsets[c.scope]=0;save();return render(true);}pref.scopes[c.scope]='auxiliary';pref.offsets[c.scope]=0;save();await ByuSelect({store:c.uiStore,kind:c.kind,mode,offset:0});render(true);});b.dataset.catalogueCategory=mode;b.setAttribute('aria-pressed',String(calendar?selected===calendar.sectionKey:selected==='auxiliary'&&legacyMode()===mode));bar.append(b);}
 host.append(bar);
}
function conditionNote(shelf){const condition=shelf.condition||'';let text='';if(condition.startsWith('KindleUnlimited_'))text='Kindle Unlimitedの利用条件が適用されます。無料購入を示す棚ではありません。';else if(condition.startsWith('official_free_manga_shelf'))text='Amazonの「無料マンガ」棚で観測した商品です。無料購入・試し読みの区分や現在の条件は、各商品の公式ページで確認してください。';else if(condition.startsWith('limited_time_browser_reading'))text='期間限定のブラウザ閲覧として観測した棚です。無料購入・恒常無料ではありません。対象期間や閲覧条件は公式ページで確認してください。';else if(condition.startsWith('official_combined_new_and_upcoming'))text='新刊と予約受付中を合わせたAmazon公式棚です。全商品を発売済みの新刊として扱っていません。';if(!text&&shelf.conditionLabelJa&&/無料|新着|近日発売/.test(shelf.conditionLabelJa))text=shelf.conditionLabelJa;if(text){const n=el('p',text,'official-condition-note official-source-note');n.dataset.condition=condition;host.append(n);}}
function savedReaderUrl(p,m){const e=m.readerEvidence;if(typeof m.readerUrl!=='string'||!m.readerUrl||!e||e.productId!==p.id||e.readerUrl!==m.readerUrl||e.readerHrefGeneratedFromAsin!==false||!e.sourceHtmlSha256)return null;try{const u=new URL(m.readerUrl);return u.protocol==='https:'&&u.hostname==='read.amazon.co.jp'&&u.pathname==='/manga/'+p.id?m.readerUrl:null;}catch{return null;}}
function readerLinks(c,p,m,shelf,body){if(c.store!=='amazon'||!shelf?.condition?.startsWith('limited_time_browser_reading'))return;const reader=savedReaderUrl(p,m),e=m.readerEvidence||{};if(reader){const a=link('Amazonのブラウザ閲覧を開く',reader);a.dataset.readerLink='observed';const wrapper=el('p');wrapper.append(a);body.append(wrapper);if(e.periodEndDisplayed)body.append(el('p','観測時の期間終了表示：'+e.periodEndDisplayed+(e.periodEndTimezone?'（'+e.periodEndTimezone+'）':'（タイムゾーン未記載）')));body.append(el('p','現在の対象期間・ログイン要否・閲覧条件は公式画面で確認してください。'));}else{const a=link('Amazonの棚でブラウザ閲覧条件を確認',shelf.moreHref||shelf.sourceUrl);a.dataset.readerLink='unconfirmed';const wrapper=el('p');wrapper.append(a);body.append(wrapper);}}
function coverFrame(p){const frame=el('div',undefined,'cover-frame'),c=p.cover,s=window.ByuHpProviderImageStates?.[p.id];
 if(s&&s.url===c?.url&&s.fetchedAt===c?.fetchedAt){frame.dataset.coverState='provider_placeholder';frame.append(el('span',s.label));}
 else if(c&&c.permission==='verified_rws_licensed'&&c.mediaApproved&&c.creditProvided&&c.productId===p.id&&c.fetchedAt<=Date.now()&&c.expiresAt>Date.now()){
  frame.dataset.coverState='ready';const a=link('',c.boundPurchaseUrl),img=el('img');img.src=c.url;img.alt=p.title;img.width=87;img.height=121;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{a.remove();frame.dataset.coverState='error';frame.append(el('span','画像読込失敗'));};a.append(img);frame.append(a);
 }else{frame.dataset.coverState=c?'unavailable':'unacquired';frame.append(el('span',window.ByuHpCoverImages?window.ByuHpCoverImages.reason(p,'ja'):c?'表紙の表示条件未確認':'表紙未取得'));}return frame;
}
function cardFor(c,p,m,shelf){
 const card=el('article',undefined,'catalogue-card'+(c.uiStore==='kobo'?' has-cover':''));card.dataset.product=p.id;card.dataset.officialOrdinal=String(m.ordinal);if(m.rank!==null&&m.rank!==undefined)card.dataset.officialRank=String(m.rank);
 if(c.uiStore==='kobo')card.append(coverFrame(p));const body=el('div',undefined,'catalogue-card-body'),title=el('h3');const prominentRank=Number.isInteger(m.rank)&&m.rank>0;if(prominentRank){const badge=el('span',m.rank+'位','catalogue-rank-badge');badge.setAttribute('aria-label','確認時の公式順位 '+m.rank+'位');title.append(badge,document.createTextNode(' '));}title.append(Object.assign(link(p.title,p.url),{lang:'ja',dir:'auto',translate:true}));body.append(title);
 if(shelf.calendarRefresh)card.dataset.calendarDate=m.calendarElectronicDate||p.date||'';if(m.calendarObservation){card.dataset.calendarObserved='true';card.dataset.calendarDate=m.calendarElectronicDate;card.dataset.storeDateConflict=String(m.calendarObservation.storeDateConflict);card.dataset.originalProductDate=p.date||'';}const captured=m.observedAtUtc||shelf.observedAtUtc;if(captured){const time=el('time','取得日時：'+captured,'official-observed-time');time.dateTime=captured;body.append(time);}const d=p.details||{},credits=d.contributorsWithRoles?.length?d.contributorsWithRoles.map(x=>x.role+'・'+x.name).join(' / '):d.contributors||p.authors;
 if(credits){title.append(document.createTextNode('　'),el('span',credits,'catalogue-author-inline'));}
 body.append(el('p',(c.store==='amazon'?'発売日（Amazon登録表示）':'電子版発売日')+'：'+((shelf.calendarRefresh?m.calendarElectronicDate:p.date)||'未確認'),'catalogue-date'),el('p','電子書籍・広告','catalogue-medium'));if(!prominentRank)body.append(el('p',Number.isInteger(m.rank)&&m.rank>0?'確認時の公式順位 '+m.rank:(shelf.calendarRefresh?'発売日降順の表示位置 ':'公式掲載位置 ')+m.ordinal+'（順位ではありません）','catalogue-rank'));
 const detail=el('details',undefined,'catalogue-item-details');detail.append(el('summary','詳細'));
  if(m.calendarObservation){const o=m.calendarObservation;detail.append(Object.assign(el('p','公式カレンダーの発売日候補です。販売・予約可否は未確認です。'),{lang:'ja',dir:'auto'}),link('カレンダー出典',o.sourceUrl));if(o.storeDateConflict)detail.append(Object.assign(el('p','カレンダー表示日：'+o.releaseDateObserved+' ／ 既存の商品発売日：'+o.existingProductDate+'（商品情報は変更していません）','calendar-date-conflict'),{lang:'ja',dir:'auto'}));}
  if(m.previousCalendarObservation)detail.append(Object.assign(el('p','前回のカレンダー表示日：'+m.previousCalendarObservation.calendarElectronicDate+' ／ 取得日時：'+m.previousCalendarObservation.observedAtUtc),{lang:'ja',dir:'auto'}));

 for(const [field,label]of [['publisher','出版社'],['label','レーベル'],['volume','巻数']])if(d[field]&&d[field]!=='None'&&d[field]!=='null')detail.append(el('p',label+'：'+d[field]));
 if(c.store==='amazon'&&!d.publisher)detail.append(el('p','出版社：未確認'));
 if(d.summary){const caption=d.summaryScope==='bibliographic_release_note'?'配信案内':d.summaryScope&&d.summaryScope!=='this_volume'?'シリーズ紹介（当巻固有のあらすじではありません）':'内容紹介（編集要約）';detail.append(el('p',caption),el('p','要約の言語：日本語 (ja)'),Object.assign(el('p',d.summary),{lang:'ja',dir:'auto',translate:true}));}
 for(const [field,label]of [['contentGenres','内容ジャンル（編集分類）'],['officialContentGenres','公式サイトの内容分類'],['publisherContentGenres','出版社の内容分類']])if(d[field]?.length)detail.append(el('p',label+'：'+d[field].join(' / ')));
 if(d.contentGenreScope)detail.append(el('p',d.contentGenreScope==='series_premise'?'内容分類の根拠：シリーズ共通紹介':'内容分類の根拠：同巻の公式紹介・共通本文'));
 readerLinks(c,p,m,shelf,detail);body.append(detail);const open=link('↗',p.url);open.className='catalogue-open';open.setAttribute('aria-label',c.brand+'で開く：'+p.title);body.append(open);card.append(body);return card;
}
async function render(force=false){const c=context();if(!c){host.hidden=true;delete root.dataset.unifiedStore;delete root.dataset.officialShelfView;signature='';return;}const epoch=++ticket;host.hidden=false;root.dataset.unifiedStore=c.uiStore;
 try{await Promise.all([load(),ByuData.ensure(c.kind,c.uiStore)]);if(epoch!==ticket||context()?.scope!==c.scope)return;const choices=choicesFor(c);if(!choices.length){host.replaceChildren(el('p','この媒体の公式棚は確認済み入力を準備しています。'));return;}const first=firstFor(c,choices);
  if(!Object.hasOwn(pref.scopes,c.scope)){pref.scopes[c.scope]=oldNav.scopes?.[c.kind+':'+c.uiStore]?'auxiliary':first.sectionKey;save();}
  if(!urlApplied&&(!url.has('kind')||url.get('kind')===c.kind)&&(!url.has('store')||url.get('store')===c.uiStore)){
   if(url.has('officialSection'))pref.scopes[c.scope]=url.get('officialSection');else if(c.store==='rakuten_kobo'&&['new','upcoming'].includes(url.get('mode'))){const calendar=choices.find(x=>x.calendarRefresh&&x.sectionKey.includes(url.get('mode')==='new'?':landing:new:':':landing:preorder:'));pref.scopes[c.scope]=calendar?.sectionKey||'auxiliary';}else if(url.get('storeView')==='auxiliary'||url.get('amazonView')==='auxiliary'||url.has('mode')&&url.get('mode')!=='official')pref.scopes[c.scope]='auxiliary';else if(['official'].includes(url.get('storeView'))||url.get('amazonView')==='official'||url.get('mode')==='official')pref.scopes[c.scope]=first.sectionKey;urlApplied=true;save();
  }
  let selected=pref.scopes[c.scope];if(selected!=='auxiliary'&&!choices.some(x=>x.sectionKey===selected)){if(asset.collections.some(x=>x.sectionKey===selected&&x.archivedFromPrimary))pref.archivedScopes[c.scope]=selected;selected=pref.scopes[c.scope]=first.sectionKey;save();}const view=selected==='auxiliary'?'auxiliary':'official';const q=typeof pref.queries[c.scope]==='string'?pref.queries[c.scope].slice(0,256):'',rawOffset=pref.offsets[c.scope],savedOffset=Number.isSafeInteger(rawOffset)&&rawOffset>=0&&rawOffset<1000000?rawOffset:0;
  const next=c.scope+'|'+selected+'|'+q+'|'+savedOffset+'|'+pageSizeFor(c)+'|'+(pref.attributes[c.scope+'|'+selected]||'')+'|'+(selected==='auxiliary'?legacyMode():'');if(!force&&next===signature)return;signature=next;root.dataset.officialShelfView=view;host.replaceChildren();
  unifiedCategoryButtons(c,choices,selected);
   if(view==='auxiliary')return;
  const shelf=choices.find(x=>x.sectionKey===selected);host.append(el('h2',categoryLabel(c,shelf)),el('p','更新日：'+updateDay(shelf.observedAtUtc),'official-updated-day'));const tools=el('div',undefined,'official-store-tools'),select=el('select'),search=el('input');select.setAttribute('aria-label',c.brand+'公式の棚');for(const x of choices.filter(x=>normalChoice(c,x)||x.sectionKey===selected)){const o=el('option',categoryLabel(c,x)+(x.mediaScope==='kindle_all'?'【Kindle本全体】':''));o.value=x.sectionKey;select.append(o);}select.value=selected;select.onchange=()=>{pref.scopes[c.scope]=select.value;pref.offsets[c.scope]=0;save();render(true);};
  search.type='search';search.maxLength=256;search.placeholder='作品名で検索';search.setAttribute('aria-label','選択中のカテゴリ内を作品名で検索');search.value=q;const searchForm=ByuHpSearchControls.attachSearch(search,value=>{pref.queries[c.scope]=value;pref.offsets[c.scope]=0;save();render(true);},{scope:c.kind+':'+c.uiStore,officialUrl:shelf.sourceUrl});tools.append(searchForm);conditionPicker(c,choices,selected,tools);host.append(tools);if(!shelf.observationOnly)ByuHpDateControls.attachDate(tools,ByuHpDateControls.scope(c.kind+':'+c.uiStore,shelf),()=>{pref.offsets[c.scope]=0;render(true);});const titleRow=el('div',undefined,'catalogue-title-row'),heading=host.querySelector(':scope > h2');heading.before(titleRow);heading.hidden=true;titleRow.append(host.querySelector(':scope > .official-updated-day'),heading,searchForm);
  const source=el('p',undefined,'official-source-note');if(categoryLabel(c,shelf)!==shelf.title)source.append(el('strong','元の公式棚名: '+shelf.title),el('br'));source.append(link(c.brand+'の公式ページ',shelf.sourceUrl));host.append(source);
  if(shelf.sourcePeriod){const n=el('p','ランキング集計期間：'+shelf.sourcePeriod.start+' — '+shelf.sourcePeriod.end+' ／ 取得日時：'+shelf.observedAtUtc,'official-source-note source-ranking-period');n.lang='ja';n.dir='auto';host.append(n);if(shelf.coverage?.excludedMediaRows?.length){const note=el('p','媒体確認保留のため表示しない順位：'+shelf.coverage.excludedMediaRows.map(x=>x.rank).join(', '),'official-source-note');note.lang='ja';note.dir='auto';host.append(note);}}
   if(shelf.calendarRefresh){const r=shelf.calendarRefresh,n=el('p','今回の更新範囲：'+r.periodStart+' — '+r.periodEnd+'（今週分 '+r.currentWeekDisplayedRows+'件／表示照合 '+productsFor(c,shelf).filter(x=>!!x.m.calendarObservation).length+'件）。媒体・商品照合待ち '+r.pendingMediaIdentityRows+'件は表示に追加していません。'+(r.excludedBoundaryRows?'媒体境界で対象外 '+r.excludedBoundaryRows+'件。':'')+'期間外・照合待ちの既存行は前回の取得日時 '+r.retainedPriorObservedAtUtc+' を保持しています。発売日候補の観測であり、販売・予約可否の確認ではありません。','official-source-note calendar-refresh-scope');n.lang='ja';n.dir='auto';host.append(n);const week=button('📅 '+r.periodStart+' — '+r.periodEnd,()=>{const from=tools.querySelector('[data-date-boundary=from]'),to=tools.querySelector('[data-date-boundary=to]');if(from&&to){from.value=r.periodStart;to.value=r.periodEnd;tools.querySelector('[data-apply-date]').click();}});week.dataset.currentRefreshWeek='true';week.setAttribute('aria-label',(ByuCatalogue.ui?.[document.documentElement.lang]?.date||'Release date')+': '+r.periodStart+' — '+r.periodEnd);week.dir='ltr';host.append(week);}
   if(shelf.observationOnly){observedResults(c,shelf,q,savedOffset);return;}
  if(shelf.mediaScope==='kindle_all')host.append(el('p','Kindle本全体の公式棚です。小説・ラノベ専用の入口ではありません。この画面では媒体を確認できた'+(c.kind==='novel'?'小説':'漫画')+'商品だけを表示します。','official-source-note'));
  if(!shelf.condition&&/無料|読み放題|円以下/.test(shelf.title))host.append(el('p','これは観測時の公式棚名です。現在の料金・対象期間・利用条件はストアで確認してください。無料購入、試し読み、Kindle Unlimited、Primeの区分を推測していません。','official-source-note'));
  conditionNote(shelf);const all=entriesFor(c,shelf).filter(x=>!x.p||(shelf.calendarRefresh&&!!x.m.calendarObservation)||!(/upcoming|preorder/.test(shelf.sectionKey))||x.p.verified&&x.p.date>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo'}).format(new Date())).filter(x=>!x.p||ByuHpDateControls.matches(shelf.calendarRefresh?{...x.p,date:x.m.calendarElectronicDate||x.p.date,verified:x.m.calendarObservation?true:x.p.verified}:x.p,ByuHpDateControls.scope(c.kind+':'+c.uiStore,shelf))),attribute=attributePicker(c,shelf,all,tools),needle=q.normalize('NFKC').toLowerCase(),rows=all.filter(x=>attribute.test(x)&&(!needle||((x.p?x.p.title+' '+x.p.authors:x.n.title).normalize('NFKC').toLowerCase().includes(needle)))),offset=Math.min(savedOffset,Math.max(0,Math.floor((rows.length-1)/pageSizeFor(c))*pageSizeFor(c)));pref.offsets[c.scope]=offset;
  const books=all.filter(x=>x.entityKind==='individual_ebook').length,navs=all.length-books,bookResults=rows.filter(x=>x.entityKind==='individual_ebook').length;root.dataset.officialSection=shelf.sectionKey;root.dataset.officialResultCount=String(rows.length);root.dataset.officialProductResultCount=String(bookResults);root.dataset.officialNavigationResultCount=String(rows.length-bookResults);const countText=navs&&!books?navs+'件の公式シリーズ案内（書籍商品数・巻数には含めません）':(shelf.coverage?.observedRankPositions||shelf.observedCount)+'件の公式掲載中 ・ この一覧の電子書籍 '+books+'商品'+(navs?' ・ シリーズ案内 '+navs+'件':'');host.append(el('p',countText+((q||attribute.value)?' ・ 絞り込み結果 '+rows.length+'件':''),'catalogue-count'),el('p','確認日の公式ページに載っていた範囲を表示しています。表示件数はストア全体の総数ではありません。最新の掲載内容・条件は公式ページで確認してください。','official-source-note'));
  const provenance=el('details',undefined,'catalogue-source-details');provenance.append(el('summary','情報について'));for(const note of [...host.querySelectorAll(':scope > .official-source-note')])provenance.append(note);const countNote=host.querySelector(':scope > .catalogue-count');host.insertBefore(provenance,countNote);if(countNote)provenance.append(countNote);host.append(provenance,pageSizeBar(c));const results=el('div',undefined,'catalogue-results');for(const x of rows.slice(offset,offset+pageSizeFor(c)))results.append(x.entityKind==='series_navigation'?navigationCard(x.n):cardFor(c,x.p,x.m,shelf));if(!rows.length)results.append(el('p',(q||attribute.value||ByuHpDateControls.get(ByuHpDateControls.scope(c.kind+':'+c.uiStore,shelf)).active)?'指定した条件に一致する作品はありません。検索語・日付・特徴を変更するか解除してください。':'このカテゴリの作品は公式ページで確認できます。'));host.append(results);
  if(rows.length){const size=pageSizeFor(c),paging=el('div',undefined,'catalogue-paging'),back=button('前へ',()=>{pref.offsets[c.scope]=offset-size;save();render(true);}),next=button('次へ',()=>{pref.offsets[c.scope]=offset+size;save();render(true);});back.disabled=offset===0;next.disabled=offset+size>=rows.length;paging.append(back,el('span',Math.floor(offset/size)+1+' / '+Math.ceil(rows.length/size)),next);host.append(paging);}host.append(pageSizeBar(c));
  if(c.store==='amazon'&&asset.unavailableSources?.length){const missing=el('details',undefined,'official-source-unavailable');missing.append(el('summary','未取得の公式ページもあります（0商品という意味ではありません）'));for(const x of asset.unavailableSources)missing.append(link(x.sourceKey,x.url),el('br'));host.append(missing);}
  if(c.store!=='amazon')host.append(link('Supported by Rakuten Developers','https://developers.rakuten.com/'));
 }catch(e){host.replaceChildren(el('p','公式棚の表示データを読み込めませんでした。'));root.dataset.officialShelfView='auxiliary';console.error(e);}
}
let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;render();});};for(const selector of ['.kind-switch','.store-switch','.shelf-switch']){const n=root.querySelector(selector);if(n)new MutationObserver(schedule).observe(n,{attributes:true,subtree:true,attributeFilter:['aria-pressed']});}
window.ByuOfficialShelfSelect=async({view,sectionKey})=>{await load();const c=context();if(!c)return;pref.scopes[c.scope]=view==='auxiliary'?'auxiliary':sectionKey||firstFor(c,choicesFor(c)).sectionKey;save();return render(true);};
window.ByuOfficialShelfRefresh=()=>render(true);render();
})();
