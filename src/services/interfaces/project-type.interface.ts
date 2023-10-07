import { IProjectType, IProjectTypeModel } from '@src/models/interfaces'
import { IModelService } from '../abstracts/model.service'
import { ProjectTypeDocument } from '@src/types'

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
