import { Model } from 'mongoose'

import { DocumentId } from '../../types'
import { ISchema } from './schema.interface'
import { PROJECT_STATUS } from '../../configs/constant.config'

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
    labelSets?: {
      isMultiSelected: boolean
      labels: string[]
    }
    detailConfigs?: {
      labelSets?: {
        isMultiSelected: boolean
        labels: string[]
      }[]
      inlineLabels: string[]
    }[]
  }

  hasGeneratedTexts: boolean
}

export interface IProjectModel extends Model<IProject> {}
