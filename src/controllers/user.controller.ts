import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { Container, inject } from 'inversify'
import { StatusCodes } from 'http-status-codes'

import { IUserService } from '../services/interfaces'
import { IGeneralMiddleware } from '../middlewares'
import { PRIVILEGES } from '../configs/role.config'
import { CustomRequest } from '../types'
import { CreateUser, GetUserById, GetUsers, UpdateUserById } from './request-schemas'
import { userRequestValidation as validation } from './request-validations'
import { TYPES } from '../configs/constants'

export const userControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/users', generalMiddleware.auth())
  class UserController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.validate(validation.getUsers))
    async getUsers(req: CustomRequest<GetUsers>, res: Response) {
      const { role, name } = req.query
      const { limit, page, checkPaginate } = req.query
      const result = await this.userService.getUsers(
        { role, name },
        { limit, page, checkPaginate },
      )
      return res.status(StatusCodes.OK).json(result)
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

    @httpGet(
      '/:userId',
      generalMiddleware.auth(),
      generalMiddleware.validate(validation.getUserById),
    )
    async getUserById(req: CustomRequest<GetUserById>, res: Response) {
      const user = await this.userService.getOneByIdOrFail(req.params.userId)
      return res.status(StatusCodes.OK).json({ user })
    }

    @httpPatch(
      '/:userId',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.UPDATE_USERS] }),
      generalMiddleware.validate(validation.updateUserById),
    )
    async updateUserById(req: CustomRequest<UpdateUserById>, res: Response) {
      const updatedUser = await this.userService.getOneByIdOrFail(req.params.userId)
      await this.userService.updateUser(updatedUser, req.body)
      return res.status(StatusCodes.OK).json({ user: updatedUser })
    }
  }

  return UserController
}
