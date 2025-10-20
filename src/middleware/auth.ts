import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken } from '../utils/jwt'

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.cookies.token

    if (!token) {
      return reply.status(401).send({ message: 'Token não fornecido' })
    }

    const payload = verifyToken(token)
    request.user = payload

    return
  } catch (error) {
    return reply.status(401).send({ message: 'Token inválido' })
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
