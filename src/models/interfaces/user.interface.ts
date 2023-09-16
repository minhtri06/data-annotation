import mongoose, { Model } from 'mongoose'
import { Role } from '../../types'

export interface IUser {
  _id: string | mongoose.Types.ObjectId

  name: string

  username: string

  password: string

  role: Role

  avatar: string

  birthOfDate: Date

  phoneNumber: string

  address: string

  createdAt: Date

  updatedAt: Date
}

export interface IUserModel extends Model<IUser> {}
