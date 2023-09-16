import { controller, httpGet, response } from 'inversify-express-utils'
import { Response } from 'express'
import { TYPES } from '../configs/constants'
import { Container, inject } from 'inversify'
import { IUserService } from '../services/interfaces'
import { IGeneralMiddleware } from '../middlewares'

export const userControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/users', generalMiddleware.auth())
  class UserController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/')
    getUsers(@response() res: Response) {
      return res.json({ users: [] })
    }
  }

  return UserController
}
