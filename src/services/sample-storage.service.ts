import fs from 'fs'
import { parse } from 'csv-parse'
import { injectable } from 'inversify'
import multer from 'multer'

import { ISampleStorageService } from './sample-storage.service.interface'
import { ValidationException } from './exceptions'

@injectable()
export class SampleStorageService implements ISampleStorageService {
  private basePath: string = '/app/temp/'

  storageName = 'sample'

  uploader = multer({
    dest: __dirname + '/../../temp',
    limits: {
      fieldSize: 20 * 1024 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      const [type, extension] = file.mimetype.split('/')

      if (type !== 'text' || extension !== 'csv') {
        return cb(new ValidationException('Invalid file type'))
      }

      cb(null, true)
    },
  })

  streamSample({
    filename,
    maxLinePerBatch,
    process,
    final,
  }: {
    filename: string
    maxLinePerBatch: number
    process: (batch: string[][]) => Promise<void>
    final: () => Promise<void>
  }) {
    const parser = fs.createReadStream(this.basePath + filename).pipe(parse({}))
    let batch: string[][] = []

    parser.on('data', (row: string[]) => {
      batch.push(row)
      if (batch.length === maxLinePerBatch) {
        parser.pause()
        process(batch)
          .then(() => {
            parser.resume()
          })
          .catch((err) => {
            throw err
          })
        batch = []
      }
    })
    parser.on('end', () => {
      if (batch.length) {
        process(batch).catch((err) => {
          throw err
        })
      }
      final().catch((err) => {
        throw err
      })
    })
  }

  async deleteFile(filename: string): Promise<void> {
    await fs.promises.unlink(this.basePath + filename)
  }
}
