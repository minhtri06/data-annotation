import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Container, inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from 'inversify-express-utils'

import { TYPES } from '@src/constants'
import { IGeneralMiddleware } from '@src/middlewares'
import { IProjectTypeService } from '@src/services'
import { CustomRequest } from '@src/types'
import { PRIVILEGES } from '@src/configs/role.config'
import { projectTypeRequestValidation as validation } from './request-validations'
import {
  CreateProjectType,
  DeleteProjectTypeById,
  UpdateProjectTypeById,
} from './request-schemas'

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
      const projectTypes = await this.projectTypeService.getAllProjectTypes()
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

    @httpPatch(
      '/:projectTypeId',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.UPDATE_PROJECT_TYPES] }),
      generalMiddleware.validate(validation.updateProjectTypeById),
    )
    async updateProjectTypeById(
      req: CustomRequest<UpdateProjectTypeById>,
      res: Response,
    ) {
      const projectType = await this.projectTypeService.getProjectTypeById(
        req.params.projectTypeId,
      )
      if (!projectType) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Project type not found' })
      }

      await this.projectTypeService.updateProjectType(projectType, req.body)
      return res.status(StatusCodes.OK).json({ projectType })
    }

    @httpDelete(
      '/:projectTypeId',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.DELETE_PROJECT_TYPES] }),
      generalMiddleware.validate(validation.deleteProjectTypeById),
    )
    async deleteProjectTypeById(
      req: CustomRequest<DeleteProjectTypeById>,
      res: Response,
    ) {
      const projectType = await this.projectTypeService.getProjectTypeById(
        req.params.projectTypeId,
      )
      if (!projectType) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Project type not found' })
      }

      await this.projectTypeService.deleteProjectType(projectType)
      return res.status(StatusCodes.NO_CONTENT).send()
    }
  }

  return ProjectTypeController
}
