import { FastifyInstance } from 'fastify'
import pool from '../database/connection'
import { searchProjectsSchema } from '../schemas/projects'

export async function projectRoutes(app: FastifyInstance) {

  // Get all projects
  app.get('/', async (request, reply) => {
    try {
      const query = `
        SELECT 
          p.*,
          COALESCE(
            ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::text[]
          ) as technologies,
          COALESCE(
            ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL),
            ARRAY[]::text[]
          ) as images
        FROM projects p
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await pool.query(query)
      return reply.send(result.rows)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Get featured projects
  app.get('/featured', async (request, reply) => {
    try {
      const query = `
        SELECT 
          p.*,
          COALESCE(
            ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::text[]
          ) as technologies,
          COALESCE(
            ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL),
            ARRAY[]::text[]
          ) as images
        FROM projects p
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE p.featured = true
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await pool.query(query)
      return reply.send(result.rows)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Search projects
  app.get('/search', async (request, reply) => {
    try {
      const { q } = searchProjectsSchema.parse(request.query)
      
      const query = `
        SELECT 
          p.*,
          COALESCE(
            ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::text[]
          ) as technologies,
          COALESCE(
            ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL),
            ARRAY[]::text[]
          ) as images
        FROM projects p
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE LOWER(p.title) LIKE LOWER($1) OR LOWER(p.description) LIKE LOWER($1)
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await pool.query(query, [`%${q}%`])
      return reply.send(result.rows)
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ message: 'Query de busca inválida', errors: error })
      }
      
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Get project by slug
  app.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      
      const query = `
        SELECT 
          p.*,
          COALESCE(
            ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
            ARRAY[]::text[]
          ) as technologies,
          COALESCE(
            ARRAY_AGG(DISTINCT pi.url) FILTER (WHERE pi.url IS NOT NULL),
            ARRAY[]::text[]
          ) as images
        FROM projects p
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN project_images pi ON p.id = pi.project_id
        WHERE p.slug = $1
        GROUP BY p.id
      `
      
      const result = await pool.query(query, [slug])
      
      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'Projeto não encontrado' })
      }

      return reply.send(result.rows[0])
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
}
