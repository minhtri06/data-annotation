import { TYPES } from '@src/constants'
import container from '@src/configs/inversify.config'
import { Project, ProjectType } from '@src/models'
import { IProjectTypeService } from '@src/services/project-type.service.interface'
import { ProjectTypeDocument } from '@src/types'
import { generateProject, generateProjectType } from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

const projectTypeService = container.get<IProjectTypeService>(TYPES.PROJECT_TYPE_SERVICE)

setupTestDb()

describe('Project type service', () => {
  describe('createProjectType method', () => {
    let rawProjectType: ReturnType<typeof generateProjectType>
    beforeEach(() => {
      rawProjectType = generateProjectType()
    })

    it('should correctly create a project type in db', async () => {
      const projectType = await projectTypeService.createProjectType(rawProjectType)
      expect(projectType).toMatchObject(rawProjectType)
      expect(ProjectType.countDocuments({ _id: projectType._id }))
    })

    it('should throw error if misses required fields', async () => {
      await expect(
        projectTypeService.createProjectType({} as typeof rawProjectType),
      ).rejects.toThrow()
    })

    it('should throw error if project type name already exists', async () => {
      await projectTypeService.createProjectType(rawProjectType)
      const rawProjectType2 = generateProjectType({ name: rawProjectType.name })
      await expect(
        projectTypeService.createProjectType(rawProjectType2),
      ).rejects.toThrow()
    })
  })

  describe('updateProjectType method', () => {
    let projectType: ProjectTypeDocument
    const updatePayload = {
      name: 'new project type name',
    }
    beforeEach(async () => {
      projectType = await projectTypeService.createProjectType(generateProjectType())
    })

    it('should correctly update a project type', async () => {
      await projectTypeService.updateProjectType(projectType, updatePayload)
      expect(projectType.name).toBe(updatePayload.name)
      const updatedProjectType = await projectTypeService.getProjectTypeById(
        projectType._id.toHexString(),
      )
      expect(updatedProjectType?.name).toBe(updatePayload.name)
    })

    it('should throw error if update with name that already exists', async () => {
      const projectType2 = await projectTypeService.createProjectType(
        generateProjectType(),
      )
      await expect(
        projectTypeService.updateProjectType(projectType, { name: projectType2.name }),
      ).rejects.toThrow()
    })
  })

  describe('deleteProjectType method', () => {
    let projectType: ProjectTypeDocument
    beforeEach(async () => {
      projectType = await projectTypeService.createProjectType(generateProjectType())
    })

    it('should correctly delete a project type', async () => {
      await projectTypeService.deleteProjectType(projectType)
      await expect(ProjectType.countDocuments({ _id: projectType._id })).resolves.toBe(0)
    })

    it('should throw error if project type has at least 1 project', async () => {
      await Project.create(
        generateProject({ projectType: projectType._id.toHexString() }),
      )
      await expect(projectTypeService.deleteProjectType(projectType)).rejects.toThrow()
    })
  })
})
