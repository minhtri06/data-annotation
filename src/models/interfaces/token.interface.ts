import { Model } from 'mongoose'

import { ISchema } from './schema.interface'
import { DocumentId } from '../../types'
import { TOKEN_TYPES } from '../../configs/constants'

export interface IToken extends ISchema {
  body: string

  user: DocumentId

  type: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]

  expires: Date

  isRevoked: boolean

  isUsed: boolean

  isBlacklisted: boolean
}

export interface ITokenModel extends Model<IToken> {}
