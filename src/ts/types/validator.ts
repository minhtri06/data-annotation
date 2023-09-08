import Joi from 'joi'

export type Validator<Body = object, Params = object, Query = object> = {
  body?: Joi.ObjectSchema<Body>
  params?: Joi.ObjectSchema<Params>
  query?: Joi.ObjectSchema<Query>
}
