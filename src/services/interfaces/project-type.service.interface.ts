import { IProjectType, IProjectTypeModel } from '@src/models/interfaces'
import { ProjectTypeDocument } from '@src/types'
import { IModelService } from './model.service.interface'

export interface IProjectTypeService
  extends IModelService<IProjectType, IProjectTypeModel> {
  createProjectType(
    payload: Readonly<Pick<IProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument>

  updateProjectType(
    projectType: ProjectTypeDocument,
    payload: Readonly<Partial<Pick<IProjectType, 'name'>>>,
  ): Promise<void>

  deleteProjectType(projectType: ProjectTypeDocument): Promise<void>
}
