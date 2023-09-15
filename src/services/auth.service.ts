import { inject, injectable } from 'inversify'
import { IAuthService, ITokenService, IUserService } from './interfaces'
import { TYPES } from '../configs/constants'
import createHttpError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { UserDocument } from '../types'

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.TOKEN_SERVICE) private tokenService: ITokenService,
    @inject(TYPES.USER_SERVICE) private userService: IUserService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{
    user: UserDocument
    authTokens: { accessToken: string; refreshToken: string }
  }> {
    const user = await this.userService.getOne({ username })

    if (!user) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        'We cannot find user with your given email',
        { headers: { type: 'incorrect-email' } },
      )
    }

    if (!(await this.userService.comparePassword(user.password, password))) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, 'Password did not match', {
        headers: { type: 'incorrect-password' },
      })
    }

    const authTokens = await this.tokenService.createAuthTokens(user._id, user.role)

    return { user, authTokens }
  }
}
