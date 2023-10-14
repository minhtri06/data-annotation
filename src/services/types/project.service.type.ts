import { IRawProject } from '@src/models'

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
