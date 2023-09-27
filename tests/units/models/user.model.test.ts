import { IUser } from '@src/models/interfaces'
import { User } from '@src/models/user.model'
import { fakeUserData, setupTestDb } from '../../utils'

setupTestDb()

describe('User model', () => {
  let rawUser: ReturnType<typeof fakeUserData>
  beforeEach(() => {
    rawUser = fakeUserData()
  })

  describe('User validation', () => {
    test('should correctly validate a valid user', async () => {
      await expect(new User(rawUser).validate()).resolves.toBeUndefined()
    })

    test('should throw a validation error if provide invalid role', async () => {
      rawUser.role = 'invalid' as IUser['role']
      await expect(new User(rawUser).validate()).rejects.toThrow()
    })
  })

  describe('User uniqueness', () => {
    test('should throw error if save an user with existing username', async () => {
      await User.create(rawUser)

      const rawUser2 = fakeUserData()
      rawUser2.username = rawUser.username
      await expect(User.create(fakeUserData(rawUser2))).rejects.toThrow()
    })
  })

  describe('User toJSON', () => {
    test('should not return password', () => {
      expect(new User(rawUser).toJSON().password).toBe(undefined)
    })
  })
})
