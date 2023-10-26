import { Container, inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'
import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { IAuthService, ITokenService, IUserService } from '@src/services'
import { CustomRequest } from '@src/types'
import { IGeneralMiddleware } from '@src/middlewares'
import { authSchema as schema } from './schemas'
import { TYPES } from '@src/constants'

export const authControllerFactory = (container: Container) => {
  const { validate } = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/auth')
  class AuthController {
    constructor(
      @inject(TYPES.AUTH_SERVICE) private authService: IAuthService,
      @inject(TYPES.USER_SERVICE) private userService: IUserService,
      @inject(TYPES.TOKEN_SERVICE) private tokenService: ITokenService,
    ) {}

    @httpPost('/login', validate(schema.login))
    async login(req: CustomRequest<schema.Login>, res: Response) {
      const { username, password } = req.body
      const { user, authTokens } = await this.authService.login(username, password)
      return res
        .status(StatusCodes.OK)
        .json({ message: 'Login successfully', user, authTokens })
    }

    @httpPost('/logout', validate(schema.logout))
    async logout(req: CustomRequest<schema.Logout>, res: Response) {
      const { refreshToken } = req.body
      await this.authService.logout(refreshToken)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPost('/refresh-tokens', validate(schema.refreshTokens))
    async refreshTokens(req: CustomRequest<schema.RefreshTokens>, res: Response) {
      const { accessToken, refreshToken } = req.body
      const authTokens = await this.authService.refreshAuthTokens(
        accessToken,
        refreshToken,
      )
      return res.status(StatusCodes.OK).json({ authTokens })
    }

    @httpPost('/register', validate(schema.register))
    async register(req: CustomRequest<schema.Register>, res: Response) {
      const user = await this.authService.register(req.body)
      return res.status(StatusCodes.CREATED).json({ user })
    }
  }

  return AuthController
}
