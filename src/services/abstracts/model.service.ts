/* eslint-disable @typescript-eslint/no-floating-promises */
import createError from 'http-errors'
import { FilterQuery, Model as MongooseModel } from 'mongoose'
import { injectable } from 'inversify'

import { DocumentId, QueryOptions } from '../../types'
import ENV_CONFIG from '../../configs/env.config'

export interface IModelService<SchemaType, ModelType extends MongooseModel<SchemaType>> {
  getOne(filter: FilterQuery<SchemaType>): Promise<InstanceType<ModelType> | null>

  getOneById(id: DocumentId): Promise<InstanceType<ModelType> | null>

  getOneOrError(filter: FilterQuery<SchemaType>): Promise<InstanceType<ModelType>>

  getOneByIdOrError(id: DocumentId): Promise<InstanceType<ModelType>>

  paginate(
    filter: FilterQuery<SchemaType>,
    options: QueryOptions,
  ): Promise<{ data: InstanceType<ModelType>[]; totalPage?: number }>
}

@injectable()
export abstract class ModelService<
  SchemaType,
  ModelType extends MongooseModel<SchemaType>,
> implements IModelService<SchemaType, ModelType>
{
  protected abstract Model: ModelType

  async getOne(filter: FilterQuery<SchemaType>): Promise<InstanceType<ModelType> | null> {
    return await this.Model.findOne(filter)
  }

  async getOneById(id: DocumentId): Promise<InstanceType<ModelType> | null> {
    return await this.getOne({ _id: id })
  }

  async getOneOrError(filter: FilterQuery<SchemaType>): Promise<InstanceType<ModelType>> {
    const document = await this.getOne(filter)
    if (!document) {
      throw new createError.NotFound(`${this.Model.name.toLowerCase()} not found`)
    }
    return document
  }

  async getOneByIdOrError(id: DocumentId): Promise<InstanceType<ModelType>> {
    return await this.getOneOrError({ _id: id })
  }

  async paginate(
    filter: FilterQuery<SchemaType>,
    { sort, page, limit, select, populate, lean, checkPaginate }: QueryOptions = {},
  ): Promise<{ data: InstanceType<ModelType>[]; totalPages?: number }> {
    const query = this.Model.find(filter)

    if (sort) {
      query.sort(sort)
    }
    if (select) {
      query.select(select)
    }
    if (populate) {
      query.populate(populate)
    }
    if (lean) {
      query.lean()
    }

    page = page || 1
    limit = limit || ENV_CONFIG.DEFAULT_PAGE_LIMIT
    const skip = (page - 1) * limit

    query.skip(skip).limit(limit)

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
