import { Schema, model } from 'mongoose'

import { ISample, ISampleModel } from './interfaces'
import { toJSON } from './plugins'
import { MODEL_NAMES, SAMPLE_STATUS } from '../configs/constants'

const sampleSchema = new Schema<ISample>(
  {
    texts: { type: [String], required: true },

    status: { type: String, enum: Object.values(SAMPLE_STATUS), required: true },

    textAnnotation: {
      labelSets: [{ selectedLabels: { type: [String], required: true } }],

      singleTextAnnotation: [
        {
          labelSets: [{ selectedLabels: { type: [String], required: true } }],

          inlineLabels: [
            {
              startAt: { type: Number, required: true },
              endAt: { type: Number, required: true },
            },
          ],
        },
      ],
    },

    generatedTexts: [String],

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
