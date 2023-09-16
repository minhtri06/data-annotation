/* eslint-disable @typescript-eslint/no-floating-promises */
import createError from 'http-errors'
import { FilterQuery, Model } from 'mongoose'
import { DocumentId, QueryOptions } from '../../types'
import { injectable } from 'inversify'
import ENV_CONFIG from '../../configs/env.config'

export interface IModelService<T, M extends Model<T>> {
  getOne(filter: FilterQuery<T>): Promise<InstanceType<M> | null>

  getOneById(id: DocumentId): Promise<InstanceType<M> | null>

  getOneOrError(filter: FilterQuery<T>): Promise<InstanceType<M>>

  getOneByIdOrError(id: DocumentId): Promise<InstanceType<M>>

  paginate(
    filter: FilterQuery<T>,
    options: QueryOptions,
  ): Promise<{ data: InstanceType<M>[]; totalPage?: number }>
}

@injectable()
export abstract class ModelService<T, M extends Model<T>> implements IModelService<T, M> {
  constructor(protected Model: M) {}

  async getOne(filter: FilterQuery<T>): Promise<InstanceType<M> | null> {
    return await this.Model.findOne(filter)
  }

  async getOneById(id: DocumentId): Promise<InstanceType<M> | null> {
    return await this.getOne({ _id: id })
  }

  async getOneOrError(filter: FilterQuery<T>): Promise<InstanceType<M>> {
    const document = await this.getOne(filter)
    if (!document) {
      throw new createError.NotFound(`${this.Model.name.toLowerCase()} not found`)
    }
    return document
  }

  async getOneByIdOrError(id: DocumentId): Promise<InstanceType<M>> {
    return await this.getOneOrError({ _id: id })
  }

  async paginate(
    filter: FilterQuery<T>,
    { sort, page, limit, select, populate, lean, checkPaginate }: QueryOptions = {},
  ): Promise<{ data: InstanceType<M>[]; totalPages?: number }> {
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
        data: data as InstanceType<M>[],
      }
    }
    const data = (await query.exec()) as InstanceType<M>[]
    return { data }
  }
}
