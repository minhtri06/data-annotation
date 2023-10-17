import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'

export type UpdateMyProfile = {
  body: {
    address: string
    dateOfBirth: Date
    name: string
    phoneNumber: string
  }
}
export const updateMyProfile: CustomSchemaMap<UpdateMyProfile> = {
  body: {
    address: Joi.string(),
    dateOfBirth: Joi.date(),
    name: Joi.string(),
    phoneNumber: Joi.string(),
  },
}
