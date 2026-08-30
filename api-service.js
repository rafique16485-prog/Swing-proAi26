/**
 * Browser-safe API boundary. No credentials belong in this file.
 * Replace the unavailable response path with a secured backend deployment.
 */
export const API_ENDPOINTS = Object.freeze({
  market: "/api/market",
  quotes: "/api/quotes",
  search: "/api/search",
  fundamentals: "/api/fundamentals",
  technical: "/api/technical",
  options: "/api/options",
  fiiDii: "/api/fii-dii",
  news: "/api/news",
  analyze: "/api/ai/analyze",
  risk: "/api/risk/calculate",
  alerts: "/api/alerts",
  whatsapp: "/api/notifications/whatsapp",
  upstoxConnect: "/api/upstox/connect",
  upstoxCallback: "/api/upstox/callback",
  upstoxStatus: "/api/upstox/status",
});

export class ApiService {
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }
  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { Accept: "application/json", ...options.headers },
      ...options,
    });
    if (!response.ok)
      throw new Error(`API request failed (${response.status})`);
    return response.json();
  }
  getMarket() {
    return this.request(API_ENDPOINTS.market);
  }
  search(query) {
    return this.request(
      `${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`,
    );
  }
  analyze(symbol) {
    return this.request(
      `${API_ENDPOINTS.analyze}?symbol=${encodeURIComponent(symbol)}`,
    );
  }
  calculateRisk(payload) {
    return this.request(API_ENDPOINTS.risk, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  getUpstoxStatus() {
    return this.request(API_ENDPOINTS.upstoxStatus);
  }
  /** Backend must initiate OAuth; never send a client secret from this frontend. */
  beginUpstoxOAuth() {
    window.location.assign(`${this.baseUrl}${API_ENDPOINTS.upstoxConnect}`);
  }
}

export const api = new ApiService();
