import { Schema, mongo, Error } from 'mongoose'

import { DuplicateKeyException, ValidationException } from '@src/services/exceptions'

export const handleErrorPlugin = (schema: Schema) => {
  schema.post(
    'save',
    function (error: Error, doc: unknown, next: (error?: Error) => void): void {
      // mongoose validation error
      if (error instanceof Error.ValidationError) {
        return next(
          new ValidationException(error.errors[Object.keys(error.errors)[0]].message, {
            details: Object.keys(error.errors).map((key) => ({
              path: error.errors[key].path,
              message: error.errors[key].message,
            })),
          }),
        )
      }

      // mongodb duplicate error
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        const keyValue = error.keyValue as Record<string, string>
        const message: string = Object.keys(keyValue)
          .map((key) => `${key} '${keyValue[key]}' already exists`)
          .join(', ')
        return next(new DuplicateKeyException(message))
      }

      next(error)
    },
  )
}
