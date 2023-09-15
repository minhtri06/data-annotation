import jwt from 'jsonwebtoken'
import { Moment } from 'moment'

import { IToken, ITokenModel } from '../../models/interfaces/token.interface'
import { IModelService } from '../abstracts/model.service'
import { JwtPayload, Role, DocumentId, TokenDocument } from '../../types'

export interface ITokenService extends IModelService<IToken, ITokenModel> {
  generateToken(
    userId: DocumentId,
    role: Role,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string

  generateAccessToken(userId: DocumentId, role: Role): string

  createRefreshToken(userId: DocumentId, role: Role): Promise<TokenDocument>

  createAuthTokens(
    userId: DocumentId,
    role: Role,
  ): Promise<{ accessToken: string; refreshToken: string }>

  verifyToken(
    token: string,
    type: IToken['type'],
    options: jwt.VerifyOptions & { complete: true },
  ): JwtPayload

  blacklistAUser(userId: DocumentId): Promise<void>
}
