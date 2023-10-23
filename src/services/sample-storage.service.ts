import fs from 'fs'
import { parse } from 'csv-parse'
import { injectable } from 'inversify'
import multer from 'multer'

import {
  ISampleStorageService,
  streamSamplesOptions,
} from './sample-storage.service.interface'
import { ValidationException } from './exceptions'

@injectable()
export class SampleStorageService implements ISampleStorageService {
  private basePath: string = __dirname + '/../../temp/'

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

  streamSample({ filename, maxLinePerBatch, process, final }: streamSamplesOptions) {
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
      if (final) {
        final().catch((err) => {
          throw err
        })
      }
    })
  }

  async deleteFile(filename: string): Promise<void> {
    await fs.promises.unlink(this.basePath + filename)
  }

  async checkExist(filename: string) {
    return Promise.resolve(fs.existsSync(this.basePath + filename))
  }
}
