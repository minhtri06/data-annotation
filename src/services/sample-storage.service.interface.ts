import { Multer } from 'multer'

export interface ISampleStorageService {
  uploader: Multer

  storageName: string

  streamSample(options: {
    filename: string
    maxLinePerBatch: number
    process: (batch: string[][]) => Promise<void>
    final: () => Promise<void>
  }): void

  deleteFile(filename: string): Promise<void>
}
