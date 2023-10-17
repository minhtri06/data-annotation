import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'

export type Login = {
  body: {
    username: string
    password: string
  }
}
export const login: CustomSchemaMap<Login> = {
  body: {
    username: Joi.string().required(),
    password: Joi.string().required(),
  },
}

export type Logout = {
  body: {
    refreshToken: string
  }
}
export const logout: CustomSchemaMap<Logout> = {
  body: {
    refreshToken: Joi.string().required(),
  },
}

export type RefreshTokens = {
  body: {
    accessToken: string
    refreshToken: string
  }
}
export const refreshTokens: CustomSchemaMap<RefreshTokens> = {
  body: {
    accessToken: Joi.string().required(),
    refreshToken: Joi.string().required(),
  },
}
