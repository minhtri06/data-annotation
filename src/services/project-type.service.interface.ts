import { ProjectTypeDocument } from '@src/types'
import { IRawProjectType } from '@src/models'

export interface IProjectTypeService {
  getProjectTypeById(projectTypeId: string): Promise<ProjectTypeDocument | null>

  getAllProjectTypes(): Promise<ProjectTypeDocument[]>

  createProjectType(
    payload: Readonly<Pick<IRawProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument>

  updateProjectType(
    projectType: ProjectTypeDocument,
    payload: Readonly<Partial<Pick<IRawProjectType, 'name'>>>,
  ): Promise<void>

  deleteProjectType(projectType: ProjectTypeDocument): Promise<void>
}
