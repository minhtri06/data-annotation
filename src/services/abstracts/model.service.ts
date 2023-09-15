import createError from 'http-errors'
import { FilterQuery, Model } from 'mongoose'
import { documentId } from '../../types'
import { injectable } from 'inversify'

export interface IModelService<T, M extends Model<T>> {
  getOne(filter: FilterQuery<T>): Promise<InstanceType<M> | null>

  getOneById(id: documentId): Promise<InstanceType<M> | null>

  getOneOrError(filter: FilterQuery<T>): Promise<InstanceType<M>>

  getOneByIdOrError(id: documentId): Promise<InstanceType<M>>
}

@injectable()
export abstract class ModelService<T, M extends Model<T>> implements IModelService<T, M> {
  constructor(protected Model: M) {}

  async getOne(filter: FilterQuery<T>): Promise<InstanceType<M> | null> {
    return await this.Model.findOne(filter)
  }

  async getOneById(id: documentId): Promise<InstanceType<M> | null> {
    return await this.getOne({ _id: id })
  }

  async getOneOrError(filter: FilterQuery<T>): Promise<InstanceType<M>> {
    const document = await this.getOne(filter)
    if (!document) {
      throw new createError.NotFound(`${this.Model.name.toLowerCase()} not found`)
    }
    return document
  }

  async getOneByIdOrError(id: documentId): Promise<InstanceType<M>> {
    return await this.getOneOrError({ _id: id })
  }
}
