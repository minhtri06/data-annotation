import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { CreateProject } from '../request-schemas'

export const createProject: CustomSchemaMap<CreateProject> = {
  body: {
    name: Joi.string().required(),
    projectType: Joi.string().required(),
    requirement: Joi.string().required(),
    description: Joi.string(),
    maximumOfAnnotators: Joi.number().integer(),
    annotationConfig: Joi.object({
      hasLabelSets: Joi.boolean().required(),
      labelSets: Joi.array().items({
        isMultiSelected: Joi.boolean().required(),
        labels: Joi.array().items(Joi.string()),
      }),

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
