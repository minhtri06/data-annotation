import { IRawProject, Project } from '@src/models'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  UpdateProjectPayload,
} from './types'
import { PaginateResult, ProjectDocument } from '@src/types'
import { ApiError, validate } from '@src/utils'
import { projectValidation as validation } from './validations'
import { StatusCodes } from 'http-status-codes'
import { PROJECT_STATUS } from '@src/constants'
import { IProjectService } from './project.service.interface'
import { injectable } from 'inversify'
import { customId } from './validations/custom.validation'

@injectable()
export class ProjectService implements IProjectService {
  async getProjectById(projectId: string): Promise<ProjectDocument | null> {
    if (customId.required().validate(projectId).error) {
      throw new ApiError(400, 'Project id is invalid')
    }
    return Project.findById(projectId)
  }

  async getProjects(
    filter: GetProjectsFilter = {},
    options: GetProjectsQueryOptions = {},
  ): Promise<PaginateResult<ProjectDocument>> {
    validate(filter, validation.getProjectsFilter)
    validate(options, validation.getProjectsQueryOptions)

    const _options = { ...options }
    if (!_options.sort) {
      _options.sort = '-createdAt'
    }

    return Project.paginate(filter, _options)
  }

  protected validateAnnotationConfig(
    annotationConfig: Readonly<IRawProject['annotationConfig']>,
  ) {
    if (
      !annotationConfig.hasLabelSets &&
      !annotationConfig.hasGeneratedTexts &&
      annotationConfig.individualTextConfigs.every((individualTextConfig) => {
        return !individualTextConfig.hasLabelSets && !individualTextConfig.hasInlineLabels
      })
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Project has no annotation config', {
        type: 'has-no-annotation',
      })
    }

    if (annotationConfig.hasLabelSets && annotationConfig.labelSets.length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'annotationConfig.hasLabelSets is tru but annotationConfig.labelSets is empty',
        { type: 'conflict-annotation-config' },
      )
    }
    for (let i = 0; i < annotationConfig.individualTextConfigs.length; i++) {
      const individualTextConfig = annotationConfig.individualTextConfigs[i]
      if (
        individualTextConfig.hasLabelSets &&
        individualTextConfig.labelSets.length === 0
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `At annotationConfig.individualTextConfig[${i}], hasLabelSets is true but labelSets is empty`,
          { type: 'conflict-annotation-config' },
        )
      }
      if (
        individualTextConfig.inlineLabels &&
        individualTextConfig.inlineLabels.length === 0
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'At annotationConfig.individualTextConfig[${i}], inlineLabels is true but inlineLabels is empty',
          { type: 'conflict-annotation-config' },
        )
      }
    }
  }

  async createProject(payload: CreateProjectPayload): Promise<ProjectDocument> {
    validate(payload, validation.createProjectPayload)

    this.validateAnnotationConfig(payload.annotationConfig)

    const project = new Project({
      ...payload,
      status: PROJECT_STATUS.SETTING_UP,
      numberOfSamples: 0,
      annotationTaskDivision: [],
      completionTime: undefined,
    })

    return project.save()
  }

  async updateProject(
    project: ProjectDocument,
    payload: UpdateProjectPayload,
  ): Promise<void> {
    validate(payload, validation.updateProjectPayload)

    if (project.isModified()) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Project is modified before update',
        { type: 'project-modified-before-update' },
      )
    }

    if (payload.annotationConfig) {
      this.validateAnnotationConfig(payload.annotationConfig)
    }

    Object.assign(project, payload)

    await project.save()
  }
}
