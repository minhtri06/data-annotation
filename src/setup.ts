import 'reflect-metadata'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { InversifyExpressServer } from 'inversify-express-utils'
import rateLimit from 'express-rate-limit'
import RateLimitRedisStore from 'rate-limit-redis'

import ENV_CONFIG from './configs/env.config'
import { IGeneralMiddleware } from './middlewares'
import container from './configs/inversify.config'
import { TYPES } from './configs/constants'
import { connectMongoDb, connectRedis, redisClient } from './helpers'

const setup = async () => {
  // connect databases
  await connectMongoDb()
  await connectRedis()

  const server = new InversifyExpressServer(container, null, { rootPath: '/api/v1' })

  // setup middlewares
  server.setConfig((app) => {
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(compression())
    app.use(
      cors({
        origin: ENV_CONFIG.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      }),
    )
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: ENV_CONFIG.RATE_LIMIT_PER_15_MINUTES,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many request' },
        store: new RateLimitRedisStore({
          sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        }),
      }),
    )
  })

  // handle error
  server.setErrorConfig((app) => {
    const generalMiddleware = container.get<IGeneralMiddleware>(TYPES.GENERAL_MIDDLEWARE)
    app.use(generalMiddleware.handleNotFound)
    app.use(generalMiddleware.handleException)
  })

  return server.build()
}

export default setup
