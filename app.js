const $=(s,p=document)=>p.querySelector(s);const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const toast=$('#toast');let timer;
function showToast(message){if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2400)}
function calculateRisk(){const entry=Number($('#entry')?.value)||0,stop=Number($('#stop')?.value)||0,capital=Number($('#capital')?.value)||0,riskPct=Number($('#riskPct')?.value)||0;const perShare=Math.abs(entry-stop);const maxLoss=capital*riskPct/100;const qty=perShare?Math.floor(maxLoss/perShare):0;if($('#qty'))$('#qty').textContent=qty;if($('#riskText'))$('#riskText').textContent=`Max loss ≈ ₹${Math.round(qty*perShare).toLocaleString('en-IN')}`}
['entry','stop','target','capital','riskPct','strike'].forEach(id=>$('#'+id)?.addEventListener('input',calculateRisk));calculateRisk();
$('#analyzeBtn')?.addEventListener('click',()=>showToast('AI analysis complete: bullish bias, wait for confirmation.'));
$('#refreshBtn')?.addEventListener('click',()=>{showToast('Market snapshot refreshed. Demo data is illustrative.');if($('#marketState'))$('#marketState').textContent='Updated just now'});
$('#scanBtn')?.addEventListener('click',()=>showToast('Scanner found 2 bullish setups and 1 WAIT setup.'));
$('#alertsBtn')?.addEventListener('click',()=>showToast('No new alerts.'));
$('#uploadBtn')?.addEventListener('click',()=>$('#chartInput')?.click());
$('#chartInput')?.addEventListener('change',e=>{if(e.target.files?.[0])showToast('Chart received. AI scanner is ready for analysis.');});
$$('.stock-row').forEach(row=>row.addEventListener('click',()=>showToast(`${row.dataset.symbol}: setup details opened.`)));

// WhatsApp shares only the option trade setup requested by the user.
const shareBtn=$('#shareBtn');
if(shareBtn){
  shareBtn.type='button';
  shareBtn.addEventListener('click',()=>{
    const optionType=$('#optionType')?.value||'CALL';
    const strike=$('#strike')?.value||'';
    const entry=$('#entry')?.value||'';
    const stop=$('#stop')?.value||'';
    const target=$('#target')?.value||'';
    const text=`🎯 TRADE SETUP\n\nOption: ${optionType}\nStrike Price: ${strike}\nEntry: ${entry}\nStop Loss: ${stop}\nTarget: ${target}\n\n💡 Tips:\n• Enter only after confirmation.\n• Keep the Stop Loss fixed.\n• Book partial profit near Target.\n• Avoid overtrading and follow your risk limit.\n\n⚠️ For educational/decision support only.`;
    const whatsappUrl=`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    showToast('Opening WhatsApp…');
    setTimeout(()=>{window.location.assign(whatsappUrl)},100);
  });
}

$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>{ $$('.nav-item').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const tab=btn.dataset.tab;if(tab==='scanner'){$('#uploadBtn')?.scrollIntoView({behavior:'smooth',block:'center'});showToast('AI Chart Scanner ready.')}else if(tab==='market'){$('.signal-panel')?.scrollIntoView({behavior:'smooth',block:'center'});showToast('Market dashboard selected.')}else if(tab==='watchlist'){$('#stockList')?.scrollIntoView({behavior:'smooth',block:'center'});showToast('Watchlist selected.')}else if(tab==='settings')$('.disclaimer')?.scrollIntoView({behavior:'smooth',block:'center'});else window.scrollTo({top:0,behavior:'smooth'})}));
window.addEventListener('load',()=>showToast('Swing Pro AI terminal loaded.'));
