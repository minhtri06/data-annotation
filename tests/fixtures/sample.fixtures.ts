import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { SAMPLE_STATUSES, TYPES } from '@src/constants'
import { IRawSample, ISampleModel, ProjectDocument } from '@src/models'
import container from '@src/configs/inversify.config'

const { ObjectId } = mongoose.Types
const Sample = container.get<ISampleModel>(TYPES.SAMPLE_MODEL)

export const generateSample = (
  overwriteFields: Partial<IRawSample> = {},
): Pick<IRawSample, 'texts' | 'status' | 'number' | 'project'> => {
  return {
    texts: [faker.lorem.paragraph(), faker.lorem.paragraph()],
    project: new mongoose.Types.ObjectId().toHexString(),
    status: SAMPLE_STATUSES.NEW,
    number: 1,
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

export const insertSamplesToProject = async (
  project: ProjectDocument,
  textsArray: string[][],
) => {
  let number = project.numberOfSamples
  await Sample.insertMany(
    textsArray.map((texts) => {
      number++
      return {
        texts,
        project: project._id,
        number,
      }
    }),
  )
  project.numberOfSamples = number
  await project.save()
}
