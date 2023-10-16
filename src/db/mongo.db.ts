import mongoose from 'mongoose'

import ENV_CONFIG from '@src/configs/env.config'

export const connectMongoDb = async () => {
  await mongoose.connect(ENV_CONFIG.MONGODB_URL)
}
