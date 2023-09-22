import { Container, inject } from 'inversify'
import { controller, httpGet, httpPut } from 'inversify-express-utils'
import createHttpError from 'http-errors'
import { Request, Response } from 'express'

import { IGeneralMiddleware } from '../middlewares'
import { IUserService } from '../services/interfaces'
import { CustomRequest, EmptyObject } from '../types'
import { IUploadMiddleware } from '../middlewares/upload.middleware'
import { TYPES } from '../configs/constants'

export const meControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const uploadMiddleware = container.get<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE)

  @controller('/me')
  class MeController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.auth())
    async getMyProfile(req: CustomRequest<EmptyObject>, res: Response) {
      if (!req.user) {
        throw createHttpError.Unauthorized('Unauthorized')
      }
      const profile = await this.userService.getOneByIdOrError(req.user._id)
      return res.status(200).json({ profile })
    }

    @httpPut(
      '/avatar',
      generalMiddleware.auth(),
      uploadMiddleware.uploadSingle('image', 'avatar', {}),
    )
    replaceAvatar(req: Request, res: Response) {
      return res.status(200).json({ message: 'Oke' })
    }
  }

  return MeController
}
