import { PaginateResult, ProjectDocument } from '@src/types'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  UpdateProjectPayload,
} from './types'

export interface IProjectService {
  getProjectById(projectId: string): Promise<ProjectDocument | null>

  getProjects(
    filter: GetProjectsFilter,
    options: GetProjectsQueryOptions,
  ): Promise<PaginateResult<ProjectDocument>>

  createProject(payload: CreateProjectPayload): Promise<ProjectDocument>

  updateProject(project: ProjectDocument, payload: UpdateProjectPayload): Promise<void>
}
