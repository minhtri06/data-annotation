import createHttpError from 'http-errors'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import { injectable } from 'inversify'

import { DocumentId, JwtPayload, TokenDocument, UserDocument } from '@src/types'
import ENV_CONFIG from '@src/configs/env.config'
import { IToken, Token } from '@src/models'
import { ITokenService } from './token.service.interface'
import { ApiError } from '@src/utils'
import { TOKEN_TYPES } from '@src/constants'

@injectable()
export class TokenService implements ITokenService {
  generateToken(
    user: UserDocument,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      role: user.role,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    }

    return jwt.sign(payload, ENV_CONFIG.JWT_SECRET)
  }

  generateAccessToken(user: UserDocument): string {
    const expires = moment().add(ENV_CONFIG.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes')
    return `Bearer ${this.generateToken(user, expires, 'access-token')}`
  }

  async createRefreshToken(user: UserDocument): Promise<TokenDocument> {
    const expires = moment().add(ENV_CONFIG.JWT_REFRESH_EXPIRATION_DAYS, 'days')
    const token = this.generateToken(user, expires, 'refresh-token')

    return await Token.create({
      body: token,
      user: user._id,
      type: 'refresh-token',
      expires: expires.toDate(),
      isRevoked: false,
      isUsed: false,
      isBlacklisted: false,
    })
  }

  async createAuthTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(user)
    const refreshToken = await this.createRefreshToken(user)
    return {
      accessToken,
      refreshToken: refreshToken.body,
    }
  }

  async getRefreshTokenByBody(body: string): Promise<TokenDocument | null> {
    if (typeof body !== 'string') {
      throw new ApiError(400, 'Invalid refresh body')
    }
    return await Token.findOne({ body, type: TOKEN_TYPES.REFRESH_TOKEN })
  }

  verifyToken(
    token: string,
    type: 'access-token' | 'refresh-token',
    options: VerifyOptions = {},
  ): JwtPayload {
    try {
      const payload = jwt.verify(token, ENV_CONFIG.JWT_SECRET, options) as JwtPayload
      if (payload.type !== type) {
        throw createHttpError.Unauthorized(`Invalid ${type} token`)
      }
      return payload
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createHttpError.Unauthorized(error.message)
      }
      throw error
    }
  }

  async blacklistAUser(userId: DocumentId): Promise<void> {
    const tokenType: IToken['type'] = 'refresh-token'
    await Token.updateMany(
      {
        user: userId,
        type: tokenType,
        isUsed: false,
        isRevoked: false,
      },
      { isBlacklisted: true },
    )
  }
}
