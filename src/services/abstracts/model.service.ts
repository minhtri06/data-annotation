import createError from 'http-errors'
import { FilterQuery, Model as MongooseModel } from 'mongoose'
import { document, documentId } from '../../types'
import { injectable } from 'inversify'

export interface IModelService<T> {
  getOne(filter: FilterQuery<T>): Promise<document<T> | null>

  getOneById(id: documentId): Promise<document<T> | null>

  getOneOrError(filter: FilterQuery<T>): Promise<document<T>>

  getOneByIdOrError(id: documentId): Promise<document<T>>
}

@injectable()
export abstract class ModelService<T> implements IModelService<T> {
  constructor(protected Model: MongooseModel<T>) {}

  async getOne(filter: FilterQuery<T>): Promise<document<T> | null> {
    return await this.Model.findOne(filter)
  }

  async getOneById(id: documentId): Promise<document<T> | null> {
    return await this.getOne({ _id: id })
  }

  async getOneOrError(filter: FilterQuery<T>): Promise<document<T>> {
    const document = await this.getOne(filter)
    if (!document) {
      throw new createError.NotFound(`${this.Model.name.toLowerCase()} not found`)
    }
    return document
  }

  async getOneByIdOrError(id: documentId): Promise<document<T>> {
    return await this.getOneOrError({ _id: id })
  }
}
