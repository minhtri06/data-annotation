import { IUser } from '@src/models'
import { Role } from '@src/types'

export type GetUsers = {
  query: {
    limit?: number
    page?: number
    checkPaginate?: boolean
    role?: Role
    name?: string
    workStatus?: IUser['workStatus']
  }
}

export type CreateUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>
}

export type GetUserById = {
  params: {
    userId: string
  }
}

export type UpdateUserById = {
  params: {
    userId: string
  }
  body: Pick<
    IUser,
    'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
  >
}
