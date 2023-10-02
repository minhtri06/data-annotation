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

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 8)
  }

  async createUser(
    payload: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar'>,
  ): Promise<UserDocument> {
    validate(payload, validation.newUserPayload)

    payload.password = await this.hashPassword(payload.password)

    return await this.Model.create(payload)
  }

  async updateUser(
    user: UserDocument,
    payload: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'role'>>,
  ): Promise<void> {
    validate(payload, validation.userUpdatePayload)

    const oldAvatar = user.avatar

    Object.assign(user, payload)

    await user.save()

    // if update avatar => delete old avatar
    if (payload.avatar && oldAvatar) {
      await this.imageStorageService.deleteFile(oldAvatar)
    }
  }
}
