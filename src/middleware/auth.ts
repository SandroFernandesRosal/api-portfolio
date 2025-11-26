import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt'

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Pegar token apenas do cookie (HttpOnly, seguro)
    const token = request.cookies?.token

    if (!token) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('❌ No token found in request cookies')
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
      // Função auxiliar para limpar cookies com as mesmas configurações usadas no login
      const clearAllCookies = () => {
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
        
        // Limpar cookie sem domain (configuração atual usada no login)
        reply.clearCookie('token', {
          path: '/',
          httpOnly: true,
          secure: isProduction,
          sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
        })
        
        // Limpar cookies antigos que possam ter sido criados com domain (fallback)
        // Isso garante que cookies de versões antigas do código sejam limpos também
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
      }

      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          if (process.env.NODE_ENV !== 'production') {
            console.log('🕐 Token expirado detectado, limpando e rejeitando...')
          }
          clearAllCookies()
          
          return reply.status(401).send({ 
            message: 'Token expirado', 
            code: 'TOKEN_EXPIRED',
            redirect: '/admin/login'
          })
        }
        
        // Detectar token com assinatura inválida (token antigo ou de outro ambiente)
        if (error.name === 'JsonWebTokenError' && error.message.includes('invalid signature')) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('🔑 Token com assinatura inválida detectado (token antigo?), limpando cookie...')
          }
          clearAllCookies()
          
          return reply.status(401).send({ 
            message: 'Token inválido. Por favor, faça login novamente.', 
            code: 'INVALID_TOKEN_SIGNATURE',
            redirect: '/admin/login'
          })
        }
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
