document.addEventListener('keydown',event=>{
 if(event.key==='Escape')for(const p of document.querySelectorAll('.locale-picker[open]')){p.open=false;p.querySelector('summary').focus();}
});
document.addEventListener('click',event=>{
 for(const p of document.querySelectorAll('.locale-picker[open]'))if(!p.contains(event.target))p.open=false;
});
