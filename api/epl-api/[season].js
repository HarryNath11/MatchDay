export default async function handler(req, res) {
  const { season } = req.query
  const target = `https://fixturedownload.com/feed/json/${season}`

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.send(body)
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed', message: err.message })
  }
}
