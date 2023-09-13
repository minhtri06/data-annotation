import { controller, httpGet, response } from 'inversify-express-utils'
import { Response } from 'express'
import { TYPES } from '../configs/constants'
import { inject } from 'inversify'
import { IUserService } from '../services/interfaces'

@controller('/users')
export class UserController {
  constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

  @httpGet('/')
  getUsers(@response() res: Response) {
    return res.json({ users: [] })
  }
}
