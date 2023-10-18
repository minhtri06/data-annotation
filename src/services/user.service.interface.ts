import { IRawUser, UserDocument } from '@src/models'

export interface IUserService {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUserById(userId: string): Promise<UserDocument | null>

  getUsers(
    filter?: GetUsersFilter,
    options?: GetUsersOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  getUserByUserName(username: string): Promise<UserDocument | null>

  createUser(payload: CreateUserPayload): Promise<UserDocument>

  updateUser(user: UserDocument, payload: UpdateUserPayload): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}

// * parameter types
export type GetUsersFilter = Readonly<
  Partial<Pick<IRawUser, 'role' | 'name' | 'workStatus'>>
>
export type GetUsersOptions = Readonly<{
  limit?: number
  page?: number
  checkPaginate?: boolean
}>

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
