import { Container } from 'inversify'
import { IAuthService, ITokenService, IUserService } from '../services/interfaces'
import { TYPES } from './constants'
import { IUserModel } from '../models/interfaces'
import { AuthService, TokenService, UserService } from '../services'
import { Token, User } from '../models'
import { ITokenModel } from '../models/interfaces/token.interface'
import { GeneralMiddleware, IGeneralMiddleware } from '../middlewares'
import { authControllerFactory, userControllerFactory } from '../controllers'

const container = new Container()

// bind models
container.bind<ITokenModel>(TYPES.TOKEN_MODEL).toConstantValue(Token)
container.bind<IUserModel>(TYPES.USER_MODEL).toConstantValue(User)

// bind services
container.bind<IAuthService>(TYPES.AUTH_SERVICE).to(AuthService)
container.bind<ITokenService>(TYPES.TOKEN_SERVICE).to(TokenService)
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)

// bind middlewares
container.bind<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE).to(GeneralMiddleware)

// register controllers
authControllerFactory(container)
userControllerFactory(container)

export default container
