import { inject, injectable } from 'inversify'
import { RequestHandler } from 'express'
import createHttpError from 'http-errors'

import { IStorageService } from '../services/interfaces'
import { TYPES } from '../configs/constants'

export interface IUploadMiddleware {
  uploadSingle(
    type: 'image',
    fieldName: string,
    { required = true }?: { required?: boolean },
  ): RequestHandler
}

@injectable()
export class UploadMiddleware implements IUploadMiddleware {
  constructor(
    @inject(TYPES.STORAGE_SERVICE_FACTORY)
    private storageFactory: (type: 'image') => IStorageService,
  ) {}

  uploadSingle(
    type: 'image',
    fieldName: string,
    { required = true }: { required?: boolean } = {},
  ): RequestHandler {
    const storage = this.storageFactory(type)
    return (async (req, res, next) => {
      await storage.uploadSingle(req, fieldName)
      if (required && !req.file) {
        next(createHttpError.BadRequest(`'${fieldName}' field is required in form-data`))
      }
      next()
    }) as RequestHandler
  }
}
