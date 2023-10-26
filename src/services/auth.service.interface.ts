import { IRawUser, UserDocument } from '@src/models'

export interface IAuthService {
  login(
    username: string,
    password: string,
  ): Promise<{
    user: UserDocument
    authTokens: { accessToken: string; refreshToken: string }
  }>

  logout(refreshToken: string): Promise<void>

  refreshAuthTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }>

  register(payload: RegisterPayload): Promise<UserDocument>
}

export type RegisterPayload = Readonly<
  Pick<
    IRawUser,
    'name' | 'username' | 'password' | 'role' | 'dateOfBirth' | 'phoneNumber' | 'address'
  >
>
