import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { UpdateMyProfile } from '../request-schemas'

export const updateMyProfile: CustomSchemaMap<UpdateMyProfile> = {
  body: {
    address: Joi.string().label('Address'),
    dateOfBirth: Joi.date().label('Date of birth'),
    name: Joi.string().label('Name'),
    phoneNumber: Joi.string().label('Phone number'),
  },
}
