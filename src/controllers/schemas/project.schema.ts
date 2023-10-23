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

      textConfigs: {
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

      textConfigs: Joi.array()
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

      textConfigs: Joi.array()
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

export type JoinProject = {
  params: {
    projectId: string
  }
}
export const joinProject: CustomSchemaMap<JoinProject> = {
  params: {
    projectId: stringId.required(),
  },
}

export type GetProjectSamples = {
  params: {
    projectId: string
  }
  query: {
    limit?: number
    page?: number
    checkPaginate?: boolean
  }
}
export const getProjectSamples: CustomSchemaMap<GetProjectSamples> = {
  params: {
    projectId: stringId.required(),
  },
  query: {
    limit: querySchema.limit,
    page: querySchema.page,
    checkPaginate: querySchema.checkPaginate,
  },
}

export type TurnProjectToNextPhase = {
  params: {
    projectId: string
  }
}
export const turnProjectToNextPhase: CustomSchemaMap<TurnProjectToNextPhase> = {
  params: {
    projectId: stringId.required(),
  },
}

export type LoadSamples = {
  params: {
    projectId: string
  }
}
export const loadSample: CustomSchemaMap<LoadSamples> = {
  params: {
    projectId: stringId.required(),
  },
}

export type GetDivisionSample = {
  params: {
    projectId: string
    divisionId: string
  }
  query: {
    limit?: number
    page?: number
    checkPaginate?: boolean
  }
}
export const getDivisionSamples: CustomSchemaMap<GetDivisionSample> = {
  params: {
    projectId: stringId.required(),
    divisionId: stringId.required(),
  },
  query: {
    limit: querySchema.limit,
    page: querySchema.page,
    checkPaginate: querySchema.checkPaginate,
  },
}

export type AnnotateSample = {
  params: {
    projectId: string
    sampleId: string
  }
  body: {
    labelings: string[][] | null

    generatedTexts: string[] | null

    textAnnotations: {
      labelings: string[][] | null

      inlineLabelings: { startAt: number; endAt: number; label: string }[] | null
    }[]
  }
}
export const annotateSample: CustomSchemaMap<AnnotateSample> = {
  params: {
    projectId: stringId.required(),
    sampleId: stringId.required(),
  },
  body: {
    labelings: Joi.array().items(Joi.array().items(Joi.string())).default(null),

    generatedTexts: Joi.array().items(Joi.string()).default(null),

    textAnnotations: Joi.array()
      .items(
        Joi.object({
          labelings: Joi.array().items(Joi.array().items(Joi.string())).default(null),

          inlineLabelings: Joi.array()
            .items(
              Joi.object({
                startAt: Joi.number().integer().required(),
                endAt: Joi.number().integer().required(),
                label: Joi.string().required().required(),
              }),
            )
            .default(null),
        }),
      )
      .default([]),
  },
}

export type MarkSampleAsAMistake = {
  params: {
    projectId: string
    sampleId: string
  }
}
export const markSampleAsAMistake: CustomSchemaMap<MarkSampleAsAMistake> = {
  params: {
    projectId: stringId.required(),
    sampleId: stringId.required(),
  },
}
