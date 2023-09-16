import { ROLES } from '../configs/role.config'
import { CustomSchemaMap } from '../types'
import { CreateUser } from '../types/request-schemas'
import { userSchema } from './schema'

export const createUser: CustomSchemaMap<CreateUser> = {
  body: {
    name: userSchema.name.required(),
    username: userSchema.username.required(),
    password: userSchema.password.required(),
    role: userSchema.role.valid(ROLES.ADMIN, ROLES.MANAGER).required(),
    birthOfDate: userSchema.birthOfDate.required(),
    phoneNumber: userSchema.phoneNumber.required(),
    address: userSchema.address.required(),
  },
}
