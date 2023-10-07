/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest, Test } from 'supertest'

import setup from '@src/setup'
import { setupTestDb } from '@tests/utils'
import container from '@src/configs/inversify.config'
import {
  IProjectTypeService,
  ITokenService,
  IUserService,
} from '@src/services/interfaces'
import { TYPES } from '@src/configs/constants'
import { ProjectTypeDocument, UserDocument } from '@src/types'
import {
  generateProjectType,
  generateUser,
  getRoleDoesNotHavePrivilege,
  getRoleHasPrivilege,
} from '@tests/fixtures'
import { StatusCodes } from 'http-status-codes'
import { PRIVILEGES } from '@src/configs/role.config'

const projectTypeService = container.get<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE)
const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)

setupTestDb()

let app: Application
let request: SuperTest<Test>
beforeAll(() => {
  app = setup()
  request = supertest(app)
})

describe('Project type routes', () => {
  describe('GET /api/v1/project-types - Get all projects', () => {
    let projectType1: ProjectTypeDocument
    let projectType2: ProjectTypeDocument

    let user: UserDocument
    let accessToken: string
    beforeEach(async () => {
      projectType1 = await projectTypeService.createProjectType(generateProjectType())
      projectType2 = await projectTypeService.createProjectType(generateProjectType())

      user = await userService.createUser(generateUser())
      accessToken = tokenService.generateAccessToken(user)
    })

    it('should return 200 (ok) and all project types', async () => {
      const res = await request
        .get('/api/v1/project-types')
        .set('Authorization', accessToken)
        .expect(StatusCodes.OK)

      const projectTypes = res.body.projectTypes
      expect(projectTypes).toEqual(expect.any(Array))
      expect(projectTypes.length).toBe(2)
      expect(projectTypes[0].id).toBe(projectType1.id)
      expect(projectTypes[1].id).toBe(projectType2.id)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request.get('/api/v1/project-types').expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 400 (bad request) if access token is invalid', async () => {
      await request
        .get('/api/v1/project-types')
        .set('Authorization', 'invalid access token')
        .expect(StatusCodes.BAD_REQUEST)
    })
  })

  describe('POST /api/v1/project-types - Create project type', () => {
    let privilegedUser: UserDocument
    let privilegedAccessToken: string
    const rawProjectType = generateProjectType()
    beforeEach(async () => {
      privilegedUser = await userService.createUser(
        generateUser({ role: getRoleHasPrivilege(PRIVILEGES.CREATE_PROJECT_TYPES) }),
      )
      privilegedAccessToken = tokenService.generateAccessToken(privilegedUser)
    })

    it('should return 200 (ok) and correctly create a project type', async () => {
      const res = await request
        .post('/api/v1/project-types')
        .set('Authorization', privilegedAccessToken)
        .send(rawProjectType)
        .expect(StatusCodes.OK)

      const projectType = res.body.projectType
      expect(projectType).not.toBeUndefined()
      expect(projectType.name).toBe(rawProjectType.name.trim())

      const dbProjectType = await projectTypeService.getOneById(projectType.id as string)
      expect(dbProjectType).toBeDefined()
      expect(dbProjectType?.name).toBe(rawProjectType.name.trim())
    })

    it('should return 400 (bad request) if required fields is missing', async () => {
      await request
        .post('/api/v1/project-types')
        .set('Authorization', privilegedAccessToken)
        .send({})
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .post('/api/v1/project-types')
        .send(rawProjectType)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it("should return 403 (forbidden) if caller doesn't have proper privilege", async () => {
      const nonPrivilegeUser = await userService.createUser(
        generateUser({
          role: getRoleDoesNotHavePrivilege(PRIVILEGES.CREATE_PROJECT_TYPES),
        }),
      )
      const nonPrivilegeAccessToken = tokenService.generateAccessToken(nonPrivilegeUser)
      await request
        .post('/api/v1/project-types')
        .set('Authorization', nonPrivilegeAccessToken)
        .send(rawProjectType)
        .expect(StatusCodes.FORBIDDEN)
    })
  })
})
