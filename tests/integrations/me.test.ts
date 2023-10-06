/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest, Test } from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { faker } from '@faker-js/faker'

import { TYPES } from '@src/configs/constants'
import container from '@src/configs/inversify.config'
import { IStorageService, ITokenService, IUserService } from '@src/services/interfaces'
import setup from '@src/setup'
import { UserDocument } from '@src/types'
import { generateUser } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)
const imageStorageService = container.get<IStorageService>(TYPES.IMAGE_STORAGE_SERVICE)

setupTestDb()

let app: Application
let request: SuperTest<Test>
beforeAll(() => {
  app = setup()
  request = supertest(app)
})

let me: UserDocument
let accessToken: string
beforeEach(async () => {
  me = await userService.createUser(generateUser())
  accessToken = tokenService.generateAccessToken(me)
})

describe('Me routes', () => {
  describe('GET /api/v1/me - Get my profile', () => {
    it('should return 200 (ok) and correct information of user', async () => {
      const res = await request
        .get('/api/v1/me')
        .set('Authorization', accessToken)
        .expect(StatusCodes.OK)

      expect(res.body.me).toMatchObject({
        name: me.name,
        username: me.username,
      })
    })

    it('should return 401 (unauthorized) if have invalid access token', async () => {
      await request
        .get('/api/v1/me')
        .set('Authorization', 'invalid token')
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if does not have access token', async () => {
      await request.get('/api/v1/me').expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('PUT /api/v1/me/avatar - Update my avatar', () => {
    afterEach(async () => {
      const users = await userService.getMany()
      for (const user of users) {
        if (user.avatar) {
          await imageStorageService.deleteFile(user.avatar)
        }
      }
    })

    it('should return 200 (ok) and avatar', async () => {
      const avatarPath = __dirname + '/../fixtures/images/avatar.png'
      const res = await request
        .put('/api/v1/me/avatar')
        .set('Authorization', accessToken)
        .attach('avatar', avatarPath)
        .expect(StatusCodes.OK)

      expect(typeof res.body.avatar).toBe('string')
      await expect(imageStorageService.checkExist(res.body.avatar)).resolves.toBeTruthy()
    }, 20000)

    it('should remove old avatar', async () => {
      const avatarPath = __dirname + '/../fixtures/images/avatar.png'
      const res = await request
        .put('/api/v1/me/avatar')
        .set('Authorization', accessToken)
        .attach('avatar', avatarPath)
        .expect(StatusCodes.OK)
      const oldAvatar = res.body.avatar as string

      // replace with another avatar
      await request
        .put('/api/v1/me/avatar')
        .set('Authorization', accessToken)
        .attach('avatar', avatarPath)
        .expect(StatusCodes.OK)
      await expect(imageStorageService.checkExist(oldAvatar)).resolves.toBeFalsy()
    }, 20000)
  })

  describe('PATCH /api/v1/me - Update my profile', () => {
    it('should return 204 (no contend) and correctly update profile', async () => {
      const updatePayload = {
        name: faker.person.fullName(),
        address: faker.location.streetAddress(),
        dateOfBirth: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
      }
      await request
        .patch('/api/v1/me')
        .set('Authorization', accessToken)
        .send(updatePayload)
        .expect(StatusCodes.OK)

      const updatedProfile = await userService.getOneById(me.id)
      expect(updatedProfile?.toObject()).toMatchObject(updatePayload)
    })

    it('should return 400 (bad request) if update un-allowed fields', async () => {
      const invalidPayloads = [
        { username: 'newusername' },
        { password: 'newPassword' },
        { avatar: 'newavatar' },
        { role: 'admin' },
        { workStatus: 'off' },
      ]
      for (const payload of invalidPayloads) {
        await request
          .patch('/api/v1/me')
          .set('Authorization', accessToken)
          .send(payload)
          .expect(StatusCodes.BAD_REQUEST)
      }
    })
  })
})
