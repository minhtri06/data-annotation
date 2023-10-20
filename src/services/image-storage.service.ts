import cloudinary, { imageStorage } from '../configs/cloudinary.config'
import { injectable } from 'inversify'

import { IImageStorageService } from './image-storage.service.interface'
import multer, { Multer } from 'multer'
import { ValidationException } from './exceptions'

@injectable()
export class ImageStorageService implements IImageStorageService {
  storageName = 'image'

  uploader: Multer = multer({
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

  async deleteFile(filename: string) {
    await cloudinary.uploader.destroy(filename)
  }

  async checkExist(filename: string): Promise<boolean> {
    try {
      await cloudinary.api.resource(filename)
      return true
    } catch (error) {
      return false
    }
  }
}
