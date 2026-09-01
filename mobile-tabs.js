(()=>{
  const main=document.querySelector('main');
  const sections=[...document.querySelectorAll('main > section')];
  const nav=[...document.querySelectorAll('.nav-item')];
  if(!main||!sections.length||!nav.length)return;

  const groups={
    home:sections.slice(0,4),
    market:[sections[0],sections[1],sections[2],sections[3]],
    scanner:[sections[5]],
    watchlist:[sections[4]],
    settings:[sections[6],sections[7],sections[8]]
  };

  const dateEl=document.querySelector('.hero .eyebrow');
  if(dateEl){
    const d=new Date();
    dateEl.textContent=d.toLocaleDateString('en-IN',{weekday:'long',day:'2-digit',month:'short',year:'numeric'}).toUpperCase().replaceAll(',',' ·');
  }

  function activate(tab){
    sections.forEach(s=>s.classList.add('tab-hidden'));
    (groups[tab]||groups.home).forEach(s=>s.classList.remove('tab-hidden'));
    nav.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  nav.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.tab||'home'),{capture:true}));
  activate('home');
})();
