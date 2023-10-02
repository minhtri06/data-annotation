import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IStorageService, IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { UserDocument } from '../types'
import { TYPES } from '../configs/constants'
import { User } from '../models'
import { validateParams } from '@src/utils'
import { userValidation as validation } from './validation'

@injectable()
export class UserService extends ModelService<IUser, IUserModel> implements IUserService {
  protected Model: IUserModel = User

  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE) private imageStorageService: IStorageService,
  ) {
    super()
  }

  async comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    validateParams({ hashedPassword, rawPassword }, validation.comparePassword)

    return await bcrypt.compare(rawPassword, hashedPassword)
  }

  async hashPassword(password: string): Promise<string> {
    validateParams({ password }, validation.hashPassword)

    return await bcrypt.hash(password, 8)
  }

  async createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar'>,
  ): Promise<UserDocument> {
    validateParams({ body }, validation.createUser)

    body.password = await this.hashPassword(body.password)

    return await this.Model.create(body)
  }

  async updateUser(
    user: UserDocument,
    updateBody: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'role'>>,
  ): Promise<void> {
    validateParams({ updateBody }, validation.updateUser)

    const oldAvatar = user.avatar

    Object.assign(user, updateBody)

    await user.save()

    // if update avatar => delete old avatar
    if (updateBody.avatar && oldAvatar) {
      await this.imageStorageService.deleteFile(oldAvatar)
    }
  }
}
