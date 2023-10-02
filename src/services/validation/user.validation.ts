import Joi from 'joi'
import mongoose from 'mongoose'

import { ROLES } from '@src/configs/role.config'

export const userValidation = {
  _id: Joi.alternatives().try(
    Joi.string(),
    Joi.object().instance(mongoose.Types.ObjectId),
  ),

  name: Joi.string(),

  username: Joi.string(),

  password: Joi.string(),

  role: Joi.string()
    .valid(...Object.values(ROLES))
    .messages({ 'any.only': 'Invalid role' }),

  birthOfDate: Joi.date(),

  phoneNumber: Joi.string(),

  address: Joi.string(),
}
