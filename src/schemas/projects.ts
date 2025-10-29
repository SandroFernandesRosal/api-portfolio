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
  ativo: z.boolean(),
  dateProject: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  technologies: z.array(z.string()),
  images: z.array(z.string()),
})


export const updateProjectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  img: z.string().optional(),
  video: z.string().optional(),
  repo: z.string().optional().or(z.literal('')),
  page: z.string().optional().or(z.literal('')),
  slug: z.string().optional(),
  featured: z.boolean().optional(),
  ativo: z.boolean().optional(),
  dateProject: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const searchProjectsSchema = z.object({
  q: z.string().min(1, 'Query de busca é obrigatória'),
})

export type Project = z.infer<typeof projectSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>
export type SearchProjectsRequest = z.infer<typeof searchProjectsSchema>

