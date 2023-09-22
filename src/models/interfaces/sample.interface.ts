import { Model } from 'mongoose'

import { ISchema } from './schema.interface'

export interface ISample extends ISchema {
  texts: string[]

  textAnnotation: {
    generatedTexts?: string[]

    labelSets?: {
      selectedLabels: string[]
    }[]

    detailAnnotation?: {
      labelSets?: {
        selectedLabels: string[]
      }[]
      inlineLabels?: {
        startAt: number
        endAt: number
      }[]
    }[]
  }
}

export interface ISampleModel extends Model<ISample> {}
