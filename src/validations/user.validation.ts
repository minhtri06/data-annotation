import Joi from 'joi'
// import { Validator } from '../ts/common'
import { GetUsers } from '../ts/req-schemas'
import { ReqValidator } from '../ts/types'

export class UserValidator {
  static [prop: string]: ReqValidator

  static getUser = Joi.object<GetUsers, true>({
    query: { limit: Joi.number().required(), page: Joi.number().required() },
  })
}
