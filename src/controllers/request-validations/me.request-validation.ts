import { CustomSchemaMap } from '@src/types'
import { UpdateMyProfile } from '../request-schemas/me.request-schema'
import Joi from 'joi'

export const updateMyProfile: CustomSchemaMap<UpdateMyProfile> = {
  body: {
    address: Joi.string(),
    birthOfDate: Joi.date(),
    name: Joi.string(),
    phoneNumber: Joi.string(),
  },
}
