import mongoose, { Schema } from 'mongoose'
import { TOKEN_TYPES } from '../constants'

const tokenSchema = new Schema(
  {
    body: { type: String, index: true, required: true },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: TOKEN_TYPES, required: true },

    expires: { type: Date, required: true },

    isRevoked: { type: Boolean },

    isUsed: { type: Boolean },

    isBlacklisted: { type: Boolean },
  },
  { timestamps: true, optimisticConcurrency: true },
)

export const Token = mongoose.model('Token', tokenSchema)
