import { Container, inject } from 'inversify'
import { controller, httpGet } from 'inversify-express-utils'

import { IGeneralMiddleware } from '../middlewares'
import { TYPES } from '../configs/constants'
import { IUserService } from '../services/interfaces'
import { CustomRequest, EmptyObject } from '../types'
import createHttpError from 'http-errors'
import { Response } from 'express'

export const meControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/me')
  class MeController {
    constructor(@inject(TYPES.USER_SERVICE) private userService: IUserService) {}

    @httpGet('/', generalMiddleware.auth())
    async getMyProfile(req: CustomRequest<EmptyObject>, res: Response) {
      if (!req.user) {
        throw createHttpError.Unauthorized('unauthorized')
      }
      const profile = await this.userService.getOneByIdOrError(req.user._id)
      return res.status(200).json({ profile })
    }
  }

  return MeController
}
