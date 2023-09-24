import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IStorageService, IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { UserDocument } from '../types'
import { pickFields } from '../utils/object-utils'
import { TYPES } from '../configs/constants'
import { User } from '../models'

@injectable()
export class UserService extends ModelService<IUser, IUserModel> implements IUserService {
  protected Model: IUserModel = User

  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE) private imageStorageService: IStorageService,
  ) {
    super()
  }

  async comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword)
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 8)
  }

  async createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar'>,
  ): Promise<UserDocument> {
    body = pickFields(
      body,
      'name',
      'username',
      'password',
      'role',
      'birthOfDate',
      'phoneNumber',
      'address',
    )

    body.password = await this.hashPassword(body.password)

    return await this.Model.create(body)
  }

  async updateUser(
    user: UserDocument,
    updateBody: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'role'>>,
  ): Promise<void> {
    updateBody = pickFields(
      updateBody,
      'address',
      'avatar',
      'birthOfDate',
      'name',
      'password',
      'phoneNumber',
    )

    const oldAvatar = user.avatar

    Object.assign(user, updateBody)

    await user.save()

    // if update avatar => delete old avatar
    if (updateBody.avatar && oldAvatar) {
      await this.imageStorageService.deleteFile(oldAvatar)
    }
  }
}
