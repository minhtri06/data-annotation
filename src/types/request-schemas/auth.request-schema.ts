import { IUser } from '../../models/interfaces'

export type RegisterUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
}

export type Login = {
  body: Pick<IUser, 'username' | 'password'>
}
