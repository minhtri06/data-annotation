import { faker } from '@faker-js/faker'
import { USER_WORK_STATUS } from '@src/constants'

import { IUser } from '@src/models'

export const generateUser = (
  overwriteFields: Partial<IUser> = {},
): Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'monthlyAnnotation' | 'avatar'> => {
  return {
    username: faker.internet.userName(),
    password: 'ValidPassword123',
    name: faker.person.fullName(),
    dateOfBirth: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
    phoneNumber: faker.string.numeric(10),
    role: 'annotator',
    address: faker.location.streetAddress(),
    workStatus: USER_WORK_STATUS.ON,
    ...overwriteFields,
  }
}
