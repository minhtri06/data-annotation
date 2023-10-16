import { inject, injectable } from 'inversify'

import { IProjectModel, IProjectType, IProjectTypeModel } from '@src/models'
import { ProjectTypeDocument } from '@src/types'
import { projectTypeValidation as validation } from './validations'
import { TYPES } from '@src/constants'
import { IProjectTypeService } from './project-type.service.interface'
import { NotAllowedException } from './exceptions'
import { validate } from '@src/helpers'

@injectable()
export class ProjectTypeService implements IProjectTypeService {
  constructor(
    @inject(TYPES.PROJECT_TYPE_MODEL) private ProjectType: IProjectTypeModel,
    @inject(TYPES.PROJECT_MODEL) private Project: IProjectModel,
  ) {}

  async getProjectTypeById(projectTypeId: string): Promise<ProjectTypeDocument | null> {
    validate(projectTypeId, validation.getProjectTypeById.projectTypeId)

    return await this.ProjectType.findById(projectTypeId)
  }

  async getAllProjectTypes(): Promise<ProjectTypeDocument[]> {
    return await this.ProjectType.find()
  }

  async createProjectType(
    payload: Readonly<Pick<IProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument> {
    validate(payload, validation.createProjectType.payload)

    const projectType = await this.ProjectType.create(payload)

    return projectType
  }

  async updateProjectType(
    projectType: ProjectTypeDocument,
    payload: Readonly<Partial<Pick<IProjectType, 'name'>>>,
  ): Promise<void> {
    validate(payload, validation.updateProjectType.payload)

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
