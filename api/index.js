export default async function handler(req, res) {
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  const target = `https://api.squiggle.com.au/${query}`

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'MatchDay/1.0 (contact: harryjnathanson@gmail.com)' },
    })
    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    res.send(body)
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed', message: err.message })
  }
}
