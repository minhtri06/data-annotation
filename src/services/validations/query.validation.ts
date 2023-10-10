import { SortOption } from '@src/types'
import Joi from 'joi'

export const querySchema = {
  limit: Joi.number().integer().min(1).max(50),

  page: Joi.number().integer().min(1),

  checkPaginate: Joi.boolean(),

  sort: (...fields: string[]) =>
    Joi.string().custom((value: string, helpers) => {
      // value can be for example "-price,name,-createAt"
      const sortObj: SortOption = {}
      for (const sort of value.split(',')) {
        const [field, order]: [string, 1 | -1] =
          sort[0] === '-' ? [sort.slice(1), -1] : [sort, 1]

        if (!fields.includes(field)) {
          return helpers.error('any.invalid')
        }

        sortObj[field] = order
      }
      return sortObj
    }),
}
