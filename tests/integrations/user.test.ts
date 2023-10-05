/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Application } from 'express'
import superTest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'

import { TYPES } from '@src/configs/constants'
import container from '@src/configs/inversify.config'
import { ROLES } from '@src/configs/role.config'
import { ITokenService, IUserService } from '@src/services/interfaces'
import setup from '@src/setup'
import { UserDocument } from '@src/types'
import { generateUser } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'
import { User } from '@src/models'
import { getObjectKeys } from '@src/utils'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)

setupTestDb()

let app: Application
let request: SuperTest<Test>
beforeAll(() => {
  app = setup()
  request = superTest(app)
})

describe('Users routes', () => {
  describe('GET /api/v1/users', () => {
    let user1: UserDocument, user2: UserDocument, user3: UserDocument
    let adminUser: UserDocument
    let accessToken: string
    beforeEach(async () => {
      ;[user1, user2, user3] = await Promise.all([
        userService.createUser(generateUser()),
        userService.createUser(generateUser()),
        userService.createUser(generateUser()),
      ])
      adminUser = await userService.createUser(generateUser({ role: ROLES.ADMIN }))

      accessToken = tokenService.generateAccessToken(user1)
    })

    it('should return 200 (ok) and a list of user', async () => {
      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .expect(StatusCodes.OK)

      expect(res.body).toEqual({
        data: expect.any(Array),
      })
      expect(res.body.data[0].id).toBe(user1.id)
      expect(res.body.data[1].id).toBe(user2.id)
      expect(res.body.data[2].id).toBe(user3.id)
      expect(res.body.data[3].id).toBe(adminUser.id)
    })

    it('should return total pages if checkPaginate is true', async () => {
      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .query({ checkPaginate: true })
        .expect(StatusCodes.OK)

      expect(typeof res.body.totalPages).toBe('number')
    })

    it('should limit the user base on the limit query', async () => {
      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .query({ limit: 1 })
        .expect(StatusCodes.OK)

      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0].id).toBe(user1.id)
    })

    it('should return page base on the page query', async () => {
      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .query({ limit: 1, page: 2 })
        .expect(StatusCodes.OK)

      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0].id).toBe(user2.id)
    })

    it('should return users filtered with role on the query', async () => {
      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .query({ role: ROLES.ADMIN })
        .expect(StatusCodes.OK)

      expect(res.body.data.length).toBe(1)
      expect(res.body.data[0].id).toBe(adminUser.id)
    })

    it('should filter user by name (to contains name)', async () => {
      const nameSearch = user1.name.slice(3, 5)

      const res = await request
        .get('/api/v1/users')
        .set('Authorization', accessToken)
        .query({ name: nameSearch })
        .expect(StatusCodes.OK)

      const data = res.body.data as { name: string }[]
      expect(data).toEqual(expect.any(Array))
      expect(data.length).toBeGreaterThanOrEqual(1)
      expect(data[0].name).toBe(user1.name)

      const regex = new RegExp(nameSearch, 'i')
      expect(data.every((u) => regex.test(u.name))).toBeTruthy()
    })

    it("should return 401 if don't have access token", async () => {
      await request.get('/api/v1/users').expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('POST /api/v1/users', () => {
    let adminUser: UserDocument
    let adminAccessToken: string
    let newRawUser: ReturnType<typeof generateUser>
    beforeEach(async () => {
      adminUser = await userService.createUser(generateUser({ role: ROLES.ADMIN }))

      adminAccessToken = tokenService.generateAccessToken(adminUser)

      newRawUser = generateUser()
    })

    it('should return 201 (created) and correctly create a user if data is ok and caller is admin', async () => {
      await request
        .post('/api/v1/users')
        .send(newRawUser)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.CREATED)

      await expect(
        User.countDocuments({
          username: newRawUser.username,
        }),
      ).resolves.toBe(1)
    })

    it('should return user data back with correct information', async () => {
      const res = await request
        .post('/api/v1/users')
        .send(newRawUser)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.CREATED)

      expect(res.body.user).toMatchObject({
        username: newRawUser.username,
        name: newRawUser.name,
      })
    })

    it('should return 403 (forbidden) if caller is not admin', async () => {
      const user = await userService.createUser(generateUser())
      const accessToken = tokenService.generateAccessToken(user)

      await request
        .post('/api/v1/users')
        .send(newRawUser)
        .set('Authorization', accessToken)
        .expect(StatusCodes.FORBIDDEN)
    })

    it('should return 400 (bad request) if username already exists', async () => {
      const user = await userService.createUser(generateUser())
      newRawUser.username = user.username

      await request
        .post('/api/v1/users')
        .send(newRawUser)
        .set('Authorization', adminAccessToken)
        .expect(StatusCodes.BAD_REQUEST)
    })

    it('should return 400 (bad request) if miss required fields', async () => {
      const requiredFields = [
        'username',
        'name',
        'password',
        'address',
        'phoneNumber',
      ] as const
      for (const field of requiredFields) {
        newRawUser = generateUser()
        delete newRawUser[field]
        await request
          .post('/api/v1/users')
          .send(newRawUser)
          .set('Authorization', adminAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      }
    })

    it('should return 400 (bad request) if provide invalid fields', async () => {
      const invalidData = {
        monthlyAnnotation: [{ month: 1, total: 123 }],
        avatar: 'some-link',
        otherInvalidField: 'hello world',
      } as const
      for (const field of getObjectKeys(invalidData)) {
        const invalidRawUser: Record<string, unknown> = generateUser()
        invalidRawUser[field] = invalidData[field]
        await request
          .post('/api/v1/users')
          .send(invalidRawUser)
          .set('Authorization', adminAccessToken)
          .expect(StatusCodes.BAD_REQUEST)
      }
    })
  })
})
