import { IProjectModel, IRawProject } from '@src/models'
import {
  CreateProjectPayload,
  GetProjectsFilter,
  GetProjectsQueryOptions,
  UpdateProjectPayload,
} from './types'
import { PaginateResult, ProjectDocument } from '@src/types'
import { projectValidation as validation } from './validations'
import { PROJECT_STATUS, TYPES } from '@src/constants'
import { IProjectService } from './project.service.interface'
import { inject, injectable } from 'inversify'
import { validate } from '@src/helpers'
import { Exception, ValidationException } from './exceptions'

@injectable()
export class ProjectService implements IProjectService {
  constructor(@inject(TYPES.PROJECT_MODEL) private Project: IProjectModel) {}

  async getProjectById(projectId: string): Promise<ProjectDocument | null> {
    validate(projectId, validation.getProjectById.projectId)
    return this.Project.findById(projectId)
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

    return this.Project.paginate(filter, _options)
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
      throw new ValidationException('Project has no annotation config', {
        type: 'project-has-no-annotation',
      })
    }

    if (annotationConfig.hasLabelSets && annotationConfig.labelSets.length === 0) {
      throw new ValidationException(
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
        throw new ValidationException(
          `At annotationConfig.individualTextConfig[${i}], hasLabelSets is true but labelSets is empty`,
          { type: 'conflict-annotation-config' },
        )
      }
      if (
        individualTextConfig.inlineLabels &&
        individualTextConfig.inlineLabels.length === 0
      ) {
        throw new ValidationException(
          'At annotationConfig.individualTextConfig[${i}], inlineLabels is true but inlineLabels is empty',
          { type: 'conflict-annotation-config' },
        )
      }
    }
  }

  async createProject(payload: CreateProjectPayload): Promise<ProjectDocument> {
    validate(payload, validation.createProject.payload)

    this.validateAnnotationConfig(payload.annotationConfig)

    const project = new this.Project({
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
    if (project.isModified()) {
      throw new Exception('Project is modified before call update')
    }

    validate(payload, validation.updateProject.payload)

    if (payload.annotationConfig) {
      this.validateAnnotationConfig(payload.annotationConfig)
    }

    Object.assign(project, payload)

    await project.save()
  }
}
