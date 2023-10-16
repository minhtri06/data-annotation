import { inject, injectable } from 'inversify'
import { RequestHandler } from 'express'

import { IStorageService } from '@src/services'
import { TYPES } from '../constants'
import { StatusCodes } from 'http-status-codes'

export interface IUploadMiddleware {
  uploadSingle(
    type: 'image',
    fieldName: string,
    options?: { required?: boolean },
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
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `'${fieldName}' field is required in form-data` })
      }
      return next()
    }) as RequestHandler
  }
}
