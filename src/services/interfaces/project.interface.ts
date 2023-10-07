import { IProject, IProjectModel } from '@src/models/interfaces'
import { IModelService } from '../abstracts/model.service'

export interface IProjectService extends IModelService<IProject, IProjectModel> {}
