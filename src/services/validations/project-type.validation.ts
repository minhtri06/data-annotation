import Joi from 'joi'

export const projectTypeSchema = {
  name: Joi.string().label('Name'),
}

export const createProjectTypePayload = Joi.object({
  name: projectTypeSchema.name.required(),
}).required()

export const updateProjectTypePayload = Joi.object({
  name: projectTypeSchema.name,
}).required()
