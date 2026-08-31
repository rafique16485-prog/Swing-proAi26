const ALLOWED_ORIGIN = "https://rafique16485-prog.github.io";
const MAX_IMAGE_CHARS = 14_000_000;

const schema = {
  type: "object",
  additionalProperties: false,
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return send(res, 500, { error: "OPENAI_API_KEY is not configured on the backend" });

  const image = req.body?.image;
  const symbol = String(req.body?.symbol || "Unknown").slice(0, 80);
  const timeframe = String(req.body?.timeframe || "Unknown").slice(0, 40);

  if (typeof image !== "string" || !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(image)) {
    return send(res, 400, { error: "A PNG, JPEG or WEBP chart data URL is required" });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return send(res, 413, { error: "Chart image is too large. Please upload a smaller image." });
  }

  const prompt = `You are the chart-vision module of Swing Pro AI. Analyze the uploaded trading chart for decision support only. Symbol: ${symbol}. Timeframe: ${timeframe}.\n\nRules: read only what is actually visible. Do not invent prices, candles, indicators, liquidity, demand/supply zones or option levels. If an exact numeric level cannot be read confidently, return "Not clearly visible" for that field. Identify market structure, trend, momentum and obvious liquidity. Give a trade verdict only when the chart provides enough evidence; otherwise WAIT. Confidence is 0-100 and should reflect image quality and evidence, not certainty of future price. Keep the output concise. This is not financial advice. Return JSON matching the supplied schema.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_VISION_MODEL || "gpt-5.6-luna",
        store: false,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: image, detail: "high" }
          ]
        }],
        text: {
          format: {
            type: "json_schema",
            name: "chart_analysis",
            strict: true,
            schema
          }
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return send(res, response.status, {
        error: data?.error?.message || "AI vision request failed"
      });
    }

    const text = data?.output_text || data?.output?.flatMap(x => x?.content || [])
      .find(x => x?.type === "output_text")?.text;
    if (!text) return send(res, 502, { error: "AI returned no analysis" });

    let analysis;
    try { analysis = JSON.parse(text); }
    catch { return send(res, 502, { error: "AI returned invalid analysis JSON" }); }

    return send(res, 200, { ok: true, analysis, model: data?.model || null });
  } catch (error) {
    return send(res, 502, { error: "Unable to reach AI vision service", detail: error.message });
  }
}
