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
      console.log('🔐 Login attempt received')
      const { email, password } = loginSchema.parse(request.body)
      console.log('📧 Email:', email)
      console.log('🔑 Password length:', password.length)

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
      console.log('🧹 Cleared all old cookies')

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

      // SEMPRE gerar um novo token a cada login
      const token = generateToken({
        userId: user.id,
        email: user.email
      })
      console.log('🔄 New token generated for login')

      // Set cookie with token - configuração simplificada
      const cookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      }
      
      console.log('🍪 Setting cookie with options:', cookieOptions)
      console.log('🔐 Token generated:', token.substring(0, 20) + '...')
      
      reply.setCookie('token', token, cookieOptions)
      console.log('✅ Cookie set successfully')
      
      // Verificar se o cookie foi definido
      console.log('🍪 Cookies after setting:', reply.getHeader('Set-Cookie'))
      console.log('🍪 All response headers:', reply.getHeaders())
      
      // Testar se o cookie foi realmente definido
      const setCookieHeader = reply.getHeader('Set-Cookie')
      if (setCookieHeader) {
        console.log('✅ Set-Cookie header found:', setCookieHeader)
      } else {
        console.log('❌ No Set-Cookie header found!')
      }

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
