import Joi from 'joi'

import { Login, Logout, RefreshTokens } from '../request-schemas'
import { CustomSchemaMap } from '@src/types'

export const login: CustomSchemaMap<Login> = {
  body: {
    username: Joi.string().required(),
    password: Joi.string().required(),
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
