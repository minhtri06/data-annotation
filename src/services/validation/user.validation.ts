import Joi from 'joi'
import mongoose from 'mongoose'

import { ROLES } from '@src/configs/role.config'

export const modelSchema = {
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

export const comparePassword = {
  hashedPassword: Joi.string().required(),
  rawPassword: modelSchema.password.required(),
}

export const hashPassword = {
  password: modelSchema.password.required(),
}

export const createUser = {
  body: Joi.object({
    name: modelSchema.name.required(),
    username: modelSchema.username.required(),
    password: modelSchema.password.required(),
    role: modelSchema.role.required(),
    birthOfDate: modelSchema.birthOfDate.required(),
    phoneNumber: modelSchema.phoneNumber.required(),
    address: modelSchema.address.required(),
  }).required(),
}

export const updateUser = {
  updateBody: Joi.object({
    address: modelSchema.address,
    avatar: modelSchema.avatar,
    birthOfDate: modelSchema.birthOfDate,
    name: modelSchema.name,
    password: modelSchema.password,
    phoneNumber: modelSchema.phoneNumber,
  }).required(),
}
