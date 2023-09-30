import Joi from 'joi'

import { CustomSchemaMap } from '../types'
import { Login, Logout, RefreshTokens } from '../types/request-schemas'
import { userSchema } from './schema'

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

export const refreshTokens: CustomSchemaMap<RefreshTokens> = {
  body: {
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
  },
}
