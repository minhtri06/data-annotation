import { IUser } from '@src/models/interfaces'
import { User } from '@src/models/user.model'
import { fakeUser } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

setupTestDb()

describe('User model', () => {
  let rawUser: ReturnType<typeof fakeUser>
  beforeEach(() => {
    rawUser = fakeUser()
  })

  describe('User validation', () => {
    test('should correctly validate a valid user', async () => {
      await expect(new User(rawUser).validate()).resolves.toBeUndefined()
    })

    test('should throw a validation error if provide invalid role', async () => {
      rawUser.role = 'invalid' as IUser['role']
      await expect(new User(rawUser).validate()).rejects.toThrow()
    })

    test('should throw an error if password length less than 6 characters', async () => {
      rawUser.password = '1234a'
      await expect(new User(rawUser).validate()).rejects.toThrow()
    })

    test("should throw an error if password doesn't contain letter", async () => {
      rawUser.password = '1234567'
      await expect(new User(rawUser).validate()).rejects.toThrow()
    })

    test("should throw an error if password doesn't contain number", async () => {
      rawUser.password = 'onlyLetterABC'
      await expect(new User(rawUser).validate()).rejects.toThrow()
    })
  })

  describe('User uniqueness', () => {
    test('should throw error if save an user with existing username', async () => {
      await User.create(rawUser)

      const rawUser2 = fakeUser()
      rawUser2.username = rawUser.username
      await expect(User.create(rawUser2)).rejects.toThrow()
    })
  })

  describe('User toJSON', () => {
    test('should not return password', () => {
      expect(new User(rawUser).toJSON().password).toBe(undefined)
    })
  })
})
