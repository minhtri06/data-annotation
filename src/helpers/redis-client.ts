import { createClient } from 'redis'

import ENV_CONFIG from '../configs/env.config'

export const redisClient = createClient({ url: ENV_CONFIG.REDIS_URL })

export const connectRedis = async () => {
  await redisClient.connect()
  console.log('🍃 Connect redis successfully')
}
