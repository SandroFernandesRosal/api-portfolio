import { FastifyInstance } from 'fastify'
import getPool from '../database/connection'
import { generateToken } from '../utils/jwt'
import { loginSchema, updateProfileSchema } from '../schemas/auth'
import { authenticateToken } from '../middleware/auth'
import { comparePassword } from '../utils/password'

export async function authRoutes(app: FastifyInstance) {

  // Login route
  app.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body)

      // Limpar qualquer cookie antigo primeiro
      reply.clearCookie('token', {
        path: '/',
        domain: 'localhost',
        secure: false,
        sameSite: 'lax'
      })
      reply.clearCookie('token', {
        path: '/',
        domain: '.localhost',
        secure: false,
        sameSite: 'lax'
      })
      reply.clearCookie('token', {
        path: '/',
        secure: true,
        sameSite: 'none'
      })

      const pool = getPool()
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

      // SEMPRE gerar um novo token a cada login
      const token = generateToken({
        userId: user.id,
        email: user.email
      })

      // Set cookie with token - configuração para produção e desenvolvimento
      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // true em produção (HTTPS), false em desenvolvimento
        sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax', // 'none' para cross-domain em produção
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      }
      
      reply.setCookie('token', token, cookieOptions)

      // Enviar token no header também para garantir
      reply.header('Authorization', `Bearer ${token}`)
      
      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          imageUrl: user.image_url || null,
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
    // Limpar cookie com configurações para desenvolvimento e produção
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Limpar cookie de desenvolvimento
    if (!isProduction) {
      reply.clearCookie('token', {
        path: '/',
        domain: 'localhost',
        secure: false,
        sameSite: 'lax',
        httpOnly: true
      })
      reply.clearCookie('token', {
        path: '/',
        domain: '.localhost',
        secure: false,
        sameSite: 'lax',
        httpOnly: true
      })
    }
    
    // Limpar cookie de produção (cross-domain)
    reply.clearCookie('token', {
      path: '/',
      secure: true,
      sameSite: 'none',
      httpOnly: true
    })
    
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
        imageUrl: user.image_url || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Update user profile route
  app.put('/profile', {
    preHandler: [authenticateToken]
  }, async (request, reply) => {
    try {
      const validatedData = updateProfileSchema.parse(request.body)
      const pool = getPool()
      
      // Construir query dinamicamente baseado nos campos fornecidos
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (validatedData.name !== undefined) {
        updates.push(`name = $${paramIndex}`)
        values.push(validatedData.name)
        paramIndex++
      }

      if (validatedData.email !== undefined) {
        // Verificar se o email já existe para outro usuário
        const emailCheck = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [validatedData.email, request.user!.userId]
        )
        
        if (emailCheck.rows.length > 0) {
          return reply.status(400).send({ message: 'Email já está em uso' })
        }

        updates.push(`email = $${paramIndex}`)
        values.push(validatedData.email)
        paramIndex++
      }

      if (validatedData.imageUrl !== undefined) {
        updates.push(`image_url = $${paramIndex}`)
        values.push(validatedData.imageUrl)
        paramIndex++
      }

      if (updates.length === 0) {
        return reply.status(400).send({ message: 'Nenhum campo para atualizar' })
      }

      // Adicionar updated_at
      updates.push(`updated_at = NOW()`)
      
      // Adicionar o userId no final
      values.push(request.user!.userId)

      const updateQuery = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `

      const result = await pool.query(updateQuery, values)
      const updatedUser = result.rows[0]

      return reply.send({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        imageUrl: updatedUser.image_url || null,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error })
      }
      
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
}
