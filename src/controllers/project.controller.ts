import { Response } from 'express'
import { Container, inject } from 'inversify'
import { controller, httpPost } from 'inversify-express-utils'

import { TYPES } from '@src/constants'
import { IGeneralMiddleware } from '@src/middlewares'
import { IProjectService } from '@src/services/interfaces'
import { PRIVILEGES, ROLES } from '@src/configs/role.config'
import { CustomRequest, DocumentId } from '@src/types'
import { projectRequestValidation as validation } from './request-validations'
import { CreateProject } from './request-schemas'
import { ApiError } from '@src/utils'
import { StatusCodes } from 'http-status-codes'

export const projectControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/projects')
  class ProjectController {
    constructor(
      @inject(TYPES.PROJECT_SERVICE)
      protected projectService: IProjectService,
    ) {}

    @httpPost(
      '/',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.CREATE_PROJECT] }),
      generalMiddleware.validate(validation.createProject),
    )
    async createProject(req: CustomRequest<CreateProject>, res: Response) {
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized')
      }

      const payload: typeof req.body & { manager?: DocumentId } = { ...req.body }
      if (req.user.role === ROLES.MANAGER) {
        payload.manager = req.user._id
      }

      const project = await this.projectService.createProject(payload)
      return res.status(StatusCodes.CREATED).json({ project })
    }
  }

  return ProjectController
}
