import Joi from 'joi'

import { CustomSchemaMap } from '../../types'
import { CreateUser, GetUserById, GetUsers, UpdateUserById } from '../request-schemas'

export const getUsers: CustomSchemaMap<GetUsers> = {
  query: {
    limit: Joi.number(),
    page: Joi.number(),
    checkPaginate: Joi.boolean(),
    role: Joi.string(),
    name: Joi.string(),
    workStatus: Joi.string(),
  },
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

export const getUserById: CustomSchemaMap<GetUserById> = {
  params: {
    userId: Joi.string().required(),
  },
}

export const updateUserById: CustomSchemaMap<UpdateUserById> = {
  params: {
    userId: Joi.string().required(),
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
