import { CustomSchemaMap } from '../types'
import { CreateUser } from '../types/request-schemas'
import { userSchema } from './schema/user'

export const createUser: CustomSchemaMap<CreateUser> = {
  body: {
    name: userSchema.name.required(),
    username: userSchema.username.required(),
    password: userSchema.password.required(),
    role: userSchema.role.required(),
    birthOfDate: userSchema.birthOfDate.required(),
    phoneNumber: userSchema.phoneNumber.required(),
    address: userSchema.address.required(),
  },
}
