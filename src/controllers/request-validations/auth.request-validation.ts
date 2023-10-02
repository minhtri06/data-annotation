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
    refreshToken: Joi.string().required(),
  },
}

export const refreshTokens: CustomSchemaMap<RefreshTokens> = {
  body: {
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
  },
}
