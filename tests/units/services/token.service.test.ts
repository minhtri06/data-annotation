import mongoose from 'mongoose'
import moment from 'moment'
import jwt from 'jsonwebtoken'

import { TOKEN_TYPES, TYPES } from '@src/configs/constants'
import container from '@src/configs/inversify.config'
import { ITokenService, IUserService } from '@src/services/interfaces'
import ENV_CONFIG from '@src/configs/env.config'
import { JwtPayload, UserDocument } from '@src/types'
import { setupTestDb } from '@tests/utils'
import { Token } from '@src/models'
import { generateUser } from '@tests/fixtures'

const tokenService = container.get<ITokenService>(TYPES.TOKEN_SERVICE)
const userService = container.get<IUserService>(TYPES.USER_SERVICE)

setupTestDb()

let user: UserDocument
beforeEach(async () => {
  user = await userService.createUser(generateUser())
})

describe('Token service', () => {
  describe('generateToken method', () => {
    it('should return a string', () => {
      const token = tokenService.generateToken(
        user,
        moment().add(10, 'minutes'),
        'access-token',
      )
      expect(typeof token).toBe('string')
    })

    it('should return a valid token', () => {
      const token = tokenService.generateToken(
        user,
        moment().add(10, 'minutes'),
        'access-token',
      )
      const payload = jwt.verify(token, ENV_CONFIG.JWT_SECRET) as JwtPayload

      expect(payload.exp > moment().unix()).toBeTruthy()
      expect(payload.role === user.role).toBeTruthy()
      expect(payload.iat <= moment().unix()).toBeTruthy()
      expect(payload.type === 'access-token').toBeTruthy()
      expect((user._id as mongoose.Types.ObjectId).equals(payload.sub)).toBeTruthy()
    })
  })

  describe('generateAccessToken method', () => {
    it('should call generateToken method', () => {
      const spy = jest.spyOn(tokenService, 'generateToken')
      tokenService.generateAccessToken(user)
      expect(spy).toBeCalled()
    })

    it("should start with 'Bearer '", () => {
      const token = tokenService.generateAccessToken(user)
      expect(token.startsWith('Bearer ')).toBeTruthy()
    })

    it('should be a valid access token', () => {
      let token = tokenService.generateAccessToken(user)
      token = token.split(' ')[1]
      const payload = jwt.verify(token, ENV_CONFIG.JWT_SECRET) as JwtPayload

      expect(payload.type).toBe(TOKEN_TYPES.ACCESS_TOKEN)
    })
  })

  describe('createRefreshToken method', () => {
    it('should call generateToken method', async () => {
      const spy = jest.spyOn(tokenService, 'generateToken')
      await tokenService.createRefreshToken(user)
      expect(spy).toBeCalled()
    })

    it('should be a valid refresh token', async () => {
      const token = await tokenService.createRefreshToken(user)
      const payload = jwt.verify(token.body, ENV_CONFIG.JWT_SECRET) as JwtPayload
      expect(payload.type).toBe(TOKEN_TYPES.REFRESH_TOKEN)
    })

    it('should save a refresh token to database', async () => {
      const token = await tokenService.createRefreshToken(user)
      await expect(Token.countDocuments({ body: token.body })).resolves.toBe(1)
    })
  })

  describe('createAuthToken method', () => {
    it('should call createRefreshToken and generateAccessToken methods', async () => {
      const spy1 = jest.spyOn(tokenService, 'createRefreshToken')
      const spy2 = jest.spyOn(tokenService, 'generateAccessToken')
      await tokenService.createAuthTokens(user)
      expect(spy1).toBeCalled()
      expect(spy2).toBeCalled()
    })

    it('should return access token and refresh token', async () => {
      const authToken = await tokenService.createAuthTokens(user)
      expect(typeof authToken.accessToken).toBe('string')
      expect(typeof authToken.refreshToken).toBe('string')
    })
  })

  describe('verifyToken method', () => {
    it('should correctly validate a valid token', () => {
      let accessToken = tokenService.generateAccessToken(user)
      accessToken = accessToken.split(' ')[1]
      expect(() => {
        tokenService.verifyToken(accessToken, TOKEN_TYPES.ACCESS_TOKEN)
      }).not.toThrow()
    })

    it('should thrown an error if token has wrong token type', () => {
      let accessToken = tokenService.generateAccessToken(user)
      accessToken = accessToken.split(' ')[1]
      expect(() => {
        tokenService.verifyToken(accessToken, TOKEN_TYPES.REFRESH_TOKEN)
      }).toThrow()
    })

    it('should thrown an error if given invalid token', () => {
      expect(() => {
        tokenService.verifyToken('invalid token', TOKEN_TYPES.REFRESH_TOKEN)
      }).toThrow()
    })

    it('should throw an error if given expired token', () => {
      const expiredToken = tokenService.generateToken(
        user,
        moment().add(-5, 'minutes'),
        TOKEN_TYPES.ACCESS_TOKEN,
      )
      expect(() => {
        tokenService.verifyToken(expiredToken, TOKEN_TYPES.ACCESS_TOKEN)
      }).toThrow()
    })
  })

  describe('blacklistAUser method', () => {
    it('should correctly blacklist all refresh token of a user', async () => {
      const user2 = await userService.createUser(generateUser())
      await tokenService.createRefreshToken(user)
      await tokenService.createRefreshToken(user)
      await tokenService.createRefreshToken(user2)
      await tokenService.blacklistAUser(user._id)

      const user1Tokens = await Token.find({ user: user._id })
      const user2Tokens = await Token.find({ user: user2._id })

      expect(user1Tokens.every((t) => t.isBlacklisted)).toBeTruthy()
      expect(user2Tokens.every((t) => !t.isBlacklisted)).toBeTruthy()
    })
  })
})
