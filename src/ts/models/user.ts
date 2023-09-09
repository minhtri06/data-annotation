import { Role } from '../types/roles'
import mongoose from 'mongoose'

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
