import { Role } from '../types/roles'

export interface IUser {
  _id: string
  name: string
  username: string
  password: string
  role: Role
}
