import createError from 'http-errors'
import { FilterQuery, Model, ObjectId, Schema } from 'mongoose'
import { document } from '../../types'

export interface IModelService<T> {
  getOne(filter: FilterQuery<T>): Promise<document<T> | null>

  getOneById(id: string | ObjectId): Promise<document<T> | null>

  getOneOrError(filter: FilterQuery<T>): Promise<document<T>>

  getOneByIdOrError(id: string | ObjectId): Promise<document<T>>
}

export abstract class ModelService<T> implements IModelService<T> {
  constructor(protected Model: Model<T>) {}

  async getOne(filter: FilterQuery<T>): Promise<document<T> | null> {
    return await this.Model.findOne(filter)
  }

  async getOneById(id: string | Schema.Types.ObjectId): Promise<document<T> | null> {
    return await this.getOne({ _id: id })
  }

  async getOneOrError(filter: FilterQuery<T>): Promise<document<T>> {
    const document = await this.getOne(filter)
    if (!document) {
      throw new createError.NotFound(`${this.Model.name.toLowerCase()} not found`)
    }
    return document
  }

  async getOneByIdOrError(id: string | ObjectId): Promise<document<T>> {
    return await this.getOneOrError({ _id: id })
  }
}
