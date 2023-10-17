import { QueryOptions, UserDocument } from '@src/types'
import { IRawUser } from '@src/models'

export interface IUserService {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUsers(
    queryFilter?: Partial<Pick<IRawUser, 'role' | 'name' | 'workStatus'>>,
    queryOptions?: QueryOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  getUserById(userId: string): Promise<UserDocument | null>

  getUserByUserName(username: string): Promise<UserDocument | null>

  createUser(body: CreateUserPayload): Promise<UserDocument>

  updateUser(user: UserDocument, updateBody: UpdateUserPayload): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}

// * parameter types

export type CreateUserPayload = Readonly<
  Pick<
    IRawUser,
    'name' | 'username' | 'password' | 'role' | 'dateOfBirth' | 'phoneNumber' | 'address'
  >
>

export type UpdateUserPayload = Readonly<
  Partial<
    Pick<
      IRawUser,
      'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
    >
  >
>
