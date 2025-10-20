import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'

const app = Fastify({
  logger: false
})

async function buildApp() {
  try {
    await app.register(helmet, { global: true })
    await app.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://sandrofernandes-dev.vercel.app'] 
        : ['http://localhost:3000'],
      credentials: true
    })
    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    })

    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    return app
  } catch (err) {
    console.error('Error building app:', err)
    throw err
  }
}

const fastifyApp = buildApp()

export default async (req: any, res: any) => {
  const app = await fastifyApp
  return app.ready().then(() => app.server.emit('request', req, res))
}
