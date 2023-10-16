import { inject, injectable } from 'inversify'
import moment from 'moment'

import { UserDocument } from '@src/types'
import { TOKEN_TYPES, TYPES } from '@src/constants'
import ENV_CONFIG from '@src/configs/env.config'
import { IAuthService } from './auth.service.interface'
import { ITokenService } from './token.service.interface'
import { IUserService } from './user.service.interface'
import { UnauthorizedException } from './exceptions/unauthorized.exception'

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
      throw new UnauthorizedException('We cannot find user with your given username', {
        type: 'incorrect-username',
      })
    }

    if (!(await this.userService.comparePassword(user.password, password))) {
      throw new UnauthorizedException('Password did not match', {
        type: 'incorrect-password',
      })
    }

    const authTokens = await this.tokenService.createAuthTokens(user)

    return { user, authTokens }
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenDocument =
      await this.tokenService.getRefreshTokenByBody(refreshToken)
    if (refreshTokenDocument) {
      refreshTokenDocument.isRevoked = true
      await refreshTokenDocument.save()
    }
  }

  async refreshAuthTokens(
    accessToken: string,
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const isOnProduction = ENV_CONFIG.NODE_ENV === 'prod'
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
      throw new UnauthorizedException(
        isOnProduction ? 'Unauthorized' : 'Access token has not expired yet',
      )
    }
    if (refreshPayload.exp < now) {
      throw new UnauthorizedException(
        isOnProduction ? 'Unauthorized' : 'Refresh token is expired',
      )
    }

    if (refreshPayload.sub !== accessPayload.sub) {
      throw new UnauthorizedException(
        isOnProduction ? 'Unauthorized' : 'Access token sub is not refresh token sub',
      )
    }

    const refreshTokenDocument =
      await this.tokenService.getRefreshTokenByBody(refreshToken)
    if (!refreshTokenDocument) {
      throw new UnauthorizedException(
        isOnProduction ? 'Unauthorized' : 'Refresh token not found',
      )
    }

    if (refreshTokenDocument.isBlacklisted) {
      throw new UnauthorizedException(
        isOnProduction ? 'Unauthorized' : 'Refresh token is blacklisted',
      )
    }

    const userId = refreshPayload.sub
    if (refreshTokenDocument.isUsed || refreshTokenDocument.isRevoked) {
      // Blacklist this token and all usable refresh tokens of that user
      refreshTokenDocument.isBlacklisted = true
      await refreshTokenDocument.save()
      await this.tokenService.blacklistAUser(userId)

      throw new UnauthorizedException(
        ENV_CONFIG.NODE_ENV === 'prod'
          ? 'Unauthorized'
          : 'Refresh has been used or revoked',
      )
    }

    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new UnauthorizedException(isOnProduction ? 'Unauthorized' : 'User not found')
    }

    refreshTokenDocument.isUsed = true
    await refreshTokenDocument.save()
    return this.tokenService.createAuthTokens(user)
  }
}
