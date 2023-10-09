import { IProject, IProjectModel } from '@src/models/interfaces'
import { ModelService } from './abstracts/model.service'
import { IProjectService } from './interfaces'
import { Project } from '@src/models'
import { CreateProjectPayload, UpdateProjectPayload } from './types'
import { ProjectDocument } from '@src/types'
import { ApiError, validate } from '@src/utils'
import { projectValidation as validation } from './validations'
import { StatusCodes } from 'http-status-codes'
import { PROJECT_STATUS } from '@src/constants'

export class ProjectService
  extends ModelService<IProject, IProjectModel>
  implements IProjectService
{
  protected Model: IProjectModel = Project

  protected validateAnnotationConfig(
    annotationConfig: Readonly<IProject['annotationConfig']>,
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

    const project = new this.Model(payload)

    project.status = PROJECT_STATUS.SETTING_UP
    project.numberOfSamples = 0
    project.annotationTaskDivision = []
    project.completionTime = undefined

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
