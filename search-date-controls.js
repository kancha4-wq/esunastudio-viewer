(()=>{'use strict';
const key='byu-hp-date-range-v1';let state={version:1,scopes:{}};try{const x=JSON.parse(localStorage.getItem(key)||'null');if(x?.version===1&&x.scopes)state=x;}catch{}
const appliedUrl=new Set(),url=new URLSearchParams(location.search),dateValid=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T00:00:00Z'))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
const empty=()=>({from:'',to:'',unknown:'exclude',active:false}),save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
let urlDateScope=null;
function scope(base,category){
 const value=typeof category==='object'?(category.approvedCategory||category.title||''):category;
 if(!['new','upcoming','新刊','新着','近日発売','予約'].includes(value))return null;
 const identity=typeof category==='object'?'official:'+category.sectionKey:'date-list:'+value;
 return base+':release:'+identity;
}
function get(scope){
 if(!scope||!scope.includes(':release:'))return empty();
 let value={...empty(),...(state.scopes[scope]||{})};const [kind,store]=scope.split(':');
 const urlCategory=url.has('officialSection')?':official:'+url.get('officialSection'):['new','upcoming'].includes(url.get('mode'))?':date-list:'+url.get('mode'):null;
 if(urlCategory&&scope.endsWith(urlCategory)&&!appliedUrl.has(scope)&&(!urlDateScope||urlDateScope===scope)&&(!url.has('kind')||url.get('kind')===kind)&&(!url.has('store')||url.get('store')===store)){
  appliedUrl.add(scope);let touched=false;for(const [param,field]of [['dateFrom','from'],['dateTo','to']])if(url.has(param)){const v=url.get(param);if(!v||dateValid(v)){value[field]=v;touched=true;}}
  if(['include','exclude','only'].includes(url.get('dateUnknown'))){value.unknown=url.get('dateUnknown');touched=true;}
  if(touched&&(!value.from||!value.to||value.from<=value.to)){urlDateScope=scope;value.active=true;state.scopes[scope]=value;save();}
 }
 return value;
}
function matches(p,scope){const v=get(scope);if(!v.active)return true;const known=dateValid(p.date||'')&&p.verified!==false;if(!known)return v.unknown!=='exclude';if(v.unknown==='only')return false;return (!v.from||p.date>=v.from)&&(!v.to||p.date<=v.to);}
const el=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
function attachDate(parent,scope,callback){
 if(!scope)return;
 const v=get(scope),disclosure=el('details'),heading=el('summary',v.active?'発売日：'+(v.from||'指定なし')+'〜'+(v.to||'指定なし'):'発売日で絞り込む ▾');
 disclosure.className='release-date-disclosure';disclosure.open=v.active;disclosure.append(heading);
 const box=el('fieldset'),legend=el('legend','発売日の範囲');box.className='date-range-controls';box.append(legend);
 const inputs={};for(const [field,labelText]of [['from','発売日：この日から'],['to','発売日：この日まで']]){const label=el('label',labelText),input=el('input');input.type='date';input.value=v[field];input.setAttribute('aria-label',labelText);input.dataset.dateBoundary=field;label.append(input);box.append(label);inputs[field]=input;}
 const unknown=el('select');unknown.setAttribute('aria-label','発売日不明の作品をどう表示するか');for(const [value,label]of [['exclude','発売日不明の作品は表示しない'],['include','発売日不明の作品も表示'],['only','発売日不明の作品だけ表示']]){const o=el('option',label);o.value=value;unknown.append(o);}unknown.value=v.unknown;
 const error=el('p');error.className='date-validation-message';error.setAttribute('role','status');
 const apply=el('button','この発売日範囲で表示');apply.type='button';apply.dataset.applyDate='true';apply.onclick=()=>{const from=inputs.from.value,to=inputs.to.value;if((from&&!dateValid(from))||(to&&!dateValid(to))||(from&&to&&from>to)){error.textContent='「この日まで」は「この日から」以降の日を選んでください。';return;}state.scopes[scope]={from,to,unknown:unknown.value,active:!!(from||to)||unknown.value!=='exclude'};save();callback();};
 const clear=el('button','発売日の絞り込みを解除');clear.type='button';clear.dataset.clearDate='true';clear.onclick=()=>{state.scopes[scope]=empty();save();callback();};
 const meaning=el('p',scope.split(':')[1]==='amazon'?'Amazon登録表示の発売日です。初電子配信日とは別の場合があります。':'楽天Kobo掲載の電子版発売日で絞り込みます。');meaning.className='date-meaning-note';box.append(unknown,apply,clear,error,meaning);disclosure.append(box);parent.append(disclosure);
}
const openSearchScopes=new Map();
function syncSearch(host,{scope='default',query='',hidden=false}={}){
 const c=host._byuSearch;if(!c)return;
 const browsing=/^(manga|novel):(amazon|kobo|narou|kakuyomu)$/.test(scope);
 if(browsing){
  const supplied=arguments[1]?.officialUrl||window.ByuHpVerifiedOfficialSearchTargets?.[scope]||'';
  let valid=false;try{const u=new URL(supplied);valid=u.protocol==='https:'&&['www.amazon.co.jp','amazon.co.jp','books.rakuten.co.jp','yomou.syosetu.com','kakuyomu.jp'].includes(u.hostname)&&u.searchParams.get('sourceType')?.toUpperCase()!=='RECS'&&!/for.?you/i.test(decodeURIComponent(supplied));}catch{}
   const a=c.officialLink||el('a','公式サイトで探す ↗');c.officialLink=a;a.textContent=({'amazon':'Amazon','kobo':'楽天Kobo','narou':'小説家になろう','kakuyomu':'カクヨム'}[scope.split(':')[1]]||'公式サイト')+'で探す ↗';const destination=valid?window.ByuHpAffiliate.href(supplied):'';a.href=destination;a.target='_blank';a.rel=valid&&destination!==supplied?'sponsored noopener noreferrer':'noopener noreferrer';a.dataset.verifiedOfficialSearch='true';
  c.input.value='';c.input.remove();host.replaceChildren(a);host.hidden=!valid;host.className='official-browse-link';host.dataset.webQueryDisabled='true';host.dataset.searchApplied='false';host.dataset.searchScope=scope;c.scope=scope;c.query='';return;
 }
 if(c.details&&!host.contains(c.details))host.replaceChildren(c.details,c.applied);
 host.className='book-search-disclosure';delete host.dataset.webQueryDisabled;
 if(host.dataset.searchScope!==scope)c.input.value=query;
 host.dataset.searchScope=scope;c.scope=scope;c.query=query;
 c.details.hidden=hidden;host.hidden=hidden&&!query;
 c.details.open=!!openSearchScopes.get(scope);
 c.applied.hidden=!query;c.appliedText.textContent=query?'検索適用中：「'+query+'」':'';
 host.dataset.searchApplied=String(!!query);
}
function attachSearch(input,callback,options={}){
 const host=el('div');host.className='book-search-disclosure';
 const details=el('details'),summary=el('summary','作品名で検索');details.className='book-search-details';details.append(summary);
 const form=el('form');form.className='book-search-form';form.setAttribute('role','search');input.enterKeyHint='search';input.oninput=null;input.onchange=null;let composing=false,lastIme=0;
 input.addEventListener('compositionstart',()=>{composing=true;});input.addEventListener('compositionend',()=>{composing=false;lastIme=Date.now();});input.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.isComposing||e.keyCode===229))lastIme=Date.now();});
 const apply=value=>{syncSearch(host,{scope:host._byuSearch.scope,query:value,hidden:input.hidden});callback(value);};
 form.onsubmit=e=>{e.preventDefault();if(composing||Date.now()-lastIme<60)return;apply(input.value.slice(0,256));};
 const search=el('button','検索');search.type='submit';search.dataset.submitSearch='true';const clear=el('button','クリア');clear.type='button';clear.dataset.clearSearch='true';clear.onclick=()=>{input.value='';apply('');};
 const hint=el('p','選択中のカテゴリ内を作品名・著者名で検索します。');hint.className='search-entry-hint';form.append(input,search,clear,hint);details.append(form);
 const applied=el('div');applied.className='search-applied-condition';applied.setAttribute('role','status');const appliedText=el('span'),remove=el('button','検索を解除');remove.type='button';remove.dataset.removeAppliedSearch='true';remove.onclick=()=>{input.value='';apply('');};applied.append(appliedText,remove);host.append(details,applied);
 host._byuSearch={input,details,applied,appliedText,scope:options.scope||'default',query:input.value};
 details.addEventListener('toggle',()=>{if(details.hidden)return;openSearchScopes.set(host._byuSearch.scope,details.open);});
 syncSearch(host,{scope:options.scope||'default',query:input.value,hidden:input.hidden,officialUrl:options.officialUrl});return host;
}
const style=el('style');style.textContent='.book-search-form{display:flex;flex-wrap:wrap;gap:7px;align-items:center;max-width:100%}.book-search-form input{min-width:0;max-width:100%;width:170px!important}.book-search-form button,.date-range-controls button{padding:10px 13px;border:1px solid #245f7d;border-radius:5px;background:white;color:#194a65}.date-range-controls{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:end;gap:8px;width:100%;margin:12px 0;border:1px solid #b8cbd7;padding:10px}.date-range-controls label{display:flex;flex-direction:column;gap:5px;flex:1 1 130px;min-width:0}.date-range-controls input{box-sizing:border-box;width:100%;min-width:0;padding:9px}.date-range-controls select{max-width:100%;padding:9px}.date-meaning-note,.date-validation-message{width:100%;font-size:12px;line-height:1.6;margin:0}.date-validation-message{color:#a02a16}@media(max-width:420px){.book-search-form{width:100%}.book-search-form input{flex:1 1 120px;width:120px!important}.date-range-controls label{flex-basis:110px}}';document.head.append(style);
const searchStyle=el('style');searchStyle.textContent='.book-search-disclosure,.official-browse-link{box-sizing:border-box;max-width:100%;margin:8px 0;font-size:13px}.official-browse-link a{overflow-wrap:anywhere;color:#365b70}.book-search-details>summary{color:#365b70;cursor:pointer;font-size:13px;padding:5px 2px;text-decoration:underline;text-underline-offset:3px}.book-search-details .book-search-form{margin-top:8px}.search-entry-hint{flex-basis:100%;margin:0;font-size:12px;line-height:1.5;color:#566570}.search-applied-condition{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:6px;max-width:100%}.search-applied-condition[hidden],.book-search-disclosure[hidden],.book-search-details[hidden],.official-browse-link[hidden]{display:none!important}.search-applied-condition span{min-width:0;overflow-wrap:anywhere}.search-applied-condition button{font-size:12px;padding:5px 9px;color:#194a65;background:white;border:1px solid #9eb5c1;border-radius:4px}.official-browse-link{margin-inline-start:auto;text-align:right}.official-browse-link a{display:inline-flex;align-items:center;min-height:40px;padding:2px 5px}';document.head.append(searchStyle);
window.ByuHpDateControls={matches,attachDate,get,scope};window.ByuHpSearchControls={attachSearch,sync:syncSearch};
})();
