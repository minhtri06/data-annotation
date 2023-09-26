import { IUser } from '@src/models/interfaces'
import { User } from '@src/models/user'

describe('User model', () => {
  describe('User validation', () => {
    let newUserRaw: Partial<IUser>
    beforeEach(() => {
      newUserRaw = {
        name: 'Minh Tri',
        username: 'yolo',
        password: 'password123',
        role: 'level-1-annotator',
        birthOfDate: new Date('2001-01-06'),
        phoneNumber: '0349123213',
        address: 'Hau Giang',
      }
    })

    test('should correctly validate a valid user', async () => {
      await expect(new User(newUserRaw).validate()).resolves.toBeUndefined()
    })
  })
})
