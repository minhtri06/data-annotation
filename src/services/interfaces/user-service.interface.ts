import { FilterQuery } from 'mongoose'

import { IUser, IUserModel } from '@src/models/interfaces'
import { QueryOptions, UserDocument } from '@src/types'
import { IModelService } from '../abstracts/model.service'

export interface IUserService extends IModelService<IUser, IUserModel> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUsers(
    queryFilter?: FilterQuery<Pick<IUser, 'role' | 'name'>>,
    queryOptions?: QueryOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>,
  ): Promise<UserDocument>

  updateUser(
    user: UserDocument,
    updateBody: Readonly<
      Partial<
        Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'username' | 'role' | 'avatar'>
      >
    >,
  ): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}
