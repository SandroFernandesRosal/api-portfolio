import { FastifyInstance } from 'fastify'
import { uploadToCloudinary } from '../utils/upload'
import { uploadSchema, UploadResponse } from '../schemas/upload'
import { authenticateToken } from '../middleware/auth'

declare module 'fastify' {
  interface FastifyRequest {
    file(): Promise<any>
    files(): AsyncIterable<any>
  }
}

export async function uploadRoutes(app: FastifyInstance) {
  // Register multipart support
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    },
  })

  // Upload single image
  app.post('/image', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {

      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        } as UploadResponse)
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'Tipo de arquivo não permitido. Use: JPEG, PNG, WebP ou GIF'
        } as UploadResponse)
      }

      // Parse query parameters for upload options
      const options = uploadSchema.parse(request.query)
      
      // Convert file to buffer
      const buffer = await data.toBuffer()
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, options.folder, {
        width: options.width,
        height: options.height,
        crop: options.crop,
        quality: options.quality,
        format: options.format,
      })

      return reply.send({
        success: true,
        data: result
      } as UploadResponse)

    } catch (error) {
      app.log.error(error as Error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetros de upload inválidos'
        } as UploadResponse)
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor durante o upload'
      } as UploadResponse)
    }
  })

  // Upload multiple images
  app.post('/images', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      const files = request.files()
      const results = []
      const errors = []

      // Parse query parameters for upload options
      const options = uploadSchema.parse(request.query)

      for await (const file of files) {
        try {
          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
          if (!allowedTypes.includes(file.mimetype)) {
            errors.push({
              filename: file.filename,
              error: 'Tipo de arquivo não permitido'
            })
            continue
          }

          // Convert file to buffer
          const buffer = await file.toBuffer()
          
          // Upload to Cloudinary
          const result = await uploadToCloudinary(buffer, options.folder, {
            width: options.width,
            height: options.height,
            crop: options.crop,
            quality: options.quality,
            format: options.format,
          })

          results.push({
            filename: file.filename,
            data: result
          })

        } catch (error) {
          app.log.error(error as Error)
          errors.push({
            filename: file.filename,
            error: 'Erro durante o upload'
          })
        }
      }

      return reply.send({
        success: errors.length === 0,
        results,
        errors: errors.length > 0 ? errors : undefined
      })

    } catch (error) {
      app.log.error(error as Error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetros de upload inválidos'
        })
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor durante o upload'
      })
    }
  })

  // Upload video
  app.post('/video', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    try {
      console.log('🎥 Video upload started')
      const data = await request.file()
      
      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'Nenhum arquivo foi enviado'
        } as UploadResponse)
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
      if (!allowedTypes.includes(data.mimetype)) {
        return reply.status(400).send({
          success: false,
          error: 'Tipo de arquivo não permitido. Use: MP4, WebM, OGG, AVI ou MOV'
        } as UploadResponse)
      }

      // Parse query parameters for upload options
      const options = uploadSchema.parse(request.query)
      
      // Convert file to buffer
      console.log('📁 Converting file to buffer...')
      const buffer = await data.toBuffer()
      console.log('📦 Buffer size:', buffer.length, 'bytes')
      
      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...')
      const result = await uploadToCloudinary(buffer, options.folder, {
        resource_type: 'video',
        width: options.width,
        height: options.height,
        crop: options.crop,
        quality: options.quality,
        format: options.format,
      })

      return reply.send({
        success: true,
        data: result
      } as UploadResponse)

    } catch (error) {
      app.log.error(error as Error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Parâmetros de upload inválidos'
        } as UploadResponse)
      }

      return reply.status(500).send({
        success: false,
        error: 'Erro interno do servidor durante o upload do vídeo'
      } as UploadResponse)
    }
  })

  // Get upload info (for testing)
  app.get('/info', {
    preHandler: [authenticateToken],
  }, async (request, reply) => {
    return reply.send({
      message: 'Upload service is running',
      limits: {
        maxFileSize: '10MB',
        allowedTypes: ['JPEG', 'PNG', 'WebP', 'GIF', 'MP4', 'WebM', 'OGG', 'AVI', 'MOV'],
        maxFiles: 'Unlimited (for multiple upload)'
      },
      endpoints: {
        singleImage: 'POST /upload/image',
        multipleImages: 'POST /upload/images',
        video: 'POST /upload/video'
      }
    })
  })
}
