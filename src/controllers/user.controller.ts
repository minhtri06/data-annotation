import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { Container, inject } from 'inversify'
import { StatusCodes } from 'http-status-codes'

import { IUserService } from '../services'
import { IGeneralMiddleware } from '../middlewares'
import { CustomRequest } from '../types'
import { userSchema as schema } from './schemas'
import { TYPES } from '../constants'
import { pickFields } from '@src/utils'
import { ROLES } from '@src/configs/role.config'

export const userControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const { ADMIN } = ROLES

  @controller('/users')
  class UserController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.auth(), generalMiddleware.validate(schema.getUsers))
    async getUsers(req: CustomRequest<schema.GetUsers>, res: Response) {
      const filter = pickFields(req.query, 'name', 'role', 'workStatus')
      const options = pickFields(req.query, 'limit', 'page', 'checkPaginate')
      const result = await this.userService.getUsers(filter, options)
      return res.status(StatusCodes.OK).json(result)
    }

    @httpPost(
      '/',
      generalMiddleware.auth({ requiredRoles: [ADMIN] }),
      generalMiddleware.validate(schema.createUser),
    )
    async createUser(req: CustomRequest<schema.CreateUser>, res: Response) {
      const user = await this.userService.createUser(req.body)
      return res.status(StatusCodes.CREATED).json({ user })
    }

    @httpGet(
      '/:userId',
      generalMiddleware.auth(),
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
      generalMiddleware.auth({ requiredRoles: [ADMIN] }),
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
