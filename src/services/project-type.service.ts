import { IProjectType, IProjectTypeModel } from '@src/models/interfaces'
import { inject, injectable } from 'inversify'

import { ModelService } from './abstracts/model.service'
import { ProjectType } from '@src/models'
import { ProjectTypeDocument } from '@src/types'
import { ApiError, validate } from '@src/utils'
import { projectTypeValidation as validation } from './validations'
import { IProjectService, IProjectTypeService } from './interfaces'
import { TYPES } from '@src/constants'
import { StatusCodes } from 'http-status-codes'

@injectable()
export class ProjectTypeService
  extends ModelService<IProjectType, IProjectTypeModel>
  implements IProjectTypeService
{
  protected Model: IProjectTypeModel = ProjectType

  constructor(@inject(TYPES.PROJECT_SERVICE) protected projectService: IProjectService) {
    super()
  }

  async createProjectType(
    payload: Readonly<Pick<IProjectType, 'name'>>,
  ): Promise<ProjectTypeDocument> {
    validate(payload, validation.createProjectTypePayload)

    const projectType = await this.Model.create(payload)

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
    const projectCount = await this.projectService.countDocuments({
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
