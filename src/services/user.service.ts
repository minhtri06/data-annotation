import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IStorageService, IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { UserDocument } from '../types'
import { TYPES } from '../configs/constants'
import { User } from '../models'
import { validate } from '@src/utils'
import { userValidation as validation } from './validations'

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

  async createUser(
    payload: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar'>,
  ): Promise<UserDocument> {
    validate(payload, validation.newUserPayload)

    const user = new User(payload)

    return await user.save()
  }

  async updateUser(
    user: UserDocument,
    payload: Readonly<
      Partial<
        Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'username' | 'role' | 'avatar'>
      >
    >,
  ): Promise<void> {
    validate(payload, validation.userUpdatePayload)

    Object.assign(user, payload)

    await user.save()
  }

  async updateAvatar(user: UserDocument, newAvatar: string): Promise<void> {
    const oldAvatar = user.avatar
    user.avatar = newAvatar
    await user.save()
    if (oldAvatar) {
      await this.imageStorageService.deleteFile(oldAvatar)
    }
  }
}
