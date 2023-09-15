import { Types } from 'mongoose'
import { ITokenModel, IUserModel } from '../models/interfaces'

export type DocumentId = Types.ObjectId | string

export type TokenDocument = InstanceType<ITokenModel>
export type UserDocument = InstanceType<IUserModel>
