import { IProjectModel, ProjectDocument } from '@src/models'
import { PaginateResult } from '@src/types'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  IProjectService,
  UpdateProjectPayload,
} from './project.service.interface'
import { inject, injectable } from 'inversify'
import { validateSortFields } from '@src/helpers'

@injectable()
export class ProjectService implements IProjectService {
  constructor(@inject(TYPES.PROJECT_MODEL) private Project: IProjectModel) {}

  async getProjectById(
    projectId: string,
    { populate }: { populate?: string } = {},
  ): Promise<ProjectDocument | null> {
    const query = this.Project.findById(projectId)
    if (populate) {
      void query.populate(populate)
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
    Object.assign(project, payload)

    await project.save()
  }
}
