import Joi from 'joi'

import { idType } from './custom.validation'
import { PROJECT_STATUS } from '@src/constants'

export const projectSchema = {
  name: Joi.string(),

  projectType: idType,

  requirement: Joi.string(),

  description: Joi.string(),

  manager: idType,

  maximumOfAnnotators: Joi.number().min(1),

  numberOfSamples: Joi.number().integer().min(0),

  status: Joi.string().valid(...Object.values(PROJECT_STATUS)),

  completionTime: Joi.date().iso(),

  annotationTaskDivision: {
    annotator: idType,
    startSample: Joi.number().integer().min(1),
    endSample: Joi.number().integer().min(1),
  },

  annotationConfig: {
    hasLabelSets: Joi.boolean(),
    labelSets: {
      isMultiSelected: Joi.boolean(),
      labels: Joi.array().items(Joi.string()),
    },

    hasGeneratedTexts: Joi.boolean(),

    individualTextConfigs: {
      hasLabelSets: Joi.boolean(),
      labelSets: {
        isMultiSelected: Joi.boolean(),
        labels: Joi.array().items(Joi.string()),
      },

      hasInlineLabels: Joi.boolean(),
      inlineLabels: Joi.array().items(Joi.string()),
    },
  },
}

const { annotationConfig } = projectSchema
const { individualTextConfigs } = annotationConfig

export const createProjectPayload = Joi.object({
  name: projectSchema.name.required(),

  projectType: projectSchema.projectType.required(),

  requirement: projectSchema.requirement.required(),

  description: projectSchema.description,

  manager: projectSchema.manager.required(),

  maximumOfAnnotators: projectSchema.maximumOfAnnotators.required(),

  annotationConfig: Joi.object({
    hasLabelSets: annotationConfig.hasLabelSets.required(),
    labelSets: Joi.array()
      .items({
        isMultiSelected: annotationConfig.labelSets.isMultiSelected.required(),
        labels: annotationConfig.labelSets.labels.required(),
      })
      .required(),

    hasGeneratedTexts: annotationConfig.hasGeneratedTexts.required(),

    individualTextConfigs: Joi.array()
      .items({
        hasLabelSets: individualTextConfigs.hasLabelSets.required(),
        labelSets: Joi.array()
          .items({
            isMultiSelected: individualTextConfigs.labelSets.isMultiSelected.required(),
            labels: individualTextConfigs.labelSets.labels.required(),
          })
          .required(),

        hasInlineLabels: individualTextConfigs.hasInlineLabels.required(),
        inlineLabels: individualTextConfigs.inlineLabels.required(),
      })
      .required(),
  }).required(),
}).required()

export const updateProjectPayload = Joi.object({
  name: projectSchema.name,

  projectType: projectSchema.projectType,

  requirement: projectSchema.requirement,

  description: projectSchema.description,

  maximumOfAnnotators: projectSchema.maximumOfAnnotators,

  annotationConfig: Joi.object({
    hasLabelSets: annotationConfig.hasLabelSets.required(),
    labelSets: Joi.array()
      .items({
        isMultiSelected: annotationConfig.labelSets.isMultiSelected.required(),
        labels: annotationConfig.labelSets.labels.required(),
      })
      .required(),

    hasGeneratedTexts: annotationConfig.hasGeneratedTexts.required(),

    individualTextConfigs: Joi.array()
      .items({
        hasLabelSets: individualTextConfigs.hasLabelSets.required(),
        labelSets: Joi.array()
          .items({
            isMultiSelected: individualTextConfigs.labelSets.isMultiSelected.required(),
            labels: individualTextConfigs.labelSets.labels.required(),
          })
          .required(),

        hasInlineLabels: individualTextConfigs.hasInlineLabels.required(),
        inlineLabels: individualTextConfigs.inlineLabels.required(),
      })
      .required(),
  }).required(),
})