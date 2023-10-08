import { PROJECT_STATUS } from '@src/constants'
import { Project } from '@src/models'
import { IProject } from '@src/models/interfaces'
import {
  generateAnnotationTaskDivision,
  generateIndividualTextConfig,
  generateProject,
} from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

setupTestDb()

let projectRaw: Partial<IProject>
beforeEach(() => {
  projectRaw = generateProject()
})

describe('Project model', () => {
  describe('Project validation', () => {
    it('should correctly validate a new project', async () => {
      await expect(new Project(projectRaw).validate()).resolves.toBeUndefined()
    })

    it('should correctly validate if status is setting up when project first created', async () => {
      projectRaw.status = PROJECT_STATUS.SETTING_UP
      await expect(new Project(projectRaw).validate()).resolves.toBeUndefined()
    })

    it('should throw an error if update status with invalid value', async () => {
      const project = await Project.create(projectRaw)
      project.status = 'invalid status' as IProject['status']
      await expect(project.save()).rejects.toThrow()
    })

    it('should throw an error if status is not setting up when first created', async () => {
      projectRaw.status = PROJECT_STATUS.ANNOTATING
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if update status to annotating when has 0 annotator', async () => {
      const project = await Project.create(projectRaw)
      project.status = PROJECT_STATUS.ANNOTATING
      await expect(project.save()).rejects.toThrow()
    })

    it('should throw an error if maximum of annotators less than 1', async () => {
      projectRaw.maximumOfAnnotators = 0
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw error if annotation task division length greater than maximum \
    of annotator', async () => {
      projectRaw.maximumOfAnnotators = 1
      projectRaw.annotationTaskDivision = generateAnnotationTaskDivision(4)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if annotation task division length greater than 0 \
    when project status is setting up', async () => {
      projectRaw.annotationTaskDivision = generateAnnotationTaskDivision(1)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if hasLabelSet equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.hasLabelSets = true
      projectRaw.annotationConfig!.labelSets = []
      const project = new Project(projectRaw)
      await expect(project.validate()).rejects.toThrow()
    })

    it('should throw an error if at singleTextConfig, hasLabelSets equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.individualTextConfigs = generateIndividualTextConfig(1)
      projectRaw.annotationConfig!.individualTextConfigs[0].hasLabelSets = true
      projectRaw.annotationConfig!.individualTextConfigs[0].labelSets = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if inlineLabels equals to true but provide no inlineLabels', async () => {
      projectRaw.annotationConfig!.individualTextConfigs = generateIndividualTextConfig(1)
      projectRaw.annotationConfig!.individualTextConfigs[0].hasInlineLabels = true
      projectRaw.annotationConfig!.individualTextConfigs[0].inlineLabels = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it("should throw an error if status of project is 'done' but doesn't have completion time", async () => {
      const project = await Project.create(projectRaw)
      project.status = PROJECT_STATUS.DONE
      await expect(project.save()).rejects.toThrow()
    })
  })

  describe('Project uniqueness', () => {
    it('should throw an error if save a project with (name, project type) already exist', async () => {
      await Project.create(projectRaw)

      const projectRaw2: Partial<IProject> = generateProject()
      projectRaw2.name = projectRaw.name
      projectRaw2.projectType = projectRaw.projectType
      await expect(Project.create(projectRaw2)).rejects.toThrow()
    })
  })
})
