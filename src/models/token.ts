import mongoose, { Schema } from 'mongoose'
import { TOKEN_TYPES } from '../configs/constants'
import { IToken } from './interfaces/token.interface'

const tokenSchema = new Schema<IToken>(
  {
    body: { type: String, index: true, required: true },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: Object.keys(TOKEN_TYPES), required: true },

    expires: { type: Date, required: true },

    isRevoked: { type: Boolean },

    isUsed: { type: Boolean },

    isBlacklisted: { type: Boolean },
  },
  { timestamps: true, optimisticConcurrency: true },
)

export const Token = mongoose.model<IToken>('Token', tokenSchema)

const filter: mongoose.FilterQuery<IToken> | Partial<IToken> = {}
filter.type = 'resh'
Token.findOne(filter)
  .then((token) => console.log(token))
  .catch((err) => console.log(err))
