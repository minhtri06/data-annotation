import { Response } from 'express'
import { Container, inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPut } from 'inversify-express-utils'
import createHttpError from 'http-errors'

import { IGeneralMiddleware } from '../middlewares'
import { IUserService } from '../services'
import { CustomRequest, EmptyObject } from '../types'
import { IUploadMiddleware } from '../middlewares/upload.middleware'
import { TYPES } from '../constants'
import { ApiError } from '../utils'
import { StatusCodes } from 'http-status-codes'
import { meRequestValidation as validation } from './request-validations'
import { UpdateMyProfile } from './request-schemas'

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
      const me = await this.userService.getUserById(req.user._id)
      if (!me) {
        return res.status(404).json({ message: 'User not found' })
      }
      return res.status(200).json({ me })
    }

    @httpPatch(
      '/',
      generalMiddleware.auth(),
      generalMiddleware.validate(validation.updateMyProfile),
    )
    async updateMyProfile(req: CustomRequest<UpdateMyProfile>, res: Response) {
      if (!req.user) {
        throw createHttpError.Unauthorized('Unauthorized')
      }
      const me = await this.userService.getUserById(req.user._id)
      if (!me) {
        return res.status(404).json({ message: 'User not found' })
      }
      await this.userService.updateUser(me, req.body)
      return res.status(StatusCodes.OK).json({ me })
    }

    @httpPut(
      '/avatar',
      generalMiddleware.auth(),
      uploadMiddleware.uploadSingle('image', 'avatar'),
    )
    async updateMyAvatar(req: CustomRequest, res: Response) {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }
      if (!req.file) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Avatar is required')
      }
      const user = await this.userService.getUserById(req.user._id)
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
