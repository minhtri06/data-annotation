import { faker } from '@faker-js/faker'

import container from '@src/configs/inversify.config'
import { ROLES } from '@src/configs/role.config'
import { TYPES, USER_WORK_STATUSES } from '@src/constants'
import { IUser } from '@src/models'
import { IUserService } from '@src/services'

const userService = container.get<IUserService>(TYPES.USER_SERVICE)

export const generateUser = (
  overwriteFields: Partial<IUser> = {},
): Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'monthlyAnnotations' | 'avatar'> => {
  return {
    username: faker.internet.userName(),
    password: 'ValidPassword123',
    name: faker.person.fullName(),
    dateOfBirth: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
    phoneNumber: faker.string.numeric(10),
    role: 'annotator',
    address: faker.location.streetAddress(),
    workStatus: USER_WORK_STATUSES.ON,
    ...overwriteFields,
  }
}

export const createAdminUser = async (overwriteFields: Partial<IUser> = {}) => {
  return await userService.createUser(
    generateUser({ ...overwriteFields, role: ROLES.ADMIN }),
  )
}

export const createManagerUser = async (overwriteFields: Partial<IUser> = {}) => {
  return await userService.createUser(
    generateUser({ ...overwriteFields, role: ROLES.MANAGER }),
  )
}
