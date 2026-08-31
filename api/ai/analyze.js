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
  required: [
    "verdict", "confidence", "trend", "structure", "momentum", "liquidity",
    "demand_zone", "supply_zone", "entry", "stop_loss", "target_1", "target_2",
    "target_3", "risk", "confirmation", "invalidation", "notes"
  ]
};

function send(res, status, body) {
  return res.status(status).json(body);
}

function parseImageDataUrl(image) {
  const match = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase() === "jpg" ? "image/jpeg" : `image/${match[1].toLowerCase()}`,
    data: match[2]
  };
}

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

  if (typeof image !== "string") {
    return send(res, 400, { error: "A chart image data URL is required" });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return send(res, 413, { error: "Chart image is too large. Please upload a smaller image." });
  }

  const imageData = parseImageDataUrl(image);
  if (!imageData) {
    return send(res, 400, { error: "A PNG, JPEG or WEBP chart data URL is required" });
  }

  const prompt = `You are the chart-vision module of Swing Pro AI. Analyze the uploaded trading chart for decision support only. Symbol: ${symbol}. Timeframe: ${timeframe}.\n\nRules: read only what is actually visible. Do not invent prices, candles, indicators, liquidity, demand/supply zones or option levels. If an exact numeric level cannot be read confidently, return "Not clearly visible" for that field. Identify market structure, trend, momentum and obvious liquidity. Give a trade verdict only when the chart provides enough evidence; otherwise WAIT. Confidence is 0-100 and should reflect image quality and evidence, not certainty of future price. Keep the output concise. This is not financial advice. Return JSON matching the supplied schema.`;

  try {
    const model = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: imageData }
            ]
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return send(res, response.status, {
        error: data?.error?.message || "Gemini vision request failed"
      });
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map(part => part?.text || "")
      .join("")
      .trim();

    if (!text) return send(res, 502, { error: "Gemini returned no analysis" });

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      return send(res, 502, { error: "Gemini returned invalid analysis JSON" });
    }

    return send(res, 200, { ok: true, analysis, model: data?.modelVersion || model });
  } catch (error) {
    return send(res, 502, { error: "Unable to reach Gemini vision service", detail: error.message });
  }
}
