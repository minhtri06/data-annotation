import { Schema, model } from 'mongoose'

import { ISample, ISampleModel } from './interfaces'
import { toJSON } from './plugins'

const sampleSchema = new Schema<ISample>(
  {
    texts: { type: [String], required: true },

    annotations: [
      {
        performer: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        generatedTexts: [String],

        labelSets: [
          {
            selectedLabels: {
              type: [String],
              required: true,
            },
          },
        ],

        textAnnotations: [
          {
            inlineLabels: [
              {
                label: { type: String, required: true },
                startAt: { type: Number, required: true },
                endAt: { type: String, required: true },
              },
            ],

            labelSets: [
              {
                selectedLabels: {
                  type: [String],
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  },
)

sampleSchema.plugin(toJSON)

export const Sample = model<ISample, ISampleModel>('Sample', sampleSchema)
