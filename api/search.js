// GET /api/search?q=...  → 登录校验后，调 YouTube Data API（只读）按播放量搜公开视频。
// 演示真实 API 用法：youtube/v3/search(order=viewCount) + youtube/v3/videos(statistics)。
// API key 只在服务端，绝不下发浏览器。
export default async function handler(req, res) {
  // 登录门：校验 cookie
  const cookie = req.headers.cookie || "";
  const m = cookie.match(/(?:^|;\s*)gtr_session=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : "";
  if (!process.env.DEMO_TOKEN || token !== process.env.DEMO_TOKEN) {
    return res.status(401).json({ error: "not signed in" });
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(500).json({ error: "Server not configured (YOUTUBE_API_KEY)" });

  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "missing q" });

  try {
    // 1) search.list：按播放量取候选视频 id
    const su = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=viewCount&maxResults=12&q=${encodeURIComponent(q)}&key=${key}`;
    const sr = await fetch(su);
    if (!sr.ok) return res.status(502).json({ error: "youtube search failed", detail: await sr.text() });
    const sj = await sr.json();
    const ids = (sj.items || []).map((i) => i.id && i.id.videoId).filter(Boolean);
    if (!ids.length) return res.status(200).json([]);

    // 2) videos.list：取播放量等公开统计
    const vu = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}&key=${key}`;
    const vr = await fetch(vu);
    if (!vr.ok) return res.status(502).json({ error: "youtube videos failed", detail: await vr.text() });
    const vj = await vr.json();

    const out = (vj.items || []).map((it) => ({
      title: it.snippet?.title || "",
      channel: it.snippet?.channelTitle || "",
      views: Number(it.statistics?.viewCount || 0),
      thumb: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url || "",
      url: "https://www.youtube.com/watch?v=" + it.id,
    })).sort((a, b) => b.views - a.views);

    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message || e) });
  }
}
