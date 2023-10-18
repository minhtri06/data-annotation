import { inject, injectable } from 'inversify'

import { IProjectModel, IProjectTypeModel, ProjectTypeDocument } from '@src/models'
import { TYPES } from '@src/constants'
import {
  CreateProjectTypePayload,
  IProjectTypeService,
  UpdateProjectTypePayload,
} from './project-type.service.interface'
import { NotAllowedException } from './exceptions'

@injectable()
export class ProjectTypeService implements IProjectTypeService {
  constructor(
    @inject(TYPES.PROJECT_TYPE_MODEL) private ProjectType: IProjectTypeModel,
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
  ) {}

  async getProjectTypeById(projectTypeId: string): Promise<ProjectTypeDocument | null> {
    return await this.ProjectType.findById(projectTypeId)
  }

  async getAllProjectTypes(): Promise<ProjectTypeDocument[]> {
    return await this.ProjectType.find()
  }

  async createProjectType(
    payload: CreateProjectTypePayload,
  ): Promise<ProjectTypeDocument> {
    return await this.ProjectType.create(payload)
  }

  async updateProjectType(
    projectType: ProjectTypeDocument,
    payload: UpdateProjectTypePayload,
  ): Promise<void> {
    Object.assign(projectType, payload)

    await projectType.save()
  }

  async deleteProjectType(projectType: ProjectTypeDocument): Promise<void> {
    const projectCount = await this.Project.countDocuments({
      projectType: projectType._id,
    })
    if (projectCount > 0) {
      throw new NotAllowedException('Cannot delete project that has projects', {
        type: 'delete-not-empty-project-type',
      })
    }

    await projectType.deleteOne()
  }
}
