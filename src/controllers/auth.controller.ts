import { Container, inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { TYPES } from '../configs/constants'
import { IAuthService, ITokenService, IUserService } from '../services/interfaces'
import { CustomRequest } from '../types'
import { IGeneralMiddleware } from '../middlewares'
import { RegisterUser } from '../types/request-schemas'
import { authValidation as validation } from '../validations'

export const authControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/auth')
  class AuthController {
    constructor(
      @inject(TYPES.AUTH_SERVICE) private authService: IAuthService,
      @inject(TYPES.USER_SERVICE) private userService: IUserService,
      @inject(TYPES.TOKEN_SERVICE) private tokenService: ITokenService,
    ) {}

    @httpPost('/register', generalMiddleware.validate(validation.registerUser))
    async register(req: CustomRequest<RegisterUser>, res: Response) {
      // console.log(this.tokenService.createAuthTokens)
      const user = await this.userService.createUser(req.body)
      const authTokens = await this.tokenService.createAuthTokens(user._id, user.role)
      return res
        .json({ message: 'create user successfully', user, authTokens })
        .status(StatusCodes.CREATED)
    }
  }

  return AuthController
}
