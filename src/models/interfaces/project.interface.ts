import { Model } from 'mongoose'

import { DocumentId } from '../../types'
import { ISchema } from './schema.interface'
import { PROJECT_STATUS } from '../../configs/constants'

export interface IProject extends ISchema {
  name: string

  projectType: DocumentId

  requirement: string

  description?: string

  manager: DocumentId

  numberOfLevel1Annotators: number

  level1AnnotatorDivision: {
    annotator: DocumentId
    startSample: number
    endSample: number
  }[]

  numberOfLevel2Annotators: number

  level2AnnotatorDivision: {
    annotator: DocumentId
    startSample: number
    endSample: number
  }[]

  status: (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

  sampleTextConfig: {
    hasLabelSets: boolean
    labelSets?: {
      isMultiSelected: boolean
      labels: string[]
    }
    singleSampleTextConfig: {
      hasLabelSets: boolean
      labelSets?: {
        isMultiSelected: boolean
        labels: string[]
      }[]

      hasInlineLabels: boolean
      inlineLabels?: string[]
    }[]
  }

  hasGeneratedTexts: boolean
}

export interface IProjectModel extends Model<IProject> {}
