import { Schema, model } from 'mongoose'

import { ISample, ISampleModel } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES, SAMPLE_STATUS } from '../configs/constants'

const sampleSchema = new Schema<ISample>(
  {
    texts: { type: [String], required: true, minlength: 1 },

    status: { type: String, enum: Object.values(SAMPLE_STATUS), required: true },

    annotation: {
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

    comments: [
      {
        body: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.USER, required: true },
        createdAt: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

sampleSchema.plugin(toJSON)

export const Sample = model<ISample, ISampleModel>(MODEL_NAMES.SAMPLE, sampleSchema)
