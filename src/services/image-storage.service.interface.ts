import { Multer } from 'multer'

export interface IImageStorageService {
  storageName: string

  uploader: Multer

  deleteFile(filename: string): Promise<void>

  checkExist(filename: string): Promise<boolean>
}
