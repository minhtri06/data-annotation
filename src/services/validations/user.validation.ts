import Joi from 'joi'
import mongoose from 'mongoose'

import { ROLES } from '@src/configs/role.config'
import { stringIdType } from './custom.validation'

export const userSchema = {
  _id: Joi.alternatives().try(
    stringIdType,
    Joi.object().instance(mongoose.Types.ObjectId),
  ),

  name: Joi.string().label('Name'),

  username: Joi.string().label('Username'),

  password: Joi.string().label('Password'),

  role: Joi.string()
    .label('Role')
    .valid(...Object.values(ROLES))
    .messages({ 'any.only': 'Invalid role' }),

  dateOfBirth: Joi.date().label('Date of birth'),

  phoneNumber: Joi.string()
    .label('Phone number')
    .pattern(/^[0-9]+|-$/),

  address: Joi.string().label('Address'),

  avatar: Joi.string().label('Avatar'),
}

export const newUserPayload = Joi.object({
  name: userSchema.name.required(),
  username: userSchema.username.required(),
  password: userSchema.password.required(),
  role: userSchema.role.required(),
  dateOfBirth: userSchema.dateOfBirth.required(),
  phoneNumber: userSchema.phoneNumber.required(),
  address: userSchema.address.required(),
}).required()

export const userUpdatePayload = Joi.object({
  address: userSchema.address,
  dateOfBirth: userSchema.dateOfBirth,
  name: userSchema.name,
  password: userSchema.password,
  phoneNumber: userSchema.phoneNumber,
}).required()
