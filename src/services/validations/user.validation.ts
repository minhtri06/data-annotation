import Joi from 'joi'
import mongoose from 'mongoose'

import { ROLES } from '@src/configs/role.config'

export const userSchema = {
  _id: Joi.alternatives().try(
    Joi.string(),
    Joi.object().instance(mongoose.Types.ObjectId),
  ),

  name: Joi.string().label('Name'),

  username: Joi.string().label('Username'),

  password: Joi.string().label('Password'),

  role: Joi.string()
    .label('Role')
    .valid(...Object.values(ROLES))
    .messages({ 'any.only': 'Invalid role' }),

  birthOfDate: Joi.alternatives().try(Joi.string(), Joi.date()).label('Birth of date'),

  phoneNumber: Joi.string().label('Phone number'),

  address: Joi.string().label('Address'),

  avatar: Joi.string().label('Avatar'),
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
  birthOfDate: userSchema.birthOfDate,
  name: userSchema.name,
  password: userSchema.password,
  phoneNumber: userSchema.phoneNumber,
}).required()
