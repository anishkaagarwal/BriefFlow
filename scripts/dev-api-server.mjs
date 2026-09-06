import http from 'node:http'
import handler from '../api/generate.js'

const PORT = 5174

const server = http.createServer(async (req, res) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    req.body = raw ? JSON.parse(raw) : {}
  } catch {
    req.body = {}
  }

  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (payload) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
  }

  await handler(req, res)
})

server.listen(PORT, () => {
  console.log(`Local /api dev server listening on http://localhost:${PORT}`)
})
