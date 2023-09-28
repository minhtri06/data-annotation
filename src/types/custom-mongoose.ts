import { Query, SortOrder, Types } from 'mongoose'
import { IProjectModel, ITokenModel, IUserModel } from '../models/interfaces'

export type TokenDocument = InstanceType<ITokenModel>
export type UserDocument = InstanceType<IUserModel>
export type ProjectDocument = InstanceType<IProjectModel>

export type DocumentId = Types.ObjectId | string

export type SortOption<T = { [key: string]: unknown }> = { [K in keyof T]: SortOrder }
export type SelectOption = Parameters<typeof Query.prototype.select>[0]
export type PopulateOption = Parameters<typeof Query.prototype.populate>[0]
export type QueryOptions<DocType = { [key: string]: unknown }> = {
  sort?: SortOption<DocType>
  page?: number
  limit?: number
  select?: SelectOption
  populate?: PopulateOption
  lean?: boolean
  checkPaginate?: boolean
}
