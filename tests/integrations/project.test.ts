/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import fs from 'fs'

import { Mutable, setupTestDb } from '@tests/utils'
import setup from '@src/setup'
import container from '@src/configs/inversify.config'
import {
  CreateProjectPayload,
  IProjectService,
  IProjectTypeService,
  ISampleService,
  ITokenService,
  IUserService,
  UpdateProjectPayload,
} from '@src/services'
import { PROJECT_PHASES, SAMPLE_STATUSES, TYPES } from '@src/constants'
import {
  createAdminUser,
  createAnnotatingPhaseProject,
  createManagerUser,
  createOpenForJoiningPhaseProject,
  createSettingUpPhaseProject,
  generateProject,
  generateProjectType,
  generateUser,
} from '@tests/fixtures'
import { ROLES } from '@src/configs/role.config'
import { StatusCodes } from 'http-status-codes'
import {
  IProjectModel,
  IRawSample,
  ISampleModel,
  IUserModel,
  ProjectDocument,
  ProjectTypeDocument,
  SampleDocument,
  UserDocument,
} from '@src/models'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)
const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)
const sampleService = container.get<ISampleService>(TYPES.SAMPLE_SERVICE)
const projectTypeService = container.get<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE)
const User = container.get<IUserModel>(TYPES.USER_MODEL)
const Sample = container.get<ISampleModel>(TYPES.SAMPLE_MODEL)
const Project = container.get<IProjectModel>(TYPES.PROJECT_MODEL)

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

    it('should create a project with manager is the caller if he/she has manager role', async () => {
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

    it('should create a project with manager is undefined if the caller is admin', async () => {
      const admin = await createAdminUser()
      const adminAccessToken = tokenService.generateAccessToken(admin)
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', adminAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)

      expect(res.body.project.manager).toBeUndefined()
    })

    it('should create a project with proper initial value', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)

      const project = res.body.project
      expect(project.phase).toBe(PROJECT_PHASES.SETTING_UP)
      expect(project.taskDivisions).toEqual([])
      expect(project.numberOfSamples).toBe(0)
      expect(!project.completionTime).toBeTruthy()

      const dbProject = await projectService.getProjectById(res.body.project.id)

      expect(dbProject?.phase).toBe(PROJECT_PHASES.SETTING_UP)
      expect(dbProject?.taskDivisions).toEqual([])
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

    it('should return 403 (forbidden) if caller not admin or manager', async () => {
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
      rawProject.annotationConfig.textConfigs = []
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

    it('should return 400 (bad request) if in textConfigs, hasInlineLabels is true but inlineLabels is empty', async () => {
      rawProject.annotationConfig.textConfigs = [
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

    it('should return 400 (bad request) if in textConfigs, hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.textConfigs = [
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

    it('should be able to create labeling project', async () => {
      rawProject.annotationConfig = {
        hasLabelSets: true,
        labelSets: [
          { isMultiSelected: false, labels: ['Negative', 'Positive'] },
          {
            isMultiSelected: true,
            labels: [
              'About phones',
              'About computers',
              'About monitors',
              'About keyboards',
              'About headphones',
            ],
          },
        ],
        hasGeneratedTexts: false,
        textConfigs: [],
      }
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)
    })

    it('should be able to create text generation project', async () => {
      rawProject.annotationConfig = {
        hasLabelSets: false,
        labelSets: [],
        hasGeneratedTexts: true,
        textConfigs: [],
      }
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)
    })

    it('should be able to create project with labeling in specific texts', async () => {
      rawProject.annotationConfig = {
        hasLabelSets: false,
        labelSets: [],
        hasGeneratedTexts: false,
        textConfigs: [
          {
            hasLabelSets: true,
            labelSets: [
              { isMultiSelected: false, labels: ['Negative', 'Positive'] },
              {
                isMultiSelected: true,
                labels: [
                  'About phones',
                  'About computers',
                  'About monitors',
                  'About keyboards',
                  'About headphones',
                ],
              },
            ],
            hasInlineLabels: false,
            inlineLabels: [],
          },
          {
            hasLabelSets: true,
            labelSets: [
              { isMultiSelected: false, labels: ['Negative', 'Positive'] },
              {
                isMultiSelected: true,
                labels: [
                  'About phones',
                  'About computers',
                  'About monitors',
                  'About keyboards',
                  'About headphones',
                ],
              },
            ],
            hasInlineLabels: false,
            inlineLabels: [],
          },
        ],
      }
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)
    })

    it('should be able to create project with inline labeling in specific texts', async () => {
      rawProject.annotationConfig = {
        hasLabelSets: true,
        labelSets: [
          { isMultiSelected: false, labels: ['Negative', 'Positive'] },
          {
            isMultiSelected: true,
            labels: [
              'About phones',
              'About computers',
              'About monitors',
              'About keyboards',
              'About headphones',
            ],
          },
        ],
        hasGeneratedTexts: true,
        textConfigs: [
          {
            hasLabelSets: true,
            labelSets: [
              { isMultiSelected: false, labels: ['Negative', 'Positive'] },
              {
                isMultiSelected: true,
                labels: [
                  'About phones',
                  'About computers',
                  'About monitors',
                  'About keyboards',
                  'About headphones',
                ],
              },
            ],
            hasInlineLabels: false,
            inlineLabels: [],
          },
          {
            hasLabelSets: false,
            labelSets: [],
            hasInlineLabels: true,
            inlineLabels: ['Dogs', 'Cats', 'Tigers', 'Lions'],
          },
        ],
      }
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)
    })

    it('should be able to create mix annotation project', async () => {
      rawProject.annotationConfig = {
        hasLabelSets: false,
        labelSets: [],
        hasGeneratedTexts: false,
        textConfigs: [
          {
            hasLabelSets: false,
            labelSets: [],
            hasInlineLabels: false,
            inlineLabels: [],
          },
          {
            hasLabelSets: false,
            labelSets: [],
            hasInlineLabels: true,
            inlineLabels: ['Dogs', 'Cats', 'Tigers', 'Lions'],
          },
        ],
      }
      await request
        .post('/api/v1/projects')
        .set('Authorization', managerAccessToken)
        .send(rawProject)
        .expect(StatusCodes.CREATED)
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

  describe('PATCH /api/v1/projects/:projectId - Update project by id', () => {
    let manager: UserDocument
    let managerAccessToken: string

    let project: ProjectDocument

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

          textConfigs: [],
        },
      }
    })

    it('should return 204 (ok) and update project correctly', async () => {
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
        { taskDivisions: [{ annotator: new mongoose.Types.ObjectId() }] },
        { numberOfSamples: 100 },
        { phase: PROJECT_PHASES.DONE },
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
      project.phase = PROJECT_PHASES.ANNOTATING
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
          textConfigs: [
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
            textConfigs: [],
          },
        },
        {
          annotationConfig: {
            hasLabelSets: false,
            labelSets: [],
            hasGeneratedTexts: false,
            textConfigs: [
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
            textConfigs: [
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

    it('should return 204 (no content) if caller is admin', async () => {
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

  describe('POST /api/v1/projects/:projectId/samples/upload-samples - Load samples', () => {
    let manager: UserDocument
    let managerAccessToken: string

    let project: ProjectDocument

    const dataPath = __dirname + '/../fixtures/files/data.csv'
    const dataRows = 14

    beforeEach(async () => {
      manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      managerAccessToken = tokenService.generateAccessToken(manager)

      project = await projectService.createProject(
        generateProject({ manager: manager.id }),
      )
    })

    it('should return 204 (no content) and load samples correctly', async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', managerAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.NO_CONTENT)

      // wait 2 for some callback in the process
      await new Promise((res) => setTimeout(res, 2000))
      const samples = await Sample.find({ project: project._id })
      expect(samples.length).toBe(dataRows)
    })

    it('should delete sample file after load it content to project', async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', managerAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.NO_CONTENT)

      await new Promise((res) => setTimeout(res, 2000))
      const files = fs.readdirSync('./temp')
      expect(files.length).toBe(0)
    })

    it('should allow admin to call', async () => {
      const admin = await userService.createUser(generateUser({ role: ROLES.ADMIN }))
      const adminAccessToken = tokenService.generateAccessToken(admin)

      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', adminAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.NO_CONTENT)

      // wait 2 for some callback in the process
      await new Promise((res) => setTimeout(res, 2000))
      const samples = await Sample.find({ project: project._id })
      expect(samples.length).toBe(dataRows)
    })

    it("should allow project's manager to call", async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', managerAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.NO_CONTENT)

      await new Promise((res) => setTimeout(res, 2000))
      const samples = await Sample.find({ project: project._id })
      expect(samples.length).toBe(dataRows)
    })

    it('should return 403 (forbidden) if caller is manager but not manager of that project', async () => {
      const manager2 = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      const manager2AccessToken = tokenService.generateAccessToken(manager2)
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', manager2AccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 403 (forbidden) if caller is annotator', async () => {
      const annotator = await userService.createUser(
        generateUser({ role: ROLES.ANNOTATOR }),
      )
      const annotatorAccessToken = tokenService.generateAccessToken(annotator)
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', annotatorAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 400 (bad request) if data file is missing', async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 404 (not found) if project id does not exist', async () => {
      await request
        .post(
          `/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/samples/upload-samples`,
        )
        .set('Authorization', managerAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.NOT_FOUND)
    })

    it("should return 400 (bad request) if project's id is invalid", async () => {
      await request
        .post(`/api/v1/projects/invalid-mongo-id/samples/upload-samples`)
        .set('Authorization', managerAccessToken)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if access token is invalid', async () => {
      await request
        .post(`/api/v1/projects/${project.id}/samples/upload-samples`)
        .set('Authorization', 'access-token')
        .attach('sample:sample-data', dataPath)
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('PATCH /api/v1/projects/:projectId/phases - Turn project to next phase', () => {
    describe("When project is in 'setting up' phase", () => {
      let manager: UserDocument
      let managerAccessToken: string
      let project: ProjectDocument

      beforeEach(async () => {
        const result = await createSettingUpPhaseProject({ numberOfSamples: 3 })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        project = result.project
      })

      it("should return 200 (ok) and turn project to 'open for joining phase'", async () => {
        const res = await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        expect(res.body.currentPhase).toBe(PROJECT_PHASES.OPEN_FOR_JOINING)
        const dbProject = await Project.findById(project.id)
        expect(dbProject?.phase).toBe(PROJECT_PHASES.OPEN_FOR_JOINING)
      })

      it('should return 400 (bad request) if project has no samples', async () => {
        const result = await createSettingUpPhaseProject({ numberOfSamples: 0 })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        project = result.project

        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe("When project is in 'open for joining' phase", () => {
      let manager: UserDocument
      let managerAccessToken: string
      let project: ProjectDocument

      beforeEach(async () => {
        const result = await createOpenForJoiningPhaseProject({
          numberOfSamples: 7,
          numberOfAnnotators: 4,
        })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        project = result.project
      })

      it("should return 200 (ok) and turn project to 'annotating' phase", async () => {
        const res = await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        expect(res.body.currentPhase).toBe(PROJECT_PHASES.ANNOTATING)
        const dbProject = await Project.findById(project.id)
        expect(dbProject?.phase).toBe(PROJECT_PHASES.ANNOTATING)
      })

      it('should return 200 (ok) and establish divisions', async () => {
        const res = await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        expect(res.body.currentPhase).toBe(PROJECT_PHASES.ANNOTATING)
        const dbProject = await Project.findById(project.id)
        expect(dbProject).not.toBeNull()
        expect(dbProject!.taskDivisions.length > 0).toBeTruthy()
        for (const division of dbProject!.taskDivisions) {
          expect(typeof division.startSample === 'number').toBeTruthy()
          expect(typeof division.endSample === 'number').toBeTruthy()
        }
      })

      it('should return 400 (bad request) if project has no division', async () => {
        const result = await createOpenForJoiningPhaseProject({
          numberOfSamples: 7,
          numberOfAnnotators: 0, // no divisions
        })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        project = result.project

        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe("When project is in 'annotating' phase", () => {
      let manager: UserDocument
      let managerAccessToken: string
      let samples: SampleDocument[]
      let project: ProjectDocument
      let annotators: UserDocument[]

      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfSamples: 7,
          numberOfAnnotators: 4,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: false,
              labelSets: [],
              hasGeneratedTexts: true,
              textConfigs: [],
            },
          },
        })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        samples = result.samples
        project = result.project
        annotators = result.annotators
      })

      it("should return 200 (ok) and turn project's phase to 'done' if all sample is annotated", async () => {
        await Promise.all(
          samples.map((sample) => {
            return sampleService.annotateSample(project, sample, {
              labelings: null,
              generatedTexts: [faker.lorem.paragraph()],
              textAnnotations: [],
            })
          }),
        )

        const res = await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        expect(res.body.currentPhase).toBe(PROJECT_PHASES.DONE)
        const dbProject = await Project.findById(project.id)
        expect(dbProject?.phase).toBe(PROJECT_PHASES.DONE)
      })

      it('should update completion time', async () => {
        await Promise.all(
          samples.map((sample) => {
            return sampleService.annotateSample(project, sample, {
              labelings: null,
              generatedTexts: [faker.lorem.paragraph()],
              textAnnotations: [],
            })
          }),
        )

        const res = await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        expect(res.body.currentPhase).toBe(PROJECT_PHASES.DONE)
        const dbProject = await Project.findById(project.id)
        expect(dbProject?.completionTime).toBeInstanceOf(Date)
      })

      it('should return 400 (bad request) if samples are not annotated', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if all samples is annotated but some of them are marked as a mistake', async () => {
        await Promise.all(
          samples.map((sample) => {
            return sampleService.annotateSample(project, sample, {
              labelings: null,
              generatedTexts: [faker.lorem.paragraph()],
              textAnnotations: [],
            })
          }),
        )
        await sampleService.markSampleAsAMistake(samples[0])

        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should correctly update monthly annotations of user', async () => {
        await Promise.all(
          samples.map((sample) => {
            return sampleService.annotateSample(project, sample, {
              labelings: null,
              generatedTexts: [faker.lorem.paragraph()],
              textAnnotations: [],
            })
          }),
        )

        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        const annotator1 = await User.findById(annotators[0].id)
        const annotator2 = await User.findById(annotators[1].id)
        const annotator3 = await User.findById(annotators[2].id)
        const annotator4 = await User.findById(annotators[3].id)

        const now = new Date()
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()

        expect(annotator1?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator1?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator1?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(2)

        expect(annotator2?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator2?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator2?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(2)

        expect(annotator3?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator3?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator3?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(2)

        expect(annotator4?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator4?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator4?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(1)
      })

      it('should correctly update monthly annotations of user if user already has month annotation', async () => {
        await Promise.all(
          samples.map((sample) => {
            return sampleService.annotateSample(project, sample, {
              labelings: null,
              generatedTexts: [faker.lorem.paragraph()],
              textAnnotations: [],
            })
          }),
        )
        const now = new Date()
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()

        annotators[0].monthlyAnnotations.push({
          month: thisMonth - 1,
          year: thisYear,
          annotationTotal: 123,
        })
        await annotators[0].save()
        annotators[1].monthlyAnnotations.push({
          month: thisMonth,
          year: thisYear,
          annotationTotal: 123,
        })
        await annotators[1].save()

        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.OK)

        const annotator1 = await User.findById(annotators[0].id)
        const annotator2 = await User.findById(annotators[1].id)
        const annotator3 = await User.findById(annotators[2].id)
        const annotator4 = await User.findById(annotators[3].id)

        expect(annotator1?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator1?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator1?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(2)

        expect(annotator2?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator2?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator2?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(125)

        expect(annotator3?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator3?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator3?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(2)

        expect(annotator4?.monthlyAnnotations.at(-1)?.month).toBe(thisMonth)
        expect(annotator4?.monthlyAnnotations.at(-1)?.year).toBe(thisYear)
        expect(annotator4?.monthlyAnnotations.at(-1)?.annotationTotal).toBe(1)
      })
    })

    describe('Overall tests', () => {
      let manager: UserDocument
      let managerAccessToken: string
      let project: ProjectDocument

      beforeEach(async () => {
        const result = await createSettingUpPhaseProject({ numberOfSamples: 3 })
        manager = result.manager
        managerAccessToken = tokenService.generateAccessToken(manager)
        project = result.project
      })

      it('should return 401 (unauthorized) if access token is missing', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .expect(StatusCodes.UNAUTHORIZED)
      })

      it('should return 401 (unauthorized) if access token is invalid', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/phases`)
          .set('Authorization', 'invalid-access-token')
          .expect(StatusCodes.UNAUTHORIZED)
      })

      it('should return 404 (not found) if project id does not exist', async () => {
        await request
          .patch(`/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.NOT_FOUND)
      })

      it('should return 400 (bad request) if project id is invalid mongo id', async () => {
        await request
          .patch(`/api/v1/projects/aaaaaabbbbbbb-invalid-mongo-oaj-id/phases`)
          .set('Authorization', managerAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      })
    })
  })

  describe('PATCH /api/v1/projects/:projectId/join-project - Join to project', () => {
    let manager: UserDocument
    let annotator: UserDocument
    let annotatorAccessToken: string

    let project: ProjectDocument

    beforeEach(async () => {
      manager = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      annotator = await userService.createUser(generateUser({ role: ROLES.ANNOTATOR }))
      annotatorAccessToken = tokenService.generateAccessToken(annotator)

      project = await projectService.createProject(
        generateProject({ manager: manager.id }),
      )
      // set project in joining phase
      await Sample.insertMany([
        { texts: ['Text 1', 'Text 2'], project: project._id, number: 1 },
        { texts: ['Text 1', 'Text 2'], project: project._id, number: 2 },
        { texts: ['Text 1', 'Text 2'], project: project._id, number: 3 },
        { texts: ['Text 1', 'Text 2'], project: project._id, number: 4 },
      ])
      project.numberOfSamples = 4
      project.phase = PROJECT_PHASES.OPEN_FOR_JOINING
      await project.save()
    })

    it('should return 200 (ok) and join annotator to project', async () => {
      await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.OK)

      const dbProject = await Project.findById(project.id)
      const division = dbProject?.taskDivisions.find((d) =>
        d.annotator.equals(annotator.id),
      )
      expect(division).not.toBeUndefined()
    })

    it('should also return updated division', async () => {
      const res = await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.divisions).toEqual(expect.any(Array))
      const dbProject = await Project.findById(project.id)
      expect(res.body.divisions.length).toEqual(dbProject?.taskDivisions.length)
      dbProject?.taskDivisions.forEach((division, i) => {
        expect(division.annotator.toHexString()).toBe(res.body.divisions[i].annotator)
      })
    })

    it('should return 400 (bad request) when divisions is full', async () => {
      const annotator2 = await userService.createUser(
        generateUser({ role: ROLES.ANNOTATOR }),
      )
      project.maximumOfAnnotators = 1
      project.taskDivisions.push({ annotator: annotator2.id })
      await project.save()

      const res = await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.BAD_REQUEST)

      expect(res.body.type).toBe('division-is-full')
    })

    it('should return 400 (bad request) if annotator is already in the project', async () => {
      project.taskDivisions.push({ annotator: annotator.id })
      await project.save()

      const res = await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.BAD_REQUEST)

      expect(res.body.type).toBe('already-in-project')
    })

    it('should return 400 (bad request) if project is not open for joining', async () => {
      const phases = [
        PROJECT_PHASES.ANNOTATING,
        PROJECT_PHASES.DONE,
        PROJECT_PHASES.SETTING_UP,
      ] as const
      for (const phase of phases) {
        project.phase = phase
        await project.save({ validateBeforeSave: false })

        const res = await request
          .patch(`/api/v1/projects/${project.id}/join-project`)
          .set('Authorization', annotatorAccessToken)
          .expect(StatusCodes.BAD_REQUEST)

        expect(res.body.type).toBe('not-open-for-joining')
      }
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if access token is invalid', async () => {
      await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', 'invalid-odasjfoidaf-access-jdafoia--#$ODISJFI')
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 404 (not found) if project id does not exist', async () => {
      await request
        .patch(
          `/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/join-project`,
        )
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 (bad request) if project id is invalid mongo id', async () => {
      await request
        .patch(`/api/v1/projects/qqqinvalid/join-project`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 403 (forbidden) if caller is admin', async () => {
      const admin = await userService.createUser(generateUser({ role: ROLES.ADMIN }))
      const adminAccessToken = tokenService.generateAccessToken(admin)

      await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 403 (forbidden) if caller is admin, even if he/she is the manager of the project', async () => {
      const managerAccessToken = tokenService.generateAccessToken(manager)

      await request
        .patch(`/api/v1/projects/${project.id}/join-project`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })
  })

  describe("GET /api/v1/projects/:projectId/divisions/:divisionId/samples - Get division's samples", () => {
    let manager: UserDocument
    let annotator1: UserDocument
    let annotators: UserDocument[]
    let division1: ProjectDocument['taskDivisions'][number]

    let managerAccessToken: string
    let annotator1AccessToken: string

    let project: ProjectDocument

    beforeEach(async () => {
      const result = await createAnnotatingPhaseProject({
        numberOfAnnotators: 3,
        numberOfSamples: 5,
      })
      manager = result.manager
      annotators = result.annotators
      annotator1 = annotators[0]
      project = result.project
      division1 = project.taskDivisions[0]

      managerAccessToken = tokenService.generateAccessToken(manager)
      annotator1AccessToken = tokenService.generateAccessToken(annotator1)
    })

    it("should return 200 (ok) and correct data if caller is project's manager", async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.data).toEqual(expect.any(Array))
      expect(res.body.data.length).toBe(2)
    })

    it('should return 403 (forbidden) if caller is manager but not manager of the project', async () => {
      const manager2 = await userService.createUser(generateUser({ role: ROLES.MANAGER }))
      const manager2AccessToken = tokenService.generateAccessToken(manager2)
      await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', manager2AccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it("should return 200 (ok) if caller is annotator and is assigned to project's division", async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', annotator1AccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.data).toEqual(expect.any(Array))
      expect(res.body.data.length).toBe(2)
    })

    it("should return 403 (forbidden) if caller is annotator but not assigned project's division", async () => {
      const annotator2 = annotators[1]
      const annotator2AccessToken = tokenService.generateAccessToken(annotator2)
      await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', annotator2AccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 200 (ok) and correct data if caller is admin', async () => {
      const admin = await createAdminUser()
      const adminAccessToken = tokenService.generateAccessToken(admin)

      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.data).toEqual(expect.any(Array))
      expect(res.body.data.length).toBe(2)
    })

    it('should return 404 if project id does not exist', async () => {
      await request
        .get(
          `/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/divisions/${
            division1.id
          }/samples`,
        )
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 if project id is invalid project id', async () => {
      await request
        .get(`/api/v1/projects/oasjfo/divisions/${division1.id}/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 404 if division id does not exist', async () => {
      await request
        .get(
          `/api/v1/projects/${
            project.id
          }/divisions/${new mongoose.Types.ObjectId().toHexString()}/samples`,
        )
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it("should return 400 (bad request) if division exist but is not established yet (e.g project is still in 'open for joining' phase", async () => {
      const { manager, project } = await createOpenForJoiningPhaseProject({
        numberOfAnnotators: 2,
        numberOfSamples: 5,
      })
      const managerAccessToken = tokenService.generateAccessToken(manager)
      const division = project.taskDivisions[0]
      await request
        .get(`/api/v1/projects/${project.id}/divisions/${division.id}/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 if division id is invalid project id', async () => {
      await request
        .get(`/api/v1/projects/${project.id}/divisions/adfasdfsfd/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return total pages if checkPaginate is true', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ checkPaginate: true })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(1)
    })

    it('should return total page = 2 if checkPaginate = true and limit = 1', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ checkPaginate: true, limit: 1 })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(2)
    })

    it('should return 0 sample if page is 3', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/divisions/${division1.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ page: 3 })
        .expect(StatusCodes.OK)

      expect(res.body.data.length).toBe(0)
    })
  })

  describe('GET /api/v1/projects/:projectId/samples - Get project samples', () => {
    let manager: UserDocument
    let annotators: UserDocument[]
    let project: ProjectDocument
    let managerAccessToken: string

    beforeEach(async () => {
      const result = await createAnnotatingPhaseProject({
        numberOfSamples: 7,
        numberOfAnnotators: 3,
      })
      manager = result.manager
      project = result.project
      annotators = result.annotators
      managerAccessToken = tokenService.generateAccessToken(manager)
    })

    it('should return 200 (ok) and correct data if caller is manager of project', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.data).toEqual(expect.any(Array))
      expect(res.body.data.length).toBe(7)
      expect(res.body.data[0].project).toBe(project.id)
    })

    it('should return 403 (forbidden) if caller is manager but not manager of that project', async () => {
      const manager2 = await createManagerUser()
      const manager2AccessToken = tokenService.generateAccessToken(manager2)
      await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', manager2AccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 200 (ok) and correct data if caller is admin', async () => {
      const admin = await createAdminUser()
      const adminAccessToken = tokenService.generateAccessToken(admin)
      const res = await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.OK)

      expect(res.body.data).toEqual(expect.any(Array))
      expect(res.body.data.length).toBe(7)
      expect(res.body.data[0].project).toBe(project.id)
    })

    it('should return 403 (forbidden) if caller is annotator, even if he/she joined the project', async () => {
      const annotatorAccessToken = tokenService.generateAccessToken(annotators[0])
      await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', annotatorAccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return total pages and total records if checkPaginate set to true', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ checkPaginate: true, limit: 20 })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(1)
      expect(res.body.totalRecords).toBe(7)
    })

    it('should return 2 samples and totalPage = 4 if limit = 2 and checkPaginate = true', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ checkPaginate: true, limit: 2 })
        .expect(StatusCodes.OK)

      expect(res.body.totalPages).toBe(4)
      expect(res.body.totalRecords).toBe(7)
    })

    it('should return 1 sample if limit = 2 and page = 4', async () => {
      const res = await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', managerAccessToken)
        .query({ page: 4, limit: 2 })
        .expect(StatusCodes.OK)

      expect(res.body.data.length).toBe(1)
    })

    it('should return 404 (not found) if project id does not exist', async () => {
      await request
        .get(`/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 (bad request) if project id is invalid', async () => {
      await request
        .get(`/api/v1/projects/afadofjf/samples`)
        .set('Authorization', managerAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing or invalid', async () => {
      await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .set('Authorization', 'adfasdf')
        .expect(StatusCodes.UNAUTHORIZED)

      await request
        .get(`/api/v1/projects/${project.id}/samples`)
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('PATCH /api/v1/projects/:projectId/samples/:sampleId/annotate - Annotate a sample', () => {
    let manager: UserDocument
    let annotators: UserDocument[]
    let project: ProjectDocument
    let samples: SampleDocument[]
    let annotator1: UserDocument
    let sample1: SampleDocument
    let annotator1AccessToken: string

    describe('When annotation is labelings', () => {
      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfAnnotators: 3,
          numberOfSamples: 7,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: true,
              labelSets: [
                { isMultiSelected: false, labels: ['Negative', 'Positive'] },
                {
                  isMultiSelected: true,
                  labels: [
                    'About phones',
                    'About computers',
                    'About monitors',
                    'About keyboards',
                    'About headphones',
                  ],
                },
              ],
              hasGeneratedTexts: false,
              textConfigs: [],
            },
          },
        })
        manager = result.manager
        annotators = result.annotators
        project = result.project
        samples = result.samples
        annotator1 = annotators[0]
        sample1 = samples[0]
        annotator1AccessToken = tokenService.generateAccessToken(annotator1)
      })

      it('should return 204 (no content) if annotation is correct and caller is assigned to that sample', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ labelings: [['Positive'], ['About computers']] })
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.labelings).toEqual([['Positive'], ['About computers']])
      })

      it('should return 400 (bad request) if annotation does not have labelings', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({})
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if un allowed validation is passed in', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Positive'], ['About computers']],
            generatedTexts: ['Yoloooo'],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should allow labeling to have more than 1 label if label set config allows multi selection', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ labelings: [['Positive'], ['About computers', 'About phones']] })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if labeling has more than 1 label but multi select is not allowed', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ labelings: [['Positive', 'Negative'], ['About computers']] })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should accept labeling to have 0 label', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ labelings: [[], []] })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if label does not exist in config labels', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Positive'], ['About computers', "This label doesn't exist"]],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should allow re-annotate', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Positive'], ['About computers']],
          })
          .expect(StatusCodes.NO_CONTENT)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Negative'], ['About computers']],
          })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if number of labelings is not equal number of label sets', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Negative']],
          })
          .expect(StatusCodes.BAD_REQUEST)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Negative'], ['About computers'], ['Some more labeling']],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('When annotation is texts generation', () => {
      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfAnnotators: 3,
          numberOfSamples: 7,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: false,
              labelSets: [],
              hasGeneratedTexts: true,
              textConfigs: [],
            },
          },
        })
        manager = result.manager
        annotators = result.annotators
        project = result.project
        samples = result.samples
        annotator1 = annotators[0]
        sample1 = samples[0]
        annotator1AccessToken = tokenService.generateAccessToken(annotator1)
      })

      it('should return 204 (no content) if caller is assigned to the sample and annotation is correct', async () => {
        const generatedTexts = [faker.lorem.paragraph()]
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ generatedTexts: generatedTexts })
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.generatedTexts).toEqual(generatedTexts)
      })

      it('should return 400 (bad request) if generated texts is missing', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({})
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if un-allowed is passed in', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            generatedTexts: [faker.lorem.paragraph()],
            labelings: [['About Computers']],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if generatedTexts has no text', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ generatedTexts: [] })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should alow arbitrary number of texts, as long as it greater than 30', async () => {
        const generatedTexts: string[] = []
        for (let i = 0; i < 30; i++) {
          generatedTexts.push(faker.lorem.paragraph())
        }
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ generatedTexts })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if has more than 30 texts', async () => {
        const generatedTexts: string[] = []
        for (let i = 0; i < 31; i++) {
          generatedTexts.push(faker.lorem.paragraph())
        }
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ generatedTexts })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('When annotation is inline labeling in specific texts', () => {
      let textAnnotations: Partial<IRawSample['textAnnotations'][number]>[]

      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfAnnotators: 3,
          numberOfSamples: 7,
          numberOfSampleTexts: 2,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: false,
              labelSets: [],
              hasGeneratedTexts: false,
              textConfigs: [
                {
                  hasInlineLabels: true,
                  inlineLabels: ['Cats', 'Lions', 'Tigers', 'Dogs'],
                  hasLabelSets: false,
                  labelSets: [],
                },
                {
                  hasInlineLabels: true,
                  inlineLabels: ['Phones', 'Computers', 'Keyboards', 'Headphones'],
                  hasLabelSets: false,
                  labelSets: [],
                },
              ],
            },
          },
        })

        manager = result.manager
        annotators = result.annotators
        project = result.project
        samples = result.samples
        annotator1 = annotators[0]
        sample1 = samples[0]
        annotator1AccessToken = tokenService.generateAccessToken(annotator1)
        textAnnotations = [
          {
            inlineLabelings: [
              { startAt: 2, endAt: 5, label: 'Tigers' },
              { startAt: 2, endAt: 5, label: 'Cats' },
            ],
          },
          {
            inlineLabelings: [
              { startAt: 7, endAt: 10, label: 'Computers' },
              { startAt: 2, endAt: 5, label: 'Headphones' },
            ],
          },
        ]
      })

      it('should return 204 (no content) if annotation is correct caller is assigned to the sample', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.textAnnotations.length).toBe(2)
        expect(dbSample?.textAnnotations[0].labelings).toBeNull()
        expect(dbSample?.textAnnotations[1].labelings).toBeNull()
        expect(dbSample?.textAnnotations[0].inlineLabelings![0]).toMatchObject({
          startAt: 2,
          endAt: 5,
          label: 'Tigers',
        })
        expect(dbSample?.textAnnotations[0].inlineLabelings![1]).toMatchObject({
          startAt: 2,
          endAt: 5,
          label: 'Cats',
        })
        expect(dbSample?.textAnnotations[1].inlineLabelings![0]).toMatchObject({
          startAt: 7,
          endAt: 10,
          label: 'Computers',
        })
        expect(dbSample?.textAnnotations[1].inlineLabelings![1]).toMatchObject({
          startAt: 2,
          endAt: 5,
          label: 'Headphones',
        })
      })

      it('should return 400 (bad request) if number of text annotation is more than number of texts', async () => {
        textAnnotations.push({
          inlineLabelings: [
            { startAt: 7, endAt: 10, label: 'Computers' },
            { startAt: 2, endAt: 5, label: 'Headphones' },
          ],
        })
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if number of text annotations is less than number of texts that have annotation config (in this case we have 2 texts that have annotation config)', async () => {
        textAnnotations.pop()
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if label is not allowed in text config', async () => {
        textAnnotations[0] = {
          inlineLabelings: [{ startAt: 7, endAt: 10, label: 'I do not exist' }],
        }
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if textAnnotations is missing', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({})
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if has un-allowed annotation', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Labeling is not allowed']],
            textAnnotations,
          })
          .expect(StatusCodes.BAD_REQUEST)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            generatedTexts: ['Generated texts is also not allowed'],
            textAnnotations,
          })
          .expect(StatusCodes.BAD_REQUEST)

        textAnnotations[0].labelings = [['Labeling is not allowed']]
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if startAt > endAt', async () => {
        textAnnotations[0].inlineLabelings![0].endAt = 5
        textAnnotations[0].inlineLabelings![0].startAt = 10
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if startAt or EndAt exceeds corresponding text length', async () => {
        sample1.texts[0] = 'length = 11'
        await sample1.save()
        textAnnotations[0].inlineLabelings![0].startAt = 500
        textAnnotations[0].inlineLabelings![0].endAt = 505
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('When annotation is labeling in specific text', () => {
      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfAnnotators: 3,
          numberOfSamples: 7,
          numberOfSampleTexts: 2,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: false,
              labelSets: [],
              hasGeneratedTexts: false,
              textConfigs: [
                {
                  hasLabelSets: true,
                  labelSets: [
                    { isMultiSelected: false, labels: ['Negative', 'Positive'] },
                    {
                      isMultiSelected: true,
                      labels: [
                        'About phones',
                        'About computers',
                        'About monitors',
                        'About keyboards',
                        'About headphones',
                      ],
                    },
                  ],
                  hasInlineLabels: false,
                  inlineLabels: [],
                },
              ],
            },
          },
        })

        manager = result.manager
        annotators = result.annotators
        project = result.project
        samples = result.samples
        annotator1 = annotators[0]
        sample1 = samples[0]
        annotator1AccessToken = tokenService.generateAccessToken(annotator1)
      })

      it('should return 204 (no content) if annotation is correct and caller is assigned to that sample', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations: [{ labelings: [['Positive'], ['About monitors']] }] })
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.textAnnotations.length).toBe(1)
        expect(dbSample?.textAnnotations[0].labelings).toEqual([
          ['Positive'],
          ['About monitors'],
        ])
      })

      it('should return 400 (bad request) if annotation does not have labelings', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({})
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if un-allowed validation is passed in', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Positive'], ['About computers']],
            generatedTexts: ['Yoloooo'],
            textAnnotations: [{ labelings: [['Positive'], ['About monitors']] }],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if number of annotation is less than number of texts that required to have annotation (in this case 1)', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations: [] })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if number of annotation is more than number of texts that required to have annotation (in this case 1', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            textAnnotations: [
              { labelings: [['Positive'], ['About monitors']] },
              { labelings: [['Positive'], ['About monitors']] },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should allow labeling to have more than 1 label if label set config allows multi selection', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            textAnnotations: [
              { labelings: [['Positive'], ['About computers', 'About phones']] },
            ],
          })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if labeling has more than 1 label but multi selection is not allowed', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            textAnnotations: [
              { labelings: [['Positive', 'Negative'], ['About monitors']] },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should accept labeling to have 0 label', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations: [{ labelings: [[], []] }] })
          .expect(StatusCodes.NO_CONTENT)
      })

      it('should return 400 (bad request) if label does not exist in config labels', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            textAnnotations: [
              {
                labelings: [
                  ['Positive'],
                  ['About computers', "This label doesn't exist"],
                ],
              },
            ],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 400 (bad request) if number of labelings is not equal number of label sets', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({ textAnnotations: [{ labelings: [['Negative']] }] })
          .expect(StatusCodes.BAD_REQUEST)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send({
            labelings: [['Negative'], ['About computers'], []],
          })
          .expect(StatusCodes.BAD_REQUEST)
      })
    })

    describe('Overall test', () => {
      let annotation: {
        labelings: IRawSample['labelings']
        generatedTexts: IRawSample['generatedTexts']
        textAnnotations: Partial<IRawSample['textAnnotations'][number]>[]
      }

      beforeEach(async () => {
        const result = await createAnnotatingPhaseProject({
          numberOfAnnotators: 3,
          numberOfSamples: 7,
          numberOfSampleTexts: 2,
          projectOverwrite: {
            annotationConfig: {
              hasLabelSets: true,
              labelSets: [{ isMultiSelected: false, labels: ['Negative', 'Positive'] }],
              hasGeneratedTexts: true,
              textConfigs: [
                {
                  hasLabelSets: true,
                  labelSets: [
                    { isMultiSelected: false, labels: ['Negative', 'Positive'] },
                    {
                      isMultiSelected: true,
                      labels: ['About phones', 'About headphones', 'About computers'],
                    },
                  ],
                  hasInlineLabels: false,
                  inlineLabels: [],
                },
                {
                  hasLabelSets: false,
                  labelSets: [],
                  hasInlineLabels: true,
                  inlineLabels: ['Dogs', 'Cats', 'Tigers', 'Lions'],
                },
              ],
            },
          },
        })

        manager = result.manager
        annotators = result.annotators
        project = result.project
        samples = result.samples
        annotator1 = annotators[0]
        sample1 = samples[0]
        annotator1AccessToken = tokenService.generateAccessToken(annotator1)
        annotation = {
          labelings: [['Positive']],
          generatedTexts: [faker.lorem.paragraph(), faker.lorem.paragraph()],
          textAnnotations: [
            { labelings: [['Negative'], ['About headphones', 'About computers']] },
            {
              inlineLabelings: [
                { startAt: 4, endAt: 7, label: 'Cats' },
                { startAt: 6, endAt: 10, label: 'Tigers' },
              ],
            },
          ],
        }
      })

      it('should return 204 (no content) if annotation is correct and caller is assigned to the sample', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.labelings).toEqual(annotation.labelings)
        expect(dbSample?.generatedTexts).toEqual(annotation.generatedTexts)
        expect(dbSample?.textAnnotations.length).toBe(2)
        expect(dbSample?.textAnnotations[0].labelings).toEqual(
          annotation.textAnnotations[0].labelings,
        )
        expect(dbSample?.textAnnotations[0].inlineLabelings).toBeNull()
        expect(dbSample?.textAnnotations[1].labelings).toBeNull()
        expect(dbSample?.textAnnotations[1].inlineLabelings?.length).toBe(2)
        expect(dbSample?.textAnnotations[1].inlineLabelings![0]).toMatchObject({
          startAt: 4,
          endAt: 7,
          label: 'Cats',
        })
        expect(dbSample?.textAnnotations[1].inlineLabelings![1]).toMatchObject({
          startAt: 6,
          endAt: 10,
          label: 'Tigers',
        })
      })

      it("should update sample status to equal 'annotated'", async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.NO_CONTENT)

        const dbSample = await Sample.findById(sample1.id)
        expect(dbSample?.status).toBe(SAMPLE_STATUSES.ANNOTATED)
      })

      it('should return 403 (forbidden) if annotator is not assigned to the sample', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${samples[5].id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.FORBIDDEN)
      })

      it('should return 403 (forbidden) if caller is not annotator', async () => {
        const managerAccessToken = tokenService.generateAccessToken(manager)
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${samples[5].id}/annotate`)
          .set('Authorization', managerAccessToken)
          .send(annotation)
          .expect(StatusCodes.FORBIDDEN)

        const admin = await createAdminUser()
        const adminAccessToken = tokenService.generateAccessToken(admin)
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${samples[5].id}/annotate`)
          .set('Authorization', adminAccessToken)
          .send(annotation)
          .expect(StatusCodes.FORBIDDEN)
      })

      it('should return 404 (not found) if project id or sample id does not exist', async () => {
        await request
          .patch(
            `/api/v1/projects/${new mongoose.Types.ObjectId().toHexString()}/samples/${
              samples[5].id
            }/annotate`,
          )
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.NOT_FOUND)

        await request
          .patch(
            `/api/v1/projects/${
              project.id
            }/samples/${new mongoose.Types.ObjectId().toHexString()}/annotate`,
          )
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.NOT_FOUND)
      })

      it('should return 400 (bad request) if project id or sample is invalid mongo id', async () => {
        await request
          .patch(`/api/v1/projects/123sdaff/samples/${sample1.id}/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.BAD_REQUEST)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/123sdaff/annotate`)
          .set('Authorization', annotator1AccessToken)
          .send(annotation)
          .expect(StatusCodes.BAD_REQUEST)
      })

      it('should return 401 (unauthorized) if access token is missing or invalid', async () => {
        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .send(annotation)
          .expect(StatusCodes.UNAUTHORIZED)

        await request
          .patch(`/api/v1/projects/${project.id}/samples/${sample1.id}/annotate`)
          .send(annotation)
          .set('Authorization', 'afoajsdfiosjf')
          .expect(StatusCodes.UNAUTHORIZED)
      })
    })
  })
})
