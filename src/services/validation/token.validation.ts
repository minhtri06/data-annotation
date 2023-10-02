import { TOKEN_TYPES } from '@src/configs/constants'
import Joi from 'joi'

import * as userValidation from './user.validation'
import * as customValidation from './custom.validation'

export const modelSchema = {
  body: Joi.string(),

  type: Joi.string().valid(...Object.values(TOKEN_TYPES)),
}

export const generateToken = {
  userId: userValidation.modelSchema._id.required(),
  role: userValidation.modelSchema.role.required(),
  expires: customValidation.momentType.required(),
  type: modelSchema.type.required(),
}

export const verifyToken = {
  token: modelSchema.body.required(),
  type: modelSchema.type.required(),
}

export const blacklistAUser = {
  userId: userValidation.modelSchema._id.required(),
}
