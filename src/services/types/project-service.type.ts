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
