# Game Topic Radar — Demo

A minimal, **read-only** demo of how Game Topic Radar uses the YouTube Data API,
hosted for API compliance review.

After signing in with the demo account, enter a game name. The app calls the
YouTube Data API live — `youtube/v3/search` (ordered by view count) plus
`youtube/v3/videos` (statistics) — and lists public videos about that game with
their view counts. View count = real audience attention, which is the signal the
full tool uses to find under-covered video topics.

- **Read-only.** It never posts, comments, votes, rates, subscribes, or modifies
  anything on YouTube, and never accesses private user data.
- The `YOUTUBE_API_KEY` is stored as a server-side environment variable and is
  never exposed to the browser.

## Deploy (Vercel)

Zero build step — static `index.html` + serverless functions in `/api`.

Set these environment variables in the Vercel project:

| Variable | Purpose |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key (server-side only) |
| `DEMO_USER` | demo account username |
| `DEMO_PASS` | demo account password |
| `DEMO_TOKEN` | any random string (session cookie value) |

See the main project privacy policy at
https://github.com/ZhuBoao/Game-Topic-Radar/blob/main/PRIVACY.md
