import { connectMongoDb } from '@src/helpers'
import mongoose from 'mongoose'

export const setupTestDb = () => {
  beforeAll(async () => {
    // connect db
    await connectMongoDb()
  })

  beforeEach(async () => {
    // reset db data
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany(),
      ),
    )
  })

  afterAll(async () => {
    // disconnect db
    await mongoose.disconnect()
  })
}
