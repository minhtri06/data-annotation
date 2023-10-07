import { projectTypeValidation } from '@src/services/validations'
import { CustomSchemaMap } from '@src/types'
import { CreateProjectType } from '../request-schemas'

export const createProjectType: CustomSchemaMap<CreateProjectType> = {
  body: {
    name: projectTypeValidation.projectTypeSchema.name.required(),
  },
}
