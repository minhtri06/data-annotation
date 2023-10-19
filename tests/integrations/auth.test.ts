/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'express'
import supertest, { SuperTest } from 'supertest'

import setup from '@src/setup'
import { setupTestDb } from '@tests/utils'
import container from '@src/configs/inversify.config'
import { ITokenService, IUserService } from '@src/services'
import { TYPES } from '@src/constants'
import { generateUser } from '@tests/fixtures'
import { StatusCodes } from 'http-status-codes'
import { setupTestEnv } from '@tests/utils/setup-test-env'
import { UserDocument } from '@src/models'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)

setupTestDb()
let app: Application
let request: SuperTest<supertest.Test>
beforeAll(() => {
  app = setup()
  request = supertest(app)
})

let rawUser: ReturnType<typeof generateUser>
let user: UserDocument
beforeEach(async () => {
  rawUser = generateUser()
  user = await userService.createUser(rawUser)
})

describe('Auth routes', () => {
  describe('POST api/v1/auth/login', () => {
    it('should return 200 (ok) and auth tokens if username and password match', async () => {
      const res = await request
        .post('/api/v1/auth/login')
        .send({ username: rawUser.username, password: rawUser.password })
        .expect(StatusCodes.OK)
      expect(res.body.user).toMatchObject({
        id: user.id,
        name: user.name,
        role: user.role,
      })
      expect(typeof res.body.authTokens?.accessToken).toBe('string')
      expect(typeof res.body.authTokens?.refreshToken).toBe('string')
    })

    it('should return 401 (unauthorized) if there are no user with that username', async () => {
      await request
        .post('/api/v1/auth/login')
        .send({ username: 'not-exists-username', password: 'password' })
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if password is wrong', async () => {
      await request
        .post('/api/v1/auth/login')
        .send({ username: rawUser.username, password: 'wrong' + rawUser.password })
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('should return 204 (no content) if provide valid refresh token', async () => {
      const refreshTokenDoc = await tokenService.createRefreshToken(user)
      await request
        .post('/api/v1/auth/logout')
        .send({ refreshToken: refreshTokenDoc.body })
        .expect(StatusCodes.NO_CONTENT)

      const revokedRefreshTokenDoc = await tokenService.getRefreshTokenByBody(
        refreshTokenDoc.body,
      )
      expect(revokedRefreshTokenDoc?.isRevoked).toBe(true)
    })

    it('should return 400 (bad request) if refresh token is missing in request body', async () => {
      await request.post('/api/v1/auth/logout').expect(StatusCodes.BAD_REQUEST)
    })
  })

  describe('POST /api/v1/auth/refresh-tokens', () => {
    const envConfig = setupTestEnv()

    it('should return 200 (ok) and new auth tokens if provided tokens is valid', async () => {
      envConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1

      const authTokens = await tokenService.createAuthTokens(user)

      const res = await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.OK)

      expect(typeof res.body.authTokens?.accessToken).toBe('string')
      expect(typeof res.body.authTokens?.refreshToken).toBe('string')
    })

    it('should return 401 (unauthorized) if access token has not expired yet', async () => {
      const authTokens = await tokenService.createAuthTokens(user)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if refresh token expires', async () => {
      envConfig.JWT_REFRESH_EXPIRATION_DAYS = -1

      const authTokens = await tokenService.createAuthTokens(user)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if provide invalid auth tokens', async () => {
      const authTokens = await tokenService.createAuthTokens(user)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send({ accessToken: 'invalid-token', refreshToken: authTokens.refreshToken })
        .expect(StatusCodes.UNAUTHORIZED)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send({ accessToken: authTokens.accessToken, refreshToken: 'invalid-token' })
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if reuse refresh token', async () => {
      envConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1

      const authTokens = await tokenService.createAuthTokens(user)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.OK)

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.UNAUTHORIZED)
    })

    it('should return 401 (unauthorized) if user not found', async () => {
      envConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1

      const authTokens = await tokenService.createAuthTokens(user)
      await user.deleteOne()

      await request
        .post('/api/v1/auth/refresh-tokens')
        .send(authTokens)
        .expect(StatusCodes.UNAUTHORIZED)
    })
  })
})
