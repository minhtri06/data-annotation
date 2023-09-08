import Joi from 'joi'

export type Validator<Body = object, Params = object, Query = object> = {
  body?: Joi.Schema<Body>
  params?: Joi.Schema<Params>
  query?: Joi.Schema<Query>
}
