import { ValidationException } from '@src/services/exceptions/validation.exception'
import Joi from 'joi'
import mongoose from 'mongoose'

export const validate = <T>(value: T, validationSchema: Joi.Schema<T>) => {
  const { error } = validationSchema.validate(value, {
    errors: { wrap: { label: "'" }, label: 'path' },
  })
  if (error) {
    throw new ValidationException(error.message, {
      details: error.details.map((detail) => ({
        message: detail.message,
        path: detail.context?.label as string,
      })),
    })
  }
}

export const stringId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/)

export const objectId = Joi.object().instance(mongoose.Types.ObjectId)

export const querySchema = {
  limit: Joi.number().integer().min(1).max(50),

  page: Joi.number().integer().min(1),

  checkPaginate: Joi.boolean(),

  sort: (...allowedFields: string[]) =>
    Joi.string().custom((sort: string, helpers) => {
      // 'sort' can be a space delimited list of path names.
      // e.g. "-price name -createAt"
      for (const fieldOrder of sort.split(' ')) {
        const field = fieldOrder[0] === '-' ? fieldOrder.slice(1) : fieldOrder
        if (!allowedFields.includes(field)) {
          return helpers.error('any.invalid')
        }
      }
      return sort
    }),
}
