import mongoose from 'mongoose'
import { IUser } from './interfaces'
import ROLE_PRIVILEGES from '../configs/role-config'

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, trim: true, required: true },

    username: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: Object.keys(ROLE_PRIVILEGES),
      required: true,
    },

    birthOfDate: { type: Date, required: true },

    phoneNumber: { type: String, required: true },

    address: { type: String, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

export const User = mongoose.model('User', userSchema)
