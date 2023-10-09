import { IProject, IProjectModel } from '@src/models/interfaces'
import { IModelService } from './model.service.interface'
import { ProjectDocument } from '@src/types'
import { CreateProjectPayload, UpdateProjectPayload } from '../types'

export interface IProjectService extends IModelService<IProject, IProjectModel> {
  createProject(payload: CreateProjectPayload): Promise<ProjectDocument>

  updateProject(project: ProjectDocument, payload: UpdateProjectPayload): Promise<void>
}
