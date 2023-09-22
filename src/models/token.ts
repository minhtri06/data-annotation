import { Schema, model } from 'mongoose'

import { IToken, ITokenModel } from './interfaces/token.interface'
import { TOKEN_TYPES } from '../configs/constants'

const tokenSchema = new Schema<IToken>(
  {
    body: { type: String, index: true, required: true },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: Object.values(TOKEN_TYPES), required: true },

    expires: { type: Date, required: true },

    isRevoked: { type: Boolean },

    isUsed: { type: Boolean },

    isBlacklisted: { type: Boolean },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

export const Token = model<IToken, ITokenModel>('Token', tokenSchema)
