import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { querySchema, stringId } from './custom.schema'
import { IRawProject } from '@src/models'

export type GetProjects = {
  query: {
    name: string
    projectType: string
    limit: number
    page: number
    checkPaginate: boolean
    sort: string
  }
}
export const getProjects: CustomSchemaMap<GetProjects> = {
  query: {
    name: Joi.string(),
    projectType: stringId,
    limit: querySchema.limit,
    page: querySchema.page,
    checkPaginate: querySchema.checkPaginate,
    sort: querySchema.sort,
  },
}

export type CreateProject = {
  body: {
    name: string

    projectType: string

    requirement: string

    description?: string

    maximumOfAnnotators: number

    annotationConfig: {
      hasLabelSets: boolean
      labelSets: {
        isMultiSelected: boolean
        labels: string[]
      }[]

      hasGeneratedTexts: boolean

      individualTextConfigs: {
        hasLabelSets: boolean
        labelSets: {
          isMultiSelected: boolean
          labels: string[]
        }[]

        hasInlineLabels: boolean
        inlineLabels: string[]
      }[]
    }
  }
}
export const createProject: CustomSchemaMap<CreateProject> = {
  body: {
    name: Joi.string().required(),

    projectType: stringId.required(),

    requirement: Joi.string().required(),

    description: Joi.string(),

    maximumOfAnnotators: Joi.number().integer().min(1).required(),

    annotationConfig: Joi.object({
      hasLabelSets: Joi.boolean().required(),
      labelSets: Joi.array()
        .items({
          isMultiSelected: Joi.boolean().required(),
          labels: Joi.array().items(Joi.string()).required(),
        })
        .required(),

      hasGeneratedTexts: Joi.boolean().required(),

      individualTextConfigs: Joi.array()
        .items({
          hasLabelSets: Joi.boolean().required(),
          labelSets: Joi.array()
            .items({
              isMultiSelected: Joi.boolean().required(),
              labels: Joi.array().items(Joi.string()).required(),
            })
            .required(),

          hasInlineLabels: Joi.boolean().required(),
          inlineLabels: Joi.array().items(Joi.string()).required(),
        })
        .required(),
    }).required(),
  },
}

export type GetProjectById = {
  params: {
    projectId: string
  }
}
export const getProjectById: CustomSchemaMap<GetProjectById> = {
  params: {
    projectId: stringId.required(),
  },
}

export type UpdateProjectById = {
  params: {
    projectId: string
  }
  body: Partial<
    Pick<
      IRawProject,
      | 'name'
      | 'projectType'
      | 'requirement'
      | 'description'
      | 'maximumOfAnnotators'
      | 'annotationConfig'
    >
  >
}
export const updateProjectById: CustomSchemaMap<UpdateProjectById> = {
  params: {
    projectId: stringId.required(),
  },
  body: {
    name: Joi.string(),

    projectType: stringId,

    requirement: Joi.string(),

    description: Joi.string(),

    maximumOfAnnotators: Joi.number().integer().min(1),

    annotationConfig: Joi.object({
      hasLabelSets: Joi.boolean().required(),
      labelSets: Joi.array()
        .items({
          isMultiSelected: Joi.boolean().required(),
          labels: Joi.array().items(Joi.string()).required(),
        })
        .required(),

      hasGeneratedTexts: Joi.boolean().required(),

      individualTextConfigs: Joi.array()
        .items({
          hasLabelSets: Joi.boolean().required(),
          labelSets: Joi.array()
            .items({
              isMultiSelected: Joi.boolean().required(),
              labels: Joi.array().items(Joi.string()).required(),
            })
            .required(),

          hasInlineLabels: Joi.boolean().required(),
          inlineLabels: Joi.array().items(Joi.string()).required(),
        })
        .required(),
    }),
  },
}

export type UploadSamples = {
  params: {
    projectId: string
  }
}
export const uploadSamples: CustomSchemaMap<UploadSamples> = {
  params: {
    projectId: stringId.required(),
  },
}
