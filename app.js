import { API_ENDPOINTS } from "./api-service.js";

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [
  ...parent.querySelectorAll(selector),
];
const demoIndices = [
  "NIFTY 50",
  "BANK NIFTY",
  "FINNIFTY",
  "INDIA VIX",
  "SENSEX",
];
const watchlist = [
  { symbol: "RELIANCE", name: "Reliance Industries", type: "Stock" },
  { symbol: "HDFCBANK", name: "HDFC Bank", type: "Stock" },
  { symbol: "NIFTY", name: "NIFTY 50", type: "Index" },
];
const rules = [
  [
    "Never trade without stop loss",
    "Protect every position with a defined invalidation.",
  ],
  ["Minimum RR 1:2", "Block entries that do not meet the reward threshold."],
  ["Maximum risk per trade", "Use the limit configured in Risk Management."],
  ["Avoid revenge trading", "Warn after a losing trade sequence."],
  ["Maximum daily trades", "Require a journal-backed trade counter."],
  [
    "Stop after consecutive losses",
    "Pause when the configured loss limit is reached.",
  ],
  ["Avoid high-risk events", "Require an economic-events feed."],
  ["Avoid low-volume setups", "Require verified volume confirmation."],
  [
    "Require trend confirmation",
    "Require trend and market-structure alignment.",
  ],
  [
    "Require liquidity / structure confirmation",
    "Require BOS, CHOCH or liquidity validation.",
  ],
];
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function route(viewId) {
  $$(".view").forEach((view) =>
    view.classList.toggle("active", view.id === viewId),
  );
  $$(".nav-item").forEach((button) =>
    button.classList.toggle("active", button.dataset.route === viewId),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderIndices() {
  const markup = demoIndices
    .map(
      (name) =>
        `<article class="index-card"><p>${name}</p><b>—</b><span>DEMO · feed disconnected</span></article>`,
    )
    .join("");
  $("#index-strip").innerHTML = markup;
  $("#market-quotes").innerHTML = demoIndices
    .map(
      (name) =>
        `<article class="quote-row"><div><b>${name}</b><small>Volume: unavailable</small></div><div class="price"><b>—</b><small>Last price</small></div><div class="change">DEMO<br><small>Not live</small></div></article>`,
    )
    .join("");
}

function renderWatchlist(filter = "") {
  const term = filter.trim().toLowerCase();
  const rows = watchlist.filter((item) =>
    `${item.symbol} ${item.name}`.toLowerCase().includes(term),
  );
  $("#watch-list").innerHTML = rows.length
    ? rows
        .map(
          (item) =>
            `<article class="watch-row"><i>${item.type === "Index" ? "◫" : "◇"}</i><div><b>${item.symbol}</b><small>${item.name} · ${item.type} · DEMO</small></div><button data-remove="${item.symbol}" aria-label="Remove ${item.symbol}">×</button></article>`,
        )
        .join("")
    : `<div class="empty-state compact"><h3>No matching symbols</h3><p>Try another name or add a symbol to your watchlist.</p></div>`;
}

function renderRules() {
  $("#rules").innerHTML = rules
    .map(
      ([title, description], index) =>
        `<article class="rule"><label><input type="checkbox" ${index < 3 ? "checked" : ""}> ${title}<small>${description}</small></label><select aria-label="${title} status"><option>${index < 3 ? "PASS" : "WARNING"}</option><option>PASS</option><option>FAIL</option><option>WARNING</option></select></article>`,
    )
    .join("");
}

function showResearch(query) {
  const cleanQuery = query.trim().toUpperCase() || "RELIANCE";
  $("#search-empty").hidden = true;
  $("#research-result").hidden = false;
  $("#company-name").textContent =
    cleanQuery === "RELIANCE"
      ? "Reliance Industries"
      : `${cleanQuery} research`;
  $("#company-meta").textContent =
    `${cleanQuery} · Company classification requires the fundamentals API`;
  const fundamentalLabels = [
    "Market cap",
    "Revenue",
    "Profit",
    "EPS",
    "P/E",
    "P/B",
    "ROE",
    "ROCE",
    "Debt / equity",
    "Operating margin",
    "Profit growth",
    "Sales growth",
    "Dividend",
    "Valuation",
  ];
  const technicalLabels = [
    "Trend",
    "Market structure",
    "HH / HL / LH / LL",
    "Support",
    "Resistance",
    "Liquidity zones",
    "VWAP",
    "EMA 20",
    "EMA 50",
    "EMA 200",
    "RSI",
    "MACD",
    "ATR",
    "Volume",
    "Breakout / BOS",
    "CHOCH",
    "Supply / demand",
  ];
  $("#fundamentals").innerHTML = fundamentalLabels
    .map((label) => `<div><span>${label}</span><b>—</b></div>`)
    .join("");
  $("#technical").innerHTML = technicalLabels
    .map((label) => `<div><span>${label}</span><b>—</b></div>`)
    .join("");
}

function calculateRisk(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  const capital = Number(values.capital),
    riskPercent = Number(values.riskPercent),
    entry = Number(values.entry),
    stop = Number(values.stop),
    target = Number(values.target);
  const distance = Math.abs(entry - stop),
    riskAmount = (capital * riskPercent) / 100;
  if (!capital || !riskPercent || !distance || !entry || stop >= entry)
    return showToast(
      "Enter valid capital, entry, and a stop below the entry price.",
    );
  const quantity = Math.floor(riskAmount / distance);
  const positionValue = quantity * entry;
  const reward = Math.max(0, target - entry) * quantity;
  const rr = (target - entry) / distance;
  const approved = rr >= Number(values.minimumRr) && quantity > 0;
  $("#risk-result").innerHTML =
    `<article class="risk-output"><h3>${approved ? "Risk limit respected" : "Trade does not meet your rules"}</h3><div><span>Maximum rupee risk<b>₹${riskAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</b></span><span>Safe quantity<b>${quantity.toLocaleString("en-IN")}</b></span><span>Position size<b>₹${positionValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</b></span><span>Expected loss<b>₹${riskAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</b></span><span>Expected profit<b>₹${reward.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</b></span><span>Risk / reward<b>1 : ${rr.toFixed(2)}</b></span></div></article>`;
}

function openWhyModal() {
  const dialog = $("#why-modal");
  $("#modal-backdrop").classList.add("open");
  dialog.showModal();
}
function closeWhyModal() {
  $("#why-modal").close();
  $("#modal-backdrop").classList.remove("open");
}

function bindEvents() {
  $$("[data-route]").forEach((button) =>
    button.addEventListener("click", () => route(button.dataset.route)),
  );
  $$("[data-toast]").forEach((button) =>
    button.addEventListener("click", () => showToast(button.dataset.toast)),
  );
  $("#stock-search").addEventListener("submit", (event) => {
    event.preventDefault();
    showResearch($("#stock-query").value);
  });
  $("#watch-search").addEventListener("input", (event) =>
    renderWatchlist(event.target.value),
  );
  $("#sort-watch").addEventListener("click", () => {
    watchlist.sort((a, b) => a.symbol.localeCompare(b.symbol));
    renderWatchlist($("#watch-search").value);
  });
  $("#watch-list").addEventListener("click", (event) => {
    const symbol = event.target.dataset.remove;
    if (!symbol) return;
    watchlist.splice(
      watchlist.findIndex((item) => item.symbol === symbol),
      1,
    );
    renderWatchlist($("#watch-search").value);
    showToast(`${symbol} removed from watchlist.`);
  });
  $("#add-symbol").addEventListener("click", () => {
    const symbol = window.prompt("Add a stock or index symbol");
    if (!symbol) return;
    const normalized = symbol.trim().toUpperCase();
    if (watchlist.some((item) => item.symbol === normalized))
      return showToast("That symbol is already in your watchlist.");
    watchlist.push({
      symbol: normalized,
      name: "Custom symbol",
      type: "Stock",
    });
    renderWatchlist();
    showToast(`${normalized} added as a local watchlist item.`);
  });
  $("#risk-form").addEventListener("submit", calculateRisk);
  $("#run-scanner").addEventListener("click", () =>
    showToast(
      "Scanner needs market, analytics, and AI analysis APIs before it can run.",
    ),
  );
  $("[data-modal='why-modal']").addEventListener("click", openWhyModal);
  $("[data-close-modal]").addEventListener("click", closeWhyModal);
  $("#modal-backdrop").addEventListener("click", closeWhyModal);
  $("#connect-upstox").addEventListener("click", () =>
    showToast(
      `Backend required: initiate secure OAuth via ${API_ENDPOINTS.upstoxConnect}.`,
    ),
  );
  $("#test-upstox").addEventListener("click", () =>
    showToast("No broker backend is configured; connection test was not sent."),
  );
  $("#disconnect-upstox").addEventListener("click", () =>
    showToast("No browser token exists to disconnect."),
  );
  $("#test-whatsapp").addEventListener("click", () =>
    showToast("WhatsApp messages require a secure provider backend."),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#why-modal").open) closeWhyModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      route("search");
      $("#stock-query").focus();
    }
  });
}

function init() {
  renderIndices();
  renderWatchlist();
  renderRules();
  bindEvents();
  $("#updated-at").textContent =
    `Last updated: ${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date())} · DEMO`;
}
init();
