import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import { ApiError } from './api-error'

export const validate = <T>(value: T, validationSchema: Joi.Schema<T>) => {
  const validation = validationSchema.validate(value, {
    errors: { wrap: { label: '' }, label: 'key' },
  })
  if (validation.error) {
    throw new ApiError(StatusCodes.BAD_REQUEST, validation.error.message, {
      type: 'validation-error',
    })
  }
}
