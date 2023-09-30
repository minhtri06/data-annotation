import { IUser } from '../../models/interfaces'
import { UserDocument } from '../../types'

export interface IAuthService {
  register(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>,
  ): Promise<{
    user: UserDocument
    authTokens: { accessToken: string; refreshToken: string }
  }>

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
}
