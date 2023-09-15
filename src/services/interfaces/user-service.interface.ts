import { IUser, IUserModel } from '../../models/interfaces'
import { IModelService } from '../abstracts/model.service'

export interface IUserService extends IModelService<IUser, IUserModel> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>
}
