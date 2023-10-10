import { FilterQuery, Model as MongooseModel, Query } from 'mongoose'

import { DocumentId, QueryOptions } from '@src/types'

export interface IModelService<SchemaType, ModelType extends MongooseModel<SchemaType>> {
  getOne(
    filter: FilterQuery<SchemaType>,
  ): Query<InstanceType<ModelType> | null, InstanceType<ModelType>>

  getOneById(
    id: DocumentId,
  ): Query<InstanceType<ModelType> | null, InstanceType<ModelType>>

  getOneOrFail(
    filter: FilterQuery<SchemaType>,
  ): Query<InstanceType<ModelType>, InstanceType<ModelType>>

  getOneByIdOrFail(
    id: DocumentId,
  ): Query<InstanceType<ModelType>, InstanceType<ModelType>>

  getMany(
    filter?: FilterQuery<SchemaType>,
  ): Query<InstanceType<ModelType>[], InstanceType<ModelType>>

  countDocuments(filter?: FilterQuery<SchemaType>): Query<number, InstanceType<ModelType>>

  paginate(
    filter?: FilterQuery<SchemaType>,
    options?: Readonly<QueryOptions<SchemaType>>,
  ): Promise<{ data: InstanceType<ModelType>[]; totalPage?: number }>
}
