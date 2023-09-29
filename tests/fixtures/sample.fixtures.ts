import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { SAMPLE_STATUS } from '@src/configs/constants'
import { ISample } from '@src/models/interfaces'

const { ObjectId } = mongoose.Types

export const generateSample = (
  overwriteFields: Partial<ISample> = {},
): Omit<ISample, '_id' | 'createdAt' | 'updatedAt' | 'annotation' | 'comments'> => {
  return {
    texts: [faker.lorem.paragraph(), faker.lorem.paragraph()],
    status: SAMPLE_STATUS.NEW,
    ...overwriteFields,
  }
}

export const generateSampleComments = (length: number) => {
  const comments: ISample['comments'] = []
  for (let i = 0; i < length; i++) {
    comments.push({
      author: new ObjectId(),
      createdAt: new Date(),
      body: faker.lorem.lines(),
    })
  }
  return comments
}
