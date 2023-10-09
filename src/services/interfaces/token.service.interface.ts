import jwt from 'jsonwebtoken'
import { Moment } from 'moment'

import { IToken, ITokenModel } from '@src/models/interfaces/token.interface'
import { JwtPayload, DocumentId, TokenDocument, UserDocument } from '@src/types'
import { IModelService } from './model.service.interface'

export interface ITokenService extends IModelService<IToken, ITokenModel> {
  generateToken(
    user: UserDocument,
    expires: Moment,
    type: 'access-token' | 'refresh-token',
  ): string

  generateAccessToken(user: UserDocument): string

  createRefreshToken(user: UserDocument): Promise<TokenDocument>

  createAuthTokens(
    user: UserDocument,
  ): Promise<{ accessToken: string; refreshToken: string }>

  verifyToken(
    token: string,
    type: IToken['type'],
    options?: jwt.VerifyOptions,
  ): JwtPayload

  blacklistAUser(userId: DocumentId): Promise<void>
}
