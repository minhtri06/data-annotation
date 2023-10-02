import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import { ApiError } from './api-error'
import { camelCaseToNormalText } from './string-utils'
import { getObjectKeys } from './object-utils'

export const validateParams = <T extends { [key: string]: unknown }>(
  obj: T,
  validationSchema: { [key in keyof T]: Joi.Schema },
) => {
  for (const field of getObjectKeys(validationSchema)) {
    const validation = validationSchema[field].validate(obj[field])
    if (validation.error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        camelCaseToNormalText(validation.error.message),
        { type: 'validation-error' },
      )
    }
  }
}
