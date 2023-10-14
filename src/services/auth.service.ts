import createHttpError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import moment from 'moment'

import { UserDocument } from '../types'
import { TOKEN_TYPES, TYPES } from '../constants'
import { ApiError } from '@src/utils'
import ENV_CONFIG from '@src/configs/env.config'
import { IAuthService } from './auth.service.interface'
import { ITokenService } from './token.service.interface'
import { IUserService } from './user.service.interface'

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
    const user = await this.userService.getUserByUserName(username)

    if (!user) {
      throw createHttpError(
        StatusCodes.UNAUTHORIZED,
        'We cannot find user with your given username',
        { headers: { type: 'incorrect-username' } },
      )
    }

    if (!(await this.userService.comparePassword(user.password, password))) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, 'Password did not match', {
        headers: { type: 'incorrect-password' },
      })
    }

    const authTokens = await this.tokenService.createAuthTokens(user)

    return { user, authTokens }
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenDocument =
      await this.tokenService.getRefreshTokenByBody(refreshToken)
    if (!refreshTokenDocument) {
      throw new ApiError(404, 'Refresh token not found')
    }
    refreshTokenDocument.isRevoked = true
    await refreshTokenDocument.save()
  }

  async refreshAuthTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    accessToken = accessToken.slice(7)
    const accessPayload = this.tokenService.verifyToken(
      accessToken,
      TOKEN_TYPES.ACCESS_TOKEN,
      { ignoreExpiration: true },
    )
    const refreshPayload = this.tokenService.verifyToken(
      refreshToken,
      TOKEN_TYPES.REFRESH_TOKEN,
      { ignoreExpiration: true },
    )
    const now = moment().unix()
    if (accessPayload.exp > now) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ENV_CONFIG.NODE_ENV === 'prod' ? 'Unauthorized' : 'Access token has not expired',
      )
    }
    if (refreshPayload.exp < now) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ENV_CONFIG.NODE_ENV === 'prod' ? 'Unauthorized' : 'Refresh token has expired',
      )
    }

    if (refreshPayload.sub !== accessPayload.sub) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ENV_CONFIG.NODE_ENV === 'prod' ? 'Unauthorized' : 'Invalid token',
      )
    }

    const refreshTokenDocument =
      await this.tokenService.getRefreshTokenByBody(refreshToken)
    if (!refreshTokenDocument) {
      throw new ApiError(404, 'Refresh token not found')
    }

    if (refreshTokenDocument.isBlacklisted) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
    }

    const userId = refreshPayload.sub
    if (refreshTokenDocument.isUsed || refreshTokenDocument.isRevoked) {
      // Blacklist this token and all usable refresh tokens of that user
      refreshTokenDocument.isBlacklisted = true
      await refreshTokenDocument.save()
      await this.tokenService.blacklistAUser(userId)

      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ENV_CONFIG.NODE_ENV === 'prod'
          ? 'Unauthorized'
          : 'Refresh has been used or revoked',
      )
    }

    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        ENV_CONFIG.NODE_ENV === 'prod' ? 'Unauthorized' : 'User not found',
      )
    }

    refreshTokenDocument.isUsed = true
    await refreshTokenDocument.save()
    return this.tokenService.createAuthTokens(user)
  }
}
