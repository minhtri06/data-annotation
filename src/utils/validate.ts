import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import { ApiError } from './api-error'
import { camelCaseToNormalText } from './string-utils'

export const validate = <T>(value: T, validationSchema: Joi.Schema<T>) => {
  const validation = validationSchema.validate(value)
  if (validation.error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      camelCaseToNormalText(validation.error.message),
      { type: 'validation-error' },
    )
  }
}
