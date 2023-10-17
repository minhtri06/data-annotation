import Joi from 'joi'
import mongoose from 'mongoose'

export const stringId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ 'string.pattern.base': 'Invalid mongodb id' })

export const objectId = Joi.object().instance(mongoose.Types.ObjectId)

export const querySchema = {
  limit: Joi.number().integer().min(1).max(50),

  page: Joi.number().integer().min(1),

  checkPaginate: Joi.boolean(),

  sort: Joi.string()
    .pattern(/^[a-zA-Z0-9- ]+$/)
    .messages({ 'string.pattern.base': 'Invalid sort option' }),
}
