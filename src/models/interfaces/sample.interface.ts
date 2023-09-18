import { Model } from 'mongoose'

import { DocumentId } from '../../types'
import { ISchema } from './schema.interface'

export interface ISample extends ISchema {
  texts: string[]

  annotations: {
    performer: DocumentId
    generatedTexts: string[]
    labelSets: { selectedLabels: string[] }[]
    textAnnotations: {
      inlineLabels: {
        label: string
        startAt: number
        endAt: number
      }[]
      labelSets: { selectedLabels: string[] }[]
    }[]
  }[]
}

export interface ISampleModel extends Model<ISample> {}
