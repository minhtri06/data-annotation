import Joi from 'joi'
import { CustomSchemaMap } from '../../types'
import { CreateUser, GetUsers } from '../request-schemas'
import { userValidation } from '@src/services/validations'

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
