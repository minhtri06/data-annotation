import createHttpError from 'http-errors'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import { injectable } from 'inversify'

import { IToken, ITokenModel } from '../models/interfaces'
import { ITokenService } from './interfaces'
import { DocumentId, JwtPayload, TokenDocument, UserDocument } from '../types'
import ENV_CONFIG from '../configs/env.config'
import { ModelService } from './abstracts/model.service'
import { Token } from '../models'

@injectable()
export class TokenService
  extends ModelService<IToken, ITokenModel>
  implements ITokenService
{
  Model: ITokenModel = Token

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

    return await this.Model.create({
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
    await this.Model.updateMany(
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
