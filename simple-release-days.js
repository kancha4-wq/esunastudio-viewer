(() => {
  'use strict';
  const key='byu-hp-release-day-v1';
  let state={};
  try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))state=saved;}catch{}
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const shift=(day,amount)=>{const value=new Date(day+'T00:00:00Z');value.setUTCDate(value.getUTCDate()+amount);return value.toISOString().slice(0,10);};
  const valid=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day+'T00:00:00Z'));
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
  const initial=mode=>mode==='new'?today():shift(today(),1);
  function get(scope,mode){const current=state[scope];const selected=valid(current?.selected)?current.selected:initial(mode);if(mode==='new'&&selected>today()||mode==='upcoming'&&selected<=today())return initial(mode);return selected;}
  function attach(parent,scope,mode,callback){
    if(!scope||!['new','upcoming'].includes(mode))return;
    const saved=state[scope]||{},selected=get(scope,mode),offset=Number.isSafeInteger(saved.offset)&&saved.offset>=0&&saved.offset<=3650?saved.offset:0;
    const direction=mode==='new'?-1:1,heading=document.createElement('p');heading.className='release-day-heading';heading.textContent=mode==='new'?'発売日を選ぶ（今日から過去へ）':'発売予定日を選ぶ（明日から先へ）';parent.append(heading);
    const nav=document.createElement('div');nav.className='release-day-navigation';nav.setAttribute('aria-label',heading.textContent);
    const back=document.createElement('button');back.type='button';back.textContent=mode==='new'?'新しい日付へ':'前の日付へ';back.disabled=offset===0;back.onclick=()=>{const nextOffset=Math.max(0,offset-7);state[scope]={selected:shift(initial(mode),direction*nextOffset),offset:nextOffset};save();callback();};nav.append(back);
    const days=document.createElement('div');days.className='release-day-options';
    for(let n=0;n<7;n++){
      const day=shift(initial(mode),direction*(offset+n)),button=document.createElement('button');button.type='button';button.dataset.releaseDay=day;
      button.textContent=day.replaceAll('-','/')+(offset+n===0?(mode==='new'?'・今日':'・明日'):'');button.setAttribute('aria-pressed',String(day===selected));
      button.onclick=()=>{state[scope]={selected:day,offset};save();callback();};days.append(button);
    }
    nav.append(days);const next=document.createElement('button');next.type='button';next.textContent=mode==='new'?'さらに過去へ':'さらに先へ';next.onclick=()=>{const nextOffset=offset+7;state[scope]={selected:shift(initial(mode),direction*nextOffset),offset:nextOffset};save();callback();};nav.append(next);parent.append(nav);
  }
  const style=document.createElement('style');style.textContent='.release-day-heading{font-weight:700;margin:8px 0}.release-day-navigation{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:8px 0 14px}.release-day-options{display:flex;flex-wrap:wrap;gap:6px}.release-day-navigation button{min-height:40px;padding:7px 10px;border:1px solid #44738e;border-radius:6px;background:#fff;color:#173d55}.release-day-options button[aria-pressed=true]{background:#175b8d;color:#fff;font-weight:700}.release-day-navigation button:disabled{opacity:.5}@media(max-width:600px){.release-day-options{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.release-day-options button{min-width:0}}';document.head.append(style);
  window.ByuSimpleReleaseDays={get,attach};
})();
