import { IUserModel } from '../../models/interfaces'

export interface IAuthService {
  login(
    username: string,
    password: string,
  ): Promise<{
    user: InstanceType<IUserModel>
    authTokens: { accessToken: string; refreshToken: string }
  }>
}
