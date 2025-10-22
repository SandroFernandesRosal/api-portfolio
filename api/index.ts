import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import helmet from '@fastify/helmet'
import { authRoutes } from '../src/routes/auth'
import { projectRoutes } from '../src/routes/projects'
import { uploadRoutes } from '../src/routes/upload'
import { contactRoutes } from '../src/routes/contact'

const app = Fastify({
  logger: false // Desabilita logger no Vercel
})

async function buildApp() {
  try {
    // Register plugins
    await app.register(helmet, {
      global: true,
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false
    })

    const corsOptions = {
      origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://sandrofernandes-dev.vercel.app',
            'https://api-portfolio-eight.vercel.app',
            'https://sandrodev.com.br',
            'https://www.sandrodev.com.br',
            'https://api.sandrodev.com.br'
          ] 
        : ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      exposedHeaders: ['Set-Cookie']
    }
    
    await app.register(cors, corsOptions)

    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key'
    })

    // Register routes
    await app.register(authRoutes, { prefix: '/auth' })
    await app.register(projectRoutes, { prefix: '/projects' })
    await app.register(uploadRoutes, { prefix: '/upload' })
    await app.register(contactRoutes, { prefix: '/contact' })

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
