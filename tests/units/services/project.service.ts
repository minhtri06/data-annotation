/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { faker } from '@faker-js/faker'
import mongoose from 'mongoose'

import container from '@src/configs/inversify.config'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { IRawProject } from '@src/models'
import {
  CreateProjectPayload,
  IProjectService,
  IProjectTypeService,
  UpdateProjectPayload,
} from '@src/services'
import { ProjectDocument, ProjectTypeDocument } from '@src/types'
import { generateProject, generateProjectType } from '@tests/fixtures'
import { Mutable, setupTestDb } from '@tests/utils'

const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)
const projectTypeService = container.get<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE)

setupTestDb()

describe('Project service', () => {
  describe('getProjects method', () => {
    let projectType1: ProjectTypeDocument
    let projectType2: ProjectTypeDocument
    let project1: ProjectDocument
    let project2: ProjectDocument
    let project3: ProjectDocument
    beforeEach(async () => {
      projectType1 = await projectTypeService.createProjectType(
        generateProjectType({ name: 'Machine Translation' }),
      )
      projectType2 = await projectTypeService.createProjectType(
        generateProjectType({ name: 'Text Labeling' }),
      )
      project1 = await projectService.createProject(
        generateProject({
          name: 'English to Vietnamese 1',
          projectType: projectType1.id,
        }),
      )
      project2 = await projectService.createProject(
        generateProject({
          name: 'English to Vietnamese 2',
          projectType: projectType2.id,
        }),
      )
      project3 = await projectService.createProject(
        generateProject({
          name: 'Animal labeling',
        }),
      )
    })

    it('should return an array of projects with default query options', async () => {
      const result = await projectService.getProjects({}, {})
      expect(result).toMatchObject({
        data: expect.any(Array),
      })
      expect(result.totalPages).toBeUndefined()
      expect(result.data.length).toBe(3)
      expect(result.data[0].id).toBe(project3.id)
      expect(result.data[1].id).toBe(project2.id)
      expect(result.data[2].id).toBe(project1.id)
    })

    it('should return 1 project if limit is 1', async () => {
      const result = await projectService.getProjects({}, { limit: 1 })
      expect(result.data.length).toBe(1)
      expect(result.data[0].id).toBe(project3.id)
    })

    it('should return 0 project if page is 2', async () => {
      const result = await projectService.getProjects({}, { page: 2 })
      expect(result.data.length).toBe(0)
    })

    it('should return an array [project1] if page is 2 and limit is 2', async () => {
      const result = await projectService.getProjects({}, { page: 2, limit: 2 })
      expect(result.data.length).toBe(1)
      expect(result.data[0].id).toBe(project1.id)
    })

    it('should return total pages if checkPaginate is true', async () => {
      const result = await projectService.getProjects({}, { checkPaginate: true })
      expect(result.totalPages).toBe(1)
    })

    it('should return total pages equal 3 checkPaginate is true and limit is 1', async () => {
      const result = await projectService.getProjects(
        {},
        { checkPaginate: true, limit: 1 },
      )
      expect(result.totalPages).toBe(3)
    })

    it('should be able to sort by name', async () => {
      let result = await projectService.getProjects({}, { sort: 'name' })
      expect(result.data[0].id).toBe(project3.id)

      result = await projectService.getProjects({}, { sort: '-name' })
      expect(result.data[0].id).not.toBe(project3.id)
    })

    it('should be able to sort by createdAt', async () => {
      let result = await projectService.getProjects({}, { sort: 'createdAt' })
      expect(result.data[0].id).toBe(project1.id)

      result = await projectService.getProjects({}, { sort: '-createdAt' })
      expect(result.data[0].id).toBe(project3.id)
    })

    it('should thrown an error if sort un-allow fields', async () => {
      await expect(projectService.getProjects({}, { sort: 'manager' })).rejects.toThrow()
    })
  })

  describe('createProject method', () => {
    let rawProject: CreateProjectPayload
    beforeEach(() => {
      rawProject = generateProject()
    })

    it('should correctly create a new project', async () => {
      const project = await projectService.createProject(rawProject)
      expect(project?.name).toBe(rawProject.name)
      expect(project?.requirement).toBe(rawProject.requirement)
      expect(project?.projectType.toHexString()).toBe(rawProject.projectType)

      const dbProject = await projectService.getProjectById(project._id.toHexString())
      expect(dbProject?.name).toBe(rawProject.name)
      expect(dbProject?.requirement).toBe(rawProject.requirement)
      expect(dbProject?.projectType.toHexString()).toBe(rawProject.projectType)
    })

    it('should create a new project with status is setting up', async () => {
      const project = await projectService.createProject(rawProject)
      expect(project.status).toBe(PROJECT_STATUS.SETTING_UP)
    })

    it('should create a new project with annotationTaskDivision being a empty array', async () => {
      const project = await projectService.createProject(rawProject)
      expect(project.annotationTaskDivision).toEqual(expect.any(Array))
      expect(project.annotationTaskDivision.length).toBe(0)
    })

    it('should create a new project with numberOfSamples being 0', async () => {
      const project = await projectService.createProject(rawProject)
      expect(project.numberOfSamples).toBe(0)
    })

    it("should throw error if project doesn't have any annotation", async () => {
      rawProject.annotationConfig.hasGeneratedTexts = false
      rawProject.annotationConfig.hasLabelSets = false
      rawProject.annotationConfig.individualTextConfigs = [
        {
          hasInlineLabels: false,
          inlineLabels: [],
          hasLabelSets: false,
          labelSets: [],
        },
      ]

      await expect(projectService.createProject(rawProject)).rejects.toThrow()
    })

    it('should throw an error if pass in un-allow fields', async () => {
      const unAllowData: Partial<IRawProject> = {
        status: PROJECT_STATUS.DONE,
        annotationTaskDivision: [],
        numberOfSamples: 123,
        completionTime: new Date(),
      }
      for (const invalidField in unAllowData) {
        await expect(
          projectService.createProject({
            ...rawProject,
            [invalidField]: unAllowData[invalidField as keyof typeof unAllowData],
          }),
        ).rejects.toThrow()
      }
    })

    it('should throw error if required fields are missing', async () => {
      const requiredFields = [
        'name',
        'projectType',
        'requirement',
        'manager',
        'maximumOfAnnotators',
        'annotationConfig',
      ] as const
      for (const field of requiredFields) {
        rawProject = generateProject()
        delete rawProject[field]
        await expect(projectService.createProject(rawProject)).rejects.toThrow()
      }
    })

    it('should throw an error if hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.hasLabelSets = true
      rawProject.annotationConfig.labelSets = []
      await expect(projectService.createProject(rawProject)).rejects.toThrow()
    })

    it('should throw an error if in individualTextConfigs, hasInlineLabels is true but inlineLabels is empty', async () => {
      rawProject.annotationConfig.individualTextConfigs = [
        {
          hasInlineLabels: true,
          inlineLabels: [],
          hasLabelSets: false,
          labelSets: [],
        },
      ]
      await expect(projectService.createProject(rawProject)).rejects.toThrow()
    })

    it('should throw an error if in individualTextConfigs, hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.individualTextConfigs = [
        {
          hasInlineLabels: false,
          inlineLabels: [],
          hasLabelSets: true,
          labelSets: [],
        },
      ]
      await expect(projectService.createProject(rawProject)).rejects.toThrow()
    })
  })

  describe('updateProject method', () => {
    let project: ProjectDocument
    let updatePayload: Mutable<UpdateProjectPayload>
    beforeEach(async () => {
      project = await projectService.createProject(generateProject())
      updatePayload = {
        name: 'Translate English',
        projectType: new mongoose.Types.ObjectId().toHexString(),
        requirement: 'Translate English to Vietnamese',
        description: faker.lorem.paragraph(),
        maximumOfAnnotators: 20,
        annotationConfig: {
          hasLabelSets: false,
          labelSets: [],

          hasGeneratedTexts: true,

          individualTextConfigs: [],
        },
      }
    })

    it('should correctly update a project', async () => {
      await projectService.updateProject(project, updatePayload)

      expect(project.name).toBe(updatePayload.name)
      expect(project.projectType.toHexString()).toBe(updatePayload.projectType)
      expect(project.status).toBe(PROJECT_STATUS.SETTING_UP)

      const dbProject = await projectService.getProjectById(project._id.toHexString())
      expect(dbProject?.name).toBe(updatePayload.name)
      expect(dbProject?.projectType.toHexString()).toBe(updatePayload.projectType)
      expect(dbProject?.status).toBe(PROJECT_STATUS.SETTING_UP)
    })

    it('should throw an error if project status is not "setting up"', async () => {
      project.status = PROJECT_STATUS.ANNOTATING
      await project.save({ validateBeforeSave: false })
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if update un-allow fields', async () => {
      const unAllowPayloads = [
        { manager: new mongoose.Types.ObjectId() },
        { annotationTaskDivision: [{ annotator: new mongoose.Types.ObjectId() }] },
        { numberOfSamples: 100 },
        { status: PROJECT_STATUS.DONE },
        { completionTime: new Date() },
      ]
      for (const unAllowPayload of unAllowPayloads) {
        await expect(
          projectService.updateProject(project, unAllowPayload as UpdateProjectPayload),
        ).rejects.toThrow()
      }
    })

    it('should throw error if maximum of annotator less than 1', async () => {
      updatePayload.maximumOfAnnotators = 0
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if annotation config has no annotation', async () => {
      updatePayload.annotationConfig = {
        hasLabelSets: false,
        labelSets: [],
        hasGeneratedTexts: false,
        individualTextConfigs: [],
      }
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if hasLabelSets is true but labelSets is empty', async () => {
      updatePayload.annotationConfig!.hasLabelSets = true
      updatePayload.annotationConfig!.labelSets = []
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if (in individualTextConfig) hasLabelSets is true but labelSets is empty', async () => {
      updatePayload.annotationConfig!.individualTextConfigs = [
        {
          hasLabelSets: true,
          labelSets: [],
          hasInlineLabels: true,
          inlineLabels: ['Dogs'],
        },
      ]
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if (in individualTextConfig) hasInlineLabels is true but inlineLabels is empty', async () => {
      updatePayload.annotationConfig!.individualTextConfigs = [
        {
          hasLabelSets: false,
          labelSets: [],
          hasInlineLabels: true,
          inlineLabels: [],
        },
      ]
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })

    it('should throw an error if project is modify before update', async () => {
      project.numberOfSamples = 100
      await expect(projectService.updateProject(project, updatePayload)).rejects.toThrow()
    })
  })
})
