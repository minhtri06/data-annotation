import { UserDocument } from '../../types'

export interface IAuthService {
  login(
    username: string,
    password: string,
  ): Promise<{
    user: UserDocument
    authTokens: { accessToken: string; refreshToken: string }
  }>

  logout(refreshToken: string): Promise<void>
}
