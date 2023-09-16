import { controller, httpGet, httpPost, response } from 'inversify-express-utils'
import { Response } from 'express'
import { Container, inject } from 'inversify'
import { StatusCodes } from 'http-status-codes'

import { TYPES } from '../configs/constants'
import { IUserService } from '../services/interfaces'
import { IGeneralMiddleware } from '../middlewares'
import { PRIVILEGES } from '../configs/role-config'
import { CustomRequest } from '../types'
import { CreateUser } from '../types/request-schemas'
import { userValidation as validation } from '../validations'

export const userControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/users', generalMiddleware.auth())
  class UserController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/')
    getUsers(@response() res: Response) {
      return res.json({ users: [] })
    }

    @httpPost(
      '/',
      generalMiddleware.validate(validation.createUser),
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.CREATE_USERS] }),
    )
    async createUser(req: CustomRequest<CreateUser>, res: Response) {
      const user = await this.userService.createUser(req.body)
      return res.status(StatusCodes.CREATED).json({ user })
    }
  }

  return UserController
}
