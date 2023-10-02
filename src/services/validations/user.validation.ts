import Joi from 'joi'
import mongoose from 'mongoose'

import { ROLES } from '@src/configs/role.config'

export const userSchema = {
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

  birthOfDate: Joi.alternatives().try(Joi.string(), Joi.date()),

  phoneNumber: Joi.string(),

  address: Joi.string(),

  avatar: Joi.string(),
}

export const newUserPayload = Joi.object({
  name: userSchema.name.required(),
  username: userSchema.username.required(),
  password: userSchema.password.required(),
  role: userSchema.role.required(),
  birthOfDate: userSchema.birthOfDate.required(),
  phoneNumber: userSchema.phoneNumber.required(),
  address: userSchema.address.required(),
}).required()

export const userUpdatePayload = Joi.object({
  address: userSchema.address,
  avatar: userSchema.avatar,
  birthOfDate: userSchema.birthOfDate,
  name: userSchema.name,
  password: userSchema.password,
  phoneNumber: userSchema.phoneNumber,
}).required()
