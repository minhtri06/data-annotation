import { Multer } from 'multer'

export interface ISampleStorageService {
  uploader: Multer

  storageName: string

  streamSample(options: streamSamplesOptions): void

  deleteFile(filename: string): Promise<void>

  checkExist(filename: string): Promise<boolean>
}

export type streamSamplesOptions = {
  filename: string
  maxLinePerBatch: number
  process: (batch: string[][]) => Promise<void>
  final?: () => Promise<void>
}
