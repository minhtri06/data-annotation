import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { SAMPLE_STATUS } from '@src/constants'
import { IRawSample } from '@src/models'

const { ObjectId } = mongoose.Types

export const generateSample = (
  overwriteFields: Partial<IRawSample> = {},
): Omit<IRawSample, '_id' | 'createdAt' | 'updatedAt' | 'annotation' | 'comments'> => {
  return {
    texts: [faker.lorem.paragraph(), faker.lorem.paragraph()],
    project: new mongoose.Types.ObjectId().toHexString(),
    status: SAMPLE_STATUS.NEW,
    ...overwriteFields,
  }
}

export const generateSampleComments = (length: number) => {
  const comments: IRawSample['comments'] = []
  for (let i = 0; i < length; i++) {
    comments.push({
      author: new ObjectId().toHexString(),
      createdAt: new Date(),
      body: faker.lorem.lines(),
    })
  }
  return comments
}
