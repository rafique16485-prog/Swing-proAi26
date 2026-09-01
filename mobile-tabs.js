(()=>{
  const main=document.querySelector('main');
  const sections=[...document.querySelectorAll('main > section')];
  const nav=[...document.querySelectorAll('.nav-item')];
  if(!main||!sections.length||!nav.length)return;

  const groups={
    home:sections.slice(0,4),
    market:[sections[3],sections[1],sections[0]],
    scanner:[sections[5]],
    watchlist:[sections[4]],
    settings:[sections[6],sections[7],sections[8],sections[9]]
  };

  function activate(tab){
    sections.forEach(s=>s.classList.add('tab-hidden'));
    (groups[tab]||groups.home).forEach(s=>s.classList.remove('tab-hidden'));
    nav.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  nav.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.tab||'home'),{capture:true}));
  activate('home');
})();
