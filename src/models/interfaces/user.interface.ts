import { Model } from 'mongoose'

import { Role } from '../../types'
import { ISchema } from './schema.interface'

export interface IUser extends ISchema {
  name: string

  username: string

  password: string

  role: Role

  avatar?: string

  birthOfDate: Date

  phoneNumber: string

  address: string

  monthlyAnnotation: {
    month: number
    year: number
    annotationTotal: number
  }[]
}

export interface IUserModel extends Model<IUser> {}
