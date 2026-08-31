const ALLOWED_ORIGIN = "https://rafique16485-prog.github.io";

function norm(value) {
  return String(value || "")
    .replace(/:/g, "|")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.UPSTOX_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: "UPSTOX_ACCESS_TOKEN is not configured" });

  const raw = req.query.instrument_key;
  if (!raw) return res.status(400).json({ error: "instrument_key is required" });

  const requested = String(raw)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const url = new URL("https://api.upstox.com/v3/market-quote/ltp");
  url.searchParams.set("instrument_key", requested.join(","));

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const payload = await response.json();
    if (!response.ok) return res.status(response.status).json(payload);

    const source = payload?.data && typeof payload.data === "object" ? payload.data : {};
    const entries = Object.entries(source);
    const data = {};

    for (const wanted of requested) {
      const target = norm(wanted);
      const found = entries.find(([key, value]) => {
        const k = norm(key);
        const tokenKey = norm(value?.instrument_token);
        return k === target || tokenKey === target;
      });

      if (found) {
        const [, value] = found;
        const last = Number(value?.last_price ?? value?.ltp ?? value?.last_traded_price);
        const prev = Number(value?.cp ?? value?.prev_close ?? value?.previous_close);
        data[wanted] = {
          last_price: Number.isFinite(last) ? last : null,
          cp: Number.isFinite(prev) ? prev : null,
          instrument_token: value?.instrument_token ?? null,
        };
      }
    }

    const valid = Object.values(data).filter((x) => Number.isFinite(x.last_price)).length;
    if (!valid) {
      return res.status(502).json({
        error: "Upstox returned no usable live quotes",
        returned_keys: entries.map(([key]) => key),
      });
    }

    return res.status(200).json({
      status: "success",
      data,
      meta: { requested: requested.length, valid },
    });
  } catch (error) {
    return res.status(502).json({ error: "Unable to reach Upstox", detail: error.message });
  }
}
