(() => {
 const region=document.querySelector('.app-introduction-region');if(!region)return;
 function fit(){
  let height=0;const panels=[...region.querySelectorAll('.viewer-panel')];
  for(const panel of panels){const hidden=panel.hidden,style=panel.style.cssText;panel.hidden=false;Object.assign(panel.style,{position:'absolute',visibility:'hidden',width:region.clientWidth+'px',minHeight:'0',height:'auto'});height=Math.max(height,panel.querySelector('.app-summary').getBoundingClientRect().height);panel.style.cssText=style;panel.hidden=hidden;}
  panels.forEach(p=>p.style.minHeight=Math.ceil(height)+'px');region.dataset.appIntroductionReady='true';
 }
 document.fonts.ready.then(fit);let frame;addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(fit)});
 document.querySelectorAll('[data-open-dialog]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.openDialog);dialog.showModal();const body=dialog.querySelector('.app-detail-body');dialog.querySelector('[data-scroll-hint]').hidden=body.scrollHeight<=body.clientHeight+1;}));
 document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
})();
