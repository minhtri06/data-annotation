import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import ENV_CONFIG from './env.config'

cloudinary.config({
  cloud_name: ENV_CONFIG.CLOUDINARY_NAME,
  api_key: ENV_CONFIG.CLOUDINARY_API_KEY,
  api_secret: ENV_CONFIG.CLOUDINARY_API_SECRET,
})

export default cloudinary

const params = { folder: 'data-annotation', allowedFormats: ['jpg', 'png', 'jpeg'] }
export const imageStorage = new CloudinaryStorage({
  cloudinary,
  params,
})
