import { inject, injectable } from 'inversify'
import { RequestHandler } from 'express'

import { TYPES } from '@src/constants'
import { Multer } from 'multer'
import { IImageStorageService, ISampleStorageService } from '@src/services'

export interface IUploadMiddleware {
  uploadImage: (fieldName: string) => RequestHandler

  uploadSample: (fieldName: string) => RequestHandler
}

@injectable()
export class UploadMiddleware implements IUploadMiddleware {
  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE)
    private imageStorageService: IImageStorageService,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
  ) {}

  uploadFile = (
    storageService: { uploader: Multer; storageName: string },
    fieldName: string,
  ): RequestHandler => {
    const [storageName] = fieldName.split(':')
    if (storageName !== storageService.storageName) {
      throw new Error(
        `Upload image field name should be prefixed with '${storageService.storageName}:',` +
          `use '${storageService.storageName}:${fieldName}' instead`,
      )
    }
    return storageService.uploader.single(fieldName)
  }

  uploadImage = (fieldName: string) => {
    return this.uploadFile(this.imageStorageService, fieldName)
  }

  uploadSample = (fieldName: string) => {
    return this.uploadFile(this.sampleStorageService, fieldName)
  }
}
