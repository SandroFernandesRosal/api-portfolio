import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
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
    // Configuração CORS simples e direta
    app.addHook('onRequest', async (request, reply) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🌐 CORS Hook: ${request.method} ${request.url}`)
        console.log('🌐 Origin:', request.headers.origin)
        // Não logar cookies ou body por segurança
      }
      
      const origin = request.headers.origin
      const allowedOrigins = [
        'https://sandrodev.com.br',
        'https://www.sandrodev.com.br',
        'https://sandrofernandes-dev.vercel.app',
        'https://api-portfolio-eight.vercel.app',
        'http://localhost:3000'
      ]
      
      // Definir origem específica para permitir credentials
      if (origin && allowedOrigins.includes(origin)) {
        reply.header('Access-Control-Allow-Origin', origin)
      }
      
      reply.header('Access-Control-Allow-Credentials', 'true')
      reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
      reply.header('Access-Control-Expose-Headers', 'Set-Cookie')
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ CORS headers set for origin:', origin)
      }
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🔄 Handling OPTIONS request')
        }
        reply.status(200).send()
        return
      }
    })

    await app.register(cookie, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      parseOptions: {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      }
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

    // Test CORS endpoint
    app.get('/test-cors', async (request, reply) => {
      console.log('🧪 Test CORS endpoint called')
      return { 
        message: 'CORS is working!', 
        origin: request.headers.origin,
        timestamp: new Date().toISOString() 
      }
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
