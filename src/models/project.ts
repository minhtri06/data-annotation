import { Schema, model } from 'mongoose'

import { IProject } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES, PROJECT_STATUS } from '../configs/constants'

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },

    projectType: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.PROJECT_TYPE,
      required: true,
    },

    description: { type: String },

    requirement: { type: String, required: true },

    manager: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },

    numberOfLevel1Annotators: { type: Number, required: true },

    level1AnnotatorDivision: {
      type: [
        {
          annotator: {
            type: Schema.Types.ObjectId,
            ref: MODEL_NAMES.USER,
            required: true,
          },
          startSample: { type: Number, required: true },
          endSample: { type: Number, required: true },
        },
      ],
      required: true,
    },

    numberOfLevel2Annotators: { type: Number, required: true },

    level2AnnotatorDivision: {
      type: [
        {
          annotator: {
            type: Schema.Types.ObjectId,
            ref: MODEL_NAMES.USER,
            required: true,
          },
          startSample: { type: Number, required: true },
          endSample: { type: Number, required: true },
        },
      ],
      required: true,
    },

    status: { type: String, enum: Object.values(PROJECT_STATUS), required: true },

    sampleTextConfig: {
      type: {
        hasLabelSets: { type: Boolean, required: true },
        labelSets: [
          {
            isMultiSelected: { type: Boolean, required: true },
            labels: { type: [String], required: true },
          },
        ],

        singleSampleTextConfig: [
          {
            hasLabelSets: { type: Boolean, required: true },
            labelSets: [
              {
                isMultiSelected: { type: Boolean, required: true },
                labels: { type: [String], required: true },
              },
            ],

            hasInlineLabels: { type: Boolean, required: true },
            inlineLabels: [String],
          },
        ],
      },
      required: true,
    },

    hasGeneratedTexts: { type: Boolean, required: true },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectSchema.plugin(toJSON)

export const Project = model(MODEL_NAMES.PROJECT, projectSchema)
