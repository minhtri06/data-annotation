import jwt from 'jsonwebtoken'
import { Moment } from 'moment'

import { JwtPayload } from '@src/types'
import { IToken, TokenDocument, UserDocument } from '@src/models'

export interface ITokenService {
  generateToken(user: UserDocument, expires: Moment, type: IToken['type']): string

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

  blacklistAUser(userId: string): Promise<void>
}
