import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { IProject } from '@src/models/interfaces'
import { CreateProjectPayload } from '@src/services/types'

const { ObjectId } = mongoose.Types

export const generateAnnotationTaskDivision = (length: number) => {
  const annotationTaskDivision: IProject['annotationTaskDivision'] = []
  let sampleIndex = 0
  for (let i = 0; i < length; i++) {
    annotationTaskDivision.push({
      annotator: new ObjectId(),
      startSample: sampleIndex,
      endSample: sampleIndex + 2,
    })
    sampleIndex += 3
  }
  return annotationTaskDivision
}

export const generateIndividualTextConfig = (length: number) => {
  const individualTextConfigs: IProject['annotationConfig']['individualTextConfigs'] = []
  for (let i = 0; i < length; i++) {
    individualTextConfigs.push({
      hasInlineLabels: false,
      inlineLabels: [],
      hasLabelSets: false,
      labelSets: [],
    })
  }
  return individualTextConfigs
}

export const generateProject = (
  overwriteFields: Partial<IProject> = {},
): CreateProjectPayload => {
  return {
    name: 'Context labeling abc',
    projectType: new ObjectId(),
    description: faker.lorem.paragraphs(),
    requirement: faker.lorem.lines(),
    manager: new ObjectId(),
    maximumOfAnnotators: 4,
    annotationConfig: {
      hasLabelSets: true,
      labelSets: [{ isMultiSelected: false, labels: ['negative', 'positive'] }],

      hasGeneratedTexts: false,

      individualTextConfigs: [],
    },
    ...overwriteFields,
  }
}
