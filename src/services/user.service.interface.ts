import { QueryOptions, UserDocument } from '@src/types'
import { CreateUserPayload, UpdateUserPayload } from './types'
import { IUser } from '@src/models'

export interface IUserService {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUsers(
    queryFilter?: Partial<Pick<IUser, 'role' | 'name' | 'workStatus'>>,
    queryOptions?: QueryOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  getUserById(userId: string): Promise<UserDocument | null>

  getUserByUserName(username: string): Promise<UserDocument | null>

  createUser(body: CreateUserPayload): Promise<UserDocument>

  updateUser(user: UserDocument, updateBody: UpdateUserPayload): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}
