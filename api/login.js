// POST /api/login  { user, pass } → 校验 demo 账号(来自环境变量)，设 httpOnly cookie。
// 仅用于 Google API 审核演示登录；只读、无任何写操作。
export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const okUser = process.env.DEMO_USER;
  const okPass = process.env.DEMO_PASS;
  const token = process.env.DEMO_TOKEN;
  if (!okUser || !okPass || !token) {
    return res.status(500).json({ error: "Server not configured (DEMO_USER/DEMO_PASS/DEMO_TOKEN)" });
  }

  if (body.user === okUser && body.pass === okPass) {
    res.setHeader(
      "Set-Cookie",
      `gtr_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
    );
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ error: "invalid credentials" });
}
