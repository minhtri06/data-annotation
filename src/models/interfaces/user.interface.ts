import mongoose from 'mongoose'
import { Role } from '../../types'

export interface IUser {
  _id: string | mongoose.Types.ObjectId
  name: string
  username: string
  password: string
  role: Role
  birthOfDate: Date
  phoneNumber: string
  address: string
  createdAt: Date
  updatedAt: Date
}
