import { IUser } from '../../models/interfaces'

export type GetUsers = {
  query: {
    limit: number
    page: number
  }
}

export type CreateUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>
}
