import { IUser, IUserModel } from '../../models/interfaces'
import { UserDocument } from '../../types'
import { IModelService } from '../abstracts/model.service'

export interface IUserService extends IModelService<IUser, IUserModel> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>

  createUser(
    body: Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'avatar' | 'monthlyAnnotation'>,
  ): Promise<UserDocument>

  updateUser(
    user: UserDocument,
    updateBody: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'role'>>,
  ): Promise<void>
}
