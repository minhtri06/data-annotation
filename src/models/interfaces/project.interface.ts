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

  maximumOfAnnotators: number

  annotationTaskDivision: {
    annotator: DocumentId
    startSample: number
    endSample: number
  }[]

  numberOfSamples: number

  status: (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

  completionTime?: Date

  annotationConfig: {
    hasLabelSets: boolean
    labelSets: {
      isMultiSelected: boolean
      labels: string[]
    }[]

    hasGeneratedTexts: boolean

    individualTextConfigs: {
      hasLabelSets: boolean
      labelSets: {
        isMultiSelected: boolean
        labels: string[]
      }[]

      hasInlineLabels: boolean
      inlineLabels: string[]
    }[]
  }
}

export interface IProjectModel extends Model<IProject> {}
