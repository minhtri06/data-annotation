import { Model } from 'mongoose'

import { ISchema } from './schema.interface'

export interface IProjectType extends ISchema {
  name: string
}

export interface IProjectTypeModel extends Model<IProjectType> {}
