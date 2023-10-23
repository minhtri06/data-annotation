import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import { IRawProject, SampleDocument, UserDocument } from '@src/models'
import { Mutable } from '@tests/utils'
import { CreateProjectPayload, IProjectService, IUserService } from '@src/services'
import container from '@src/configs/inversify.config'
import { TYPES } from '@src/constants'
import { generateUser } from './user.fixture'
import { ROLES } from '@src/configs/role.config'
import { ISampleService } from '@src/services/sample.service.interface'

const { ObjectId } = mongoose.Types
const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)
const sampleService = container.get<ISampleService>(TYPES.SAMPLE_SERVICE)

export const generateTaskDivisions = (length: number) => {
  const taskDivisions: IRawProject['taskDivisions'] = []
  let sampleIndex = 0
  for (let i = 0; i < length; i++) {
    taskDivisions.push({
      annotator: new ObjectId().toHexString(),
      startSample: sampleIndex,
      endSample: sampleIndex + 2,
    })
    sampleIndex += 3
  }
  return taskDivisions
}

export const generateIndividualTextConfig = (length: number) => {
  const textConfigs: IRawProject['annotationConfig']['textConfigs'] = []
  for (let i = 0; i < length; i++) {
    textConfigs.push({
      hasInlineLabels: false,
      inlineLabels: [],
      hasLabelSets: false,
      labelSets: [],
    })
  }
  return textConfigs
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

      textConfigs: [],
    },
    ...overwriteFields,
  }
}

export const createSettingUpPhaseProject = async ({
  numberOfSamples,
  numberOfSampleTexts = 1,
  projectOverwrite,
}: {
  numberOfSamples: number
  numberOfSampleTexts?: number
  projectOverwrite?: Partial<CreateProjectPayload>
}) => {
  const manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))

  const project = await projectService.createProject(
    generateProject({ ...projectOverwrite, manager: manager._id.toHexString() }),
  )

  const samples: SampleDocument[] = []
  for (let i = 0; i < numberOfSamples; i++) {
    const texts = []
    for (let j = 0; j < numberOfSampleTexts; j++) {
      texts.push(faker.lorem.paragraph())
    }
    samples.push(await sampleService.insertSampleToProject(project, texts))
  }

  return { manager, project, samples }
}

export const createOpenForJoiningPhaseProject = async ({
  numberOfAnnotators,
  numberOfSamples,
  numberOfSampleTexts,
  projectOverwrite,
}: {
  numberOfAnnotators: number
  numberOfSamples: number
  numberOfSampleTexts?: number
  projectOverwrite?: Partial<CreateProjectPayload>
}) => {
  const { manager, project, samples } = await createSettingUpPhaseProject({
    numberOfSamples,
    projectOverwrite,
    numberOfSampleTexts,
  })

  await projectService.turnProjectToNextPhase(project)

  const annotators: UserDocument[] = []
  for (let i = 0; i < numberOfAnnotators; i++) {
    annotators.push(await userService.createUser(generateUser({ role: ROLES.ANNOTATOR })))
  }
  for (let i = 0; i < numberOfAnnotators; i++) {
    await projectService.joinProject(project, annotators[i]._id.toHexString())
  }

  return { project, manager, annotators, samples }
}

export const createAnnotatingPhaseProject = async ({
  numberOfAnnotators,
  numberOfSamples,
  projectOverwrite,
  numberOfSampleTexts,
}: {
  numberOfAnnotators: number
  numberOfSamples: number
  numberOfSampleTexts?: number
  projectOverwrite?: Partial<CreateProjectPayload>
}) => {
  const { project, manager, annotators, samples } =
    await createOpenForJoiningPhaseProject({
      numberOfAnnotators,
      numberOfSamples,
      numberOfSampleTexts,
      projectOverwrite,
    })

  await projectService.turnProjectToNextPhase(project)

  return { project, manager, annotators, samples }
}
