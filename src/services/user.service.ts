import { FilterQuery } from 'mongoose'
import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { QueryOptions, UserDocument } from '@src/types'
import { TYPES, USER_WORK_STATUS } from '@src/constants'
import { IUser, IUserModel } from '@src/models'
import {
  CreateUserPayload,
  IUserService,
  UpdateUserPayload,
} from './user.service.interface'
import { IStorageService } from './storage.service.interface'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE) private imageStorageService: IStorageService,
    @inject(TYPES.USER_MODEL) private User: IUserModel,
  ) {}

  async comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword)
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return await this.User.findById(userId)
  }

  async getUsers(
    queryFilter: Partial<Pick<IUser, 'role' | 'name' | 'workStatus'>> = {},
    queryOptions: QueryOptions = {},
  ): Promise<{ data: UserDocument[]; totalPage?: number }> {
    const filter: FilterQuery<IUser> = {}

    if (queryFilter.role) {
      filter.role = queryFilter.role as string
    }
    if (queryFilter.name) {
      filter.name = { $regex: queryFilter.name, $options: 'i' }
    }
    filter.workStatus = queryFilter.workStatus || USER_WORK_STATUS.ON

    return this.User.paginate(filter, queryOptions)
  }

  async getUserByUserName(username: string): Promise<UserDocument | null> {
    return await this.User.findOne({ username })
  }

  async createUser(payload: CreateUserPayload): Promise<UserDocument> {
    const user = new this.User(payload)

    return await user.save()
  }

  async updateUser(user: UserDocument, payload: UpdateUserPayload): Promise<void> {
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
