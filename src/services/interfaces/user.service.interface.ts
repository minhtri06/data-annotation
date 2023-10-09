import { IUser, IUserModel } from '@src/models/interfaces'
import { QueryOptions, UserDocument } from '@src/types'
import { IModelService } from './model.service.interface'
import { CreateUserPayload, UpdateUserPayload } from '../types'

export interface IUserService extends IModelService<IUser, IUserModel> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUsers(
    queryFilter?: Partial<Pick<IUser, 'role' | 'name' | 'workStatus'>>,
    queryOptions?: QueryOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  createUser(body: CreateUserPayload): Promise<UserDocument>

  updateUser(user: UserDocument, updateBody: UpdateUserPayload): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}
