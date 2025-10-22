import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt'

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log('🔍 Checking authentication...')
    console.log('🍪 Cookies received:', request.cookies)
    console.log('📋 Headers received:', request.headers)
    
    // Tentar pegar token do cookie primeiro, depois do header
    let token = request.cookies?.token
    
    if (!token) {
      const authHeader = request.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      console.log('❌ No token found in request')
      return reply.status(401).send({ message: 'Token não fornecido' })
    }

    console.log('🔍 Token found, validating...')
    const payload = verifyToken(token)
    request.user = payload
    console.log('✅ Token validated successfully')

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
