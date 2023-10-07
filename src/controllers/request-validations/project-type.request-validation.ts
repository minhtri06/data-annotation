import { customValidation, projectTypeValidation } from '@src/services/validations'
import { CustomSchemaMap } from '@src/types'
import {
  CreateProjectType,
  DeleteProjectTypeById,
  UpdateProjectTypeById,
} from '../request-schemas'

export const createProjectType: CustomSchemaMap<CreateProjectType> = {
  body: {
    name: projectTypeValidation.projectTypeSchema.name.required(),
  },
}

export const updateProjectTypeById: CustomSchemaMap<UpdateProjectTypeById> = {
  params: {
    projectTypeId: customValidation.stringIdType.required(),
  },
  body: {
    name: projectTypeValidation.projectTypeSchema.name,
  },
}

export const deleteProjectTypeById: CustomSchemaMap<DeleteProjectTypeById> = {
  params: {
    projectTypeId: customValidation.stringIdType.required(),
  },
}
