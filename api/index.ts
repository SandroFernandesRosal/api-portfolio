import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { authRoutes } from '../src/routes/auth'
import { projectRoutes } from '../src/routes/projects'
import { uploadRoutes } from '../src/routes/upload'

const app = Fastify({
  logger: false // Desabilita logger no Vercel
})

async function buildApp() {
  try {
    // Register plugins
    await app.register(helmet, {
      global: true
    })

    await app.register(cors, {
      origin: ['https://sandrofernandes-dev.vercel.app'],
      credentials: true
    })

    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    })

    // Register routes
    await app.register(authRoutes, { prefix: '/auth' })
    await app.register(projectRoutes, { prefix: '/projects' })
    await app.register(uploadRoutes, { prefix: '/upload' })

    // Health check
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    return app
  } catch (err) {
    console.error('Error building app:', err)
    throw err
  }
}

// Build app once
const fastifyApp = buildApp()

export default async (req: any, res: any) => {
  const app = await fastifyApp
  return app.ready().then(() => app.server.emit('request', req, res))
}
