import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Container, inject } from 'inversify'
import { controller, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '@src/configs/constants'
import { IGeneralMiddleware } from '@src/middlewares'
import { IProjectTypeService } from '@src/services/interfaces'
import { CustomRequest } from '@src/types'
import { PRIVILEGES } from '@src/configs/role.config'
import { projectTypeRequestValidation as validation } from './request-validations'
import { CreateProjectType } from './request-schemas'

export const projectTypeControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/project-types')
  class ProjectTypeController {
    constructor(
      @inject(TYPES.PROJECT_TYPE_SERVICE)
      protected projectTypeService: IProjectTypeService,
    ) {}

    @httpGet('/', generalMiddleware.auth())
    async getAllProjectTypes(req: CustomRequest, res: Response) {
      const projectTypes = await this.projectTypeService.getMany()
      return res.status(StatusCodes.OK).json({ projectTypes })
    }

    @httpPost(
      '/',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.CREATE_PROJECT_TYPES] }),
      generalMiddleware.validate(validation.createProjectType),
    )
    async createProjectType(req: CustomRequest<CreateProjectType>, res: Response) {
      const projectType = await this.projectTypeService.createProjectType(req.body)
      return res.status(StatusCodes.CREATED).json({ projectType })
    }
  }

  return ProjectTypeController
}
