import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { authRoutes } from '../src/routes/auth'
import { projectRoutes } from '../src/routes/projects'
import { uploadRoutes } from '../src/routes/upload'

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
})

async function start() {
  try {
    // Register plugins
    await app.register(helmet, {
      global: true
    })

    await app.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://sandrofernandes-dev.vercel.app'] 
        : ['http://localhost:3000'],
      credentials: true
    })

    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    })

    // Register routes
    await app.register(authRoutes, { prefix: '/auth' })
    await app.register(projectRoutes, { prefix: '/products' })
    await app.register(uploadRoutes, { prefix: '/upload' })

    // Health check
    app.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    return app
  } catch (err) {
    app.log.error(err)
    throw err
  }
}

export default start
