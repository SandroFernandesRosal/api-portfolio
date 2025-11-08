import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt'

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Tentar pegar token do cookie primeiro, depois do header
    let token = request.cookies?.token
    
    if (!token) {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ No token found in request')
      }
      return reply.status(401).send({ message: 'Token não fornecido' })
    }
    
    // Verificar se o token está expirado antes de tentar validar
    try {
      const payload = verifyToken(token)
      request.user = payload
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Token validated successfully')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        if (process.env.NODE_ENV !== 'production') {
          console.log('🕐 Token expirado detectado, limpando e rejeitando...')
        }
        // Limpar o cookie expirado
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
        
        return reply.status(401).send({ 
          message: 'Token expirado', 
          code: 'TOKEN_EXPIRED',
          redirect: '/admin/login'
        })
      }
      throw error // Re-throw outros erros
    }

    return
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('❌ Token validation failed:', error)
    }
    
    return reply.status(401).send({ 
      message: 'Token inválido',
      code: 'INVALID_TOKEN',
      redirect: '/admin/login'
    })
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string
      email: string
    }
  }
}
