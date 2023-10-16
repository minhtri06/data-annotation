import { Model, Schema, Types, model } from 'mongoose'

import { MODEL_NAMES, TOKEN_TYPES } from '@src/constants'
import { toJSONPlugin, handleErrorPlugin } from './plugins'

export interface IToken {
  _id: Types.ObjectId

  body: string

  user: Types.ObjectId

  type: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]

  expires: Date

  isRevoked: boolean

  isUsed: boolean

  isBlacklisted: boolean

  updatedAt: Date
  createdAt: Date
}

export interface IRawToken {
  body: string

  user: string

  type: (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES]

  expires: Date

  isRevoked: boolean

  isUsed: boolean

  isBlacklisted: boolean
}

export interface ITokenModel extends Model<IToken> {}

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

tokenSchema.plugin(toJSONPlugin)
tokenSchema.plugin(handleErrorPlugin)

export const Token = model<IToken, ITokenModel>(MODEL_NAMES.TOKEN, tokenSchema)
