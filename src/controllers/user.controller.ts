import { inject } from 'inversify'
import { controller, httpGet, response } from 'inversify-express-utils'
import { TYPES } from '../constants'
import { IUserService } from '../services/interfaces'
import { Response } from 'express'

console.log(TYPES)

@controller('/users')
export class UserController {
  constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

  @httpGet('/')
  getUsers(@response() res: Response) {
    return res.json({ users: [] })
  }
}
