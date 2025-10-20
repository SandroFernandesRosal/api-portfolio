import { VercelRequest, VercelResponse } from '@vercel/node'

export default (req: VercelRequest, res: VercelResponse) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.url === '/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() })
  }

  if (req.url === '/test') {
    return res.json({ message: 'API is working!' })
  }

  return res.status(404).json({ message: 'Not found' })
}
