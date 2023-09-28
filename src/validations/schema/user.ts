import Joi from 'joi'

import { ROLES } from '../../configs/role.config'

export const userSchema = {
  name: Joi.string(),
  username: Joi.string(),
  password: Joi.string(),
  role: Joi.string().valid(ROLES.ANNOTATOR).messages({ 'any.only': 'Invalid role' }),
  birthOfDate: Joi.date(),
  phoneNumber: Joi.string(),
  address: Joi.string(),
}
