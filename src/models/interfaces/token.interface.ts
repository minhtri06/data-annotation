import mongoose from 'mongoose'
import { TOKEN_TYPES } from '../../configs/constants'

export interface IToken {
  _id: string | mongoose.Types.ObjectId

  body: string

  user: string | mongoose.Types.ObjectId

  type: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]

  expires: Date

  isRevoked: boolean

  isUsed: boolean

  isBlacklisted: boolean
}

const ENV_CONFIG = { NODE_ENV: 'dev' }

console.log(ENV_CONFIG.NODE_ENV)
