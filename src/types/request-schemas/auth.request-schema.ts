import { IUser } from '../../models/interfaces'

export type RegisterUser = {
  body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>
}

export type Login = {
  body: Pick<IUser, 'username' | 'password'>
}

export type Logout = {
  body: {
    refreshToken: string
  }
}

export type RefreshTokens = {
  body: {
    accessToken: string
    refreshToken: string
  }
}
