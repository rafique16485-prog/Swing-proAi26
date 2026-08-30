export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://rafique16485-prog.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({ ok: true, service: "swing-pro-ai-backend" });
}
