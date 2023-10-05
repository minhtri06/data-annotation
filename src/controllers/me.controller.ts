import { Container, inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPut } from 'inversify-express-utils'
import createHttpError from 'http-errors'
import { Response } from 'express'

import { IGeneralMiddleware } from '../middlewares'
import { IUserService } from '../services/interfaces'
import { CustomRequest, EmptyObject } from '../types'
import { IUploadMiddleware } from '../middlewares/upload.middleware'
import { TYPES } from '../configs/constants'
import { ApiError } from '../utils'
import { StatusCodes } from 'http-status-codes'
import { updateMyProfile } from './request-validations/me.request-validation'
import { UpdateMyProfile } from './request-schemas/me.request-schema'

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
      const profile = await this.userService.getOneByIdOrFail(req.user._id)
      return res.status(200).json({ profile })
    }

    @httpPatch('/', generalMiddleware.auth(), generalMiddleware.validate(updateMyProfile))
    async updateMyProfile(req: CustomRequest<UpdateMyProfile>, res: Response) {
      if (!req.user) {
        throw createHttpError.Unauthorized('Unauthorized')
      }
      const me = await this.userService.getOneByIdOrFail(req.user._id)
      await this.userService.updateUser(me, req.body)
      return res.status(StatusCodes.NO_CONTENT).send()
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
      const user = await this.userService.getOneByIdOrFail(req.user._id)
      await this.userService.updateAvatar(user, req.file.filename)
      return res
        .status(200)
        .json({ message: 'Replace avatar successfully', avatar: user.avatar })
    }
  }

  return MeController
}
