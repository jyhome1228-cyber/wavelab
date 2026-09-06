const params=new URLSearchParams(location.search);
const requested=params.get('view');
const allowed=['dashboard','clients','projects','finance'];
if(allowed.includes(requested)){
  requestAnimationFrame(()=>document.querySelector(`[data-view="${requested}"]`)?.click());
}
if(params.get('guide')==='1')document.body.classList.add('is-guide-preview');
