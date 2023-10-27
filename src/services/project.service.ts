import {
  IProjectModel,
  ISampleModel,
  IUserModel,
  ProjectDocument,
  UserDocument,
} from '@src/models'
import { PaginateResult } from '@src/types'
import { PROJECT_PHASES, SAMPLE_STATUSES, TYPES } from '@src/constants'
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
import { Exception, NotAllowedException, NotfoundException } from './exceptions'
import { ISampleStorageService } from './sample-storage.service.interface'
import { ROLES } from '@src/configs/role.config'

@injectable()
export class ProjectService implements IProjectService {
  constructor(
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
    @inject(TYPES.SAMPLE_MODEL) private Sample: ISampleModel,
    @inject(TYPES.USER_MODEL) private User: IUserModel,
    @inject(TYPES.SAMPLE_STORAGE_SERVICE)
    private sampleStorageService: ISampleStorageService,
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

  async deleteProject(project: ProjectDocument) {
    await this.Sample.deleteMany({ project: project._id })
    await project.deleteOne()
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
      case PROJECT_PHASES.ANNOTATING: {
        const notAnnotatedSampleCount = await this.Sample.countDocuments({
          status: { $ne: SAMPLE_STATUSES.ANNOTATED },
        })

        if (notAnnotatedSampleCount !== 0) {
          throw new NotAllowedException(
            `There are ${notAnnotatedSampleCount} sample not in 'annotated' status`,
          )
        }

        project.phase = PROJECT_PHASES.DONE
        project.completionTime = new Date()
        await project.save()

        await project.populate('taskDivisions.annotator')

        const now = new Date()
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()

        await Promise.all(
          project.taskDivisions.map((division) => {
            const annotator = division.annotator
            if (annotator instanceof this.User) {
              let lastMonthAnnotation = annotator.monthlyAnnotations.at(-1)
              if (
                !lastMonthAnnotation ||
                lastMonthAnnotation.month !== thisMonth ||
                lastMonthAnnotation.year !== thisYear
              ) {
                annotator.monthlyAnnotations.push({
                  month: thisMonth,
                  year: thisYear,
                  annotationTotal: 0,
                })
                lastMonthAnnotation = annotator.monthlyAnnotations.at(-1)
              }
              lastMonthAnnotation!.annotationTotal +=
                division.endSample! - division.startSample! + 1
              return annotator.save()
            } else {
              throw new Exception("Division's annotator doesn't exist")
            }
          }),
        )

        project.depopulate()

        break
      }
      case PROJECT_PHASES.DONE:
        throw new NotAllowedException('Done is the final phase')
        break
      default:
        throw new Exception('Project with wrong phase value')
        break
    }
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
    const division = project.taskDivisions.find((d) => d.annotator?.equals(userId))
    if (division) {
      throw new NotAllowedException('You are already in the project', {
        type: 'already-in-project',
      })
    }
    project.taskDivisions.push({ annotator: userId })
    await project.save()
  }

  async removeManagerFromProject(project: ProjectDocument) {
    if (project.phase === PROJECT_PHASES.DONE) {
      throw new NotAllowedException("Cannot remove manager from project that is 'done'")
    }
    project.manager = undefined
    await project.save()
  }

  async assignManagerToProject(project: ProjectDocument, user: UserDocument) {
    if (user.role !== ROLES.MANAGER) {
      throw new NotAllowedException('User is not a manager')
    }
    const hasManager = !!project.manager
    if (hasManager) {
      throw new NotAllowedException('Project already has a manager')
    }
    project.manager = user._id
    await project.save()
  }

  async removeAnnotatorFromProject(project: ProjectDocument, annotatorId: string) {
    if (project.phase === PROJECT_PHASES.DONE) {
      throw new NotAllowedException("Cannot remove annotator from project that is 'done'")
    }
    const division = project.taskDivisions.find(
      (division) => division.annotator?.equals(annotatorId),
    )
    if (!division) {
      throw new NotAllowedException('Annotator is not in project')
    }
    if (project.phase === PROJECT_PHASES.OPEN_FOR_JOINING) {
      // remove the division entirely
      project.taskDivisions.pull(division._id)
    } else if (project.phase === PROJECT_PHASES.ANNOTATING) {
      // if project is in anno set annotator to null
      division.annotator = null
    }
    await project.save()
  }

  async assignAnnotatorToDivision(
    project: ProjectDocument,
    divisionId: string,
    user: UserDocument,
  ) {
    if (user.role !== ROLES.ANNOTATOR) {
      throw new NotAllowedException('User is not an annotator')
    }
    const division = project.taskDivisions.id(divisionId)
    if (!division) {
      throw new NotfoundException('Division not found')
    }
    if (division.annotator) {
      throw new NotAllowedException('Division already has an annotator')
    }
    division.annotator = user._id
    await project.save()
  }
}
