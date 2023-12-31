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
import { ROLES } from '@src/configs/role.config'
import { projectTypeSchema as schema } from './schemas'

export const projectTypeControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const { ADMIN } = ROLES

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
      generalMiddleware.auth({ requiredRoles: [ADMIN] }),
      generalMiddleware.validate(schema.createProjectType),
    )
    async createProjectType(req: CustomRequest<schema.CreateProjectType>, res: Response) {
      const projectType = await this.projectTypeService.createProjectType(req.body)
      return res.status(StatusCodes.CREATED).json({ projectType })
    }

    @httpPatch(
      '/:projectTypeId',
      generalMiddleware.auth({ requiredRoles: [ADMIN] }),
      generalMiddleware.validate(schema.updateProjectTypeById),
    )
    async updateProjectTypeById(
      req: CustomRequest<schema.UpdateProjectTypeById>,
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
      generalMiddleware.auth({ requiredRoles: [ADMIN] }),
      generalMiddleware.validate(schema.deleteProjectTypeById),
    )
    async deleteProjectTypeById(
      req: CustomRequest<schema.DeleteProjectTypeById>,
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
