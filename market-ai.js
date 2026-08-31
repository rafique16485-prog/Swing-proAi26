// Dynamic market-bias layer for Swing Pro AI.
// Uses the live NIFTY, BANK NIFTY and INDIA VIX values already loaded by app.js.
(function () {
  const panel = document.querySelector('.signal-panel');
  if (!panel) return;

  const badge = panel.querySelector('.status-badge');
  const score = panel.querySelector('.signal-score strong');
  const cells = panel.querySelectorAll('.signal-grid b');
  if (!badge || !score || cells.length < 4) return;

  const num = (id) => Number((document.getElementById(id)?.textContent || '').replace(/,/g, '').replace('%', ''));

  function updateBias() {
    const niftyPct = num('niftyChange');
    const bankPct = num('bankChange');
    const vixPct = num('vixChange');
    if (![niftyPct, bankPct, vixPct].every(Number.isFinite)) return;

    // Conservative regime score: index direction helps the score, rising VIX reduces it.
    const raw = 50 + niftyPct * 12 + bankPct * 8 - vixPct * 3;
    const s = Math.max(0, Math.min(100, Math.round(raw)));

    let label = 'NEUTRAL';
    let cls = 'wait';
    if (s >= 65) { label = 'BULLISH'; cls = 'bullish'; }
    else if (s <= 35) { label = 'BEARISH'; cls = 'bearish'; }

    badge.textContent = label;
    badge.className = `status-badge ${cls}`;
    score.textContent = String(s);

    const trend = cells[0];
    const structure = cells[1];
    const momentum = cells[2];
    const volume = cells[3];

    trend.textContent = niftyPct > 0.15 ? 'Uptrend' : niftyPct < -0.15 ? 'Downtrend' : 'Sideways';
    structure.textContent = s >= 65 ? 'Bullish bias' : s <= 35 ? 'Bearish bias' : 'Mixed';
    momentum.textContent = (niftyPct + bankPct) / 2 > 0.1 ? 'Positive' : (niftyPct + bankPct) / 2 < -0.1 ? 'Negative' : 'Weak';
    volume.textContent = vixPct > 5 ? 'Volatility ↑' : 'Await confirmation';

    const heading = panel.querySelector('h2');
    if (heading) heading.textContent = `Trend & structure · ${label.toLowerCase()}`;
  }

  window.addEventListener('load', () => {
    updateBias();
    setInterval(updateBias, 30000);
  });
  document.getElementById('marketAnalyzeBtn')?.addEventListener('click', () => setTimeout(updateBias, 500));
  setInterval(updateBias, 5000);
})();
