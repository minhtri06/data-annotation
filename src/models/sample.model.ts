import { HydratedDocument, Model, Schema, Types, model } from 'mongoose'

import { Paginate, paginatePlugin, toJSONPlugin, handleErrorPlugin } from './plugins'
import { MODEL_NAMES, SAMPLE_STATUSES } from '../constants'

export interface ISample {
  _id: Types.ObjectId

  texts: Types.Array<string>

  status: (typeof SAMPLE_STATUSES)[keyof typeof SAMPLE_STATUSES]

  number: number

  project: Types.ObjectId

  labelings: Types.Array<string[]> | null

  generatedTexts: Types.Array<string> | null

  textAnnotations: Types.DocumentArray<{
    labelings: Types.Array<string[]> | null

    inlineLabelings: Types.DocumentArray<{
      startAt: number
      endAt: number
      label: string
    }> | null
  }>

  comments: Types.DocumentArray<{
    body: string
    author: Types.ObjectId
    createdAt: Date
  }>

  updatedAt: Date
  createdAt: Date
}

export interface IRawSample {
  texts: string[]

  status: string

  number: number

  project: string

  labelings: string[][] | null

  generatedTexts: string[] | null

  textAnnotations: {
    labelings: string[][] | null

    inlineLabelings: { startAt: number; endAt: number; label: string }[] | null
  }[]

  comments: {
    body: string
    author: string
    createdAt: Date
  }[]

  updatedAt: Date
  createdAt: Date
}

export interface ISampleModel extends Model<ISample> {
  paginate: Paginate<ISample>
}

export type SampleDocument = HydratedDocument<ISample>

const sampleSchema = new Schema<ISample>(
  {
    texts: {
      type: [String],
      validate: function (texts: []) {
        if (texts.length === 0) {
          throw new Error('Sample must have at least one text')
        }
        if (texts.length > 50) {
          throw new Error('Sample cannot have greater than 50 texts')
        }
      },
      required: true,
    },

    number: { type: Number, required: true, min: 1 },

    project: { type: Schema.Types.ObjectId, required: true },

    status: {
      type: String,
      enum: Object.values(SAMPLE_STATUSES),
      default: SAMPLE_STATUSES.NEW,
      validate: function (status: ISample['status']) {
        const sample = this as unknown as SampleDocument

        if (sample.isNew && status !== SAMPLE_STATUSES.NEW) {
          throw new Error("Newly created sample's status must be 'new'")
        }
      },
      required: true,
    },

    labelings: {
      type: [[String]],
      default: () => null,
      validate: function (labelings: ISample['labelings']) {
        const sample = this as unknown as SampleDocument

        if (sample.isNew && !!labelings) {
          throw new Error('Newly created sample cannot have labelings')
        }
      },
    },

    generatedTexts: {
      type: [String],
      default: () => null,
      validate: function (generatedTexts: ISample['generatedTexts']) {
        const sample = this as unknown as SampleDocument

        if (sample.isNew && !!generatedTexts) {
          throw new Error('Newly created sample cannot have generated texts')
        }

        if (generatedTexts && generatedTexts.length > 30) {
          throw new Error('Cannot have more than 30 generated texts')
        }
      },
    },

    textAnnotations: {
      type: [
        {
          labelings: { type: [[String]], default: () => null },

          inlineLabelings: {
            type: [
              {
                startAt: { type: Number, required: true, min: 0 },
                endAt: { type: Number, required: true, min: 0 },
                label: { type: String, required: true },
              },
            ],
            default: () => null,
          },
        },
      ],
      default: [],
      validate: function (textAnnotations: ISample['textAnnotations']) {
        const sample = this as unknown as SampleDocument

        if (sample.isNew && textAnnotations.length !== 0) {
          throw new Error('Newly created sample cannot have text annotations')
        }

        if (textAnnotations.length > sample.texts.length) {
          throw new Error(
            'Number of text annotations can not greater than number of texts',
          )
        }

        for (let i = 0; i < textAnnotations.length; i++) {
          const text = sample.texts[i]

          const inlineLabelings = textAnnotations[i].inlineLabelings
          if (inlineLabelings) {
            for (let j = 0; j < inlineLabelings.length; j++) {
              if (inlineLabelings[j].endAt < inlineLabelings[j].startAt) {
                throw new Error(
                  `At textAnnotations[${i}].inlineLabelings[${j}], endAt < startAt`,
                )
              }
              if (inlineLabelings[j].endAt > text.length) {
                throw new Error(
                  `At textAnnotations[${i}].inlineLabelings[${j}], endAt exceeds texts[${i}] length`,
                )
              }
            }
          }
        }
      },
      required: true,
    },

    comments: {
      type: [
        {
          body: { type: String, required: true },
          author: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
          createdAt: { type: Date, required: true },
        },
      ],
      default: [],
      validate: function (comments: []) {
        const sample = this as unknown as SampleDocument
        if (sample.isNew && comments.length > 0) {
          throw new Error('Newly created sample cannot have comments')
        }
      },
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

sampleSchema.index({ project: 1, number: 1 }, { unique: true })

sampleSchema.plugin(toJSONPlugin)
sampleSchema.plugin(paginatePlugin)
sampleSchema.plugin(handleErrorPlugin)

export const Sample = model<ISample, ISampleModel>(MODEL_NAMES.SAMPLE, sampleSchema)
