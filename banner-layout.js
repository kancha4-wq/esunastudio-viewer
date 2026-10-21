(() => {
 'use strict';
 const root=document.querySelector('[data-discovery-preview]');if(!root)return;
 const library=root.querySelector('[data-store=library]'),header=document.querySelector('.byu-wide-banner');
 const jump=(id='library-intro')=>{library.click();document.getElementById(id)?.scrollIntoView({block:'start',behavior:'smooth'});};
 document.querySelectorAll('[data-home-action]').forEach(a=>a.addEventListener('click',e=>{const action=a.dataset.homeAction;if(action==='library'||action==='news'||action==='guide'){e.preventDefault();jump(action==='news'?'news':action==='guide'?'library-how-to':'library-intro');}else if(action==='search'||action==='web'||action==='stores'){e.preventDefault();window.ByuSelect({kind:action==='web'?'novel':'manga',store:action==='web'?'narou':'kobo',mode:action==='web'?'anime':action==='stores'?'genres':'new'});root.scrollIntoView({block:'start',behavior:'smooth'});}}));
 const resize=new ResizeObserver(()=>document.documentElement.style.setProperty('--banner-height',Math.ceil(header.getBoundingClientRect().height)+'px'));resize.observe(header);
 const aliases={'#panel-overview':'library-intro','#panel-updates':'news','#panel-how-to':'library-how-to'};function reveal(){const id=aliases[location.hash]||location.hash.slice(1);if(['library-intro','news','library-how-to','story','video'].includes(id))jump(id);}addEventListener('hashchange',reveal);if(location.hash&&location.hash!=='#next-overview')reveal();document.body.dataset.bannerLayout='ready';
})();
