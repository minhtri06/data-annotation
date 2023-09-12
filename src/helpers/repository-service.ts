import { FilterQuery, Model, ObjectId } from 'mongoose'

// service that based on a model and have is responsible to interact with model
export abstract class RepositoryService<T> {
  constructor(readonly model: Model<T>) {
    this.model = model
  }

  findOne = (filter: FilterQuery<T>) => {
    return this.model.findOne(filter)
  }

  findById = (id: string | ObjectId) => {
    return this.findOne({ _id: id })
  }
}
