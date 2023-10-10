import Joi from 'joi'
import mongoose from 'mongoose'

export const customStringId = Joi.string().custom((value: string, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.error('any.invalid')
  }
  return value
})

export const customId = Joi.alternatives().try(
  Joi.object().instance(mongoose.Types.ObjectId),
  customStringId,
)
