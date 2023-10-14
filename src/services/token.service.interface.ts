import jwt from 'jsonwebtoken'
import { Moment } from 'moment'

import { JwtPayload, DocumentId, TokenDocument, UserDocument } from '@src/types'
import { IToken } from '@src/models'

export interface ITokenService {
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

  getRefreshTokenByBody(body: string): Promise<TokenDocument | null>

  verifyToken(
    token: string,
    type: IToken['type'],
    options?: jwt.VerifyOptions,
  ): JwtPayload

  blacklistAUser(userId: DocumentId): Promise<void>
}
