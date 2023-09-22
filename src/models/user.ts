import { Schema, model } from 'mongoose'

import { IUser, IUserModel } from './interfaces'
import ROLE_PRIVILEGES from '../configs/role.config'
import { toJSON } from './plugins'
import { MODEL_NAMES } from '../configs/constants'

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },

    username: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: Object.keys(ROLE_PRIVILEGES),
      required: true,
    },

    avatar: String,

    birthOfDate: { type: Date, required: true },

    phoneNumber: { type: String, required: true },

    address: { type: String, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.password = undefined
      },
    },
  },
)

userSchema.plugin(toJSON)

export const User = model<IUser, IUserModel>(MODEL_NAMES.USER, userSchema)
