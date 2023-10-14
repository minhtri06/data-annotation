import { inject, injectable } from 'inversify'

import { IProjectType, Project, ProjectType } from '@src/models'
import { ProjectTypeDocument } from '@src/types'
import { ApiError, validate } from '@src/utils'
import { projectTypeValidation as validation } from './validations'
import { TYPES } from '@src/constants'
import { StatusCodes } from 'http-status-codes'
import { IProjectService } from './project.service.interface'
import { IProjectTypeService } from './project-type.service.interface'
import { customId } from './validations/custom.validation'

@injectable()
export class ProjectTypeService implements IProjectTypeService {
  constructor(@inject(TYPES.PROJECT_SERVICE) protected projectService: IProjectService) {}

  async getProjectTypeById(projectTypeId: string): Promise<ProjectTypeDocument | null> {
    if (customId.required().validate(projectTypeId).error) {
      throw new ApiError(400, 'Project type id is invalid')
    }
    return await ProjectType.findById(projectTypeId)
  }

  async getAllProjectTypes(): Promise<ProjectTypeDocument[]> {
    return await ProjectType.find()
  }

  async createProjectType(
    payload: Readonly<Pick<IProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument> {
    validate(payload, validation.createProjectTypePayload)

    const projectType = await ProjectType.create(payload)

    return projectType
  }

  async updateProjectType(
    projectType: ProjectTypeDocument,
    payload: Readonly<Partial<Pick<IProjectType, 'name'>>>,
  ): Promise<void> {
    validate(payload, validation.updateProjectTypePayload)

    Object.assign(projectType, payload)

    await projectType.save()
  }

  async deleteProjectType(projectType: ProjectTypeDocument): Promise<void> {
    const projectCount = await Project.countDocuments({
      projectType: projectType._id,
    })
    if (projectCount > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cannot delete project type because it has projects',
      )
    }

    await projectType.deleteOne()
  }
}
