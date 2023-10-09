import Joi from 'joi'

import { customValidation } from '@src/services/validations'
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
    projectTypeId: customValidation.stringIdType.required(),
  },
  body: {
    name: Joi.string(),
  },
}

export const deleteProjectTypeById: CustomSchemaMap<DeleteProjectTypeById> = {
  params: {
    projectTypeId: customValidation.stringIdType.required(),
  },
}
