const ALLOWED_ORIGIN = "https://rafique16485-prog.github.io";
const MAX_IMAGE_CHARS = 14_000_000;

const schema = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["BUY", "SELL", "WAIT"] },
    confidence: { type: "number" },
    trend: { type: "string" },
    structure: { type: "string" },
    momentum: { type: "string" },
    liquidity: { type: "string" },
    demand_zone: { type: "string" },
    supply_zone: { type: "string" },
    entry: { type: "string" },
    stop_loss: { type: "string" },
    target_1: { type: "string" },
    target_2: { type: "string" },
    target_3: { type: "string" },
    risk: { type: "string" },
    confirmation: { type: "string" },
    invalidation: { type: "string" },
    notes: { type: "string" }
  },
  required: ["verdict","confidence","trend","structure","momentum","liquidity","demand_zone","supply_zone","entry","stop_loss","target_1","target_2","target_3","risk","confirmation","invalidation","notes"]
};

function send(res, status, body) { return res.status(status).json(body); }

function parseImageDataUrl(image) {
  const match = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase() === "jpg" ? "image/jpeg" : `image/${match[1].toLowerCase()}`,
    data: match[2]
  };
}

function isRetryable(status, message = "") {
  const text = String(message).toLowerCase();
  return status === 408 || status === 429 || status >= 500 ||
    text.includes("high demand") || text.includes("temporarily") ||
    text.includes("resource exhausted") || text.includes("overloaded");
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return send(res, 500, { error: "GEMINI_API_KEY is not configured on the backend" });

  const image = req.body?.image;
  const symbol = String(req.body?.symbol || "Unknown").slice(0, 80);
  const timeframe = String(req.body?.timeframe || "Unknown").slice(0, 40);

  if (typeof image !== "string") return send(res, 400, { error: "A chart image data URL is required" });
  if (image.length > MAX_IMAGE_CHARS) return send(res, 413, { error: "Chart image is too large. Please upload a smaller image." });

  const imageData = parseImageDataUrl(image);
  if (!imageData) return send(res, 400, { error: "A PNG, JPEG or WEBP chart data URL is required" });

  const prompt = `You are the chart-vision module of Swing Pro AI. Analyze the uploaded trading chart for decision support only. Symbol: ${symbol}. Timeframe: ${timeframe}.\n\nRules: read only what is actually visible. Do not invent prices, candles, indicators, liquidity, demand/supply zones or option levels. If an exact numeric level cannot be read confidently, return "Not clearly visible" for that field. Identify market structure, trend, momentum and obvious liquidity. Give a trade verdict only when the chart provides enough evidence; otherwise WAIT. Confidence is 0-100 and should reflect image quality and evidence, not certainty of future price. Keep the output concise. This is not financial advice. Return JSON matching the supplied schema.`;

  // Stable model first, then automatic fallback if the model is busy/unavailable.
  const models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
  const retryDelays = [800, 1800];

  try {
    let lastError = null;
    for (const model of models) {
      for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: imageData }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema: schema }
              })
            }
          );

          const data = await response.json();
          const message = data?.error?.message || "Gemini vision request failed";

          if (!response.ok) {
            lastError = { status: response.status, message, model };
            if (isRetryable(response.status, message) && attempt < retryDelays.length) {
              await sleep(retryDelays[attempt]);
              continue;
            }
            break;
          }

          const text = data?.candidates?.[0]?.content?.parts?.map(part => part?.text || "").join("").trim();
          if (!text) {
            lastError = { status: 502, message: "Gemini returned no analysis", model };
            break;
          }

          let analysis;
          try { analysis = JSON.parse(text); }
          catch {
            lastError = { status: 502, message: "Gemini returned invalid analysis JSON", model };
            break;
          }

          return send(res, 200, { ok: true, analysis, model: data?.modelVersion || model });
        } catch (error) {
          lastError = { status: 502, message: error.message, model };
          if (attempt < retryDelays.length) {
            await sleep(retryDelays[attempt]);
            continue;
          }
          break;
        }
      }
    }

    return send(res, 503, {
      error: "Gemini vision service is temporarily unavailable. All configured models were tried.",
      detail: lastError?.message || "Unknown Gemini error"
    });
  } catch (error) {
    return send(res, 502, { error: "Unable to reach Gemini vision service", detail: error.message });
  }
}
