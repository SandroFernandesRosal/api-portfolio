import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { authRoutes } from './routes/auth'
import { projectRoutes } from './routes/projects'
import { uploadRoutes } from './routes/upload'
import { contactRoutes } from './routes/contact'

const app = Fastify({
  logger: {
    level: 'error'
  },
  requestTimeout: 300000, // 5 minutes timeout for video uploads
  bodyLimit: 100 * 1024 * 1024 // 100MB body limit
})

async function buildApp() {
  try {
    // Register plugins
    await app.register(helmet, {
      global: true
    })

    await app.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://sandrofernandes-dev.vercel.app',
            'https://sandrodev.com.br',
            'https://www.sandrodev.com.br',
            'https://api.sandrodev.com.br'
          ] 
        : ['http://localhost:3000'],
      credentials: true
    })

    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    })

    // Register routes
    await app.register(authRoutes, { prefix: '/auth' })
    await app.register(projectRoutes, { prefix: '/projects' })
    await app.register(uploadRoutes, { prefix: '/upload' })
    await app.register(contactRoutes, { prefix: '/contact' })

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

async function start() {
  try {
    const app = await buildApp()
    
    const port = Number(process.env.PORT) || 3333
    const host = 'localhost'

    await app.listen({ port, host })
    
    console.log(`🚀 Server running on http://${host}:${port}`)
    
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start()
