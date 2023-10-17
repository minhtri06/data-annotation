import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { IRawProject } from '@src/models'
import { Mutable } from '@tests/utils'
import { CreateProjectPayload } from '@src/services'

const { ObjectId } = mongoose.Types

export const generateAnnotationTaskDivision = (length: number) => {
  const annotationTaskDivision: IRawProject['annotationTaskDivision'] = []
  let sampleIndex = 0
  for (let i = 0; i < length; i++) {
    annotationTaskDivision.push({
      annotator: new ObjectId().toHexString(),
      startSample: sampleIndex,
      endSample: sampleIndex + 2,
    })
    sampleIndex += 3
  }
  return annotationTaskDivision
}

export const generateIndividualTextConfig = (length: number) => {
  const individualTextConfigs: IRawProject['annotationConfig']['individualTextConfigs'] =
    []
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
  overwriteFields: Partial<CreateProjectPayload> = {},
): Mutable<CreateProjectPayload> => {
  return {
    name: 'Context labeling abc',
    projectType: new ObjectId().toHexString(),
    description: faker.lorem.paragraphs(),
    requirement: faker.lorem.lines(),
    manager: new ObjectId().toHexString(),
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
