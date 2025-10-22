import { FastifyInstance } from 'fastify'
import { contactSchema } from '../schemas/contact'
import { sendContactEmail } from '../utils/email'

export async function contactRoutes(app: FastifyInstance) {

  // Send contact message
  app.post('/', async (request, reply) => {
    try {
      console.log('📧 Contact form request received')
      console.log('📝 Body:', request.body)
      
      const data = contactSchema.parse(request.body)
      
      // Enviar email
      await sendContactEmail(data)
      
      console.log('✅ Contact email sent successfully')
      return reply.send({
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
      })
      
    } catch (error) {
      console.log('❌ Error sending contact email:', error)
      
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          message: 'Dados inválidos',
          errors: error
        })
      }
      
      app.log.error(error)
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      })
    }
  })

}
