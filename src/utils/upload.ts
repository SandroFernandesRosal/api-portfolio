import configureCloudinary from '../config/cloudinary'
import { Readable } from 'stream'

export interface UploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'portfolio',
  options: {
    width?: number | undefined
    height?: number | undefined
    crop?: string
    quality?: string
    format?: string
    resource_type?: 'video' | 'auto' | 'image' | 'raw'
  } = {}
): Promise<UploadResult> {
  const cloudinary = configureCloudinary()
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options.resource_type || 'auto',
        transformation: options.resource_type === 'video' ? {
          quality: 'auto',
          format: 'mp4',
        } : {
          width: options.width,
          height: options.height,
          crop: options.crop || 'fill',
          quality: options.quality || 'auto',
          format: options.format || 'auto',
        },
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          })
        } else {
          reject(new Error('Upload failed'))
        }
      }
    )

    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudinary = configureCloudinary()
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}
