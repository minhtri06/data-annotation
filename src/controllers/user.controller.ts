import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { Container, inject } from 'inversify'
import { StatusCodes } from 'http-status-codes'

import { IUserService } from '../services'
import { IGeneralMiddleware } from '../middlewares'
import { PRIVILEGES } from '../configs/role.config'
import { CustomRequest } from '../types'
import { userSchema as schema } from './schemas'
import { TYPES } from '../constants'

export const userControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/users')
  class UserController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.auth(), generalMiddleware.validate(schema.getUsers))
    async getUsers(req: CustomRequest<schema.GetUsers>, res: Response) {
      const { role, name, workStatus } = req.query
      const { limit, page, checkPaginate } = req.query
      const result = await this.userService.getUsers(
        { role, name, workStatus },
        { limit, page, checkPaginate },
      )
      return res.status(StatusCodes.OK).json(result)
    }

    @httpPost(
      '/',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.CREATE_USERS] }),
      generalMiddleware.validate(schema.createUser),
    )
    async createUser(req: CustomRequest<schema.CreateUser>, res: Response) {
      const user = await this.userService.createUser(req.body)
      return res.status(StatusCodes.CREATED).json({ user })
    }

    @httpGet(
      '/:userId',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.GET_USERS] }),
      generalMiddleware.validate(schema.getUserById),
    )
    async getUserById(req: CustomRequest<schema.GetUserById>, res: Response) {
      const user = await this.userService.getUserById(req.params.userId)

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(StatusCodes.OK).json({ user })
    }

    @httpPatch(
      '/:userId',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.UPDATE_USERS] }),
      generalMiddleware.validate(schema.updateUserById),
    )
    async updateUserById(req: CustomRequest<schema.UpdateUserById>, res: Response) {
      const updatedUser = await this.userService.getUserById(req.params.userId)

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' })
      }
      await this.userService.updateUser(updatedUser, req.body)
      return res.status(StatusCodes.OK).json({ user: updatedUser })
    }
  }

  return UserController
}
