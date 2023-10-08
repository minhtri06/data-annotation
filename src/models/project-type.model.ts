import { Schema, model } from 'mongoose'

import { IProjectType } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES } from '../constants'

const projectTypeSchema = new Schema<IProjectType>(
  {
    name: { type: String, unique: true, trim: true, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectTypeSchema.plugin(toJSON)

export const ProjectType = model(MODEL_NAMES.PROJECT_TYPE, projectTypeSchema)
