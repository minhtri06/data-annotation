import Joi from 'joi'

export type Validator = {
  body?: Joi.Schema
  query?: Joi.Schema
  params?: Joi.Schema
}
