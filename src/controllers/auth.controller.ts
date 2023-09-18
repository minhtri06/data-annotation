import { Container, inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { TYPES } from '../configs/constants'
import { IAuthService, ITokenService, IUserService } from '../services/interfaces'
import { CustomRequest } from '../types'
import { IGeneralMiddleware } from '../middlewares'
import { Login, Logout, RegisterUser } from '../types/request-schemas'
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
      const { user, authTokens } = await this.authService.register(req.body)
      return res
        .json({ message: 'create user successfully', user, authTokens })
        .status(StatusCodes.CREATED)
    }

    @httpPost('/login', generalMiddleware.validate(validation.login))
    async login(req: CustomRequest<Login>, res: Response) {
      const { username, password } = req.body
      const { user, authTokens } = await this.authService.login(username, password)
      return res.status(200).json({ message: 'login successfully', user, authTokens })
    }

    @httpPost('/logout', generalMiddleware.validate(validation.logout))
    async logout(req: CustomRequest<Logout>, res: Response) {
      const { refreshToken } = req.body
      await this.authService.logout(refreshToken)
      return res.status(StatusCodes.NO_CONTENT).send()
    }
  }

  return AuthController
}
