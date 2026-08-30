const ALLOWED_ORIGIN = "https://rafique16485-prog.github.io";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.UPSTOX_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "UPSTOX_ACCESS_TOKEN is not configured" });

  const instrumentKey = req.query.instrument_key || "NSE_INDEX|Nifty 50";
  const expiryDate = req.query.expiry_date;
  if (!expiryDate) return res.status(400).json({ error: "expiry_date is required" });

  const url = new URL("https://api.upstox.com/v2/option/chain");
  url.searchParams.set("instrument_key", instrumentKey);
  url.searchParams.set("expiry_date", expiryDate);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Unable to reach Upstox", detail: error.message });
  }
}
