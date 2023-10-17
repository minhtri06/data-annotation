import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { querySchema, stringId } from './custom.schema'

export type GetUsers = {
  query: {
    limit?: number
    page?: number
    checkPaginate?: boolean
    role?: string
    name?: string
    workStatus?: string
  }
}
export const getUsers: CustomSchemaMap<GetUsers> = {
  query: {
    limit: querySchema.limit,
    page: querySchema.page,
    checkPaginate: querySchema.checkPaginate,
    role: Joi.string(),
    name: Joi.string(),
    workStatus: Joi.string(),
  },
}

export type CreateUser = {
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
export const createUser: CustomSchemaMap<CreateUser> = {
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

export type GetUserById = {
  params: {
    userId: string
  }
}
export const getUserById: CustomSchemaMap<GetUserById> = {
  params: {
    userId: stringId.required(),
  },
}

export type UpdateUserById = {
  params: {
    userId: string
  }
  body: {
    address: string
    dateOfBirth: Date
    name: string
    password: string
    phoneNumber: string
    workStatus: string
  }
}
export const updateUserById: CustomSchemaMap<UpdateUserById> = {
  params: {
    userId: stringId.required(),
  },
  body: {
    address: Joi.string(),
    dateOfBirth: Joi.date().iso(),
    name: Joi.string(),
    password: Joi.string(),
    phoneNumber: Joi.string(),
    workStatus: Joi.string(),
  },
}
