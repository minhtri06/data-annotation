import { createClient } from 'redis'

import envConfig from '../configs/env.config'

export const redisClient = createClient({ url: envConfig.REDIS_URL })
