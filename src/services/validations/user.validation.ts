import Joi from 'joi'

import { ROLES } from '@src/configs/role.config'
import { customId } from './custom.validation'
import { USER_WORK_STATUS } from '@src/constants'
import { stringId } from '@src/helpers/validation.helper'

// schema
export const userSchema = {
  _id: customId,

  name: Joi.string(),

  username: Joi.string(),

  password: Joi.string(),

  role: Joi.string()
    .valid(...Object.values(ROLES))
    .messages({ 'any.only': 'Invalid role' }),

  dateOfBirth: Joi.date(),

  phoneNumber: Joi.string().pattern(/^[0-9]+|-$/),

  address: Joi.string(),

  avatar: Joi.string(),

  workStatus: Joi.string().valid(...Object.values(USER_WORK_STATUS)),
}

// validations
export const getUserById = {
  userId: stringId.required(),
}

export const createUserPayload = Joi.object({
  name: userSchema.name.required(),
  username: userSchema.username.required(),
  password: userSchema.password.required(),
  role: userSchema.role.required(),
  dateOfBirth: userSchema.dateOfBirth.required(),
  phoneNumber: userSchema.phoneNumber.required(),
  address: userSchema.address.required(),
  workStatus: userSchema.workStatus,
}).required()

export const updateUserPayload = Joi.object({
  address: userSchema.address,
  dateOfBirth: userSchema.dateOfBirth,
  name: userSchema.name,
  password: userSchema.password,
  phoneNumber: userSchema.phoneNumber,
  workStatus: userSchema.workStatus,
}).required()
