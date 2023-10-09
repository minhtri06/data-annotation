import { IProject } from '@src/models/interfaces'

export type CreateProjectPayload = Pick<
  IProject,
  | 'name'
  | 'projectType'
  | 'requirement'
  | 'description'
  | 'manager'
  | 'maximumOfAnnotators'
  | 'annotationConfig'
>

export type UpdateProjectPayload = Partial<
  Pick<
    IProject,
    | 'name'
    | 'projectType'
    | 'requirement'
    | 'description'
    | 'maximumOfAnnotators'
    | 'annotationConfig'
  >
>
