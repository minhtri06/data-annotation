import { userSchema } from './schema/user'
import { CustomSchemaMap, Role } from '../types'
import { RegisterUser } from '../types/request-schemas'

export const registerUser: CustomSchemaMap<RegisterUser> = {
  body: {
    name: userSchema.name.required(),
    username: userSchema.username.required(),
    password: userSchema.password.required(),
    role: userSchema.role.invalid(...(['admin', 'manager'] as Role[])).required(),
    birthOfDate: userSchema.birthOfDate.required(),
    phoneNumber: userSchema.phoneNumber.required(),
    address: userSchema.address.required(),
  },
}
