import { z } from 'zod'

export const uploadSchema = z.object({
  folder: z.string().optional().default('portfolio'),
  width: z.number().optional(),
  height: z.number().optional(),
  crop: z.enum(['fill', 'fit', 'scale', 'crop', 'thumb']).optional().default('fill'),
  quality: z.enum(['auto', 'best', 'good', 'eco', 'low']).optional().default('auto'),
  format: z.enum(['auto', 'jpg', 'png', 'webp', 'gif']).optional().default('auto'),
})

export type UploadOptions = z.infer<typeof uploadSchema>

export interface UploadResponse {
  success: boolean
  data?: {
    public_id: string
    secure_url: string
    width: number
    height: number
    format: string
    bytes: number
  }
  error?: string
}
