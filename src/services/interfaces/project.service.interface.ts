import { IProject, IProjectModel } from '@src/models/interfaces'
import { IModelService } from './model.service.interface'
import { PaginateResult, ProjectDocument } from '@src/types'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  UpdateProjectPayload,
} from '../types'

export interface IProjectService extends IModelService<IProject, IProjectModel> {
  getProjects(
    filter: GetProjectsFilter,
    options: GetProjectsQueryOptions,
  ): Promise<PaginateResult<ProjectDocument>>

  createProject(payload: CreateProjectPayload): Promise<ProjectDocument>

  updateProject(project: ProjectDocument, payload: UpdateProjectPayload): Promise<void>
}
