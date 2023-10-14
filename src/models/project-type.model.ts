import { Model, Schema, model } from 'mongoose'

import { Paginate, paginatePlugin, toJSONPlugin } from './plugins'
import { MODEL_NAMES } from '@src/constants'

export interface IProjectType {
  name: string

  createdAt: Date
  updatedAt: Date
}

export interface IRawProjectType {
  name: string
}

export interface IProjectTypeModel extends Model<IProjectType> {
  paginate: Paginate<IProjectType>
}

const projectTypeSchema = new Schema<IProjectType, IProjectTypeModel>(
  {
    name: { type: String, unique: true, trim: true, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectTypeSchema.plugin(toJSONPlugin)
projectTypeSchema.plugin(paginatePlugin)

export const ProjectType = model<IProjectType, IProjectTypeModel>(
  MODEL_NAMES.PROJECT_TYPE,
  projectTypeSchema,
)
