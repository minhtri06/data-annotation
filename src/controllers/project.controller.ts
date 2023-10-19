import { Response } from 'express'
import { Container, inject } from 'inversify'
import { controller, httpGet, httpPatch, httpPost } from 'inversify-express-utils'

import { TYPES } from '@src/constants'
import { IGeneralMiddleware } from '@src/middlewares'
import { IProjectService } from '@src/services'
import { ROLES } from '@src/configs/role.config'
import { CustomRequest } from '@src/types'
import { projectSchema as schema } from './schemas'
import { StatusCodes } from 'http-status-codes'
import { pickFields } from '@src/utils'
import { IProjectMiddleware } from '@src/middlewares/project.middleware'
import { Exception } from '@src/services/exceptions'

export const projectControllerFactory = (container: Container) => {
  const { ADMIN, MANAGER } = ROLES

  const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const projectMiddleware = container.get<IProjectMiddleware>(TYPES.PROJECT_MIDDLEWARE)

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
      generalMiddleware.auth({ requiredRoles: [ADMIN, MANAGER] }),
      generalMiddleware.validate(schema.createProject),
    )
    async createProject(req: CustomRequest<schema.CreateProject>, res: Response) {
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
      }

      const payload: typeof req.body & { manager?: string } = { ...req.body }
      if (req.user.role === MANAGER) {
        payload.manager = req.user.id
      }

      const project = await this.projectService.createProject(payload)
      return res.status(StatusCodes.CREATED).json({ project })
    }

    @httpGet(
      '/:projectId',
      generalMiddleware.auth(),
      generalMiddleware.validate(schema.getProjectById),
    )
    async getProjectById(req: CustomRequest<schema.GetProjectById>, res: Response) {
      const project = await this.projectService.getProjectById(req.params.projectId, {
        populate: 'projectType manager',
      })
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      return res.status(StatusCodes.OK).json({ project })
    }

    @httpPatch(
      '/:projectId',
      generalMiddleware.auth({ requiredRoles: [ADMIN, MANAGER] }),
      generalMiddleware.validate(schema.updateProjectById),
      projectMiddleware.getProjectById,
      projectMiddleware.requireToBeProjectManager(),
    )
    async updateProjectById(req: CustomRequest<schema.UpdateProjectById>, res: Response) {
      if (!req.data?.project) {
        throw new Exception('Project is required')
      }
      await this.projectService.updateProject(req.data.project, req.body)
      return res.status(StatusCodes.NO_CONTENT).send()
    }
  }

  return ProjectController
}
