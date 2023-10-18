import { PaginateResult } from '@src/types'

import { IRawProject, ProjectDocument } from '@src/models'

export interface IProjectService {
  getProjectById(projectId: string): Promise<ProjectDocument | null>

  getProjects(
    filter: GetProjectsFilter,
    options: GetProjectsQueryOptions,
  ): Promise<PaginateResult<ProjectDocument>>

  createProject(payload: CreateProjectPayload): Promise<ProjectDocument>

  updateProject(project: ProjectDocument, payload: UpdateProjectPayload): Promise<void>
}

// * Parameter types
export type GetProjectsFilter = Readonly<
  Partial<Pick<IRawProject, 'name' | 'projectType'>>
>
export type GetProjectsQueryOptions = Readonly<{
  limit?: number
  page?: number
  checkPaginate?: boolean
  sort?: string
}>

export type CreateProjectPayload = Readonly<
  Pick<
    IRawProject,
    | 'name'
    | 'requirement'
    | 'description'
    | 'maximumOfAnnotators'
    | 'annotationConfig'
    | 'projectType'
    | 'manager'
  >
>

export type UpdateProjectPayload = Readonly<
  Partial<
    Pick<
      IRawProject,
      | 'name'
      | 'requirement'
      | 'description'
      | 'maximumOfAnnotators'
      | 'annotationConfig'
      | 'projectType'
    >
  >
>
