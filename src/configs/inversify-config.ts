import { Container } from 'inversify'
import { ITokenService, IUserService } from '../services/interfaces'
import { TYPES } from './constants'
import { IUserModel } from '../models/interfaces'
import { TokenService, UserService } from '../services'
import { Token, User } from '../models'
import '../controllers'
import { ITokenModel } from '../models/interfaces/token.interface'

const container = new Container()

// bind models
container.bind<IUserModel>(TYPES.USER_MODEL).toConstantValue(User)
container.bind<ITokenModel>(TYPES.TOKEN_MODEL).toConstantValue(Token)

// bind services
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)
container.bind<ITokenService>(TYPES.TOKEN_SERVICE).to(TokenService)

export default container
