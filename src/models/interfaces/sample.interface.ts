import { Model } from 'mongoose'

import { ISchema } from './schema.interface'
import { DocumentId } from '../../types'
import { SAMPLE_STATUS } from '../../configs/constants'

export interface ISample extends ISchema {
  texts: string[]

  status: (typeof SAMPLE_STATUS)[keyof typeof SAMPLE_STATUS]

  textAnnotation: {
    labelSets?: {
      selectedLabels: string[]
    }[]

    singleTextAnnotation?: {
      labelSets?: {
        selectedLabels: string[]
      }[]
      inlineLabels?: {
        startAt: number
        endAt: number
      }[]
    }[]
  }

  generatedTexts?: string[]

  comments: {
    body: string
    author: DocumentId
    createdAt: Date
  }
}

export interface ISampleModel extends Model<ISample> {}
