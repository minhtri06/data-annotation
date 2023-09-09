import Joi from 'joi'

export type ReqValidator = Joi.ObjectSchema<{
  body?: object
  query?: object
  params?: object
}>
