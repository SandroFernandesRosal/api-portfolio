import { FastifyInstance } from 'fastify'
import pool from '../database/connection'
import { generateToken } from '../utils/jwt'
import { loginSchema } from '../schemas/auth'
import { authenticateToken } from '../middleware/auth'
import { hashPassword, comparePassword } from '../utils/password'

export async function authRoutes(app: FastifyInstance) {

  // Login route
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      const userQuery = 'SELECT * FROM users WHERE email = $1'
      const userResult = await pool.query(userQuery, [email])
      
      if (userResult.rows.length === 0) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const user = userResult.rows[0]
      const isValidPassword = await comparePassword(password, user.password)
      if (!isValidPassword) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const token = generateToken({
        userId: user.id,
        email: user.email
      })

      // Set cookie with token
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

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
