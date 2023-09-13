import Joi from 'joi'

export type RequestValidator = Joi.ObjectSchema<{
  body?: object
  query?: object
  params?: object
}>
