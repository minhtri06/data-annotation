import { IProjectModel, ISampleModel, ProjectDocument } from '@src/models'
import { PaginateResult } from '@src/types'
import { PROJECT_PHASES, TYPES } from '@src/constants'
import {
  CreateProjectPayload,
  GetProjectByIdOptions,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  IProjectService,
  UpdateProjectPayload,
} from './project.service.interface'
import { inject, injectable } from 'inversify'
import { validateSortFields } from '@src/helpers'
import { NotAllowedException } from './exceptions'
import { ISampleStorageService } from './sample-storage.service.interface'

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
    @inject(TYPES.SAMPLE_MODEL) private Sample: ISampleModel,
  ) {}

  async getProjectById(
    projectId: string,
    options: GetProjectByIdOptions = {},
  ): Promise<ProjectDocument | null> {
    const query = this.Project.findById(projectId)
    if (options) {
      if (options.includeAnnotators) {
        void query.populate({
          path: 'taskDivisions.annotator',
          select: 'name avatar _id',
        })
      }
      if (options.includeManager) {
        void query.populate({
          path: 'manager',
          select: '_id name avatar',
        })
      }
      if (options.includeProjectType) {
        void query.populate('projectType')
      }
    }
    return await query
  }

  async getProjects(
    filter: GetProjectsFilter = {},
    options: GetProjectsQueryOptions = {},
  ): Promise<PaginateResult<ProjectDocument>> {
    if (options.sort) {
      validateSortFields(options.sort, ['name', 'createdAt'])
    }
    return this.Project.paginate(filter, { sort: '-createdAt', ...options })
  }

  async createProject(payload: CreateProjectPayload): Promise<ProjectDocument> {
    const project = new this.Project({
      ...payload,
      phase: PROJECT_PHASES.SETTING_UP,
      numberOfSamples: 0,
      taskDivisions: [],
      completionTime: undefined,
    })

    return project.save()
  }

  async updateProject(
    project: ProjectDocument,
    payload: UpdateProjectPayload,
  ): Promise<void> {
    Object.assign(project, payload)

    await project.save()
  }

  private divideAnnotationTask(project: ProjectDocument) {
    /**
     * * suppose numberOfSample = 50, numberOfAnnotator = 3.
     * * => quotient = 16, remainder = 2
     * * => 2 (remainder) first annotators do 16 + 1 samples, 1 left annotator does 16 samples
     * * => sampleDivision = [17, 17, 12]
     */
    const division = project.taskDivisions
    const numberOfSamples = project.numberOfSamples

    const numberOfAnnotators = division.length

    const quotient = Math.floor(numberOfSamples / numberOfAnnotators)
    const remainder = numberOfSamples % numberOfAnnotators

    const sampleDivision = Array(numberOfAnnotators).fill(quotient) as number[]
    for (let i = 0; i < remainder; i++) {
      sampleDivision[i]++
    }

    let startSample = 1
    for (let i = 0; i < numberOfAnnotators; i++) {
      project.taskDivisions[i].startSample = startSample
      project.taskDivisions[i].endSample = startSample + sampleDivision[i] - 1
      startSample += sampleDivision[i]
    }
  }

  async turnProjectToNextPhase(project: ProjectDocument) {
    switch (project.phase) {
      case PROJECT_PHASES.SETTING_UP:
        if (project.numberOfSamples === 0) {
          throw new NotAllowedException('Project has no sample', {
            type: 'project-has-no-sample',
          })
        }
        project.phase = PROJECT_PHASES.OPEN_FOR_JOINING
        await project.save()

        break
      case PROJECT_PHASES.OPEN_FOR_JOINING:
        if (project.taskDivisions.length === 0) {
          throw new NotAllowedException('Project has no division')
        }
        this.divideAnnotationTask(project)
        project.phase = PROJECT_PHASES.ANNOTATING
        await project.save()

        break
      case PROJECT_PHASES.ANNOTATING:
        // TODO: implement
        throw new Error('Not implemented')
        break
      case PROJECT_PHASES.DONE:
        // TODO: implement
        throw new Error('Not implemented')
        break
      default:
        break
    }
  }

  async joinProject(project: ProjectDocument, userId: string) {
    if (project.phase !== PROJECT_PHASES.OPEN_FOR_JOINING) {
      throw new NotAllowedException('Project is not open for joining', {
        type: 'not-open-for-joining',
      })
    }
    if (project.taskDivisions.length >= project.maximumOfAnnotators) {
      throw new NotAllowedException('Project division is full', {
        type: 'division-is-full',
      })
    }
    const division = project.taskDivisions.find((d) => d.annotator.equals(userId))
    if (division) {
      throw new NotAllowedException('You are already in the project', {
        type: 'already-in-project',
      })
    }
    project.taskDivisions.push({ annotator: userId })
    await project.save()
  }
}
