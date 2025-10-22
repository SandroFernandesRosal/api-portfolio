import { v2 as cloudinary } from 'cloudinary'

let isConfigured = false

function configureCloudinary() {
  if (!isConfigured) {
    console.log('🔧 Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING'
    })

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    })
    
    isConfigured = true
  }
  return cloudinary
}

export default configureCloudinary
