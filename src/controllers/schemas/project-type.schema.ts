import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import { stringId } from './custom.schema'

export type CreateProjectType = {
  body: {
    name: string
  }
}
export const createProjectType: CustomSchemaMap<CreateProjectType> = {
  body: {
    name: Joi.string().required(),
  },
}

export type UpdateProjectTypeById = {
  params: {
    projectTypeId: string
  }
  body: {
    name?: string
  }
}
export const updateProjectTypeById: CustomSchemaMap<UpdateProjectTypeById> = {
  params: {
    projectTypeId: stringId.required(),
  },
  body: {
    name: Joi.string(),
  },
}

export type DeleteProjectTypeById = {
  params: {
    projectTypeId: string
  }
}
export const deleteProjectTypeById: CustomSchemaMap<DeleteProjectTypeById> = {
  params: {
    projectTypeId: stringId.required(),
  },
}
