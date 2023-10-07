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
  generateProject,
  generateProjectType,
  generateUser,
  getRoleDoesNotHavePrivilege,
  getRoleHasPrivilege,
} from '@tests/fixtures'
import { StatusCodes } from 'http-status-codes'
import { PRIVILEGES } from '@src/configs/role.config'
import mongoose from 'mongoose'
import { Project } from '@src/models'

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

    it('should return 401 (unauthorized) if access token is invalid', async () => {
      await request
        .get('/api/v1/project-types')
        .set('Authorization', 'invalid access token')
        .expect(StatusCodes.UNAUTHORIZED)
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

    it('should return 201 (created) and correctly create a project type', async () => {
      const res = await request
        .post('/api/v1/project-types')
        .set('Authorization', privilegedAccessToken)
        .send(rawProjectType)
        .expect(StatusCodes.CREATED)

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

    it('should return 400 (bad request) if send invalid fields', async () => {
      await request
        .post('/api/v1/project-types')
        .set('Authorization', privilegedAccessToken)
        .send({ ...rawProjectType, invalidField: 'invalid-fields' })
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

  describe('PATCH /api/v1/project-types/:projectTypeId - Update project type by id', () => {
    let projectType: ProjectTypeDocument

    let privilegedUser: UserDocument
    let privilegedAccessToken: string
    const updatePayload = generateProjectType()
    beforeEach(async () => {
      projectType = await projectTypeService.createProjectType(generateProjectType())

      privilegedUser = await userService.createUser(
        generateUser({ role: getRoleHasPrivilege(PRIVILEGES.UPDATE_PROJECT_TYPES) }),
      )
      privilegedAccessToken = tokenService.generateAccessToken(privilegedUser)
    })

    it('should return 200 (ok) and correctly update a project types', async () => {
      const res = await request
        .patch('/api/v1/project-types/' + projectType.id)
        .set('Authorization', privilegedAccessToken)
        .send(updatePayload)
        .expect(StatusCodes.OK)

      const returnProjectType = res.body.projectType
      expect(returnProjectType).not.toBeUndefined()
      expect(returnProjectType.id).toBe(projectType.id)
      expect(returnProjectType).toMatchObject({
        name: updatePayload.name,
      })

      const dbProjectType = await projectTypeService.getOneByIdOrFail(projectType._id)
      expect(dbProjectType).toMatchObject({
        name: updatePayload.name,
      })
    })

    it("should return 404 (not found) if project type id doesn't exist", async () => {
      await request
        .patch('/api/v1/project-types/' + new mongoose.Types.ObjectId().toHexString())
        .set('Authorization', privilegedAccessToken)
        .send(updatePayload)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 (bad request) if send un-allow fields', async () => {
      await request
        .patch('/api/v1/project-types/' + projectType.id)
        .set('Authorization', privilegedAccessToken)
        .send({ ...updatePayload, unAllowField: 'abc' })
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .patch('/api/v1/project-types/' + projectType.id)
        .send(updatePayload)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it("should return 403 (forbidden) if caller doesn't have needed privileges", async () => {
      const nonPrivilegedUser = await userService.createUser(
        generateUser({
          role: getRoleDoesNotHavePrivilege(PRIVILEGES.UPDATE_PROJECT_TYPES),
        }),
      )
      const nonPrivilegedAccessToken = tokenService.generateAccessToken(nonPrivilegedUser)

      await request
        .patch('/api/v1/project-types/' + projectType.id)
        .set('Authorization', nonPrivilegedAccessToken)
        .send(updatePayload)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 400 (bad request) if the update name already exists', async () => {
      const projectType2 = await projectTypeService.createProjectType(
        generateProjectType(),
      )
      updatePayload.name = projectType2.name
      await request
        .patch('/api/v1/project-types/' + projectType.id)
        .set('Authorization', privilegedAccessToken)
        .send(updatePayload)
        .expect(StatusCodes.BAD_REQUEST)
    })
  })

  describe('DELETE /api/v1/project-types/:projectTypeId - Delete project type by id', () => {
    let projectType: ProjectTypeDocument

    let privilegedUser: UserDocument
    let privilegedAccessToken: string
    beforeEach(async () => {
      projectType = await projectTypeService.createProjectType(generateProjectType())

      privilegedUser = await userService.createUser(
        generateUser({ role: getRoleHasPrivilege(PRIVILEGES.DELETE_PROJECT_TYPES) }),
      )
      privilegedAccessToken = tokenService.generateAccessToken(privilegedUser)
    })

    it('should return 204 (no content) and correctly delete a project type', async () => {
      await request
        .delete('/api/v1/project-types/' + projectType.id)
        .set('Authorization', privilegedAccessToken)
        .expect(StatusCodes.NO_CONTENT)

      await expect(
        projectTypeService.countDocuments({ _id: projectType._id }),
      ).resolves.toBe(0)
    })

    it("should return 404 (not found) if project type id doesn't exist", async () => {
      await request
        .delete('/api/v1/project-types/' + new mongoose.Types.ObjectId().toHexString())
        .set('Authorization', privilegedAccessToken)
        .expect(StatusCodes.NOT_FOUND)
    })

    it('should return 400 (bad request) if project type id is invalid', async () => {
      await request
        .delete('/api/v1/project-types/' + 'invalid-id')
        .set('Authorization', privilegedAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 401 (unauthorized) if access token is missing', async () => {
      await request
        .delete('/api/v1/project-types/' + projectType.id)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it("should return 403 (forbidden) if caller doesn't have needed privileges", async () => {
      const nonPrivilegedUser = await userService.createUser(
        generateUser({
          role: getRoleDoesNotHavePrivilege(PRIVILEGES.DELETE_PROJECT_TYPES),
        }),
      )
      const nonPrivilegedAccessToken = tokenService.generateAccessToken(nonPrivilegedUser)

      await request
        .delete('/api/v1/project-types/' + projectType.id)
        .set('Authorization', nonPrivilegedAccessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 400 (bad request) if project type has at least one project', async () => {
      await Project.create(generateProject({ projectType: projectType.id }))
      await request
        .delete('/api/v1/project-types/' + projectType.id)
        .set('Authorization', privilegedAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })
  })
})
