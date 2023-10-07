import { IProject, IProjectModel } from '@src/models/interfaces'
import { IModelService } from './model-service.interface'

export interface IProjectService extends IModelService<IProject, IProjectModel> {}
