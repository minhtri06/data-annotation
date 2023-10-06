import Joi from 'joi'
import { CustomSchemaMap } from '../../types'
import { CreateUser, GetUserById, GetUsers, UpdateUserById } from '../request-schemas'
import { customValidation, userValidation } from '@src/services/validations'

export const getUsers: CustomSchemaMap<GetUsers> = {
  query: {
    limit: Joi.number(),
    page: Joi.number(),
    checkPaginate: Joi.boolean(),
    role: Joi.string(),
    name: Joi.string(),
  },
}

export const createUser: CustomSchemaMap<CreateUser> = {
  body: userValidation.newUserPayload,
}

export const getUserById: CustomSchemaMap<GetUserById> = {
  params: {
    userId: customValidation.stringIdType.required(),
  },
}

export const updateUserById: CustomSchemaMap<UpdateUserById> = {
  params: {
    userId: customValidation.stringIdType.required(),
  },
  body: {
    address: Joi.string(),
    birthOfDate: Joi.date(),
    name: Joi.string(),
    password: Joi.string(),
    phoneNumber: Joi.string(),
  },
}
