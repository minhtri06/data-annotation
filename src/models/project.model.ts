import { Schema, model } from 'mongoose'

import { IProject } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES, PROJECT_STATUS } from '../configs/constants'
import { ProjectDocument } from '@src/types'

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },

    projectType: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.PROJECT_TYPE,
      required: true,
    },

    description: { type: String },

    requirement: { type: String, trim: true, required: true },

    manager: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.SETTING_UP,
      validate: function (value: string) {
        const project = this as unknown as ProjectDocument
        if (project.isNew && value !== PROJECT_STATUS.SETTING_UP) {
          throw new Error('Invalid project status')
        }
        if (
          value === PROJECT_STATUS.ANNOTATING &&
          project.annotationTaskDivision.length === 0
        ) {
          throw new Error('Cannot start annotating with 0 annotator')
        }
      },
      required: true,
    },

    completionTime: {
      type: Date,
      required: function () {
        return (this as IProject).status === PROJECT_STATUS.DONE
      },
    },

    maximumOfAnnotators: { type: Number, required: true, min: 1 },

    annotationTaskDivision: {
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
      default: [],
      validate: function (value: IProject['annotationTaskDivision']) {
        const project = this as unknown as IProject
        if (value.length > project.maximumOfAnnotators) {
          throw new Error(
            `Cannot have more than ${project.maximumOfAnnotators} annotators`,
          )
        }
        if (project.status === PROJECT_STATUS.SETTING_UP && value.length !== 0) {
          throw new Error('Annotator cannot join when project is setting up')
        }
      },
      required: true,
    },

    numberOfSamples: { type: Number, default: 0, required: true },

    annotationConfig: {
      type: {
        hasLabelSets: {
          type: Boolean,
          default: false,
          validate: function (value: boolean) {
            const sampleTextConfig =
              this as unknown as ProjectDocument['annotationConfig']
            if (value && sampleTextConfig.labelSets.length === 0) {
              throw new Error('hasLabelSets is true but got 0 labelSets')
            }
          },
          required: true,
        },
        labelSets: {
          type: [
            {
              isMultiSelected: { type: Boolean, required: true },
              labels: { type: [String], required: true },
            },
          ],
          default: [],
          required: true,
        },

        hasGeneratedTexts: { type: Boolean, default: false, required: true },

        individualTextConfigs: [
          {
            hasLabelSets: {
              type: Boolean,
              default: false,
              validate: function (value: boolean) {
                const singleSampleTextConfig =
                  this as unknown as IProject['annotationConfig']['individualTextConfigs'][number]
                if (value && singleSampleTextConfig.labelSets) {
                  throw new Error(
                    'hasLabelSets (singleSampleTextConfig) equals to true but provide 0 labelSets',
                  )
                }
              },
              required: true,
            },
            labelSets: {
              type: [
                {
                  isMultiSelected: { type: Boolean, required: true },
                  labels: { type: [String], required: true },
                },
              ],
              default: [],
              required: true,
            },

            hasInlineLabels: {
              type: Boolean,
              required: true,
              default: false,
              validate: function (hasInlineLabels: boolean) {
                const singleSampleTextConfig =
                  this as unknown as IProject['annotationConfig']['individualTextConfigs'][number]
                if (hasInlineLabels && singleSampleTextConfig.inlineLabels.length === 0) {
                  throw new Error(
                    'inlineLabels equals to true but provide 0 inlineLabels',
                  )
                }
              },
            },
            inlineLabels: { type: [String], default: [], required: true },
          },
        ],
      },
      default: {},
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectSchema.index({ name: 1, projectType: 1 }, { unique: true })

projectSchema.plugin(toJSON)

export const Project = model(MODEL_NAMES.PROJECT, projectSchema)
