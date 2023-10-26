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

export type Register = {
  body: {
    name: string
    username: string
    password: string
    role: string
    dateOfBirth: Date
    phoneNumber: string
    address: string
    workStatus: string
  }
}
export const register: CustomSchemaMap<Register> = {
  body: {
    name: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().required(),
    workStatus: Joi.string(),
  },
}
