import { IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { Model } from 'mongoose'
import { IUser } from '../models/interfaces'

export class UserService extends ModelService<IUser> implements IUserService {
  constructor(protected Model: Model<IUser>) {
    super(Model)
  }
}
