import { HydratedDocument, Model, Schema, model } from 'mongoose'

import { Paginate, paginatePlugin, toJSONPlugin, handleErrorPlugin } from './plugins'
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

export type ProjectTypeDocument = HydratedDocument<IProjectType>

const projectTypeSchema = new Schema<IProjectType, IProjectTypeModel>(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      maxlength: 100,
      minlength: 1,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectTypeSchema.plugin(toJSONPlugin)
projectTypeSchema.plugin(paginatePlugin)
projectTypeSchema.plugin(handleErrorPlugin)

export const ProjectType = model<IProjectType, IProjectTypeModel>(
  MODEL_NAMES.PROJECT_TYPE,
  projectTypeSchema,
)
