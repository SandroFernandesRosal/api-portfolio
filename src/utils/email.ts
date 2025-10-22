import nodemailer from 'nodemailer'
import { ContactRequest } from '../schemas/contact'

// Configuração do transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sandrofernandesrosal@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password',
  },
})

export async function sendContactEmail(data: ContactRequest) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // sandrofernandesrosal@gmail.com
      to: process.env.EMAIL_USER, // sandrofernandesrosal@gmail.com (mesmo email)
      subject: `[Portfolio] ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            Nova mensagem do Portfolio
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Informações do Contato:</h3>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Assunto:</strong> ${data.subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #333;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Esta mensagem foi enviada através do formulário de contato do seu portfolio.
            </p>
          </div>
        </div>
      `,
      text: `
Nova mensagem do Portfolio

Informações do Contato:
- Nome: ${data.name}
- Email: ${data.email}
- Assunto: ${data.subject}

Mensagem:
${data.message}

---
Esta mensagem foi enviada através do formulário de contato do seu portfolio.
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Email enviado com sucesso:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    throw new Error('Falha ao enviar email')
  }
}

// Função para testar a configuração do email
export async function testEmailConnection() {
  try {
    await transporter.verify()
    console.log('✅ Conexão com email configurada corretamente')
    return true
  } catch (error) {
    console.error('❌ Erro na configuração do email:', error)
    return false
  }
}
