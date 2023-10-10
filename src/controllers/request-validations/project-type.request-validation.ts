import Joi from 'joi'

import { CustomSchemaMap } from '@src/types'
import {
  CreateProjectType,
  DeleteProjectTypeById,
  UpdateProjectTypeById,
} from '../request-schemas'

export const createProjectType: CustomSchemaMap<CreateProjectType> = {
  body: {
    name: Joi.string().required(),
  },
}

export const updateProjectTypeById: CustomSchemaMap<UpdateProjectTypeById> = {
  params: {
    projectTypeId: Joi.string().required(),
  },
  body: {
    name: Joi.string(),
  },
}

export const deleteProjectTypeById: CustomSchemaMap<DeleteProjectTypeById> = {
  params: {
    projectTypeId: Joi.string().required(),
  },
}
