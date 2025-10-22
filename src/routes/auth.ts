import { FastifyInstance } from 'fastify'
import getPool from '../database/connection'
import { generateToken } from '../utils/jwt'
import { loginSchema } from '../schemas/auth'
import { authenticateToken } from '../middleware/auth'
import { comparePassword } from '../utils/password'

export async function authRoutes(app: FastifyInstance) {

  // Login route
  app.post('/login', async (request, reply) => {
    try {
      console.log('🔐 Login attempt received')
      const { email, password } = loginSchema.parse(request.body)
      console.log('📧 Email:', email)
      console.log('🔑 Password length:', password.length)

      const pool = getPool()
      console.log('🗄️ Database pool connected')
      const userQuery = 'SELECT * FROM users WHERE email = $1'
      console.log('🔍 Querying user with email:', email)
      const userResult = await pool.query(userQuery, [email])
      console.log('📊 Query result rows:', userResult.rows.length)
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found')
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const user = userResult.rows[0]
      console.log('🔍 User found:', user.email)
      console.log('🔑 Comparing password...')
      
      const isValidPassword = await comparePassword(password, user.password)
      console.log('✅ Password valid:', isValidPassword)
      
      if (!isValidPassword) {
        console.log('❌ Invalid password')
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const token = generateToken({
        userId: user.id,
        email: user.email
      })

      // Set cookie with token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none' as const, // Sempre none para cross-origin
        path: '/',
        maxAge: 4 * 60 * 60 * 1000, // 4 hours
      }
      
      console.log('🍪 Setting cookie with options:', cookieOptions)
      console.log('🔐 Token generated:', token.substring(0, 20) + '...')
      reply.setCookie('token', token, cookieOptions)
      console.log('✅ Cookie set successfully')
      
      // Verificar se o cookie foi definido
      console.log('🍪 Cookies after setting:', reply.getHeader('Set-Cookie'))
      console.log('🍪 All response headers:', reply.getHeaders())

      // Enviar token no header também para garantir
      reply.header('Authorization', `Bearer ${token}`)
      
      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error })
      }
      
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Logout route
  app.post('/logout', async (request, reply) => {
    reply.clearCookie('token')
    return reply.send({ message: 'Logout realizado com sucesso' })
  })

  // Get current user route
  app.get('/me', {
    preHandler: [authenticateToken]
  }, async (request, reply) => {
    try {
      const pool = getPool()
      const userQuery = 'SELECT * FROM users WHERE id = $1'
      const userResult = await pool.query(userQuery, [request.user!.userId])
      
      if (userResult.rows.length === 0) {
        return reply.status(404).send({ message: 'Usuário não encontrado' })
      }

      const user = userResult.rows[0]

      return reply.send({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
}
