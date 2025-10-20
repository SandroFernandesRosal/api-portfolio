export default (req: any, res: any) => {
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

  return res.json({ message: 'API funcionando!' })
}
