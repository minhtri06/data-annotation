import { IProjectType } from '@src/models/interfaces'

export const fakeProjectType = (
  overwriteFields: Partial<IProjectType> = {},
): Omit<IProjectType, '_id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: 'Machine translation',
    ...overwriteFields,
  }
}
