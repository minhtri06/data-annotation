import { inject, injectable } from 'inversify'
import { RequestHandler } from 'express'

import { TYPES } from '../constants'
import { Multer } from 'multer'

export interface IUploadMiddleware {
  uploadImage: (fieldName: string) => RequestHandler
}

@injectable()
export class UploadMiddleware implements IUploadMiddleware {
  constructor(@inject(TYPES.IMAGE_UPLOADER) private imageUploader: Multer) {}

  uploadSingle = (uploader: Multer, fieldName: string): RequestHandler => {
    return uploader.single(fieldName)
  }

  uploadImage = (fieldName: string) => this.uploadSingle(this.imageUploader, fieldName)
}
