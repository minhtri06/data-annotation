import container from '@src/configs/inversify.config'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { IProject } from '@src/models/interfaces'
import { IProjectService } from '@src/services/interfaces'
import { CreateProjectPayload } from '@src/services/types'
import { generateProject } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)

setupTestDb()

describe('Project service', () => {
  describe('createProject method', () => {
    let rawProject: CreateProjectPayload
    beforeEach(() => {
      rawProject = generateProject()
    })

    it('should correctly create a new project', async () => {
      const project = await projectService.createProject(rawProject)
      expect(project).toMatchObject(rawProject)

      const dbProject = await projectService.getOneByIdOrFail(project._id)
      expect(dbProject).toMatchObject(rawProject)
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
      const unAllowData: Partial<IProject> = {
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
})
