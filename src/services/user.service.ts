import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { TYPES } from '../configs/constants'
import { UserDocument } from '../types'

@injectable()
export class UserService extends ModelService<IUser, IUserModel> implements IUserService {
  constructor(@inject(TYPES.USER_MODEL) Model: IUserModel) {
    super(Model)
  }

  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword)
  }

  async createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserDocument> {
    return await this.Model.create(body)
  }
}
