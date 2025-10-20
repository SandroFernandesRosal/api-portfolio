import { z } from 'zod'

export const projectSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  img: z.string(),
  video: z.string().nullable(),
  repo: z.string(),
  page: z.string(),
  slug: z.string(),
  featured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  technologies: z.array(z.string()),
  images: z.array(z.string()),
})

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  img: z.string().min(1, 'Imagem é obrigatória'),
  video: z.string().optional(),
  repo: z.string().url('URL do repositório inválida'),
  page: z.string().url('URL da página inválida'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  featured: z.boolean().default(false),
  technologies: z.array(z.string()).min(1, 'Pelo menos uma tecnologia é obrigatória'),
  images: z.array(z.string()).optional().default([]),
})

export const updateProjectSchema = createProjectSchema.partial()

export const searchProjectsSchema = z.object({
  q: z.string().min(1, 'Query de busca é obrigatória'),
})

export type Project = z.infer<typeof projectSchema>
export type CreateProjectRequest = z.infer<typeof createProjectSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>
export type SearchProjectsRequest = z.infer<typeof searchProjectsSchema>
