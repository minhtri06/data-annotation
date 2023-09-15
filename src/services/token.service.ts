import createHttpError from 'http-errors'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import moment, { Moment } from 'moment'
import { inject, injectable } from 'inversify'

import { IToken, ITokenModel } from '../models/interfaces'
import { ModelService } from './abstracts/model.service'
import { ITokenService } from './interfaces'
import { TYPES } from '../configs/constants'
import { documentId, JwtPayload, Role } from '../types'
import envConfig from '../configs/env-config'

@injectable()
export class TokenService
  extends ModelService<IToken, ITokenModel>
  implements ITokenService
{
  constructor(@inject(TYPES.TOKEN_MODEL) Model: ITokenModel) {
    super(Model)
  }

  generateToken(
    userId: documentId,
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
    return jwt.sign(payload, envConfig.JWT_SECRET)
  }

  generateAccessToken(userId: documentId, role: Role): string {
    const expires = moment().add(envConfig.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes')
    return `Bearer ${this.generateToken(userId, role, expires, 'access-token')}`
  }

  async createRefreshToken(
    userId: documentId,
    role: Role,
  ): Promise<InstanceType<ITokenModel>> {
    const expires = moment().add(envConfig.JWT_REFRESH_EXPIRATION_DAYS, 'days')
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
    userId: documentId,
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
      const payload = jwt.verify(token, envConfig.JWT_SECRET, options) as JwtPayload
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

  async blacklistAUser(userId: documentId): Promise<void> {
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
