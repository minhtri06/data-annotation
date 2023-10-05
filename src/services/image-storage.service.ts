import createHttpError from 'http-errors'
import multer, { Multer } from 'multer'
import cloudinary, { imageStorage } from '../configs/cloudinary.config'
import { injectable } from 'inversify'

import { StorageService } from './abstracts/storage.service'
import { IStorageService } from './interfaces'

@injectable()
export class ImageStorageService extends StorageService implements IStorageService {
  protected uploader: Multer

  constructor() {
    super()

    this.uploader = multer({
      storage: imageStorage,
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const [type] = file.mimetype.split('/')
        if (type !== 'image') {
          cb(createHttpError.BadRequest('Invalid image'))
        }
        cb(null, true)
      },
    })
  }

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
