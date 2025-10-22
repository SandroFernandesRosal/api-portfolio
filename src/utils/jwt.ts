import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'

export function generateToken(payload: JWTPayload): string {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' })
}

export function verifyToken(token: string): JWTPayload {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}


