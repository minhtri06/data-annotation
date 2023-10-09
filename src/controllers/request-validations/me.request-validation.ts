import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { UpdateMyProfile } from '../request-schemas'

export const updateMyProfile: CustomSchemaMap<UpdateMyProfile> = {
  body: {
    address: Joi.string(),
    dateOfBirth: Joi.date(),
    name: Joi.string(),
    phoneNumber: Joi.string(),
  },
}
