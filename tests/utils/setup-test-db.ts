import { connectMongoDb } from '@src/helpers'
import mongoose from 'mongoose'

export const setupTestDb = () => {
  beforeAll(async () => {
    await connectMongoDb()
  })

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany(),
      ),
    )
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })
}
