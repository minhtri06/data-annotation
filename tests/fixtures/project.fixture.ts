import { faker } from '@faker-js/faker'

import { IProject } from '@src/models/interfaces'
import mongoose from 'mongoose'

const { ObjectId } = mongoose.Types

export const fakeAnnotationTaskDivision = (length: number) => {
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

export const fakeIndividualTextConfig = (length: number) => {
  const singleSampleTextConfig: IProject['annotationConfig']['individualTextConfigs'] = []
  for (let i = 0; i < length; i++) {
    singleSampleTextConfig.push({
      hasInlineLabels: false,
      inlineLabels: [],
      hasLabelSets: false,
      labelSets: [],
    })
  }
  return singleSampleTextConfig
}

export const fakeProject = (
  overwriteFields: Partial<IProject> = {},
): Omit<
  IProject,
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | 'status'
  | 'annotationTaskDivision'
  | 'numberOfSamples'
> => {
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
