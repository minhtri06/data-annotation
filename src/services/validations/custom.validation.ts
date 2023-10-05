import Joi from 'joi'

export const stringIdType = Joi.string().custom((value: string, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.error('any.invalid')
  }
  return value
})
