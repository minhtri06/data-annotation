import { Request } from 'express'

export interface IStorageService {
  uploadSingle(req: Request, fieldName: string): Promise<void>

  deleteFile(filename: string): Promise<void>

  checkExist(filename: string): Promise<boolean>
}
