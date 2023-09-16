import { Container, inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'
import { TYPES } from '../configs/constants'
import { IAuthService, IUserService } from '../services/interfaces'
import { CustomRequest } from '../types'
import { IGeneralMiddleware } from '../middlewares'
import { RegisterUser } from '../types/request-schemas'
import { Response } from 'express'
import { authValidation as validation } from '../validations'

export const authControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/auth')
  class AuthController {
    constructor(
      @inject(TYPES.AUTH_SERVICE) private authService: IAuthService,
      @inject(TYPES.USER_SERVICE) private userService: IUserService,
    ) {}

    @httpPost('/register', generalMiddleware.validate(validation.registerUser))
    register(req: CustomRequest<RegisterUser>, res: Response) {
      return res.json(req.body).status(200)
    }
  }

  return AuthController
}
