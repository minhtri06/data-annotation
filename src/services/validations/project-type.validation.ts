import Joi from 'joi'

import { stringId } from '@src/helpers/validation.helper'

// schema
export const projectTypeSchema = {
  name: Joi.string(),
}

// validations
export const getProjectTypeById = {
  projectTypeId: stringId.required(),
}

export const createProjectType = {
  payload: Joi.object({
    name: projectTypeSchema.name.required(),
  }).required(),
}

export const updateProjectType = {
  payload: Joi.object({
    name: projectTypeSchema.name,
  }).required(),
}
