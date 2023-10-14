/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest, Test } from 'supertest'

import { Mutable, setupTestDb } from '@tests/utils'
import setup from '@src/setup'
import container from '@src/configs/inversify.config'
import { IProjectService, ITokenService, IUserService } from '@src/services'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { UserDocument } from '@src/types'
import {
  generateProject,
  generateUser,
  getNonPrivilegedRole,
  getPrivilegedRole,
} from '@tests/fixtures'
import { PRIVILEGES, ROLES } from '@src/configs/role.config'
import { CreateProjectPayload } from '@src/services/types'
import { StatusCodes } from 'http-status-codes'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)
const projectService = container.get<IProjectService>(TYPES.PROJECT_SERVICE)

setupTestDb()

let app: Application
let request: SuperTest<Test>
beforeAll(() => {
  app = setup()
  request = supertest(app)
})

describe('Project routes', () => {
  describe('POST /api/v1/projects - Create project', () => {
    let privilegedUser: UserDocument
    let privilegedAccessToken: string
    let rawProject: Omit<Mutable<CreateProjectPayload>, 'manager'>
    beforeEach(async () => {
      privilegedUser = await userService.createUser(
        generateUser({ role: getPrivilegedRole(PRIVILEGES.CREATE_PROJECT) }),
      )
      privilegedAccessToken = tokenService.generateAccessToken(privilegedUser)

      rawProject = generateProject()
      delete (rawProject as unknown as { manager: unknown }).manager
    })

    it('should return 201 (created) and correctly create a new project', async () => {
      const res = await request
        .post('/api/v1/projects')
        .set('Authorization', privilegedAccessToken)
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
        .set('Authorization', privilegedAccessToken)
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

    it("should return 403 (forbidden) if caller doesn't have needed privileges", async () => {
      const nonPrivilegedUser = await userService.createUser(
        generateUser({ role: getNonPrivilegedRole(PRIVILEGES.CREATE_PROJECT) }),
      )
      const nonPrivilegedAccessToken = tokenService.generateAccessToken(nonPrivilegedUser)
      await request
        .post('/api/v1/projects')
        .set('Authorization', nonPrivilegedAccessToken)
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
          .set('Authorization', privilegedAccessToken)
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
        .set('Authorization', privilegedAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if hasLabelSets is true but labelSets is empty', async () => {
      rawProject.annotationConfig.hasLabelSets = true
      rawProject.annotationConfig.labelSets = []
      await request
        .post('/api/v1/projects')
        .set('Authorization', privilegedAccessToken)
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
        .set('Authorization', privilegedAccessToken)
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
        .set('Authorization', privilegedAccessToken)
        .send(rawProject)
        .expect(StatusCodes.BAD_REQUEST)
    })
  })
})
