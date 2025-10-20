import 'dotenv/config'
import Fastify from 'fastify'

const app = Fastify({
  logger: false
})

// Simple health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Simple test route
app.get('/test', async () => {
  return { message: 'API is working!' }
})

export default async (req: any, res: any) => {
  return app.ready().then(() => app.server.emit('request', req, res))
}
