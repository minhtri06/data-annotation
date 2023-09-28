import { PROJECT_STATUS } from '@src/configs/constants'
import { Project } from '@src/models'
import { IProject } from '@src/models/interfaces'
import {
  fakeAnnotationTaskDivision,
  fakeProject,
  fakeIndividualTextConfig,
  setupTestDb,
} from '@tests/utils'

setupTestDb()

let projectRaw: Partial<IProject>
beforeEach(() => {
  projectRaw = fakeProject()
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
      projectRaw.annotationTaskDivision = fakeAnnotationTaskDivision(4)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if annotation task division length greater than 0 \
    when project status is setting up', async () => {
      projectRaw.annotationTaskDivision = fakeAnnotationTaskDivision(1)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if hasLabelSet equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.hasLabelSets = true
      projectRaw.annotationConfig!.labelSets = []
      const project = new Project(projectRaw)
      console.log(project.annotationConfig)
      await expect(project.validate()).rejects.toThrow()
    })

    it('should throw an error if at singleTextConfig, hasLabelSets equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.individualTextConfigs = fakeIndividualTextConfig(1)
      projectRaw.annotationConfig!.individualTextConfigs[0].hasLabelSets = true
      projectRaw.annotationConfig!.individualTextConfigs[0].labelSets = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if inlineLabels equals to true but provide no inlineLabels', async () => {
      projectRaw.annotationConfig!.individualTextConfigs = fakeIndividualTextConfig(1)
      projectRaw.annotationConfig!.individualTextConfigs[0].hasInlineLabels = true
      projectRaw.annotationConfig!.individualTextConfigs[0].inlineLabels = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })
  })

  describe('Project constraint', () => {
    it('should throw an error if save a project with (name, project type) already exist', async () => {
      await Project.create(projectRaw)

      const projectRaw2: Partial<IProject> = fakeProject()
      projectRaw2.name = projectRaw.name
      projectRaw2.projectType = projectRaw.projectType
      await expect(Project.create(projectRaw2)).rejects.toThrow()
    })
  })
})
