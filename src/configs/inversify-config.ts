import { Model } from 'mongoose'
import { Container } from 'inversify'
import { IUserService } from '../services/interfaces'
import { TYPES } from '../constants'
import { IUser } from '../models/interfaces'
import { UserService } from '../services'
import { User } from '../models'
import '../controllers'

const container = new Container()
container.bind<IUserService>(TYPES.USER_SERVICE).to(UserService)
container.bind<Model<IUser>>(TYPES.USER_MODEL).toConstantValue(User)

export default container
