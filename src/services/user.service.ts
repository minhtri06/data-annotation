import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { TYPES } from '../configs/constants'
import { UserDocument } from '../types'
import { pickFields } from '../utils/object-utils'
import { ROLES } from '../configs/role-config'
import createHttpError from 'http-errors'

@injectable()
export class UserService extends ModelService<IUser, IUserModel> implements IUserService {
  constructor(@inject(TYPES.USER_MODEL) Model: IUserModel) {
    super(Model)
  }

  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword)
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 8)
  }

  async createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<UserDocument> {
    body = pickFields(
      body,
      'address',
      'birthOfDate',
      'name',
      'password',
      'phoneNumber',
      'role',
      'username',
    )
    if (body.role !== ROLES.LEVEL_1_ANNOTATOR && body.role !== ROLES.LEVEL_2_ANNOTATOR) {
      throw createHttpError.BadRequest('Invalid role')
    }
    body.password = await this.hashPassword(body.password)
    return await this.Model.create(body)
  }
}
