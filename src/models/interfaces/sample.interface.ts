import { Model } from 'mongoose'

import { ISchema } from './schema.interface'
import { DocumentId } from '../../types'
import { SAMPLE_STATUS } from '../../configs/constants'

export interface ISample extends ISchema {
  texts: string[]

  status: (typeof SAMPLE_STATUS)[keyof typeof SAMPLE_STATUS]

  annotation: {
    labelSets:
      | {
          selectedLabels: string[]
        }[]
      | null

    generatedTexts: string[] | null

    singleTextAnnotation: {
      labelSets:
        | {
            selectedLabels: string[]
          }[]
        | null

      inlineLabels:
        | {
            startAt: number
            endAt: number
          }[]
        | null
    }[]
  }

  comments: {
    body: string
    author: DocumentId
    createdAt: Date
  }
}

export interface ISampleModel extends Model<ISample> {}
