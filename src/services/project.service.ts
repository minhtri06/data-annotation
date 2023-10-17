import { IProjectModel } from '@src/models'
import { PaginateResult, ProjectDocument } from '@src/types'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  IProjectService,
  UpdateProjectPayload,
} from './project.service.interface'
import { inject, injectable } from 'inversify'
import { Exception } from './exceptions'
import { validateSortFields } from '@src/helpers'

@injectable()
export class ProjectService implements IProjectService {
  constructor(@inject(TYPES.PROJECT_MODEL) private Project: IProjectModel) {}

  async getProjectById(projectId: string): Promise<ProjectDocument | null> {
    return await this.Project.findById(projectId)
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
      status: PROJECT_STATUS.SETTING_UP,
      numberOfSamples: 0,
      annotationTaskDivision: [],
      completionTime: undefined,
    })

    return project.save()
  }

  async updateProject(
    project: ProjectDocument,
    payload: UpdateProjectPayload,
  ): Promise<void> {
    if (project.isModified()) {
      throw new Exception('Project is modified before call update')
    }

    Object.assign(project, payload)

    await project.save()
  }
}
