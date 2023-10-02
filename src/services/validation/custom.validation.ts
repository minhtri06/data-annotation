import Joi from 'joi'
import { isMoment } from 'moment'

export const momentType = Joi.custom((value, helpers) => {
  if (isMoment(value)) {
    return value
  }
  return helpers.error('any.invalid')
})
