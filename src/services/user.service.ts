import { IUserService } from './interfaces'
import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { TYPES } from '../configs/constants'

@injectable()
export class UserService extends ModelService<IUser> implements IUserService {
  constructor(@inject(TYPES.USER_MODEL) Model: IUserModel) {
    super(Model)
  }

  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword)
  }
}
