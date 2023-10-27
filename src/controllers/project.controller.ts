import { Response } from 'express'
import { Container, inject } from 'inversify'
import {
  controller,
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
} from 'inversify-express-utils'

import { PROJECT_PHASES, TYPES } from '@src/constants'
import { IGeneralMiddleware, IUploadMiddleware } from '@src/middlewares'
import { IProjectService, IUserService } from '@src/services'
import { ROLES } from '@src/configs/role.config'
import { CustomRequest } from '@src/types'
import { projectSchema as schema } from './schemas'
import { StatusCodes } from 'http-status-codes'
import { pickFields } from '@src/utils'
import { IProjectMiddleware } from '@src/middlewares/project.middleware'
import { ISampleService } from '@src/services/sample.service.interface'

export const projectControllerFactory = (container: Container) => {
  const { ADMIN, MANAGER, ANNOTATOR } = ROLES

  const { auth, validate } = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
  const { uploadSample } = container.get<IUploadMiddleware>(TYPES.UPLOAD_MIDDLEWARE)
  const { getProjectById, requireToBeProjectManager } = container.get<IProjectMiddleware>(
    TYPES.PROJECT_MIDDLEWARE,
  )

  @controller('/projects')
  class ProjectController {
    constructor(
      @inject(TYPES.PROJECT_SERVICE)
      private projectService: IProjectService,
      @inject(TYPES.SAMPLE_SERVICE) private sampleService: ISampleService,
      @inject(TYPES.USER_SERVICE) private userService: IUserService,
    ) {}

    @httpGet('/', auth(), validate(schema.getProjects))
    async getProjects(req: CustomRequest<schema.GetProjects>, res: Response) {
      const filter = pickFields(req.query, 'name', 'projectType')
      const options = pickFields(req.query, 'checkPaginate', 'limit', 'page', 'sort')
      const result = await this.projectService.getProjects(filter, options)
      return res.status(StatusCodes.OK).json(result)
    }

    @httpPost(
      '/',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.createProject),
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

    @httpGet('/:projectId', auth(), validate(schema.getProjectById))
    async getProjectById(req: CustomRequest<schema.GetProjectById>, res: Response) {
      const project = await this.projectService.getProjectById(req.params.projectId, {
        includeAnnotators: true,
        includeManager: true,
        includeProjectType: true,
      })
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      return res.status(StatusCodes.OK).json({ project })
    }

    @httpPatch(
      '/:projectId',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.updateProjectById),
      getProjectById,
      requireToBeProjectManager(),
    )
    async updateProjectById(req: CustomRequest<schema.UpdateProjectById>, res: Response) {
      const project = req.data!.project!
      await this.projectService.updateProject(project, req.body)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpDelete(
      '/:projectId',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.deleteProjectById),
      getProjectById,
    )
    async deleteProjectById(req: CustomRequest<schema.DeleteProjectById>, res: Response) {
      const caller = req.user!
      const project = req.data!.project!
      if (caller.role === MANAGER && !project.manager?.equals(caller.id)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      await this.projectService.deleteProject(project)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPost(
      '/:projectId/samples/upload-samples',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.loadSample),
      getProjectById,
      requireToBeProjectManager(),
      uploadSample('sample:sample-data'),
    )
    async uploadSample(req: CustomRequest<schema.LoadSamples>, res: Response) {
      if (!req.file) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'Data file is required' })
      }
      const project = req.data!.project!
      await this.sampleService.uploadSamplesToProject(project, req.file.filename)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/phases',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.turnProjectToNextPhase),
      getProjectById,
      requireToBeProjectManager(),
    )
    async turnProjectToNextPhase(
      req: CustomRequest<schema.TurnProjectToNextPhase>,
      res: Response,
    ) {
      const project = req.data!.project!
      await this.projectService.turnProjectToNextPhase(project)
      return res.status(StatusCodes.OK).json({
        message: 'Turn project to next phase successfully',
        currentPhase: project.phase,
      })
    }

    @httpPatch(
      '/:projectId/join-project',
      auth({ requiredRoles: [ANNOTATOR] }),
      validate(schema.joinProject),
      getProjectById,
    )
    async joinProject(req: CustomRequest<schema.JoinProject>, res: Response) {
      const project = req.data!.project!
      const user = req.user!
      await this.projectService.joinProject(project, user.id)
      return res.status(StatusCodes.OK).json({
        message: 'Join project successfully',
        divisions: project.taskDivisions,
      })
    }

    @httpPatch(
      '/:projectId/leave-project',
      auth({ requiredRoles: [ANNOTATOR] }),
      validate(schema.leaveProject),
      getProjectById,
    )
    async leaveProject(req: CustomRequest<schema.LeaveProject>, res: Response) {
      const project = req.data!.project!
      await this.projectService.leaveProject(project, req.user!.id)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpGet(
      '/:projectId/samples',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.getProjectSamples),
      getProjectById,
      requireToBeProjectManager(),
    )
    async getProjectSamples(req: CustomRequest<schema.GetProjectSamples>, res: Response) {
      const project = req.data!.project!
      const options = pickFields(req.query, 'checkPaginate', 'limit', 'page')

      const result = await this.sampleService.getProjectSamples(project, options)
      return res.status(StatusCodes.OK).json(result)
    }

    @httpGet(
      '/:projectId/divisions/:divisionId/samples',
      auth(),
      validate(schema.getDivisionSamples),
      getProjectById,
    )
    async getDivisionSamples(
      req: CustomRequest<schema.GetDivisionSample>,
      res: Response,
    ) {
      const user = req.user!
      const project = req.data!.project!
      const division = project.taskDivisions.id(req.params.divisionId)
      if (!division) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Division not found' })
      }
      if (
        user.role !== ADMIN &&
        !project.manager?.equals(user.id) &&
        !division.annotator?.equals(user.id)
      ) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      const result = await this.sampleService.getDivisionSamples(
        project,
        division,
        req.query,
      )
      return res.status(StatusCodes.OK).json(result)
    }

    @httpPatch(
      '/:projectId/samples/:sampleId/annotate',
      auth({ requiredRoles: [ANNOTATOR] }),
      validate(schema.annotateSample),
    )
    async annotateSample(req: CustomRequest<schema.AnnotateSample>, res: Response) {
      const user = req.user!
      const [project, sample] = await Promise.all([
        this.projectService.getProjectById(req.params.projectId),
        this.sampleService.getSampleById(req.params.sampleId),
      ])
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      if (!sample) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Sample not found' })
      }
      const annotatorDivision = project.taskDivisions.find(
        (d) => d.annotator?.equals(user.id),
      )
      if (!annotatorDivision) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      const { startSample, endSample } = annotatorDivision
      if (project.phase !== PROJECT_PHASES.ANNOTATING || !startSample || !endSample) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: 'Project is not in annotating phase' })
      }
      if (sample.number < startSample || sample.number > endSample) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      await this.sampleService.annotateSample(project, sample, req.body)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/samples/:sampleId/mark-as-a-mistake',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.markSampleAsAMistake),
    )
    async markSampleAsAMistake(
      req: CustomRequest<schema.MarkSampleAsAMistake>,
      res: Response,
    ) {
      const user = req.user!
      const [project, sample] = await Promise.all([
        this.projectService.getProjectById(req.params.projectId),
        this.sampleService.getSampleById(req.params.sampleId),
      ])
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      if (!sample) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Sample not found' })
      }
      if (user.role === MANAGER && !project.manager?.equals(user.id)) {
        return res.json(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      await this.sampleService.markSampleAsAMistake(sample)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/manager/remove',
      auth({ requiredRoles: [ADMIN] }),
      validate(schema.removeManagerFromProject),
      getProjectById,
    )
    async removeManagerFromProject(
      req: CustomRequest<schema.RemoveManagerFromProject>,
      res: Response,
    ) {
      const project = req.data!.project!
      await this.projectService.removeManagerFromProject(project)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/manager/assign',
      auth({ requiredRoles: [ADMIN] }),
      validate(schema.assignManagerToProject),
    )
    async assignManagerToProject(
      req: CustomRequest<schema.AssignManagerToProject>,
      res: Response,
    ) {
      const [project, user] = await Promise.all([
        this.projectService.getProjectById(req.params.projectId),
        this.userService.getUserById(req.body.userId),
      ])
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
      }
      await this.projectService.assignManagerToProject(project, user)
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/annotators/:annotatorId/remove',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.removeAnnotatorFromProject),
      getProjectById,
    )
    async removeAnnotatorFromProject(
      req: CustomRequest<schema.RemoveAnnotatorFromProject>,
      res: Response,
    ) {
      const user = req.user!
      const project = req.data!.project!
      if (user.role === MANAGER && !project.manager?.equals(user.id)) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Forbidden' })
      }
      await this.projectService.removeAnnotatorFromProject(
        project,
        req.params.annotatorId,
      )
      return res.status(StatusCodes.NO_CONTENT).send()
    }

    @httpPatch(
      '/:projectId/divisions/:divisionId/assign',
      auth({ requiredRoles: [ADMIN, MANAGER] }),
      validate(schema.assignAnnotatorToDivision),
    )
    async assignAnnotatorToDivision(
      req: CustomRequest<schema.AssignAnnotatorToDivision>,
      res: Response,
    ) {
      const [project, user] = await Promise.all([
        this.projectService.getProjectById(req.params.projectId),
        this.userService.getUserById(req.body.userId),
      ])
      if (!project) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Project not found' })
      }
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
      }
      await this.projectService.assignAnnotatorToDivision(
        project,
        req.params.divisionId,
        user,
      )
      return res.status(StatusCodes.NO_CONTENT).send()
    }
  }

  return ProjectController
}
