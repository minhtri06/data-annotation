import { PROJECT_PHASES } from '@src/constants'
import { IRawProject, Project } from '@src/models'
import { IProject } from '@src/models'
import {
  generateTaskDivisions,
  generateIndividualTextConfig,
  generateProject,
} from '@tests/fixtures'
import { setupTestDb } from '@tests/utils'

setupTestDb()

let projectRaw: Partial<IRawProject>
beforeEach(() => {
  projectRaw = generateProject()
})

describe('Project model', () => {
  describe('Project validation', () => {
    it('should correctly validate a new project', async () => {
      await expect(new Project(projectRaw).validate()).resolves.toBeUndefined()
    })

    it('should correctly validate if phase is setting up when project first created', async () => {
      projectRaw.phase = PROJECT_PHASES.SETTING_UP
      await expect(new Project(projectRaw).validate()).resolves.toBeUndefined()
    })

    it('should throw an error if update phase with invalid value', async () => {
      const project = await Project.create(projectRaw)
      project.phase = 'invalid phase' as IProject['phase']
      await expect(project.save()).rejects.toThrow()
    })

    it('should throw an error if phase is not setting up when first created', async () => {
      projectRaw.phase = PROJECT_PHASES.ANNOTATING
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if update phase to annotating when has 0 annotator', async () => {
      const project = await Project.create(projectRaw)
      project.phase = PROJECT_PHASES.ANNOTATING
      await expect(project.save()).rejects.toThrow()
    })

    it('should throw an error if maximum of annotators less than 1', async () => {
      projectRaw.maximumOfAnnotators = 0
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw error if annotation task division length greater than maximum \
    of annotator', async () => {
      projectRaw.maximumOfAnnotators = 1
      projectRaw.taskDivisions = generateTaskDivisions(4)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if annotation task division length greater than 0 \
    when project phase is setting up', async () => {
      projectRaw.taskDivisions = generateTaskDivisions(1)
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if hasLabelSet equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.hasLabelSets = true
      projectRaw.annotationConfig!.labelSets = []
      const project = new Project(projectRaw)
      await expect(project.validate()).rejects.toThrow()
    })

    it('should throw an error if at singleTextConfig, hasLabelSets equals to true but labelSets length equals to 0', async () => {
      projectRaw.annotationConfig!.textConfigs = generateIndividualTextConfig(1)
      projectRaw.annotationConfig!.textConfigs[0].hasLabelSets = true
      projectRaw.annotationConfig!.textConfigs[0].labelSets = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it('should throw an error if inlineLabels equals to true but provide no inlineLabels', async () => {
      projectRaw.annotationConfig!.textConfigs = generateIndividualTextConfig(1)
      projectRaw.annotationConfig!.textConfigs[0].hasInlineLabels = true
      projectRaw.annotationConfig!.textConfigs[0].inlineLabels = []
      await expect(new Project(projectRaw).validate()).rejects.toThrow()
    })

    it("should throw an error if phase of project is 'done' but doesn't have completion time", async () => {
      const project = await Project.create(projectRaw)
      project.phase = PROJECT_PHASES.DONE
      await expect(project.save()).rejects.toThrow()
    })
  })

  describe('Project uniqueness', () => {
    it('should throw an error if save a project with name and project type already exist', async () => {
      await Project.create(projectRaw)

      const projectRaw2 = generateProject()
      projectRaw2.name = projectRaw.name as string
      projectRaw2.projectType = projectRaw.projectType as string
      await expect(Project.create(projectRaw2)).rejects.toThrow()
    })
  })
})
