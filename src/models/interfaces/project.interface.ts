import { Model } from 'mongoose'

import { DocumentId } from '../../types'
import { ISchema } from './schema.interface'

export interface IProject extends ISchema {
  name: string

  projectType: DocumentId

  description: string

  requirement: string

  createdBy: DocumentId

  assignment: {
    performers: DocumentId[]
    startSample: number
    endSample: number
  }

  labelSets: {
    title: string
    isMultiSelected: boolean
    labels: string[]
    isRequired: boolean
  }[]

  sampleTextConfigs: {
    title: string
    labelSets: {
      title: string
      isMultiSelected: boolean
      labels: string[]
      isRequired: boolean
    }[]
    inlineLabels: string[]
  }

  generatedTextTitles: string[]
  numberOfGeneratedTexts: number
}

export interface IProjectModel extends Model<IProject> {}
