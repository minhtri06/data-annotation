import { IUser, IUserModel } from '@src/models/interfaces'
import { QueryOptions, UserDocument } from '@src/types'
import { IModelService } from './model-service.interface'

export interface IUserService extends IModelService<IUser, IUserModel> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  getUsers(
    queryFilter?: Partial<Pick<IUser, 'role' | 'name' | 'workStatus'>>,
    queryOptions?: QueryOptions,
  ): Promise<{ data: UserDocument[]; totalPage?: number }>

  createUser(
    body: Readonly<
      Pick<
        IUser,
        | 'name'
        | 'username'
        | 'password'
        | 'role'
        | 'dateOfBirth'
        | 'phoneNumber'
        | 'address'
      >
    >,
  ): Promise<UserDocument>

  updateUser(
    user: UserDocument,
    updateBody: Readonly<
      Partial<
        Pick<
          IUser,
          'address' | 'dateOfBirth' | 'name' | 'password' | 'phoneNumber' | 'workStatus'
        >
      >
    >,
  ): Promise<void>

  updateAvatar(user: UserDocument, newAvatar: string): Promise<void>
}
