import { FilterQuery } from 'mongoose'
import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { QueryOptions, UserDocument } from '../types'
import { TYPES, USER_WORK_STATUS } from '../constants'
import { IUser, User } from '../models'
import { ApiError, validate } from '@src/utils'
import { userValidation as validation } from './validations'
import { CreateUserPayload, UpdateUserPayload } from './types'
import { IUserService } from './user.service.interface'
import { IStorageService } from './storage.service.interface'
import { StatusCodes } from 'http-status-codes'
import { customId } from './validations/custom.validation'

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.IMAGE_STORAGE_SERVICE) private imageStorageService: IStorageService,
  ) {}

  async comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
    return await bcrypt.compare(rawPassword, hashedPassword)
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

    return User.paginate(filter, queryOptions)
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    if (customId.required().validate(userId).error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
    }
    return await User.findById(userId)
  }

  async getUserByUserName(username: string): Promise<UserDocument | null> {
    if (typeof username !== 'string') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid username')
    }
    return await User.findOne({ username })
  }

  async createUser(payload: CreateUserPayload): Promise<UserDocument> {
    validate(payload, validation.createUserPayload)

    const user = new User(payload)

    return await user.save()
  }

  async updateUser(user: UserDocument, payload: UpdateUserPayload): Promise<void> {
    validate(payload, validation.updateUserPayload)

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
