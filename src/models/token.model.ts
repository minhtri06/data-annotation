import { Schema, model } from 'mongoose'

import { IToken, ITokenModel } from './interfaces/token.interface'
import { MODEL_NAMES, TOKEN_TYPES } from '../constants'

const tokenSchema = new Schema<IToken>(
  {
    body: { type: String, index: true, required: true },

    user: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },

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

export const Token = model<IToken, ITokenModel>(MODEL_NAMES.TOKEN, tokenSchema)
