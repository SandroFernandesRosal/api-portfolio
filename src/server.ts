import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { authRoutes } from './routes/auth'
import { projectRoutes } from './routes/projects'
import { uploadRoutes } from './routes/upload'

const app = Fastify({
  logger: {
    level: 'error'
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

    // Start server
    const port = Number(process.env.PORT) || 3333
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'

    await app.listen({ port, host })
    
    console.log(`🚀 Server running on http://${host}:${port}`)
    
    
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
