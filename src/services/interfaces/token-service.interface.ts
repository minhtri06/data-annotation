import jwt from 'jsonwebtoken'
import { Moment } from 'moment'

import { IToken } from '../../models/interfaces/token.interface'
import { IModelService } from '../abstracts/model.service'
import { JwtPayload, Role, document, documentId } from '../../types'

export interface ITokenService extends IModelService<IToken> {
  generateToken(
    userId: documentId,
    role: Role,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string

  generateAccessToken(userId: documentId, role: Role): string

  createRefreshToken(userId: documentId, role: Role): Promise<document<IToken>>

  createAuthTokens(
    userId: documentId,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }>

  verifyToken(
    token: string,
    type: IToken['type'],
    options: jwt.VerifyOptions & { complete: true },
  ): JwtPayload

  blacklistAUser(userId: documentId): Promise<void>
}
