import { IUser } from '@src/models/interfaces'
import { User } from '@src/models/user.model'
import { fakeUserData, setupTestDb } from '../../utils'

setupTestDb()

describe('User model', () => {
  let newUserRaw: Partial<IUser>
  beforeEach(() => {
    newUserRaw = fakeUserData()
  })

  describe('User validation', () => {
    test('should correctly validate a valid user', async () => {
      await expect(new User(newUserRaw).validate()).resolves.toBeUndefined()
    })

    test('should throw a validation error if provide invalid role', async () => {
      newUserRaw.role = 'invalid' as IUser['role']
      await expect(new User(newUserRaw).validate()).rejects.toThrow()
    })
  })

  describe('User toJSON', () => {
    test('should not return password', () => {
      expect(new User(newUserRaw).toJSON().password).toBe(undefined)
    })
  })
})
