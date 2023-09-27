import { ProjectType } from '@src/models'
import { fakeProjectTypeData, setupTestDb } from '@tests/utils'

setupTestDb()

describe('ProjectType model', () => {
  describe('ProjectType uniqueness', () => {
    test('should throw error if save a project type with an existing name', async () => {
      const projectTypeRaw = fakeProjectTypeData()
      await ProjectType.create(projectTypeRaw)

      const projectTypeRaw2 = fakeProjectTypeData({ name: projectTypeRaw.name })
      await expect(ProjectType.create(projectTypeRaw2)).rejects.toThrow()
    })
  })
})
