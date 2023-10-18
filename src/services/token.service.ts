import jwt, { VerifyOptions } from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import { inject, injectable } from 'inversify'

import ENV_CONFIG from '@src/configs/env.config'
import { IToken, ITokenModel, TokenDocument, UserDocument } from '@src/models'
import { ITokenService } from './token.service.interface'
import { TOKEN_TYPES, TYPES } from '@src/constants'
import { UnauthorizedException } from './exceptions/unauthorized.exception'
import { JwtPayload } from '@src/types'

@injectable()
export class TokenService implements ITokenService {
  constructor(@inject(TYPES.TOKEN_MODEL) private Token: ITokenModel) {}

  generateToken(
    user: UserDocument,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string {
    const payload: JwtPayload = {
      sub: user._id.toHexString(),
      role: user.role,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    }

    return jwt.sign(payload, ENV_CONFIG.JWT_SECRET)
  }

  generateAccessToken(user: UserDocument): string {
    const expires = moment().add(ENV_CONFIG.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes')
    return `Bearer ${this.generateToken(user, expires, TOKEN_TYPES.ACCESS_TOKEN)}`
  }

  async createRefreshToken(user: UserDocument): Promise<TokenDocument> {
    const expires = moment().add(ENV_CONFIG.JWT_REFRESH_EXPIRATION_DAYS, 'days')
    const token = this.generateToken(user, expires, TOKEN_TYPES.REFRESH_TOKEN)

    return await this.Token.create({
      body: token,
      user: user._id,
      type: TOKEN_TYPES.REFRESH_TOKEN,
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
    const refreshTokenDocument = await this.createRefreshToken(user)
    return {
      accessToken,
      refreshToken: refreshTokenDocument.body,
    }
  }

  async getRefreshTokenByBody(body: string): Promise<TokenDocument | null> {
    return await this.Token.findOne({ body, type: TOKEN_TYPES.REFRESH_TOKEN })
  }

  verifyToken(
    token: string,
    type: IToken['type'],
    options: VerifyOptions = {},
  ): JwtPayload {
    try {
      const payload = jwt.verify(token, ENV_CONFIG.JWT_SECRET, options) as JwtPayload
      if (payload.type !== type) {
        throw new UnauthorizedException('Invalid token type')
      }
      return payload
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(error.message)
      }
      throw error
    }
  }

  async blacklistAUser(userId: string): Promise<void> {
    await this.Token.updateMany(
      {
        user: userId,
        type: TOKEN_TYPES.REFRESH_TOKEN,
        isUsed: false,
        isRevoked: false,
      },
      { isBlacklisted: true },
    )
  }
}
