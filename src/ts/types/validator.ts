import Joi from 'joi'

export type validatorProp = 'body' | 'query' | 'params'

export type Validator = Record<validatorProp, Joi.Schema | undefined>
