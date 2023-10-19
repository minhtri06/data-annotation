/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'

import { Mutable, setupTestDb } from '@tests/utils'
import setup from '@src/setup'
import container from '@src/configs/inversify.config'
import {
  CreateProjectPayload,
  IProjectService,
  IProjectTypeService,
  ITokenService,
  IUserService,
  UpdateProjectPayload,
} from '@src/services'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { generateProject, generateProjectType, generateUser } from '@tests/fixtures'
import { ROLES } from '@src/configs/role.config'
import { StatusCodes } from 'http-status-codes'
import { ProjectDocument, ProjectTypeDocument, UserDocument } from '@src/models'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)
const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)
const projectTypeService = container.get<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE)

setupTestDb()

let app: Application
let request: SuperTest<Test>
beforeAll(() => {
  app = setup()
  request = supertest(app)
})

describe('Project routes', () => {
  describe('GET /api/v1/projects - Get projects', () => {
    let projectType1: ProjectTypeDocument
    let projectType2: ProjectTypeDocument
    let project1: ProjectDocument
    let project2: ProjectDocument
    let project3: ProjectDocument
    let user: UserDocument
    let accessToken: string
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

      user = await userService.createUser(generateUser())
      accessToken = tokenService.generateAccessToken(user)
    })

    it('should return 200 (ok) and a list of projects with default query options', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .expect(StatusCodes.OK)

      const data = res.body.data
      expect(data).toEqual(expect.any(Array))
      expect(data.length).toBe(3)
      expect(data[0].id).toBe(project3.id)
      expect(data[1].id).toBe(project2.id)
      expect(data[2].id).toBe(project1.id)
    })

    it('should return 1 project if limit is 1', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ limit: 1 })
        .expect(StatusCodes.OK)

      const data = res.body.data
      expect(data).toEqual(expect.any(Array))
      expect(data.length).toBe(1)
    })

    it('should return 0 project if limit is 3 page is 2', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ limit: 3, page: 2 })
        .expect(StatusCodes.OK)

      const data = res.body.data
      expect(data).toEqual(expect.any(Array))
      expect(data.length).toBe(0)
    })

    it('should return 1 project if page is 2 and limit is 2', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ limit: 2, page: 2 })
        .expect(StatusCodes.OK)

      const data = res.body.data
      expect(data).toEqual(expect.any(Array))
      expect(data.length).toBe(1)
    })

    it('should return total pages if checkPaginate is true', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ checkPaginate: true })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(1)
    })

    it('should return total pages equal 3 checkPaginate is true and limit is 1', async () => {
      const res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ checkPaginate: true, limit: 1 })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(3)
    })

    it('should be able to sort by name', async () => {
      let res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ sort: 'name' })
        .expect(StatusCodes.OK)

      expect(res.body.data[0].id).toBe(project3.id)

      res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ sort: '-name' })
        .expect(StatusCodes.OK)

      expect(res.body.data[0].id).not.toBe(project3.id)
    })

    it('should be able to sort by createdAt', async () => {
      let res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ sort: 'createdAt' })
        .expect(StatusCodes.OK)
      expect(res.body.data[0].id).toBe(project1.id)

      res = await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ sort: '-createdAt' })
        .expect(StatusCodes.OK)
      expect(res.body.data[0].id).toBe(project3.id)
    })

    it('should return 400 (bad request) if sort field are not allow', async () => {
      await request
        .get('/api/v1/projects')
        .set('Authorization', accessToken)
        .query({ sort: 'manager' })
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request.get('/api/v1/projects').expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if access token is invalid', async () => {
      await request
        .get('/api/v1/projects')
        .set('Authorization', 'accessToken123')
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('POST /api/v1/projects - Create project', () => {
    let manager: UserDocument
    let managerAccessToken: string
    let rawProject: Omit<Mutable<CreateProjectPayload>, 'manager'>
    beforeEach(async () => {
      manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      managerAccessToken = tokenService.generateAccessToken(manager)

      rawProject = generateProject()
      delete (rawProject as unknown as { manager: unknown }).manager
    })

    it('should return 201 (created) and correctly create a new project', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)

      expect(res.body.project).not.toBeUndefined()
      expect(res.body.project.name).toBe(rawProject.name)
      expect(res.body.project.projectType).toBe(rawProject.projectType)
      expect(res.body.project.requirement).toBe(rawProject.requirement)

      const dbProject = await projectService.getProjectById(res.body.project.id)
      expect(dbProject).not.toBeUndefined()
      expect(dbProject?.name).toBe(rawProject.name)
      expect(dbProject?.projectType.toHexString()).toBe(rawProject.projectType)
      expect(dbProject?.requirement).toBe(rawProject.requirement)
    })

    it('should create a project with manager being the caller if the caller is manager', async () => {
      const manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      const managerAccessToken = tokenService.generateAccessToken(manager)

      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)

      const project = res.body.project
      expect(project.manager).toBe(manager.id)

      const dbProject = await projectService.getProjectById(project.id)
      expect(dbProject?.manager?.toString()).toBe(manager.id)
    })

    it('should create a project with proper initial value', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)

      const project = res.body.project
      expect(project.status).toBe(PROJECT_STATUS.SETTING_UP)
      expect(project.annotationTaskDivision).toEqual([])
      expect(project.numberOfSamples).toBe(0)
      expect(!project.completionTime).toBeTruthy()

      const dbProject = await projectService.getProjectById(res.body.project.id)

      expect(dbProject?.status).toBe(PROJECT_STATUS.SETTING_UP)
      expect(dbProject?.annotationTaskDivision).toEqual([])
      expect(dbProject?.numberOfSamples).toBe(0)
      expect(!dbProject?.completionTime).toBeTruthy()
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .post('/api/v1/projects')
        .send(rawProject)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if access token is invalid', async () => {
      await request
        .post('/api/v1/projects')
        .set('Authorization', 'invalid-access-token')
        .send(rawProject)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 403 (forbidden) if caller is annotator', async () => {
      const annotator = await userService.createUser(
        generateUser({ role: ROLES.ANNOTATOR }),
      )
      const annotatorAccessToken = tokenService.generateAccessToken(annotator)
      await request
        .post('/api/v1/projects')
        .set('Authorization', annotatorAccessToken)
        .send(rawProject)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 400 (bad request) if required fields is missing', async () => {
      const requiredFields = [
        'name',
        'projectType',
        'requirement',
        'maximumOfAnnotators',
        'annotationConfig',
      ] as const
      for (const field of requiredFields) {
        await request
          .post('/api/v1/projects')
          .set('Authorization', managerAccessToken)
          .send({ ...rawProject, [field]: undefined })
          .expect(StatusCodes.BAD_REQUEST)
      }
    })

    it('should return 400 (bad request) if project has no annotation', async () => {
      rawProject.annotationConfig.hasLabelSets = false
      rawProject.annotationConfig.labelSets = []
      rawProject.annotationConfig.hasGeneratedTexts = false
      rawProject.annotationConfig.individualTextConfigs = []
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.hasLabelSets = true
      rawProject.annotationConfig.labelSets = []
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if in individualTextConfigs, hasInlineLabels is true but inlineLabels is empty', async () => {
      rawProject.annotationConfig.individualTextConfigs = [
        {
          hasInlineLabels: true,
          inlineLabels: [],
          hasLabelSets: false,
          labelSets: [],
        },
      ]
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if in individualTextConfigs, hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.individualTextConfigs = [
        {
          hasInlineLabels: true,
          inlineLabels: [],
          hasLabelSets: false,
          labelSets: [],
        },
      ]
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })
  })

  describe('GET /api/v1/projects/:projectId - Get project by id', () => {
    let project: ProjectDocument
    let user: UserDocument
    let accessToken: string
    beforeEach(async () => {
      project = await projectService.createProject(generateProject())
      user = await userService.createUser(generateUser())
      accessToken = tokenService.generateAccessToken(user)
    })

    it('should return 200 (ok) and correct project', async () => {
      const res = await request
        .get('/api/v1/projects/' + project.id)
        .set('Authorization', accessToken)
        .expect(StatusCodes.OK)

      expect(res.body.project.id).toBe(project.id)
      expect(res.body.project.name).toBe(project.name)
    })

    it('should return 404 (not found) if project id does not exist', async () => {
      await request
        .get('/api/v1/projects/' + new mongoose.Types.ObjectId().toHexString())
        .set('Authorization', accessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 (bad request) if project id is invalid', async () => {
      await request
        .get('/api/v1/projects/' + 'invalid-id')
        .set('Authorization', accessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request.get('/api/v1/projects/' + project.id).expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('PATCH /api/v1/projects/:projectId - Update project', () => {
    let project: ProjectDocument
    let manager: UserDocument
    let managerAccessToken: string
    let rawProject: UpdateProjectPayload
    beforeEach(async () => {
      manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      managerAccessToken = tokenService.generateAccessToken(manager)
      project = await projectService.createProject(
        generateProject({
          manager: manager.id,
        }),
      )
      rawProject = {
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

    it('should return 204 (no content) and update project correctly', async () => {
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.NO_CONTENT)

      const dbProject = await projectService.getProjectById(project.id)
      expect(dbProject !== null).toBeTruthy()
      expect(dbProject?.name).toBe(rawProject.name)
      expect(dbProject?.projectType.toHexString()).toBe(rawProject.projectType)
      expect(dbProject?.requirement).toBe(rawProject.requirement)
      expect(dbProject?.description).toBe(rawProject.description)
      expect(dbProject?.maximumOfAnnotators).toBe(rawProject.maximumOfAnnotators)
      expect(dbProject?.annotationConfig).toMatchObject(rawProject.annotationConfig!)
    })

    it('should return 400 (bad request) if update un-allow fields', async () => {
      const unAllowPayloads = [
        { manager: new mongoose.Types.ObjectId() },
        { annotationTaskDivision: [{ annotator: new mongoose.Types.ObjectId() }] },
        { numberOfSamples: 100 },
        { status: PROJECT_STATUS.DONE },
        { completionTime: new Date() },
      ]
      for (const unAllowPayload of unAllowPayloads) {
        await request
          .patch('/api/v1/projects/' + project.id)
          .send(unAllowPayload)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      }
    })

    it("should return 400 (bad request) if project's status is not 'setting up'", async () => {
      project.status = PROJECT_STATUS.ANNOTATING
      await project.save({ validateBeforeSave: false })
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if updating annotationConfig has no annotation', async () => {
      const payload: UpdateProjectPayload = {
        annotationConfig: {
          hasLabelSets: false,
          labelSets: [],
          hasGeneratedTexts: false,
          individualTextConfigs: [
            {
              hasLabelSets: false,
              labelSets: [],
              hasInlineLabels: false,
              inlineLabels: [],
            },
          ],
        },
      }
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(payload)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it("should return 400 (bad request) if updating annotationConfig is conflict (e.g. 'hasLabelSets' is true but 'labelSets' is empty)", async () => {
      const invalidPayloads: UpdateProjectPayload[] = [
        {
          annotationConfig: {
            hasLabelSets: true,
            labelSets: [],
            hasGeneratedTexts: false,
            individualTextConfigs: [],
          },
        },
        {
          annotationConfig: {
            hasLabelSets: false,
            labelSets: [],
            hasGeneratedTexts: false,
            individualTextConfigs: [
              {
                hasLabelSets: true,
                labelSets: [],
                hasInlineLabels: false,
                inlineLabels: [],
              },
            ],
          },
        },
        {
          annotationConfig: {
            hasLabelSets: false,
            labelSets: [],
            hasGeneratedTexts: false,
            individualTextConfigs: [
              {
                hasLabelSets: false,
                labelSets: [],
                hasInlineLabels: true,
                inlineLabels: [],
              },
            ],
          },
        },
      ]
      for (const payload of invalidPayloads) {
        await request
          .patch('/api/v1/projects/' + project.id)
          .send(payload)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      }
    })

    it('should return 400 (bad request) if update a name that already exists in a project type', async () => {
      const project2 = await projectService.createProject(
        generateProject({
          name: 'Label abc 123123213213',
          projectType: project.projectType.toHexString(),
        }),
      )
      await request
        .patch('/api/v1/projects/' + project.id)
        .send({ name: project2.name, projectType: project2.projectType })
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should admin can update project', async () => {
      const admin = await userService.createUser(generateUser({ role: ROLES.ADMIN }))
      const adminAccessToken = tokenService.generateAccessToken(admin)
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.NO_CONTENT)
    })

    it('should return 403 (forbidden) if user is not admin or manager', async () => {
      const annotator = await userService.createUser(
        generateUser({ role: ROLES.ANNOTATOR }),
      )
      const annotatorAccessToken = tokenService.generateAccessToken(annotator)
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 403 (forbidden) if user has manager role but is not manager of the project', async () => {
      const manager2 = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      const manager2AccessToken = tokenService.generateAccessToken(manager2)
      await request
        .patch('/api/v1/projects/' + project.id)
        .send(rawProject)
        .set('Authorization', manager2AccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })
  })
})
