import { Model } from 'mongoose'

import { Role } from '../../types'
import { ISchema } from './schema.interface'
import { USER_WORK_STATUS } from '@src/constants'

export interface IUser extends ISchema {
  name: string

  username: string

  password: string

  role: Role

  avatar?: string

  dateOfBirth: Date

  phoneNumber: string

  address: string

  workStatus: (typeof USER_WORK_STATUS)[keyof typeof USER_WORK_STATUS]

  monthlyAnnotation: {
    month: number
    year: number
    annotationTotal: number
  }[]
}

export interface IUserModel extends Model<IUser> {}
