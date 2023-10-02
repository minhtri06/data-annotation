import createHttpError from 'http-errors'
import multer, { Multer } from 'multer'
import cloudinary, { imageStorage } from '../configs/cloudinary.config'
import { injectable } from 'inversify'
import Joi from 'joi'

import { StorageService } from './abstracts/storage.service'
import { IStorageService } from './interfaces'
import { validateParams } from '@src/utils'

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
    validateParams({ filename }, { filename: Joi.string().required() })

    await cloudinary.uploader.destroy(filename)
  }
}
