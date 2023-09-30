import { IUser } from '../../models/interfaces'

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
