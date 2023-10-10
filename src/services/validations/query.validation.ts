import Joi from 'joi'

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
