import { userSchema } from './schema/user'
import { CustomSchemaMap } from '../types'
import { RegisterUser } from '../types/request-schemas'

export const registerUser: CustomSchemaMap<RegisterUser> = {
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
