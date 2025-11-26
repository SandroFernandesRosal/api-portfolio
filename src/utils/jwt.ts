import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === 'your-secret-key') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ JWT_SECRET não configurado ou usando valor padrão. Isso pode causar problemas de autenticação.')
    }
    return secret || 'your-secret-key'
  }
  return secret
}

export function generateToken(payload: JWTPayload): string {
  const JWT_SECRET = getJwtSecret()
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }) // 30 dias
}

export function verifyToken(token: string): JWTPayload {
  const JWT_SECRET = getJwtSecret()
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ JWT Error:', error.message)
          console.error('🔑 JWT_SECRET usado:', JWT_SECRET === 'your-secret-key' ? 'valor padrão' : 'configurado')
        }
      }
    }
    throw error
  }
}


