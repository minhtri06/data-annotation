import mongoose from 'mongoose'
import { TOKEN_TYPES } from '../../constants'

export interface IToken {
  _id: string | mongoose.Types.ObjectId

  body: string

  user: string | mongoose.Types.ObjectId

  type: (typeof TOKEN_TYPES)[number]

  expires: Date

  isRevoked: boolean

  isUsed: boolean

  isBlacklisted: boolean
}
