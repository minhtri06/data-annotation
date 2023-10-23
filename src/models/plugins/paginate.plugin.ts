import { FilterQuery, Model, Schema } from 'mongoose'

import ENV_CONFIG from '@src/configs/env.config'
import { PaginateResult, QueryOptions } from '@src/types'

export type Paginate<T> = (
  filter?: FilterQuery<T>,
  queryOptions?: Readonly<QueryOptions<T>>,
) => Promise<PaginateResult<InstanceType<Model<T>>>>

export const paginatePlugin = (schema: Schema) => {
  schema.statics.paginate = async function <T>(
    this: Model<T>,
    filter: FilterQuery<T> = {},
    {
      sort,
      page = 1,
      limit = ENV_CONFIG.DEFAULT_PAGE_LIMIT,
      skip = 0,
      select,
      populate,
      lean,
      checkPaginate,
    }: Readonly<QueryOptions<T>> = {},
  ): Promise<PaginateResult<InstanceType<Model<T>>>> {
    const query = this.find(filter)

    if (sort) {
      void query.sort(sort)
    }
    if (select) {
      void query.select(select)
    }
    if (populate) {
      void query.populate(populate)
    }
    if (lean) {
      void query.lean()
    }

    skip = skip + (page - 1) * limit

    void query.skip(skip).limit(limit)

    if (checkPaginate) {
      const [data, totalRecords] = await Promise.all([
        query.exec(),
        this.countDocuments(filter).exec(),
      ])
      return {
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        data,
      }
    }
    const data = await query.exec()
    return { data }
  }
}
