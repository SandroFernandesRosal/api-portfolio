import { FastifyInstance } from 'fastify'
import getPool from '../database/connection'
import { searchProjectsSchema, updateProjectSchema } from '../schemas/projects'
import { authenticateToken } from '../middleware/auth'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  img: z.string().min(1, 'Imagem é obrigatória'),
  video: z.string().optional(),
  repo: z.string().optional().or(z.literal('')),
  page: z.string().optional().or(z.literal('')),
  slug: z.string().min(1, 'Slug é obrigatório'),
  featured: z.boolean().default(false),
  ativo: z.boolean().default(true),
  dateProject: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

export async function projectRoutes(app: FastifyInstance) {

  // Get all projects (public - only active)
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
        WHERE p.ativo = true
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await getPool().query(query)
      
      // Mapear snake_case para camelCase
      const mappedRows = result.rows.map(row => ({
        ...row,
        dateProject: row.date_project,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
      
      return reply.send(mappedRows)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Get all projects for admin (including inactive)
  app.get('/admin', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
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
      
      const result = await getPool().query(query)
      
      // Mapear snake_case para camelCase
      const mappedRows = result.rows.map(row => ({
        ...row,
        dateProject: row.date_project,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
      
      return reply.send(mappedRows)
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
        WHERE p.featured = true AND p.ativo = true
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await getPool().query(query)
      
      // Mapear snake_case para camelCase
      const mappedRows = result.rows.map(row => ({
        ...row,
        dateProject: row.date_project,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
      
      return reply.send(mappedRows)
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
        WHERE (LOWER(p.title) LIKE LOWER($1) OR LOWER(p.description) LIKE LOWER($1)) AND p.ativo = true
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `
      
      const result = await getPool().query(query, [`%${q}%`])
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
        WHERE p.slug = $1 AND p.ativo = true
        GROUP BY p.id
      `
      
      const result = await getPool().query(query, [slug])
      
      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'Projeto não encontrado' })
      }

      // Mapear snake_case para camelCase
      const mappedRow = {
        ...result.rows[0],
        dateProject: result.rows[0].date_project,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      }

      return reply.send(mappedRow)
    } catch (error) {
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Create project
  app.post('/', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      console.log('➕ Create project request received')
      console.log('📝 Body:', request.body)
      
      const data = createProjectSchema.parse(request.body)
      
      // Verificar se o slug já existe
      const slugCheckQuery = 'SELECT id FROM projects WHERE slug = $1'
      const slugCheckResult = await getPool().query(slugCheckQuery, [data.slug])
      
      if (slugCheckResult.rows.length > 0) {
        return reply.status(400).send({ message: 'Slug já existe' })
      }

      // Criar o projeto
      const insertQuery = `
        INSERT INTO projects (title, description, img, video, repo, page, slug, featured, ativo, date_project)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `
      
      const result = await getPool().query(insertQuery, [
        data.title,
        data.description,
        data.img,
        data.video || null,
        data.repo || null,
        data.page || null,
        data.slug,
        data.featured,
        data.ativo,
        data.dateProject || null
      ])
      
      const newProject = result.rows[0]

      // Mapear snake_case para camelCase
      const mappedProject = {
        ...newProject,
        dateProject: newProject.date_project,
        createdAt: newProject.created_at,
        updatedAt: newProject.updated_at
      }

      // Adicionar tecnologias
      for (const techName of data.technologies) {
        // Verificar se a tecnologia existe, se não, criar
        let techResult = await getPool().query('SELECT id FROM technologies WHERE name = $1', [techName])
        let techId = techResult.rows[0]?.id
        
        if (!techId) {
          const newTechResult = await getPool().query('INSERT INTO technologies (name) VALUES ($1) RETURNING id', [techName])
          techId = newTechResult.rows[0].id
        }
        
        await getPool().query('INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)', [newProject.id, techId])
      }

      // Adicionar imagens
      for (const imageUrl of data.images) {
        await getPool().query('INSERT INTO project_images (project_id, url) VALUES ($1, $2)', [newProject.id, imageUrl])
      }

      console.log('✅ Project created successfully:', mappedProject.id)
      return reply.status(201).send({ message: 'Projeto criado com sucesso', project: mappedProject })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error })
      }
      
      console.log('❌ Error creating project:', error)
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Update project
  app.put('/:id', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      console.log('✏️ Update project request received')
      console.log('📋 Params:', request.params)
      console.log('📝 Body:', request.body)
      
      const { id } = request.params as { id: string }
      const data = updateProjectSchema.parse(request.body)
      
      // Verificar se o projeto existe
      const checkQuery = 'SELECT id FROM projects WHERE id = $1'
      const checkResult = await getPool().query(checkQuery, [id])
      
      if (checkResult.rows.length === 0) {
        console.log('❌ Project not found:', id)
        return reply.status(404).send({ message: 'Projeto não encontrado' })
      }

      // Atualizar o projeto
      const updateFields = []
      const updateValues = []
      let paramCount = 1

      if (data.title !== undefined) {
        updateFields.push(`title = $${paramCount}`)
        updateValues.push(data.title)
        paramCount++
      }
      if (data.description !== undefined) {
        updateFields.push(`description = $${paramCount}`)
        updateValues.push(data.description)
        paramCount++
      }
      if (data.img !== undefined) {
        updateFields.push(`img = $${paramCount}`)
        updateValues.push(data.img)
        paramCount++
      }
      if (data.video !== undefined) {
        updateFields.push(`video = $${paramCount}`)
        updateValues.push(data.video)
        paramCount++
      }
      if (data.repo !== undefined) {
        updateFields.push(`repo = $${paramCount}`)
        updateValues.push(data.repo || null)
        paramCount++
      }
      if (data.page !== undefined) {
        updateFields.push(`page = $${paramCount}`)
        updateValues.push(data.page || null)
        paramCount++
      }
      if (data.slug !== undefined) {
        updateFields.push(`slug = $${paramCount}`)
        updateValues.push(data.slug)
        paramCount++
      }
      if (data.featured !== undefined) {
        updateFields.push(`featured = $${paramCount}`)
        updateValues.push(data.featured)
        paramCount++
      }
      if (data.ativo !== undefined) {
        updateFields.push(`ativo = $${paramCount}`)
        updateValues.push(data.ativo)
        paramCount++
      }
      if (data.dateProject !== undefined) {
        updateFields.push(`date_project = $${paramCount}`)
        updateValues.push(data.dateProject)
        paramCount++
      }

      if (updateFields.length === 0) {
        return reply.status(400).send({ message: 'Nenhum campo para atualizar' })
      }

      updateFields.push(`updated_at = NOW()`)
      updateValues.push(id)

      const updateQuery = `
        UPDATE projects 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `

      const result = await getPool().query(updateQuery, updateValues)
      const updatedProject = result.rows[0]

      // Mapear snake_case para camelCase
      const mappedProject = {
        ...updatedProject,
        dateProject: updatedProject.date_project,
        createdAt: updatedProject.created_at,
        updatedAt: updatedProject.updated_at
      }

      // Atualizar tecnologias se fornecidas
      if (data.technologies !== undefined) {
        // Deletar tecnologias existentes
        await getPool().query('DELETE FROM project_technologies WHERE project_id = $1', [id])
        
        // Inserir novas tecnologias
        for (const techName of data.technologies) {
          // Verificar se a tecnologia existe, se não, criar
          let techResult = await getPool().query('SELECT id FROM technologies WHERE name = $1', [techName])
          let techId = techResult.rows[0]?.id
          
          if (!techId) {
            const newTechResult = await getPool().query('INSERT INTO technologies (name) VALUES ($1) RETURNING id', [techName])
            techId = newTechResult.rows[0].id
          }
          
          await getPool().query('INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)', [id, techId])
        }
      }

      // Atualizar imagens se fornecidas
      if (data.images !== undefined) {
        // Deletar imagens existentes
        await getPool().query('DELETE FROM project_images WHERE project_id = $1', [id])
        
        // Inserir novas imagens
        for (const imageUrl of data.images) {
          await getPool().query('INSERT INTO project_images (project_id, url) VALUES ($1, $2)', [id, imageUrl])
        }
      }

      console.log('✅ Project updated successfully:', id)
      return reply.send({ message: 'Projeto atualizado com sucesso', project: mappedProject })
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({ message: 'Dados inválidos', errors: error })
      }
      
      console.log('❌ Error updating project:', error)
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Delete project
  app.delete('/:id', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      console.log('🗑️ Delete project request received')
      console.log('📋 Params:', request.params)
      
      const { id } = request.params as { id: string }
      
      // Verificar se o projeto existe
      const checkQuery = 'SELECT id FROM projects WHERE id = $1'
      const checkResult = await getPool().query(checkQuery, [id])
      
      if (checkResult.rows.length === 0) {
        console.log('❌ Project not found:', id)
        return reply.status(404).send({ message: 'Projeto não encontrado' })
      }

      // Deletar tecnologias associadas
      await getPool().query('DELETE FROM project_technologies WHERE project_id = $1', [id])
      
      // Deletar imagens associadas
      await getPool().query('DELETE FROM project_images WHERE project_id = $1', [id])
      
      // Deletar o projeto
      await getPool().query('DELETE FROM projects WHERE id = $1', [id])
      
      console.log('✅ Project deleted successfully:', id)
      return reply.send({ message: 'Projeto deletado com sucesso' })
    } catch (error) {
      console.log('❌ Error deleting project:', error)
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })

  // Toggle project status (activate/deactivate)
  app.patch('/:id/toggle-status', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      console.log('🔄 Toggle project status request received')
      console.log('📋 Params:', request.params)
      
      const { id } = request.params as { id: string }
      
      // Verificar se o projeto existe
      const checkQuery = 'SELECT id, ativo FROM projects WHERE id = $1'
      const checkResult = await getPool().query(checkQuery, [id])
      
      if (checkResult.rows.length === 0) {
        console.log('❌ Project not found:', id)
        return reply.status(404).send({ message: 'Projeto não encontrado' })
      }

      const currentStatus = checkResult.rows[0].ativo
      const newStatus = !currentStatus

      // Atualizar o status do projeto
      const updateQuery = `
        UPDATE projects 
        SET ativo = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `

      const result = await getPool().query(updateQuery, [newStatus, id])
      const updatedProject = result.rows[0]

      // Mapear snake_case para camelCase
      const mappedProject = {
        ...updatedProject,
        dateProject: updatedProject.date_project,
        createdAt: updatedProject.created_at,
        updatedAt: updatedProject.updated_at
      }

      console.log(`✅ Project ${newStatus ? 'activated' : 'deactivated'} successfully:`, id)
      return reply.send({ 
        message: `Projeto ${newStatus ? 'ativado' : 'desativado'} com sucesso`, 
        project: mappedProject 
      })
    } catch (error) {
      console.log('❌ Error toggling project status:', error)
      app.log.error(error)
      return reply.status(500).send({ message: 'Erro interno do servidor' })
    }
  })
}
