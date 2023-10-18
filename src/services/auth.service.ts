import { inject, injectable } from 'inversify'
import moment from 'moment'

import { TOKEN_TYPES, TYPES } from '@src/constants'
import { IAuthService } from './auth.service.interface'
import { ITokenService } from './token.service.interface'
import { IUserService } from './user.service.interface'
import { UnauthorizedException } from './exceptions/unauthorized.exception'
import { UserDocument } from '@src/models'

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
    accessToken = accessToken.slice(7) // remove 'Bearer '

    const accessTokenPayload = this.tokenService.verifyToken(
      accessToken,
      TOKEN_TYPES.ACCESS_TOKEN,
      { ignoreExpiration: true },
    )
    const refreshTokenPayload = this.tokenService.verifyToken(
      refreshToken,
      TOKEN_TYPES.REFRESH_TOKEN,
      { ignoreExpiration: true },
    )

    const now = moment().unix()
    if (accessTokenPayload.exp > now) {
      throw new UnauthorizedException('Access token has not expired yet')
    }
    if (refreshTokenPayload.exp < now) {
      throw new UnauthorizedException('Refresh token is expired')
    }

    if (refreshTokenPayload.sub !== accessTokenPayload.sub) {
      throw new UnauthorizedException("Token's sub does not match")
    }

    const refreshTokenDocument =
      await this.tokenService.getRefreshTokenByBody(refreshToken)
    if (!refreshTokenDocument) {
      throw new UnauthorizedException('Refresh token not found')
    }

    if (refreshTokenDocument.isBlacklisted) {
      throw new UnauthorizedException('Refresh token is blacklisted')
    }

    const userId = refreshTokenPayload.sub
    if (refreshTokenDocument.isUsed || refreshTokenDocument.isRevoked) {
      // Blacklist this token and all usable refresh tokens of that user
      refreshTokenDocument.isBlacklisted = true
      await refreshTokenDocument.save()
      await this.tokenService.blacklistAUser(userId)

      throw new UnauthorizedException('Refresh token has been used or revoked')
    }

    const user = await this.userService.getUserById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    refreshTokenDocument.isUsed = true
    await refreshTokenDocument.save()
    return await this.tokenService.createAuthTokens(user)
  }
}
