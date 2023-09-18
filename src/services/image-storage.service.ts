import createHttpError from 'http-errors'

import cloudinary, { imageStorage } from '../configs/cloudinary.config'
import { StorageService } from './abstracts/storage.service'
import { IStorageService } from './interfaces'
import multer, { Multer } from 'multer'
import { injectable } from 'inversify'

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
}
