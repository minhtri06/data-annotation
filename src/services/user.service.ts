import { FilterQuery } from 'mongoose'
import { inject, injectable } from 'inversify'
import bcrypt from 'bcryptjs'

import { IStorageService, IUserService } from './interfaces'
import { ModelService } from './abstracts/model.service'
import { IUser, IUserModel } from '../models/interfaces'
import { QueryOptions, UserDocument } from '../types'
import { TYPES, USER_WORK_STATUS } from '../constants'
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

    return this.paginate(filter, queryOptions)
  }

  async createUser(
    payload: Readonly<
      Pick<
        IUser,
        | 'name'
        | 'username'
        | 'password'
        | 'role'
        | 'dateOfBirth'
        | 'phoneNumber'
        | 'address'
      > &
        Partial<Pick<IUser, 'workStatus'>>
    >,
  ): Promise<UserDocument> {
    validate(payload, validation.newUserPayload)

    const user = new User(payload)

    return await user.save()
  }

  async updateUser(
    user: UserDocument,
    payload: Readonly<
      Partial<
        Pick<
          IUser,
          'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
        >
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
