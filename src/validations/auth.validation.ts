import Joi from 'joi'

import { CustomSchemaMap } from '../types'
import { Login, Logout, RegisterUser } from '../types/request-schemas'
import { userSchema } from './schema'

export const registerUser: CustomSchemaMap<RegisterUser> = {
  body: {
    name: userSchema.name.required(),
    username: userSchema.username.required(),
    password: userSchema.password.required(),
    role: userSchema.role.required(),
    birthOfDate: userSchema.birthOfDate.required(),
    phoneNumber: userSchema.phoneNumber.required(),
    address: userSchema.address.required(),
  },
}

export const login: CustomSchemaMap<Login> = {
  body: {
    username: userSchema.username.required(),
    password: userSchema.password.required(),
  },
}

export const logout: CustomSchemaMap<Logout> = {
  body: {
    refreshToken: Joi.string().required(),
  },
}
