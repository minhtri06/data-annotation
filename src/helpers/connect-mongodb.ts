import mongoose from 'mongoose'

import envConfig from '../configs/env.config'

export const connectMongoDb = async () => {
  await mongoose.connect(envConfig.MONGODB_URL)
}
