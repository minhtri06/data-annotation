import { Response } from 'express'
import { Container, inject } from 'inversify'
import { controller, httpGet, httpPost } from 'inversify-express-utils'

import { TYPES } from '@src/constants'
import { IGeneralMiddleware } from '@src/middlewares'
import { IProjectService } from '@src/services'
import { PRIVILEGES, ROLES } from '@src/configs/role.config'
import { CustomRequest } from '@src/types'
import { projectSchema as schema } from './schemas'
import { StatusCodes } from 'http-status-codes'
import { pickFields } from '@src/utils'

export const projectControllerFactory = (container: Container) => {
  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)

  @controller('/projects')
  class ProjectController {
    constructor(
      @inject(TYPES.PROJECT_SERVICE)
      protected projectService: IProjectService,
    ) {}

    @httpGet(
      '/',
      generalMiddleware.auth(),
      generalMiddleware.validate(schema.getProjects),
    )
    async getProjects(req: CustomRequest<schema.GetProjects>, res: Response) {
      const filter = pickFields(req.query, 'name', 'projectType')
      const options = pickFields(req.query, 'checkPaginate', 'limit', 'page', 'sort')
      const result = await this.projectService.getProjects(filter, options)
      return res.status(StatusCodes.OK).json(result)
    }

    @httpPost(
      '/',
      generalMiddleware.auth({ requiredPrivileges: [PRIVILEGES.CREATE_PROJECT] }),
      generalMiddleware.validate(schema.createProject),
    )
    async createProject(req: CustomRequest<schema.CreateProject>, res: Response) {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
      }

      const payload: typeof req.body & { manager?: string } = { ...req.body }
      if (req.user.role === ROLES.MANAGER) {
        payload.manager = req.user._id
      }

      const project = await this.projectService.createProject(payload)
      return res.status(StatusCodes.CREATED).json({ project })
    }
  }

  return ProjectController
}
