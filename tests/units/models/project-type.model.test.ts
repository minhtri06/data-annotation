import { ProjectType } from '@src/models'
import { fakeProjectType } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

setupTestDb()

describe('ProjectType model', () => {
  describe('ProjectType uniqueness', () => {
    test('should throw error if save a project type with an existing name', async () => {
      const projectTypeRaw = fakeProjectType()
      await ProjectType.create(projectTypeRaw)

      const projectTypeRaw2 = fakeProjectType({ name: projectTypeRaw.name })
      await expect(ProjectType.create(projectTypeRaw2)).rejects.toThrow()
    })
  })
})
