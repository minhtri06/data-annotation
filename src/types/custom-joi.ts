import Joi from 'joi'

export type CustomSchemaMap<TSchema> = {
  [key in keyof TSchema]: Joi.ObjectPropertiesSchema<TSchema[key]>
}
