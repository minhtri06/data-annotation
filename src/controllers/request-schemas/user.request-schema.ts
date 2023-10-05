import { Role } from '@src/types'
import { IUser } from '../../models/interfaces'

export type GetUsers = {
  query: {
    limit?: number
    page?: number
    checkPaginate?: boolean
    role?: Role
    name?: string
  }
}

export type CreateUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>
}
