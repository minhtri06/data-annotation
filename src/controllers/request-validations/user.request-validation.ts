import { CustomSchemaMap } from '../../types'
import { CreateUser } from '../request-schemas'
import { userValidation } from '@src/services/validations'

export const createUser: CustomSchemaMap<CreateUser> = {
  body: userValidation.newUserPayload,
}
