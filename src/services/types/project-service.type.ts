import { IProject } from '@src/models/interfaces'

export type CreateProjectPayload = Readonly<
  Pick<
    IProject,
    | 'name'
    | 'projectType'
    | 'requirement'
    | 'description'
    | 'manager'
    | 'maximumOfAnnotators'
    | 'annotationConfig'
  >
>

export type UpdateProjectPayload = Readonly<
  Partial<
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
>
