import { IUser } from '../../models/interfaces'

export type RegisterUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
}
