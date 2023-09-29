import { Schema, model } from 'mongoose'

import { IUser, IUserModel } from './interfaces'
import ROLE_PRIVILEGES from '../configs/role.config'
import { toJSON } from './plugins'
import { MODEL_NAMES } from '../configs/constants'

const userSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },

    username: { type: String, required: true, unique: true },

    password: {
      type: String,
      required: true,
      minlength: 6,
      validate: (password: string) => {
        if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number')
        }
      },
    },

    role: {
      type: String,
      enum: { values: Object.keys(ROLE_PRIVILEGES), message: 'Invalid role' },
      required: true,
    },

    avatar: String,

    birthOfDate: { type: Date, required: true },

    phoneNumber: { type: String, required: true },

    address: { type: String, required: true },

    monthlyAnnotation: {
      type: [
        {
          month: { type: Number, required: true },
          year: { type: Number, required: true },
          annotationTotal: { type: Number, required: true, default: 0 },
        },
      ],
      default: [],
      required: true,
    },
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
