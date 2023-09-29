import { Schema, model } from 'mongoose'

import { ISample, ISampleModel } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES, SAMPLE_STATUS } from '../configs/constants'
import { SampleDocument } from '@src/types'

const sampleSchema = new Schema<ISample>(
  {
    texts: {
      type: [String],
      validate: function (texts: []) {
        if (texts.length === 0) {
          throw new Error('Sample must have at least one test')
        }
      },
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(SAMPLE_STATUS),
      validate: function (status: ISample['status']) {
        const sample = this as unknown as SampleDocument
        if (sample.isNew && status !== SAMPLE_STATUS.NEW) {
          throw new Error("Newly created sample's status must be new status")
        }
      },
      required: true,
    },

    annotation: {
      type: {
        labelSets: {
          type: [{ selectedLabels: { type: [String], required: true } }],
          default: null,
        },

        generatedTexts: { type: [String], default: null },

        singleTextAnnotation: {
          type: [
            {
              labelSets: {
                type: [{ selectedLabels: { type: [String], required: true } }],
                default: null,
              },

              inlineLabels: {
                type: [
                  {
                    startAt: { type: Number, required: true },
                    endAt: { type: Number, required: true },
                  },
                ],
                default: null,
              },
            },
          ],
          default: [],
          required: true,
        },
      },
      validate: function (annotation: ISample['annotation']) {
        const sample = this as unknown as SampleDocument
        if (sample.isNew && annotation) {
          throw new Error('Newly created sample cannot have annotation')
        }
      },
      default: null,
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

sampleSchema.plugin(toJSON)

export const Sample = model<ISample, ISampleModel>(MODEL_NAMES.SAMPLE, sampleSchema)
