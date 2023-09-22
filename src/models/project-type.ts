import { Schema, model } from 'mongoose'

import { IProjectType } from './interfaces'
import { toJSON } from './plugins'

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

export const ProjectType = model('ProjectType', projectTypeSchema)
