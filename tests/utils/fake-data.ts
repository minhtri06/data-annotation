import { faker } from '@faker-js/faker'

import { IUser } from '@src/models/interfaces'

export const fakeUserData = (
  overwriteFields: Partial<IUser> = {},
): Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> => {
  return {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    birthOfDate: faker.date.between({ from: '1980-01-01', to: '2000-12-31' }),
    phoneNumber: faker.phone.number(),
    role: 'level-1-annotator',
    address: faker.location.streetAddress(),
    ...overwriteFields,
  }
}

// export const fakeProjectData = (
//   overwriteFields: Partial<IProject>,
// ): Omit<IProject, 'createdAt' | 'updatedAt'> => {
//   return {
//     name: faker.string.alpha(),
//     projectType: new ObjectId(),
//     description: faker.lorem.paragraphs(),
//     requirement: faker.lorem.lines(),
//     manager: new ObjectId(),
//     numberOfLevel1Annotators: ,
//   }
// }
