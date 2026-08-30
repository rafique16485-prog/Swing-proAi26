const $=(s,p=document)=>p.querySelector(s);const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const toast=$('#toast');let timer;
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2400)}
function calculateRisk(){const entry=Number($('#entry').value)||0,stop=Number($('#stop').value)||0,capital=Number($('#capital').value)||0,riskPct=Number($('#riskPct').value)||0;const perShare=Math.abs(entry-stop);const maxLoss=capital*riskPct/100;const qty=perShare?Math.floor(maxLoss/perShare):0;$('#qty').textContent=qty;$('#riskText').textContent=`Max loss ≈ ₹${Math.round(qty*perShare).toLocaleString('en-IN')}`}
['entry','stop','capital','riskPct'].forEach(id=>$('#'+id).addEventListener('input',calculateRisk));calculateRisk();
$('#analyzeBtn').addEventListener('click',()=>{showToast('AI analysis complete: bullish bias, wait for confirmation.');});
$('#refreshBtn').addEventListener('click',()=>{showToast('Market snapshot refreshed. Demo data is illustrative.');$('#marketState').textContent='Updated just now'});
$('#scanBtn').addEventListener('click',()=>{showToast('Scanner found 2 bullish setups and 1 WAIT setup.');});
$('#alertsBtn').addEventListener('click',()=>showToast('No new alerts.'));
$('#uploadBtn').addEventListener('click',()=>$('#chartInput').click());
$('#chartInput').addEventListener('change',e=>{if(e.target.files?.[0])showToast('Chart received. AI scanner is ready for analysis.');});
$$('.stock-row').forEach(row=>row.addEventListener('click',()=>showToast(`${row.dataset.symbol}: setup details opened.`)));

$('#shareBtn').addEventListener('click',()=>{
  const text=`📊 Swing Pro AI — Market Setup\n\nNIFTY 50: 24,365.20 (+0.42%)\nBANK NIFTY: 53,210.40 (+0.31%)\nAI Bias: BULLISH 78/100\nTrend: Uptrend | Structure: HH · HL\nMomentum: Positive | Volume: Confirming\n\nNIFTY zones:\nResistance: 24,520\nPivot: 24,365\nSupport: 24,180\n\n⚠️ Decision support only. Verify live data before trading.\n\nSwing Pro AI: ${window.location.href}`;
  if(navigator.share){navigator.share({title:'Swing Pro AI Market Setup',text}).then(()=>showToast('Share sheet opened.')).catch(()=>{});}
  else {window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');showToast('WhatsApp sharing opened.');}
});

$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{ $$('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const tab=btn.dataset.tab;if(tab==='scanner'){$('#uploadBtn').scrollIntoView({behavior:'smooth',block:'center'});showToast('AI Chart Scanner ready.')}else if(tab==='market'){$('.signal-panel').scrollIntoView({behavior:'smooth',block:'center'});showToast('Market dashboard selected.')}else if(tab==='watchlist'){$('#stockList').scrollIntoView({behavior:'smooth',block:'center'});showToast('Watchlist selected.')}else if(tab==='settings')$('.disclaimer').scrollIntoView({behavior:'smooth',block:'center'});else window.scrollTo({top:0,behavior:'smooth'})}));
window.addEventListener('load',()=>showToast('Swing Pro AI terminal loaded.'));
