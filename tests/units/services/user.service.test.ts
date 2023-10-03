import bcrypt from 'bcryptjs'

import { TYPES } from '@src/configs/constants'
import container from '@src/configs/inversify.config'
import { IUser } from '@src/models/interfaces'
import { IUserService } from '@src/services/interfaces'
import { generateUser } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'
import { User } from '@src/models'
import { UserDocument } from '@src/types'

setupTestDb()
const userService = container.get<IUserService>(TYPES.USER_SERVICE)

let rawUser: ReturnType<typeof generateUser> &
  Partial<Pick<IUser, 'monthlyAnnotation' | 'avatar'>>
beforeEach(() => {
  rawUser = generateUser()
})

describe('User service', () => {
  describe('comparePassword method', () => {
    it('should return true if provide correct password', async () => {
      const hash = await bcrypt.hash(rawUser.password, 8)
      await expect(
        userService.comparePassword(hash, rawUser.password),
      ).resolves.toBeTruthy()
    })

    it('should return false if provide incorrectly password', async () => {
      const hash = await bcrypt.hash('password', 8)
      await expect(
        userService.comparePassword(hash, 'incorrect-password'),
      ).resolves.toBeFalsy()
    })
  })

  describe('createUser method', () => {
    it('should correctly create a user in database', async () => {
      const user = await userService.createUser(rawUser)
      await expect(User.countDocuments({ _id: user._id })).resolves.toBe(1)
    })

    it('should create user with correct information', async () => {
      const user = await userService.createUser(rawUser)
      expect(user.username).toBe(rawUser.username)
      expect(user.address).toBe(rawUser.address)
      expect(user.birthOfDate).toBe(rawUser.birthOfDate)
      expect(user.monthlyAnnotation).toEqual([])
      expect(user.name).toBe(rawUser.name)
      expect(user.phoneNumber).toBe(rawUser.phoneNumber)
      expect(user.role).toBe(rawUser.role)
    })

    it('should throw error if missing required fields', async () => {
      const requiredFields = [
        'name',
        'username',
        'password',
        'role',
        'birthOfDate',
        'phoneNumber',
        'address',
      ] as const
      const rawUser2: Partial<IUser> = { ...rawUser }
      for (const field of requiredFields) {
        rawUser2[field] = undefined
        await expect(userService.createUser(rawUser2 as typeof rawUser)).rejects.toThrow()
        Object.assign(rawUser2, rawUser)
      }
    })

    it('should throw error if provide invalid fields', async () => {
      rawUser.monthlyAnnotation = []
      await expect(userService.createUser(rawUser)).rejects.toThrow()
    })

    it('should throw error if create user with existing username', async () => {
      await userService.createUser(rawUser)
      await expect(
        userService.createUser(generateUser({ username: rawUser.username })),
      ).rejects.toThrow()
    })
  })

  describe('updateUser method', () => {
    let user: UserDocument
    beforeEach(async () => {
      user = await userService.createUser(rawUser)
    })

    it('should correctly update a user', async () => {
      const updatePayload = {
        address: 'new address',
        birthOfDate: new Date(),
        name: 'Minh Tri',
        phoneNumber: '0123456789',
      }
      await expect(userService.updateUser(user, updatePayload)).resolves.toBeUndefined()
      expect(user).toMatchObject(updatePayload)
    })

    it('should hash password', async () => {
      const newPassword = 'newPassword123'
      await userService.updateUser(user, { password: newPassword })
      await expect(
        userService.comparePassword(user.password, newPassword),
      ).resolves.toBeTruthy()
    })

    it('should throw error if update username, avatar, monthlyAnnotation, or invalid field', async () => {
      let updatePayload: Partial<IUser> = {
        username: 'newUsername',
      }
      await expect(userService.updateUser(user, updatePayload)).rejects.toThrow()
      updatePayload = {
        avatar: 'newAvatar',
      }
      await expect(userService.updateUser(user, updatePayload)).rejects.toThrow()
      updatePayload = {
        monthlyAnnotation: [],
      }
      await expect(userService.updateUser(user, updatePayload)).rejects.toThrow()
      const updatePayload2 = {
        name: 'Minh Tri',
        invalidField: 'invalid value',
      }
      await expect(userService.updateUser(user, updatePayload2)).rejects.toThrow()
    })
  })
})
