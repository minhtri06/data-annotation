import mongoose from 'mongoose'

import { connectMongoDb, redisClient } from '@src/db'

export const setupTestDb = () => {
  beforeAll(async () => {
    // connect db
    await connectMongoDb()
    await redisClient.connect()
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
    await redisClient.disconnect()
  })
}
