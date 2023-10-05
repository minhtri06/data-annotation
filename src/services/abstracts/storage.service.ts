import { Request, Response } from 'express'
import { Multer } from 'multer'
import util from 'util'

import { IStorageService } from '../interfaces'
import { injectable } from 'inversify'

@injectable()
export abstract class StorageService implements IStorageService {
  protected abstract uploader: Multer

  async uploadSingle(req: Request, fieldName: string): Promise<void> {
    await util.promisify(this.uploader.single(fieldName))(req, {} as Response)
  }

  abstract deleteFile(filename: string): Promise<void>

  abstract checkExist(filename: string): Promise<boolean>
}
