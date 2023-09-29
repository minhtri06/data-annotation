import { ProjectType } from '@src/models'
import { generateProjectType } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

setupTestDb()

describe('ProjectType model', () => {
  describe('ProjectType uniqueness', () => {
    test('should throw error if save a project type with an existing name', async () => {
      const projectTypeRaw = generateProjectType()
      await ProjectType.create(projectTypeRaw)

      const projectTypeRaw2 = generateProjectType({ name: projectTypeRaw.name })
      await expect(ProjectType.create(projectTypeRaw2)).rejects.toThrow()
    })
  })
})
