import { IProject, IProjectModel } from '@src/models/interfaces'
import { ModelService } from './abstracts/model.service'
import { IProjectService } from './interfaces'
import { Project } from '@src/models'

export class ProjectService
  extends ModelService<IProject, IProjectModel>
  implements IProjectService
{
  protected Model: IProjectModel = Project
}
