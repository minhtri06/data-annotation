import { Schema, model } from 'mongoose'

import { IProject } from './interfaces'
import { toJSON } from './plugins'

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },

    projectType: { type: Schema.Types.ObjectId, ref: 'ProjectType', required: true },

    description: { type: String },

    requirement: { type: String, required: true },

    manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    numberOfLevel1Annotators: { type: Number, required: true },

    level1AnnotatorDivision: {
      type: [{ annotator: { type: Schema.Types.ObjectId, ref: 'User', required: true } }],
    },

    numberOfLevel2Annotators: { type: Number, required: true },

    assignment: {
      type: {
        performers: { type: [Schema.Types.ObjectId], ref: 'User', required: true },
        startSample: { type: Number, required: true },
        endSample: { type: Number, required: true },
      },
      required: true,
    },

    labelSets: [
      {
        title: { type: String, required: true },
        labels: { type: [String], required: true },
        isMultiSelected: { type: Boolean, required: true },
      },
    ],

    sampleTextConfigs: {
      type: {
        title: { type: String, required: true },
        labelSets: [
          {
            title: { type: String, required: true },
            isMultiSelected: { type: Boolean, required: true },
            labels: { type: [String], required: true },
          },
        ],
        inlineLabels: [String],
      },
      required: true,
    },

    generatedTextTitles: [String],
    numberOfGeneratedTexts: Number,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectSchema.plugin(toJSON)

export const Project = model('Project', projectSchema)
