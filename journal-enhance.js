const KEY='swingProAI_trading_journal_v1';
const NIFTY_LOT_SIZE=65;
const $j=id=>document.getElementById(id);
function fillJournalFromSetup(){
  const entry=$j('entry')?.value||'';
  const strike=$j('strike')?.value||'';
  const type=$j('optionType')?.value||'CALL';
  const lots=$j('qty')?.textContent||'';
  if($j('journalDate')&&!$j('journalDate').value)$j('journalDate').value=new Date().toISOString().slice(0,10);
  if($j('journalSymbol'))$j('journalSymbol').value=strike?`NIFTY ${strike}`:'NIFTY';
  if($j('journalOption'))$j('journalOption').value=type;
  if($j('journalEntry'))$j('journalEntry').value=entry;
  if($j('journalQty'))$j('journalQty').value=lots;
  calcJournalPnl();
}
function calcJournalPnl(){
  const e=Number($j('journalEntry')?.value)||0,x=Number($j('journalExit')?.value)||0,lots=Number($j('journalQty')?.value)||0;
  if($j('journalPnl')&&e&&x&&lots)$j('journalPnl').value=((x-e)*lots*NIFTY_LOT_SIZE).toFixed(2);
}
function toast(msg){const t=$j('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}}
function initJournalEnhance(){
  const d=$j('journalDate'); if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);
  ['journalEntry','journalExit','journalQty'].forEach(id=>$j(id)?.addEventListener('input',calcJournalPnl));
  $j('analyzeBtn')?.addEventListener('click',()=>setTimeout(fillJournalFromSetup,900));
  $j('optionType')?.addEventListener('change',()=>{if($j('journalOption'))$j('journalOption').value=$j('optionType').value});
  const save=$j('saveJournalBtn');
  save?.addEventListener('click',()=>setTimeout(()=>{
    const rows=JSON.parse(localStorage.getItem(KEY)||'[]');
    if(rows.length)rows[rows.length-1].id=Date.now();
    localStorage.setItem(KEY,JSON.stringify(rows));
  },50));
  const panel=document.querySelector('.journal-panel');
  if(panel){
    const summary=document.createElement('div'); summary.id='journalSummary'; summary.className='risk-result'; summary.style.marginBottom='10px';
    panel.insertBefore(summary,panel.querySelector('.form-grid'));
    const updateSummary=()=>{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');const pnl=rows.reduce((s,r)=>s+(Number(r.pnl)||0),0);summary.innerHTML=`<span>Journal summary</span><b>${rows.length} trades</b><small>Net P&L: ₹${pnl.toLocaleString('en-IN',{maximumFractionDigits:2})}</small>`};
    updateSummary(); window.addEventListener('storage',updateSummary); setInterval(updateSummary,1200);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initJournalEnhance);else initJournalEnhance();
