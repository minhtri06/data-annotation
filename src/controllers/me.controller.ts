import { Response } from 'express'
import { Container, inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPut } from 'inversify-express-utils'

import { IGeneralMiddleware } from '@src/middlewares'
import { IUserService } from '@src/services'
import { CustomRequest } from '@src/types'
import { IUploadMiddleware } from '@src/middlewares/upload.middleware'
import { TYPES } from '@src/constants'
import { StatusCodes } from 'http-status-codes'
import { meSchema as schema } from './schemas'
import { Exception, UnauthorizedException } from '@src/services/exceptions'

export const meControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const uploadMiddleware = container.get<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE)

  @controller('/me')
  class MeController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.auth())
    async getMyProfile(req: CustomRequest, res: Response) {
      if (!req.user) {
        throw new UnauthorizedException('Unauthorized', { isOperational: false })
      }
      const me = await this.userService.getUserById(req.user.id)
      if (!me) {
        return res.status(404).json({ message: 'User not found' })
      }
      return res.status(200).json({ me })
    }

    @httpPatch(
      '/',
      generalMiddleware.auth(),
      generalMiddleware.validate(schema.updateMyProfile),
    )
    async updateMyProfile(req: CustomRequest<schema.UpdateMyProfile>, res: Response) {
      if (!req.user) {
        throw new UnauthorizedException('Unauthorized', { isOperational: false })
      }
      const me = await this.userService.getUserById(req.user.id)
      if (!me) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
      }
      await this.userService.updateUser(me, req.body)
      return res.status(StatusCodes.OK).json({ me })
    }

    @httpPut('/avatar', generalMiddleware.auth(), uploadMiddleware.uploadImage('avatar'))
    async updateMyAvatar(req: CustomRequest, res: Response) {
      if (!req.user) {
        throw new UnauthorizedException('Unauthorized', { isOperational: false })
      }
      if (!req.file) {
        throw new Exception('Missing file', { isOperational: false })
      }
      const user = await this.userService.getUserById(req.user.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      await this.userService.updateAvatar(user, req.file.filename)
      return res
        .status(200)
        .json({ message: 'Replace avatar successfully', avatar: user.avatar })
    }
  }

  return MeController
}
