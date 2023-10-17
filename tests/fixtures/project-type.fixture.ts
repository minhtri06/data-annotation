import { faker } from '@faker-js/faker'

import { IRawProjectType } from '@src/models'

export const generateProjectType = (
  overwriteFields: Partial<IRawProjectType> = {},
): Omit<IRawProjectType, '_id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: 'Machine translation ' + faker.string.alphanumeric(10),
    ...overwriteFields,
  }
}
