(()=>{
  const buttons=[...document.querySelectorAll('[data-expert-filter]')];
  const cards=[...document.querySelectorAll('[data-expert-category]')];
  if(!buttons.length||!cards.length)return;

  buttons.forEach(button=>{
    button.addEventListener('click',()=>{
      const filter=button.dataset.expertFilter||'전체';
      buttons.forEach(item=>item.classList.toggle('is-active',item===button));
      cards.forEach(card=>{
        const categories=(card.dataset.expertCategory||'').split(/\s+/).filter(Boolean);
        card.hidden=filter!=='전체'&&!categories.includes(filter);
      });
    });
  });
})();