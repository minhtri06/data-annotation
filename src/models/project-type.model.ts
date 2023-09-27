import { Schema, model } from 'mongoose'

import { IProjectType } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES } from '../configs/constants'

const projectTypeSchema = new Schema<IProjectType>(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectTypeSchema.plugin(toJSON)

export const ProjectType = model(MODEL_NAMES.PROJECT_TYPE, projectTypeSchema)