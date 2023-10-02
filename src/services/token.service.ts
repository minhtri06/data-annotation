import createHttpError from 'http-errors'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import { injectable } from 'inversify'

import { IToken, ITokenModel } from '../models/interfaces'
import { ITokenService } from './interfaces'
import { DocumentId, JwtPayload, Role, TokenDocument } from '../types'
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
    userId: DocumentId,
    role: Role,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
      role,
    }

    return jwt.sign(payload, ENV_CONFIG.JWT_SECRET)
  }

  generateAccessToken(userId: DocumentId, role: Role): string {
    const expires = moment().add(ENV_CONFIG.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes')
    return `Bearer ${this.generateToken(userId, role, expires, 'access-token')}`
  }

  async createRefreshToken(userId: DocumentId, role: Role): Promise<TokenDocument> {
    const expires = moment().add(ENV_CONFIG.JWT_REFRESH_EXPIRATION_DAYS, 'days')
    const token = this.generateToken(userId, role, expires, 'refresh-token')

    return await this.Model.create({
      body: token,
      user: userId,
      type: 'refresh-token',
      expires: expires.toDate(),
      isRevoked: false,
      isUsed: false,
      isBlacklisted: false,
    })
  }

  async createAuthTokens(
    userId: DocumentId,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId, role)
    const refreshToken = await this.createRefreshToken(userId, role)
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
