import { IUser } from '../../models/interfaces'
import { IModelService } from '../abstracts/model.service'

export interface IUserService extends IModelService<IUser> {
  comparePassword(hashedPassword: string, rawPassword: string): Promise<boolean>
}
