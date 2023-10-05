import { Schema, SchemaOptions } from 'mongoose'

export const toJSON = (schema: Schema) => {
  const options = (schema as Schema & { options: SchemaOptions }).options
  options.toJSON = options.toJSON || {}
  const transform = options.toJSON.transform

  options.toJSON.transform = function (doc, ret, options) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ret.id = ret._id

    delete ret._id
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt

    if (typeof transform === 'function') {
      transform(doc, ret, options)
    }
  }
}
