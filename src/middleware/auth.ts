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
      return reply.status(401).send({ message: 'Token não fornecido' })
    }

    const payload = verifyToken(token)
    request.user = payload

    return
  } catch (error) {
    console.log('❌ Token validation failed:', error)
    
    // Verificar se é erro de expiração
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return reply.status(401).send({ 
        message: 'Token expirado', 
        code: 'TOKEN_EXPIRED',
        redirect: '/admin/login'
      })
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
