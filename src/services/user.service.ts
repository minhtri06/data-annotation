import { IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser } from '../models/interfaces'
import { inject, injectable } from 'inversify'
import { TYPES } from '../constants'
import { Model as MongooseModel } from 'mongoose'

@injectable()
export class UserService extends ModelService<IUser> implements IUserService {
  constructor(@inject(TYPES.USER_MODEL) Model: MongooseModel<IUser>) {
    super(Model)
  }
}
