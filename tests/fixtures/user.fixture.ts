import { faker } from '@faker-js/faker'
import ROLE_PRIVILEGES, { ROLES } from '@src/configs/role.config'

import { IUser } from '@src/models/interfaces'
import { Privilege } from '@src/types'

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
    ...overwriteFields,
  }
}

export const getRoleHasPrivilege = (privilege: Privilege) => {
  for (const role of Object.values(ROLES)) {
    if (ROLE_PRIVILEGES[role].includes(privilege)) {
      return role
    }
  }
  throw new Error(`No role has '${privilege}' privilege `)
}

export const getRoleDoesNotHavePrivilege = (privilege: Privilege) => {
  for (const role of Object.values(ROLES)) {
    if (!ROLE_PRIVILEGES[role].includes(privilege)) {
      return role
    }
  }
  throw new Error(`No role that does not have '${privilege}' privilege`)
}
