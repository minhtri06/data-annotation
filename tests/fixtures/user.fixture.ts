import { faker } from '@faker-js/faker'

import { IUser } from '@src/models/interfaces'

export const fakeUser = (
  overwriteFields: Partial<IUser> = {},
): Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'monthlyAnnotation'> => {
  return {
    username: faker.internet.userName(),
    password: 'ValidPassword123',
    name: faker.person.fullName(),
    birthOfDate: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
    phoneNumber: faker.phone.number(),
    role: 'annotator',
    address: faker.location.streetAddress(),
    ...overwriteFields,
  }
}
