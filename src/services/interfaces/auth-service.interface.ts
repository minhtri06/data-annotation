import { IUser } from '../../models/interfaces'
import { document } from '../../types'

export interface IAuthService {
  login(
    username: string,
    password: string,
  ): Promise<{
    user: document<IUser>
    authTokens: { accessToken: string; refreshToken: string }
  }>
}
