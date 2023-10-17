import { inject, injectable } from 'inversify'

import { IProjectModel, IProjectTypeModel, IRawProjectType } from '@src/models'
import { ProjectTypeDocument } from '@src/types'
import { TYPES } from '@src/constants'
import { IProjectTypeService } from './project-type.service.interface'
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
    payload: Readonly<Pick<IRawProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument> {
    const projectType = await this.ProjectType.create(payload)

    return projectType
  }

  async updateProjectType(
    projectType: ProjectTypeDocument,
    payload: Readonly<Partial<Pick<IRawProjectType, 'name'>>>,
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
