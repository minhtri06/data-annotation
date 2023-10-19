import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

import ENV_CONFIG from './env.config'
import multer from 'multer'
import { ValidationException } from '@src/services/exceptions'

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

export const imageUploader = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const [type] = file.mimetype.split('/')
    if (type !== 'image') {
      cb(new ValidationException('Invalid image', { type: 'invalid-image-upload' }))
    }
    cb(null, true)
  },
})
