import { HydratedDocument, Model, Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

import { ROLES } from '@src/configs/role.config'
import { Paginate, paginatePlugin, toJSONPlugin, handleErrorPlugin } from './plugins'
import { MODEL_NAMES, USER_WORK_STATUSES } from '../constants'
import { Types } from 'mongoose'

export interface IUser {
  _id: Types.ObjectId

  name: string

  username: string

  password: string

  role: (typeof ROLES)[keyof typeof ROLES]

  avatar?: string

  dateOfBirth: Date

  phoneNumber: string

  address: string

  workStatus: (typeof USER_WORK_STATUSES)[keyof typeof USER_WORK_STATUSES]

  monthlyAnnotations: Types.DocumentArray<{
    month: number
    year: number
    annotationTotal: number
  }>

  createdAt: Date
  updatedAt: Date
}

export interface IRawUser {
  name: string

  username: string

  password: string

  role: string

  avatar?: string

  dateOfBirth: Date

  phoneNumber: string

  address: string

  workStatus: string

  monthlyAnnotations: {
    month: number
    year: number
    annotationTotal: number
  }[]
}

export interface IUserModel extends Model<IUser> {
  paginate: Paginate<IUser>
}

export type UserDocument = HydratedDocument<IUser>

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
      enum: { values: Object.values(ROLES), message: 'Invalid role' },
      required: true,
    },

    avatar: String,

    dateOfBirth: { type: Date, required: true },

    phoneNumber: { type: String, required: true },

    address: { type: String, required: true },

    workStatus: {
      type: String,
      enum: Object.values(USER_WORK_STATUSES),
      default: USER_WORK_STATUSES.ON,
      required: true,
    },

    monthlyAnnotations: {
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

userSchema.plugin(toJSONPlugin)
userSchema.plugin(paginatePlugin)
userSchema.plugin(handleErrorPlugin)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

export const User = model<IUser, IUserModel>(MODEL_NAMES.USER, userSchema)
