import { Types } from 'mongoose'

import { TYPES } from '@src/configs/constants'
import container from '@src/configs/inversify.config'
import { IUser } from '@src/models/interfaces'
import { IAuthService, ITokenService, IUserService } from '@src/services/interfaces'
import { generateUser } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'
import { UserDocument } from '@src/types'
import ENV_CONFIG from '@src/configs/env.config'

setupTestDb()
const authService = container.get<IAuthService>(TYPES.AUTH_SERVICE)
const userService = container.get<IUserService>(TYPES.USER_SERVICE)
const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)

let rawUser: ReturnType<typeof generateUser> & Partial<Pick<IUser, 'monthlyAnnotation'>>
beforeAll(() => {
  rawUser = generateUser()
})
let user: UserDocument
beforeEach(async () => {
  user = await userService.createUser(rawUser)
})

describe('Auth service', () => {
  describe('login method', () => {
    it('should correctly login if provide correct username and password and return auth tokens', async () => {
      const credential = await authService.login(rawUser.username, rawUser.password)

      expect((user._id as Types.ObjectId).equals(credential.user._id))
      expect(credential.authTokens).not.toBeUndefined()
      expect(typeof credential.authTokens.accessToken).toBe('string')
      expect(typeof credential.authTokens.refreshToken).toBe('string')
    })

    it('should throw error if provide incorrect username and password', async () => {
      await expect(
        authService.login(rawUser.username, 'wrong' + rawUser.password),
      ).rejects.toThrow()
      await expect(
        authService.login('wrong' + rawUser.username, rawUser.password),
      ).rejects.toThrow()
    })
  })

  describe('logout method', () => {
    it('should revoke refresh token in database', async () => {
      const credential = await authService.login(rawUser.username, rawUser.password)

      await authService.logout(credential.authTokens.refreshToken)
      const refreshTokenDoc = await tokenService.getOne({
        body: credential.authTokens.refreshToken,
      })
      expect(refreshTokenDoc).not.toBeNull()
      expect(refreshTokenDoc?.isRevoked).toBeTruthy()
    })
  })

  describe('refreshAuthTokens method', () => {
    const ENV = { ...ENV_CONFIG }
    // ENV_CONFIG is immutable type, so we need an mutable type variable to
    // change ENV_CONFIG
    let mutableEnvConfig: { [key: string]: unknown }
    beforeAll(() => {
      mutableEnvConfig = ENV_CONFIG
    })

    afterEach(() => {
      // restore env values
      Object.assign(ENV_CONFIG, ENV)
    })

    it('correctly refresh auth tokens if access token expired and refresh token has not expired', async () => {
      mutableEnvConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1
      const credential = await authService.login(rawUser.username, rawUser.password)
      await expect(
        authService.refreshAuthTokens(
          credential.authTokens.accessToken,
          credential.authTokens.refreshToken,
        ),
      ).resolves.not.toThrow()
    })

    it('should throw an error if access token has not expired', async () => {
      const credential = await authService.login(rawUser.username, rawUser.password)
      await expect(
        authService.refreshAuthTokens(
          credential.authTokens.accessToken,
          credential.authTokens.refreshToken,
        ),
      ).rejects.toThrow()
    })

    it('should throw an error if refresh token expired', async () => {
      mutableEnvConfig.JWT_REFRESH_EXPIRATION_DAYS = -1
      const credential = await authService.login(rawUser.username, rawUser.password)
      await expect(
        authService.refreshAuthTokens(
          credential.authTokens.accessToken,
          credential.authTokens.refreshToken,
        ),
      ).rejects.toThrow()
    })

    it("should throw an error and blacklist all user's tokens if reuse refresh token", async () => {
      mutableEnvConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1
      const credential = await authService.login(rawUser.username, rawUser.password)
      // correctly refresh
      await authService.refreshAuthTokens(
        credential.authTokens.accessToken,
        credential.authTokens.refreshToken,
      )
      await expect(
        authService.refreshAuthTokens(
          credential.authTokens.accessToken,
          credential.authTokens.refreshToken,
        ),
      ).rejects.toThrow()
      const refreshTokens = await tokenService.getMany({ user: user._id })
      expect(refreshTokens.every((t) => t.isBlacklisted)).toBeTruthy()
    })

    it("should throw error and blacklist all user's token if use refresh token that already logout", async () => {
      mutableEnvConfig.JWT_ACCESS_EXPIRATION_MINUTES = -1
      const credential = await authService.login(rawUser.username, rawUser.password)
      await authService.logout(credential.authTokens.refreshToken)
      await expect(
        authService.refreshAuthTokens(
          credential.authTokens.accessToken,
          credential.authTokens.refreshToken,
        ),
      ).rejects.toThrow()
      const refreshTokens = await tokenService.getMany({ user: user._id })
      expect(refreshTokens.every((t) => t.isBlacklisted)).toBeTruthy()
    })
  })
})
