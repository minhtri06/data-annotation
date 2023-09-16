import createHttpError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import moment from 'moment'

import { IAuthService, ITokenService, IUserService } from './interfaces'
import { TOKEN_TYPES, TYPES } from '../configs/constants'
import { UserDocument } from '../types'
import { IUser } from '../models/interfaces'
import { ROLES } from '../configs/role.config'

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.TOKEN_SERVICE) private tokenService: ITokenService,
    @inject(TYPES.USER_SERVICE) private userService: IUserService,
  ) {}

  async register(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar'>,
  ): Promise<{
    user: UserDocument
    authTokens: { accessToken: string; refreshToken: string }
  }> {
    if (body.role !== ROLES.LEVEL_1_ANNOTATOR && body.role !== ROLES.LEVEL_2_ANNOTATOR) {
      throw createHttpError.BadRequest('invalid role')
    }
    const user = await this.userService.createUser(body)
    const authTokens = await this.tokenService.createAuthTokens(user._id, user.role)
    return { user, authTokens }
  }

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
        'we cannot find user with your given username',
        { headers: { type: 'incorrect-username' } },
      )
    }

    if (!(await this.userService.comparePassword(user.password, password))) {
      throw createHttpError(StatusCodes.UNAUTHORIZED, 'password did not match', {
        headers: { type: 'incorrect-password' },
      })
    }

    const authTokens = await this.tokenService.createAuthTokens(user._id, user.role)

    return { user, authTokens }
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenDocument = await this.tokenService.getOneOrError({
      body: refreshToken,
      type: TOKEN_TYPES.REFRESH_TOKEN,
    })
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
      throw createHttpError.Unauthorized('access token has not expired')
    }
    if (refreshPayload.exp < now) {
      throw createHttpError.Unauthorized('refresh token has expired')
    }

    if (refreshPayload.sub !== accessPayload.sub) {
      throw createHttpError.Unauthorized('invalid token')
    }

    const refreshTokenDocument = await this.tokenService.getOneOrError({
      body: refreshToken,
      type: TOKEN_TYPES.REFRESH_TOKEN,
    })

    if (refreshTokenDocument.isBlacklisted) {
      throw createHttpError.Unauthorized('unauthorized')
    }

    const userId = refreshPayload.sub
    const userRole = refreshPayload.role
    if (refreshTokenDocument.isUsed || refreshTokenDocument.isRevoked) {
      // Blacklist this token and all usable refresh tokens of that user
      refreshTokenDocument.isBlacklisted = true
      await refreshTokenDocument.save()
      await this.tokenService.blacklistAUser(userId)
      throw createHttpError.Unauthorized('unauthorized')
    }

    refreshTokenDocument.isUsed = true
    await refreshTokenDocument.save()
    return this.tokenService.createAuthTokens(userId, userRole)
  }
}
