import Joi from 'joi'

import { Login, Logout, RefreshTokens } from '../request-schemas'
import { CustomSchemaMap } from '@src/types'
import { userValidation } from '@src/services/validations'

export const login: CustomSchemaMap<Login> = {
  body: {
    username: userValidation.userSchema.username.required(),
    password: userValidation.userSchema.password.required(),
  },
}

export const logout: CustomSchemaMap<Logout> = {
  body: {
    refreshToken: Joi.string().label('Refresh token').required(),
  },
}

export const refreshTokens: CustomSchemaMap<RefreshTokens> = {
  body: {
    accessToken: Joi.string().label('Access token').required(),
    refreshToken: Joi.string().label('Refresh token').required(),
  },
}
