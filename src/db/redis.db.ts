import { createClient } from 'redis'

import ENV_CONFIG from '@src/configs/env.config'

export const redisClient = createClient({ url: ENV_CONFIG.REDIS_URL })
