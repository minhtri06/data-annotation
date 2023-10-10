import { FilterQuery, Model as MongooseModel, Query } from 'mongoose'
import { injectable } from 'inversify'

import { DocumentId, PaginateResult, QueryOptions } from '@src/types'
import ENV_CONFIG from '@src/configs/env.config'
import { ApiError } from '@src/utils'
import { StatusCodes } from 'http-status-codes'
import { IModelService } from '../interfaces'

@injectable()
export abstract class ModelService<
  SchemaType,
  ModelType extends MongooseModel<SchemaType>,
> implements IModelService<SchemaType, ModelType>
{
  protected abstract Model: ModelType

  getOne(
    filter: FilterQuery<SchemaType>,
  ): Query<InstanceType<ModelType> | null, InstanceType<ModelType>> {
    return this.Model.findOne(filter)
  }

  getOneById(
    id: DocumentId,
  ): Query<InstanceType<ModelType> | null, InstanceType<ModelType>> {
    return this.Model.findById(id)
  }

  getOneOrFail(
    filter: FilterQuery<SchemaType>,
    error: Error = new ApiError(StatusCodes.NOT_FOUND, `${this.Model.name} not found`),
  ): Query<InstanceType<ModelType>, InstanceType<ModelType>> {
    return this.getOne(filter).orFail(error)
  }

  getOneByIdOrFail(
    id: DocumentId,
    error = new ApiError(StatusCodes.NOT_FOUND, `${this.Model.name} not found`),
  ): Query<InstanceType<ModelType>, InstanceType<ModelType>> {
    return this.getOneById(id).orFail(error)
  }

  getMany(
    filter: FilterQuery<SchemaType> = {},
  ): Query<InstanceType<ModelType>[], InstanceType<ModelType>> {
    return this.Model.find(filter)
  }

  countDocuments(
    filter: FilterQuery<SchemaType> = {},
  ): Query<number, InstanceType<ModelType>> {
    return this.Model.countDocuments(filter) as Query<number, InstanceType<ModelType>>
  }

  async paginate(
    filter: FilterQuery<SchemaType> = {},
    {
      sort,
      page,
      limit,
      select,
      populate,
      lean,
      checkPaginate,
    }: Readonly<QueryOptions<SchemaType>> = {},
  ): Promise<PaginateResult<InstanceType<ModelType>>> {
    const query = this.Model.find(filter)

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

    page = page || 1
    limit = limit || ENV_CONFIG.DEFAULT_PAGE_LIMIT
    const skip = (page - 1) * limit

    void query.skip(skip).limit(limit)

    if (checkPaginate) {
      const [data, totalRecords] = await Promise.all([
        query.exec(),
        this.Model.countDocuments(filter).exec(),
      ])
      return {
        totalPages: Math.ceil(totalRecords / limit),
        data: data as InstanceType<ModelType>[],
      }
    }
    const data = (await query.exec()) as InstanceType<ModelType>[]
    return { data }
  }
}
