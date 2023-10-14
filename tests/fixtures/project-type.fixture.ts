import { faker } from '@faker-js/faker'

import { IProjectType } from '@src/models'

export const generateProjectType = (
  overwriteFields: Partial<IProjectType> = {},
): Omit<IProjectType, '_id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: 'Machine translation ' + faker.string.alphanumeric(10),
    ...overwriteFields,
  }
}
