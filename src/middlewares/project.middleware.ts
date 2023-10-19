import { ROLES } from '@src/configs/role.config'
import { TYPES } from '@src/constants'
import { IProjectService } from '@src/services'
import {
  Exception,
  ForbiddenException,
  NotfoundException,
} from '@src/services/exceptions'
import { CustomRequest } from '@src/types'
import { NextFunction, RequestHandler, Response } from 'express'
import { inject, injectable } from 'inversify'

export interface IProjectMiddleware {
  getProjectById: RequestHandler

  requireToBeProjectManager: (options?: { allowAdmin?: boolean }) => RequestHandler
}

@injectable()
export class ProjectMiddleware implements IProjectMiddleware {
  constructor(@inject(TYPES.PROJECT_SERVICE) private projectService: IProjectService) {}

  getProjectById = async (
    req: CustomRequest<{ params: { projectId?: string } }>,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.params.projectId) {
      return next(new Exception('Wrong middleware setup'))
    }
    const project = await this.projectService.getProjectById(req.params.projectId)
    if (!project) {
      return next(new NotfoundException('Project not found'))
    }
    req.data = { project }
    return next()
  }

  requireToBeProjectManager = ({
    allowAdmin = true,
  }: { allowAdmin?: boolean } = {}): RequestHandler => {
    return (req: CustomRequest, res, next) => {
      if (!req.data?.project || !req.user) {
        return next(new Exception('Wrong middleware setup'))
      }
      if (allowAdmin && req.user.role === ROLES.ADMIN) {
        return next()
      }
      if (!req.data.project.manager?.equals(req.user.id)) {
        return next(new ForbiddenException('Forbidden'))
      }
      next()
    }
  }
}
