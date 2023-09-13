import { Model } from 'mongoose'
import { Container } from 'inversify'
import { IUserService } from '../services/interfaces'
import { TYPES } from './constants'
import { IUser } from '../models/interfaces'
import { UserService } from '../services'
import { Token, User } from '../models'
import '../controllers'
import { IToken } from '../models/interfaces/token.interface'

const container = new Container()
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)
container.bind<Model<IUser>>(TYPES.USER_MODEL).toConstantValue(User)
container.bind<Model<IToken>>(TYPES.TOKEN_MODEL).toConstantValue(Token)

export default container
