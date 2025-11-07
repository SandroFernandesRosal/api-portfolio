import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
  imageUrl: z.string().url('URL inválida').nullable().optional(),
})

export type LoginRequest = z.infer<typeof loginSchema>
export type UserResponse = z.infer<typeof userSchema>
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>

