import { IRawProjectType, ProjectTypeDocument } from '@src/models'

export interface IProjectTypeService {
  getProjectTypeById(projectTypeId: string): Promise<ProjectTypeDocument | null>

  getAllProjectTypes(): Promise<ProjectTypeDocument[]>

  createProjectType(payload: CreateProjectTypePayload): Promise<ProjectTypeDocument>

  updateProjectType(
    projectType: ProjectTypeDocument,
    payload: UpdateProjectTypePayload,
  ): Promise<void>

  deleteProjectType(projectType: ProjectTypeDocument): Promise<void>
}

// * parameter types

export type CreateProjectTypePayload = Readonly<Pick<IRawProjectType, 'name'>>

export type UpdateProjectTypePayload = Readonly<Partial<Pick<IRawProjectType, 'name'>>>
