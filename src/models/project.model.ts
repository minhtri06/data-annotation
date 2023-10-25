import { HydratedDocument, Model, Schema, Types, model } from 'mongoose'

import { Paginate, paginatePlugin, toJSONPlugin, handleErrorPlugin } from './plugins'
import { MODEL_NAMES, PROJECT_PHASES } from '@src/constants'
import { ValidationException } from '@src/services/exceptions'

export interface IProject {
  _id: Types.ObjectId

  name: string

  projectType: Types.ObjectId

  requirement: string

  description?: string

  manager?: Types.ObjectId

  maximumOfAnnotators: number

  taskDivisions: Types.DocumentArray<{
    annotator: Types.ObjectId | null
    startSample?: number
    endSample?: number
  }>

  numberOfSamples: number

  phase: (typeof PROJECT_PHASES)[keyof typeof PROJECT_PHASES]

  completionTime?: Date

  annotationConfig: {
    hasLabelSets: boolean
    labelSets: Types.DocumentArray<{
      isMultiSelected: boolean
      labels: Types.Array<string>
    }>

    hasGeneratedTexts: boolean

    textConfigs: Types.DocumentArray<{
      hasLabelSets: boolean
      labelSets: Types.DocumentArray<{
        isMultiSelected: boolean
        labels: Types.Array<string>
      }>

      hasInlineLabels: boolean
      inlineLabels: Types.Array<string>
    }>
  }

  createdAt: Date
  updatedAt: Date
}

export interface IRawProject {
  name: string

  projectType: string

  requirement: string

  description?: string

  manager?: string

  maximumOfAnnotators: number

  taskDivisions: {
    annotator: string | null
    startSample?: number
    endSample?: number
  }[]

  numberOfSamples: number

  phase: string

  completionTime?: Date

  annotationConfig: {
    hasLabelSets: boolean
    labelSets: { isMultiSelected: boolean; labels: string[] }[]

    hasGeneratedTexts: boolean

    textConfigs: {
      hasLabelSets: boolean
      labelSets: {
        isMultiSelected: boolean
        labels: string[]
      }[]

      hasInlineLabels: boolean
      inlineLabels: string[]
    }[]
  }
}

export interface IProjectModel extends Model<IProject> {
  paginate: Paginate<IProject>
}

export type ProjectDocument = HydratedDocument<IProject>

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

    manager: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.USER,
      required: function () {
        return (this as IProject).phase === PROJECT_PHASES.DONE
      },
    },

    phase: {
      type: String,
      enum: Object.values(PROJECT_PHASES),
      default: PROJECT_PHASES.SETTING_UP,
      validate: function (phase: string) {
        const project = this as unknown as ProjectDocument

        if (project.isNew && phase !== PROJECT_PHASES.SETTING_UP) {
          throw new Error('Invalid project phase')
        }

        if (phase === PROJECT_PHASES.SETTING_UP) {
          if (project.taskDivisions.length !== 0) {
            throw new Error("'setting up' project cannot have division")
          }
        }

        if (phase === PROJECT_PHASES.OPEN_FOR_JOINING) {
          if (project.numberOfSamples === 0) {
            throw new Error('Project has no samples')
          }
        }

        if (phase === PROJECT_PHASES.ANNOTATING || phase === PROJECT_PHASES.DONE) {
          if (project.numberOfSamples === 0) {
            throw new Error('Project has no samples')
          }
          if (project.taskDivisions.length === 0) {
            throw new Error('Cannot start annotating with 0 annotator')
          }
          if (project.numberOfSamples < project.taskDivisions.length) {
            throw new Error('Number of samples is less than number of divisions')
          }
          for (const annotationTask of project.taskDivisions) {
            if (!annotationTask.endSample || !annotationTask.startSample) {
              throw new Error('Missing end sample or start sample in annotation task')
            }
            if (annotationTask.endSample < annotationTask.startSample) {
              throw new Error('endSample cannot less than startSample')
            }
          }
        }
      },
      required: true,
    },

    completionTime: {
      type: Date,
      required: function () {
        return (this as IProject).phase === PROJECT_PHASES.DONE
      },
    },

    maximumOfAnnotators: { type: Number, required: true, min: 1 },

    taskDivisions: {
      type: [
        {
          annotator: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER },
          startSample: { type: Number },
          endSample: { type: Number },
        },
      ],
      default: [],
      validate: function (taskDivisions: IProject['taskDivisions']) {
        const project = this as unknown as IProject

        if (taskDivisions.length > project.maximumOfAnnotators) {
          throw new Error(`taskDivisions.length > maximumOfAnnotators`)
        }

        if (project.phase !== PROJECT_PHASES.ANNOTATING) {
          taskDivisions.forEach((division, index) => {
            if (!division.annotator) {
              throw new Error(`taskDivisions[${index}].annotator is required`)
            }
          })
        }
      },
      required: true,
    },

    numberOfSamples: { type: Number, default: 0, required: true },

    annotationConfig: {
      type: {
        hasLabelSets: { type: Boolean, default: false, required: true },
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

        textConfigs: [
          {
            hasLabelSets: { type: Boolean, default: false, required: true },
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

            hasInlineLabels: { type: Boolean, required: true, default: false },
            inlineLabels: { type: [String], default: [], required: true },
          },
        ],
      },
      default: {},
      required: true,
      validate: function (annotationConfig: IProject['annotationConfig']) {
        // must have at least one annotation
        if (
          !annotationConfig.hasLabelSets &&
          !annotationConfig.hasGeneratedTexts &&
          annotationConfig.textConfigs.every(
            (textConfig) => !textConfig.hasLabelSets && !textConfig.hasInlineLabels,
          )
        ) {
          throw new ValidationException('Project has no annotation config', {
            type: 'project-with-no-annotation',
          })
        }

        // check conflict config
        if (annotationConfig.hasLabelSets) {
          if (annotationConfig.labelSets.length === 0) {
            throw new Error(
              'annotationConfig.hasLabelSets is true but annotationConfig.labelSets is empty',
            )
          }
          annotationConfig.labelSets.forEach((labelSet, index) => {
            if (labelSet.labels.length === 0) {
              throw new Error(
                `annotationConfig.hasLabelSets is true but annotationConfig.labelSets[${index}].labels is empty`,
              )
            }
          })
        }

        // check conflict config in each textConfigs
        for (let i = 0; i < annotationConfig.textConfigs.length; i++) {
          const textConfig = annotationConfig.textConfigs[i]
          if (textConfig.hasLabelSets && textConfig.labelSets.length === 0) {
            throw new Error(
              `hasLabelSets (textConfig[${i}]) is true but labelSets is empty`,
            )
          }
          if (textConfig.hasInlineLabels && textConfig.inlineLabels.length === 0) {
            throw new Error(
              `annotationConfig.textConfig[${i}].hasInlineLabels is true but annotationConfig.textConfig[${i}].inlineLabels is empty`,
            )
          }
        }

        // check number of textConfigs
        if (annotationConfig.textConfigs.length > 50) {
          throw new Error("Number of 'textConfigs' must less than or equal 50")
        }
      },
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

projectSchema.index({ name: 1, projectType: 1 }, { unique: true })

projectSchema.plugin(toJSONPlugin)
projectSchema.plugin(paginatePlugin)
projectSchema.plugin(handleErrorPlugin)

export const Project = model<IProject, IProjectModel>(MODEL_NAMES.PROJECT, projectSchema)
