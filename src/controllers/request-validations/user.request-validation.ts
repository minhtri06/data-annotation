import Joi from 'joi'
import { CustomSchemaMap } from '../../types'
import { CreateUser, GetUserById, GetUsers, UpdateUserById } from '../request-schemas'
import { customValidation, userValidation } from '@src/services/validations'

export const getUsers: CustomSchemaMap<GetUsers> = {
  query: {
    limit: Joi.number(),
    page: Joi.number(),
    checkPaginate: Joi.boolean(),
    role: userValidation.userSchema.role,
    name: userValidation.userSchema.name,
    workStatus: userValidation.userSchema.workStatus,
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
    userId: customValidation.stringIdType.label('User id').required(),
  },
  body: {
    address: userValidation.userSchema.address,
    dateOfBirth: userValidation.userSchema.dateOfBirth,
    name: userValidation.userSchema.name,
    password: userValidation.userSchema.password,
    phoneNumber: userValidation.userSchema.phoneNumber,
    workStatus: userValidation.userSchema.workStatus,
  },
}
