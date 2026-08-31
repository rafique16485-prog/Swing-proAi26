const KEY='swingProAI_trading_journal_v1';
const NIFTY_LOT_SIZE=65;
const $j=id=>document.getElementById(id);
const money=n=>`₹${Number(n||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;

function fillJournalFromSetup(){
  const entry=$j('entry')?.value||'';
  const strike=$j('strike')?.value||'';
  const type=$j('optionType')?.value||'CALL';
  const lotsText=$j('qty')?.textContent||'';
  const lots=Number.parseFloat(lotsText)||'';
  if($j('journalDate')&&!$j('journalDate').value)$j('journalDate').value=new Date().toISOString().slice(0,10);
  if($j('journalSymbol'))$j('journalSymbol').value=strike?`NIFTY ${strike}`:'NIFTY';
  if($j('journalOption'))$j('journalOption').value=type;
  if($j('journalEntry'))$j('journalEntry').value=entry;
  if($j('journalQty'))$j('journalQty').value=lots;
  calcJournalPnl();
}

function calcJournalPnl(){
  const e=Number($j('journalEntry')?.value),x=Number($j('journalExit')?.value),lots=Number($j('journalQty')?.value);
  if($j('journalPnl')){
    if(Number.isFinite(e)&&Number.isFinite(x)&&Number.isFinite(lots)&&e>0&&x>0&&lots>0)$j('journalPnl').value=((x-e)*lots*NIFTY_LOT_SIZE).toFixed(2);
    else $j('journalPnl').value='';
  }
}

function fixLotLabels(){
  document.querySelectorAll('label').forEach(l=>{if(l.textContent.trim()==='Quantity'&&l.childNodes[0])l.childNodes[0].textContent='Lots';});
  const q=$j('qty');if(q){const parent=q.closest('.risk-result');if(parent){const s=parent.querySelector('span');if(s)s.textContent='Suggested lots';}}
  const jq=$j('journalQty');if(jq){const label=jq.closest('label');if(label&&label.childNodes[0])label.childNodes[0].textContent='Lots (NIFTY = 65 qty)';}
}

function toast(msg){const t=$j('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}}

function readJournal(){
  try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(rows)?rows:[];}catch{return[];}
}

function addClearButton(){
  const panel=document.querySelector('.journal-panel'),exportBtn=$j('exportJournalBtn');
  if(!panel||$j('clearJournalBtn'))return;
  const btn=document.createElement('button');btn.id='clearJournalBtn';btn.type='button';btn.className='text-btn';btn.textContent='Clear Journal';btn.style.marginLeft='10px';
  exportBtn?.parentElement?.appendChild(btn);
  btn.addEventListener('click',()=>{if(!confirm('Clear all saved journal trades? This cannot be undone.'))return;localStorage.removeItem(KEY);renderSummary();window.dispatchEvent(new Event('storage'));toast('Journal cleared.')});
}

function renderSummary(){
  const summary=$j('journalSummary');if(!summary)return;
  const rows=readJournal();
  const pnls=rows.map(r=>Number(r.pnl)).filter(Number.isFinite);
  const pnl=pnls.reduce((s,n)=>s+n,0);
  const wins=pnls.filter(n=>n>0),losses=pnls.filter(n=>n<0),closed=wins.length+losses.length;
  const winRate=closed?(wins.length/closed*100):0;
  const avgWin=wins.length?wins.reduce((s,n)=>s+n,0)/wins.length:0;
  const avgLoss=losses.length?losses.reduce((s,n)=>s+n,0)/losses.length:0;
  summary.innerHTML=`<span>Journal summary</span><b>${rows.length} trades</b><small>Net P&L: ${money(pnl)}</small><small>Win rate: ${winRate.toFixed(1)}% · W ${wins.length} / L ${losses.length}</small><small>Avg win: ${money(avgWin)} · Avg loss: ${money(avgLoss)}</small>`;
}

function markTradeResult(){
  const pnl=Number($j('journalPnl')?.value);
  const target=$j('journalPnl');
  if(!target||!Number.isFinite(pnl))return;
  target.dataset.result=pnl>0?'WIN':pnl<0?'LOSS':'BE';
  target.title=pnl>0?'WIN':pnl<0?'LOSS':'BREAK-EVEN';
}

function initJournalEnhance(){
  fixLotLabels();addClearButton();renderSummary();
  const d=$j('journalDate');if(d&&!d.value)d.value=new Date().toISOString().slice(0,10);
  ['journalEntry','journalExit','journalQty'].forEach(id=>$j(id)?.addEventListener('input',()=>{calcJournalPnl();markTradeResult();}));
  $j('analyzeBtn')?.addEventListener('click',()=>setTimeout(()=>{fixLotLabels();fillJournalFromSetup();markTradeResult()},900));
  $j('optionType')?.addEventListener('change',()=>{if($j('journalOption'))$j('journalOption').value=$j('optionType').value});
  const save=$j('saveJournalBtn');save?.addEventListener('click',()=>setTimeout(()=>{const rows=readJournal();if(rows.length)rows[rows.length-1].id=Date.now();localStorage.setItem(KEY,JSON.stringify(rows));renderSummary()},50));
  const panel=document.querySelector('.journal-panel');
  if(panel&&!$j('journalSummary')){const summary=document.createElement('div');summary.id='journalSummary';summary.className='risk-result';summary.style.marginBottom='10px';panel.insertBefore(summary,panel.querySelector('.form-grid'));renderSummary();window.addEventListener('storage',renderSummary);setInterval(renderSummary,1200);}
  markTradeResult();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initJournalEnhance);else initJournalEnhance();
